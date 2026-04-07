// src/app/api/public/lead-capture/route.ts
// Public API for capturing leads from free tools

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Allowed source values from leads table constraint
const ALLOWED_SOURCES = ['organic', 'linkedin', 'referral', 'direct', 'conference', 'outbound', 'partner', 'other']

function mapSourceToAllowed(source: string): string {
  // If already allowed, return as is
  if (ALLOWED_SOURCES.includes(source)) {
    return source
  }
  
  // Map our custom sources to allowed values
  if (source === 'comparison_tool' || source === 'state_dashboard' || source === 'state_requirements') {
    return 'direct'  // Using 'direct' as it's a good fit for direct tool usage
  }
  
  // Map website traffic
  if (source === 'website' || source === 'organic_search') {
    return 'organic'
  }
  
  return 'other'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { email, name, source, interested_state, company_name } = body
    
    console.log('📝 Lead capture request:', { email, name, source, interested_state, company_name })
    
    if (!email) {
      console.log('❌ No email provided')
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Check if lead already exists
    const { data: existingLead, error: findError } = await supabase
      .from('leads')
      .select('id, contact_email, stage, notes')
      .eq('contact_email', email)
      .maybeSingle()
    
    console.log('🔍 Existing lead check:', { existingLead: !!existingLead, findError })
    
    // Map source to allowed value
    const mappedSource = mapSourceToAllowed(source || 'other')
    console.log(`📝 Mapping source "${source}" → "${mappedSource}"`)
    
    if (existingLead) {
      // Update existing lead
      const newNotes = existingLead.notes 
        ? `${existingLead.notes}\n\n[${new Date().toISOString()}] New interaction from: ${source}, interested in: ${interested_state || 'N/A'}`
        : `[${new Date().toISOString()}] New interaction from: ${source}, interested in: ${interested_state || 'N/A'}`
      
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          source: mappedSource,
          notes: newNotes,
          last_activity_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)
      
      if (updateError) {
        console.error('❌ Error updating lead:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      console.log('✅ Lead updated successfully')
      
      // Log activity
      await supabase.from('lead_activities').insert({
        lead_id: existingLead.id,
        type: 'interaction',
        description: `User interacted with ${source} tool${interested_state ? `, interested in ${interested_state}` : ''}`,
        metadata: { original_source: source, interested_state, timestamp: new Date().toISOString() },
        created_at: new Date().toISOString()
      })
      
    } else {
      // Create new lead
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert({
          company_name: company_name || 'Not provided',
          contact_name: name || 'Not provided',
          contact_email: email,
          source: mappedSource,
          stage: 'new',
          score: 30,
          probability: 10,
          notes: `[${new Date().toISOString()}] Lead captured from ${source} tool. Interested in: ${interested_state || 'Not specified'}`,
          last_activity_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ Error creating lead:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      
      console.log('✅ New lead created:', newLead.id)
      
      // Log initial activity
      await supabase.from('lead_activities').insert({
        lead_id: newLead.id,
        type: 'lead_capture',
        description: `Lead captured from ${source} tool`,
        metadata: { original_source: source, interested_state, timestamp: new Date().toISOString() },
        created_at: new Date().toISOString()
      })
    }
    
    // Also track in audit log
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'lead_capture',
      record_id: crypto.randomUUID(),
      action: 'CREATE',
      new_data: { email, source: mappedSource, original_source: source, interested_state },
      changed_at: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('❌ Lead capture error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
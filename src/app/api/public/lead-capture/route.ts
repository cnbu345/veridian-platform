// src/app/api/public/lead-capture/route.ts
// Public API for capturing leads from free tools

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { email, source, interested_state, company_name, name } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('enterprise_leads')
      .select('id')
      .eq('contact_email', email)
      .single()
    
    if (existingLead) {
      // Update existing lead with new interest
      await supabase
        .from('enterprise_leads')
        .update({
          current_compliance_needs: supabase.sql`array_append(current_compliance_needs, ${interested_state})`,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)
    } else {
      // Create new lead
      await supabase
        .from('enterprise_leads')
        .insert({
          company_name: company_name || 'Not provided',
          contact_name: name || 'Not provided',
          contact_email: email,
          current_compliance_needs: interested_state ? [interested_state] : [],
          source: source || 'state_dashboard',
          status: 'new'
        })
    }
    
    // Also track in audit log
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'lead_capture',
      record_id: crypto.randomUUID(),
      action: 'CREATE',
      new_data: { email, source, interested_state },
      changed_at: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error capturing lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
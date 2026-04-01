// src/app/api/admin/regulatory/updates/[id]/route.ts
// POST - Approve/Reject updates

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params
    
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reason, proposed_value } = body

    // Get the original update
    const { data: update, error: fetchError } = await supabase
      .from('regulatory_updates')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !update) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 })
    }

    let newStatus = ''
    let reviewNotes = reason

    if (action === 'approve') {
      newStatus = 'approved'
      
      // If it's a content update, update the regulatory_facts table
      if (update.category === 'license' || update.category === 'fee' || update.category === 'bond') {
        const claim = `${update.state_code}: ${update.proposed_value || update.title}`
        
        // Check if fact exists
        const { data: existingFact } = await supabase
          .from('regulatory_facts')
          .select('id')
          .eq('state_code', update.state_code)
          .eq('category', update.category)
          .maybeSingle()

        if (existingFact) {
          await supabase
            .from('regulatory_facts')
            .update({
              claim: claim,
              source_name: update.source_name,
              source_url: update.source_url,
              source_date: update.effective_date,
              review_required: false,
              verification_status: 'verified',
              last_reviewed_at: new Date().toISOString(),
              verified_by: user.id
            })
            .eq('id', existingFact.id)
        } else {
          await supabase
            .from('regulatory_facts')
            .insert({
              state_code: update.state_code,
              claim: claim,
              category: update.category,
              source_name: update.source_name,
              source_url: update.source_url,
              source_date: update.effective_date,
              verification_status: 'verified',
              review_required: false,
              last_reviewed_at: new Date().toISOString(),
              verified_by: user.id
            })
        }
      }
    } else if (action === 'reject') {
      newStatus = 'rejected'
    }

    // Update the regulatory update record
    const { data, error } = await supabase
      .from('regulatory_updates')
      .update({
        status: newStatus,
        review_notes: reviewNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the action
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'regulatory_updates',
      record_id: id,
      action: action === 'approve' ? 'APPROVE' : 'REJECT',
      old_data: update,
      new_data: data,
      changed_by: user.id,
      changed_by_name: user.email,
      reason: reviewNotes,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
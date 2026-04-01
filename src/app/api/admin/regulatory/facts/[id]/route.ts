// src/app/api/admin/regulatory/facts/[id]/route.ts
// PUT - Update a regulatory fact

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params
    
    // Use supabase server client which handles auth properly
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()

    // Get existing fact for audit log
    const { data: existing, error: fetchError } = await supabase
      .from('regulatory_facts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching existing fact:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 404 })
    }

    // Update the fact
    const { data, error } = await supabase
      .from('regulatory_facts')
      .update({
        claim: body.claim,
        source_name: body.source_name,
        source_url: body.source_url,
        source_date: body.source_date,
        notes: body.notes,
        verification_status: body.verification_status,
        confidence_score: body.confidence_score,
        numeric_value: body.numeric_value,
        numeric_unit: body.numeric_unit,
        review_required: body.verification_status === 'verified' ? false : true,
        last_reviewed_at: body.verification_status === 'verified' ? new Date().toISOString() : existing.last_reviewed_at,
        verified_by: body.verification_status === 'verified' ? user.id : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating fact:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the audit entry
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'regulatory_facts',
      record_id: id,
      action: 'UPDATE',
      old_data: existing,
      new_data: data,
      changed_by: user.id,
      changed_by_name: user.email,
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
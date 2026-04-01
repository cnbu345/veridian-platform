// src/app/api/admin/regulatory/bulk-verify/route.ts
// POST /api/admin/regulatory/bulk-verify - Verify multiple facts at once

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { factIds, verifiedBy, notes } = body

    if (!factIds || !Array.isArray(factIds) || factIds.length === 0) {
      return NextResponse.json({ error: 'No fact IDs provided' }, { status: 400 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', session.user.email)
      .single()

    const now = new Date().toISOString()
    let verified = 0
    let errors = 0

    for (const factId of factIds) {
      // Update the fact
      const { error: factError } = await supabase
        .from('regulatory_facts')
        .update({
          verification_status: 'verified',
          review_required: false,
          review_reason: null,
          last_reviewed_at: now,
          confidence_score: 1.0,
          verified_by: user?.id,
          verified_by_name: user?.email
        })
        .eq('id', factId)

      if (factError) {
        console.error(`Error verifying fact ${factId}:`, factError)
        errors++
        continue
      }

      // Update the review queue
      const { error: queueError } = await supabase
        .from('regulatory_review_queue')
        .update({
          status: 'approved',
          reviewer_notes: notes,
          resolved_at: now,
          resolved_by: user?.id
        })
        .eq('fact_id', factId)
        .eq('status', 'pending')

      if (queueError) {
        console.error(`Error updating queue for ${factId}:`, queueError)
      }

      // Log the action
      await supabase.from('regulatory_audit_log').insert({
        table_name: 'regulatory_facts',
        record_id: factId,
        action: 'BULK_VERIFY',
        new_data: { verified: true, verified_by: user?.email },
        changed_by: user?.id,
        changed_by_name: session.user.email,
        reason: notes,
        changed_at: now
      })

      verified++
    }

    return NextResponse.json({
      success: true,
      verified,
      errors,
      total: factIds.length
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
// src/app/api/admin/verification-dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get all state audit tracker info
    const { data: stateAudits } = await supabase
      .from('state_audit_tracker')
      .select('*')
      .order('state_code', { ascending: true })
    
    // Get licensing requirements that need review
    const { data: needsReview } = await supabase
      .from('licensing_requirements')
      .select('state_code, verification_status, review_priority, updated_at')
      .eq('verification_status', 'needs_review')
      .order('review_priority', { ascending: false })
    
    // Get counts for each table
    const [
      { count: techCount },
      { count: budgetCount },
      { count: marketCount },
      { count: talentCount },
      { count: riskCount },
      { count: nextStepsCount },
      { count: calendarCount }
    ] = await Promise.all([
      supabase.from('technology_vendors').select('*', { count: 'exact', head: true }),
      supabase.from('budget_templates').select('*', { count: 'exact', head: true }),
      supabase.from('market_metrics').select('*', { count: 'exact', head: true }),
      supabase.from('talent_metrics').select('*', { count: 'exact', head: true }),
      supabase.from('risk_factors').select('*', { count: 'exact', head: true }),
      supabase.from('next_steps_templates').select('*', { count: 'exact', head: true }),
      supabase.from('compliance_calendar_templates').select('*', { count: 'exact', head: true })
    ])
    
    return NextResponse.json({
      data: {
        state_audits: stateAudits || [],
        needs_review: needsReview || [],
        counts: {
          technology_vendors: techCount || 0,
          budget_templates: budgetCount || 0,
          market_metrics: marketCount || 0,
          talent_metrics: talentCount || 0,
          risk_factors: riskCount || 0,
          next_steps_templates: nextStepsCount || 0,
          compliance_calendar_templates: calendarCount || 0
        }
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { action, stateCode, notes } = await request.json()
    
    if (action === 'mark_reviewed' && stateCode) {
      // Update state audit tracker
      const { error } = await supabase
        .from('state_audit_tracker')
        .upsert({
          state_code: stateCode,
          last_reviewed: new Date().toISOString(),
          licensing_verified: true,
          fees_verified: true,
          bonding_verified: true,
          enforcement_verified: true,
          notes: notes || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'state_code' })
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      
      // Also update licensing_requirements verification status
      await supabase
        .from('licensing_requirements')
        .update({ 
          verification_status: 'verified',
          last_reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('state_code', stateCode)
      
      await supabase.from('regulatory_audit_log').insert({
        table_name: 'state_audit_tracker',
        record_id: stateCode,
        action: 'UPDATE',
        new_data: { last_reviewed: new Date().toISOString(), verification_status: 'verified' },
        changed_by: session.user.id,
        changed_by_email: session.user.email,
        reason: notes || `Marked ${stateCode} as reviewed`
      })
    }
    
    if (action === 'schedule_review' && stateCode) {
      // Set review_priority to high for this state
      await supabase
        .from('licensing_requirements')
        .update({ review_priority: 'high', verification_status: 'needs_review' })
        .eq('state_code', stateCode)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
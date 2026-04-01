// src/app/api/admin/regulatory/stats/route.ts
// GET /api/admin/regulatory/stats - Dashboard statistics

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (you can add role check here)
    // For now, we'll assume authenticated users can access

    // Get pending updates count
    const { count: pendingUpdates } = await supabase
      .from('regulatory_updates')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review')

    // Get pending reviews count (from review queue)
    const { count: pendingReviews } = await supabase
      .from('regulatory_review_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get legislation count
    const { count: totalLegislation } = await supabase
      .from('legislation_tracker')
      .select('*', { count: 'exact', head: true })

    const { count: enactedLegislation } = await supabase
      .from('legislation_tracker')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'enacted')

    // Get enforcement actions count
    const { count: totalEnforcement } = await supabase
      .from('enforcement_actions')
      .select('*', { count: 'exact', head: true })

    const { count: recentEnforcement } = await supabase
      .from('enforcement_actions')
      .select('*', { count: 'exact', head: true })
      .gte('action_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    // Get states with pending changes
    const { data: statesWithPending } = await supabase
      .from('regulatory_updates')
      .select('state_code')
      .eq('status', 'pending_review')
      .not('state_code', 'is', null)

    const uniqueStates = new Set(statesWithPending?.map(s => s.state_code) || [])

    // Get recent notes
    const { data: recentNotes } = await supabase
      .from('regulatory_notes')
      .select(`
        *,
        created_by_user:created_by(id, email, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get priority counts
    const { data: priorityCounts } = await supabase
      .from('regulatory_review_queue')
      .select('priority')
      .eq('status', 'pending')

    const priorityBreakdown = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
    priorityCounts?.forEach(p => {
      if (p.priority === 'critical') priorityBreakdown.critical++
      else if (p.priority === 'high') priorityBreakdown.high++
      else if (p.priority === 'medium') priorityBreakdown.medium++
      else if (p.priority === 'low') priorityBreakdown.low++
    })

    return NextResponse.json({
      stats: {
        pendingUpdates: pendingUpdates || 0,
        pendingReviews: pendingReviews || 0,
        totalLegislation: totalLegislation || 0,
        enactedLegislation: enactedLegislation || 0,
        totalEnforcement: totalEnforcement || 0,
        recentEnforcement: recentEnforcement || 0,
        statesWithChanges: uniqueStates.size
      },
      priorityBreakdown,
      recentNotes: recentNotes || []
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
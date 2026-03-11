// src/app/api/admin/customers/feedback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'
    const priority = searchParams.get('priority') || 'all'
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    let query = supabase
      .from('customer_feedback')
      .select(`
        *,
        users:user_id (
          email,
          company_name,
          full_name
        )
      `, { count: 'exact' })

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    if (type !== 'all') {
      query = query.eq('feedback_type', type)
    }
    if (priority !== 'all') {
      query = query.eq('priority', priority)
    }
    if (search) {
      query = query.or(`
        comment.ilike.%${search}%,
        users.company_name.ilike.%${search}%,
        users.email.ilike.%${search}%,
        category.ilike.%${search}%
      `)
    }

    // Get total count for pagination
    const { count } = await query

    // Get paginated results
    const { data: feedback, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Calculate metrics
    const metricsQuery = supabase
      .from('customer_feedback')
      .select('*')

    const { data: allFeedback } = await metricsQuery

    const metrics = {
      total: allFeedback?.length || 0,
      averageRating: 0,
      nps: 0,
      promoters: 0,
      detractors: 0,
      newCount: 0,
      criticalCount: 0,
      byType: {
        nps: 0,
        csat: 0,
        feature_request: 0,
        bug_report: 0,
        support: 0,
        general: 0
      },
      byStatus: {
        new: 0,
        reviewed: 0,
        in_progress: 0,
        actioned: 0,
        archived: 0
      }
    }

    if (allFeedback) {
      // Calculate averages and counts
      const ratings = allFeedback.filter(f => f.rating !== null).map(f => f.rating as number)
      if (ratings.length > 0) {
        metrics.averageRating = Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      }

      // NPS calculation (only for NPS feedback)
      const npsFeedback = allFeedback.filter(f => f.feedback_type === 'nps' && f.rating !== null)
      if (npsFeedback.length > 0) {
        metrics.promoters = npsFeedback.filter(f => f.rating && f.rating >= 9).length
        metrics.detractors = npsFeedback.filter(f => f.rating && f.rating <= 6).length
        metrics.nps = Math.round(((metrics.promoters - metrics.detractors) / npsFeedback.length) * 100)
      }

      // Count by type
      allFeedback.forEach(f => {
        if (f.feedback_type in metrics.byType) {
          metrics.byType[f.feedback_type as keyof typeof metrics.byType]++
        }
        if (f.status in metrics.byStatus) {
          metrics.byStatus[f.status as keyof typeof metrics.byStatus]++
        }
      })

      metrics.newCount = metrics.byStatus.new
      metrics.criticalCount = allFeedback.filter(f => f.priority === 'critical').length
    }

    return NextResponse.json({
      feedback: feedback || [],
      metrics,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Failed to fetch feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('customer_feedback')
      .insert({
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('Failed to create feedback:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}
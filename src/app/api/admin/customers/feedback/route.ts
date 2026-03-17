// src/app/api/admin/customers/feedback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'
    const priority = searchParams.get('priority') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    console.log('Fetching feedback with filters:', { status, type, priority, search, page, limit })

    // Build query
    let query = supabase
      .from('feedback_submissions')
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        ),
        users!feedback_submissions_user_id_fkey (
          id,
          email,
          full_name,
          company_name
        )
      `, { count: 'exact' })

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    if (type !== 'all') {
      if (type === 'nps' || type === 'csat' || type === 'feature_request' || type === 'support' || type === 'general') {
        query = query.eq('feedback_type.category', type)
      }
    }
    if (priority !== 'all') {
      query = query.eq('priority', priority)
    }
    if (search) {
      query = query.or(`
        comments.ilike.%${search}%,
        email_subject.ilike.%${search}%,
        email_content.ilike.%${search}%,
        users.company_name.ilike.%${search}%,
        users.full_name.ilike.%${search}%,
        users.email.ilike.%${search}%
      `)
    }

    // Get total count
    const { count, error: countError } = await query

    if (countError) {
      console.error('Error getting count:', countError)
      throw countError
    }

    // Get paginated results
    const { data: feedback, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching feedback:', error)
      throw error
    }

    console.log(`Found ${feedback?.length || 0} feedback items`)

    // Calculate metrics
    const { data: allFeedback } = await supabase
      .from('feedback_submissions')
      .select(`
        *,
        feedback_type:feedback_type_id (
          category
        )
      `)

    const metrics = {
      total: allFeedback?.length || 0,
      averageRating: calculateAverageRating(allFeedback || []),
      nps: calculateNPS(allFeedback || []),
      promoters: countPromoters(allFeedback || []),
      detractors: countDetractors(allFeedback || []),
      newCount: (allFeedback || []).filter(f => f.status === 'pending_review').length,
      criticalCount: (allFeedback || []).filter(f => f.priority === 'critical').length,
      byType: countByType(allFeedback || []),
      byStatus: countByStatus(allFeedback || [])
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
      { error: 'Failed to fetch feedback', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Helper functions (copy these from the previous message)
function calculateAverageRating(feedback: any[]): number {
  const ratings = feedback
    .filter(f => f.nps_score !== null || f.csat_score !== null)
    .map(f => f.nps_score || f.csat_score)
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((a, b) => a + b, 0)
  return Number((sum / ratings.length).toFixed(1))
}

function calculateNPS(feedback: any[]): number {
  const npsFeedback = feedback.filter(f => 
    f.feedback_type?.category === 'nps' && f.nps_score !== null
  )
  if (npsFeedback.length === 0) return 0
  const promoters = npsFeedback.filter(f => f.nps_score >= 9).length
  const detractors = npsFeedback.filter(f => f.nps_score <= 6).length
  return Math.round(((promoters - detractors) / npsFeedback.length) * 100)
}

function countPromoters(feedback: any[]): number {
  return feedback.filter(f => 
    f.feedback_type?.category === 'nps' && f.nps_score >= 9
  ).length
}

function countDetractors(feedback: any[]): number {
  return feedback.filter(f => 
    f.feedback_type?.category === 'nps' && f.nps_score <= 6
  ).length
}

function countByType(feedback: any[]): Record<string, number> {
  const counts: Record<string, number> = {}
  feedback.forEach(f => {
    const type = f.feedback_type?.category || 'unknown'
    counts[type] = (counts[type] || 0) + 1
  })
  return counts
}

function countByStatus(feedback: any[]): Record<string, number> {
  const counts: Record<string, number> = {}
  feedback.forEach(f => {
    counts[f.status] = (counts[f.status] || 0) + 1
  })
  return counts
}
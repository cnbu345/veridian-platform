// src/app/api/admin/reports/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Verify admin access
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('reports')
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

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (search) {
      query = query.or(`
        company_name.ilike.%${search}%,
        users.email.ilike.%${search}%,
        users.company_name.ilike.%${search}%
      `)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Get total count
    const { count } = await query

    // Get paginated results
    const { data: reports, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get statistics
    const { data: stats } = await supabase
      .from('reports')
      .select('status')

    const statistics = {
      total: stats?.length || 0,
      pending: stats?.filter(r => r.status === 'pending').length || 0,
      generating: stats?.filter(r => r.status === 'generating').length || 0,
      ready: stats?.filter(r => r.status === 'ready').length || 0,
      failed: stats?.filter(r => r.status === 'failed').length || 0,
      pages: Math.ceil((count || 0) / limit)
    }

    return NextResponse.json({
      reports: reports || [],
      statistics,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
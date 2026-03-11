// src/app/api/admin/support/tickets/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build query
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        users:user_id (
          email,
          company_name,
          full_name
        ),
        messages:support_messages (
          id,
          message,
          created_at,
          user_id,
          is_internal,
          users:user_id (
            full_name,
            email,
            is_admin
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: tickets, error } = await query

    if (error) {
      console.error('Error fetching tickets:', error)
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    // Calculate stats
    const stats = {
      open: tickets?.filter(t => t.status === 'open').length || 0,
      inProgress: tickets?.filter(t => t.status === 'in_progress').length || 0,
      resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
      closed: tickets?.filter(t => t.status === 'closed').length || 0,
      urgent: tickets?.filter(t => t.priority === 'urgent').length || 0
    }

    return NextResponse.json({ tickets, stats })

  } catch (error) {
    console.error('Error in admin support tickets API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
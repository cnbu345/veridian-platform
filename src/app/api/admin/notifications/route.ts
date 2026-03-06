import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/notifications - Get all notifications for admin
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeRead = searchParams.get('includeRead') === 'true'
    const type = searchParams.get('type')

    let query = supabase
      .from('notifications')
      .select(`
        *,
        users (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!includeRead) {
      query = query.eq('is_read', false)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching admin notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Get unread count
    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    if (countError) {
      console.error('Error counting notifications:', countError)
    }

    return NextResponse.json({ 
      notifications: notifications || [],
      unreadCount: count || 0
    })
  } catch (error) {
    console.error('Error in admin notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
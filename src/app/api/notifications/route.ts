// src/app/api/notifications/route.ts - Notification API Endpoints
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/notifications - Get user's notifications
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const includeRead = searchParams.get('includeRead') === 'true'
    const type = searchParams.get('type')

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
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
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Get unread count
    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (countError) {
      console.error('Error counting notifications:', countError)
    }

    return NextResponse.json({ 
      notifications: notifications || [],
      unreadCount: count || 0
    })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notifications/mark-read - Mark notifications as read
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAll } = body

    console.log('Marking notifications as read:', { notificationIds, markAll, userId: user.id })

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)

    if (markAll) {
      // Mark all unread notifications as read
      const { data, error } = await query
        .eq('is_read', false)
        .select()

      if (error) {
        console.error('Error marking all as read:', error)
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
      }

      console.log(`Marked ${data?.length || 0} notifications as read`)
      return NextResponse.json({ 
        success: true, 
        count: data?.length || 0,
        message: 'All notifications marked as read'
      })
    } 
    
    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      const { data, error } = await query
        .in('id', notificationIds)
        .select()

      if (error) {
        console.error('Error marking specific notifications as read:', error)
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
      }

      console.log(`Marked ${data?.length || 0} specific notifications as read`)
      return NextResponse.json({ 
        success: true, 
        count: data?.length || 0,
        message: 'Notifications marked as read'
      })
    }

    return NextResponse.json({ error: 'No notifications specified' }, { status: 400 })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/notifications - Clear notifications
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clearAll = searchParams.get('clearAll') === 'true'
    const olderThan = searchParams.get('olderThan') // e.g., "30d"

    let query = supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (!clearAll && olderThan) {
      const days = parseInt(olderThan.replace('d', ''))
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      query = query.lt('created_at', cutoffDate.toISOString())
      
      const { data, error } = await query.select()
      
      if (error) {
        console.error('Error clearing old notifications:', error)
        return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        count: data?.length || 0,
        message: `Cleared ${data?.length || 0} old notifications`
      })
    } 
    
    if (clearAll) {
      const { data, error } = await query.select()
      
      if (error) {
        console.error('Error clearing all notifications:', error)
        return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        count: data?.length || 0,
        message: 'All notifications cleared'
      })
    }

    return NextResponse.json({ error: 'Specify what to clear' }, { status: 400 })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
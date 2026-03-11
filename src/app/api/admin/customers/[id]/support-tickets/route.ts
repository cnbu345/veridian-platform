// src/app/api/admin/customers/[id]/support-tickets/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

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

    // Get tickets for this customer
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select(`
        id,
        ticket_number,
        subject,
        status,
        priority,
        category,
        created_at,
        updated_at,
        assigned_to
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching customer tickets:', error)
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
    console.error('Error in customer support tickets API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
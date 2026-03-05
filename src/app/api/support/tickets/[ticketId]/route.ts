// src/app/api/support/tickets/[ticketId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/support/tickets/[ticketId] - Update ticket
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    
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

    const body = await request.json()
    const { status, priority, assigned_to } = body

    const updates: any = {
      updated_at: new Date().toISOString()
    }
    
    if (status) updates.status = status
    if (priority) updates.priority = priority
    if (assigned_to) updates.assigned_to = assigned_to

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error('Error in ticket update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/support/tickets/[ticketId] - Get single ticket
export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    
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
    
    const isAdmin = userData?.is_admin || false

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        users:user_id (
          full_name,
          email,
          company_name,
          subscription_tier
        ),
        messages:support_messages (
          id,
          created_at,
          user_id,
          message,
          is_internal
        )
      `)
      .eq('id', ticketId)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // If not admin, filter out internal messages
    if (!isAdmin && ticket.messages) {
      ticket.messages = ticket.messages.filter((m: any) => !m.is_internal)
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error in ticket API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
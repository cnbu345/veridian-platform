// src/app/api/admin/support/tickets/[ticketId]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const supabase = await createClient()
    const { ticketId } = await params

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

    // Get ticket with messages
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        users:user_id (
          email,
          company_name,
          full_name,
          subscription_tier,
          created_at
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
      .eq('id', ticketId)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })

  } catch (error) {
    console.error('Error in admin support ticket API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const supabase = await createClient()
    const { ticketId } = await params
    const body = await request.json()

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

    // Update ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
        ...(body.status === 'resolved' && { resolved_at: new Date().toISOString(), resolved_by: user.id })
      })
      .eq('id', ticketId)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }

    // Create notification for customer if status changed
    if (body.status) {
      await supabase
        .from('notifications')
        .insert({
          user_id: ticket.user_id,
          type: 'ticket_updated',
          title: 'Ticket Status Updated',
          message: `Your ticket "${ticket.subject}" has been marked as ${body.status.replace('_', ' ')}`,
          data: { ticket_id: ticket.id, ticket_number: ticket.ticket_number },
          link: `/support/tickets/${ticket.id}`,
          priority: 'normal'
        })
    }

    return NextResponse.json({ ticket })

  } catch (error) {
    console.error('Error in admin support ticket API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
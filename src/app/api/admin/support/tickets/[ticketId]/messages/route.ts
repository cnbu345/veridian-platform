// src/app/api/admin/support/tickets/[ticketId]/messages/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const supabase = await createClient()
    const { ticketId } = await params
    const body = await request.json()
    const { message, is_internal = false } = body

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin, full_name')
      .eq('id', user.id)
      .single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get ticket details for notification
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('user_id, subject, ticket_number')
      .eq('id', ticketId)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Create message
    const { data: newMessage, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        message,
        is_internal
      })
      .select(`
        *,
        users:user_id (
          full_name,
          email,
          is_admin
        )
      `)
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update ticket's updated_at
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    // Notify customer if it's not an internal note
    if (!is_internal) {
      await supabase
        .from('notifications')
        .insert({
          user_id: ticket.user_id,
          type: 'ticket_reply',
          title: 'New Reply on Your Ticket',
          message: `Support has replied to ticket "${ticket.subject}"`,
          data: { 
            ticket_id: ticketId, 
            ticket_number: ticket.ticket_number,
            message_preview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
          },
          link: `/support/tickets/${ticketId}`,
          priority: 'normal'
        })
    }

    return NextResponse.json({ message: newMessage })

  } catch (error) {
    console.error('Error in support messages API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
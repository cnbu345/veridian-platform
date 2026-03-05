// src/app/api/support/tickets/[ticketId]/messages/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/support/tickets/[ticketId]/messages - Get ticket messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Await the params Promise
    const { ticketId } = await params
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.user_id !== user.id) {
      // Check if user is admin (admins can view any ticket)
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      
      if (!userData?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const { data: messages, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .eq('is_internal', false) // Don't show internal admin notes to regular users
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error in messages API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/support/tickets/[ticketId]/messages - Add message to ticket
export async function POST(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Await the params Promise
    const { ticketId } = await params
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('user_id, status')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check if user is authorized (owner or admin)
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    const isAdmin = userData?.is_admin || false
    
    if (ticket.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { message, is_internal } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        message,
        is_internal: is_internal || false
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update ticket status and updated_at
    const newStatus = isAdmin 
      ? (ticket.status === 'waiting_on_customer' ? 'in_progress' : ticket.status)
      : (ticket.status === 'waiting_on_customer' ? 'open' : ticket.status)
    
    await supabase
      .from('support_tickets')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)

    return NextResponse.json({ 
      success: true, 
      message: newMessage 
    })
  } catch (error) {
    console.error('Error in messages API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
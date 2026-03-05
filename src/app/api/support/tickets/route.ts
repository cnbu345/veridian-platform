// src/app/api/support/tickets/route.ts - API Endpoints for Support
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/support/tickets - List user's tickets
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
    
    const isAdmin = userData?.is_admin || false

    // Build query
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    // If not admin, only show user's own tickets
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data: tickets, error } = await query

    if (error) {
      console.error('Error fetching tickets:', error)
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error in support tickets API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/support/tickets - Create new ticket
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, category, message } = body

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        ticket_number: ticketNumber,
        subject,
        category,
        status: 'open',
        priority: 'normal'
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating ticket:', ticketError)
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
    }

    // Create first message
    const { error: messageError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        user_id: user.id,
        message
      })

    if (messageError) {
      console.error('Error creating message:', messageError)
      // Don't fail the whole request, but log it
    }

    return NextResponse.json({ 
      success: true, 
      ticket,
      message: 'Ticket created successfully'
    })
  } catch (error) {
    console.error('Error in support tickets API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
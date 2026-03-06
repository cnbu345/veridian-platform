// src/app/api/support/tickets/[ticketId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/support/tickets/[ticketId] - Update ticket status (reopen, resolve, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Get the ticket ID from the URL parameters
    const { ticketId } = await params
    
    console.log('PATCH request received for ticket:', ticketId)
    
    // Create Supabase client
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('User authenticated:', user.id)

    // Parse the request body
    const body = await request.json()
    const { status } = body
    
    console.log('Request body:', { status, ticketId })

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // First, get the ticket to verify ownership and get current details
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('user_id, status, subject, ticket_number')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      console.error('Ticket not found:', ticketError)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    console.log('Found ticket:', { 
      ticketId, 
      userId: ticket.user_id, 
      currentStatus: ticket.status,
      newStatus: status 
    })

    // Check if user is admin
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (userDataError) {
      console.error('Error fetching user data:', userDataError)
      return NextResponse.json({ error: 'Failed to verify user permissions' }, { status: 500 })
    }
    
    const isAdmin = userData?.is_admin || false
    console.log('User is admin:', isAdmin)

    // Verify user owns the ticket or is admin
    if (ticket.user_id !== user.id && !isAdmin) {
      console.error('User does not own this ticket and is not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    // If resolving, set resolved_at and resolved_by
    if (status === 'resolved' && ticket.status !== 'resolved') {
      updates.resolved_at = new Date().toISOString()
      updates.resolved_by = isAdmin ? 'admin' : 'customer'
    }

    // If reopening a resolved/closed ticket
    if (status === 'open' && (ticket.status === 'resolved' || ticket.status === 'closed')) {
      // CRITICAL: Set reopened_at to track when it was reopened
      updates.reopened_at = new Date().toISOString()
      updates.resolved_at = null
      updates.resolved_by = null
      
      console.log('🎫 TICKET REOPENED - setting reopened_at:', updates.reopened_at)
    }

    console.log('Updating ticket with:', updates)

    // Update the ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating ticket:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update ticket',
        details: updateError.message 
      }, { status: 500 })
    }

    console.log('Ticket updated successfully:', updatedTicket)

    // --- CREATE NOTIFICATIONS FOR STATUS CHANGE ---

    // If reopening a resolved/closed ticket
    if (status === 'open' && (ticket.status === 'resolved' || ticket.status === 'closed')) {
      console.log('Creating notifications for reopened ticket')
      
      if (isAdmin) {
        // Admin reopened - notify customer
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: ticket.user_id,
            type: 'ticket_reopened',
            title: 'Your Ticket Has Been Reopened',
            message: `Support team has reopened your ticket: ${ticket.subject}`,
            data: { 
              ticket_id: ticketId, 
              ticket_number: ticket.ticket_number,
              reopened_at: updates.reopened_at
            },
            link: `/support?ticket=${ticketId}`,
            priority: 'high',
            created_at: new Date().toISOString()
          })
        
        if (notifError) {
          console.error('Error creating customer notification:', notifError)
        }
      } else {
        // Customer reopened - notify all admins
        const { data: admins, error: adminsError } = await supabase
          .from('users')
          .select('id')
          .eq('is_admin', true)

        if (adminsError) {
          console.error('Error fetching admins:', adminsError)
        } else if (admins && admins.length > 0) {
          const adminNotifications = admins.map(admin => ({
            user_id: admin.id,
            type: 'ticket_reopened',
            title: 'Ticket Reopened by Customer',
            message: `Customer reopened ticket: ${ticket.subject}`,
            data: { 
              ticket_id: ticketId, 
              ticket_number: ticket.ticket_number,
              customer_id: user.id,
              reopened_at: updates.reopened_at
            },
            link: `/admin/support?ticket=${ticketId}`,
            priority: 'high',
            created_at: new Date().toISOString()
          }))

          const { error: bulkError } = await supabase
            .from('notifications')
            .insert(adminNotifications)
          
          if (bulkError) {
            console.error('Error creating admin notifications:', bulkError)
          }
        }
      }
    }

    // If resolving a ticket
    if (status === 'resolved' && ticket.status !== 'resolved') {
      console.log('Ticket resolved - creating notifications')
      
      if (isAdmin) {
        // Admin resolved - notify customer
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: ticket.user_id,
            type: 'ticket_resolved',
            title: 'Your Ticket Has Been Resolved',
            message: `Support team has resolved your ticket: ${ticket.subject}`,
            data: { 
              ticket_id: ticketId, 
              ticket_number: ticket.ticket_number 
            },
            link: `/support?ticket=${ticketId}`,
            priority: 'normal',
            created_at: new Date().toISOString()
          })
        
        if (notifError) {
          console.error('Error creating customer notification:', notifError)
        }
      } else {
        // Customer resolved - notify admins
        const { data: admins, error: adminsError } = await supabase
          .from('users')
          .select('id')
          .eq('is_admin', true)

        if (adminsError) {
          console.error('Error fetching admins:', adminsError)
        } else if (admins && admins.length > 0) {
          const adminNotifications = admins.map(admin => ({
            user_id: admin.id,
            type: 'ticket_resolved',
            title: 'Ticket Resolved by Customer',
            message: `Customer resolved ticket: ${ticket.subject}`,
            data: { 
              ticket_id: ticketId, 
              ticket_number: ticket.ticket_number,
              customer_id: user.id
            },
            link: `/admin/support?ticket=${ticketId}`,
            priority: 'normal',
            created_at: new Date().toISOString()
          }))

          const { error: bulkError } = await supabase
            .from('notifications')
            .insert(adminNotifications)
          
          if (bulkError) {
            console.error('Error creating admin notifications:', bulkError)
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      ticket: updatedTicket 
    })
    
  } catch (error) {
    console.error('Unhandled error in ticket update API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/support/tickets/[ticketId] - Get single ticket with messages
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

    // Get ticket with user info
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(`
        *,
        users:user_id (
          full_name,
          email,
          company_name,
          subscription_tier
        )
      `)
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Verify ownership
    if (ticket.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get messages with user info
    const { data: messages, error: messagesError } = await supabase
      .from('support_messages')
      .select(`
        *,
        users:user_id (
          full_name,
          email,
          is_admin
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Filter internal messages for non-admins
    const filteredMessages = isAdmin 
      ? messages 
      : messages?.filter((m: any) => !m.is_internal)

    return NextResponse.json({ 
      ticket: {
        ...ticket,
        messages: filteredMessages || []
      }
    })
    
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
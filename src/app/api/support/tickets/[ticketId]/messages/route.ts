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
    
    console.log('📨 GET messages request for ticket:', ticketId)
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the ticket or is admin
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      console.error('Ticket not found:', ticketError)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    const isAdmin = userData?.is_admin || false
    
    if (ticket.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch messages with user info
    const { data: messages, error } = await supabase
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

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    console.log(`Found ${messages?.length || 0} messages for ticket ${ticketId}`)

    // Filter out internal messages for non-admins
    const filteredMessages = isAdmin 
      ? messages 
      : messages?.filter((m: any) => !m.is_internal)

    return NextResponse.json({ messages: filteredMessages || [] })
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
    
    console.log('📝 POST message request for ticket:', ticketId)
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get ticket details with user info
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(`
        user_id, 
        status, 
        subject,
        ticket_number,
        users:user_id (
          email,
          full_name
        )
      `)
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      console.error('Ticket not found:', ticketError)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check if user is admin
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

    console.log('Creating message:', { ticketId, userId: user.id, isInternal: is_internal })

    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        message,
        is_internal: is_internal || false
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

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    console.log('Message created successfully:', newMessage.id)

    // --- CREATE NOTIFICATIONS FOR NEW MESSAGE ---
    
    // Don't create notifications for internal notes
    if (!is_internal) {
      console.log('Creating notifications for new message')
      
      if (isAdmin) {
        // Admin replied - notify the customer
        // But if the customer is also an admin, they still need to see this in their client view
        console.log('Admin replied, notifying customer:', ticket.user_id)
        
        // Always notify the ticket owner (even if they're also an admin)
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: ticket.user_id,
            type: 'support_reply',
            title: 'New Reply to Your Ticket',
            message: `Support team has replied to your ticket: ${ticket.subject}`,
            data: { 
              ticket_id: ticketId, 
              ticket_number: ticket.ticket_number,
              message_preview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
              context: 'customer'  // Mark this as a customer notification
            },
            link: `/dashboard/support?ticket=${ticketId}`,  // Customer link
            priority: 'high',
            created_at: new Date().toISOString()
          })
        
        if (notifError) {
          console.error('Error creating customer notification:', notifError)
        } else {
          console.log('✅ Customer notification created')
        }
      } else {
        // Customer replied - notify all admins
        console.log('Customer replied, notifying all admins')
        
        // Get all admin users
        const { data: admins, error: adminsError } = await supabase
          .from('users')
          .select('id, email')
          .eq('is_admin', true)

        if (adminsError) {
          console.error('Error fetching admins:', adminsError)
        } else if (admins && admins.length > 0) {
          console.log(`Found ${admins.length} admins to notify:`, admins.map(a => a.email))
          
          // For each admin, create a notification
          for (const admin of admins) {
            // Skip creating a notification if this admin is ALSO the customer?
            // No - we still want to notify them, but with admin context
            
            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: admin.id,
                type: 'support_reply',
                title: 'New Customer Reply',
                message: `Customer replied to ticket: ${ticket.subject}`,
                data: { 
                  ticket_id: ticketId, 
                  ticket_number: ticket.ticket_number,
                  customer_id: user.id,
                  message_preview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
                  context: 'admin'  // Mark this as an admin notification
                },
                link: `/admin/support?ticket=${ticketId}`,  // Admin link
                priority: 'high',
                created_at: new Date().toISOString()
              })
            
            if (notifError) {
              console.error(`Error creating notification for admin ${admin.email}:`, notifError)
            } else {
              console.log(`✅ Notification created for admin ${admin.email}`)
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: newMessage 
    })
  } catch (error) {
    console.error('Error in messages API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
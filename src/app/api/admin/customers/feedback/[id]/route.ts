// src/app/api/admin/customers/feedback/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    // Await the params
    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid feedback ID format' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: feedback, error } = await supabase
      .from('feedback_submissions')
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        ),
        users!feedback_submissions_user_id_fkey (
          id,
          email,
          full_name,
          company_name,
          subscription_tier,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching feedback:', error)
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    return NextResponse.json(feedback)

  } catch (error) {
    console.error('Failed to fetch feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid feedback ID format' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // DEBUG: Log what we received
    console.log('=== API RECEIVED ===');
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('Feedback ID:', id);

    // First, get the current feedback to check existing values
    const { data: existingFeedback, error: fetchError } = await supabase
      .from('feedback_submissions')
      .select('admin_response, status, user_id, feedback_type_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching existing feedback:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch existing feedback' },
        { status: 500 }
      )
    }

    console.log('Existing feedback:', existingFeedback);

    // Build updates object
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    // Track what changed for notifications
    const changes = {
      statusChanged: false,
      responseAdded: false,
      oldStatus: existingFeedback?.status,
      newStatus: null as string | null,
      oldResponse: existingFeedback?.admin_response,
      newResponse: null as string | null
    }

    // CRITICAL FIX: Always include status if it was sent, even if it's the same value
    // This ensures the status update is always processed
    if (body.status !== undefined) {
      console.log('Setting status to:', body.status);
      updates.status = body.status
      changes.statusChanged = true
      changes.newStatus = body.status
      
      // Handle timestamps based on status changes
      if (body.status === 'reviewed') {
        console.log('Status changed to reviewed - setting reviewed_at');
        updates.reviewed_at = new Date().toISOString()
        updates.reviewed_by = user.id
      }
      
      if (body.status === 'action_planned' || body.status === 'implemented') {
        console.log('Status changed to action_planned/implemented - setting actioned_at');
        updates.actioned_at = new Date().toISOString()
      }
    }

    // Handle priority if sent
    if (body.priority !== undefined) {
      console.log('Setting priority to:', body.priority);
      updates.priority = body.priority
    }

    // Handle admin response
    if (body.admin_response !== undefined) {
      console.log('Setting admin_response to:', body.admin_response);
      updates.admin_response = body.admin_response
      
      // Check if this is a new response or a modification
      if (!existingFeedback?.admin_response && body.admin_response) {
        console.log('New admin response detected');
        changes.responseAdded = true
        changes.newResponse = body.admin_response
        updates.responded_at = new Date().toISOString()
        updates.responded_by = user.id
      } else if (body.admin_response !== existingFeedback?.admin_response) {
        // If response was modified but not new, update the timestamp
        console.log('Admin response modified');
        changes.responseAdded = true
        changes.newResponse = body.admin_response
        updates.responded_at = new Date().toISOString()
        updates.responded_by = user.id
      }
    }

    console.log('Final updates object:', JSON.stringify(updates, null, 2));

    const { data, error } = await supabase
      .from('feedback_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { error: 'Failed to update feedback', details: error.message },
        { status: 500 }
      )
    }

    console.log('Update successful. Updated data:', data);

    // ============================================
    // NEW CODE: Create notifications for the client based on changes
    // ============================================
    console.log('Checking if notifications need to be sent to client...');

    // Only proceed if there were changes that warrant notifications
    if (changes.statusChanged || changes.responseAdded) {
      
      // Get more details about the feedback for the notification
      const { data: feedbackDetails, error: detailsError } = await supabase
        .from('feedback_submissions')
        .select(`
          user_id,
          client_name,
          company_name,
          comments,
          email_content,
          feedback_type:feedback_type_id (
            category,
            name
          )
        `)
        .eq('id', id)
        .single()

      if (detailsError) {
        console.error('Error fetching feedback details for notification:', detailsError)
      } else {
        console.log('Feedback details for notification:', feedbackDetails);
        
        const notifications = []

        // 1. If admin response was added/updated
        if (changes.responseAdded && changes.newResponse) {
          // Create a preview of the response (truncate if too long)
          const responsePreview = changes.newResponse.length > 100 
            ? changes.newResponse.substring(0, 100) + '...' 
            : changes.newResponse

          notifications.push({
            user_id: feedbackDetails.user_id,
            type: 'feedback_response',
            title: 'Response to Your Feedback',
            message: `Your ${feedbackDetails.feedback_type?.name || feedbackDetails.feedback_type?.category || 'feedback'} has received a response`,
            data: {
              feedback_id: id,
              response_preview: responsePreview,
              full_response: changes.newResponse,
              feedback_type: feedbackDetails.feedback_type?.category,
              feedback_type_name: feedbackDetails.feedback_type?.name,
              responded_by: user.id,
              responded_at: new Date().toISOString()
            },
            priority: 'normal',
            link: `/dashboard/feedback/${id}`,
            created_at: new Date().toISOString()
          })
          
          console.log('Created response notification for client');
        }

        // 2. If status changed
        if (changes.statusChanged && changes.newStatus) {
          // Map status to friendly message
          const statusMessages: Record<string, string> = {
            pending_review: 'Your feedback is now pending review',
            reviewed: 'Your feedback has been reviewed by our team',
            action_planned: 'We\'ve planned actions based on your feedback',
            implemented: 'Changes from your feedback have been implemented',
            closed: 'Your feedback has been closed'
          }

          // Get friendly status name for display
          const statusDisplayNames: Record<string, string> = {
            pending_review: 'Pending Review',
            reviewed: 'Reviewed',
            action_planned: 'Action Planned',
            implemented: 'Implemented',
            closed: 'Closed'
          }

          notifications.push({
            user_id: feedbackDetails.user_id,
            type: 'feedback_status_updated',
            title: 'Feedback Status Updated',
            message: statusMessages[changes.newStatus] || `Your feedback status changed to ${statusDisplayNames[changes.newStatus] || changes.newStatus}`,
            data: {
              feedback_id: id,
              old_status: changes.oldStatus,
              new_status: changes.newStatus,
              new_status_display: statusDisplayNames[changes.newStatus] || changes.newStatus,
              feedback_type: feedbackDetails.feedback_type?.category,
              feedback_type_name: feedbackDetails.feedback_type?.name,
              updated_at: new Date().toISOString()
            },
            priority: changes.newStatus === 'implemented' || changes.newStatus === 'closed' ? 'low' : 'normal',
            link: `/dashboard/feedback/${id}`,
            created_at: new Date().toISOString()
          })
          
          console.log('Created status update notification for client');
        }

        // Insert all notifications
        if (notifications.length > 0) {
          console.log(`Inserting ${notifications.length} notification(s) for client...`);
          
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notifications)

          if (notificationError) {
            console.error('Error creating client notifications:', notificationError)
          } else {
            console.log(`✅ Successfully created ${notifications.length} client notification(s)`)
          }
        } else {
          console.log('No notifications needed for this update');
        }
      }
    } else {
      console.log('No status change or response added - skipping notifications');
    }
    // ============================================
    // END OF NEW CODE
    // ============================================

    return NextResponse.json(data)

  } catch (error) {
    console.error('Failed to update feedback:', error)
    return NextResponse.json(
      { error: 'Failed to update feedback', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid feedback ID format' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('feedback_submissions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to delete feedback:', error)
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
}
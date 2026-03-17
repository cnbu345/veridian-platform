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
      .select('admin_response, status')
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

    // CRITICAL FIX: Always include status if it was sent, even if it's the same value
    // This ensures the status update is always processed
    if (body.status !== undefined) {
      console.log('Setting status to:', body.status);
      updates.status = body.status
      
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
      
      // Only set responded_at if this is a new response (not just editing an existing one)
      if (!existingFeedback?.admin_response && body.admin_response) {
        console.log('New admin response detected - setting responded_at');
        updates.responded_at = new Date().toISOString()
        updates.responded_by = user.id
      } else if (body.admin_response !== existingFeedback?.admin_response) {
        // If response was modified but not new, update the timestamp
        console.log('Admin response modified - updating responded_at');
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
    return NextResponse.json(data)

  } catch (error) {
    console.error('Failed to update feedback:', error)
    return NextResponse.json(
      { error: 'Failed to update feedback', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
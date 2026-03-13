// src/app/api/client/feedback/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get feedback with all details
    const { data: feedback, error } = await supabase
      .from('feedback_submissions')
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        ),
        responses:feedback_responses (
          id,
          message,
          responder_type,
          responder_id,
          created_at
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this feedback
      .single()

    if (error) {
      console.error('Error fetching feedback:', error)
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    return NextResponse.json({ feedback })

  } catch (error) {
    console.error('Error in client feedback API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
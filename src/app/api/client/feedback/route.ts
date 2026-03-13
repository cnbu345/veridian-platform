// src/app/api/client/feedback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getFeedbackAcknowledgmentEmail } from '@/lib/email/templates/feedback/feedback-acknowledgment'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')

    let query = supabase
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
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (type && type !== 'all') {
      query = query.eq('feedback_type.category', type)
    }

    const { data: feedback, error } = await query

    if (error) {
      console.error('Error fetching feedback:', error)
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
    }

    return NextResponse.json({ feedback })

  } catch (error) {
    console.error('Error in client feedback API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      feedback_type_id,
      nps_score,
      csat_score,
      comments,
      metadata 
    } = body

    // Get user details for email
    const { data: userDetails } = await supabase
      .from('users')
      .select('full_name, company_name, email')
      .eq('id', user.id)
      .single()

    // Create feedback submission
    const { data: feedback, error } = await supabase
      .from('feedback_submissions')
      .insert({
        user_id: user.id,
        feedback_type_id,
        nps_score,
        csat_score,
        comments,
        source: 'manual',
        status: 'pending',
        priority: nps_score && nps_score <= 6 ? 'high' : 'normal',
        metadata: metadata || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating feedback:', error)
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }

    // Get feedback type details
    const { data: feedbackType } = await supabase
      .from('feedback_type')
      .select('name, category')
      .eq('id', feedback_type_id)
      .single()

    // Send acknowledgment email
    try {
      const { subject, html, text } = getFeedbackAcknowledgmentEmail({
        client_name: userDetails?.full_name || user.email?.split('@')[0] || 'Valued Client',
        company_name: userDetails?.company_name || 'Your Company',
        feedback_type: feedbackType?.name || 'feedback',
        account_manager: 'Your Account Manager',
        ticket_id: feedback.id.slice(0, 8).toUpperCase(),
        estimated_response: 'within 2 business days'
      })

      await resend.emails.send({
        from: process.env.NODE_ENV === 'production' 
          ? '"Veridian Group" <feedback@veridiangroup.com>'
          : '"Veridian Group" <onboarding@resend.dev>',
        to: [user.email!],
        subject,
        html,
        text
      })
    } catch (emailError) {
      console.error('Error sending acknowledgment email:', emailError)
      // Don't fail the request if email fails
    }

    // Create notification for admins
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('is_admin', true)

    if (admins) {
      const adminNotifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'new_feedback',
        title: 'New Client Feedback',
        message: `${userDetails?.company_name || 'A client'} submitted ${feedbackType?.name || 'feedback'}`,
        data: {
          feedback_id: feedback.id,
          client_id: user.id,
          company_name: userDetails?.company_name,
          priority: nps_score && nps_score <= 6 ? 'high' : 'normal'
        },
        priority: nps_score && nps_score <= 6 ? 'high' : 'normal',
        link: `/admin/customers/feedback/${feedback.id}`,
        created_at: new Date().toISOString()
      }))

      await supabase
        .from('notifications')
        .insert(adminNotifications)
    }

    return NextResponse.json({ 
      success: true, 
      feedback,
      message: 'Feedback submitted successfully' 
    })

  } catch (error) {
    console.error('Error in client feedback API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
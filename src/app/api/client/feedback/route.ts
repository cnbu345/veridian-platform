// src/app/api/client/feedback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
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
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let query = supabase
      .from('feedback_submissions')
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (type && type !== 'all') {
      query = query.eq('feedback_type.category', type)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: feedback, error } = await query

    if (error) {
      console.error('Error fetching feedback:', error)
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
    }

    return NextResponse.json({ feedback: feedback || [] })

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
      email_subject,
      email_content,
      feature_category,
      metadata = {}
    } = body

    // Get user details for context
    const { data: userDetails } = await supabase
      .from('users')
      .select('full_name, company_name, email')
      .eq('id', user.id)
      .single()

    // Get feedback type for category
    const { data: feedbackType } = await supabase
      .from('feedback_type')
      .select('category')
      .eq('id', feedback_type_id)
      .single()

    // Determine priority - using correct enum values
    let priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'  // Default is 'normal'

    if (nps_score && nps_score <= 6) {
      priority = 'high'
    } else if (feedbackType?.category === 'support') {
      priority = 'high'
    } else if (metadata.priority) {
      // Map any custom priority values to valid enum values
      const incomingPriority = metadata.priority.toLowerCase()
      if (incomingPriority === 'critical') {
        priority = 'critical'
      } else if (incomingPriority === 'high') {
        priority = 'high'
      } else if (incomingPriority === 'medium' || incomingPriority === 'normal') {
        priority = 'normal'  // Map both 'medium' and 'normal' to 'normal'
      } else if (incomingPriority === 'low') {
        priority = 'low'
      } else {
        priority = 'normal'
      }
    }

    console.log('Priority being sent to database:', priority) // Debug log

    // Create feedback submission
    const { data: feedback, error } = await supabase
      .from('feedback_submissions')
      .insert({
        user_id: user.id,
        feedback_type_id,
        nps_score: nps_score || null,
        csat_score: csat_score || null,
        comments: comments || email_content || null,
        email_subject: email_subject || getDefaultSubject(feedbackType?.category || 'general'),
        email_content: email_content || comments || '',
        feature_category: feature_category || metadata.category || null,
        company_name: userDetails?.company_name,
        client_name: userDetails?.full_name,
        source: 'dashboard',
        status: 'pending_review',
        priority,
        metadata: {
          ...metadata,
          submitted_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent'),
          ip_address: request.headers.get('x-forwarded-for')
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        )
      `)
      .single()

    if (error) {
      console.error('Error creating feedback:', error)
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }

    // Send acknowledgment email (don't block on failure)
    try {
      await resend.emails.send({
        from: process.env.NODE_ENV === 'production' 
          ? '"Veridian Group" <feedback@veridiangroup.com>'
          : '"Veridian Group" <onboarding@resend.dev>',
        to: [user.email!],
        subject: 'We received your feedback',
        html: getAcknowledgmentEmailHTML(
          userDetails?.full_name || 'Valued Client',
          feedbackType?.category || 'feedback'
        )
      })
    } catch (emailError) {
      console.error('Error sending acknowledgment email:', emailError)
    }

    // Create notifications for admins
    console.log('Creating notifications for admins about new feedback...')
    
    // Get all admin users
    const { data: admins, error: adminsError } = await supabase
      .from('users')
      .select('id')
      .eq('is_admin', true)

    if (adminsError) {
      console.error('Error fetching admins:', adminsError)
    } else if (admins && admins.length > 0) {
      console.log(`Found ${admins.length} admins to notify`)
      
      // Create a preview of the feedback message (truncate if too long)
      const messagePreview = comments || email_content || 'No message provided'
      const truncatedPreview = messagePreview.length > 100 
        ? messagePreview.substring(0, 100) + '...' 
        : messagePreview

      // Build notification for each admin
      const adminNotifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'feedback_received',
        title: 'New Client Feedback Received',
        message: `${userDetails?.company_name || 'A client'} submitted ${feedbackType?.category || 'feedback'} feedback`,
        data: {
          feedback_id: feedback.id,
          client_id: user.id,
          client_name: userDetails?.full_name,
          company_name: userDetails?.company_name,
          client_email: userDetails?.email,
          feedback_type: feedbackType?.category,
          priority: priority,
          preview: truncatedPreview,
          submitted_at: new Date().toISOString()
        },
        priority: priority === 'critical' || priority === 'high' ? 'high' : 'normal',
        link: `/admin/customers/feedback/${feedback.id}`,
        created_at: new Date().toISOString()
      }))

      // Insert all admin notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(adminNotifications)

      if (notificationError) {
        console.error('Error creating admin notifications:', notificationError)
      } else {
        console.log(`✅ Successfully created ${adminNotifications.length} admin notifications for new feedback`)
      }
    } else {
      console.log('No admin users found to notify')
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

// Helper functions
function getDefaultSubject(type: string): string {
  const subjects: Record<string, string> = {
    nps: 'NPS Score Feedback',
    csat: 'Service Experience Feedback',
    feature_request: 'Feature Request',
    support: 'Support Experience Feedback',
    general: 'General Feedback',
    account_review: 'Account Review Feedback'
  }
  return subjects[type] || 'Feedback Submission'
}

function getAcknowledgmentEmailHTML(name: string, type: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a2b3c;">Thank You for Your Feedback</h2>
      <p>Dear ${name},</p>
      <p>We've received your ${type} and appreciate you taking the time to share your thoughts with us.</p>
      <p>Our team will review your feedback and respond within 2 business days if a response is needed.</p>
      <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <p style="margin: 0; color: #4a5568;">You can track the status of your feedback in your dashboard at any time.</p>
      </div>
      <p>Best regards,<br>The Veridian Group Team</p>
    </div>
  `
}
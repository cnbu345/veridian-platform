// src/app/api/triggers/csat/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getCSATSurveyEmail } from '@/lib/email/templates/feedback/csat-survey'
import { format } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { interaction_type, interaction_id, user_id } = body

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, company_name')
      .eq('id', user_id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get interaction details based on type
    let interactionDate = new Date().toISOString()
    let interactionDetails = {}

    if (interaction_type === 'consultation') {
      const { data: consultation } = await supabase
        .from('consultations')
        .select('consultation_date, consultation_type')
        .eq('id', interaction_id)
        .single()
      
      if (consultation) {
        interactionDate = consultation.consultation_date
        interactionDetails = { type: consultation.consultation_type }
      }
    } else if (interaction_type === 'support') {
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select('created_at, category')
        .eq('id', interaction_id)
        .single()
      
      if (ticket) {
        interactionDate = ticket.created_at
        interactionDetails = { category: ticket.category }
      }
    } else if (interaction_type === 'report') {
      const { data: report } = await supabase
        .from('reports')
        .select('created_at')
        .eq('id', interaction_id)
        .single()
      
      if (report) {
        interactionDate = report.created_at
      }
    }

    // Generate CSAT token
    const csatToken = Buffer.from(`${user_id}-${interaction_id}-${Date.now()}`).toString('base64')
    const csatLink = `${process.env.NEXT_PUBLIC_APP_URL}/feedback/csat?token=${csatToken}`

    // Get CSAT feedback type
    const { data: feedbackType } = await supabase
      .from('feedback_type')
      .select('id')
      .eq('category', 'csat')
      .eq('name', 'Post-Interaction CSAT')
      .single()

    if (!feedbackType) {
      return NextResponse.json({ error: 'CSAT feedback type not configured' }, { status: 500 })
    }

    // Create feedback submission record
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback_submissions')
      .insert({
        user_id: user.id,
        feedback_type_id: feedbackType.id,
        source: 'automated',
        status: 'pending',
        metadata: {
          interaction_type,
          interaction_id,
          csat_token: csatToken,
          interaction_date: interactionDate,
          ...interactionDetails
        }
      })
      .select()
      .single()

    if (feedbackError) {
      console.error('Error creating feedback record:', feedbackError)
      return NextResponse.json({ error: 'Failed to create feedback record' }, { status: 500 })
    }

    // Send CSAT email
    const { subject, html, text } = getCSATSurveyEmail({
      client_name: user.full_name || user.email?.split('@')[0] || 'Valued Client',
      company_name: user.company_name || 'Your Company',
      interaction_type: interaction_type as any,
      interaction_date: format(new Date(interactionDate), 'MMMM d, yyyy'),
      feedback_link: csatLink,
      account_manager: 'Your Account Manager'
    })

    await resend.emails.send({
      from: process.env.NODE_ENV === 'production' 
        ? '"Veridian Group" <feedback@veridiangroup.com>'
        : '"Veridian Group" <onboarding@resend.dev>',
      to: [user.email],
      subject,
      html,
      text
    })

    return NextResponse.json({
      success: true,
      feedback_id: feedback.id,
      message: 'CSAT survey triggered successfully'
    })

  } catch (error) {
    console.error('Error triggering CSAT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
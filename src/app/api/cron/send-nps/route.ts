// src/app/api/cron/send-nps/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getNPSSurveyEmail } from '@/lib/email/templates/feedback/nps-survey'
import { format } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Get all scheduled NPS surveys for today
    const { data: schedules, error: scheduleError } = await supabase
      .from('nps_survey_schedule')
      .select(`
        *,
        users (
          id,
          email,
          full_name,
          company_name
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_date', now.toISOString()) // Due today or earlier
      .is('sent_at', null)

    if (scheduleError) {
      console.error('Error fetching schedules:', scheduleError)
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
    }

    const results = []

    for (const schedule of schedules || []) {
      try {
        const user = schedule.users
        const reviewPeriod = `Q${schedule.quarter} ${schedule.year}`

        // Generate unique feedback link with token
        const feedbackToken = Buffer.from(`${user.id}-${schedule.id}-${Date.now()}`).toString('base64')
        const feedbackLink = `${process.env.NEXT_PUBLIC_APP_URL}/feedback/nps?token=${feedbackToken}`

        const { subject, html, text } = getNPSSurveyEmail({
          client_name: user.full_name || user.email?.split('@')[0] || 'Valued Client',
          company_name: user.company_name || 'Your Company',
          account_manager: 'Your Account Manager',
          review_period: reviewPeriod,
          feedback_link: feedbackLink,
          unsubscribe_link: `${process.env.NEXT_PUBLIC_APP_URL}/preferences?email=${encodeURIComponent(user.email)}`
        })

        // Send email
        const { data, error: emailError } = await resend.emails.send({
          from: process.env.NODE_ENV === 'production' 
            ? '"Veridian Group" <nps@veridiangroup.com>'
            : '"Veridian Group" <onboarding@resend.dev>',
          to: [user.email],
          subject,
          html,
          text
        })

        if (emailError) {
          throw emailError
        }

        // Mark as sent
        await supabase
          .from('nps_survey_schedule')
          .update({
            sent_at: new Date().toISOString(),
            status: 'sent',
            metadata: {
              ...schedule.metadata,
              sent_at: new Date().toISOString(),
              message_id: data?.id
            }
          })
          .eq('id', schedule.id)

        // Create feedback submission record
        const { data: feedbackType } = await supabase
          .from('feedback_type')
          .select('id')
          .eq('category', 'nps')
          .eq('name', 'Quarterly NPS Survey')
          .single()

        if (feedbackType) {
          await supabase
            .from('feedback_submissions')
            .insert({
              user_id: user.id,
              feedback_type_id: feedbackType.id,
              source: 'email',
              status: 'pending',
              metadata: {
                schedule_id: schedule.id,
                quarter: schedule.quarter,
                year: schedule.year,
                feedback_token: feedbackToken,
                survey_type: 'quarterly_nps'
              }
            })
        }

        results.push({
          success: true,
          user_id: user.id,
          schedule_id: schedule.id
        })

      } catch (error) {
        console.error(`Error sending NPS to schedule ${schedule.id}:`, error)
        
        // Log failure but continue with others
        await supabase
          .from('nps_survey_schedule')
          .update({
            metadata: {
              ...schedule.metadata,
              failed_attempt: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          })
          .eq('id', schedule.id)

        results.push({
          success: false,
          user_id: schedule.user_id,
          schedule_id: schedule.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    })

  } catch (error) {
    console.error('Error in NPS sender:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
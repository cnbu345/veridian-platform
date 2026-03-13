// src/app/api/cron/schedule-nps/route.ts - Automated Quarterly NPS Scheduling
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { addMonths, startOfQuarter, endOfQuarter, format } from 'date-fns'

// This endpoint should be called by a cron job (e.g., GitHub Actions, Vercel Cron)
export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure it's not called by unauthorized users
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date()
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1
    const currentYear = now.getFullYear()
    const quarterStart = startOfQuarter(now)
    const quarterEnd = endOfQuarter(now)

    // Get all active enterprise clients
    const { data: clients, error: clientError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        company_name,
        subscription_tier,
        user_subscriptions (*)
      `)
      .in('subscription_tier', ['enterprise', 'enterprise-lite', 'enterprise-pro', 'enterprise-unlimited'])
      .eq('is_admin', false)

    if (clientError) {
      console.error('Error fetching clients:', clientError)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Check which clients already have NPS surveys scheduled for this quarter
    const { data: existingSchedules } = await supabase
      .from('nps_survey_schedule')
      .select('user_id')
      .eq('quarter', currentQuarter)
      .eq('year', currentYear)

    const scheduledUserIds = new Set(existingSchedules?.map(s => s.user_id) || [])

    // Create schedules for clients who don't have one
    const newSchedules = clients
      .filter(client => !scheduledUserIds.has(client.id))
      .map(client => {
        // Stagger surveys throughout the quarter
        const randomDay = Math.floor(Math.random() * 45) + 15 // Days 15-60 of quarter
        const scheduledDate = new Date(quarterStart)
        scheduledDate.setDate(scheduledDate.getDate() + randomDay)

        return {
          user_id: client.id,
          scheduled_date: scheduledDate.toISOString(),
          status: 'scheduled',
          quarter: currentQuarter,
          year: currentYear,
          metadata: {
            client_email: client.email,
            client_name: client.full_name,
            company_name: client.company_name,
            subscription_tier: client.subscription_tier
          }
        }
      })

    if (newSchedules.length > 0) {
      const { error: insertError } = await supabase
        .from('nps_survey_schedule')
        .insert(newSchedules)

      if (insertError) {
        console.error('Error creating NPS schedules:', insertError)
        return NextResponse.json({ error: 'Failed to create schedules' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Scheduled ${newSchedules.length} new NPS surveys`,
      total_clients: clients.length,
      existing_schedules: existingSchedules?.length || 0
    })

  } catch (error) {
    console.error('Error in NPS scheduler:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
// src/app/api/consultations/reminders/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendReminderEmail } from '@/lib/email/service'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json().catch(() => ({}))
    const { consultationId, source = 'manual' } = body
    
    // Check if this is a cron job request
    const authHeader = request.headers.get('authorization')
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    // For manual triggers, verify admin access
    if (!isCronJob) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      // Check if user is admin
      const { data: profile } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      
      if (!profile?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    
    // Handle single consultation reminder (manual trigger)
    if (consultationId) {
      // Get consultation details with user info
      const { data: consultation, error: consultError } = await supabase
        .from('consultations')
        .select(`
          *,
          users (
            email,
            full_name
          )
        `)
        .eq('id', consultationId)
        .single()
      
      if (consultError) {
        console.error('Error fetching consultation:', consultError)
        return NextResponse.json({ 
          error: 'Consultation not found',
          details: consultError.message 
        }, { status: 404 })
      }
      
      // Check if reminder already sent
      if (consultation.reminder_sent) {
        return NextResponse.json({ 
          success: false, 
          error: 'Reminder already sent for this consultation' 
        }, { status: 400 })
      }
      
      // Send reminder email
      try {
        console.log('Sending reminder email to:', consultation.customer_email)
        
        await sendReminderEmail({
          id: consultation.id,
          customer_name: consultation.customer_name,
          customer_email: consultation.customer_email,
          consultation_date: consultation.consultation_date,
          consultation_type: consultation.consultation_type,
          meeting_link: consultation.meeting_link,
          notes: consultation.notes
        })
        
        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('consultations')
          .update({ 
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString()
          })
          .eq('id', consultationId)
        
        if (updateError) {
          console.error('Error updating reminder status:', updateError)
          // Don't fail the request, the email was sent
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Reminder sent successfully',
          consultationId 
        })
      } catch (emailError) {
        console.error('Error sending reminder email:', {
          error: emailError,
          message: emailError instanceof Error ? emailError.message : 'Unknown error',
          stack: emailError instanceof Error ? emailError.stack : undefined
        })
        
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to send reminder email',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        }, { status: 500 })
      }
    }
    
    // Handle batch reminders (cron job)
    // Find consultations in the next 24 hours that haven't had a reminder sent
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    const { data: consultations, error } = await supabase
      .from('consultations')
      .select('*, users(*)')
      .eq('status', 'scheduled')
      .eq('reminder_sent', false)
      .gte('consultation_date', now.toISOString())
      .lte('consultation_date', tomorrow.toISOString())
    
    if (error) {
      console.error('Error fetching consultations:', error)
      return NextResponse.json({ error: 'Failed to fetch consultations' }, { status: 500 })
    }
    
    if (!consultations || consultations.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No pending reminders to send',
        remindersSent: 0 
      })
    }
    
    // Send reminders
    const results = []
    for (const consultation of consultations) {
      try {
        await sendReminderEmail(consultation)
        
        // Mark reminder as sent
        await supabase
          .from('consultations')
          .update({ 
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString()
          })
          .eq('id', consultation.id)
        
        results.push({ id: consultation.id, success: true })
      } catch (emailError) {
        console.error(`Failed to send reminder for consultation ${consultation.id}:`, emailError)
        results.push({ id: consultation.id, success: false, error: emailError.message })
      }
    }
    
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    return NextResponse.json({ 
      success: true,
      message: `Sent ${successful} reminders, ${failed} failed`,
      remindersSent: successful,
      failedCount: failed,
      details: results
    })
    
  } catch (error) {
    console.error('Error in reminders API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Optional: Add a GET endpoint to check pending reminders
export async function GET(request: Request) {
  try {
    // Verify admin access for GET requests
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Count pending reminders
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    const { count, error } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .eq('reminder_sent', false)
      .gte('consultation_date', now.toISOString())
      .lte('consultation_date', tomorrow.toISOString())
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch pending count' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      pendingReminders: count || 0
    })
    
  } catch (error) {
    console.error('Error checking reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
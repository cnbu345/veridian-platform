// src/app/api/consultations/book/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendConsultationConfirmation } from '@/lib/email/service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Validate required fields
    const requiredFields = ['customer_name', 'customer_email', 'customer_phone', 'company_name', 'consultation_date', 'consultation_type']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }
    
    // Try to generate Google Meet link, but don't fail if it doesn't work
    let meetingLink = null
    let calendarEventId = null
    
    // Only attempt to create calendar event if the function exists and credentials are set
    try {
      // Dynamic import to avoid errors if the module doesn't exist
      const { createCalendarEventWithMeet } = await import('@/lib/google/calendar').catch(() => ({ createCalendarEventWithMeet: null }))
      
      if (createCalendarEventWithMeet) {
        console.log('Attempting to generate Google Meet link...')
        const calendarResult = await createCalendarEventWithMeet({
          customer_name: body.customer_name,
          customer_email: body.customer_email,
          consultation_date: body.consultation_date,
          consultation_type: body.consultation_type,
          duration_minutes: 30,
          notes: body.notes
        }).catch((err: Error) => {
          console.log('Calendar service error (non-fatal):', err.message)
          return null
        })
        
        if (calendarResult) {
          meetingLink = calendarResult.meetLink
          calendarEventId = calendarResult.calendarEventId
          console.log('Meet link generated successfully:', meetingLink)
        }
      } else {
        console.log('Google Calendar module not available - proceeding without Meet link')
      }
    } catch (calendarError) {
      // Log but don't fail - we can still create consultation without Meet link
      console.log('Calendar service unavailable (non-fatal):', calendarError instanceof Error ? calendarError.message : 'Unknown error')
    }
    
    // Create consultation without meeting link if calendar failed
    const consultationData = {
      user_id: user.id,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      company_name: body.company_name,
      consultation_date: body.consultation_date,
      duration_minutes: 30,
      consultation_type: body.consultation_type,
      notes: body.notes || null,
      status: 'scheduled',
      converted_to_sale: false,
      meeting_link: meetingLink,
      calendar_event_id: calendarEventId,
      reminder_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Creating consultation with data:', consultationData)
    
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .insert([consultationData])
      .select()
      .single()
    
    if (consultationError) {
      console.error('Error creating consultation:', consultationError)
      
      // If we created a calendar event but failed to save consultation,
      // we should delete the calendar event (optional cleanup)
      if (calendarEventId) {
        // TODO: Add cleanup function
      }
      
      return NextResponse.json({ 
        error: 'Failed to create consultation',
        details: consultationError.message 
      }, { status: 500 })
    }
    
    // Send confirmation email (don't fail if email fails)
    try {
      await sendConsultationConfirmation({
        ...consultation,
        meeting_link: meetingLink
      }, user)
      console.log('Confirmation email sent successfully')
    } catch (emailError) {
      console.error('Error sending confirmation email (non-fatal):', emailError)
    }
    
    return NextResponse.json({ 
      success: true, 
      consultation,
      meetingLink,
      message: meetingLink ? 'Consultation booked with Google Meet' : 'Consultation booked successfully (no video meeting)'
    })
    
  } catch (error) {
    console.error('Error in consultation booking:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
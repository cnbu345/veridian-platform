// src/app/api/consultations/book/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendConsultationConfirmation } from '@/lib/email/service'
import { createCalendarEventWithMeet } from '@/lib/google/calendar'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Generate Google Meet link
    let meetingLink = null
    let calendarEventId = null
    
    try {
      console.log('Generating Google Meet link...')
      const calendarResult = await createCalendarEventWithMeet({
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        consultation_date: body.consultation_date,
        consultation_type: body.consultation_type,
        duration_minutes: 30,
        notes: body.notes
      })
      
      meetingLink = calendarResult.meetLink
      calendarEventId = calendarResult.calendarEventId
      console.log('Meet link generated:', meetingLink)
      
    } catch (calendarError) {
      // Log but don't fail - we can still create consultation without Meet link
      console.error('Failed to generate Meet link:', calendarError)
      // You might want to notify an admin about this
    }
    
    // Create consultation with meeting link
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .insert([{
        user_id: user.id,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        company_name: body.company_name,
        consultation_date: body.consultation_date,
        duration_minutes: 30,
        consultation_type: body.consultation_type,
        notes: body.notes,
        status: 'scheduled',
        converted_to_sale: false,
        meeting_link: meetingLink,  // Store the Meet link
        calendar_event_id: calendarEventId  // Store the calendar event ID
      }])
      .select()
      .single()
    
    if (consultationError) {
      console.error('Error creating consultation:', consultationError)
      
      // If we created a calendar event but failed to save consultation,
      // we should delete the calendar event (optional cleanup)
      if (calendarEventId) {
        // TODO: Add cleanup function
      }
      
      return NextResponse.json({ error: 'Failed to create consultation' }, { status: 500 })
    }
    
    // Send confirmation email
    try {
      await sendConsultationConfirmation({
        ...consultation,
        meeting_link: meetingLink  // Ensure email has the meeting link
      }, user)
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the booking if email fails
    }
    
    return NextResponse.json({ 
      success: true, 
      consultation,
      meetingLink  // Return for debugging
    })
    
  } catch (error) {
    console.error('Error in consultation booking:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
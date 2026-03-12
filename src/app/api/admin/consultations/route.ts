// src/app/api/admin/consultations/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendConsultationConfirmation } from '@/lib/email/service'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify admin access
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Parse request body
    const body = await request.json()
    console.log('Received consultation data:', body)
    
    // Validate required fields
    const requiredFields = ['customer_name', 'customer_email', 'customer_phone', 'consultation_date', 'consultation_type', 'duration_minutes']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.customer_email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 })
    }
    
    // Validate consultation type
    const validTypes = ['discovery', 'strategy', 'technical', 'compliance', 'enterprise']
    if (!validTypes.includes(body.consultation_type)) {
      return NextResponse.json({ 
        error: 'Invalid consultation type. Must be one of: discovery, strategy, technical, compliance, enterprise'  
      }, { status: 400 })
    }
    
    // Validate date
    const consultationDate = new Date(body.consultation_date)
    if (isNaN(consultationDate.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid consultation date' 
      }, { status: 400 })
    }
    
    // Generate Google Meet link if not provided
    let meetingLink = body.meeting_link
    let calendarEventId = null
    
    if (!meetingLink) {
      try {
        // Try to generate a Meet link
        const { createCalendarEventWithMeet } = await import('@/lib/google/calendar').catch(() => ({ createCalendarEventWithMeet: null }))
        
        if (createCalendarEventWithMeet) {
          console.log('Generating Google Meet link...')
          const calendarResult = await createCalendarEventWithMeet({
            customer_name: body.customer_name,
            customer_email: body.customer_email,
            consultation_date: body.consultation_date,
            consultation_type: body.consultation_type,
            duration_minutes: body.duration_minutes,
            notes: body.notes,
            is_admin_scheduled: true
          }).catch((err) => {
            console.log('Calendar service error (non-fatal):', err.message)
            return null
          })
          
          if (calendarResult) {
            meetingLink = calendarResult.meetLink
            calendarEventId = calendarResult.calendarEventId
            console.log('Meet link generated:', meetingLink)
          }
        }
      } catch (calendarError) {
        console.log('Could not generate Meet link, proceeding without it')
      }
    }
    
    // Create consultation
    let userId = null

    // Check if this email belongs to an existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.customer_email)
      .maybeSingle()

    if (existingUser) {
      userId = existingUser.id
    }

    const consultationData = {
      ...(userId && { user_id: userId }),
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      company_name: body.company_name || null,
      consultation_date: body.consultation_date,
      duration_minutes: body.duration_minutes,
      consultation_type: body.consultation_type,
      notes: body.notes || null,
      status: 'scheduled',
      converted_to_sale: false,
      meeting_link: meetingLink || null,
      calendar_event_id: calendarEventId || null,
      reminder_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting consultation data:', consultationData)


    // Try the simplest insert possible - no .select(), no .single()
    const { error: insertError } = await supabase
      .from('consultations')
      .insert(consultationData)

    if (insertError) {
      console.error('Basic insert failed:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create consultation',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 })
    }

    // If insert succeeded, fetch the newly created consultation
    const { data: newConsultations, error: fetchError } = await supabase
      .from('consultations')
      .select('*')
      .eq('customer_email', body.customer_email)
      .eq('consultation_date', body.consultation_date)
      .order('created_at', { ascending: false })
      .limit(1)

    if (fetchError || !newConsultations || newConsultations.length === 0) {
      console.error('Failed to fetch created consultation:', fetchError)
      return NextResponse.json({ 
        error: 'Consultation created but failed to fetch',
        details: fetchError?.message
      }, { status: 500 })
    }
    
    const consultation = newConsultations[0]
    console.log('Consultation created successfully:', consultation.id)

    const leadId = body.leadId
      if (leadId) {
        console.log('Updating lead record for lead:', leadId)
        
        const { error: leadUpdateError } = await supabase
          .from('enterprise_leads')
          .update({
            consultation_scheduled: true,
            consultation_scheduled_at: new Date().toISOString(),
            consultation_id: consultation.id,
            consultation_type: body.consultation_type,
            last_contacted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', leadId)

        if (leadUpdateError) {
          console.error('Error updating lead with consultation:', leadUpdateError)
          // Don't fail the request, just log it
        } else {
          console.log('Lead updated successfully with consultation ID:', consultation.id)
        }
      }
    
    // Send confirmation email if requested
    if (body.send_invite) {
      try {
        await sendConsultationConfirmation({
          ...consultation,
          meeting_link: meetingLink
        }, user)
        console.log('Confirmation email sent successfully to:', body.customer_email)
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Don't fail the booking if email fails, but log it
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      consultation,
      message: body.send_invite 
        ? 'Consultation scheduled and email sent successfully'
        : 'Consultation scheduled successfully'
    })
    
  } catch (error) {
    console.error('Unhandled error in admin consultation creation:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

// Optional: Get available time slots for a specific date
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }
    
    // Get all consultations for the specified date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const { data: consultations, error } = await supabase
      .from('consultations')
      .select('consultation_date, duration_minutes')
      .gte('consultation_date', startOfDay.toISOString())
      .lte('consultation_date', endOfDay.toISOString())
      .eq('status', 'scheduled')
    
    if (error) {
      console.error('Error fetching consultations:', error)
      return NextResponse.json({ error: 'Failed to fetch consultations' }, { status: 500 })
    }
    
    // Get admin availability for the day of week
    const dayOfWeek = new Date(date).getDay() // 0 = Sunday
    const { data: availability, error: availError } = await supabase
      .from('consultation_availability')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
    
    if (availError) {
      console.error('Error fetching availability:', availError)
      // Don't fail, just return empty availability
    }
    
    return NextResponse.json({
      bookedSlots: consultations || [],
      availableSlots: availability || []
    })
    
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
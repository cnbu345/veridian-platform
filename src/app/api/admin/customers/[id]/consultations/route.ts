// src/app/api/admin/customers/[id]/consultations/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendConsultationConfirmation } from '@/lib/email/service'

// GET recent consultations for a specific customer
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    
    // Verify admin access
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get recent consultations for this customer
    const { data: consultations, error } = await supabase
      .from('consultations')
      .select(`
        id,
        consultation_date,
        consultation_type,
        status,
        meeting_link,
        duration_minutes,
        notes,
        converted_to_sale,
        sale_amount,
        created_at
      `)
      .eq('user_id', id)
      .order('consultation_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching customer consultations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch consultations' },
        { status: 500 }
      )
    }

    return NextResponse.json(consultations)

  } catch (error) {
    console.error('Unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST a new consultation for a specific customer (quick action from customer detail page)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Verify admin access
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get customer details to ensure they exist
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('email, full_name, company_name, phone')
      .eq('id', id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields for quick action
    if (!body.consultation_date) {
      return NextResponse.json(
        { error: 'Consultation date is required' },
        { status: 400 }
      )
    }

    // Set defaults for quick action
    const consultationData = {
      user_id: id,
      customer_name: body.customer_name || customer.full_name || 'Customer',
      customer_email: body.customer_email || customer.email,
      customer_phone: body.customer_phone || customer.phone || '',
      company_name: body.company_name || customer.company_name || '',
      consultation_date: body.consultation_date,
      duration_minutes: body.duration_minutes || 30,
      consultation_type: body.consultation_type || 'discovery',
      notes: body.notes || `Scheduled by admin ${user.email}`,
      status: 'scheduled',
      converted_to_sale: false,
      meeting_link: body.meeting_link || null,
      reminder_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Try to generate a Meet link if not provided
    if (!consultationData.meeting_link) {
      try {
        const { createCalendarEventWithMeet } = await import('@/lib/google/calendar').catch(() => ({ createCalendarEventWithMeet: null }))
        
        if (createCalendarEventWithMeet) {
          const calendarResult = await createCalendarEventWithMeet({
            customer_name: consultationData.customer_name,
            customer_email: consultationData.customer_email,
            consultation_date: consultationData.consultation_date,
            consultation_type: consultationData.consultation_type,
            duration_minutes: consultationData.duration_minutes,
            notes: consultationData.notes,
            is_admin_scheduled: true
          }).catch(() => null)
          
          if (calendarResult) {
            consultationData.meeting_link = calendarResult.meetLink
            consultationData.calendar_event_id = calendarResult.calendarEventId
          }
        }
      } catch (calendarError) {
        console.log('Could not generate Meet link, proceeding without it')
      }
    }

    // Create consultation
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .insert([consultationData])
      .select()
      .single()

    if (consultationError) {
      console.error('Error creating consultation:', consultationError)
      return NextResponse.json(
        { error: 'Failed to create consultation' },
        { status: 500 }
      )
    }

    // Send confirmation email automatically for admin-scheduled consultations
    try {
      await sendConsultationConfirmation({
        id: consultation.id,
        customer_name: consultation.customer_name,
        customer_email: consultation.customer_email,
        consultation_date: consultation.consultation_date,
        consultation_type: consultation.consultation_type,
        meeting_link: consultation.meeting_link,
        notes: consultation.notes
      }, user)
      
      // Mark that reminder was sent
      await supabase
        .from('consultations')
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq('id', consultation.id)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    // Log the admin action
    await supabase
      .from('communications_log')
      .insert({
        user_id: id,
        admin_id: user.id,
        type: 'consultation_scheduled',
        subject: `Consultation scheduled for ${new Date(consultation.consultation_date).toLocaleString()}`,
        metadata: {
          consultation_id: consultation.id,
          consultation_type: consultation.consultation_type,
          duration: consultation.duration_minutes,
          meeting_link: consultation.meeting_link
        }
      })

    return NextResponse.json({
      success: true,
      consultation,
      message: 'Consultation scheduled successfully'
    })

  } catch (error) {
    console.error('Unhandled error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
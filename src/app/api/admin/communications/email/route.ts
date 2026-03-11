// src/app/api/admin/communications/email/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { to, subject, body: emailBody, customerId, type, consultationId } = body

    // Get current admin user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get customer details if needed
    let customerName = 'Valued Customer'
    if (customerId) {
      const { data: customer } = await supabase
        .from('users')
        .select('full_name, company_name')
        .eq('id', customerId)
        .single()
      
      if (customer) {
        customerName = customer.full_name || customer.company_name || 'Valued Customer'
      }
    }

    const fromEmail = process.env.NODE_ENV === 'production' 
      ? '"Veridian Group" <concierge@veridiangroup.com>'
      : '"Veridian Group" <onboarding@resend.dev>'

    // Handle different email types
    let html = emailBody
    let finalSubject = subject

    if (type === 'consultation_confirmation' && consultationId) {
      // Get consultation details for confirmation email
      const { data: consultation } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .single()

      if (consultation) {
        finalSubject = `Your Consultation with Veridian Group is Confirmed - ${new Date(consultation.consultation_date).toLocaleDateString()}`
        // Use your existing sendConsultationConfirmation template
        const { sendConsultationConfirmation } = await import('@/lib/email/service')
        await sendConsultationConfirmation({
          id: consultation.id,
          customer_name: consultation.customer_name,
          customer_email: consultation.customer_email,
          consultation_date: consultation.consultation_date,
          consultation_type: consultation.consultation_type,
          meeting_link: consultation.meeting_link,
          notes: consultation.notes
        })
        return NextResponse.json({ success: true })
      }
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: finalSubject,
      html: html.replace(/\n/g, '<br/>')
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    // Log the communication
    if (customerId) {
      await supabase
        .from('communications_log')
        .insert({
          user_id: customerId,
          admin_id: user.id,
          type: 'email',
          subject: finalSubject,
          content: emailBody,
          metadata: {
            to,
            sent_at: new Date().toISOString()
          }
        })
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      to,
      subject: finalSubject
    })

  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
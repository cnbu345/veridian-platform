// src/app/api/admin/enterprise/leads/send-welcome/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { Loader } from 'lucide-react'
import { getEnterpriseLeadWelcomeEmail } from '@/lib/email/templates/enterprise-lead-welcome'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { leadId, contact_name, contact_email, company_name } = body

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin, full_name, email')
      .eq('id', user.id)
      .single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get sales rep info (could be the current admin or a default)
    const salesRepName = adminCheck.full_name || 'Enterprise Sales Team'
    const salesRepEmail = adminCheck.email || 'enterprise@veridiangroup.com'

    // Generate email content
    const { subject, html, text } = getEnterpriseLeadWelcomeEmail({
      contact_name,
      company_name,
      sales_rep_name: salesRepName,
      sales_rep_email: salesRepEmail
    })

    // Send email via Resend
    const fromEmail = process.env.NODE_ENV === 'production' 
      ? '"Veridian Group Enterprise" <enterprise@veridiangroup.com>'
      : '"Veridian Group" <onboarding@resend.dev>'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [contact_email],
      subject,
      html,
      text
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    // Update lead status to 'contacted' if needed
    if (leadId) {
        await supabase
            .from('enterprise_leads')
            .update({ 
            status: 'contacted',
            welcome_email_sent: true,
            welcome_email_sent_at: new Date().toISOString(),
            last_contacted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
            })
            .eq('id', leadId)
    }

    // Log the communication
    await supabase
      .from('communications_log')
      .insert({
        user_id: null, // This is a lead, not a user yet
        admin_id: user.id,
        type: 'email',
        subject,
        content: text,
        metadata: {
          lead_id: leadId,
          to: contact_email,
          company_name,
          sent_at: new Date().toISOString()
        }
      })

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      message: 'Welcome email sent successfully'
    })

  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
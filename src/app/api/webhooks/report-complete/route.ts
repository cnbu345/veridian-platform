// src/app/api/webhooks/report-complete/route.ts
// Webhook for Async Completion
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { reportId, userId, status, content, error } = await req.json()

    // Verify webhook secret (optional but recommended)
    const webhookSecret = req.headers.get('x-webhook-secret')
    if (webhookSecret !== process.env.REPORT_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    if (status === 'completed') {
      // Update report with completed content
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          report_content: content,
          status: 'ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Get user email for notification
      const { data: user } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single()

      // Send email notification
      if (user?.email) {
        await resend.emails.send({
          from: 'Veridian Group <reports@veridiangroup.com>',
          to: user.email,
          subject: 'Your Regulatory Intelligence Report is Ready',
          html: `
            <h1>Your Report is Ready</h1>
            <p>Hello ${user.full_name || 'there'},</p>
            <p>Your regulatory intelligence report has been generated and is ready to view.</p>
            <p><a href="${process.env.NEXT_PUBLIC_URL}/report/${reportId}">View Your Report</a></p>
            <p>Thank you for choosing Veridian Group.</p>
          `
        })
      }

      // Log completion
      await supabase
        .from('audit_log')
        .insert({
          user_id: userId,
          action: 'report_completed_webhook',
          entity_type: 'report',
          entity_id: reportId,
          metadata: { status: 'completed' }
        })

    } else if (status === 'failed') {
      // Update report with failure status
      await supabase
        .from('reports')
        .update({
          status: 'failed',
          report_content: { error },
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .eq('user_id', userId)

      // Notify admins
      const { data: admins } = await supabase
        .from('users')
        .select('email')
        .eq('is_admin', true)

      if (admins?.length) {
        await resend.emails.send({
          from: 'Veridian Group <system@veridiangroup.com>',
          to: admins.map(a => a.email),
          subject: '⚠️ Report Generation Failed',
          html: `
            <h1>Report Generation Failed</h1>
            <p><strong>Report ID:</strong> ${reportId}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Error:</strong> ${error}</p>
            <p>Please investigate in the admin dashboard.</p>
          `
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Optional: Handle webhook verification for Stripe-like webhooks
export async function GET(req: Request) {
  return NextResponse.json({ message: 'Webhook endpoint ready' })
}
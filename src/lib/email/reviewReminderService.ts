// src/lib/email/reviewReminderService.ts
// Email service for data review reminders (Admin Dashboard)

import { Resend } from 'resend'
import { getReviewReminderEmailHTML, getReviewReminderEmailText } from './templates/reviewReminderTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ReviewReminderEmailData {
  to: string
  name?: string
  stateCode: string
  dueDate: string
  notes?: string
}

export async function sendReviewReminderEmail(data: ReviewReminderEmailData) {
  try {
    const fromEmail = process.env.NODE_ENV === 'production' 
      ? '"Veridian Group - Data Team" <compliance@veridiangroup.com>'
      : '"Veridian Group" <onboarding@resend.dev>'

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/data/verification`

    const html = getReviewReminderEmailHTML({
      name: data.name,
      stateCode: data.stateCode,
      dueDate: data.dueDate,
      notes: data.notes,
      dashboardUrl
    })

    const text = getReviewReminderEmailText({
      name: data.name,
      stateCode: data.stateCode,
      dueDate: data.dueDate,
      notes: data.notes,
      dashboardUrl
    })

    const result = await resend.emails.send({
      from: fromEmail,
      to: [data.to],
      subject: `Data Review Reminder: ${data.stateCode}`,
      html: html,
      text: text
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      throw result.error
    }

    console.log(`✅ Review reminder email sent to ${data.to} for ${data.stateCode}`, result.data)
    return result.data

  } catch (error) {
    console.error('Failed to send review reminder email:', error)
    throw error
  }
}
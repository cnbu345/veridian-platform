// src/app/api/admin/send-review-reminder/route.ts
import { NextResponse } from 'next/server'
import { sendReviewReminderEmail } from '@/lib/email/reviewReminderService'

export async function POST(request: Request) {
  try {
    const { to, name, stateCode, dueDate, notes } = await request.json()

    if (!to || !stateCode) {
      return NextResponse.json(
        { error: 'Missing required fields: to, stateCode' },
        { status: 400 }
      )
    }

    await sendReviewReminderEmail({
      to,
      name,
      stateCode,
      dueDate,
      notes
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
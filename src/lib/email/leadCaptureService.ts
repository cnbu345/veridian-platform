// src/lib/email/leadCaptureService.ts
// Email service for lead capture (State Dashboard & Comparison Tool)

import { Resend } from 'resend'
import { getLeadCaptureEmailHTML, getLeadCaptureEmailText } from './templates/leadCaptureTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)

interface LeadCaptureEmailData {
  name: string
  email: string
  companyName?: string
  source: string
  interestedStates?: string
}

export async function sendLeadCaptureEmail(data: LeadCaptureEmailData) {
  try {
    const fromEmail = process.env.NODE_ENV === 'production' 
      ? '"Veridian Group" <compliance@veridiangroup.com>'
      : '"Veridian Group" <onboarding@resend.dev>'

    const isComparison = data.source === 'comparison_tool'
    const subject = isComparison 
      ? 'Your State Comparison Report from Veridian Group'
      : 'Your State Licensing Report from Veridian Group'

    const html = getLeadCaptureEmailHTML({
      name: data.name,
      email: data.email,
      companyName: data.companyName,
      source: data.source,
      interestedStates: data.interestedStates
    })

    const text = getLeadCaptureEmailText({
      name: data.name,
      email: data.email,
      companyName: data.companyName,
      source: data.source,
      interestedStates: data.interestedStates
    })

    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to: [data.email],
      subject: subject,
      html: html,
      text: text
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log(`✅ Lead capture email sent to ${data.email}`, result)
    return result

  } catch (error) {
    console.error('Failed to send lead capture email:', error)
    throw error
  }
}
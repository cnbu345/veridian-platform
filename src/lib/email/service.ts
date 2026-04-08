// src/lib/email/service.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailData {
  id: string
  customer_name: string
  customer_email: string
  consultation_date: string
  consultation_type: string
  meeting_link?: string | null
  notes?: string | null
}

// Professional color palette
const colors = {
  navy: '#0A2540',      // Deep navy for headers
  gold: '#B5944B',      // Sophisticated gold for accents
  slate: '#2D3B4F',     // Slate for body text
  lightGray: '#F8FAFC', // Light background
  border: '#E2E8F0',    // Subtle borders
  white: '#FFFFFF'
}

// Base URL for the app - hardcode for now, but can be set in environment
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://veridian-platform.vercel.app'

export async function sendConsultationConfirmation(consultation: EmailData) {
  try {
    const consultationDate = new Date(consultation.consultation_date)
    const formattedDate = consultationDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    const formattedTime = consultationDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    })

    const fromEmail = process.env.NODE_ENV === 'production' 
      ? '"Veridian Group" <reminders@veridiangroup.com>'
      : '"Veridian Group" <onboarding@resend.dev>'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [consultation.customer_email],
      subject: `Veridian Group | Consultation Confirmed - ${formattedDate}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Consultation Confirmed</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: ${colors.lightGray};">
            
            <!-- Main Container -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${colors.lightGray}; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${colors.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
                    
                    <!-- Header with Logo -->
                    <tr>
                      <td style="background: linear-gradient(135deg, ${colors.navy} 0%, #1A3349 100%); padding: 48px 40px; text-align: center;">
                        <!-- Veridian Gold Logo -->
                        <img 
                          src="../../../public/veridian-logo-gold-192X192.png" 
                          alt="Veridian Group" 
                          width="120" 
                          height="120" 
                          style="display: block; margin: 0 auto 24px auto; width: 120px; height: auto;"
                        />
                        <div style="width: 60px; height: 2px; background: ${colors.gold}; margin: 0 auto 24px auto;"></div>
                        <h1 style="color: ${colors.white}; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: -0.5px;">Consultation Confirmed</h1>
                        <p style="color: #95A9C0; margin: 12px 0 0 0; font-size: 16px; font-weight: 300;">Your executive consultation is scheduled</p>
                      </td>
                    </tr>
                    
                    <!-- Content Area -->
                    <tr>
                      <td style="padding: 48px 40px;">
                        
                        <!-- Greeting -->
                        <p style="color: ${colors.navy}; font-size: 18px; font-weight: 400; margin: 0 0 8px 0;">Dear ${consultation.customer_name},</p>
                        <p style="color: ${colors.slate}; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; font-weight: 300;">Thank you for scheduling a consultation with Veridian Group. We look forward to discussing your regulatory intelligence needs.</p>
                        
                        <!-- Date/Time Card - Simple Elegant Border -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid ${colors.border}; border-radius: 8px; margin-bottom: 32px;">
                          <tr>
                            <td style="padding: 32px 24px;">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td align="center" style="padding-bottom: 24px;">
                                    <span style="color: ${colors.navy}; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">Date & Time</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td align="center">
                                    <p style="color: ${colors.navy}; font-size: 22px; font-weight: 400; margin: 0 0 8px 0;">${formattedDate}</p>
                                    <p style="color: ${colors.gold}; font-size: 26px; font-weight: 400; margin: 0 0 16px 0;">${formattedTime}</p>
                                    <p style="color: ${colors.slate}; font-size: 16px; margin: 0; text-transform: capitalize; font-weight: 300;">${consultation.consultation_type} Session</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        ${consultation.notes ? `
                          <!-- Notes Section -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${colors.lightGray}; border-radius: 8px; margin-bottom: 32px;">
                            <tr>
                              <td style="padding: 24px;">
                                <p style="color: ${colors.slate}; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 12px 0; font-weight: 300;">Your Notes</p>
                                <p style="color: ${colors.navy}; font-size: 15px; line-height: 1.6; margin: 0;">${consultation.notes}</p>
                              </td>
                            </tr>
                          </table>
                        ` : ''}
                        
                        ${consultation.meeting_link ? `
                          <!-- Meeting Link Section -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                            <tr>
                              <td align="center">
                                <a href="${consultation.meeting_link}" style="display: inline-block; background-color: ${colors.navy}; color: ${colors.white}; text-decoration: none; padding: 16px 48px; border-radius: 4px; font-weight: 400; font-size: 16px; letter-spacing: 0.5px;">Join Virtual Meeting</a>
                                <p style="color: #718096; font-size: 14px; margin: 16px 0 0 0; font-weight: 300;">The meeting link is also available in your dashboard</p>
                              </td>
                            </tr>
                          </table>
                        ` : `
                          <!-- No Meeting Link Yet -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9F5F0; border-radius: 8px; margin-bottom: 32px;">
                            <tr>
                              <td style="padding: 20px; text-align: center;">
                                <p style="color: ${colors.gold}; margin: 0; font-size: 15px; font-weight: 300;">Your meeting link will be provided 24 hours prior to the consultation.</p>
                              </td>
                            </tr>
                          </table>
                        `}
                        
                        <!-- Divider -->
                        <div style="height: 1px; background-color: ${colors.border}; margin: 32px 0;"></div>
                        
                        <!-- Preparation List - Clean Text -->
                        <p style="color: ${colors.navy}; font-size: 18px; font-weight: 400; margin: 0 0 20px 0;">To prepare, please have:</p>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="20" valign="top" style="padding-bottom: 12px; color: ${colors.gold};">—</td>
                            <td style="padding-bottom: 12px;">
                              <p style="color: ${colors.slate}; margin: 0; font-size: 15px; font-weight: 300;">Your company's regulatory history available</p>
                            </td>
                          </tr>
                          <tr>
                            <td width="20" valign="top" style="padding-bottom: 12px; color: ${colors.gold};">—</td>
                            <td style="padding-bottom: 12px;">
                              <p style="color: ${colors.slate}; margin: 0; font-size: 15px; font-weight: 300;">Specific compliance questions you'd like to address</p>
                            </td>
                          </tr>
                          <tr>
                            <td width="20" valign="top" style="color: ${colors.gold};">—</td>
                            <td>
                              <p style="color: ${colors.slate}; margin: 0; font-size: 15px; font-weight: 300;">A stable internet connection for video conferencing</p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Dashboard Link -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px;">
                          <tr>
                            <td align="center">
                              <a href="${APP_URL}/dashboard/consultations" style="color: ${colors.gold}; text-decoration: none; font-size: 15px; border-bottom: 1px solid ${colors.gold}; padding-bottom: 2px; font-weight: 300;">View in Dashboard →</a>
                            </td>
                          </tr>
                        </table>
                        
                      </td>
                    </tr>
                    
                    <!-- Footer with Blue Logo -->
                    <tr>
                      <td style="background-color: ${colors.lightGray}; padding: 40px; border-top: 1px solid ${colors.border};">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="padding-bottom: 20px;">
                              <img 
                                src="../../../public/veridian-logo-blue-192X192.png" 
                                alt="Veridian Group" 
                                width="80" 
                                height="80" 
                                style="display: block; width: 80px; height: auto; opacity: 0.8;"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding-bottom: 8px;">
                              <p style="color: ${colors.navy}; font-size: 18px; font-weight: 400; margin: 0; letter-spacing: 1px;">VERIDIAN GROUP</p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding-bottom: 16px;">
                              <p style="color: ${colors.slate}; font-size: 14px; margin: 0; font-weight: 300;">Regulatory Intelligence & Compliance</p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <p style="color: #718096; font-size: 13px; margin: 0; font-weight: 300;">
                                Need assistance? 
                                <a href="mailto:concierge@veridiangroup.com" style="color: ${colors.gold}; text-decoration: none; border-bottom: 1px solid ${colors.gold};">concierge@veridiangroup.com</a>
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding-top: 24px;">
                              <p style="color: #A0AEC0; font-size: 12px; margin: 0; font-weight: 300;">© ${new Date().getFullYear()} Veridian Group. All rights reserved.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
            
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to send confirmation:', error)
    throw error
  }
}

export async function sendReminderEmail(consultation: EmailData) {
  try {
    const consultationDate = new Date(consultation.consultation_date)
    const isTomorrow = consultationDate.getDate() === new Date().getDate() + 1
    const isToday = consultationDate.getDate() === new Date().getDate()
    
    const formattedDate = consultationDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    const formattedTime = consultationDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    })

    const fromEmail = process.env.NODE_ENV === 'production' 
      ? '"Veridian Group" <concierge@veridiangroup.com>'
      : '"Veridian Group" <onboarding@resend.dev>'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [consultation.customer_email],
      subject: `Veridian Group | Consultation Reminder${isToday ? ' - Today' : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Consultation Reminder</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: ${colors.lightGray};">
            
            <!-- Main Container -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${colors.lightGray}; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${colors.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
                    
                    <!-- Header with Gold Logo -->
                    <tr>
                      <td style="background: linear-gradient(135deg, ${colors.gold} 0%, #C9A962 100%); padding: 48px 40px; text-align: center;">
                        <img 
                          src="../../../public/veridian-logo-blue-192X192.png" 
                          alt="Veridian Group" 
                          width="100" 
                          height="100" 
                          style="display: block; margin: 0 auto 24px auto; width: 100px; height: auto;"
                        />
                        <h1 style="color: ${colors.white}; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: -0.5px;">
                          ${isToday ? 'Today\'s Consultation' : 'Upcoming Consultation'}
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content Area -->
                    <tr>
                      <td style="padding: 48px 40px;">
                        
                        <!-- Greeting -->
                        <p style="color: ${colors.navy}; font-size: 18px; font-weight: 400; margin: 0 0 8px 0;">Dear ${consultation.customer_name},</p>
                        <p style="color: ${colors.slate}; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; font-weight: 300;">
                          This is a reminder that your consultation with Veridian Group is 
                          <span style="color: ${colors.navy};">${isToday ? 'today' : 'scheduled'}</span>.
                        </p>
                        
                        <!-- Date/Time Card - Simple Elegant -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid ${colors.border}; border-radius: 8px; margin-bottom: 32px;">
                          <tr>
                            <td style="padding: 32px 24px;">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td align="center" style="padding-bottom: 16px;">
                                    <span style="color: ${colors.navy}; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">${formattedDate}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td align="center">
                                    <p style="color: ${colors.gold}; font-size: 32px; font-weight: 400; margin: 0 0 8px 0;">${formattedTime}</p>
                                    <p style="color: ${colors.slate}; font-size: 16px; margin: 0; text-transform: capitalize; font-weight: 300;">${consultation.consultation_type} Session</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        ${consultation.meeting_link ? `
                          <!-- Meeting Link Section -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                            <tr>
                              <td align="center">
                                <a href="${consultation.meeting_link}" style="display: inline-block; background-color: ${colors.navy}; color: ${colors.white}; text-decoration: none; padding: 16px 48px; border-radius: 4px; font-weight: 400; font-size: 16px; letter-spacing: 0.5px;">Join Meeting</a>
                              </td>
                            </tr>
                          </table>
                        ` : ''}
                        
                        <!-- Simple Preparation Note -->
                        <div style="background-color: ${colors.lightGray}; border-radius: 8px; padding: 24px;">
                          <p style="color: ${colors.navy}; font-size: 16px; font-weight: 400; margin: 0 0 12px 0;">Please ensure:</p>
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="20" valign="top" style="padding-bottom: 8px; color: ${colors.gold};">—</td>
                              <td style="padding-bottom: 8px; color: ${colors.slate}; font-size: 14px; font-weight: 300;">Audio and video are working</td>
                            </tr>
                            <tr>
                              <td width="20" valign="top" style="color: ${colors.gold};">—</td>
                              <td style="color: ${colors.slate}; font-size: 14px; font-weight: 300;">You're in a quiet environment</td>
                            </tr>
                          </table>
                        </div>
                        
                        <!-- Dashboard Link -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px;">
                          <tr>
                            <td align="center">
                              <a href="${APP_URL}/dashboard/consultations" style="color: ${colors.gold}; text-decoration: none; font-size: 14px; border-bottom: 1px solid ${colors.gold}; padding-bottom: 2px; font-weight: 300;">Manage in Dashboard →</a>
                            </td>
                          </tr>
                        </table>
                        
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: ${colors.lightGray}; padding: 40px; border-top: 1px solid ${colors.border};">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center">
                              <img 
                                src="../../../public/veridian-logo-blue-192X192.png" 
                                alt="Veridian Group" 
                                width="60" 
                                height="60" 
                                style="display: block; margin: 0 auto 16px auto; width: 60px; height: auto; opacity: 0.7;"
                              />
                              <p style="color: #718096; font-size: 13px; margin: 0; font-weight: 300;">
                                Questions? 
                                <a href="mailto:concierge@veridiangroup.com" style="color: ${colors.gold}; text-decoration: none;">concierge@veridiangroup.com</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
            
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to send reminder:', error)
    throw error
  }
}
// src/lib/email/templates/feedback/csat-survey.ts
interface CSATSurveyProps {
  client_name: string
  company_name: string
  interaction_type: 'support' | 'consultation' | 'report' | 'implementation'
  interaction_date: string
  feedback_link: string
  account_manager?: string
  unsubscribe_link?: string
}

export function getCSATSurveyEmail({
  client_name,
  company_name,
  interaction_type,
  interaction_date,
  feedback_link,
  account_manager = 'Your Account Team',
  unsubscribe_link
}: CSATSurveyProps) {
  
  const getInteractionLabel = () => {
    const labels = {
      support: 'Support Ticket',
      consultation: 'Consultation',
      report: 'Report Delivery',
      implementation: 'Implementation'
    }
    return labels[interaction_type] || interaction_type
  }

  const subject = `Veridian Group: How was your ${getInteractionLabel()} experience?`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Share Your Feedback</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #F8FAFC;">
        
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0A2540 0%, #1A3349 100%); padding: 48px 40px;">
                    <img 
                      src="https://your-domain.com/veridian-logo-gold-192X192.png" 
                      alt="Veridian Group" 
                      width="100" 
                      height="100" 
                      style="display: block; margin-bottom: 24px;"
                    />
                    <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 400;">How did we do?</h1>
                    <p style="color: #95A9C0; margin: 8px 0 0 0; font-size: 16px;">${getInteractionLabel()} - ${interaction_date}</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    
                    <p style="color: #0A2540; font-size: 18px; margin: 0 0 24px 0;">Dear ${client_name},</p>
                    
                    <p style="color: #2D3B4F; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      We recently completed a ${getInteractionLabel().toLowerCase()} for ${company_name}. Your feedback helps us ensure we're meeting your expectations and continuously improving our service.
                    </p>
                    
                    <!-- CSAT Scale -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 32px;">
                          <p style="color: #0A2540; font-size: 18px; font-weight: 500; margin: 0 0 24px 0; text-align: center;">
                            How would you rate your experience?
                          </p>
                          
                          <!-- CSAT Scale 1-5 -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              ${[1,2,3,4,5].map(num => `
                                <td align="center" style="padding: 8px;">
                                  <a href="${feedback_link}?score=${num}" style="display: inline-block; width: 48px; height: 48px; line-height: 48px; text-align: center; background-color: ${num >= 4 ? '#10B981' : num >= 3 ? '#F59E0B' : '#EF4444'}; color: white; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600;">${num}</a>
                                </td>
                              `).join('')}
                            </tr>
                            <tr>
                              <td colspan="5" style="padding-top: 16px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td align="left" style="color: #2D3B4F; font-size: 12px;">Very dissatisfied</td>
                                    <td align="right" style="color: #2D3B4F; font-size: 12px;">Very satisfied</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Additional Comments -->
                    <p style="color: #0A2540; font-size: 16px; font-weight: 500; margin: 0 0 12px 0;">Additional Comments (Optional)</p>
                    <p style="color: #2D3B4F; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                      Your detailed feedback helps us understand what worked well and where we can improve.
                    </p>
                    
                    <!-- Call to Action -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="${feedback_link}" style="display: inline-block; background-color: #0A2540; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 500; font-size: 16px; border: 1px solid #B5944B;">Share Your Feedback</a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Account Manager Note -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; background-color: #F8FAFC; border-radius: 8px;">
                      <tr>
                        <td style="padding: 24px;">
                          <p style="color: #0A2540; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Your Feedback Matters</p>
                          <p style="color: #2D3B4F; font-size: 14px; margin: 0;">
                            ${account_manager} and the team review all feedback personally. Your insights directly influence how we improve our enterprise service.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F8FAFC; padding: 32px; border-top: 1px solid #E2E8F0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="color: #718096; font-size: 13px;">
                          <p style="margin: 0;">Veridian Group • Enterprise Regulatory Intelligence</p>
                          ${unsubscribe_link ? `
                            <p style="margin: 8px 0 0 0;">
                              <a href="${unsubscribe_link}" style="color: #B5944B; text-decoration: none;">Manage preferences</a>
                            </p>
                          ` : ''}
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

  const text = `
Veridian Group: How was your ${getInteractionLabel()} experience?

Dear ${client_name},

We recently completed a ${getInteractionLabel().toLowerCase()} for ${company_name}. Your feedback helps us ensure we're meeting your expectations and continuously improving our service.

Please rate your experience on a scale of 1-5:
1 = Very dissatisfied
5 = Very satisfied

Share your feedback here: ${feedback_link}

Your Feedback Matters:
${account_manager} and the team review all feedback personally. Your insights directly influence how we improve our enterprise service.

---
Veridian Group • Enterprise Regulatory Intelligence
  `

  return { subject, html, text }
}
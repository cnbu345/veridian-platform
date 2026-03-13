// src/lib/email/templates/feedback/nps-survey.ts
interface NPSSurveyProps {
  client_name: string
  company_name: string
  account_manager?: string
  review_period: string
  feedback_link: string
  unsubscribe_link?: string
}

export function getNPSSurveyEmail({
  client_name,
  company_name,
  account_manager = 'Your Account Team',
  review_period,
  feedback_link,
  unsubscribe_link
}: NPSSurveyProps) {
  
  const subject = `Veridian Group: Quarterly Strategic Review - ${review_period}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quarterly Strategic Review</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #F8FAFC;">
        
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0A2540 0%, #1A3349 100%); padding: 48px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <img 
                            src="https://your-domain.com/veridian-logo-gold-192X192.png" 
                            alt="Veridian Group" 
                            width="120" 
                            height="120" 
                            style="display: block; width: 120px; height: auto; margin-bottom: 24px;"
                          />
                          <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 400;">Quarterly Strategic Review</h1>
                          <p style="color: #95A9C0; margin: 8px 0 0 0; font-size: 16px;">${review_period}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    
                    <!-- Greeting -->
                    <p style="color: #0A2540; font-size: 18px; margin: 0 0 24px 0;">Dear ${client_name},</p>
                    
                    <p style="color: #2D3B4F; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      As part of our commitment to providing exceptional service to ${company_name}, we invite you to participate in our quarterly strategic review. Your insights help us ensure our partnership continues to deliver maximum value for your organization.
                    </p>
                    
                    <!-- NPS Scale -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 32px;">
                          <p style="color: #0A2540; font-size: 18px; font-weight: 500; margin: 0 0 24px 0; text-align: center;">
                            How likely are you to recommend Veridian Group to other enterprise leaders?
                          </p>
                          
                          <!-- NPS Scale 0-10 -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              ${[0,1,2,3,4,5,6,7,8,9,10].map(num => `
                                <td align="center" style="padding: 4px;">
                                  <a href="${feedback_link}?score=${num}" style="display: inline-block; width: 32px; height: 32px; line-height: 32px; text-align: center; background-color: ${num >= 9 ? '#10B981' : num >= 7 ? '#F59E0B' : '#EF4444'}; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">${num}</a>
                                </td>
                              `).join('')}
                            </tr>
                            <tr>
                              <td colspan="11" style="padding-top: 16px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td align="left" style="color: #2D3B4F; font-size: 12px;">Not likely</td>
                                    <td align="right" style="color: #2D3B4F; font-size: 12px;">Extremely likely</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Strategic Questions -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                      <tr>
                        <td style="background-color: #F8FAFC; border-radius: 8px; padding: 32px;">
                          <p style="color: #0A2540; font-size: 16px; font-weight: 500; margin: 0 0 16px 0;">Strategic Discussion Points</p>
                          <p style="color: #2D3B4F; font-size: 14px; line-height: 1.6; margin: 0;">
                            Your account manager, ${account_manager}, will follow up to discuss:
                          </p>
                          <ul style="color: #2D3B4F; font-size: 14px; line-height: 1.6; margin: 16px 0 0 0; padding-left: 20px;">
                            <li>Alignment with your current compliance objectives</li>
                            <li>Upcoming regulatory changes affecting your industry</li>
                            <li>Feature adoption and optimization opportunities</li>
                            <li>Strategic roadmap for the coming quarter</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Call to Action -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="${feedback_link}" style="display: inline-block; background-color: #0A2540; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 500; font-size: 16px; border: 1px solid #B5944B;">Provide Strategic Feedback</a>
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
                        <td align="center" style="padding-bottom: 16px;">
                          <img 
                            src="https://your-domain.com/veridian-logo-blue-192X192.png" 
                            alt="Veridian Group" 
                            width="60" 
                            height="60" 
                            style="display: block; width: 60px; height: auto; opacity: 0.8;"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="color: #718096; font-size: 13px;">
                          <p style="margin: 0 0 4px 0;">Veridian Group • Enterprise Regulatory Intelligence</p>
                          <p style="margin: 0;">
                            <a href="${unsubscribe_link}" style="color: #B5944B; text-decoration: none;">Manage preferences</a>
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

  const text = `
Veridian Group: Quarterly Strategic Review - ${review_period}

Dear ${client_name},

As part of our commitment to providing exceptional service to ${company_name}, we invite you to participate in our quarterly strategic review. Your insights help us ensure our partnership continues to deliver maximum value for your organization.

Please provide your feedback here: ${feedback_link}

Strategic Discussion Points:
Your account manager, ${account_manager}, will follow up to discuss:
- Alignment with your current compliance objectives
- Upcoming regulatory changes affecting your industry
- Feature adoption and optimization opportunities
- Strategic roadmap for the coming quarter

---
Veridian Group • Enterprise Regulatory Intelligence
  `

  return { subject, html, text }
}
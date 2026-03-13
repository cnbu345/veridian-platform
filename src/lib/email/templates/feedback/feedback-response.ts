// src/lib/email/templates/feedback/feedback-response.ts
interface FeedbackResponseProps {
  client_name: string
  company_name: string
  feedback_type: string
  feedback_summary: string
  response_message: string
  responder_name: string
  responder_title: string
  action_items?: Array<{
    item: string
    status: 'planned' | 'in_progress' | 'completed'
    estimated_completion?: string
  }>
  ticket_id: string
  feedback_link: string
}

export function getFeedbackResponseEmail({
  client_name,
  company_name,
  feedback_type,
  feedback_summary,
  response_message,
  responder_name,
  responder_title,
  action_items = [],
  ticket_id,
  feedback_link
}: FeedbackResponseProps) {
  
  const subject = `Veridian Group: Response to your ${feedback_type}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Feedback Response</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #F8FAFC;">
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #0A2540 0%, #1A3349 100%); padding: 48px 40px;">
                    <img 
                      src="https://your-domain.com/veridian-logo-gold-192X192.png" 
                      alt="Veridian Group" 
                      width="100" 
                      height="100" 
                      style="display: block; margin-bottom: 24px;"
                    />
                    <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 400;">Response to Your Feedback</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 48px 40px;">
                    
                    <p style="color: #0A2540; font-size: 18px; margin: 0 0 24px 0;">Dear ${client_name},</p>
                    
                    <p style="color: #2D3B4F; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Thank you for your recent ${feedback_type.toLowerCase()}. We value the partnership with ${company_name} and have carefully reviewed your input.
                    </p>
                    
                    <!-- Original Feedback Summary -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border-radius: 8px; margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 24px;">
                          <p style="color: #0A2540; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Your Feedback</p>
                          <p style="color: #2D3B4F; font-size: 14px; font-style: italic; margin: 0;">"${feedback_summary}"</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Response -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 32px;">
                          <p style="color: #0A2540; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Our Response</p>
                          <p style="color: #2D3B4F; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">
                            ${response_message}
                          </p>
                          
                          <!-- Responder Info -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="50" style="padding-right: 16px;">
                                <div style="width: 40px; height: 40px; background-color: #B5944B; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: white; font-size: 18px; font-weight: 500;">${responder_name.charAt(0)}</span>
                                </div>
                              </td>
                              <td>
                                <p style="color: #0A2540; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">${responder_name}</p>
                                <p style="color: #2D3B4F; font-size: 12px; margin: 0;">${responder_title}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Action Items -->
                    ${action_items.length > 0 ? `
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                        <tr>
                          <td style="background-color: #F8FAFC; border-radius: 8px; padding: 24px;">
                            <p style="color: #0A2540; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Next Steps</p>
                            ${action_items.map(item => `
                              <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #E2E8F0;">
                                <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${item.status === 'completed' ? '#10B981' : item.status === 'in_progress' ? '#F59E0B' : '#6B7280'}; flex-shrink: 0;"></div>
                                <div>
                                  <p style="color: #0A2540; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">${item.item}</p>
                                  ${item.estimated_completion ? `
                                    <p style="color: #2D3B4F; font-size: 12px; margin: 0;">Estimated completion: ${item.estimated_completion}</p>
                                  ` : ''}
                                </div>
                              </div>
                            `).join('')}
                          </td>
                        </tr>
                      </table>
                    ` : ''}
                    
                    <!-- Reference -->
                    <p style="color: #718096; font-size: 12px; margin: 0 0 24px 0;">
                      Reference ID: ${ticket_id}
                    </p>
                    
                    <!-- Call to Action -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="${feedback_link}" style="display: inline-block; background-color: #0A2540; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 14px; border: 1px solid #B5944B;">View Full Discussion</a>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #F8FAFC; padding: 32px; border-top: 1px solid #E2E8F0;">
                    <p style="color: #718096; font-size: 13px; margin: 0; text-align: center;">
                      Veridian Group • Enterprise Regulatory Intelligence
                    </p>
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
Veridian Group: Response to your ${feedback_type}

Dear ${client_name},

Thank you for your recent ${feedback_type.toLowerCase()}. We value the partnership with ${company_name} and have carefully reviewed your input.

Your Feedback:
"${feedback_summary}"

Our Response:
${response_message}

${responder_name}
${responder_title}

${action_items.length > 0 ? `Next Steps:\n${action_items.map(item => `• ${item.item}`).join('\n')}` : ''}

Reference ID: ${ticket_id}

View full discussion: ${feedback_link}

---
Veridian Group • Enterprise Regulatory Intelligence
  `

  return { subject, html, text }
}
// src/lib/email/templates/feedback/feedback-acknowledgment.ts
interface FeedbackAcknowledgmentProps {
  client_name: string
  company_name: string
  feedback_type: string
  account_manager: string
  ticket_id: string
  estimated_response?: string
}

export function getFeedbackAcknowledgmentEmail({
  client_name,
  company_name,
  feedback_type,
  account_manager,
  ticket_id,
  estimated_response = 'within 2 business days'
}: FeedbackAcknowledgmentProps) {
  
  const subject = `Veridian Group: We've received your ${feedback_type}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Feedback Received</title>
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
                    <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 400;">Thank You for Your Feedback</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 48px 40px;">
                    
                    <p style="color: #0A2540; font-size: 18px; margin: 0 0 24px 0;">Dear ${client_name},</p>
                    
                    <p style="color: #2D3B4F; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Thank you for taking the time to provide your ${feedback_type}. We value your partnership with Veridian Group and take all client feedback seriously.
                    </p>
                    
                    <!-- Reference Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          <p style="color: #0A2540; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Reference ID</p>
                          <p style="color: #2D3B4F; font-size: 20px; font-family: monospace; margin: 0;">${ticket_id}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Next Steps -->
                    <p style="color: #0A2540; font-size: 16px; font-weight: 500; margin: 0 0 12px 0;">Next Steps:</p>
                    <ul style="color: #2D3B4F; font-size: 14px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
                      <li>Your account manager, ${account_manager}, has been notified</li>
                      <li>We will review your feedback ${estimated_response}</li>
                      <li>You'll receive a detailed response with any action items</li>
                    </ul>
                    
                    <!-- Account Manager Note -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #E2E8F0; border-radius: 8px;">
                      <tr>
                        <td style="padding: 24px;">
                          <p style="color: #0A2540; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Your Account Team</p>
                          <p style="color: #2D3B4F; font-size: 14px; margin: 0;">
                            ${account_manager} and the enterprise team are dedicated to ensuring ${company_name} receives maximum value from our partnership.
                          </p>
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

  return { subject, html, text }
}
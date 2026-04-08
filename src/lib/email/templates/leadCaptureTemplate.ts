// src/lib/email/templates/leadCaptureTemplate.ts
// Email template for lead capture (State Dashboard & Comparison Tool)

interface LeadCaptureEmailProps {
  name: string
  email: string
  companyName?: string
  source: string
  interestedStates?: string
  reportUrl?: string
}

export function getLeadCaptureEmailHTML(props: LeadCaptureEmailProps): string {
  const { name, source, interestedStates, companyName } = props
  
  const isComparison = source === 'comparison_tool'
  const title = isComparison 
    ? 'Your State Comparison Report' 
    : 'Your State Licensing Report'
  
  const content = isComparison
    ? `Here's your comprehensive comparison report for ${interestedStates || 'the states you selected'}.`
    : `Here's your detailed compliance report for ${interestedStates || 'your selected state'}.`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #F8FAFC;">
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
          
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A2540 0%, #1A3349 100%); padding: 48px 40px; text-align: center;">
              <img 
                src="https://www.veridiangroup.com/veridian-logo-gold-192X192.png" 
                alt="Veridian Group" 
                width="100" 
                height="100" 
                style="display: block; margin: 0 auto 24px auto; width: 100px; height: auto;"
              />
              <div style="width: 60px; height: 2px; background: #B5944B; margin: 0 auto 24px auto;"></div>
              <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: -0.5px;">${title}</h1>
              <p style="color: #95A9C0; margin: 12px 0 0 0; font-size: 16px; font-weight: 300;">Thank you for using Veridian Group</p>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 48px 40px;">
              
              <!-- Greeting -->
              <p style="color: #0A2540; font-size: 18px; font-weight: 400; margin: 0 0 8px 0;">Dear ${name || 'Valued Customer'},</p>
              <p style="color: #2D3B4F; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; font-weight: 300;">
                Thank you for using Veridian Group's regulatory intelligence tools. ${content}
              </p>
              
              <!-- Report Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 32px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <div style="background-color: #F8FAFC; border-radius: 12px; padding: 16px 24px;">
                            <p style="color: #0A2540; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px 0;">Your Report</p>
                            <p style="color: #B5944B; font-size: 20px; font-weight: 500; margin: 0;">Ready for Download</p>
                          </div>
                        </td>
                      </tr>
                      ${interestedStates ? `
                      <tr>
                        <td align="center" style="padding-top: 16px;">
                          <p style="color: #2D3B4F; font-size: 14px; margin: 0;">
                            <strong>States Analyzed:</strong> ${interestedStates}
                          </p>
                        </td>
                      </tr>
                      ` : ''}
                      ${companyName ? `
                      <tr>
                        <td align="center">
                          <p style="color: #2D3B4F; font-size: 14px; margin: 8px 0 0 0;">
                            <strong>Company:</strong> ${companyName}
                          </p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <div style="background-color: #F8FAFC; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <h3 style="color: #0A2540; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Next Steps</h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="40" valign="top" style="padding-bottom: 16px;">
                      <div style="width: 28px; height: 28px; background-color: #B5944B; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">1</div>
                    </td>
                    <td style="padding-bottom: 16px;">
                      <p style="color: #2D3B4F; margin: 0; font-size: 15px;"><strong>Review Your Report</strong> - Our team is preparing your personalized compliance report</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="40" valign="top" style="padding-bottom: 16px;">
                      <div style="width: 28px; height: 28px; background-color: #B5944B; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">2</div>
                    </td>
                    <td style="padding-bottom: 16px;">
                      <p style="color: #2D3B4F; margin: 0; font-size: 15px;"><strong>Schedule a Consultation</strong> - Speak with a compliance expert about your specific needs</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="40" valign="top">
                      <div style="width: 28px; height: 28px; background-color: #B5944B; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">3</div>
                    </td>
                    <td>
                      <p style="color: #2D3B4F; margin: 0; font-size: 15px;"><strong>Get Your Full Report</strong> - Receive your comprehensive compliance analysis</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="https://www.veridiangroup.com/pricing?utm_source=${source}&utm_medium=email" 
                       style="display: inline-block; background-color: #B5944B; color: #0A2540; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                      View Pricing & Plans →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="https://www.veridiangroup.com/contact?utm_source=${source}&utm_medium=email" 
                       style="color: #B5944B; text-decoration: none; font-size: 14px; border-bottom: 1px solid #B5944B; padding-bottom: 2px;">
                      Schedule a Free Consultation
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="height: 1px; background-color: #E2E8F0; margin: 24px 0;"></div>
              
              <!-- Trust Badges -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <div style="display: inline-flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
                      <span style="font-size: 12px; color: #718096;"> ✓ Attorney-Verified Data </span>
                      <span style="font-size: 12px; color: #718096;"> ✓ 24-Hour Delivery </span>
                      <span style="font-size: 12px; color: #718096;"> ✓ 30-Day Guarantee </span>
                    </div>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 32px 40px; border-top: 1px solid #E2E8F0; text-align: center;">
              <img 
                src="https://www.veridiangroup.com/veridian-logo-blue-192X192.png" 
                alt="Veridian Group" 
                width="60" 
                height="60" 
                style="display: block; margin: 0 auto 16px auto; width: 60px; height: auto; opacity: 0.7;"
              />
              <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0;">
                Veridian Group — Regulatory Intelligence for Digital Assets
              </p>
              <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
                Questions? <a href="mailto:compliance@veridiangroup.com" style="color: #B5944B; text-decoration: none;">compliance@veridiangroup.com</a>
              </p>
              <p style="color: #A0AEC0; font-size: 11px; margin: 16px 0 0 0;">
                © ${new Date().getFullYear()} Veridian Group, Inc. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>`
}

export function getLeadCaptureEmailText(props: LeadCaptureEmailProps): string {
  const { name, source, interestedStates, companyName } = props
  
  const isComparison = source === 'comparison_tool'
  const title = isComparison ? 'Your State Comparison Report' : 'Your State Licensing Report'
  
  return `
${title}

Dear ${name || 'Valued Customer'},

Thank you for using Veridian Group's regulatory intelligence tools. Your request has been received.

${isComparison ? `Here's your comparison report for ${interestedStates || 'the states you selected'}.` : `Here's your compliance report for ${interestedStates || 'your selected state'}.`}

Next Steps:
1. Our team is preparing your personalized report
2. You'll receive it within 24 hours
3. Schedule a free consultation with our compliance experts

View pricing and plans: https://veridian-platform.vercel.app/pricing

Schedule a consultation: https://veridian-platform.vercel.app/

---
Veridian Group — Regulatory Intelligence for Digital Assets
Questions? Reply to this email or contact compliance@veridiangroup.com
`
}
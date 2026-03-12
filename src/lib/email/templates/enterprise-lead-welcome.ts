// src/lib/email/templates/enterprise-lead-welcome.ts
interface EnterpriseLeadWelcomeProps {
  contact_name: string
  company_name: string
  sales_rep_name?: string
  sales_rep_email?: string
  consultation_link?: string // Optional, if you want to include a link to schedule
}

export function getEnterpriseLeadWelcomeEmail({
  contact_name,
  company_name,
  sales_rep_name = 'Enterprise Sales Team',
  sales_rep_email = 'enterprise@veridiangroup.com'
}: EnterpriseLeadWelcomeProps) {
  
  const subject = `Welcome to Veridian Group, ${contact_name}!`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Veridian Group Enterprise</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #F8FAFC;">
        
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0A2540 0%, #1A3349 100%); padding: 48px 40px; text-align: center;">
                    <img 
                      src="public\veridian-logo-gold-192X192.png" 
                      alt="Veridian Group" 
                      width="120" 
                      height="120" 
                      style="display: block; margin: 0 auto 24px auto; width: 120px; height: auto;"
                    />
                    <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 400;">Welcome to Veridian Group</h1>
                    <p style="color: #95A9C0; margin: 12px 0 0 0; font-size: 16px;">Enterprise Regulatory Intelligence</p>
                  </td>
                </tr>
                
                <!-- Content Area -->
                <tr>
                  <td style="padding: 48px 40px;">
                    
                    <!-- Greeting -->
                    <p style="color: #0A2540; font-size: 18px; font-weight: 400; margin: 0 0 8px 0;">Dear ${contact_name},</p>
                    <p style="color: #2D3B4F; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                      Thank you for your interest in Veridian Group's enterprise solutions. We're excited to learn more about ${company_name}'s compliance needs and explore how we can support your regulatory intelligence requirements.
                    </p>
                    
                    <!-- Next Steps Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 32px;">
                      <tr>
                        <td style="padding: 32px 24px;">
                          <h2 style="color: #0A2540; font-size: 20px; font-weight: 500; margin: 0 0 24px 0; text-align: center;">Next Steps</h2>
                          
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="40" valign="top" style="padding-bottom: 20px;">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #B5944B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px;">1</span>
                              </td>
                              <td style="padding-bottom: 20px;">
                                <p style="color: #0A2540; font-size: 16px; font-weight: 500; margin: 0 0 4px 0;">Discovery Call</p>
                                <p style="color: #2D3B4F; font-size: 14px; margin: 0;">Your dedicated sales representative will reach out within 24 hours to schedule a discovery call</p>
                              </td>
                            </tr>
                            <tr>
                              <td width="40" valign="top" style="padding-bottom: 20px;">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #B5944B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px;">2</span>
                              </td>
                              <td style="padding-bottom: 20px;">
                                <p style="color: #0A2540; font-size: 16px; font-weight: 500; margin: 0 0 4px 0;">Custom Package Design</p>
                                <p style="color: #2D3B4F; font-size: 14px; margin: 0;">After understanding your needs, our team will create a tailored enterprise solution</p>
                              </td>
                            </tr>
                            <tr>
                              <td width="40" valign="top">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #B5944B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px;">3</span>
                              </td>
                              <td>
                                <p style="color: #0A2540; font-size: 16px; font-weight: 500; margin: 0 0 4px 0;">Review & Approve</p>
                                <p style="color: #2D3B4F; font-size: 14px; margin: 0;">We'll present a detailed quote for your review and approval</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Sales Rep Contact Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border-radius: 8px; margin-bottom: 32px;">
                        <tr>
                            <td style="padding: 32px 24px; text-align: center;">
                            <h2 style="color: #0A2540; font-size: 20px; font-weight: 500; margin: 0 0 16px 0;">Your Enterprise Sales Representative</h2>
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0A2540, #1A3349); border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; line-height: 1;">
                                <span style="color: white; font-size: 36px; font-weight: 300; display: block; text-align: center; line-height: 1;">${sales_rep_name.charAt(0)}</span>
                            </div>
                            <p style="color: #0A2540; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">${sales_rep_name}</p>
                            <p style="color: #2D3B4F; font-size: 14px; margin: 0 0 16px 0;">Enterprise Sales</p>
                            <p style="color: #2D3B4F; font-size: 14px; margin: 0;">
                                <a href="mailto:${sales_rep_email}" style="color: #B5944B; text-decoration: none; font-weight: 500;">${sales_rep_email}</a>
                            </p>
                            <p style="color: #2D3B4F; font-size: 14px; margin: 16px 0 0 0;">
                                I'll reach out shortly to schedule a time to discuss your needs. In the meantime, feel free to reply with any questions.
                            </p>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- What to Expect -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <h3 style="color: #0A2540; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">What to Expect:</h3>
                          <ul style="color: #2D3B4F; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0;">
                            <li>Personal follow-up within 24 hours</li>
                            <li>Discovery call to understand your compliance challenges</li>
                            <li>Custom solution tailored to your specific needs</li>
                            <li>Transparent pricing with flexible enterprise terms</li>
                          </ul>
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
                        <td align="center">
                          <img 
                            src="https://your-domain.com/veridian-logo-blue-192X192.png" 
                            alt="Veridian Group" 
                            width="60" 
                            height="60" 
                            style="display: block; margin: 0 auto 16px auto; width: 60px; height: auto; opacity: 0.8;"
                          />
                          <p style="color: #718096; font-size: 13px; margin: 0;">
                            Veridian Group • Enterprise Regulatory Intelligence
                          </p>
                          <p style="color: #A0AEC0; font-size: 12px; margin: 16px 0 0 0;">
                            © ${new Date().getFullYear()} Veridian Group. All rights reserved.
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
Welcome to Veridian Group, ${contact_name}!

Thank you for your interest in Veridian Group's enterprise solutions. We're excited to learn more about ${company_name}'s compliance needs and explore how we can support your regulatory intelligence requirements.

NEXT STEPS:

1. Discovery Call - Your dedicated sales representative will reach out within 24 hours to schedule a discovery call
2. Custom Package Design - After understanding your needs, our team will create a tailored enterprise solution
3. Review & Approve - We'll present a detailed quote for your review and approval

Your Enterprise Sales Representative:
${sales_rep_name}
${sales_rep_email}

I'll reach out shortly to schedule a time to discuss your needs. In the meantime, feel free to reply with any questions.

What to Expect:
- Personal follow-up within 24 hours
- Discovery call to understand your compliance challenges
- Custom solution tailored to your specific needs
- Transparent pricing with flexible enterprise terms

---
Veridian Group • Enterprise Regulatory Intelligence
  `

  return { subject, html, text }
}
// src/app/api/admin/enterprise/quotes/send/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      quoteNumber, 
      customerEmail, 
      customerName, 
      companyName, 
      package: pkg, 
      expiresAt, 
      notes 
    } = body

    const fromEmail = process.env.NODE_ENV === 'production' 
      ? '"Veridian Group" <enterprise@veridiangroup.com>'
      : '"Veridian Group" <onboarding@resend.dev>'

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: `Your Enterprise Quote from Veridian Group - ${quoteNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enterprise Quote</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #F8FAFC;">
            
            <!-- Main Container -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.05);">
                    
                    <!-- Header with Logo -->
                    <tr>
                      <td style="background-color: #0A2540; padding: 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="left">
                              <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 400;">Enterprise Quote</h1>
                              <p style="color: #95A9C0; margin: 8px 0 0 0; font-size: 16px;">${quoteNumber}</p>
                            </td>
                            <td align="right">
                              <img 
                                src="https://your-domain.com/veridian-logo-gold-192X192.png" 
                                alt="Veridian Group" 
                                width="80" 
                                height="80" 
                                style="display: block; width: 80px; height: auto;"
                              />
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        
                        <!-- Greeting -->
                        <p style="color: #0A2540; font-size: 18px; margin: 0 0 8px 0;">Dear ${customerName},</p>
                        <p style="color: #2D3B4F; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                          Thank you for your interest in Veridian Group's enterprise solutions. Below is your custom quote based on our discussion.
                        </p>
                        
                        <!-- Quote Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 32px;">
                          <tr>
                            <td style="padding: 24px;">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td align="center" style="padding-bottom: 24px;">
                                    <span style="color: #0A2540; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Quote Summary</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                      <tr>
                                        <td style="padding: 8px 0;">
                                          <span style="color: #2D3B4F; font-size: 14px;">Package:</span>
                                        </td>
                                        <td align="right" style="padding: 8px 0;">
                                          <span style="color: #0A2540; font-size: 14px; font-weight: 600;">${pkg.tierName}</span>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="padding: 8px 0;">
                                          <span style="color: #2D3B4F; font-size: 14px;">Base Price:</span>
                                        </td>
                                        <td align="right" style="padding: 8px 0;">
                                          <span style="color: #0A2540; font-size: 14px;">$${pkg.basePrice.toLocaleString()}</span>
                                        </td>
                                      </tr>
                                      ${pkg.addOns.map((addOn: any) => `
                                        <tr>
                                          <td style="padding: 8px 0;">
                                            <span style="color: #2D3B4F; font-size: 14px;">${addOn.name} x${addOn.quantity}:</span>
                                          </td>
                                          <td align="right" style="padding: 8px 0;">
                                            <span style="color: #0A2540; font-size: 14px;">$${(addOn.price * addOn.quantity).toLocaleString()}</span>
                                          </td>
                                        </tr>
                                      `).join('')}
                                      <tr>
                                        <td colspan="2" style="padding: 16px 0 8px 0; border-bottom: 1px solid #E2E8F0;"></td>
                                      </tr>
                                      <tr>
                                        <td style="padding: 16px 0 8px 0;">
                                          <span style="color: #2D3B4F; font-size: 14px;">Subtotal:</span>
                                        </td>
                                        <td align="right" style="padding: 16px 0 8px 0;">
                                          <span style="color: #0A2540; font-size: 14px; font-weight: 600;">$${pkg.subtotal.toLocaleString()}</span>
                                        </td>
                                      </tr>
                                      ${pkg.discountPercent > 0 ? `
                                        <tr>
                                          <td style="padding: 8px 0;">
                                            <span style="color: #2D3B4F; font-size: 14px;">Discount (${pkg.discountPercent}%):</span>
                                          </td>
                                          <td align="right" style="padding: 8px 0;">
                                            <span style="color: #10B981; font-size: 14px;">-$${Math.round(pkg.subtotal * pkg.discountPercent / 100).toLocaleString()}</span>
                                          </td>
                                        </tr>
                                      ` : ''}
                                      ${pkg.discountAmount > 0 ? `
                                        <tr>
                                          <td style="padding: 8px 0;">
                                            <span style="color: #2D3B4F; font-size: 14px;">Discount:</span>
                                          </td>
                                          <td align="right" style="padding: 8px 0;">
                                            <span style="color: #10B981; font-size: 14px;">-$${pkg.discountAmount.toLocaleString()}</span>
                                          </td>
                                        </tr>
                                      ` : ''}
                                      <tr>
                                        <td style="padding: 16px 0 8px 0;">
                                          <span style="color: #0A2540; font-size: 18px; font-weight: 700;">Total:</span>
                                        </td>
                                        <td align="right" style="padding: 16px 0 8px 0;">
                                          <span style="color: #B5944B; font-size: 24px; font-weight: 700;">$${pkg.total.toLocaleString()}</span>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Company Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                          <tr>
                            <td width="50%" style="padding-right: 20px;">
                              <p style="color: #0A2540; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Company</p>
                              <p style="color: #2D3B4F; font-size: 14px; margin: 0 0 4px 0;">${companyName}</p>
                              <p style="color: #2D3B4F; font-size: 14px; margin: 0;">${customerName}</p>
                            </td>
                            <td width="50%">
                              <p style="color: #0A2540; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Quote Details</p>
                              <p style="color: #2D3B4F; font-size: 14px; margin: 0 0 4px 0;">Valid until: ${new Date(expiresAt).toLocaleDateString()}</p>
                              <p style="color: #2D3B4F; font-size: 14px; margin: 0;">Prepared by: Enterprise Sales</p>
                            </td>
                          </tr>
                        </table>
                        
                        ${notes ? `
                          <!-- Notes -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border-radius: 8px; margin-bottom: 32px;">
                            <tr>
                              <td style="padding: 20px;">
                                <p style="color: #0A2540; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Notes</p>
                                <p style="color: #2D3B4F; font-size: 14px; margin: 0;">${notes}</p>
                              </td>
                            </tr>
                          </table>
                        ` : ''}
                        
                        <!-- Next Steps -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border-radius: 8px;">
                          <tr>
                            <td style="padding: 24px;">
                              <p style="color: #0A2540; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Next Steps</p>
                              <p style="color: #2D3B4F; font-size: 14px; margin: 0 0 16px 0;">
                                To accept this quote and proceed with implementation, please reply to this email or contact your enterprise sales representative.
                              </p>
                              <p style="color: #B5944B; font-size: 14px; margin: 0;">
                                We look forward to partnering with you!
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
                            <td align="center">
                              <img 
                                src="https://your-domain.com/veridian-logo-gold-192X192.png" 
                                alt="Veridian Group" 
                                width="60" 
                                height="60" 
                                style="display: block; margin: 0 auto 16px auto; width: 60px; height: auto; opacity: 0.8;"
                              />
                              <p style="color: #718096; font-size: 13px; margin: 0; font-weight: 300;">
                                Veridian Group • Regulatory Intelligence & Compliance
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
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    })

  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
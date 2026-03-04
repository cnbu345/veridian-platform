// src/app/api/calendar/oauth2callback/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request: Request) {
  try {
    // Get the code from the URL
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    // Check if there was an error
    if (error) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>Authentication Error</title></head>
          <body style="font-family: sans-serif; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #dc2626;">❌ Authentication Failed</h1>
              <p style="color: #4b5563;">Error: ${error}</p>
              <p style="margin-top: 20px;">
                <a href="/api/calendar/auth" style="background: #B5944B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Try Again</a>
              </p>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    if (!code) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>No Authorization Code</title></head>
          <body style="font-family: sans-serif; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
              <h1 style="color: #dc2626;">❌ No Authorization Code</h1>
              <p>No authorization code was received from Google.</p>
              <p><a href="/api/calendar/auth">Start over</a></p>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    
    // Log the tokens for debugging
    console.log('✅ Authentication successful!')
    console.log('Refresh Token:', tokens.refresh_token)
    console.log('Access Token:', tokens.access_token)

    // Return success page with tokens
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Success - Veridian Group</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              padding: 40px 20px; 
              background: #f8fafc; 
              margin: 0;
            }
            .container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: white; 
              padding: 40px; 
              border-radius: 16px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              border: 1px solid #e2e8f0;
            }
            .success-header {
              background: linear-gradient(135deg, #0A2540 0%, #1A3349 100%);
              margin: -40px -40px 30px -40px;
              padding: 40px;
              border-radius: 16px 16px 0 0;
              text-align: center;
            }
            h1 { 
              color: #B5944B; 
              margin: 0; 
              font-size: 28px; 
              font-weight: 500;
            }
            .subtitle {
              color: #94a3b8;
              margin-top: 8px;
            }
            .token-box { 
              background: #f1f5f9; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              word-break: break-all; 
              border-left: 4px solid #B5944B;
              font-family: monospace;
              font-size: 14px;
            }
            .instruction { 
              background: #0A2540; 
              color: white;
              padding: 24px; 
              border-radius: 8px; 
              margin: 30px 0; 
            }
            .instruction ol { 
              margin: 15px 0 0 20px; 
              color: #94a3b8;
            }
            .instruction li { 
              margin-bottom: 10px; 
            }
            .instruction code {
              background: #1A3349;
              color: #B5944B;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 13px;
            }
            .btn {
              background: #B5944B;
              color: white;
              border: none;
              padding: 12px 30px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 500;
              cursor: pointer;
              text-decoration: none;
              display: inline-block;
              margin-top: 20px;
            }
            .btn:hover {
              background: #9a7c3f;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-header">
              <div class="success-icon">✅</div>
              <h1>Google Calendar Connected!</h1>
              <p class="subtitle">Your Veridian Group app is now authorized to create Google Meet links</p>
            </div>
            
            <div class="instruction">
              <strong style="font-size: 18px; color: #B5944B;">📋 Next Steps:</strong>
              <ol>
                <li>Copy the refresh token below</li>
                <li>Open your <code>.env.local</code> file</li>
                <li>Add this line: <code>GOOGLE_REFRESH_TOKEN=your_token_here</code></li>
                <li>Save the file and restart your server</li>
              </ol>
            </div>
            
            <h3 style="color: #0A2540; margin-bottom: 10px;">🔑 Your Refresh Token:</h3>
            <div class="token-box">${tokens.refresh_token}</div>
            
            <h3 style="color: #0A2540; margin-bottom: 10px;">🔑 Access Token (temporary):</h3>
            <div class="token-box">${tokens.access_token}</div>
            
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B5944B;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Important:</strong> Save your refresh token now! You won't be able to see it again.
              </p>
            </div>
            
            <div style="text-align: center;">
              <a href="/admin/test-calendar" class="btn">Test Your Setup →</a>
            </div>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('Error in OAuth callback:', error)
    
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="font-family: sans-serif; padding: 40px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #dc2626;">❌ Authentication Failed</h1>
            <p style="color: #4b5563; margin-bottom: 20px;">${error.message}</p>
            <p style="background: #f1f5f9; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px;">
              ${error.stack}
            </p>
            <a href="/api/calendar/auth" style="background: #B5944B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
              Try Again
            </a>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}
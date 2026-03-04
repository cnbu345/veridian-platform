// src/app/api/calendar/auth/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // If no code, redirect to Google consent screen
  if (!code) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent' // This forces a refresh token to be returned
    })

    return NextResponse.redirect(authUrl)
  }

  // Exchange code for tokens
  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    // Log the tokens (you'll need to copy these)
    console.log('Refresh Token:', tokens.refresh_token)
    console.log('Access Token:', tokens.access_token)
    
    // Return a page showing the tokens
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Success</title>
          <style>
            body { font-family: monospace; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .token-box { background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; word-break: break-all; }
            .success { color: green; font-weight: bold; }
            .instruction { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">✅ Authentication Successful!</h1>
            
            <div class="instruction">
              <strong>📋 Next Steps:</strong>
              <ol>
                <li>Copy the refresh token below</li>
                <li>Add it to your .env.local file as GOOGLE_REFRESH_TOKEN</li>
                <li>You can close this window</li>
              </ol>
            </div>
            
            <h3>Refresh Token (SAVE THIS):</h3>
            <div class="token-box">${tokens.refresh_token}</div>
            
            <h3>Access Token (temporary):</h3>
            <div class="token-box">${tokens.access_token}</div>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    console.error('Error getting tokens:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
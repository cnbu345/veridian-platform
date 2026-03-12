// src/lib/google/calendar.ts
import { google } from 'googleapis'
import { displayName } from 'react-quill'

// Determine the correct redirect URI based on environment
const getRedirectUri = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://veridian-platform.vercel.app/api/calendar/oauth2callback'
  }
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/oauth2callback'
}

interface ConsultationData {
  customer_name: string
  customer_email: string
  consultation_date: string
  consultation_type: string
  duration_minutes: number
  notes?: string | null
}

// Create authenticated OAuth2 client using refresh token
const getAuthClient = () => {
  console.log('🔄 Creating OAuth2 client...')
  console.log('Environment:', process.env.NODE_ENV)
  
  // Check environment variables
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not set in environment variables')
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET is not set in environment variables')
  }
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('GOOGLE_REFRESH_TOKEN is not set in environment variables. Please complete OAuth flow first.')
  }

  const redirectUri = getRedirectUri()
  console.log('Using redirect URI:', redirectUri)

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  )

  // Set credentials using refresh token
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  })

  console.log('✅ OAuth2 client created successfully')
  return oauth2Client
}

// Generate a unique request ID for Meet
const generateRequestId = () => {
  return `meet-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Format consultation type for calendar
const formatEventSummary = (type: string, name: string) => {
  const typeMap = {
    discovery: '🔍 Discovery Call',
    strategy: '📊 Strategy Session',
    technical: '⚙️ Technical Review',
    compliance: '✅ Compliance Check'
  }
  
  return `${typeMap[type as keyof typeof typeMap] || 'Consultation'}: ${name}`
}

// Main function to create calendar event with Meet link
export async function createCalendarEventWithMeet(consultation: ConsultationData) {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      throw new Error('Google Calendar not configured. Please complete OAuth setup first.')
    }

    // Get authenticated client
    const auth = getAuthClient()
    const calendar = google.calendar({ version: 'v3', auth })

    // Parse consultation date
    const startDateTime = new Date(consultation.consultation_date)
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + consultation.duration_minutes)

    // Format dates for Google Calendar
    const startDateISO = startDateTime.toISOString()
    const endDateISO = endDateTime.toISOString()

    // Create event object
    const event = {
      summary: formatEventSummary(consultation.consultation_type, consultation.customer_name),
      location: 'Google Meet',
      description: `
        Consultation with ${consultation.customer_name}
        
        Type: ${consultation.consultation_type}
        
        ${consultation.notes ? `Notes: ${consultation.notes}` : ''}
      `.trim(),
      start: {
        dateTime: startDateISO,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateISO,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: [
        { email: consultation.customer_email }
      ],
      organizer: {
        displayName: 'Veridian Group'
      },
      conferenceData: {
        createRequest: {
          requestId: generateRequestId(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },  // Email reminder 1 hour before
          { method: 'popup', minutes: 30 },  // Popup reminder 30 minutes before
        ],
      },
    }

    console.log('Creating calendar event:', event.summary)

    // Insert event with conference data (for Meet link)
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,  // This is required to generate Meet link
      sendUpdates: 'all',  // Send email notifications to attendees
    })

    const createdEvent = response.data

    // Extract Meet link from conference data
    let meetLink = null
    if (createdEvent.conferenceData?.entryPoints) {
      const videoEntryPoint = createdEvent.conferenceData.entryPoints.find(
        entry => entry.entryPointType === 'video'
      )
      meetLink = videoEntryPoint?.uri || null
    }

    console.log('Event created successfully. Meet link:', meetLink)

    return {
      success: true,
      calendarEventId: createdEvent.id,
      meetLink,
      htmlLink: createdEvent.htmlLink,  // Link to view in Google Calendar
    }

  } catch (error) {
    console.error('Error creating calendar event:', error)
    
    // Provide helpful error messages
    if (error.message.includes('invalid_grant')) {
      throw new Error('Google authentication expired. Please re-run the OAuth setup.')
    }
    
    throw new Error(`Failed to create calendar event: ${error.message}`)
  }
}

// Optional: Function to update an existing event with Meet link
export async function updateEventWithMeetLink(eventId: string, consultation: ConsultationData) {
  try {
    const auth = getAuthClient()
    const calendar = google.calendar({ version: 'v3', auth })

    const startDateTime = new Date(consultation.consultation_date)
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + consultation.duration_minutes)

    const event = {
      summary: formatEventSummary(consultation.consultation_type, consultation.customer_name),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: [{ email: consultation.customer_email }],
    }

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event,
      sendUpdates: 'all',
    })

    return {
      success: true,
      calendarEventId: response.data.id,
      meetLink: response.data.hangoutLink || null,
    }

  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw new Error(`Failed to update calendar event: ${error.message}`)
  }
}
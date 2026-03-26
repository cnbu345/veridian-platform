// src/lib/health/alert-notifier.ts
import { createClient } from '@/lib/supabase/server'

interface Alert {
  id: string
  severity: string
  service: string
  name: string
  message: string
  timestamp: string
  metric_value?: number
  threshold?: number
  notification_channels: string[]
}

interface ChannelConfig {
  id: string
  type: string
  name: string
  config: any
  enabled: boolean
}

// In-memory cache for sent alerts (in production, use Redis or database table)
const sentAlertsCache = new Map<string, number>()

export async function sendAlertNotifications(alert: Alert) {
  // Check if this alert was sent recently (cooldown)
  const cacheKey = `${alert.name}-${alert.service}`
  const lastSent = sentAlertsCache.get(cacheKey)
  const now = Date.now()
  
  // Default cooldown of 15 minutes if not specified
  const cooldownMs = 15 * 60 * 1000
  
  if (lastSent && (now - lastSent) < cooldownMs) {
    console.log(`[ALERT] Skipping ${alert.name} - cooldown active`)
    return
  }
  
  if (!alert.notification_channels || alert.notification_channels.length === 0) {
    console.log(`[ALERT] No notification channels configured for: ${alert.name}`)
    return
  }
  
  const supabase = await createClient()
  
  // Fetch channel configurations
  const { data: channels, error } = await supabase
    .from('notification_channels')
    .select('*')
    .in('name', alert.notification_channels)
    .eq('enabled', true)
  
  if (error || !channels || channels.length === 0) {
    console.error(`[ALERT] No enabled channels found for: ${alert.name}`)
    return
  }
  
  // Send to each channel
  for (const channel of channels) {
    await sendToChannel(channel, alert)
  }
  
  // Update cache
  sentAlertsCache.set(cacheKey, now)
  
  // Clean old cache entries (keep last 1000)
  if (sentAlertsCache.size > 1000) {
    const oldestKey = sentAlertsCache.keys().next().value
    sentAlertsCache.delete(oldestKey)
  }
}

async function sendToChannel(channel: ChannelConfig, alert: Alert) {
  console.log(`[${channel.type.toUpperCase()}] Sending alert "${alert.name}" to ${channel.name}`)
  
  switch (channel.type) {
    case 'email':
      await sendEmailAlert(channel, alert)
      break
    case 'slack':
      await sendSlackAlert(channel, alert)
      break
    case 'webhook':
      await sendWebhookAlert(channel, alert)
      break
    case 'sms':
      await sendSmsAlert(channel, alert)
      break
    default:
      console.log(`[ALERT] Unknown channel type: ${channel.type}`)
  }
}

async function sendEmailAlert(channel: ChannelConfig, alert: Alert) {
  const emails = channel.config?.emails || []
  if (emails.length === 0) {
    console.log(`[EMAIL] No email addresses configured for ${channel.name}`)
    return
  }
  
  const subject = `[${alert.severity.toUpperCase()}] ${alert.name} - Veridian Health Alert`
  const body = `
Alert: ${alert.name}
Severity: ${alert.severity}
Service: ${alert.service}
Time: ${new Date(alert.timestamp).toLocaleString()}
Message: ${alert.message}
${alert.metric_value ? `Current Value: ${alert.metric_value}` : ''}
${alert.threshold ? `Threshold: ${alert.threshold}` : ''}

View details: ${process.env.NEXT_PUBLIC_APP_URL}/admin/health

---
This is an automated alert from the Veridian Health Monitoring System.
  `
  
  console.log(`[EMAIL] Would send to ${emails.join(', ')}:`)
  console.log(`Subject: ${subject}`)
  console.log(`Body: ${body.substring(0, 200)}...`)
  
  // TODO: Integrate with Resend, SendGrid, or AWS SES
  // Example with Resend:
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     from: 'alerts@veridiangroup.com',
  //     to: emails,
  //     subject,
  //     text: body
  //   })
  // })
}

async function sendSlackAlert(channel: ChannelConfig, alert: Alert) {
  const webhookUrl = channel.config?.webhook_url
  if (!webhookUrl) {
    console.log(`[SLACK] No webhook URL configured for ${channel.name}`)
    return
  }
  
  const color = alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'good'
  
  const payload = {
    channel: channel.config?.channel || '#alerts',
    attachments: [{
      color: color,
      title: alert.name,
      text: alert.message,
      fields: [
        { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
        { title: 'Service', value: alert.service, short: true },
        { title: 'Time', value: new Date(alert.timestamp).toLocaleString(), short: true },
        ...(alert.metric_value ? [{ title: 'Current Value', value: String(alert.metric_value), short: true }] : []),
        ...(alert.threshold ? [{ title: 'Threshold', value: String(alert.threshold), short: true }] : [])
      ],
      actions: [{
        type: 'button',
        text: 'View Dashboard',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/health`
      }],
      footer: 'Veridian Health Monitor',
      ts: Math.floor(new Date(alert.timestamp).getTime() / 1000)
    }]
  }
  
  console.log(`[SLACK] Would send to ${webhookUrl}:`, JSON.stringify(payload, null, 2))
  
  // TODO: Implement actual Slack webhook call
  // try {
  //   await fetch(webhookUrl, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload)
  //   })
  // } catch (error) {
  //   console.error(`[SLACK] Failed to send:`, error)
  // }
}

async function sendWebhookAlert(channel: ChannelConfig, alert: Alert) {
  const webhookUrl = channel.config?.webhook_url
  if (!webhookUrl) {
    console.log(`[WEBHOOK] No URL configured for ${channel.name}`)
    return
  }
  
  const payload = {
    event: 'alert',
    timestamp: new Date().toISOString(),
    alert: {
      id: alert.id,
      name: alert.name,
      severity: alert.severity,
      service: alert.service,
      message: alert.message,
      triggered_at: alert.timestamp,
      metric_value: alert.metric_value,
      threshold: alert.threshold
    },
    links: {
      dashboard: `${process.env.NEXT_PUBLIC_APP_URL}/admin/health`
    }
  }
  
  console.log(`[WEBHOOK] Would send to ${webhookUrl}:`, JSON.stringify(payload, null, 2))
  
  // TODO: Implement actual webhook call
  // try {
  //   await fetch(webhookUrl, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload)
  //   })
  // } catch (error) {
  //   console.error(`[WEBHOOK] Failed to send:`, error)
  // }
}

async function sendSmsAlert(channel: ChannelConfig, alert: Alert) {
  const phoneNumbers = channel.config?.phone_numbers || []
  if (phoneNumbers.length === 0) {
    console.log(`[SMS] No phone numbers configured for ${channel.name}`)
    return
  }
  
  const message = `${alert.severity.toUpperCase()}: ${alert.name} - ${alert.message.substring(0, 100)}`
  
  console.log(`[SMS] Would send to ${phoneNumbers.join(', ')}:`, message)
  
  // TODO: Integrate with Twilio or AWS SNS
  // Example with Twilio:
  // for (const phone of phoneNumbers) {
  //   await client.messages.create({
  //     body: message,
  //     to: phone,
  //     from: process.env.TWILIO_PHONE_NUMBER
  //   })
  // }
}
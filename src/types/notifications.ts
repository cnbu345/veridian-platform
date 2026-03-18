// src/types/notifications.ts
export type NotificationType = 
  | 'support_reply'
  | 'consultation_reminder'
  | 'consultation_scheduled'
  | 'consultation_cancelled'
  | 'report_ready'
  | 'report_failed'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'subscription_updated'
  | 'system_alert'
  | 'welcome'
  | 'ticket_created'
  | 'ticket_updated'
  | 'ticket_resolved'
  | 'ticket_reopened'
  | 'user_registered'
  | 'new_subscription'
  | 'enterprise_lead'
  | 'feedback_received'   
  | 'feedback_response'
  | 'feedback_status_updated'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, any>
  is_read: boolean
  priority: NotificationPriority
  link: string | null
  created_at: string
  expires_at: string | null
  // Joined fields
  users?: {
    full_name: string | null
    email: string
  }
}

export interface NotificationChannel {
  id: string
  type: string
  name: string
  config: Record<string, any>
  enabled: boolean
  created_at: string
}

export interface CreateNotificationInput {
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  priority?: NotificationPriority
  link?: string | null
  expires_at?: string | null
}
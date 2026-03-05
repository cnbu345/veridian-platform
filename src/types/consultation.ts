// src/types/consultation.ts
export type ConsultationType = 'discovery' | 'strategy' | 'technical' | 'compliance' | 'enterprise'

export type ConsultationStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled'

export interface Consultation {
  id: string
  user_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  company_name: string
  consultation_date: string
  duration_minutes: number
  consultation_type: ConsultationType
  status: ConsultationStatus
  notes?: string | null
  converted_to_sale: boolean
  sale_amount?: number | null
  meeting_link?: string | null
  calendar_event_id?: string | null
  cancellation_reason?: string | null
  reminder_sent: boolean
  reminder_sent_at?: string | null
  reschedule_token?: string | null
  meeting_platform?: string | null
  created_at: string
  updated_at: string
  users?: {
    full_name: string
    email: string
  }
}

export interface ConsultationAvailability {
  id: string
  admin_id: string
  day_of_week: number // 0 = Sunday, 1 = Monday, etc.
  start_time: string // Format: "HH:MM:SS"
  end_time: string // Format: "HH:MM:SS"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ConsultationBlock {
  id: string
  admin_id: string
  start_datetime: string
  end_datetime: string
  reason?: string | null
  created_at: string
}
// src/types/support.ts
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TicketCategory = 'billing' | 'technical' | 'consultation' | 'report' | 'other'

export interface SupportTicket {
  id: string
  user_id: string
  ticket_number: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  assigned_to: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  resolved_by: string | null
  // Joined fields
  users?: {
    full_name: string | null
    email: string
    company_name: string | null
    subscription_tier: string
  }
  messages?: SupportMessage[]
}

export interface SupportMessage {
  id: string
  ticket_id: string
  user_id: string
  message: string
  attachments: any[] | null
  is_internal: boolean
  created_at: string
  // Joined fields
  users?: {
    full_name: string | null
    email: string
    is_admin: boolean
  }
}

export interface CreateTicketInput {
  subject: string
  category: TicketCategory
  message: string
}

export interface UpdateTicketInput {
  status?: TicketStatus
  priority?: TicketPriority
  assigned_to?: string | null
}

export interface CreateMessageInput {
  message: string
  is_internal?: boolean
}
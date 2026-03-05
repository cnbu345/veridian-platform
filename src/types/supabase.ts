// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          company_size: string | null
          industry: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'single' | 'quarterly' | 'monthly' | 'enterprise'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          company_size?: string | null
          industry?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'single' | 'quarterly' | 'monthly' | 'enterprise'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          company_size?: string | null
          industry?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'single' | 'quarterly' | 'monthly' | 'enterprise'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      },
      consultations: {
        Row: {
          id: string
          user_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          company_name: string
          consultation_date: string
          duration_minutes: number
          consultation_type: string
          status: string
          notes: string | null
          converted_to_sale: boolean
          sale_amount: number | null
          meeting_link: string | null
          calendar_event_id: string | null
          created_at: string
          updated_at: string
          cancellation_reason: string | null
          reminder_sent: boolean
          reschedule_token: string | null
          meeting_platform: string | null
          reminder_sent_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          company_name: string
          consultation_date: string
          duration_minutes?: number
          consultation_type: string
          status?: string
          notes?: string | null
          converted_to_sale?: boolean
          sale_amount?: number | null
          meeting_link?: string | null
          calendar_event_id?: string | null
          created_at?: string
          updated_at?: string
          cancellation_reason?: string | null
          reminder_sent?: boolean
          reschedule_token?: string | null
          meeting_platform?: string | null
          reminder_sent_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          company_name?: string
          consultation_date?: string
          duration_minutes?: number
          consultation_type?: string
          status?: string
          notes?: string | null
          converted_to_sale?: boolean
          sale_amount?: number | null
          meeting_link?: string | null
          calendar_event_id?: string | null
          created_at?: string
          updated_at?: string
          cancellation_reason?: string | null
          reminder_sent?: boolean
          reschedule_token?: string | null
          meeting_platform?: string | null
          reminder_sent_at?: string | null
        }
      },
      consultation_blocks: {
        Row: {
          id: string
          admin_id: string
          start_datetime: string
          end_datetime: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          start_datetime: string
          end_datetime: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          start_datetime?: string
          end_datetime?: string
          reason?: string | null
          created_at?: string
        }
      },
      consultation_availability: {
        Row: {
          id: string
          admin_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      },
      reports: {
        Row: {
          id: string
          user_id: string
          company_name: string
          industry: string
          city: string
          state: string
          location_tier: 'major' | 'suburban' | 'rural'
          nearest_major_city: string | null
          report_content: Json
          pdf_url: string | null
          stripe_payment_id: string | null
          status: 'pending' | 'generating' | 'ready' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          industry: string
          city: string
          state: string
          location_tier?: 'major' | 'suburban' | 'rural'
          nearest_major_city?: string | null
          report_content: Json
          pdf_url?: string | null
          stripe_payment_id?: string | null
          status?: 'pending' | 'generating' | 'ready' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          industry?: string
          city?: string
          state?: string
          location_tier?: 'major' | 'suburban' | 'rural'
          nearest_major_city?: string | null
          report_content?: Json
          pdf_url?: string | null
          stripe_payment_id?: string | null
          status?: 'pending' | 'generating' | 'ready' | 'failed'
          created_at?: string
          updated_at?: string
        }
      },
      state_regulations: {
        Row: {
          state_code: string
          state_name: string
          crypto_friendly: 'friendly' | 'moderate' | 'strict' | 'unknown'
          money_transmitter: string
          tax_treatment: string
          notes: string
          resources: string[] | null
          last_updated: string
        }
        Insert: {
          state_code: string
          state_name: string
          crypto_friendly?: 'friendly' | 'moderate' | 'strict' | 'unknown'
          money_transmitter?: string
          tax_treatment?: string
          notes?: string
          resources?: string[] | null
          last_updated?: string
        }
        Update: {
          state_code?: string
          state_name?: string
          crypto_friendly?: 'friendly' | 'moderate' | 'strict' | 'unknown'
          money_transmitter?: string
          tax_treatment?: string
          notes?: string
          resources?: string[] | null
          last_updated?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
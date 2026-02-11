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
          subscription_tier: string
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          subscription_tier?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          subscription_tier?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          company_name: string
          industry: string
          city: string
          state: string
          location_tier: string
          nearest_major_city: string | null
          report_content: Json
          pdf_url: string | null
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          industry: string
          city: string
          state: string
          location_tier: string
          nearest_major_city?: string | null
          report_content: Json
          pdf_url?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          industry?: string
          city?: string
          state?: string
          location_tier?: string
          nearest_major_city?: string | null
          report_content?: Json
          pdf_url?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
      }
      state_regulations: {
        Row: {
          state_code: string
          state_name: string
          crypto_regulations: string | null
          tax_treatment: string | null
          resources: string[] | null
          updated_at: string
        }
        Insert: {
          state_code: string
          state_name: string
          crypto_regulations?: string | null
          tax_treatment?: string | null
          resources?: string[] | null
          updated_at?: string
        }
        Update: {
          state_code?: string
          state_name?: string
          crypto_regulations?: string | null
          tax_treatment?: string | null
          resources?: string[] | null
          updated_at?: string
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
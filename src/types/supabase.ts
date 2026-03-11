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
      },
        notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json
          is_read: boolean
          priority: string
          link: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json
          is_read?: boolean
          priority?: string
          link?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json
          is_read?: boolean
          priority?: string
          link?: string | null
          created_at?: string
          expires_at?: string | null
        }
      },
      support_tickets: {
        Row: {
          id: string
          user_id: string
          ticket_number: string
          subject: string
          status: string
          priority: string
          category: string
          assigned_to: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          ticket_number: string
          subject: string
          status?: string
          priority?: string
          category?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          ticket_number?: string
          subject?: string
          status?: string
          priority?: string
          category?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
      },
      support_messages: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          message: string
          attachments: Json | null
          is_internal: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          message: string
          attachments?: Json | null
          is_internal?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          message?: string
          attachments?: Json | null
          is_internal?: boolean
          created_at?: string
        }
      },
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      },
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image: string | null
          author_id: string | null
          category_id: string | null
          status: string
          published_at: string | null
          views: number
          read_time: number | null
          tags: string[] | null
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string | null
          is_featured: boolean
          allow_comments: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          author_id?: string | null
          category_id?: string | null
          status?: string
          published_at?: string | null
          views?: number
          read_time?: number | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          is_featured?: boolean
          allow_comments?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          author_id?: string | null
          category_id?: string | null
          status?: string
          published_at?: string | null
          views?: number
          read_time?: number | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          is_featured?: boolean
          allow_comments?: boolean
          created_at?: string
          updated_at?: string
        }
      },
      blog_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string | null
          author_name: string | null
          author_email: string | null
          content: string
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id?: string | null
          author_name?: string | null
          author_email?: string | null
          content: string
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string | null
          author_name?: string | null
          author_email?: string | null
          content?: string
          is_approved?: boolean
          created_at?: string
        }
      },
      customer_feedback: {
        Row: {
          id: string
          user_id: string
          feedback_type: 'nps' | 'csat' | 'general' | 'feature_request' | 'bug_report' | 'support'
          rating: number | null
          comment: string | null
          source: 'email' | 'in_app' | 'support_ticket' | 'consultation' | 'survey' | 'api'
          status: 'new' | 'reviewed' | 'in_progress' | 'actioned' | 'archived'
          priority: 'low' | 'medium' | 'high' | 'critical'
          category: string | null
          tags: string[] | null
          assigned_to: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          actioned_at: string | null
          action_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          feedback_type: 'nps' | 'csat' | 'general' | 'feature_request' | 'bug_report' | 'support'
          rating?: number | null
          comment?: string | null
          source?: 'email' | 'in_app' | 'support_ticket' | 'consultation' | 'survey' | 'api'
          status?: 'new' | 'reviewed' | 'in_progress' | 'actioned' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          category?: string | null
          tags?: string[] | null
          assigned_to?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          actioned_at?: string | null
          action_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          feedback_type?: 'nps' | 'csat' | 'general' | 'feature_request' | 'bug_report' | 'support'
          rating?: number | null
          comment?: string | null
          source?: 'email' | 'in_app' | 'support_ticket' | 'consultation' | 'survey' | 'api'
          status?: 'new' | 'reviewed' | 'in_progress' | 'actioned' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          category?: string | null
          tags?: string[] | null
          assigned_to?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          actioned_at?: string | null
          action_notes?: string | null
        }
      },
      customer_health: {
        Row: {
          id: string
          user_id: string
          health_score: number
          risk_level: 'healthy' | 'moderate' | 'at_risk'
          last_login: string
          report_count: number
          support_tickets: number
          nps_score: number | null
          csat_score: number | null
          churn_probability: number
          expansion_opportunity: string[] | null
          notes: string | null
          updated_at: string
          last_feedback_date: string | null
          feedback_trend: 'improving' | 'declining' | 'stable' | null
          feature_requests: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          health_score: number
          risk_level: 'healthy' | 'moderate' | 'at_risk'
          last_login: string
          report_count?: number
          support_tickets?: number
          nps_score?: number | null
          csat_score?: number | null
          churn_probability: number
          expansion_opportunity?: string[] | null
          notes?: string | null
          updated_at?: string
          last_feedback_date: string | null
          feedback_trend: 'improving' | 'declining' | 'stable' | null
          feature_requests: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          health_score?: number
          risk_level?: 'healthy' | 'moderate' | 'at_risk'
          last_login?: string
          report_count?: number
          support_tickets?: number
          nps_score?: number | null
          csat_score?: number | null
          churn_probability?: number
          expansion_opportunity?: string[] | null
          notes?: string | null
          updated_at?: string
          last_feedback_date: string | null
          feedback_trend: 'improving' | 'declining' | 'stable' | null
          feature_requests: string[] | null
        }
      }
      user_activity: {
        Row: {
          id: string
          email: string
          company_name: string | null
          role: string
          is_admin: boolean
          signup_date: string
          last_login: string | null
          report_count: number
          payment_count: number
          last_report_date: string | null
        }
        Insert: {} // Read-only view
        Update: {} // Read-only view
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          tier_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
          is_founder: boolean
          founder_code_id: string | null
          metadata: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          is_founder?: boolean
          founder_code_id?: string | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          is_founder?: boolean
          founder_code_id?: string | null
          metadata?: any | null
          created_at?: string
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
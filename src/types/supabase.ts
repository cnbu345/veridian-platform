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
          template_id: string | null
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
          template_id: string | null
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
          template_id: string | null
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
        s: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Jsnotificationon
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
      },
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
      },
      enterprise_leads: {
        Row: {
          id: string
          company_name: string
          contact_name: string
          contact_email: string
          contact_phone: string | null
          company_size: string | null
          annual_revenue: string | null
          current_compliance_needs: string[] | null
          message: string | null
          source: string
          status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'closed_won' | 'closed_lost'
          assigned_to: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          contact_name: string
          contact_email: string
          contact_phone?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          current_compliance_needs?: string[] | null
          message?: string | null
          source?: string
          status?: string
          assigned_to?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          contact_name?: string
          contact_email?: string
          contact_phone?: string | null
          company_size?: string | null
          annual_revenue?: string | null
          current_compliance_needs?: string[] | null
          message?: string | null
          source?: string
          status?: string
          assigned_to?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      },
      enterprise_quotes: {
        Row: {
          id: string
          lead_id: string | null
          quote_number: string
          customer_id: string | null
          customer_email: string
          customer_name: string
          company_name: string
          tier_id: string | null
          tier_name: string
          base_price: number
          add_ons: Json
          add_ons_total: number
          custom_discount_percent: number
          custom_discount_amount: number
          custom_adjustment_reason: string | null
          subtotal: number
          total: number
          quote_data: Json
          quote_pdf_url: string | null
          version: number
          expires_at: string
          status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'converted'
          sent_at: string | null
          viewed_at: string | null
          approved_at: string | null
          stripe_payment_link: string | null
          stripe_payment_intent_id: string | null
          payment_status: string
          paid_at: string | null
          approval_token: string | null
          approval_token_expires_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          quote_number: string
          customer_id?: string | null
          customer_email: string
          customer_name: string
          company_name: string
          tier_id?: string | null
          tier_name: string
          base_price: number
          add_ons?: Json
          add_ons_total?: number
          custom_discount_percent?: number
          custom_discount_amount?: number
          custom_adjustment_reason?: string | null
          subtotal: number
          total: number
          quote_data: Json
          quote_pdf_url?: string | null
          version?: number
          expires_at: string
          status?: string
          sent_at?: string | null
          viewed_at?: string | null
          approved_at?: string | null
          stripe_payment_link?: string | null
          stripe_payment_intent_id?: string | null
          payment_status?: string
          paid_at?: string | null
          approval_token?: string | null
          approval_token_expires_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          quote_number?: string
          customer_id?: string | null
          customer_email?: string
          customer_name?: string
          company_name?: string
          tier_id?: string | null
          tier_name?: string
          base_price?: number
          add_ons?: Json
          add_ons_total?: number
          custom_discount_percent?: number
          custom_discount_amount?: number
          custom_adjustment_reason?: string | null
          subtotal?: number
          total?: number
          quote_data?: Json
          quote_pdf_url?: string | null
          version?: number
          expires_at?: string
          status?: string
          sent_at?: string | null
          viewed_at?: string | null
          approved_at?: string | null
          stripe_payment_link?: string | null
          stripe_payment_intent_id?: string | null
          payment_status?: string
          paid_at?: string | null
          approval_token?: string | null
          approval_token_expires_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      },
      enterprise_add_ons: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          price_type: 'one-time' | 'monthly' | 'yearly'
          category: string | null
          features: string[] | null
          active: boolean
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          price_type?: string
          category?: string | null
          features?: string[] | null
          active?: boolean
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          price_type?: string
          category?: string | null
          features?: string[] | null
          active?: boolean
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
      },
      feedback_type: {
        Row: {
          id: string
          name: string
          description: string | null
          category: 'nps' | 'csat' | 'feature_request' | 'support' | 'general' | 'account_review'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: 'nps' | 'csat' | 'feature_request' | 'support' | 'general' | 'account_review'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: 'nps' | 'csat' | 'feature_request' | 'support' | 'general' | 'account_review'
          is_active?: boolean
          created_at?: string
        }
      },
      feedback_submissions: {
        Row: {
          id: string
          user_id: string
          feedback_type_id: string
          nps_score: number | null
          csat_score: number | null
          comments: string | null
          source: 'email' | 'dashboard' | 'api' | 'automated'
          status: 'pending' | 'reviewed' | 'actioned' | 'archived'
          priority: 'low' | 'medium' | 'high' | 'critical'
          assigned_to: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          feedback_type_id: string
          nps_score?: number | null
          csat_score?: number | null
          comments?: string | null
          source?: 'email' | 'dashboard' | 'api' | 'automated'
          status?: 'pending' | 'reviewed' | 'actioned' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          assigned_to?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          feedback_type_id?: string
          nps_score?: number | null
          csat_score?: number | null
          comments?: string | null
          source?: 'email' | 'dashboard' | 'api' | 'automated'
          status?: 'pending' | 'reviewed' | 'actioned' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          assigned_to?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      },
      feedback_responses: {
        Row: {
          id: string
          feedback_id: string
          responder_id: string | null
          responder_type: 'admin' | 'system' | 'ai'
          message: string
          is_internal: boolean
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          responder_id?: string | null
          responder_type: 'admin' | 'system' | 'ai'
          message: string
          is_internal?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          feedback_id?: string
          responder_id?: string | null
          responder_type?: 'admin' | 'system' | 'ai'
          message?: string
          is_internal?: boolean
          created_at?: string
        }
      },
      nps_survey_schedule: {
        Row: {
          id: string
          user_id: string
          scheduled_date: string
          sent_at: string | null
          status: 'scheduled' | 'sent' | 'completed' | 'skipped'
          quarter: number
          year: number
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scheduled_date: string
          sent_at?: string | null
          status?: 'scheduled' | 'sent' | 'completed' | 'skipped'
          quarter: number
          year: number
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scheduled_date?: string
          sent_at?: string | null
          status?: 'scheduled' | 'sent' | 'completed' | 'skipped'
          quarter?: number
          year?: number
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      },
      // Admin-created templates (system-wide)
      report_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string | null
          thumbnail: string | null
          sections: Json
          styles: Json
          is_active: boolean
          is_default: boolean
          usage_count: number
          created_by: string | null
          created_at: string
          updated_at: string
          logo_url: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type?: string | null
          thumbnail?: string | null
          sections?: Json
          styles?: Json
          is_active?: boolean
          is_default?: boolean
          usage_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          logo_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string | null
          thumbnail?: string | null
          sections?: Json
          styles?: Json
          is_active?: boolean
          is_default?: boolean
          usage_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          logo_url?: string | null
        }
      }
      // Client-created templates (user white-label templates)
      user_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          logo_url: string | null
          styles: Json
          sections: Json
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          logo_url?: string | null
          styles?: Json
          sections?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          styles?: Json
          sections?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Template version history
      template_versions: {
        Row: {
          id: string
          template_id: string
          version: number
          content: Json
          created_by: string | null
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          version: number
          content: Json
          created_by?: string | null
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          version?: number
          content?: Json
          created_by?: string | null
          comment?: string | null
          created_at?: string
        }
      }
      regulatory_facts: {
        Row: {
          id: string
          state_code: string
          claim: string
          category: 'license_requirement' | 'bonding_amount' | 'fee_amount' | 'timeline' | 'regulator_contact' | 'enforcement_action' | 'pending_legislation' | 'tax_treatment' | 'reporting_requirement' | 'capital_requirement'
          source_name: string
          source_url: string
          source_date: string
          verified_by: string
          verified_at: string
          verification_status: 'verified' | 'pending_review' | 'needs_update' | 'deprecated'
          expires_at: string | null
          numeric_value: number | null
          numeric_unit: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          state_code: string
          claim: string
          category: 'license_requirement' | 'bonding_amount' | 'fee_amount' | 'timeline' | 'regulator_contact' | 'enforcement_action' | 'pending_legislation' | 'tax_treatment' | 'reporting_requirement' | 'capital_requirement'
          source_name: string
          source_url: string
          source_date: string
          verified_by?: string
          verified_at?: string
          verification_status?: 'verified' | 'pending_review' | 'needs_update' | 'deprecated'
          expires_at?: string | null
          numeric_value?: number | null
          numeric_unit?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          state_code?: string
          claim?: string
          category?: 'license_requirement' | 'bonding_amount' | 'fee_amount' | 'timeline' | 'regulator_contact' | 'enforcement_action' | 'pending_legislation' | 'tax_treatment' | 'reporting_requirement' | 'capital_requirement'
          source_name?: string
          source_url?: string
          source_date?: string
          verified_by?: string
          verified_at?: string
          verification_status?: 'verified' | 'pending_review' | 'needs_update' | 'deprecated'
          expires_at?: string | null
          numeric_value?: number | null
          numeric_unit?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      regulatory_changes: {
        Row: {
          id: string
          fact_id: string | null
          change_type: 'new_fact' | 'updated_fact' | 'deprecated_fact' | 'restored_fact'
          old_value: string | null
          new_value: string | null
          change_reason: string | null
          change_source: string | null
          changed_by: string
          changed_at: string
        }
        Insert: {
          id?: string
          fact_id?: string | null
          change_type: 'new_fact' | 'updated_fact' | 'deprecated_fact' | 'restored_fact'
          old_value?: string | null
          new_value?: string | null
          change_reason?: string | null
          change_source?: string | null
          changed_by?: string
          changed_at?: string
        }
        Update: {
          id?: string
          fact_id?: string | null
          change_type?: 'new_fact' | 'updated_fact' | 'deprecated_fact' | 'restored_fact'
          old_value?: string | null
          new_value?: string | null
          change_reason?: string | null
          change_source?: string | null
          changed_by?: string
          changed_at?: string
        }
      }
      report_claims: {
        Row: {
          id: string
          report_id: string
          claim: string
          supporting_fact_ids: string[]
          verification_status: 'verified' | 'unverified' | 'hallucination' | 'needs_review' | null
          verification_score: number | null
          verification_notes: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          claim: string
          supporting_fact_ids?: string[]
          verification_status?: 'verified' | 'unverified' | 'hallucination' | 'needs_review' | null
          verification_score?: number | null
          verification_notes?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          claim?: string
          supporting_fact_ids?: string[]
          verification_status?: 'verified' | 'unverified' | 'hallucination' | 'needs_review' | null
          verification_score?: number | null
          verification_notes?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      regulatory_audit_log: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: any | null
          new_data: any | null
          changed_by: string | null
          changed_by_email: string | null
          changed_at: string
          reason: string | null
          ip_address: string | null
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: any | null
          new_data?: any | null
          changed_by?: string | null
          changed_by_email?: string | null
          changed_at?: string
          reason?: string | null
          ip_address?: string | null
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: any | null
          new_data?: any | null
          changed_by?: string | null
          changed_by_email?: string | null
          changed_at?: string
          reason?: string | null
          ip_address?: string | null
        }
      }
      state_audit_tracker: {
        Row: {
          id: string
          state_code: string
          last_reviewed: string | null
          licensing_verified: boolean
          fees_verified: boolean
          bonding_verified: boolean
          enforcement_verified: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          state_code: string
          last_reviewed?: string | null
          licensing_verified?: boolean
          fees_verified?: boolean
          bonding_verified?: boolean
          enforcement_verified?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          state_code?: string
          last_reviewed?: string | null
          licensing_verified?: boolean
          fees_verified?: boolean
          bonding_verified?: boolean
          enforcement_verified?: boolean
          notes?: string | null
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
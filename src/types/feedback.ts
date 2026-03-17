// src/types/feedback.ts

export type FeedbackType = 'nps' | 'csat' | 'feature_request' | 'bug_report' | 'support' | 'general' | 'account_review';

export type FeedbackStatus = 
  | 'pending_review' 
  | 'reviewed' 
  | 'action_planned' 
  | 'implemented' 
  | 'closed';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

export type FeedbackSource = 'email' | 'in_app' | 'support_ticket' | 'consultation' | 'survey' | 'api' | 'dashboard' | 'automated';

export interface FeedbackSubmission {
  id: string;
  user_id: string;
  feedback_type_id: string;
  nps_score: number | null;
  csat_score: number | null;
  comments: string | null;
  source: FeedbackSource;
  status: FeedbackStatus;  
  priority: FeedbackPriority;
  assigned_to: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  responded_at?: string | null;  
  responded_by?: string | null;   
  admin_response?: string | null; 
  actioned_at?: string | null;    
  email_subject?: string | null;  
  email_content?: string | null;  
  feature_category?: string | null; 
  company_name?: string | null;    
  client_name?: string | null;     
  feedback_type?: {
    id: string;
    name: string;
    category: FeedbackType;
  };
  users?: { 
    id: string;
    email: string;
    full_name: string | null;
    company_name: string | null;
  };
  responses?: FeedbackResponse[];
}

export interface FeedbackResponse {
  id: string;
  feedback_id: string;
  responder_id: string | null;
  responder_type: 'admin' | 'system' | 'ai';
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface CustomerFeedback {
  id: string;
  user_id: string;
  feedback_type: FeedbackType;
  rating: number | null;
  comment: string | null;
  source: FeedbackSource;
  status: FeedbackStatus; 
  priority: FeedbackPriority;
  category: string | null;
  tags: string[] | null;
  assigned_to: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  actioned_at: string | null;
  action_notes: string | null;
  users?: {
    email: string;
    company_name: string | null;
    full_name: string | null;
  };
}

export interface FeedbackTypeOption {
  id: string;
  name: string;
  description: string | null;
  category: FeedbackType;
  is_active: boolean;
  created_at: string;
}

export interface FeedbackFilters {
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FeedbackMetrics {
  total: number;
  averageRating: number;
  nps: number;
  promoters: number;
  detractors: number;
  newCount: number;
  criticalCount: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority?: Record<string, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  metrics?: FeedbackMetrics;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Helper constants for UI
export const STATUS_DISPLAY: Record<FeedbackStatus, { label: string; color: string }> = {
  pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-800' },
  action_planned: { label: 'Action Planned', color: 'bg-purple-100 text-purple-800' },
  implemented: { label: 'Implemented', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-800' }
};

export const PRIORITY_DISPLAY: Record<FeedbackPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800' }
};
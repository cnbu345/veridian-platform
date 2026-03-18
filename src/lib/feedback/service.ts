// src/lib/feedback/service.ts
import { createClient } from '@/lib/supabase/server';
import { createClient as createClientClient } from '@/lib/supabase/client';
import { 
  FeedbackSubmission, 
  FeedbackTypeOption,
  FeedbackFilters,
  FeedbackMetrics,
  PaginatedResponse
} from '@/types/feedback';

export class FeedbackService {
  /**
   * Submit feedback from client side
   */
  static async submitFeedback(data: {
    feedback_type_id: string;
    nps_score?: number | null;
    csat_score?: number | null;
    comments?: string | null;
    email_subject?: string | null;
    email_content?: string | null;
    feature_category?: string | null;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; feedback: FeedbackSubmission; message: string }> {
    const supabase = createClientClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get user details
    const { data: userDetails } = await supabase
      .from('users')
      .select('full_name, company_name')
      .eq('id', user.id)
      .single();

    // Get feedback type to determine priority
    const { data: feedbackType } = await supabase
      .from('feedback_type')
      .select('category')
      .eq('id', data.feedback_type_id)
      .single();

    // Determine priority
    let priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'

    if (nps_score && nps_score <= 6) {
      priority = 'high'
    } else if (feedbackType?.category === 'support') {
      priority = 'high'
    } else if (metadata.priority) {
      // Map any custom priority values to valid enum values
      const incomingPriority = metadata.priority.toLowerCase()
      if (incomingPriority === 'critical') {
        priority = 'critical'
      } else if (incomingPriority === 'high') {
        priority = 'high'
      } else if (incomingPriority === 'medium' || incomingPriority === 'normal') {
        priority = 'normal'  // Map both 'medium' and 'normal' to 'normal'
      } else if (incomingPriority === 'low') {
        priority = 'low'
      } else {
        priority = 'normal'
      }
    }

    const { data: feedback, error } = await supabase
      .from('feedback_submissions')
      .insert({
        user_id: user.id,
        feedback_type_id: data.feedback_type_id,
        nps_score: data.nps_score || null,
        csat_score: data.csat_score || null,
        comments: data.comments || null,
        email_subject: data.email_subject || null,
        email_content: data.email_content || null,
        feature_category: data.feature_category || null,
        company_name: userDetails?.company_name,
        client_name: userDetails?.full_name,
        source: 'dashboard',
        status: 'pending_review', // FIXED: Using correct enum value
        priority,
        metadata: data.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        )
      `)
      .single();

    if (error) {
      console.error('Error submitting feedback:', error);
      throw new Error('Failed to submit feedback');
    }

    return {
      success: true,
      feedback,
      message: 'Feedback submitted successfully'
    };
  }

  /**
   * Get client's feedback history
   */
  static async getClientFeedback(filters: FeedbackFilters = {}): Promise<FeedbackSubmission[]> {
    const supabase = createClientClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    let query = supabase
      .from('feedback_submissions')
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.type && filters.type !== 'all') {
      query = query.eq('feedback_type.category', filters.type);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching client feedback:', error);
      throw new Error('Failed to fetch feedback');
    }

    return data || [];
  }

  /**
   * Get single submission by ID (client)
   */
  static async getSubmissionById(id: string): Promise<FeedbackSubmission | null> {
    const supabase = createClientClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('feedback_submissions')
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching submission:', error);
      return null;
    }

    return data;
  }

  /**
   * Get single feedback by ID (admin)
   */
  static async getFeedbackById(id: string): Promise<FeedbackSubmission | null> {
    const supabase = createClientClient();
    
    const { data, error } = await supabase
      .from('feedback_submissions')
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        ),
        users!feedback_submissions_user_id_fkey (
          id,
          email,
          full_name,
          company_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching feedback:', error);
      return null;
    }

    return data;
  }

  /**
   * Update feedback status and response (admin)
   */
  static async updateFeedback(
    id: string, 
    updates: {
      status?: string;
      priority?: string;
      admin_response?: string;
    }
  ): Promise<FeedbackSubmission> {
    const supabase = createClientClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // First get current feedback to check existing values
    const { data: existing } = await supabase
      .from('feedback_submissions')
      .select('admin_response, status')
      .eq('id', id)
      .single();

    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.status) {
      updatePayload.status = updates.status;
      
      // Set timestamps based on status
      if (updates.status === 'reviewed') {
        updatePayload.reviewed_at = new Date().toISOString();
        updatePayload.reviewed_by = user.id;
      }
      if (updates.status === 'action_planned' || updates.status === 'implemented') {
        updatePayload.actioned_at = new Date().toISOString();
      }
    }

    if (updates.priority) {
      updatePayload.priority = updates.priority;
    }

    if (updates.admin_response !== undefined) {
      updatePayload.admin_response = updates.admin_response;
      
      // Only set responded_at if this is a new response
      if (!existing?.admin_response && updates.admin_response) {
        updatePayload.responded_at = new Date().toISOString();
        updatePayload.responded_by = user.id;
      } else if (updates.admin_response !== existing?.admin_response) {
        updatePayload.responded_at = new Date().toISOString();
        updatePayload.responded_by = user.id;
      }
    }

    const { data, error } = await supabase
      .from('feedback_submissions')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        feedback_type:feedback_type_id (
          id,
          name,
          category
        ),
        users!feedback_submissions_user_id_fkey (
          id,
          email,
          full_name,
          company_name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating feedback:', error);
      throw new Error('Failed to update feedback');
    }

    return data;
  }

  /**
   * Calculate feedback metrics for admin dashboard
   */
  static async calculateFeedbackMetrics(): Promise<FeedbackMetrics> {
    const supabase = createClientClient();
    
    const { data: allFeedback } = await supabase
      .from('feedback_submissions')
      .select(`
        *,
        feedback_type:feedback_type_id (
          category
        )
      `);

    const metrics: FeedbackMetrics = {
      total: allFeedback?.length || 0,
      averageRating: 0,
      nps: 0,
      promoters: 0,
      detractors: 0,
      newCount: 0,
      criticalCount: 0,
      byType: {},
      byStatus: {},
      byPriority: {}
    };

    if (allFeedback && allFeedback.length > 0) {
      // Calculate average rating
      const ratings = allFeedback
        .filter(f => f.nps_score !== null || f.csat_score !== null)
        .map(f => f.nps_score || f.csat_score);
      if (ratings.length > 0) {
        metrics.averageRating = Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1));
      }

      // NPS calculation
      const npsFeedback = allFeedback.filter(f => 
        f.feedback_type?.category === 'nps' && f.nps_score !== null
      );
      if (npsFeedback.length > 0) {
        metrics.promoters = npsFeedback.filter(f => f.nps_score >= 9).length;
        metrics.detractors = npsFeedback.filter(f => f.nps_score <= 6).length;
        metrics.nps = Math.round(((metrics.promoters - metrics.detractors) / npsFeedback.length) * 100);
      }

      // Count by type, status, and priority
      allFeedback.forEach(f => {
        // By type
        const type = f.feedback_type?.category || 'unknown';
        metrics.byType[type] = (metrics.byType[type] || 0) + 1;
        
        // By status - using correct enum values
        metrics.byStatus[f.status] = (metrics.byStatus[f.status] || 0) + 1;
        
        // By priority
        if (f.priority) {
          metrics.byPriority![f.priority] = (metrics.byPriority![f.priority] || 0) + 1;
        }
      });

      // FIXED: Use 'pending_review' instead of 'new'
      metrics.newCount = metrics.byStatus['pending_review'] || 0;
      metrics.criticalCount = metrics.byPriority?.['critical'] || 0;
    }

    return metrics;
  }

  /**
   * Get available feedback types
   */
  static async getFeedbackTypes(activeOnly: boolean = true): Promise<FeedbackTypeOption[]> {
    const supabase = createClientClient();
    
    let query = supabase
      .from('feedback_type')
      .select('*')
      .order('category');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback types:', error);
      throw new Error('Failed to fetch feedback types');
    }

    return data || [];
  }
}
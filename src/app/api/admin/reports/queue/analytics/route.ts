// src/app/api/admin/reports/queue/analytics/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify admin access
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all failed jobs
    const { data: failedJobs, error } = await supabase
      .from('report_generation_queue')
      .select('*')
      .eq('status', 'failed')

    if (error) throw error

    // Calculate analytics
    const total_failed = failedJobs?.length || 0
    
    // Error type categorization
    const by_error_type: Record<string, number> = {}
    const by_state: Record<string, number> = {}
    let total_attempts = 0
    
    failedJobs?.forEach(job => {
      // Categorize by error type
      const errorMsg = job.error || ''
      let errorType = 'Unknown'
      
      if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
        errorType = 'Timeout'
      } else if (errorMsg.includes('API key') || errorMsg.includes('authentication') || errorMsg.includes('auth')) {
        errorType = 'Authentication'
      } else if (errorMsg.includes('rate limit') || errorMsg.includes('rate_limit')) {
        errorType = 'Rate Limit'
      } else if (errorMsg.includes('validation') || errorMsg.includes('Invalid')) {
        errorType = 'Validation'
      } else if (errorMsg.includes('database') || errorMsg.includes('supabase') || errorMsg.includes('postgres')) {
        errorType = 'Database'
      } else if (errorMsg.includes('network') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('fetch')) {
        errorType = 'Network'
      } else if (errorMsg.includes('OpenAI') || errorMsg.includes('AI')) {
        errorType = 'AI Service'
      }
      
      by_error_type[errorType] = (by_error_type[errorType] || 0) + 1
      
      // Categorize by state
      const state = job.params?.state || 'Unknown'
      by_state[state] = (by_state[state] || 0) + 1
      
      total_attempts += job.attempts || 0
    })
    
    // Calculate average attempts
    const avg_attempts = total_failed > 0 ? total_attempts / total_failed : 0
    
    // Get total jobs for success rate
    const { data: totalJobs } = await supabase
      .from('report_generation_queue')
      .select('status')
    
    const total_processed = totalJobs?.length || 0
    const total_completed = totalJobs?.filter(j => j.status === 'completed').length || 0
    const success_rate = total_processed > 0 
      ? Math.round((total_completed / total_processed) * 100) 
      : 100
    
    // Get top errors
    const top_errors = Object.entries(by_error_type)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      total_failed,
      by_error_type,
      by_state,
      avg_attempts,
      success_rate,
      top_errors
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
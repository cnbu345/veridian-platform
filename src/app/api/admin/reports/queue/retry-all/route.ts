// src/app/api/admin/reports/queue/retry-all/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
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
    const { data: failedJobs, error: fetchError } = await supabase
      .from('report_generation_queue')
      .select('*')
      .eq('status', 'failed')

    if (fetchError) throw fetchError

    if (!failedJobs || failedJobs.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No failed jobs to retry' 
      })
    }

    // Reset each failed job to queued status
    const { error: updateError } = await supabase
      .from('report_generation_queue')
      .update({
        status: 'queued',
        attempts: 0,
        error: null,
        started_at: null,
        completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('status', 'failed')

    if (updateError) throw updateError

    // Log the action
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id,
        action: 'retry_all_failed_reports',
        details: {
          count: failedJobs.length,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({ 
      success: true, 
      message: `Successfully queued ${failedJobs.length} reports for retry` 
    })
  } catch (error) {
    console.error('Failed to retry all:', error)
    return NextResponse.json(
      { error: 'Failed to retry reports' },
      { status: 500 }
    )
  }
}
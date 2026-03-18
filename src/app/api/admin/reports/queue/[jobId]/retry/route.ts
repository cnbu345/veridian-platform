// src/app/api/admin/reports/queue/[jobId]/retry/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } }
) {
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

    const { jobId } = params

    // Update job status to queued for retry
    const { error } = await supabase
      .from('report_generation_queue')
      .update({
        status: 'queued',
        attempts: 0,
        error: null,
        started_at: null,
        completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('status', 'failed')

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to retry job:', error)
    return NextResponse.json(
      { error: 'Failed to retry job' },
      { status: 500 }
    )
  }
}
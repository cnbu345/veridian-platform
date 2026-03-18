// src/app/api/admin/reports/queue/stats/route.ts
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

    // Get queue statistics
    const { data: queue, error } = await supabase
      .from('report_generation_queue')
      .select('status, attempts, created_at, started_at, completed_at')

    if (error) throw error

    // Calculate stats
    const stats = {
      queued: queue?.filter(j => j.status === 'queued').length || 0,
      processing: queue?.filter(j => j.status === 'processing').length || 0,
      completed: queue?.filter(j => j.status === 'completed').length || 0,
      failed: queue?.filter(j => j.status === 'failed').length || 0,
      activeJobs: queue?.filter(j => j.status === 'processing').length || 0,
      maxConcurrent: 5, // This could come from settings
      
      // Calculate average generation time for completed jobs
      avgGenerationTime: calculateAverageTime(queue?.filter(j => 
        j.status === 'completed' && j.started_at && j.completed_at
      ) || []),
      
      // Calculate success rate
      successRate: calculateSuccessRate(queue || [])
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch queue stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue stats' },
      { status: 500 }
    )
  }
}

function calculateAverageTime(completedJobs: any[]): number {
  if (completedJobs.length === 0) return 0
  
  const totalTime = completedJobs.reduce((sum, job) => {
    const start = new Date(job.started_at).getTime()
    const end = new Date(job.completed_at).getTime()
    return sum + (end - start)
  }, 0)
  
  // Return average in seconds
  return Math.round((totalTime / completedJobs.length) / 1000)
}

function calculateSuccessRate(queue: any[]): number {
  const total = queue.length
  if (total === 0) return 100
  
  const completed = queue.filter(j => j.status === 'completed').length
  return Math.round((completed / total) * 100)
}
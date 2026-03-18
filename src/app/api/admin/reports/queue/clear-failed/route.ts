// src/app/api/admin/reports/queue/clear-failed/route.ts
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

    // Delete all failed jobs
    const { error } = await supabase
      .from('report_generation_queue')
      .delete()
      .eq('status', 'failed')

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear failed jobs:', error)
    return NextResponse.json(
      { error: 'Failed to clear failed jobs' },
      { status: 500 }
    )
  }
}
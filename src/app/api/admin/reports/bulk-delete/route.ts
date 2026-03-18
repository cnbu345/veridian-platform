// src/app/api/admin/reports/bulk-delete/route.ts
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

    const body = await request.json()
    const { reportIds } = body

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json({ error: 'No report IDs provided' }, { status: 400 })
    }

    // Delete reports
    const { error } = await supabase
      .from('reports')
      .delete()
      .in('id', reportIds)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${reportIds.length} reports` 
    })
  } catch (error) {
    console.error('Bulk delete failed:', error)
    return NextResponse.json(
      { error: 'Failed to delete reports' },
      { status: 500 }
    )
  }
}
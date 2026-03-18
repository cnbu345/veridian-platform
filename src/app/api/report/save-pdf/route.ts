// src/app/api/reports/save-pdf/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ServerStorage } from '@/lib/storage/server-storage'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const reportId = formData.get('reportId') as string
    const file = formData.get('file') as File

    if (!reportId || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Verify user owns this report or is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (report.user_id !== user.id && !userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Convert File to Blob
    const buffer = await file.arrayBuffer()
    const blob = new Blob([buffer], { type: 'application/pdf' })

    // Save to storage
    const result = await ServerStorage.saveReportPDF(report as any, blob)

    if (!result) {
      return NextResponse.json({ error: 'Failed to save PDF' }, { status: 500 })
    }

    return NextResponse.json({ success: true, url: result.publicUrl })
  } catch (error) {
    console.error('Error saving PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
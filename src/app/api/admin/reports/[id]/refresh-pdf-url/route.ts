// src/app/api/reports/[id]/refresh-pdf-url/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check if user has access (owns report or is admin)
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (report.user_id !== user.id && !userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If there's a storage path, generate a fresh signed URL
    if (report.storage_path) {
      const { data: { signedUrl } } = await supabase
        .storage
        .from('reports')
        .createSignedUrl(report.storage_path, 31536000) // 1 year

      if (signedUrl) {
        // Update the report with new URL
        await supabase
          .from('reports')
          .update({ pdf_url: signedUrl })
          .eq('id', id)

        return NextResponse.json({ url: signedUrl })
      }
    }

    // If no storage path but we have a pdf_url, return it
    if (report.pdf_url) {
      return NextResponse.json({ url: report.pdf_url })
    }

    return NextResponse.json({ error: 'No PDF available' }, { status: 404 })
  } catch (error) {
    console.error('Error refreshing PDF URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
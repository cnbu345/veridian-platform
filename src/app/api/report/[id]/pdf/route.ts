// src/app/report/[id]/pdf/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateReportPDF } from '@/lib/pdf/generator'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (reportError || !report) {
      return new NextResponse('Report not found', { status: 404 })
    }

    // Check if user has access (owns report or is admin)
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (report.user_id !== user.id && !userData?.is_admin) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Check if we have a stored PDF
    if (report.storage_path) {
      // Generate a fresh signed URL
      const { data: { signedUrl } } = await supabase
        .storage
        .from('reports')
        .createSignedUrl(report.storage_path, 3600) // 1 hour expiry

      if (signedUrl) {
        // Redirect to the signed URL
        return NextResponse.redirect(signedUrl)
      }
    }

    // If no stored PDF or signed URL failed, generate on-the-fly
    console.log('Generating PDF on-the-fly for report:', id)
    const pdfBlob = await generateReportPDF(report)
    
    // Convert blob to buffer
    const buffer = Buffer.from(await pdfBlob.arrayBuffer())
    
    // Return PDF with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${report.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Regulatory_Report.pdf"`,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error serving PDF:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
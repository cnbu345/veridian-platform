// src/app/api/reports/[id]/pdf/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateReportPDF } from '@/lib/pdf/generator'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
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

    // PRIORITY 1: Use existing pdf_url if available
    if (report.pdf_url) {
      try {
        console.log('📎 Using existing pdf_url for report:', id)
        const response = await fetch(report.pdf_url)
        
        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer())
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${report.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Regulatory_Report.pdf"`,
              'Cache-Control': 'public, max-age=3600'
            }
          })
        } else {
          console.log('⚠️ pdf_url returned error, falling back to generation')
        }
      } catch (error) {
        console.log('⚠️ Failed to fetch from pdf_url:', error)
      }
    }

    // PRIORITY 2: Try storage_path if available (for future reports)
    if (report.storage_path) {
      try {
        const { data: { signedUrl } } = await supabase
          .storage
          .from('reports')
          .createSignedUrl(report.storage_path, 3600)
        
        if (signedUrl) {
          const response = await fetch(signedUrl)
          if (response.ok) {
            const buffer = Buffer.from(await response.arrayBuffer())
            return new NextResponse(buffer, {
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${report.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Regulatory_Report.pdf"`,
                'Cache-Control': 'public, max-age=3600'
              }
            })
          }
        }
      } catch (error) {
        console.log('⚠️ Storage path failed:', error)
      }
    }

    // PRIORITY 3: Generate on-the-fly as last resort
    console.log('🔄 Generating PDF on-the-fly for report:', id)
    const pdfBlob = await generateReportPDF(report)
    const buffer = Buffer.from(await pdfBlob.arrayBuffer())
    
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
// src/app/api/admin/reports/export/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    
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
    const { reportIds, filters } = body

    // Build query
    let query = supabase
      .from('reports')
      .select(`
        *,
        users:user_id (
          email,
          full_name,
          company_name
        )
      `)

    if (reportIds && reportIds.length > 0) {
      query = query.in('id', reportIds)
    } else {
      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate)
      }
    }

    const { data: reports, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    if (format === 'csv') {
      // Transform data for CSV
      const csvData = reports.map(report => ({
        'Report ID': report.id,
        'Company Name': report.company_name,
        'Industry': report.industry,
        'City': report.city,
        'State': report.state,
        'Location Tier': report.location_tier,
        'Status': report.status,
        'Created At': new Date(report.created_at).toLocaleString(),
        'User Email': report.users?.email || 'N/A',
        'User Name': report.users?.full_name || 'N/A',
        'PDF URL': report.pdf_url || 'N/A',
        'Stripe Payment ID': report.stripe_payment_id || 'N/A'
      }))

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(csvData)
      XLSX.utils.book_append_sheet(wb, ws, 'Reports')
      
      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'csv' })

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="reports-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'pdf') {
      // Create PDF
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      
      let page = pdfDoc.addPage([612, 792]) // US Letter size
      const { width, height } = page.getSize()
      
      // Title
      page.drawText('Reports Export', {
        x: 50,
        y: height - 50,
        size: 18,
        font: boldFont,
        color: rgb(0.12, 0.16, 0.23) // navy-900
      })
      
      page.drawText(`Generated: ${new Date().toLocaleString()}`, {
        x: 50,
        y: height - 70,
        size: 10,
        font: font,
        color: rgb(0.4, 0.45, 0.55)
      })
      
      // Table headers
      const headers = ['Company', 'Industry', 'Location', 'Status', 'Date']
      let yPosition = height - 100
      let xPosition = 50
      
      headers.forEach(header => {
        page.drawText(header, {
          x: xPosition,
          y: yPosition,
          size: 10,
          font: boldFont,
          color: rgb(0.12, 0.16, 0.23)
        })
        xPosition += 100
      })
      
      // Draw line under headers
      page.drawLine({
        start: { x: 50, y: yPosition - 5 },
        end: { x: width - 50, y: yPosition - 5 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8)
      })
      
      // Table rows
      yPosition -= 20
      reports.forEach((report, index) => {
        if (yPosition < 50) {
          // New page
          page = pdfDoc.addPage([612, 792])
          yPosition = height - 50
        }
        
        const rowData = [
          report.company_name,
          report.industry,
          `${report.city}, ${report.state}`,
          report.status,
          new Date(report.created_at).toLocaleDateString()
        ]
        
        xPosition = 50
        rowData.forEach(cell => {
          page.drawText(cell.substring(0, 20), {
            x: xPosition,
            y: yPosition,
            size: 9,
            font: font,
            color: rgb(0.2, 0.2, 0.2)
          })
          xPosition += 100
        })
        
        yPosition -= 15
      })
      
      // Add summary page
      page = pdfDoc.addPage([612, 792])
      page.drawText('Export Summary', {
        x: 50,
        y: height - 50,
        size: 16,
        font: boldFont,
        color: rgb(0.12, 0.16, 0.23)
      })
      
      const summary = [
        `Total Reports: ${reports.length}`,
        `Date Range: ${filters?.startDate || 'All'} to ${filters?.endDate || 'All'}`,
        `Status Filter: ${filters?.status || 'All'}`,
        `Generated By: ${user.email}`,
        `Export Format: PDF`
      ]
      
      let summaryY = height - 80
      summary.forEach(line => {
        page.drawText(line, {
          x: 50,
          y: summaryY,
          size: 11,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        })
        summaryY -= 20
      })
      
      const pdfBytes = await pdfDoc.save()
      
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="reports-export-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export failed:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
// src/app/api/admin/reports/export/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Helper function to format date safely
const formatDateSafe = (dateValue: any): string => {
  if (!dateValue) return 'N/A'
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return 'Invalid Date'
  }
}

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

    // Build query - fetch reports with user data separately to avoid alias issues
    let query = supabase
      .from('reports')
      .select(`
        *,
        users!user_id (
          email,
          full_name,
          company_name,
          subscription_tier,
          created_at
        )
      `)

    if (reportIds && reportIds.length > 0) {
      query = query.in('id', reportIds)
    } else {
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

    if (error) {
      console.error('Query error:', error)
      throw error
    }

    // Enhanced data for export
    const exportData = reports.map(report => {
      const content = report.report_content || {}
      const strategyFocus = content.strategy_focus || {}
      const locationData = content.location_analysis || {}
      const licensingData = content.licensing_matrix || {}
      const riskData = content.risk_assessment || {}
      const userData = report.users || {}
      
      return {
        // Basic Info
        'Report ID': report.id,
        'Company Name': report.company_name,
        'Industry': report.industry,
        'City': report.city,
        'State': report.state,
        'Location Tier': report.location_tier || locationData.marketTier || 'N/A',
        
        // Status & Dates
        'Status': report.status,
        'Created At': new Date(report.created_at).toLocaleString(),
        'Completed At': report.updated_at ? new Date(report.updated_at).toLocaleString() : 'N/A',
        
        // User Info
        'User Email': userData?.email || 'N/A',
        'User Name': userData?.full_name || 'N/A',
        'User Company': userData?.company_name || 'N/A',
        'User Subscription': userData?.subscription_tier || 'N/A',
        'User Since': formatDateSafe(userData?.created_at),

        // Regulatory Analysis
        'Regulatory Climate': content.regulatory_analysis?.climate || locationData.regulatoryClimate || (report.regulatory_climate || 'N/A'),
        'License Required': content.regulatory_analysis?.licenseRequired ||  licensingData.licenseType ||  (report.license_required || 'N/A'),
        'Money Transmitter Required': content.regulatory_analysis?.moneyTransmitter || content.stateRegulation?.moneyTransmitter || 'N/A',
        
        // Strategy Focus
        'Primary Focus': strategyFocus.primary || content.primaryFocus || 'N/A',
        'Secondary Focus': Array.isArray(strategyFocus.secondary) 
          ? strategyFocus.secondary.join(', ') 
          : (strategyFocus.secondary || content.secondaryFocus || 'N/A'),
        'Timeline': strategyFocus.timeline || content.timeline || 'N/A',
        
        // Client Input
        'Client Concerns': content.concerns ? content.concerns.substring(0, 200) : 'N/A',
        'Client Goals': content.goals ? content.goals.substring(0, 200) : 'N/A',
        
        // Risk Assessment
        'Overall Risk': riskData.overall || content.risk_assessment?.overallRisk || 'N/A',
        'Risk Level': riskData.riskLevel || content.risk_assessment?.riskLevel || 'N/A',
        
        // Financial
        'Payment ID': report.stripe_payment_id || 'N/A',
        'File Size': report.file_size ? `${(report.file_size / 1024).toFixed(2)} KB` : 'N/A',
        
        // Storage
        'Storage Path': report.storage_path || 'N/A',
      }
    })

    if (format === 'csv') {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)
      
      // Auto-size columns (optional)
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.min(Math.max(key.length, 20), 50)
      }))
      ws['!cols'] = colWidths
      
      XLSX.utils.book_append_sheet(wb, ws, 'Reports Export')
      
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
      
      let page = pdfDoc.addPage([612, 792])
      const { width, height } = page.getSize()
      
      let yPosition = height - 50
      
      // Title
      page.drawText('Reports Export - Detailed Analysis', {
        x: 50,
        y: yPosition,
        size: 18,
        font: boldFont,
        color: rgb(0.12, 0.16, 0.23)
      })
      yPosition -= 25
      
      // Summary stats
      page.drawText(`Generated: ${new Date().toLocaleString()}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.4, 0.45, 0.55)
      })
      yPosition -= 20
      
      page.drawText(`Total Reports: ${reports.length}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0.12, 0.16, 0.23)
      })
      yPosition -= 15
      
      // Status breakdown
      const statusCounts = reports.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      page.drawText(`Status Breakdown:`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: rgb(0.12, 0.16, 0.23)
      })
      yPosition -= 15
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        page.drawText(`  • ${status}: ${count}`, {
          x: 50,
          y: yPosition,
          size: 9,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        })
        yPosition -= 12
      })
      
      yPosition -= 10
      
      // Table headers
      const headers = ['Report ID', 'Company', 'State', 'Status', 'Primary Focus', 'Created']
      let xPosition = 50
      
      page.drawLine({
        start: { x: 50, y: yPosition + 5 },
        end: { x: width - 50, y: yPosition + 5 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8)
      })
      
      headers.forEach(header => {
        page.drawText(header, {
          x: xPosition,
          y: yPosition,
          size: 9,
          font: boldFont,
          color: rgb(0.12, 0.16, 0.23)
        })
        xPosition += 90
      })
      
      yPosition -= 12
      page.drawLine({
        start: { x: 50, y: yPosition + 5 },
        end: { x: width - 50, y: yPosition + 5 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8)
      })
      yPosition -= 5
      
      // Table rows
      reports.forEach((report, index) => {
        if (yPosition < 50) {
          page = pdfDoc.addPage([612, 792])
          yPosition = height - 50
        }
        
        const content = report.report_content || {}
        const strategyFocus = content.strategy_focus || {}
        
        const rowData = [
          report.id.slice(0, 8),
          report.company_name.length > 20 ? report.company_name.slice(0, 17) + '...' : report.company_name,
          report.state,
          report.status,
          (strategyFocus.primary || content.primaryFocus || 'N/A').slice(0, 15),
          new Date(report.created_at).toLocaleDateString()
        ]
        
        xPosition = 50
        rowData.forEach(cell => {
          page.drawText(String(cell), {
            x: xPosition,
            y: yPosition,
            size: 8,
            font: font,
            color: rgb(0.2, 0.2, 0.2)
          })
          xPosition += 90
        })
        
        yPosition -= 15
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
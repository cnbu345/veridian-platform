// src/app/api/admin/reports/[id]/refresh-pdf-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePDF, savePDFToStorage } from '@/lib/pdf'
import { getTemplateServer } from '@/lib/templates/storage.server'
import { generateReport } from '@/lib/reports/generator'
import { ServerStorage } from '@/lib/storage/server-storage'

// Helper to log debug info
const logDebug = (message: string, data?: any) => {
  console.log(`[force-complete] ${message}`, data ? JSON.stringify(data, null, 2) : '')
}

// Triggers to disable/enable
const TRIGGERS_TO_DISABLE = [
  'on_report_status_change',
  'report_ready_trigger',
  'update_health_on_report'
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params Promise
    const { id } = await params
    
    logDebug(`🚀 Starting force complete for report ID: ${id}`)
    
    const supabase = await createClient()
    
    // Parse request body
    let body: { action?: string; reason?: string } = { action: 'force-complete' }
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (e) {
      // No body, use default
    }
    
    const { action = 'force-complete', reason } = body
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }
    
    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()
    
    if (reportError || !report) {
      logDebug(`❌ Report not found: ${id}`)
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    
    logDebug(`✅ Report found: ${report.company_name}, current status: ${report.status}`)
    
    // Check if report is already ready
    if (report.status === 'ready') {
      return NextResponse.json({ 
        success: true, 
        message: 'Report is already ready',
        report
      })
    }
    
    // Step 1: Disable triggers
    logDebug(`🔧 Disabling triggers...`)
    for (const trigger of TRIGGERS_TO_DISABLE) {
      try {
        await supabase.rpc('exec_sql', { sql: `ALTER TABLE reports DISABLE TRIGGER ${trigger};` })
        logDebug(`   Disabled: ${trigger}`)
      } catch (e) {
        logDebug(`   Failed to disable ${trigger}, continuing anyway`)
      }
    }
    
    // Step 2: Get current content and generate AI if needed
    const currentContent = report.report_content as any || {}
    let finalContent = currentContent
    
    const hasFullContent = currentContent.executive_summary || 
                           currentContent.regulatory_analysis || 
                           currentContent.full_report ||
                           (currentContent.formatted?.executiveSummary)
    
    if (!hasFullContent) {
      logDebug(`📝 Generating AI content...`)
      
      try {
        const companyData = {
          name: report.company_name,
          industry: report.industry,
          size: currentContent.companySize || '1-10',
          budget: currentContent.budget || 'under-50k'
        }
        
        const locationData = {
          city: report.city,
          state: report.state,
          tier: report.location_tier || 'major',
          nearestRegulatoryHub: report.nearest_major_city || ''
        }
        
        const strategyData = {
          primary: currentContent.primaryFocus || 'compliance',
          secondary: currentContent.secondaryFocus || [],
          timeline: currentContent.timeline || '6-months',
          concerns: currentContent.concerns || '',
          goals: currentContent.goals || ''
        }
        
        const aiContent = await generateReport(companyData, locationData, strategyData, report.user_id)
        
        finalContent = {
          ...currentContent,
          ...aiContent,
          generated_at: new Date().toISOString(),
          force_completed: true,
          force_completed_reason: reason || 'Manual admin override'
        }
        
        logDebug(`✅ AI content generated`)
        
        // Update the report with generated content
        await supabase
          .from('reports')
          .update({ report_content: finalContent })
          .eq('id', id)
        
      } catch (genError) {
        logDebug(`⚠️ AI generation failed, using fallback: ${genError}`)
        finalContent = {
          ...currentContent,
          executive_summary: {
            overview: `Regulatory analysis for ${report.company_name} in ${report.city}, ${report.state}.`,
            keyFindings: [`${report.state} requires compliance with state regulations.`]
          },
          generated_at: new Date().toISOString(),
          force_completed: true,
          force_complete_fallback: true
        }
      }
    }
    
    // Step 3: Get template if associated
    let template = null
    if (report.template_id) {
      template = await getTemplateServer(report.template_id, report.user_id)
      if (template) {
        logDebug(`📋 Template loaded: ${template.name}`)
      }
    }
    
    // Step 4: Generate PDF and save directly using ServerStorage
    logDebug(`📄 Generating PDF...`)
    let pdfGenerated = false
    let pdfUrl = null
    
    try {
      // Get the latest report with updated content
      const { data: latestReport } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single()
      
      const reportWithTemplate = {
        ...latestReport,
        template: template,
        report_content: finalContent
      }
      
      const pdfBlob = await generatePDF(reportWithTemplate, template)
      
      if (pdfBlob && pdfBlob.size > 0) {
        logDebug(`PDF generated, size: ${pdfBlob.size} bytes`)
        
        // Use ServerStorage directly (bypasses HTTP call and authentication)
        logDebug(`Saving PDF directly via ServerStorage...`)
        const result = await ServerStorage.saveReportPDF(latestReport || report, pdfBlob)
        
        if (result && result.publicUrl) {
          pdfGenerated = true
          pdfUrl = result.publicUrl
          logDebug(`✅ PDF saved successfully via ServerStorage, URL: ${pdfUrl}`)
        } else {
          logDebug(`⚠️ ServerStorage save failed`)
        }
      } else {
        logDebug(`⚠️ PDF generation produced empty blob`)
      }
    } catch (pdfError) {
      logDebug(`❌ PDF generation/storage error: ${pdfError}`)
      console.error('PDF error:', pdfError)
      // Continue anyway to update status
    }
    
    // Step 5: Update report status (with triggers disabled)
    logDebug(`📝 Updating report status to 'ready'...`)
    
    const updateData = {
      status: 'ready',
      updated_at: new Date().toISOString(),
      pdf_url: pdfUrl,
      report_content: {
        ...finalContent,
        status: 'ready',
        force_completed: true,
        force_completed_at: new Date().toISOString(),
        force_completed_by: user.email,
        pdf_generated: pdfGenerated,
        pdf_generated_at: pdfGenerated ? new Date().toISOString() : null
      }
    }
    
    const { data: updatedReport, error: updateError } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      logDebug(`❌ Update failed: ${updateError.message}`)
      // Re-enable triggers before returning error
      for (const trigger of TRIGGERS_TO_DISABLE) {
        try {
          await supabase.rpc('exec_sql', { sql: `ALTER TABLE reports ENABLE TRIGGER ${trigger};` })
        } catch (e) {}
      }
      return NextResponse.json(
        { error: 'Failed to update report status', details: updateError.message },
        { status: 500 }
      )
    }
    
    // Step 6: Re-enable triggers
    logDebug(`🔧 Re-enabling triggers...`)
    for (const trigger of TRIGGERS_TO_DISABLE) {
      try {
        await supabase.rpc('exec_sql', { sql: `ALTER TABLE reports ENABLE TRIGGER ${trigger};` })
        logDebug(`   Enabled: ${trigger}`)
      } catch (e) {
        logDebug(`   Failed to enable ${trigger}, continuing anyway`)
      }
    }
    
    logDebug(`✅ Force complete successful!`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Report force completed successfully',
      report: updatedReport,
      content_generated: !hasFullContent,
      pdf_generated: pdfGenerated,
      pdf_url: pdfUrl
    })
    
  } catch (error) {
    logDebug(`❌ Error: ${error}`)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for checking report status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params Promise
    const { id } = await params
    
    const supabase = await createClient()
    
    logDebug(`GET request for report: ${id}`)
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        *,
        user_templates (
          id,
          name,
          styles,
          logo_url
        )
      `)
      .eq('id', id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check access
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = userData?.is_admin === true
    const isOwner = report.user_id === user.id

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Return report status with template info
    return NextResponse.json({
      id: report.id,
      status: report.status,
      company_name: report.company_name,
      pdf_url: report.pdf_url,
      created_at: report.created_at,
      template: report.user_templates,
      is_admin: isAdmin,
      is_owner: isOwner
    })
    
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
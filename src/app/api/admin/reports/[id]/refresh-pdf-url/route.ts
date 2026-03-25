// src/app/api/admin/reports/[id]/refresh-pdf-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePDF, savePDFToStorage } from '@/lib/pdf'
import { getTemplateServer } from '@/lib/templates/storage.server'

// Helper to log debug info
const logDebug = (message: string, data?: any) => {
  console.log(`[refresh-pdf-url] ${message}`, data ? JSON.stringify(data, null, 2) : '')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    logDebug(`🚀 POST request received for report ID: ${params.id}`)
    
    const supabase = await createClient()
    const { id } = params
    
    // Parse request body
    let body: { action?: string; reason?: string } = { action: 'refresh' }
    try {
      const text = await request.text()
      logDebug(`Raw request body: ${text}`)
      if (text) {
        body = JSON.parse(text)
      }
    } catch (e) {
      logDebug(`No body or invalid JSON: ${e}`)
      body = { action: 'refresh' }
    }
    
    const { action = 'refresh', reason } = body
    logDebug(`Action: ${action}, Reason: ${reason || 'none'}`)
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      logDebug(`Auth error: ${userError?.message || 'No user'}`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    logDebug(`User authenticated: ${user.email}`)

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (reportError || !report) {
      logDebug(`Report not found: ${reportError?.message}`)
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    logDebug(`Report found: ${report.company_name}, status: ${report.status}`)

    // Check if user has access (owns report or is admin)
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin, email')
      .eq('id', user.id)
      .single()

    const isAdmin = userData?.is_admin === true
    const isOwner = report.user_id === user.id

    logDebug(`Access check - isOwner: ${isOwner}, isAdmin: ${isAdmin}`)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Handle force complete action (admin only)
    if (action === 'force-complete') {
      logDebug(`🔄 Processing force-complete for report ${id}`)
      
      if (!isAdmin) {
        logDebug(`Non-admin user attempted force-complete: ${user.email}`)
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
      
      // Check if report is already ready
      if (report.status === 'ready') {
        logDebug(`Report already ready, skipping`)
        return NextResponse.json({ 
          success: true, 
          message: 'Report is already ready',
          report,
          url: report.pdf_url
        })
      }

      // Get template if associated
      let template = null
      if (report.template_id) {
        logDebug(`Fetching template: ${report.template_id}`)
        template = await getTemplateServer(report.template_id, report.user_id)
        if (template) {
          logDebug(`Template loaded: ${template.name}`)
        } else {
          logDebug(`Template not found, using default`)
        }
      }

      // Generate PDF with template
      logDebug(`Generating PDF for report ${id}`)
      const reportWithTemplate = {
        ...report,
        template: template
      }
      
      const pdfBlob = await generatePDF(reportWithTemplate, template)
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Generated PDF is empty')
      }
      
      logDebug(`PDF generated, size: ${pdfBlob.size} bytes`)
      
      // Save PDF to storage
      logDebug(`Saving PDF to storage...`)
      const saved = await savePDFToStorage(report, pdfBlob)
      
      if (!saved) {
        logDebug(`Failed to save PDF to storage`)
        console.warn('⚠️ Failed to save PDF to storage')
      } else {
        logDebug(`PDF saved successfully`)
      }
      
      // Update report status to ready
      const updateData = {
        status: 'ready',
        updated_at: new Date().toISOString(),
        report_content: {
          ...(report.report_content as any || {}),
          status: 'ready',
          force_completed: true,
          force_completed_at: new Date().toISOString(),
          force_completed_by: user.email,
          force_completed_reason: reason || 'Manual admin override'
        }
      }
      
      logDebug(`Updating report status to ready`)
      const { data: updatedReport, error: updateError } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) {
        logDebug(`Update failed: ${updateError.message}`)
        console.error('Failed to update report status:', updateError)
        return NextResponse.json(
          { error: 'Failed to update report status', details: updateError.message },
          { status: 500 }
        )
      }
      
      logDebug(`✅ Report ${id} force completed successfully`)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Report force completed successfully',
        report: updatedReport,
        url: updatedReport.pdf_url
      })
    }
    
    // Handle refresh URL action (default)
    if (action === 'refresh') {
      logDebug(`🔄 Refreshing PDF URL for report: ${id}`)
      
      // If there's a storage path, generate a fresh signed URL
      if (report.storage_path) {
        logDebug(`Storage path found: ${report.storage_path}`)
        const { data: { signedUrl } } = await supabase
          .storage
          .from('reports')
          .createSignedUrl(report.storage_path, 31536000) // 1 year

        if (signedUrl) {
          logDebug(`Signed URL generated`)
          // Update the report with new URL
          await supabase
            .from('reports')
            .update({ pdf_url: signedUrl, updated_at: new Date().toISOString() })
            .eq('id', id)

          return NextResponse.json({ 
            success: true, 
            url: signedUrl,
            message: 'PDF URL refreshed successfully'
          })
        }
      }

      // If no storage path but we have a pdf_url, return it
      if (report.pdf_url) {
        logDebug(`Using existing PDF URL: ${report.pdf_url}`)
        return NextResponse.json({ 
          success: true, 
          url: report.pdf_url,
          message: 'Using existing PDF URL'
        })
      }

      // If report is ready but no PDF, try to generate it
      if (report.status === 'ready') {
        logDebug(`Report ready but no PDF, attempting to generate...`)
        
        // Get template if associated
        let template = null
        if (report.template_id) {
          template = await getTemplateServer(report.template_id, report.user_id)
        }
        
        // Generate PDF
        const reportWithTemplate = { ...report, template }
        const pdfBlob = await generatePDF(reportWithTemplate, template)
        
        if (pdfBlob && pdfBlob.size > 0) {
          const saved = await savePDFToStorage(report, pdfBlob)
          if (saved) {
            const { data: refreshedReport } = await supabase
              .from('reports')
              .select('pdf_url')
              .eq('id', id)
              .single()
            
            if (refreshedReport?.pdf_url) {
              logDebug(`PDF generated and saved`)
              return NextResponse.json({ 
                success: true, 
                url: refreshedReport.pdf_url,
                message: 'PDF generated successfully'
              })
            }
          }
        }
      }

      return NextResponse.json({ 
        error: 'No PDF available', 
        message: 'This report does not have an associated PDF file' 
      }, { status: 404 })
    }
    
    // Handle regenerate action (force regenerate PDF even if ready)
    if (action === 'regenerate') {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
      
      logDebug(`🔄 Regenerating PDF for report: ${id}`)
      
      // Get template if associated
      let template = null
      if (report.template_id) {
        template = await getTemplateServer(report.template_id, report.user_id)
      }
      
      // Generate new PDF
      const reportWithTemplate = { ...report, template }
      const pdfBlob = await generatePDF(reportWithTemplate, template)
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Generated PDF is empty')
      }
      
      // Save PDF to storage (overwrites existing)
      const saved = await savePDFToStorage(report, pdfBlob)
      
      if (!saved) {
        throw new Error('Failed to save PDF to storage')
      }
      
      // Get updated report with new URL
      const { data: updatedReport } = await supabase
        .from('reports')
        .select('pdf_url, updated_at')
        .eq('id', id)
        .single()
      
      logDebug(`PDF regenerated successfully`)
      
      return NextResponse.json({ 
        success: true, 
        url: updatedReport?.pdf_url,
        message: 'PDF regenerated successfully',
        report: updatedReport
      })
    }
    
    // Invalid action
    return NextResponse.json({ 
      error: 'Invalid action', 
      message: 'Supported actions: refresh, force-complete, regenerate' 
    }, { status: 400 })
    
  } catch (error) {
    logDebug(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.error('Error processing report action:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}

// Handle GET requests for checking report status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
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
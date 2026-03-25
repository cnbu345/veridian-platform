// src/lib/reports/storage.ts
import { createClient } from '@/lib/supabase/server'
import { GeneratedReport, ReportRequest } from './types'

// Save report request to database
export async function saveReportRequest(
  userId: string,
  request: ReportRequest,
  paymentId?: string,
  templateId?: string | null
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      company_name: request.company.name,
      industry: request.company.industry,
      city: request.location.city,
      state: request.location.state,
      location_tier: request.location.tier,
      nearest_major_city: request.location.nearestRegulatoryHub || request.location.nearestMajorCity,
      report_content: {
        ...request,
        status: 'pending',
        created_at: new Date().toISOString(),
        template_id: templateId
      },
      stripe_payment_id: paymentId,
      template_id: templateId,
      status: 'pending',  // ← Explicitly set root status column
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error saving report request:', error)
    throw new Error(`Failed to save report: ${error.message}`)
  }
  
  return data
}

// Get user's reports - includes template info
export async function getUserReports(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      user_templates (
        id,
        name,
        logo_url,
        styles
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user reports:', error)
    throw new Error(`Failed to fetch reports: ${error.message}`)
  }
  
  // Transform the data to include template info in a consistent format
  return (data || []).map(report => ({
    ...report,
    template: report.user_templates || null
  })) as (GeneratedReport & { template: any })[]
}

// Get single report - includes template info
export async function getReport(reportId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      user_templates (
        id,
        name,
        logo_url,
        styles,
        sections
      )
    `)
    .eq('id', reportId)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching report:', error)
    throw new Error(`Failed to fetch report: ${error.message}`)
  }
  
  return {
    ...data,
    template: data.user_templates || null
  } as GeneratedReport & { template: any }
}

// Update report status - FIXED: Updates the root status column
export async function updateReportStatus(
  reportId: string,
  status: 'generating' | 'ready' | 'failed',
  content?: any,
  templateId?: string | null
) {
  const supabase = await createClient()
  
  const updateData: any = {
    status: status,  // ← CRITICAL: Update the root status column!
    updated_at: new Date().toISOString()
  }
  
  // Also update report_content if provided
  if (content !== undefined) {
    updateData.report_content = {
      ...content,
      status,
      updated_at: new Date().toISOString()
    }
  } else {
    // If no content provided, still update the status in report_content for consistency
    // Fetch current report to preserve existing content
    const { data: currentReport } = await supabase
      .from('reports')
      .select('report_content')
      .eq('id', reportId)
      .single()
    
    if (currentReport?.report_content) {
      updateData.report_content = {
        ...currentReport.report_content,
        status,
        updated_at: new Date().toISOString()
      }
    }
  }
  
  if (templateId !== undefined) {
    updateData.template_id = templateId
  }
  
  const { error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)
  
  if (error) {
    console.error('Error updating report status:', error)
    throw new Error(`Failed to update report: ${error.message}`)
  }
  
  console.log(`✅ Report ${reportId} status updated to: ${status}`)
}

// Delete report
export async function deleteReport(reportId: string, userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting report:', error)
    throw new Error(`Failed to delete report: ${error.message}`)
  }
}

// Get user templates for dropdown
export async function getUserTemplates(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_templates')
    .select('id, name, description, logo_url, styles, is_default')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user templates:', error)
    return []
  }
  
  return data || []
}

// Get report with full details including template
export async function getReportWithTemplate(reportId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      user_templates (
        id,
        name,
        description,
        logo_url,
        styles,
        sections,
        is_default
      )
    `)
    .eq('id', reportId)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching report with template:', error)
    throw new Error(`Failed to fetch report: ${error.message}`)
  }
  
  return {
    ...data,
    template: data.user_templates || null
  }
}

// Get recent reports for dashboard
export async function getRecentReports(userId: string, limit: number = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reports')
    .select(`
      id,
      company_name,
      status,
      created_at,
      template_id,
      user_templates (
        id,
        name,
        logo_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching recent reports:', error)
    throw new Error(`Failed to fetch recent reports: ${error.message}`)
  }
  
  return (data || []).map(report => ({
    ...report,
    template: report.user_templates || null
  }))
}

// Get report counts by status
export async function getReportStats(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reports')
    .select('status')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching report stats:', error)
    return { total: 0, pending: 0, generating: 0, ready: 0, failed: 0 }
  }
  
  const stats = {
    total: data?.length || 0,
    pending: data?.filter(r => r.status === 'pending').length || 0,
    generating: data?.filter(r => r.status === 'generating').length || 0,
    ready: data?.filter(r => r.status === 'ready').length || 0,
    failed: data?.filter(r => r.status === 'failed').length || 0
  }
  
  return stats
}
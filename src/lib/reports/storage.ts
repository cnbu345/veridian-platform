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
      status: 'pending',
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

// Update report status - NOW INCLUDES LICENSING DATA
export async function updateReportStatus(
  reportId: string,
  status: 'generating' | 'ready' | 'failed',
  content?: any,
  templateId?: string | null,
  licensingData?: any  // NEW: Accept licensing data
) {
  const supabase = await createClient()
  
  // Fetch current report to preserve existing content
  const { data: currentReport } = await supabase
    .from('reports')
    .select('report_content')
    .eq('id', reportId)
    .single()
  
  const updateData: any = {
    status: status,
    updated_at: new Date().toISOString()
  }
  
  // Build updated report_content
  let updatedContent: any = {}
  
  if (currentReport?.report_content) {
    updatedContent = { ...currentReport.report_content }
  }
  
  if (content !== undefined) {
    updatedContent = {
      ...updatedContent,
      ...content,
      status,
      updated_at: new Date().toISOString()
    }
  } else {
    updatedContent.status = status
    updatedContent.updated_at = new Date().toISOString()
  }
  
  // CRITICAL: Store full licensing data in report_content
  if (licensingData) {
    updatedContent.licensing_data = licensingData
    console.log(`✅ Stored licensing data for ${licensingData.state_code} in report ${reportId}`)
  }
  
  updateData.report_content = updatedContent
  
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

// NEW: Fetch full licensing data for a state
export async function fetchLicensingData(stateCode: string): Promise<any | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .single()
    
    if (error) {
      console.warn(`No licensing data found for ${stateCode}:`, error.message)
      return null
    }
    
    console.log(`✅ Retrieved full licensing data for ${stateCode}`)
    return data
  } catch (error) {
    console.error(`Error fetching licensing data for ${stateCode}:`, error)
    return null
  }
}

// NEW: Fetch licensing data for multiple states
export async function fetchMultiStateLicensingData(stateCodes: string[]): Promise<any[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .in('state_code', stateCodes.map(s => s.toUpperCase()))
    
    if (error) {
      console.warn('Error fetching multi-state licensing data:', error.message)
      return []
    }
    
    console.log(`✅ Retrieved licensing data for ${data?.length || 0} states`)
    return data || []
  } catch (error) {
    console.error('Error fetching multi-state licensing data:', error)
    return []
  }
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
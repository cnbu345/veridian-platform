// src/lib/reports/storage.ts
import { createClient } from '@/lib/supabase/server'
import { GeneratedReport, ReportRequest } from './types'

// Save report request to database
export async function saveReportRequest(
  userId: string,
  request: ReportRequest,
  paymentId?: string
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
        created_at: new Date().toISOString()
      },
      stripe_payment_id: paymentId,
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

// Get user's reports
export async function getUserReports(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user reports:', error)
    throw new Error(`Failed to fetch reports: ${error.message}`)
  }
  
  return data as GeneratedReport[]
}

// Get single report
export async function getReport(reportId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching report:', error)
    throw new Error(`Failed to fetch report: ${error.message}`)
  }
  
  return data as GeneratedReport
}

// Update report status
export async function updateReportStatus(
  reportId: string,
  status: 'generating' | 'ready' | 'failed',
  content?: any
) {
  const supabase = await createClient()
  
  const currentContent = content || {}
  
  const { error } = await supabase
    .from('reports')
    .update({
      report_content: {
        ...currentContent,
        status,
        updated_at: new Date().toISOString()
      }
    })
    .eq('id', reportId)
  
  if (error) {
    console.error('Error updating report status:', error)
    throw new Error(`Failed to update report: ${error.message}`)
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
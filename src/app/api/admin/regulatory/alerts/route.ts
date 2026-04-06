// src/app/api/admin/regulatory/alerts/route.ts
// GET - Fetch regulatory alerts from various sources

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface RegulatoryAlert {
  id: string
  state: string
  state_code: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  effective_date: string | null
  source_url: string
  type: 'legislation' | 'enforcement' | 'update' | 'review'
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const severity = searchParams.get('severity')
    const state = searchParams.get('state')

    const alerts: RegulatoryAlert[] = []

    // 1. Get pending regulatory updates (from regulatory_updates table)
    const { data: updates } = await supabase
      .from('regulatory_updates')
      .select('*')
      .eq('status', 'pending_review')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)

    if (updates) {
      for (const update of updates) {
        alerts.push({
          id: `update-${update.id}`,
          state: getStateName(update.state_code),
          state_code: update.state_code,
          title: update.title,
          description: update.description || `Pending review: ${update.category} update`,
          severity: mapPriorityToSeverity(update.priority),
          effective_date: update.effective_date,
          source_url: update.source_url,
          type: 'update',
          created_at: update.created_at
        })
      }
    }

    // 2. Get recent enacted legislation (from legislation_tracker)
    const { data: legislation } = await supabase
      .from('legislation_tracker')
      .select('*')
      .in('status', ['enacted', 'passed_house', 'passed_senate'])
      .order('introduced_date', { ascending: false })
      .limit(5)

    if (legislation) {
      for (const bill of legislation) {
        let severity: 'high' | 'medium' | 'low' = 'medium'
        if (bill.status === 'enacted') severity = 'high'
        if (bill.status === 'passed_house' || bill.status === 'passed_senate') severity = 'medium'
        
        alerts.push({
          id: `leg-${bill.id}`,
          state: getStateName(bill.state_code),
          state_code: bill.state_code,
          title: bill.title,
          description: `${bill.bill_number} - Status: ${bill.status}`,
          severity,
          effective_date: bill.effective_date,
          source_url: bill.bill_url || '',
          type: 'legislation',
          created_at: bill.introduced_date
        })
      }
    }

    // 3. Get recent enforcement actions
    const { data: enforcement } = await supabase
      .from('enforcement_actions')
      .select('*')
      .order('action_date', { ascending: false })
      .limit(5)

    if (enforcement) {
      for (const action of enforcement) {
        alerts.push({
          id: `enf-${action.id}`,
          state: getStateName(action.state_code),
          state_code: action.state_code,
          title: `${action.action_type.replace('_', ' ')}: ${action.defendant}`,
          description: action.description || `${action.agency_name} enforcement action`,
          severity: 'high',
          effective_date: action.action_date,
          source_url: action.source_url || '',
          type: 'enforcement',
          created_at: action.action_date
        })
      }
    }

    // 4. Get facts pending review (from review queue)
    const { data: pendingReviews } = await supabase
      .from('regulatory_review_queue')
      .select(`
        id,
        fact_id,
        reason,
        priority,
        created_at,
        regulatory_facts!inner (
          state_code,
          claim
        )
      `)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .limit(3)

    if (pendingReviews) {
      for (const review of pendingReviews) {
        const fact = review.regulatory_facts as any
        alerts.push({
          id: `review-${review.id}`,
          state: getStateName(fact?.state_code),
          state_code: fact?.state_code,
          title: 'Fact Pending Verification',
          description: fact?.claim?.substring(0, 150) || 'Regulatory fact needs attorney review',
          severity: mapPriorityToSeverity(review.priority),
          effective_date: null,
          source_url: '',
          type: 'review',
          created_at: review.created_at
        })
      }
    }

    // Sort by severity and date
    const severityOrder = { high: 0, medium: 1, low: 2 }
    alerts.sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Apply filters
    let filteredAlerts = alerts
    if (severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === severity)
    }
    if (state) {
      filteredAlerts = filteredAlerts.filter(a => a.state_code === state)
    }

    // Limit results
    filteredAlerts = filteredAlerts.slice(0, limit)

    // Get counts by severity for the badge
    const counts = {
      total: alerts.length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length
    }

    return NextResponse.json({
      alerts: filteredAlerts,
      counts
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper: Map state code to state name
function getStateName(stateCode: string): string {
  const states: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming'
  }
  return states[stateCode] || stateCode
}

// Helper: Map priority to severity
function mapPriorityToSeverity(priority: string): 'high' | 'medium' | 'low' {
  switch (priority) {
    case 'critical': return 'high'
    case 'high': return 'high'
    case 'medium': return 'medium'
    case 'low': return 'low'
    default: return 'medium'
  }
}
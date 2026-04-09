// src/app/api/public/compare/route.ts
// Public API for comparing multiple states - INCLUDES FINANCIAL DATA

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to format currency
function formatCurrency(amount: number | null): string {
  if (amount === null) return 'Contact regulator'
  return `$${amount.toLocaleString()}`
}

// Helper function to format bond requirement
function formatBondRequirement(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Contact regulator'
  if (min !== null && max !== null && min !== max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }
  if (min !== null) return `$${min.toLocaleString()}`
  if (max !== null) return `$${max.toLocaleString()}`
  return 'Contact regulator'
}

// Helper function to format processing time
function formatProcessingTime(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Contact regulator'
  if (min !== null && max !== null && min !== max) {
    return `${min}-${max} months`
  }
  if (min !== null) return `${min} months`
  if (max !== null) return `${max} months`
  return 'Contact regulator'
}

// Map license type to user-friendly label
function getLicenseLabel(licenseRequired: string): string {
  const labels: Record<string, string> = {
    'none': 'No License Required',
    'mtl': 'Money Transmitter License',
    'bitlicense': 'BitLicense',
    'dfpi': 'DFPI License',
    'varies': 'Varies by Activity'
  }
  return labels[licenseRequired] || licenseRequired
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { stateCodes, email } = body
    
    if (!stateCodes || stateCodes.length < 2) {
      return NextResponse.json(
        { error: 'Please select at least 2 states to compare' },
        { status: 400 }
      )
    }
    
    if (stateCodes.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 states can be compared at once' },
        { status: 400 }
      )
    }
    
    // Fetch all selected states from licensing_requirements (source of truth)
    const { data: requirements, error: requirementsError } = await supabase
      .from('licensing_requirements')
      .select('*')
      .in('state_code', stateCodes)
    
    if (requirementsError) {
      console.error('Error fetching licensing requirements:', requirementsError)
      return NextResponse.json({ error: requirementsError.message }, { status: 500 })
    }
    
    // Fetch regulator links for each state
    const { data: regulatorLinks } = await supabase
      .from('state_regulator_links')
      .select('*')
      .in('state_code', stateCodes)
    
    const linksMap = new Map()
    regulatorLinks?.forEach(link => {
      linksMap.set(link.state_code, link)
    })
    
    // Fetch enforcement actions for each state (last 2 years)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    
    const { data: enforcementActions } = await supabase
      .from('enforcement_actions')
      .select('state_code, action_type, defendant, penalty_amount, action_date')
      .in('state_code', stateCodes)
      .gte('action_date', twoYearsAgo.toISOString())
      .order('action_date', { ascending: false })
    
    const enforcementMap = new Map<string, any[]>()
    enforcementActions?.forEach(action => {
      if (!enforcementMap.has(action.state_code)) {
        enforcementMap.set(action.state_code, [])
      }
      enforcementMap.get(action.state_code)!.push(action)
    })
    
    // Fetch pending legislation for each state
    const { data: legislation } = await supabase
      .from('legislation_tracker')
      .select('state_code, bill_number, title, status, introduced_date')
      .in('state_code', stateCodes)
      .not('status', 'in', '("enacted","failed","vetoed")')
      .order('introduced_date', { ascending: false })
    
    const legislationMap = new Map<string, any[]>()
    legislation?.forEach(bill => {
      if (!legislationMap.has(bill.state_code)) {
        legislationMap.set(bill.state_code, [])
      }
      legislationMap.get(bill.state_code)!.push(bill)
    })
    
    // States with no income tax
    const NO_INCOME_TAX_STATES = new Set([
      'TX', 'FL', 'NV', 'SD', 'TN', 'WY', 'AK', 'NH', 'WA'
    ])
    
    // Build comparison data with ALL fields
    const comparisonData = requirements.map(state => {
      const stateEnforcement = enforcementMap.get(state.state_code) || []
      const stateLegislation = legislationMap.get(state.state_code) || []
      
      // Format enforcement history as readable text
      let enforcementHistory = 'Limited enforcement history'
      if (stateEnforcement.length > 0) {
        const recentActions = stateEnforcement.slice(0, 3)
        enforcementHistory = recentActions.map(a => 
          `${a.action_type.replace('_', ' ')} against ${a.defendant}${a.penalty_amount ? ` ($${a.penalty_amount.toLocaleString()})` : ''}`
        ).join('; ')
        if (stateEnforcement.length > 3) {
          enforcementHistory += ` and ${stateEnforcement.length - 3} more`
        }
      }
      
      // Format pending legislation as readable text
      let pendingLegislation = 'No pending legislation identified'
      if (stateLegislation.length > 0) {
        const activeBills = stateLegislation.slice(0, 3)
        pendingLegislation = activeBills.map(b => 
          `${b.bill_number}: ${b.title.substring(0, 60)}${b.title.length > 60 ? '...' : ''} (${b.status.replace('_', ' ')})`
        ).join('; ')
        if (stateLegislation.length > 3) {
          pendingLegislation += ` and ${stateLegislation.length - 3} more bills`
        }
      }
      
      // Determine tax treatment
      const taxTreatment = NO_INCOME_TAX_STATES.has(state.state_code) 
        ? 'No state income tax' 
        : 'Income tax applies'
      
      return {
        state_code: state.state_code,
        state_name: state.state_code,
        climate: state.regulatory_climate,
        license_required: state.license_required,
        license_label: getLicenseLabel(state.license_required),
        license_description: state.license_description || 'Information available upon request',
        tax_treatment: taxTreatment,
        regulator_name: state.source_name,
        // FINANCIAL FIELDS - NOW INCLUDED
        application_fee: state.application_fee,
        application_fee_formatted: formatCurrency(state.application_fee),
        bond_requirement: formatBondRequirement(state.bond_requirement_min, state.bond_requirement_max),
        processing_time: formatProcessingTime(state.processing_time_min_months, state.processing_time_max_months),
        regulator_link: linksMap.get(state.state_code) || null,
        crypto_regulations: state.license_description || state.notes || 'Information available upon request',
        enforcement_history: enforcementHistory,
        pending_legislation: pendingLegislation,
        notes: state.notes
      }
    })
    
    // Track comparison for analytics (if email provided)
    if (email) {
      await supabase.from('regulatory_audit_log').insert({
        table_name: 'state_comparison',
        record_id: crypto.randomUUID(),
        action: 'COMPARE',
        new_data: { stateCodes, email },
        changed_at: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      states: comparisonData,
      comparisonDate: new Date().toISOString(),
      totalStates: comparisonData.length
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
// src/app/api/public/states/route.ts
// Public API for state licensing requirements - FULLY FUNCTIONAL
// Last updated: April 9, 2026

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// State name mapping
const STATE_NAMES: Record<string, string> = {
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
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
}

// States with no income tax
const NO_INCOME_TAX_STATES = new Set([
  'TX', 'FL', 'NV', 'SD', 'TN', 'WY', 'AK', 'NH', 'WA'
])

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

// Format currency for display
function formatCurrency(amount: number | null): string {
  if (amount === null) return 'Contact regulator'
  return `$${amount.toLocaleString()}`
}

// Format bond requirement for display
function formatBondRequirement(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Contact regulator'
  if (min !== null && max !== null && min !== max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }
  if (min !== null) return `$${min.toLocaleString()}`
  if (max !== null) return `$${max.toLocaleString()}`
  return 'Contact regulator'
}

// Format processing time for display
function formatProcessingTime(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Contact regulator'
  if (min !== null && max !== null && min !== max) {
    return `${min}-${max} months`
  }
  if (min !== null) return `${min} months`
  if (max !== null) return `${max} months`
  return 'Contact regulator'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const stateCode = searchParams.get('state')
    const climate = searchParams.get('climate')
    const licenseRequired = searchParams.get('license_required')
    
    // Query 1: Get licensing requirements from source of truth
    let licensingQuery = supabase
      .from('licensing_requirements')
      .select('*')
      .order('state_code', { ascending: true })
    
    if (stateCode) {
      licensingQuery = licensingQuery.eq('state_code', stateCode.toUpperCase())
    }
    
    if (climate) {
      licensingQuery = licensingQuery.eq('regulatory_climate', climate)
    }
    
    if (licenseRequired) {
      licensingQuery = licensingQuery.eq('license_required', licenseRequired)
    }
    
    const { data: requirements, error: licensingError } = await licensingQuery
    
    if (licensingError) {
      console.error('Error fetching licensing requirements:', licensingError)
      return NextResponse.json({ error: licensingError.message }, { status: 500 })
    }
    
    if (!requirements || requirements.length === 0) {
      return NextResponse.json({
        states: [],
        total: 0,
        filters: { climates: [], license_types: [] }
      })
    }
    
    // Get state codes for secondary queries
    const stateCodes = requirements.map(r => r.state_code)
    
    // Query 2: Get regulator links for each state
    const { data: regulatorLinks } = await supabase
      .from('state_regulator_links')
      .select('*')
      .in('state_code', stateCodes)
    
    const linksMap = new Map()
    regulatorLinks?.forEach(link => {
      linksMap.set(link.state_code, link)
    })
    
    // Query 3: Get recent enforcement actions (last 2 years)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    
    const { data: enforcementActions } = await supabase
      .from('enforcement_actions')
      .select('state_code, action_type, defendant, penalty_amount, action_date, description')
      .in('state_code', stateCodes)
      .gte('action_date', twoYearsAgo.toISOString())
      .order('action_date', { ascending: false })
    
    // Group enforcement actions by state
    const enforcementMap = new Map<string, any[]>()
    enforcementActions?.forEach(action => {
      if (!enforcementMap.has(action.state_code)) {
        enforcementMap.set(action.state_code, [])
      }
      enforcementMap.get(action.state_code)!.push({
        type: action.action_type,
        defendant: action.defendant,
        penalty: action.penalty_amount ? `$${action.penalty_amount.toLocaleString()}` : null,
        date: action.action_date,
        description: action.description
      })
    })
    
    // Query 4: Get pending legislation (not enacted or failed)
    const { data: legislation } = await supabase
      .from('legislation_tracker')
      .select('state_code, bill_number, title, status, introduced_date, effective_date')
      .in('state_code', stateCodes)
      .not('status', 'in', '("enacted","failed","vetoed")')
      .order('introduced_date', { ascending: false })
    
    // Group legislation by state
    const legislationMap = new Map<string, any[]>()
    legislation?.forEach(bill => {
      if (!legislationMap.has(bill.state_code)) {
        legislationMap.set(bill.state_code, [])
      }
      legislationMap.get(bill.state_code)!.push({
        bill_number: bill.bill_number,
        title: bill.title,
        status: bill.status,
        introduced_date: bill.introduced_date,
        effective_date: bill.effective_date
      })
    })
    
    // Build complete state data
    const statesWithDetails = requirements.map(state => {
      const stateEnforcement = enforcementMap.get(state.state_code) || []
      const stateLegislation = legislationMap.get(state.state_code) || []
      
      // Format enforcement history as readable text
      let enforcementHistory = 'Limited enforcement history'
      if (stateEnforcement.length > 0) {
        const recentActions = stateEnforcement.slice(0, 3)
        enforcementHistory = recentActions.map(a => 
          `${a.type} against ${a.defendant}${a.penalty ? ` (${a.penalty})` : ''}`
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
      
      const regulatorLink = linksMap.get(state.state_code)
      
      return {
        state_code: state.state_code,
        state_name: STATE_NAMES[state.state_code] || state.state_code,
        crypto_regulations: state.license_description || state.notes || 'Information available upon request',
        tax_treatment: NO_INCOME_TAX_STATES.has(state.state_code) ? 'No state income tax' : 'Income tax applies',
        regulatory_climate: state.regulatory_climate,
        license_required: state.license_required,
        license_label: getLicenseLabel(state.license_required),
        license_description: state.license_description,
        enforcement_history: enforcementHistory,
        pending_legislation: pendingLegislation,
        regulator_name: state.source_name,
        regulator_phone: state.regulator_phone,
        regulator_email: state.regulator_email,
        regulator_website: state.source_url,
        application_fee: state.application_fee,
        application_fee_formatted: formatCurrency(state.application_fee),
        bond_requirement: formatBondRequirement(state.bond_requirement_min, state.bond_requirement_max),
        processing_time: formatProcessingTime(state.processing_time_min_months, state.processing_time_max_months),
        notes: state.notes,
        regulator_link: regulatorLink ? {
          website_url: regulatorLink.website_url,
          license_page_url: regulatorLink.license_page_url,
          enforcement_page_url: regulatorLink.enforcement_page_url
        } : null,
        // Include raw data for debugging (remove in production if desired)
        _debug: {
          enforcement_count: stateEnforcement.length,
          legislation_count: stateLegislation.length
        }
      }
    })
    
    // Get filter options from actual data
    const uniqueClimates = [...new Set(requirements.map(r => r.regulatory_climate).filter(Boolean))]
    const uniqueLicenseTypes = [...new Set(requirements.map(r => r.license_required).filter(Boolean))]
    
    return NextResponse.json({
      states: statesWithDetails,
      total: statesWithDetails.length,
      filters: {
        climates: uniqueClimates,
        license_types: uniqueLicenseTypes
      }
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
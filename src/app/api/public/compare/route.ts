// src/app/api/public/compare/route.ts
// Public API for comparing multiple states - WITH DEBUGGING

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with public anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('[Compare API] Initializing...')
console.log('[Compare API] Supabase URL present:', supabaseUrl ? '✅' : '❌')
console.log('[Compare API] Anon key present:', supabaseAnonKey ? '✅' : '❌')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function formatCurrency(amount: number | null): string {
  if (amount === null) return 'Contact regulator'
  return `$${amount.toLocaleString()}`
}

function formatBondRequirement(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Contact regulator'
  if (min !== null && max !== null && min !== max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }
  if (min !== null) return `$${min.toLocaleString()}`
  if (max !== null) return `$${max.toLocaleString()}`
  return 'Contact regulator'
}

function formatProcessingTime(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Contact regulator'
  if (min !== null && max !== null && min !== max) {
    return `${min}-${max} months`
  }
  if (min !== null) return `${min} months`
  if (max !== null) return `${max} months`
  return 'Contact regulator'
}

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

const NO_INCOME_TAX_STATES = new Set([
  'TX', 'FL', 'NV', 'SD', 'TN', 'WY', 'AK', 'NH', 'WA'
])

export async function POST(request: NextRequest) {
  console.log('[Compare API] Request received at:', new Date().toISOString())
  
  try {
    const body = await request.json()
    const { stateCodes, email } = body
    
    console.log('[Compare API] Request body:', { stateCodes, email: email ? 'present' : 'not provided' })
    
    if (!stateCodes || stateCodes.length < 2) {
      console.log('[Compare API] ❌ Less than 2 states selected')
      return NextResponse.json(
        { error: 'Please select at least 2 states to compare' },
        { status: 400 }
      )
    }
    
    if (stateCodes.length > 3) {
      console.log('[Compare API] ❌ More than 3 states selected')
      return NextResponse.json(
        { error: 'Maximum 3 states can be compared at once' },
        { status: 400 }
      )
    }
    
    console.log('[Compare API] Fetching requirements for states:', stateCodes)
    
    const { data: requirements, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .in('state_code', stateCodes)
    
    if (error) {
      console.error('[Compare API] ❌ Database error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('[Compare API] 📊 Fetched', requirements?.length || 0, 'requirements')
    
    if (!requirements || requirements.length === 0) {
      console.warn('[Compare API] ⚠️ No requirements found for states:', stateCodes)
      return NextResponse.json({
        states: [],
        comparisonDate: new Date().toISOString(),
        totalStates: 0,
        message: 'No data found for selected states. Please add licensing requirements via the admin panel.'
      })
    }
    
    // Build comparison data
    const comparisonData = requirements.map(state => {
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
        application_fee: state.application_fee,
        application_fee_formatted: formatCurrency(state.application_fee),
        bond_requirement: formatBondRequirement(state.bond_requirement_min, state.bond_requirement_max),
        processing_time: formatProcessingTime(state.processing_time_min_months, state.processing_time_max_months),
        regulator_link: null,
        crypto_regulations: state.license_description || state.notes || 'Information available upon request',
        enforcement_history: 'Limited enforcement history',
        pending_legislation: 'No pending legislation identified',
        notes: state.notes
      }
    })
    
    console.log('[Compare API] ✅ Returning', comparisonData.length, 'states')
    
    // Track comparison for analytics (if email provided)
    if (email) {
      await supabase.from('regulatory_audit_log').insert({
        table_name: 'state_comparison',
        record_id: crypto.randomUUID(),
        action: 'COMPARE',
        new_data: { stateCodes, email },
        changed_at: new Date().toISOString()
      }).catch(err => console.error('[Compare API] Failed to log:', err))
    }
    
    return NextResponse.json({
      states: comparisonData,
      comparisonDate: new Date().toISOString(),
      totalStates: comparisonData.length
    })
    
  } catch (error) {
    console.error('[Compare API] 💥 Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
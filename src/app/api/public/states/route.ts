// src/app/api/public/states/route.ts
// Public API for state licensing requirements - WITH DEBUGGING

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with public anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('[States API] ========================================')
console.log('[States API] Initializing...')
console.log('[States API] Supabase URL present:', supabaseUrl ? '✅' : '❌')
console.log('[States API] Anon key present:', supabaseAnonKey ? '✅' : '❌')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export async function GET(request: NextRequest) {
  console.log('[States API] Request received at:', new Date().toISOString())
  
  try {
    // Step 1: Test database connection
    console.log('[States API] Step 1: Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('licensing_requirements')
      .select('state_code', { count: 'exact', head: true })
    
    if (testError) {
      console.error('[States API] ❌ Database connection failed:', testError.message)
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: testError.message,
        hint: 'Check if licensing_requirements table exists'
      }, { status: 500 })
    }
    
    console.log('[States API] ✅ Database connection successful')
    
    // Step 2: Fetch all requirements
    console.log('[States API] Step 2: Fetching licensing requirements...')
    const { data: requirements, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .order('state_code', { ascending: true })
    
    if (error) {
      console.error('[States API] ❌ Error fetching requirements:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('[States API] 📊 Fetched', requirements?.length || 0, 'requirements from database')
    
    // Step 3: If no data, return helpful message
    if (!requirements || requirements.length === 0) {
      console.warn('[States API] ⚠️ No requirements found in licensing_requirements table!')
      console.warn('[States API] 💡 Tip: Run the seed script or add data via Licensing Manager')
      
      // Return empty but valid response
      return NextResponse.json({
        states: [],
        total: 0,
        filters: { climates: ['friendly', 'moderate', 'strict'], license_types: ['none', 'mtl', 'bitlicense', 'dfpi', 'varies'] },
        message: 'No data found. Please add licensing requirements via the admin panel.'
      })
    }
    
    // Step 4: Log first record sample
    const firstRecord = requirements[0]
    console.log('[States API] 📝 Sample record:', {
      state_code: firstRecord.state_code,
      license_required: firstRecord.license_required,
      regulatory_climate: firstRecord.regulatory_climate,
      application_fee: firstRecord.application_fee,
      has_bond: firstRecord.bond_requirement_min !== null
    })
    
    // Step 5: Build response
    const statesWithDetails = requirements.map(state => {
      return {
        state_code: state.state_code,
        state_name: STATE_NAMES[state.state_code] || state.state_code,
        crypto_regulations: state.license_description || state.notes || 'Information available upon request',
        tax_treatment: NO_INCOME_TAX_STATES.has(state.state_code) ? 'No state income tax' : 'Income tax applies',
        regulatory_climate: state.regulatory_climate,
        license_required: state.license_required,
        license_label: getLicenseLabel(state.license_required),
        license_description: state.license_description,
        enforcement_history: 'Limited enforcement history',
        pending_legislation: 'No pending legislation identified',
        regulator_name: state.source_name,
        regulator_phone: state.regulator_phone,
        regulator_email: state.regulator_email,
        regulator_website: state.source_url,
        application_fee: state.application_fee,
        application_fee_formatted: formatCurrency(state.application_fee),
        bond_requirement: formatBondRequirement(state.bond_requirement_min, state.bond_requirement_max),
        processing_time: formatProcessingTime(state.processing_time_min_months, state.processing_time_max_months),
        notes: state.notes,
        regulator_link: null
      }
    })
    
    console.log('[States API] ✅ Returning', statesWithDetails.length, 'states to client')
    
    // Step 6: Return response
    return NextResponse.json({
      states: statesWithDetails,
      total: statesWithDetails.length,
      filters: {
        climates: ['friendly', 'moderate', 'strict'],
        license_types: ['none', 'mtl', 'bitlicense', 'dfpi', 'varies']
      }
    })
    
  } catch (error) {
    console.error('[States API] 💥 Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
// src/app/api/public/compare/route.ts
// Public API for comparing multiple states

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    
    // Fetch all selected states
    const { data: states, error } = await supabase
      .from('state_regulations')
      .select('*')
      .in('state_code', stateCodes)
    
    if (error) {
      console.error('Error fetching states:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Fetch regulator links
    const { data: regulatorLinks } = await supabase
      .from('state_regulator_links')
      .select('*')
      .in('state_code', stateCodes)
    
    const linksMap = new Map()
    regulatorLinks?.forEach(link => {
      linksMap.set(link.state_code, link)
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
    
    // Build comparison data
    const comparisonData = states.map(state => ({
      state_code: state.state_code,
      state_name: state.state_name,
      climate: state.regulatory_climate,
      license_required: state.license_required,
      license_description: state.license_description,
      tax_treatment: state.tax_treatment,
      regulator_name: state.regulator_name,
      regulator_link: linksMap.get(state.state_code),
      crypto_regulations: state.crypto_regulations,
      enforcement_history: state.enforcement_history,
      pending_legislation: state.pending_legislation,
      notes: state.notes
    }))
    
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
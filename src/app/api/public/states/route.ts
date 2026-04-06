// src/app/api/public/states/route.ts
// Public API for state licensing requirements (no auth required)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const stateCode = searchParams.get('state')
    const climate = searchParams.get('climate')
    const licenseRequired = searchParams.get('license_required')
    
    // Build query for state_regulations table
    let query = supabase
      .from('state_regulations')
      .select('*')
      .order('state_name', { ascending: true })
    
    if (stateCode) {
      query = query.eq('state_code', stateCode.toUpperCase())
    }
    
    if (climate) {
      query = query.eq('regulatory_climate', climate)
    }
    
    if (licenseRequired) {
      query = query.eq('license_required', licenseRequired)
    }
    
    const { data: regulations, error } = await query
    
    if (error) {
      console.error('Error fetching state regulations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Also fetch regulator links for each state
    const { data: regulatorLinks } = await supabase
      .from('state_regulator_links')
      .select('*')
    
    const linksMap = new Map()
    regulatorLinks?.forEach(link => {
      linksMap.set(link.state_code, link)
    })
    
    // Combine data
    const statesWithDetails = regulations?.map(state => ({
      ...state,
      regulator_link: linksMap.get(state.state_code) || null
    }))
    
    return NextResponse.json({
      states: statesWithDetails,
      total: statesWithDetails?.length || 0,
      filters: {
        climates: ['friendly', 'moderate', 'strict'],
        license_types: ['none', 'mtl', 'bitlicense', 'dfpi', 'varies']
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

// GET single state by code
export async function GET_STATE(request: NextRequest, { params }: { params: { stateCode: string } }) {
  try {
    const supabase = await createClient()
    const { stateCode } = params
    
    const { data: regulation, error } = await supabase
      .from('state_regulations')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .single()
    
    if (error || !regulation) {
      return NextResponse.json({ error: 'State not found' }, { status: 404 })
    }
    
    const { data: regulatorLink } = await supabase
      .from('state_regulator_links')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .single()
    
    return NextResponse.json({
      ...regulation,
      regulator_link: regulatorLink
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
// src/app/api/licensing/[state]/route.ts
// Public API endpoint for fetching licensing requirements

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ state: string }> }
) {
  try {
    // In Next.js 15+, params is a Promise that must be awaited
    const { state } = await context.params
    const stateCode = state.toUpperCase()
    
    console.log(`[API] Fetching licensing data for state: ${stateCode}`)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .eq('state_code', stateCode)
      .single()
    
    if (error) {
      console.error(`[API] Error fetching licensing data for ${stateCode}:`, error)
      return NextResponse.json(
        { error: 'Licensing data not found', details: error.message },
        { status: 404 }
      )
    }
    
    if (!data) {
      console.warn(`[API] No licensing data found for ${stateCode}`)
      return NextResponse.json(
        { error: 'No licensing data found for this state' },
        { status: 404 }
      )
    }
    
    console.log(`[API] ✅ Successfully retrieved licensing data for ${stateCode}`)
    
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
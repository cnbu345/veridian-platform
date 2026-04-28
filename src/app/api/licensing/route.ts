// src/app/api/licensing/route.ts
// API endpoint for fetching multiple states' licensing requirements

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const statesParam = searchParams.get('states')
    const states = statesParam ? statesParam.split(',').map(s => s.trim().toUpperCase()) : []
    
    if (states.length === 0) {
      return NextResponse.json(
        { error: 'No states provided' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .in('state_code', states)
    
    if (error) {
      console.error('Error fetching licensing data:', error)
      return NextResponse.json(
        { error: 'Licensing data not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ data: data || [] })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
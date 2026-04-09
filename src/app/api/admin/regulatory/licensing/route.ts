// src/app/api/admin/regulatory/licensing/route.ts
// Admin API for managing licensing requirements

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const stateCode = searchParams.get('state')
    const status = searchParams.get('status')
    
    let query = supabase
      .from('licensing_requirements')
      .select('*')
      .order('state_code', { ascending: true })
    
    if (stateCode) {
      query = query.eq('state_code', stateCode.toUpperCase())
    }
    
    if (status) {
      query = query.eq('verification_status', status)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching licensing requirements:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get session using Supabase (same as GET method)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { state_code, ...updates } = body
    
    if (!state_code) {
      return NextResponse.json({ error: 'State code is required' }, { status: 400 })
    }
    
    // Get current user from Supabase auth (not from users table)
    const userId = session.user.id
    const userEmail = session.user.email
    
    // Get existing record for audit
    const { data: existing } = await supabase
      .from('licensing_requirements')
      .select('*')
      .eq('state_code', state_code)
      .single()
    
    const { data, error } = await supabase
      .from('licensing_requirements')
      .upsert({
        ...updates,
        state_code,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error updating licensing requirement:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Log to audit
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'licensing_requirements',
      record_id: state_code,
      action: existing ? 'UPDATE' : 'CREATE',
      old_data: existing,
      new_data: data,
      changed_by: userId,
      changed_by_name: userEmail,
      changed_at: new Date().toISOString()
    })
    
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
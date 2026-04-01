// src/app/api/admin/regulatory/state-audit/route.ts
// GET /api/admin/regulatory/state-audit - Get all state audits
// POST /api/admin/regulatory/state-audit - Update a state audit

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('state_audit_tracker')
      .select('*')
      .order('state_code', { ascending: true })

    if (error) {
      console.error('Error fetching state audits:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { state_code, licensing_verified, fees_verified, bonding_verified, enforcement_verified, notes } = body

    const { data, error } = await supabase
      .from('state_audit_tracker')
      .upsert({
        state_code,
        last_reviewed: new Date().toISOString(),
        licensing_verified,
        fees_verified,
        bonding_verified,
        enforcement_verified,
        notes,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating state audit:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the change
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'state_audit_tracker',
      record_id: state_code,
      action: 'UPDATE',
      new_data: data,
      changed_by: user.id,
      changed_by_name: user.email,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
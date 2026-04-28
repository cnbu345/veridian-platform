// src/app/api/admin/risk-factors/route.ts
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
    const stateCode = searchParams.get('state_code')
    
    // Get risk factors
    const { data: risks, error: risksError } = await supabase
      .from('risk_factors')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (risksError) return NextResponse.json({ error: risksError.message }, { status: 500 })
    
    // Get state overrides if state code provided
    let overrides: any[] = []
    if (stateCode) {
      const { data: overrideData } = await supabase
        .from('risk_state_overrides')
        .select('*')
        .eq('state_code', stateCode)
      overrides = overrideData || []
    }
    
    // Combine
    const combined = risks.map(risk => ({
      ...risk,
      state_overrides: overrides.filter(o => o.risk_factor_id === risk.id)
    }))
    
    return NextResponse.json({ data: combined })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { state_overrides, ...riskData } = body
    
    const { data: risk, error: riskError } = await supabase
      .from('risk_factors')
      .insert(riskData)
      .select()
      .single()
    
    if (riskError) return NextResponse.json({ error: riskError.message }, { status: 500 })
    
    // Insert state overrides if provided
    if (state_overrides && state_overrides.length) {
      const overridesWithRiskId = state_overrides.map((o: any) => ({ ...o, risk_factor_id: risk.id }))
      await supabase.from('risk_state_overrides').insert(overridesWithRiskId)
    }
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'risk_factors',
      record_id: risk.id,
      action: 'INSERT',
      new_data: body,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ data: risk })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    
    const body = await request.json()
    const { state_overrides, ...riskData } = body
    
    const { data: oldData } = await supabase.from('risk_factors').select('*').eq('id', id).single()
    
    const { data: risk, error: riskError } = await supabase
      .from('risk_factors')
      .update(riskData)
      .eq('id', id)
      .select()
      .single()
    
    if (riskError) return NextResponse.json({ error: riskError.message }, { status: 500 })
    
    // Update state overrides (delete old, insert new)
    if (state_overrides) {
      await supabase.from('risk_state_overrides').delete().eq('risk_factor_id', id)
      if (state_overrides.length) {
        const overridesWithRiskId = state_overrides.map((o: any) => ({ ...o, risk_factor_id: id }))
        await supabase.from('risk_state_overrides').insert(overridesWithRiskId)
      }
    }
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'risk_factors',
      record_id: id,
      action: 'UPDATE',
      old_data: oldData,
      new_data: body,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ data: risk })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    
    const { data: oldData } = await supabase.from('risk_factors').select('*').eq('id', id).single()
    
    // Delete state overrides first
    await supabase.from('risk_state_overrides').delete().eq('risk_factor_id', id)
    
    const { error } = await supabase.from('risk_factors').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'risk_factors',
      record_id: id,
      action: 'DELETE',
      old_data: oldData,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
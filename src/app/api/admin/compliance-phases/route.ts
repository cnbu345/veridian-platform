// src/app/api/admin/compliance-phases/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get phases with their action items
    const { data: phases, error: phasesError } = await supabase
      .from('compliance_phases')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (phasesError) return NextResponse.json({ error: phasesError.message }, { status: 500 })
    
    const { data: actions, error: actionsError } = await supabase
      .from('action_items')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (actionsError) return NextResponse.json({ error: actionsError.message }, { status: 500 })
    
    // Combine phases with their action items
    const combined = phases.map(phase => ({
      ...phase,
      action_items: actions.filter(action => action.phase_id === phase.id)
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
    const { action_items, ...phaseData } = body
    
    // Insert phase
    const { data: phase, error: phaseError } = await supabase
      .from('compliance_phases')
      .insert(phaseData)
      .select()
      .single()
    
    if (phaseError) return NextResponse.json({ error: phaseError.message }, { status: 500 })
    
    // Insert action items if provided
    if (action_items && action_items.length) {
      const actionsWithPhaseId = action_items.map((item: any) => ({ ...item, phase_id: phase.id }))
      const { error: actionsError } = await supabase.from('action_items').insert(actionsWithPhaseId)
      if (actionsError) console.error('Error inserting action items:', actionsError)
    }
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'compliance_phases',
      record_id: phase.id,
      action: 'INSERT',
      new_data: body,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ data: phase })
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
    const { action_items, ...phaseData } = body
    
    const { data: oldData } = await supabase.from('compliance_phases').select('*').eq('id', id).single()
    
    // Update phase
    const { data: phase, error: phaseError } = await supabase
      .from('compliance_phases')
      .update(phaseData)
      .eq('id', id)
      .select()
      .single()
    
    if (phaseError) return NextResponse.json({ error: phaseError.message }, { status: 500 })
    
    // Update action items if provided (delete old, insert new)
    if (action_items) {
      await supabase.from('action_items').delete().eq('phase_id', id)
      if (action_items.length) {
        const actionsWithPhaseId = action_items.map((item: any) => ({ ...item, phase_id: id }))
        await supabase.from('action_items').insert(actionsWithPhaseId)
      }
    }
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'compliance_phases',
      record_id: id,
      action: 'UPDATE',
      old_data: oldData,
      new_data: body,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ data: phase })
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
    
    const { data: oldData } = await supabase.from('compliance_phases').select('*').eq('id', id).single()
    
    // Delete action items first
    await supabase.from('action_items').delete().eq('phase_id', id)
    
    const { error } = await supabase.from('compliance_phases').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'compliance_phases',
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
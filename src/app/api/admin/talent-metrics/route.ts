// src/app/api/admin/talent-metrics/route.ts
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
    const talentRank = searchParams.get('talent_rank')
    
    let query = supabase.from('talent_metrics').select('*')
    if (stateCode) query = query.eq('state_code', stateCode)
    if (talentRank) query = query.eq('talent_rank', talentRank)
    
    const { data, error } = await query.order('state_code', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ data })
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
    
    const { data, error } = await supabase.from('talent_metrics').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'talent_metrics',
      record_id: data.id,
      action: 'INSERT',
      new_data: body,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ data })
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
    
    const { data: oldData } = await supabase.from('talent_metrics').select('*').eq('id', id).single()
    
    const { data, error } = await supabase.from('talent_metrics').update(body).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'talent_metrics',
      record_id: id,
      action: 'UPDATE',
      old_data: oldData,
      new_data: body,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ data })
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
    
    const { data: oldData } = await supabase.from('talent_metrics').select('*').eq('id', id).single()
    
    const { error } = await supabase.from('talent_metrics').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'talent_metrics',
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
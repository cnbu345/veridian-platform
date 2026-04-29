// src/app/api/admin/metropolitan-areas/route.ts
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
    const isActive = searchParams.get('is_active')
    
    let query = supabase.from('metropolitan_areas').select('*')
    if (stateCode) query = query.contains('states', [stateCode])
    if (isActive) query = query.eq('is_active', isActive === 'true')
    
    const { data, error } = await query.order('sort_order', { ascending: true })
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
    
    const { data, error } = await supabase.from('metropolitan_areas').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'metropolitan_areas',
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
    
    const { data: oldData } = await supabase.from('metropolitan_areas').select('*').eq('id', id).single()
    
    const { data, error } = await supabase.from('metropolitan_areas').update(body).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'metropolitan_areas',
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
    
    const { data: oldData } = await supabase.from('metropolitan_areas').select('*').eq('id', id).single()
    
    const { error } = await supabase.from('metropolitan_areas').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'metropolitan_areas',
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
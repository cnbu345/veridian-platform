// src/app/api/admin/regulatory/legislation/route.ts
// GET /api/admin/regulatory/legislation - List bills
// POST /api/admin/regulatory/legislation - Add new bill

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
    const state = searchParams.get('state')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('legislation_tracker')
      .select(`
        *,
        reviewed_by_user:reviewed_by(id, email, full_name),
        created_by_user:created_by(id, email, full_name)
      `)
      .order('introduced_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (state) query = query.eq('state_code', state)
    if (status) query = query.eq('status', status)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching legislation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: { limit, offset, total: count }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    const { data, error } = await supabase
      .from('legislation_tracker')
      .insert({
        ...body,
        created_by: user?.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating legislation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('regulatory_audit_log').insert({
      table_name: 'legislation_tracker',
      record_id: data.id,
      action: 'CREATE',
      new_data: data,
      changed_by: user?.id,
      changed_by_name: session.user.email,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
// src/app/api/admin/regulatory/updates/route.ts
// GET /api/admin/regulatory/updates - List pending updates
// POST /api/admin/regulatory/updates - Create new update

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
    const status = searchParams.get('status') || 'pending_review'
    const state = searchParams.get('state')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('regulatory_updates')
      .select(`
        *,
        reviewed_by_user:reviewed_by(id, email, full_name),
        created_by_user:created_by(id, email, full_name)
      `)
      .eq('status', status)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (state) {
      query = query.eq('state_code', state)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching updates:', error)
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
      .from('regulatory_updates')
      .insert({
        ...body,
        created_by: user?.id,
        status: 'pending_review'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating update:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the action
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'regulatory_updates',
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
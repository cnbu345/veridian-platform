// src/app/api/admin/regulatory/audit/route.ts
// GET /api/admin/regulatory/audit - List audit log entries

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
    const table = searchParams.get('table')
    const recordId = searchParams.get('recordId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('regulatory_audit_log')
      .select(`
        *,
        user:changed_by(id, email, full_name)
      `)
      .order('changed_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (table) query = query.eq('table_name', table)
    if (recordId) query = query.eq('record_id', recordId)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching audit log:', error)
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
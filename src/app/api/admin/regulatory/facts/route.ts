// src/app/api/admin/regulatory/facts/route.ts
// GET /api/admin/regulatory/facts - List regulatory facts

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
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const needsReview = searchParams.get('needs_review') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('regulatory_facts')
      .select('*', { count: 'exact' })
      .order('review_required', { ascending: false })
      .order('confidence_score', { ascending: true })
      .order('state_code', { ascending: true })
      .range(offset, offset + limit - 1)

    if (state) query = query.eq('state_code', state)
    if (category) query = query.eq('category', category)
    if (status) query = query.eq('verification_status', status)
    if (needsReview) query = query.eq('review_required', true)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching facts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: { limit, offset, total: count }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
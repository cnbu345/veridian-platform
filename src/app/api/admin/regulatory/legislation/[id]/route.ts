// src/app/api/admin/regulatory/legislation/[id]/route.ts
// GET, PUT, DELETE individual legislation

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('legislation_tracker')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: existing } = await supabase
      .from('legislation_tracker')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('legislation_tracker')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating legislation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('regulatory_audit_log').insert({
      table_name: 'legislation_tracker',
      record_id: id,
      action: 'UPDATE',
      old_data: existing,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existing } = await supabase
      .from('legislation_tracker')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('legislation_tracker')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting legislation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('regulatory_audit_log').insert({
      table_name: 'legislation_tracker',
      record_id: id,
      action: 'DELETE',
      old_data: existing,
      changed_by: user.id,
      changed_by_name: user.email,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
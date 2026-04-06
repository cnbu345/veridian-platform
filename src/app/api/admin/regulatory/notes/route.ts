// src/app/api/admin/regulatory/notes/route.ts
// Full CRUD operations for regulatory notes

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List notes with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get('state')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('regulatory_notes')
      .select(`
        *,
        created_by_user:created_by(id, email, full_name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (state) query = query.eq('state_code', state)
    if (category) query = query.eq('category', category)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching notes:', error)
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

// POST - Create a new note
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('regulatory_notes')
      .insert({
        state_code: body.state_code || null,
        fact_id: body.fact_id || null,
        title: body.title,
        content: body.content,
        category: body.category || 'general',
        is_public: body.is_public || false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update a note
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, content, category, state_code, is_public } = body

    if (!id) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    // First, check if the note exists and user owns it
    const { data: existing, error: checkError } = await supabase
      .from('regulatory_notes')
      .select('created_by')
      .eq('id', id)
      .single()

    if (checkError) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Only allow the creator or admin to edit
    if (existing.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this note' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('regulatory_notes')
      .update({
        title: title,
        content: content,
        category: category,
        state_code: state_code || null,
        is_public: is_public || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating note:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a note
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    // Check if the note exists and user owns it
    const { data: existing, error: checkError } = await supabase
      .from('regulatory_notes')
      .select('created_by')
      .eq('id', id)
      .single()

    if (checkError) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Only allow the creator or admin to delete
    if (existing.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this note' }, { status: 403 })
    }

    const { error } = await supabase
      .from('regulatory_notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting note:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
// src/app/api/admin/kb/articles/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/admin/kb/articles/[id] - Update article
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, 
      slug, 
      content, 
      excerpt, 
      category_id, 
      tags, 
      is_published, 
      is_featured 
    } = body

    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (slug !== undefined) updates.slug = slug
    if (content !== undefined) updates.content = content
    if (excerpt !== undefined) updates.excerpt = excerpt
    if (category_id !== undefined) updates.category_id = category_id
    if (tags !== undefined) updates.tags = tags
    if (is_published !== undefined) updates.is_published = is_published
    if (is_featured !== undefined) updates.is_featured = is_featured
    
    updates.updated_at = new Date().toISOString()
    
    // If publishing for first time, set published_at
    if (is_published === true) {
      const { data: current } = await supabase
        .from('kb_articles')
        .select('published_at')
        .eq('id', id)
        .single()
      
      if (!current?.published_at) {
        updates.published_at = new Date().toISOString()
      }
    }

    const { data: article, error } = await supabase
      .from('kb_articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating article:', error)
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
    }

    return NextResponse.json({ success: true, article })
  } catch (error) {
    console.error('Error in article API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
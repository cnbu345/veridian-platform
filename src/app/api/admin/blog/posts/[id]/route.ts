// src/app/api/admin/blog/posts/[id]/route.ts - Individual Blog Post API
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/admin/blog/posts/[id] - Update post
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
      title, slug, excerpt, content, featured_image,
      category_id, status, tags, meta_title, meta_description,
      meta_keywords, is_featured, allow_comments
    } = body

    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (slug !== undefined) updates.slug = slug
    if (excerpt !== undefined) updates.excerpt = excerpt
    if (content !== undefined) updates.content = content
    if (featured_image !== undefined) updates.featured_image = featured_image
    if (category_id !== undefined) updates.category_id = category_id
    if (status !== undefined) updates.status = status
    if (tags !== undefined) updates.tags = tags
    if (meta_title !== undefined) updates.meta_title = meta_title
    if (meta_description !== undefined) updates.meta_description = meta_description
    if (meta_keywords !== undefined) updates.meta_keywords = meta_keywords
    if (is_featured !== undefined) updates.is_featured = is_featured
    if (allow_comments !== undefined) updates.allow_comments = allow_comments

    updates.updated_at = new Date().toISOString()

    // If publishing for first time, set published_at
    if (status === 'published') {
      const { data: current } = await supabase
        .from('blog_posts')
        .select('published_at')
        .eq('id', id)
        .single()
      
      if (!current?.published_at) {
        updates.published_at = new Date().toISOString()
      }
    }

    // Recalculate read time if content changed
    if (content) {
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
      updates.read_time = Math.ceil(wordCount / 200)
    }

    const { data: post, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating post:', error)
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Error in blog API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/blog/posts/[id] - Delete post
export async function DELETE(
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

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting post:', error)
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in blog API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
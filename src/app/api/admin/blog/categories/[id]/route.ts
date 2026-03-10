// src/app/api/admin/blog/categories/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/admin/blog/categories/[id] - Update category
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
    const { name, slug, description, color } = body

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (slug !== undefined) updates.slug = slug
    if (description !== undefined) updates.description = description
    if (color !== undefined) updates.color = color
    updates.updated_at = new Date().toISOString()

    const { data: category, error } = await supabase
      .from('blog_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error('Error in category update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/blog/categories/[id] - Delete category
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

    // First, set category_id to null for all posts in this category
    await supabase
      .from('blog_posts')
      .update({ category_id: null })
      .eq('category_id', id)

    // Then delete the category
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in category delete API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
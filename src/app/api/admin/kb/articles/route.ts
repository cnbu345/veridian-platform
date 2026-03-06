// src/app/api/admin/kb/articles/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/kb/articles - Get all articles
export async function GET() {
  try {
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

    const { data: articles, error } = await supabase
      .from('kb_articles')
      .select(`
        *,
        category:kb_categories(name, slug)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error in articles API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/kb/articles - Create new article
export async function POST(request: Request) {
  try {
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
    const { title, slug, content, excerpt, category_id, tags, is_published, is_featured } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
    }

    const { data: article, error } = await supabase
      .from('kb_articles')
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        category_id: category_id || null,
        author_id: user.id,
        tags: tags || [],
        is_published: is_published !== undefined ? is_published : true,
        is_featured: is_featured || false,
        published_at: is_published ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
    }

    return NextResponse.json({ success: true, article })
  } catch (error) {
    console.error('Error in articles API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
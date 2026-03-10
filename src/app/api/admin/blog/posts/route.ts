// src/app/api/admin/blog/posts/route.ts -  API Blog Routes
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/blog/posts - Get all posts
export async function GET() {
  try {
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

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:users(full_name, email),
        category:blog_categories(name, slug, color)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error in blog API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/blog/posts - Create new post
export async function POST(request: Request) {
  try {
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

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
    }

    // Check if slug exists
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Calculate read time (rough estimate)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        excerpt,
        content,
        featured_image,
        author_id: user.id,
        category_id: category_id || null,
        status,
        tags,
        meta_title,
        meta_description,
        meta_keywords,
        is_featured,
        allow_comments,
        read_time: readTime,
        published_at: status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Error in blog API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
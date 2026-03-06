// src/app/api/admin/kb/categories/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/kb/categories - Get all categories
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

    const { data: categories, error } = await supabase
      .from('kb_categories')
      .select(`
        *,
        articles:kb_articles(count)
      `)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    // Process categories with article counts
    const processedCategories = (categories || []).map(cat => ({
      ...cat,
      article_count: cat.articles?.[0]?.count || 0
    }))

    return NextResponse.json({ categories: processedCategories })
  } catch (error) {
    console.error('Error in categories API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/kb/categories - Create new category
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
    const { name, slug, description, icon, is_active } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    // Get max display order
    const { data: maxOrderData } = await supabase
      .from('kb_categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)

    const display_order = maxOrderData && maxOrderData.length > 0 
      ? (maxOrderData[0].display_order + 1) 
      : 0

    const { data: category, error } = await supabase
      .from('kb_categories')
      .insert({
        name,
        slug,
        description: description || null,
        icon: icon || null,
        is_active: is_active !== undefined ? is_active : true,
        display_order
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error('Error in categories API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
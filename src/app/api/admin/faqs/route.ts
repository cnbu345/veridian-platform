// src/app/api/admin/faqs/route.ts - FAQ API Routes
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/faqs - Get all FAQs
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

    const { data: faqs, error } = await supabase
      .from('faq_items')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching FAQs:', error)
      return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
    }

    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('Error in FAQs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/faqs - Create new FAQ
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
    const { category, question, answer, is_published } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }

    // Get max display order
    const { data: maxOrderData } = await supabase
      .from('faq_items')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)

    const display_order = maxOrderData && maxOrderData.length > 0 
      ? (maxOrderData[0].display_order + 1) 
      : 0

    const { data: faq, error } = await supabase
      .from('faq_items')
      .insert({
        category: category || null,
        question,
        answer,
        is_published: is_published !== undefined ? is_published : true,
        display_order
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating FAQ:', error)
      return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
    }

    return NextResponse.json({ success: true, faq })
  } catch (error) {
    console.error('Error in FAQs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
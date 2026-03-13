// src/app/api/client/feedback/types/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all active feedback types
    const { data: types, error } = await supabase
      .from('feedback_type')
      .select('*')
      .eq('is_active', true)
      .order('category')

    if (error) {
      console.error('Error fetching feedback types:', error)
      return NextResponse.json({ error: 'Failed to fetch feedback types' }, { status: 500 })
    }

    return NextResponse.json({ types })

  } catch (error) {
    console.error('Error in feedback types API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
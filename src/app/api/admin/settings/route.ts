// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  console.log('📝 Settings API route called')
  
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('Settings API - No user:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check if user is admin using the database (same as pricing API)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile?.is_admin) {
      console.log('Settings API - Not admin:', { user: user.email, profile })
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { key, value } = await request.json()
    console.log('Settings API - Updating:', { key, value, user: user.email })

    // Check if setting exists
    const { data: existing } = await supabase
      .from('settings')
      .select('key')
      .eq('key', key)
      .maybeSingle()

    let result
    if (existing) {
      // Update existing
      result = await supabase
        .from('settings')
        .update({ 
          value,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('key', key)
    } else {
      // Insert new
      result = await supabase
        .from('settings')
        .insert({ 
          key, 
          value,
          type: typeof value === 'boolean' ? 'boolean' : 'string',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
    }

    if (result.error) {
      console.error('Settings API - Error:', result.error)
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    console.log('Settings API - Success')
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Settings API - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    let query = supabase.from('settings').select('*')
    
    if (key) {
      query = query.eq('key', key)
    }
    
    const { data: settings, error } = await query.order('key')
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
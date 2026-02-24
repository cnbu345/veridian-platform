// src/app/api/admin/pricing/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  console.log('='.repeat(80))
  console.log('📝 PRICING API ROUTE CALLED')
  console.log('='.repeat(80))
  
  try {
    // Step 1: Get the authenticated user
    console.log('Step 1: Creating Supabase client...')
    const supabase = await createClient()
    
    console.log('Step 2: Getting user from auth...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Auth result:', { 
      user: user ? { id: user.id, email: user.email } : null,
      authError 
    })
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication error', details: authError.message },
        { status: 401 }
      )
    }
    
    if (!user) {
      console.error('No user found in auth')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Step 2: Check if user is admin
    console.log('Step 3: Checking if user is admin for user ID:', user.id)
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')  // Select ALL columns to see everything
      .eq('id', user.id)
      .single()
    
    console.log('Profile query result:', { 
      profile, 
      profileError,
      profileErrorDetails: profileError ? JSON.stringify(profileError) : null
    })
    
    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Error fetching user profile', details: profileError.message },
        { status: 500 }
      )
    }
    
    console.log('Admin check:', {
      id: profile.id,
      email: profile.email,
      is_admin: profile.is_admin,
      role: profile.role,
      type_of: typeof profile.is_admin,
      valueOf: profile.is_admin === true ? 'true' : 'false'
    })
    
    if (!profile.is_admin) {
      console.log('❌ User is NOT admin')
      return NextResponse.json(
        { 
          error: 'Admin access required', 
          user: profile.email,
          is_admin: profile.is_admin,
          message: 'Your user record shows is_admin = false'
        },
        { status: 403 }
      )
    }
    
    console.log('✅ User is admin, proceeding...')
    
    // Step 3: Parse request body
    console.log('Step 4: Parsing request body...')
    const body = await req.json()
    console.log('Request body:', body)
    
    const { id, name, price, founderPrice, founderSpots, founderSpotsRemaining, period, stripePriceId, active } = body
    
    // Step 4: Update pricing_tiers table
    console.log('Step 5: Updating pricing_tiers table for ID:', id)
    
    const updateData = { 
      name,
      price,
      founder_price: founderPrice,
      founder_spots: founderSpots,
      founder_spots_remaining: founderSpotsRemaining,
      period,
      stripe_price_id: stripePriceId,
      active,
      updated_at: new Date().toISOString()
    }
    
    console.log('Update data:', updateData)
    
    const { data, error: updateError } = await supabase
      .from('pricing_tiers')
      .update(updateData)
      .eq('id', id)
      .select()
    
    console.log('Update result:', { 
      data, 
      updateError,
      updateErrorMessage: updateError ? updateError.message : null
    })
    
    if (updateError) {
      console.error('Error updating pricing tier:', updateError)
      return NextResponse.json(
        { error: 'Failed to update pricing tier', details: updateError.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Pricing updated successfully')
    console.log('='.repeat(80))
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.error('Error details:', error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update pricing', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  console.log('='.repeat(80))
  console.log('📋 PRICING GET API CALLED')
  console.log('='.repeat(80))
  
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    
    console.log('GET action:', action)
    
    if (action === 'get') {
      console.log('Fetching all pricing tiers...')
      
      const { data: tiers, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) {
        console.error('Error fetching tiers:', error)
        return NextResponse.json(
          { error: 'Failed to fetch pricing tiers', details: error.message },
          { status: 500 }
        )
      }
      
      console.log(`Found ${tiers?.length || 0} pricing tiers`)
      console.log('='.repeat(80))
      
      return NextResponse.json({ tiers })
    }
    
    console.log('Invalid action:', action)
    return NextResponse.json(
      { error: 'Invalid action. Use ?action=get' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
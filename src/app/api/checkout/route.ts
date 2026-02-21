// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to purchase a report' }, 
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { type, metadata } = body

    console.log('Checkout request:', { type, metadata, userId: user.id })

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' }, 
        { status: 400 }
      )
    }

    // Map the type to tier (they're the same in your case)
    const tier = type as 'single' | 'quarterly' | 'monthly' | 'enterprise'
    
    // Validate tier
    const validTiers = ['single', 'quarterly', 'monthly', 'enterprise']
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      )
    }

    // Use your existing createCheckoutSession function
    const session = await createCheckoutSession(
      user.id,
      user.email!,
      tier,
      metadata // This will be passed as reportData
    )

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      tier: type
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Checkout API is working',
    endpoints: {
      post: '/api/checkout - Create checkout session (type: single, quarterly, monthly, enterprise)'
    }
  })
}
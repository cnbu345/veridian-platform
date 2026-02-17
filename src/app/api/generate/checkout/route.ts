// src/app/api/generate/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// ✅ Add this GET handler to test the route
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Checkout API is working',
    endpoints: {
      post: '/api/generate/checkout - Create checkout session'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, reportData } = body // tier: 'single' | 'quarterly' | 'monthly' | 'enterprise'

    if (!tier) {
      return NextResponse.json(
        { error: 'Missing tier parameter' }, 
        { status: 400 }
      )
    }

    // Validate tier
    const validTiers = ['single', 'quarterly', 'monthly', 'enterprise']
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier specified' }, 
        { status: 400 }
      )
    }

    // Create checkout session with the specified tier
    const session = await createCheckoutSession(
      user.id, 
      user.email!, 
      tier, 
      reportData
    )

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      tier
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
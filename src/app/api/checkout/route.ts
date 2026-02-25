// src/app/api/checkout/route.ts // // Creates Stripe checkout session
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

    console.log('📝 Checkout request received:', { 
      type, 
      userId: user.id,
      hasMetadata: !!metadata,
      metadataKeys: metadata ? Object.keys(metadata) : []
    })

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' }, 
        { status: 400 }
      )
    }

    // CRITICAL: Ensure metadata is properly formatted
    const enhancedMetadata = {
      userId: user.id,
      productType: type,
      ...metadata, // This should contain companyName, reportData, etc.
      timestamp: new Date().toISOString()
    }

    console.log('📦 Enhanced metadata being sent to Stripe:', JSON.stringify(enhancedMetadata, null, 2))

    // Create checkout session with metadata
    const session = await createCheckoutSession(
      user.id,
      user.email!,
      type as 'single' | 'quarterly' | 'monthly' | 'enterprise',
      enhancedMetadata // Pass the enhanced metadata
    )

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id
    })

  } catch (error: any) {
    console.error('❌ Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
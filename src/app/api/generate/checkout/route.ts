import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, createSubscriptionSession } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, reportData } = body // type: 'single' or 'subscription'

    let session

    if (type === 'subscription') {
      session = await createSubscriptionSession(user.id, user.email!)
    } else {
      session = await createCheckoutSession(user.id, user.email!, reportData)
    }

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
// src/app/api/admin/customers/[id]/credits/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get user subscription tier
    const { data: user } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', id)
      .single()

    // Get credit info
    const { data: credits } = await supabase
      .from('user_consultation_credits')
      .select('total_credits, used_credits, remaining_credits, last_reset_date, reset_frequency')
      .eq('user_id', id)
      .maybeSingle()

    return NextResponse.json({
      subscription_tier: user?.subscription_tier || 'free',
      ...credits,
      hasCredits: user?.subscription_tier === 'enterprise' || (credits?.remaining_credits || 0) > 0
    })

  } catch (error) {
    console.error('Failed to fetch credits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}
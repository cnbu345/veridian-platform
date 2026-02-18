// src/app/api/admin/pricing/route.ts
// Admin API Routes
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/stripe'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { user } = await supabase.auth.getUser()
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user?.id)
      .single()
      
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { tierId, price, stripePriceId } = await req.json()
    
    // Update Stripe price
    const stripe = getStripe()
    await stripe.prices.update(stripePriceId, {
      metadata: { price: price.toString() }
    })
    
    // Update settings in database
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'pricing_tiers')
      .single()
      
    const tiers = settings?.value || []
    const updatedTiers = tiers.map((tier: any) =>
      tier.id === tierId ? { ...tier, price } : tier
    )
    
    await supabase
      .from('settings')
      .update({ value: updatedTiers })
      .eq('key', 'pricing_tiers')
      
    // Log to audit
    await supabase.from('audit_log').insert({
      user_id: user?.id,
      action: 'update_pricing',
      entity_type: 'settings',
      new_data: { tierId, price }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update pricing:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing' },
      { status: 500 }
    )
  }
}
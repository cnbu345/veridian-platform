// src/lib/pricing/service.ts
import { createClient } from '@/lib/supabase/server'

export interface PricingTier {
  id: string
  name: string
  price: number
  founder_price?: number
  founder_spots: number
  founder_spots_remaining: number
  period: 'one-time' | 'monthly' | 'yearly'
  features: any
  stripe_price_id: string
  active: boolean
}

// FIXED: Get pricing from pricing_tiers table
export async function getPricingConfig() {
  const supabase = await createClient()
  
  const { data: tiers, error } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching pricing tiers:', error)
    return { tiers: [] }
  }
  
  return { tiers }
}

// Update remaining founder spots - FIXED to use pricing_tiers
export async function decrementFounderSpots(tierId: string): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Get current spots from pricing_tiers
    const { data: tier } = await supabase
      .from('pricing_tiers')
      .select('founder_spots_remaining')
      .eq('id', tierId)
      .single()
    
    if (tier && tier.founder_spots_remaining > 0) {
      // Decrement by 1
      const { error: updateError } = await supabase
        .from('pricing_tiers')
        .update({ 
          founder_spots_remaining: tier.founder_spots_remaining - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', tierId)
      
      if (updateError) {
        console.error('Error updating founder spots:', updateError)
      } else {
        console.log(`Founder spots for ${tierId} now: ${tier.founder_spots_remaining - 1}`)
      }
    }
  } catch (error) {
    console.error('Error decrementing founder spots:', error)
  }
}
// src/lib/pricing/service.ts
import { createClient } from '@/lib/supabase/server'

export interface PricingTier {
  id: string
  name: string
  price: number
  founderPrice?: number
  founderSpots: number
  founderSpotsRemaining: number
  period: 'one-time' | 'monthly' | 'yearly'
  features: string[]
  stripePriceId: string
  active: boolean
}

// Update remaining founder spots
export async function decrementFounderSpots(tierId: string): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Get current tiers from settings
    const { data: pricingSettings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'pricing_tiers')
      .single()
    
    if (pricingSettings?.value) {
      const tiers = pricingSettings.value as PricingTier[]
      const tierIndex = tiers.findIndex(t => t.id === tierId)
      
      if (tierIndex !== -1 && tiers[tierIndex].founderSpotsRemaining > 0) {
        // Decrement spots
        tiers[tierIndex].founderSpotsRemaining -= 1
        
        // Save back to database
        await supabase
          .from('settings')
          .update({ value: tiers })
          .eq('key', 'pricing_tiers')
        
        console.log(`Founder spots for ${tierId} now: ${tiers[tierIndex].founderSpotsRemaining}`)
      }
    }
  } catch (error) {
    console.error('Error decrementing founder spots:', error)
  }
}
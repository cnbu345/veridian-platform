// src/app/api/consultations/eligibility/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        eligible: false,
        requiresAuth: true,
        message: 'Please sign in to schedule a consultation'
      }, { status: 401 })
    }
    
    // Get user's subscription tier
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('subscription_tier, is_admin')
      .eq('id', user.id)
      .single()
    
    if (userDataError) {
      console.error('Error fetching user data:', userDataError)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }
    
    // Get user's consultation credits
    const { data: credits, error: creditsError } = await supabase
      .from('user_consultation_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // If no credits record exists, create one based on subscription tier
    if (!credits && !creditsError) {
      // Get benefits for this tier
      const { data: benefits } = await supabase
        .from('subscription_tier_benefits')
        .select('consultation_credits_per_year')
        .eq('tier_name', userData.subscription_tier || 'free')
        .single()
      
      const creditsPerYear = benefits?.consultation_credits_per_year || 0
      
      // Create credits record
      const { data: newCredits, error: insertError } = await supabase
        .from('user_consultation_credits')
        .insert({
          user_id: user.id,
          total_credits: creditsPerYear,
          used_credits: 0,
          reset_frequency: 'yearly',
          last_reset_date: new Date().toISOString()
        })
        .select()
        .single()
      
      if (!insertError && newCredits) {
        return NextResponse.json({
          eligible: creditsPerYear > 0,
          credits: {
            total: creditsPerYear,
            used: 0,
            remaining: creditsPerYear
          },
          tier: userData.subscription_tier || 'free',
          canPurchase: true,
          purchasePrice: 50000, // $500 in cents
          message: creditsPerYear > 0 
            ? `You have ${creditsPerYear} consultation credit(s) included with your plan`
            : 'Your plan does not include consultations. You can purchase one for $500'
        })
      }
    }
    
    // Return existing credits
    if (credits) {
      return NextResponse.json({
        eligible: credits.remaining_credits > 0,
        credits: {
          total: credits.total_credits,
          used: credits.used_credits,
          remaining: credits.remaining_credits
        },
        tier: userData.subscription_tier || 'free',
        canPurchase: true,
        purchasePrice: 50000, // $500 in cents
        message: credits.remaining_credits > 0
          ? `You have ${credits.remaining_credits} consultation credit(s) remaining`
          : 'You have used all your consultation credits. You can purchase additional consultations for $500 each'
      })
    }
    
    // Default response for free users
    return NextResponse.json({
      eligible: false,
      credits: {
        total: 0,
        used: 0,
        remaining: 0
      },
      tier: userData.subscription_tier || 'free',
      canPurchase: true,
      purchasePrice: 50000,
      message: 'Your plan does not include consultations. You can purchase one for $500'
    })
    
  } catch (error) {
    console.error('Error checking eligibility:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
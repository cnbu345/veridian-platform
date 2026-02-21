// src/lib/stripe/stripe.ts
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { reportQueue } from '@/lib/queue/reportQueue'
import { Resend } from 'resend'

// Initialize Stripe
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
}

// Initialize Resend for emails
const resend = new Resend(process.env.RESEND_API_KEY)

// Price IDs from environment variables
const PRICE_IDS = {
  single: process.env.STRIPE_SINGLE_REPORT_ID,
  quarterly: process.env.STRIPE_QUARTERLY_PRICE_ID,
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
}

// Create checkout session
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: 'single' | 'quarterly' | 'monthly' | 'enterprise' = 'single',
  reportData?: any
) {
  try {
    const stripe = getStripe()
    
    // Check if founder pricing should apply
    const supabase = await createClient()
    
    // Get founder circle setting
    const { data: founderSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'founder_circle_enabled')
      .maybeSingle()
    
    const founderCircleEnabled = founderSetting?.value === 'true'
    
    // Get pricing tiers to check founder spots
    const { data: pricingSettings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'pricing_tiers')
      .maybeSingle()
    
    let useFounderPrice = false
    let finalPriceId = PRICE_IDS[tier]
    
    // For single reports, check if founder pricing applies
    if (tier === 'single' && founderCircleEnabled && pricingSettings?.value) {
      const tiers = pricingSettings.value as any[]
      const singleTier = tiers.find(t => t.id === 'single')
      
      if (singleTier && singleTier.founderSpotsRemaining > 0) {
        useFounderPrice = true
        // You might have a separate price ID for founder pricing
        // If not, we'll use the same price ID and handle the price difference in metadata
      }
    }

    if (!finalPriceId) {
      throw new Error(`No price ID configured for tier: ${tier}`)
    }

    // Get user's company name if available
    const { data: user } = await supabase
      .from('users')
      .select('company_name, full_name')
      .eq('id', userId)
      .single()

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: tier === 'single' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/report/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/generate?canceled=true`,
      metadata: {
        userId,
        productType: tier,
        companyName: user?.company_name || '',
        isFounderPrice: String(useFounderPrice),
        tierId: tier,
        reportData: reportData ? JSON.stringify(reportData) : '',
        timestamp: new Date().toISOString()
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    })

    // Log session creation
    await supabase.from('audit_log').insert({
      user_id: userId,
      action: 'checkout_session_created',
      entity_type: 'payment',
      metadata: {
        sessionId: session.id,
        tier,
        amount: getTierPrice(tier),
        isFounderPrice: useFounderPrice
      }
    })

    return session
  } catch (error) {
    console.error('Stripe session creation error:', error)
    throw error
  }
}

// Get tier price (for logging)
function getTierPrice(tier: string): number {
  const prices = {
    single: 2497,
    quarterly: 3997,
    monthly: 7997,
    enterprise: 15000
  }
  return prices[tier as keyof typeof prices] || 0
}

// Handle successful checkout (webhook)
export async function handleCheckoutCompleted(session: any) {
  const supabase = await createClient()
  const { userId, productType, reportData, companyName } = session.metadata || {}
  
  if (!userId) {
    console.error('No userId in session metadata')
    return
  }

  try {
    // 1. Get or create user profile
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!user) {
      // Create user profile if doesn't exist
      await supabase.from('users').insert({
        id: userId,
        email: session.customer_email,
        company_name: companyName || '',
        subscription_tier: productType,
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString()
      })
    } else {
      // Update existing user
      await supabase
        .from('users')
        .update({
          subscription_tier: productType,
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }

    // 2. Record payment
    const { data: payment } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_id: session.payment_intent || session.id,
        amount: session.amount_total / 100, // Convert from cents
        tier: productType,
        status: 'succeeded',
        metadata: {
          sessionId: session.id,
          customerId: session.customer,
          productType
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    // 3. Handle single report purchase
    if (productType === 'single' && reportData) {
      const reportParams = JSON.parse(reportData)
      
      // Create report record
      const { data: report } = await supabase
        .from('reports')
        .insert({
          user_id: userId,
          company_name: reportParams.companyName || companyName,
          industry: reportParams.industry || '',
          city: reportParams.city || '',
          state: reportParams.state || '',
          location_tier: reportParams.locationTier || 'unknown',
          status: 'pending',
          stripe_payment_id: session.payment_intent || session.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (report) {
        // Add to generation queue
        await reportQueue.addToQueue(
          report.id,
          userId,
          {
            companyName: reportParams.companyName || companyName,
            industry: reportParams.industry || '',
            companySize: reportParams.companySize || '',
            budget: reportParams.budget || '',
            city: reportParams.city || '',
            state: reportParams.state || '',
            locationTier: reportParams.locationTier || 'unknown',
            nearestRegulatoryHub: reportParams.nearestRegulatoryHub,
            primaryFocus: reportParams.primaryFocus || 'compliance',
            secondaryFocus: reportParams.secondaryFocus || [],
            timeline: reportParams.timeline || '6-months',
            concerns: reportParams.concerns || '',
            goals: reportParams.goals || ''
          },
          1 // High priority for paid reports
        )
      }
    }

    // 4. Send confirmation email
    await sendPaymentConfirmationEmail(
      session.customer_email,
      companyName || 'Valued Client',
      productType,
      session.amount_total / 100
    )

    // 5. Update analytics
    await supabase.from('audit_log').insert({
      user_id: userId,
      action: 'payment_succeeded',
      entity_type: 'payment',
      entity_id: payment?.id,
      metadata: {
        tier: productType,
        amount: session.amount_total / 100,
        sessionId: session.id
      }
    })

    console.log(`Checkout completed successfully for user ${userId}, product: ${productType}`)

  } catch (error) {
    console.error('Error handling checkout completed:', error)
    
    // Log error
    await supabase.from('audit_log').insert({
      user_id: userId,
      action: 'payment_processing_error',
      entity_type: 'payment',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: session.id
      }
    })
    
    throw error
  }
}

// Handle paid invoice (subscription renewals)
export async function handleInvoicePaid(invoice: any) {
  const supabase = await createClient()
  const customerId = invoice.customer

  try {
    // Find user by Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('id, email, company_name, subscription_tier')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!user) {
      console.error(`No user found for customer ${customerId}`)
      return
    }

    // 1. Record payment
    await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        stripe_payment_id: invoice.id,
        amount: invoice.amount_paid / 100,
        tier: user.subscription_tier,
        status: 'succeeded',
        metadata: {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          periodStart: new Date(invoice.period_start * 1000).toISOString(),
          periodEnd: new Date(invoice.period_end * 1000).toISOString()
        },
        created_at: new Date().toISOString()
      })

    // 2. Update subscription period
    await supabase
      .from('users')
      .update({
        subscription_period_start: new Date(invoice.period_start * 1000).toISOString(),
        subscription_period_end: new Date(invoice.period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // 3. Send receipt email
    await sendPaymentReceiptEmail(
      user.email,
      user.company_name || user.email,
      user.subscription_tier,
      invoice.amount_paid / 100,
      new Date(invoice.period_end * 1000)
    )

    console.log(`Invoice paid for customer ${customerId}, user ${user.id}`)

  } catch (error) {
    console.error('Error handling invoice paid:', error)
    throw error
  }
}

// Handle subscription updates
export async function handleSubscriptionUpdated(subscription: any) {
  const supabase = await createClient()
  const customerId = subscription.customer

  try {
    // Find user by Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('id, email, company_name, subscription_tier')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!user) {
      console.error(`No user found for customer ${customerId}`)
      return
    }

    // Determine new tier from price ID
    const priceId = subscription.items.data[0].price.id
    let newTier = 'free'
    
    if (priceId === PRICE_IDS.single) newTier = 'single'
    else if (priceId === PRICE_IDS.quarterly) newTier = 'quarterly'
    else if (priceId === PRICE_IDS.monthly) newTier = 'monthly'
    else if (priceId === PRICE_IDS.enterprise) newTier = 'enterprise'

    const oldTier = user.subscription_tier

    // 1. Update user's subscription tier
    await supabase
      .from('users')
      .update({
        subscription_tier: newTier,
        subscription_status: subscription.status,
        subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // 2. Handle upgrades/downgrades
    if (oldTier !== newTier) {
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'subscription_changed',
        entity_type: 'subscription',
        metadata: {
          oldTier,
          newTier,
          subscriptionId: subscription.id,
          timestamp: new Date().toISOString()
        }
      })

      // Send upgrade/downgrade email
      await sendSubscriptionChangeEmail(
        user.email,
        user.company_name || user.email,
        oldTier,
        newTier
      )
    }

    // 3. Handle cancellation
    if (subscription.cancel_at_period_end) {
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'subscription_canceling',
        entity_type: 'subscription',
        metadata: {
          subscriptionId: subscription.id,
          effectiveEnd: new Date(subscription.current_period_end * 1000).toISOString()
        }
      })

      // Send cancellation confirmation email
      await sendCancellationEmail(
        user.email,
        user.company_name || user.email,
        new Date(subscription.current_period_end * 1000)
      )
    }

    console.log(`Subscription updated for customer ${customerId}, user ${user.id}, tier: ${newTier}`)

  } catch (error) {
    console.error('Error handling subscription update:', error)
    throw error
  }
}

// Email helper functions
async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  tier: string,
  amount: number
) {
  try {
    await resend.emails.send({
      from: 'Veridian Group <billing@veridiangroup.com>',
      to: email,
      subject: 'Payment Confirmation - Veridian Group',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A1A2F;">Thank You for Your Purchase!</h1>
          <p>Hello ${name},</p>
          <p>We've received your payment of <strong>$${amount.toLocaleString()}</strong> for the ${tier} plan.</p>
          ${tier === 'single' ? '<p>Your regulatory intelligence report is being generated and will be ready within 24 hours.</p>' : ''}
          <p>You can access your account at: <a href="${process.env.NEXT_PUBLIC_URL}/dashboard">${process.env.NEXT_PUBLIC_URL}/dashboard</a></p>
          <hr style="border: 1px solid #E2E8F0; margin: 30px 0;" />
          <p style="color: #64748B; font-size: 14px;">
            Need help? Contact us at support@veridiangroup.com<br />
            Veridian Group - Regulatory Intelligence for Digital Assets
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error)
  }
}

async function sendPaymentReceiptEmail(
  email: string,
  name: string,
  tier: string,
  amount: number,
  periodEnd: Date
) {
  try {
    await resend.emails.send({
      from: 'Veridian Group <billing@veridiangroup.com>',
      to: email,
      subject: 'Your Receipt - Veridian Group',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A1A2F;">Payment Receipt</h1>
          <p>Hello ${name},</p>
          <p>Your ${tier} subscription payment of <strong>$${amount.toLocaleString()}</strong> has been processed.</p>
          <p>Your subscription is active until: <strong>${periodEnd.toLocaleDateString()}</strong></p>
          <hr style="border: 1px solid #E2E8F0; margin: 30px 0;" />
          <p style="color: #64748B; font-size: 14px;">
            Need help? Contact us at support@veridiangroup.com
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send receipt email:', error)
  }
}

async function sendSubscriptionChangeEmail(
  email: string,
  name: string,
  oldTier: string,
  newTier: string
) {
  try {
    await resend.emails.send({
      from: 'Veridian Group <billing@veridiangroup.com>',
      to: email,
      subject: 'Subscription Updated - Veridian Group',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A1A2F;">Subscription Updated</h1>
          <p>Hello ${name},</p>
          <p>Your subscription has been updated from <strong>${oldTier}</strong> to <strong>${newTier}</strong>.</p>
          <p>You can view your new plan details in your dashboard.</p>
          <hr style="border: 1px solid #E2E8F0; margin: 30px 0;" />
          <p style="color: #64748B; font-size: 14px;">
            Questions? Contact us at support@veridiangroup.com
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send subscription change email:', error)
  }
}

async function sendCancellationEmail(
  email: string,
  name: string,
  effectiveEnd: Date
) {
  try {
    await resend.emails.send({
      from: 'Veridian Group <billing@veridiangroup.com>',
      to: email,
      subject: 'Subscription Cancellation - Veridian Group',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A1A2F;">Subscription Cancellation</h1>
          <p>Hello ${name},</p>
          <p>Your subscription has been canceled and will end on <strong>${effectiveEnd.toLocaleDateString()}</strong>.</p>
          <p>You'll continue to have access until this date.</p>
          <p>We're sorry to see you go! If you'd like to reactivate, you can do so anytime.</p>
          <hr style="border: 1px solid #E2E8F0; margin: 30px 0;" />
          <p style="color: #64748F; font-size: 14px;">
            Questions? Contact us at support@veridiangroup.com
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send cancellation email:', error)
  }
}
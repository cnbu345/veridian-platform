// src/lib/stripe/stripe.ts // Core Stripe functions
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
  quarterly: process.env.STRIPE_QUARTERLY_ID,
  monthly: process.env.STRIPE_MONTHLY_ID,
  custom: process.env.STRIPE_CUSTOM_ENTERPRISE_ID,
}

// Create checkout session - UPDATED to ensure metadata is passed correctly
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: 'single' | 'quarterly' | 'monthly' | 'enterprise' | 'custom' = 'single',
  reportData?: any // This contains all the form data from ReviewStep
) {
  try {
    const stripe = getStripe()
    
    console.log('\n💰 CREATING STRIPE CHECKOUT SESSION')
    console.log('='.repeat(50))
    console.log('User ID:', userId)
    console.log('User Email:', userEmail)
    console.log('Tier:', tier)
    console.log('Report Data received:', reportData ? 'YES' : 'NO')
    
    if (reportData) {
      console.log('Report Data keys:', Object.keys(reportData))
      console.log('Company Name:', reportData.companyName)
      console.log('City/State:', reportData.city, reportData.state)
    }
    
    // Check if founder pricing should apply
    const supabase = await createClient()
    
    // Get founder circle setting
    const { data: founderSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'founder_circle_enabled')
      .maybeSingle()
    
    const founderCircleEnabled = founderSetting?.value === 'true'
    
    // Get pricing tier from the pricing_tiers table
    const { data: pricingTier, error: pricingError } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('id', tier)
      .eq('active', true)
      .single()

    if (pricingError || !pricingTier) {
      console.error('Error fetching pricing tier:', pricingError)
      throw new Error(`Pricing tier ${tier} not found or inactive`)
    }

    let useFounderPrice = false
    
    // For single reports only, check if founder pricing applies
    if (tier === 'single' && founderCircleEnabled) {
      if (pricingTier.founder_spots_remaining > 0) {
        useFounderPrice = true
      }
    }

    // Determine the correct price amount
    const priceAmount = useFounderPrice && pricingTier.founder_price 
      ? pricingTier.founder_price 
      : pricingTier.price

    // Calculate savings for display
    const savingsAmount = useFounderPrice && pricingTier.founder_price 
      ? pricingTier.price - pricingTier.founder_price 
      : 0

    console.log('Pricing Debug:', {
      tier,
      founderCircleEnabled,
      useFounderPrice,
      regularPrice: pricingTier.price,
      founderPrice: pricingTier.founder_price,
      finalAmount: priceAmount,
      savings: savingsAmount,
      spotsRemaining: pricingTier.founder_spots_remaining
    })

    // Get user's company name if available
    const { data: user } = await supabase
      .from('users')
      .select('company_name, full_name')
      .eq('id', userId)
      .maybeSingle()

    // Create product name and description based on tier
    let productName = pricingTier.name
    let productDescription = ''

    switch (tier) {
      case 'single':
        productDescription = useFounderPrice
          ? `Founder's Circle Exclusive: Standard price $2,497. One-time purchase includes complete location-intelligent report, state-specific regulatory analysis, 90-day action plan, and 30-minute consultation.`
          : 'Complete location-intelligent report with state-specific regulatory analysis, license requirement matrix, 90-day compliance action plan, and 30-minute consultation call.'
        break
      case 'quarterly':
        productDescription = 'Annual subscription includes 4 quarterly reports, real-time email alerts for state law changes, priority support, and access to new features. Perfect for compliance monitoring and annual planning.'
        break
      case 'monthly':
        productDescription = 'Annual subscription includes 12 reports, multi-state analysis capability (compare up to 3 states per report), team access for up to 5 users, API access, and monthly strategy updates.'
        break
      case 'custom':
        productDescription = 'Custom enterprise solution with unlimited reports, dedicated account manager, SLA guarantees, and direct consultation as needed. Contact our team for details.'
        break
    }

    // CRITICAL: Prepare metadata for Stripe
    // This must include ALL the data needed by the webhook to create a report
    const metadata: any = {
      userId: userId,
      productType: tier,
      companyName: reportData?.companyName || user?.company_name || '',
      isFounderPrice: String(useFounderPrice),
      tierId: tier,
      priceAmount: String(priceAmount),
      regularPrice: String(pricingTier.price),
      savingsAmount: String(savingsAmount),
      timestamp: new Date().toISOString()
    }

    // Add all report data to metadata if it exists
    if (reportData) {
      // Check if secondaryFocus is already a string (from our truncation) or array
      const secondaryFocus = Array.isArray(reportData.secondaryFocus) 
        ? reportData.secondaryFocus.join(',') 
        : reportData.secondaryFocus || ''
      
      // Build metadata with truncated values
      metadata.city = reportData.city || ''
      metadata.state = reportData.state || ''
      metadata.industry = reportData.industry || ''
      metadata.companySize = reportData.companySize || ''
      metadata.budget = reportData.budget || ''
      metadata.primaryFocus = reportData.primaryFocus || ''
      metadata.secondaryFocus = secondaryFocus
      metadata.timeline = reportData.timeline || ''
      metadata.concerns = reportData.concerns || ''
      metadata.goals = reportData.goals || ''
      metadata.locationTier = reportData.locationTier || 'unknown'
      
      console.log('📦 Added individual fields to metadata (reportData NOT included)')
      console.log('📦 Metadata fields added:', Object.keys(metadata).join(', '))
    }

    console.log('\n📋 FINAL METADATA BEING SENT TO STRIPE:')
    console.log(JSON.stringify(metadata, null, 2))
    console.log('='.repeat(50) + '\n')

    // Create checkout session with price_data (dynamic pricing)
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
              metadata: {
                tier_id: tier,
                is_founder: String(useFounderPrice),
                regular_price: String(pricingTier.price),
                savings_amount: String(savingsAmount)
              }
            },
            unit_amount: priceAmount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: tier === 'single' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/report/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/generate?canceled=true`,
      metadata: metadata, // THIS IS CRITICAL - attaching all metadata here
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    })

    console.log('✅ STRIPE SESSION CREATED SUCCESSFULLY')
    console.log('Session ID:', session.id)
    console.log('Metadata in session:', JSON.stringify(session.metadata, null, 2))

    // Log session creation
    await supabase.from('audit_log').insert({
      user_id: userId,
      action: 'checkout_session_created',
      entity_type: 'payment',
      metadata: {
        sessionId: session.id,
        tier,
        amount: priceAmount,
        isFounderPrice: useFounderPrice
      }
    })

    return session
  } catch (error) {
    console.error('❌ Stripe session creation error:', error)
    throw error
  }
}

// Get tier price (for logging)
function getTierPrice(tier: string): number {
  const prices = {
    single: 2497,
    quarterly: 5997,
    monthly: 14997,
    custom: 25000
  }
  return prices[tier as keyof typeof prices] || 0
}

// Handle successful checkout (webhook) - KEEP YOUR EXISTING IMPLEMENTATION
export async function handleCheckoutCompleted(session: any) {
  console.log('\n' + '='.repeat(80))
  console.log('HANDLE CHECKOUT COMPLETED STARTED')
  console.log('='.repeat(80))
  console.log('Session ID:', session.id)
  console.log('Session metadata:', JSON.stringify(session.metadata, null, 2))
  
  const supabase = await createClient()
  const { 
    userId, 
    productType, 
    companyName, 
    isFounderPrice, 
    tierId,
    reportData,
    priceAmount
  } = session.metadata || {}
  
  console.log('Extracted values:', {
    userId,
    productType,
    companyName,
    isFounderPrice,
    tierId,
    priceAmount,
    hasReportData: !!reportData,
    reportDataLength: reportData?.length
  })
  
  if (!userId) {
    console.error('No userId in session metadata')
    return
  }

  try {
    // STEP 1: If this was a founder price purchase, decrement the spots
    if (isFounderPrice === 'true' && tierId === 'single') {
      console.log(`Decrementing founder spots for tier: ${tierId}`)
      
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
          console.log(`Founder spots remaining now: ${tier.founder_spots_remaining - 1}`)
        }
      }
    }

    // STEP 2: Get or create user profile
    console.log('Checking for existing user profile...')
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!user) {
      console.log('Creating new user profile...')
      await supabase.from('users').insert({
        id: userId,
        email: session.customer_email,
        company_name: companyName || '',
        subscription_tier: productType,
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString()
      })
      console.log('User profile created')
    } else {
      console.log('Updating existing user profile...')
      await supabase
        .from('users')
        .update({
          subscription_tier: productType,
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      console.log('User profile updated')
    }

    // STEP 3: Record payment
    console.log('Recording payment...')
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_id: session.payment_intent || session.id,
        amount: session.amount_total / 100,
        tier: productType,
        status: 'succeeded',
        metadata: {
          sessionId: session.id,
          customerId: session.customer,
          productType,
          isFounderPrice: isFounderPrice === 'true'
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
    } else {
      console.log('Payment recorded with ID:', payment?.id)
    }

    // STEP 4: For subscriptions, record in user_subscriptions table
    if (productType !== 'single') {
      console.log('Recording subscription in user_subscriptions...')
      
      // Get subscription details from Stripe
      const stripe = getStripe()
      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      
      const { error: subError } = await supabase.from('user_subscriptions').insert({
        user_id: userId,
        tier_id: productType,
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        status: 'active',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: false,
        is_founder: isFounderPrice === 'true',
        metadata: {
          price: priceAmount,
          interval: subscription.items.data[0].price.recurring?.interval
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      if (subError) {
        console.error('Error recording subscription:', subError)
      } else {
        console.log('Subscription recorded successfully')
      }
      
      // Record subscription event
      await supabase.from('subscription_events').insert({
        subscription_id: session.subscription,
        user_id: userId,
        event_type: 'subscription_created',
        new_status: 'active',
        metadata: {
          tier_id: productType,
          price: priceAmount,
          is_founder: isFounderPrice === 'true'
        },
        created_at: new Date().toISOString()
      })
      
      // Update subscription metrics
      await updateSubscriptionMetrics(productType, isFounderPrice === 'true')
    }

    // STEP 5: Handle single report purchase
    if (productType === 'single' && reportData) {
      console.log('Processing single report purchase...')
      console.log('Raw reportData:', reportData)
      
      try {
        const reportParams = JSON.parse(reportData)
        console.log('Parsed report params:', {
          companyName: reportParams.companyName,
          city: reportParams.city,
          state: reportParams.state,
          industry: reportParams.industry
        })
        
        // Create report record
        console.log('Creating report record in database...')
        const reportInsert = {
          user_id: userId,
          company_name: reportParams.companyName || companyName || 'Unknown Company',
          industry: reportParams.industry || '',
          city: reportParams.city || '',
          state: reportParams.state || '',
          location_tier: reportParams.locationTier || 'unknown',
          status: 'pending',
          stripe_payment_id: session.payment_intent || session.id,
          created_at: new Date().toISOString()
        }
        console.log('Report insert data:', reportInsert)
        
        const { data: report, error: reportError } = await supabase
          .from('reports')
          .insert(reportInsert)
          .select()
          .single()

        if (reportError) {
          console.error('Error creating report:', reportError)
          console.error('Error details:', JSON.stringify(reportError, null, 2))
        } else {
          console.log('Report created successfully with ID:', report.id)
          
          // Add to generation queue
          console.log('Adding report to generation queue...')
          
          const queueParams = {
            companyName: reportParams.companyName || companyName || 'Unknown Company',
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
          }
          console.log('Queue params:', queueParams)
          
          await reportQueue.addToQueue(
            report.id,
            userId,
            queueParams,
            1
          )
          console.log('Report added to queue successfully')
        }
      } catch (e) {
        console.error('Error parsing report data:', e)
        console.error('Error stack:', e instanceof Error ? e.stack : 'No stack')
      }
    }

    // STEP 6: Send confirmation email
    console.log('Sending confirmation email to:', session.customer_email)
    try {
      await sendPaymentConfirmationEmail(
        session.customer_email,
        companyName || 'Valued Client',
        productType,
        session.amount_total / 100
      )
      console.log('Confirmation email sent')
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
    }

    // STEP 7: Log the successful payment
    console.log('Logging to audit_log...')
    const { error: auditError } = await supabase
      .from('audit_log')
      .insert({
        user_id: userId,
        action: 'payment_succeeded',
        entity_type: 'payment',
        entity_id: session.payment_intent || session.id,
        metadata: {
          amount: session.amount_total / 100,
          productType,
          isFounderPrice: isFounderPrice === 'true'
        },
        created_at: new Date().toISOString()
      })

    if (auditError) {
      console.error('Audit log error:', auditError)
    } else {
      console.log('Audit log created')
    }

    console.log('Checkout completed successfully for user', userId)
    console.log('='.repeat(80) + '\n')

  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    await supabase
      .from('audit_log')
      .insert({
        user_id: userId,
        action: 'payment_processing_error',
        entity_type: 'payment',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          sessionId: session.id,
          stack: error instanceof Error ? error.stack : null
        },
        created_at: new Date().toISOString()
      })
  }
}

// Helper function to update subscription metrics
async function updateSubscriptionMetrics(tierId: string, isFounder: boolean) {
  const supabase = await createClient()
  const now = new Date()
  const month = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const { data: metrics } = await supabase
    .from('subscription_metrics')
    .select('*')
    .eq('month', month.toISOString())
    .eq('tier_id', tierId)
    .maybeSingle()
  
  if (metrics) {
    await supabase
      .from('subscription_metrics')
      .update({
        new_subscriptions: metrics.new_subscriptions + 1,
        founder_subscriptions: isFounder ? metrics.founder_subscriptions + 1 : metrics.founder_subscriptions,
        active_count: metrics.active_count + 1
      })
      .eq('id', metrics.id)
  } else {
    await supabase
      .from('subscription_metrics')
      .insert({
        month: month.toISOString(),
        tier_id: tierId,
        new_subscriptions: 1,
        founder_subscriptions: isFounder ? 1 : 0,
        active_count: 1,
        canceled_count: 0
      })
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
      .maybeSingle()

    if (!user) {
      console.error(`No user found for customer ${customerId}`)
      return
    }

    // Record payment
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

    // Update subscription period in user_subscriptions
    await supabase
      .from('user_subscriptions')
      .update({
        current_period_start: new Date(invoice.period_start * 1000).toISOString(),
        current_period_end: new Date(invoice.period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription)

    // Record subscription event
    await supabase.from('subscription_events').insert({
      subscription_id: invoice.subscription,
      user_id: user.id,
      event_type: 'invoice_paid',
      metadata: {
        amount: invoice.amount_paid / 100,
        period_start: new Date(invoice.period_start * 1000).toISOString(),
        period_end: new Date(invoice.period_end * 1000).toISOString()
      },
      created_at: new Date().toISOString()
    })

    // Send receipt email
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
      .maybeSingle()

    if (!user) {
      console.error(`No user found for customer ${customerId}`)
      return
    }

    // Determine new tier from price ID
    const priceId = subscription.items.data[0].price.id
    let newTier = user.subscription_tier
    
    if (priceId === PRICE_IDS.single) newTier = 'single'
    else if (priceId === PRICE_IDS.quarterly) newTier = 'quarterly'
    else if (priceId === PRICE_IDS.monthly) newTier = 'monthly'
    else if (priceId === PRICE_IDS.enterprise) newTier = 'enterprise'
    else if (priceId === PRICE_IDS.custom) newTier = 'custom'

    const oldTier = user.subscription_tier

    // Update user's subscription tier
    await supabase
      .from('users')
      .update({
        subscription_tier: newTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // Update user_subscriptions
    await supabase
      .from('user_subscriptions')
      .update({
        tier_id: newTier,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    // Record subscription event
    await supabase.from('subscription_events').insert({
      subscription_id: subscription.id,
      user_id: user.id,
      event_type: 'subscription_updated',
      old_status: oldTier,
      new_status: newTier,
      metadata: {
        cancel_at_period_end: subscription.cancel_at_period_end
      },
      created_at: new Date().toISOString()
    })

    // Handle cancellation
    if (subscription.cancel_at_period_end) {
      await sendCancellationEmail(
        user.email,
        user.company_name || user.email,
        new Date(subscription.current_period_end * 1000)
      )
    } else if (oldTier !== newTier) {
      // Send upgrade/downgrade email
      await sendSubscriptionChangeEmail(
        user.email,
        user.company_name || user.email,
        oldTier,
        newTier
      )
    }

    console.log(`Subscription updated for customer ${customerId}, user ${user.id}, tier: ${newTier}`)

  } catch (error) {
    console.error('Error handling subscription update:', error)
    throw error
  }
}

// Handle subscription deletion/cancellation
export async function handleSubscriptionDeleted(subscription: any) {
  const supabase = await createClient()
  const customerId = subscription.customer

  try {
    // Find user by Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('id, email, company_name')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (!user) {
      console.error(`No user found for customer ${customerId}`)
      return
    }

    // Update user_subscriptions
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    // Update user's subscription tier to free
    await supabase
      .from('users')
      .update({
        subscription_tier: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // Record subscription event
    await supabase.from('subscription_events').insert({
      subscription_id: subscription.id,
      user_id: user.id,
      event_type: 'subscription_canceled',
      metadata: {
        effective_end: new Date(subscription.current_period_end * 1000).toISOString()
      },
      created_at: new Date().toISOString()
    })

    console.log(`Subscription canceled for user ${user.id}`)

  } catch (error) {
    console.error('Error handling subscription deletion:', error)
    throw error
  }
}

// Handle failed payments
export async function handlePaymentFailed(paymentIntent: any) {
  const supabase = await createClient()
  const customerId = paymentIntent.customer

  try {
    // Find user by Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('id, email, company_name')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (!user) {
      console.error(`No user found for customer ${customerId}`)
      return
    }

    // Log failed payment
    await supabase
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'payment_failed',
        entity_type: 'payment',
        metadata: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100
        },
        created_at: new Date().toISOString()
      })

    // Record in subscription_events if related to subscription
    if (paymentIntent.invoice) {
      await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'payment_failed',
        metadata: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          invoiceId: paymentIntent.invoice
        },
        created_at: new Date().toISOString()
      })
    }

    console.log(`Payment failed logged for user ${user.id}`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
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
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A1A2F 0%, #1E3A5F 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px; font-weight: 500; letter-spacing: -0.5px;">Veridian Group</h1>
          </div>
          <div style="background: #FFFFFF; padding: 40px 30px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0A1A2F; font-size: 22px; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Payment Confirmation</h2>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Dear ${name},</p>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">We have received your payment of <strong style="color: #D4AF37; font-size: 18px;">$${amount.toLocaleString()}</strong> for the ${tier} plan. Thank you for choosing Veridian Group.</p>
            ${tier === 'single' ? '<p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Your regulatory intelligence report is being generated and will be available within 24 hours. You will receive a notification when it is ready.</p>' : ''}
            <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #0A1A2F; font-size: 14px; margin: 0; line-height: 1.5;">Access your account at: <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" style="color: #D4AF37; text-decoration: none; font-weight: 500;">${process.env.NEXT_PUBLIC_URL}/dashboard</a></p>
            </div>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
            <p style="color: #64748B; font-size: 14px; line-height: 1.5; margin: 0;">For questions or assistance, please contact us at <a href="mailto:support@veridiangroup.com" style="color: #D4AF37; text-decoration: none;">support@veridiangroup.com</a></p>
          </div>
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
      subject: 'Payment Receipt - Veridian Group',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A1A2F 0%, #1E3A5F 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px; font-weight: 500; letter-spacing: -0.5px;">Veridian Group</h1>
          </div>
          <div style="background: #FFFFFF; padding: 40px 30px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0A1A2F; font-size: 22px; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Payment Receipt</h2>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Dear ${name},</p>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Your ${tier} subscription payment of <strong style="color: #D4AF37;">$${amount.toLocaleString()}</strong> has been processed.</p>
            <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #0A1A2F; font-size: 14px; margin: 0; line-height: 1.5;">Your subscription is active until: <strong>${periodEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
            </div>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
            <p style="color: #64748B; font-size: 14px; line-height: 1.5; margin: 0;">For questions, contact <a href="mailto:support@veridiangroup.com" style="color: #D4AF37; text-decoration: none;">support@veridiangroup.com</a></p>
          </div>
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
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A1A2F 0%, #1E3A5F 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px; font-weight: 500; letter-spacing: -0.5px;">Veridian Group</h1>
          </div>
          <div style="background: #FFFFFF; padding: 40px 30px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0A1A2F; font-size: 22px; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Subscription Updated</h2>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Dear ${name},</p>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Your subscription has been updated from <strong>${oldTier}</strong> to <strong>${newTier}</strong>.</p>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">You can view your updated plan details in your dashboard.</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
            <p style="color: #64748B; font-size: 14px; line-height: 1.5; margin: 0;">Questions? Contact us at <a href="mailto:support@veridiangroup.com" style="color: #D4AF37; text-decoration: none;">support@veridiangroup.com</a></p>
          </div>
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
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A1A2F 0%, #1E3A5F 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px; font-weight: 500; letter-spacing: -0.5px;">Veridian Group</h1>
          </div>
          <div style="background: #FFFFFF; padding: 40px 30px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0A1A2F; font-size: 22px; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Subscription Cancellation</h2>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Dear ${name},</p>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Your subscription has been canceled and will end on <strong>${effectiveEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
            <p style="color: #1E3A5F; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">You will continue to have access until this date. If you wish to reactivate your subscription, you can do so at any time through your account dashboard.</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
            <p style="color: #64748B; font-size: 14px; line-height: 1.5; margin: 0;">Questions? Contact us at <a href="mailto:support@veridiangroup.com" style="color: #D4AF37; text-decoration: none;">support@veridiangroup.com</a></p>
          </div>
        </div>
      `
    })
  } catch (error) {
    console.error('Failed to send cancellation email:', error)
  }
}
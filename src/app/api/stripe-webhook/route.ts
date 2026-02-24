// src/app/api/stripe-webhook/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { decrementFounderSpots } from '@/lib/pricing/service'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Initialize Resend for emails
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  console.log('\n🔔🔔🔔 WEBHOOK POST STARTED 🔔🔔🔔')
  console.log('Time:', new Date().toISOString())
  
  try {
    // Get the raw body text
    const body = await req.text()
    console.log('Raw body preview:', body.substring(0, 200))
    
    // Get headers - IMPORTANT: await the headers() function
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    console.log('Stripe signature:', signature ? 'Present' : 'Missing')

    if (!signature) {
      console.log('❌ No stripe signature provided')
      return NextResponse.json(
        { error: 'No stripe signature provided' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      console.log('Webhook secret exists:', !!webhookSecret)
      
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set')
      }

      console.log('Attempting to construct event...')
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Event constructed successfully. Type:', event.type)
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log('Processing event type:', event.type)
    
    // Handle the different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🎯 Handling checkout.session.completed')
        await handleCheckoutCompleted(event.data.object)
        break
        
      case 'invoice.paid':
        console.log('🎯 Handling invoice.paid')
        await handleInvoicePaid(event.data.object)
        break
        
      case 'customer.subscription.updated':
        console.log('🎯 Handling customer.subscription.updated')
        await handleSubscriptionUpdated(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        console.log('🎯 Handling customer.subscription.deleted')
        await handleSubscriptionDeleted(event.data.object)
        break
        
      case 'payment_intent.payment_failed':
        console.log('🎯 Handling payment_intent.payment_failed')
        await handlePaymentFailed(event.data.object)
        break
        
      default:
        console.log(`📋 Unhandled event type: ${event.type}`)
    }

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// ===========================================
// HANDLER FUNCTIONS
// ===========================================

// Handle successful checkout (when customer pays)
async function handleCheckoutCompleted(session: any) {
  console.log('💰 handleCheckoutCompleted called with session:', session.id)
  console.log('\n' + '='.repeat(80))
  console.log('💰💰💰 HANDLE CHECKOUT COMPLETED STARTED 💰💰💰')
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
    reportData 
  } = session.metadata || {}
  
  console.log('📦 Session metadata:', { userId, productType, companyName, hasReportData: !!reportData })
  
  if (!userId) {
    console.error('❌ No userId in session metadata')
    return
  }

  try {
    // STEP 1: If this was a founder price purchase, decrement the spots
    if (isFounderPrice === 'true' && tierId) {
      console.log(`📉 Decrementing founder spots for tier: ${tierId}`)
      await decrementFounderSpots(tierId)
    }

    // STEP 2: Create payment record
    console.log('💰 Recording payment...')
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_id: session.payment_intent || session.id,
        amount: session.amount_total / 100,
        tier: productType || 'single',
        status: 'succeeded',
        metadata: {
          sessionId: session.id,
          customerId: session.customer,
          companyName,
          isFounderPrice: isFounderPrice === 'true'
        },
        created_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error('❌ Error recording payment:', paymentError)
    } else {
      console.log('✅ Payment recorded successfully')
    }

    // STEP 3: If this was a single report purchase, create a report record
    if (productType === 'single' && reportData) {
      console.log('📝 Processing single report purchase...')
      console.log('📊 Raw reportData:', reportData)
      
      try {
        const reportParams = JSON.parse(reportData)
        console.log('✅ Parsed report params:', {
          companyName: reportParams.companyName,
          city: reportParams.city,
          state: reportParams.state,
          industry: reportParams.industry
        })
        
        // Create report record
        console.log('📝 Creating report record in database...')
        const { data: report, error: reportError } = await supabase
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

        if (reportError) {
          console.error('❌ Error creating report:', reportError)
        } else {
          console.log('✅ Report created with ID:', report.id)
          
          // Add to generation queue
          console.log('📝 Adding report to generation queue...')
          const { reportQueue } = await import('@/lib/queue/reportQueue')
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
          console.log('✅ Report added to queue successfully')
        }
      } catch (e) {
        console.error('❌ Error parsing report data:', e)
      }
    } else {
      console.log('⚠️ Not a single report purchase or no reportData:', { productType, hasReportData: !!reportData })
    }

    // STEP 4: Send confirmation email
    console.log('📧 Sending confirmation email to:', session.customer_email)
    try {
      await sendPaymentConfirmationEmail(
        session.customer_email,
        companyName || 'Valued Client',
        productType,
        session.amount_total / 100
      )
      console.log('✅ Confirmation email sent')
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError)
    }

    // STEP 5: Log the successful payment
    console.log('📊 Logging to audit_log...')
    await supabase
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

    console.log(`✅ Checkout completed successfully for user ${userId}`)

  } catch (error) {
    console.error('❌ Error in handleCheckoutCompleted:', error)
    
    // Log the error
    await supabase
      .from('audit_log')
      .insert({
        user_id: userId,
        action: 'payment_processing_error',
        entity_type: 'payment',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          sessionId: session.id
        },
        created_at: new Date().toISOString()
      })
  }
}

// Handle invoice paid (subscription renewals)
async function handleInvoicePaid(invoice: any) {
  console.log('Processing invoice paid:', invoice.id)
  
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

    console.log(`Invoice paid for user ${user.id}`)

  } catch (error) {
    console.error('Error handling invoice paid:', error)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: any) {
  console.log('Processing subscription updated:', subscription.id)
  
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

    // Log the update
    await supabase
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'subscription_updated',
        entity_type: 'subscription',
        metadata: {
          subscriptionId: subscription.id,
          status: subscription.status
        },
        created_at: new Date().toISOString()
      })

    console.log(`Subscription updated for user ${user.id}`)

  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription: any) {
  console.log('Processing subscription deleted:', subscription.id)
  
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

    // Update user subscription to free
    await supabase
      .from('users')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    console.log(`Subscription canceled for user ${user.id}`)

  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

// Handle failed payments
async function handlePaymentFailed(paymentIntent: any) {
  console.log('Processing payment failed:', paymentIntent.id)
  
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
          Need help? Contact us at support@veridiangroup.com
        </p>
      </div>
    `
  })
}

async function sendPaymentReceiptEmail(
  email: string,
  name: string,
  tier: string,
  amount: number,
  periodEnd: Date
) {
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
}

async function sendSubscriptionChangeEmail(
  email: string,
  name: string,
  oldTier: string,
  newTier: string
) {
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
}

async function sendCancellationEmail(
  email: string,
  name: string,
  effectiveEnd: Date
) {
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
        <p style="color: #64748B; font-size: 14px;">
          Questions? Contact us at support@veridiangroup.com
        </p>
      </div>
    `
  })
}
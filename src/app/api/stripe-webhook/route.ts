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
  const body = await req.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No stripe signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    // Handle the different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
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
  console.log('Processing checkout completed:', session.id)
  
  const supabase = await createClient()
  const { 
    userId, 
    productType, 
    companyName, 
    isFounderPrice, 
    tierId,
    reportData 
  } = session.metadata || {}
  
  if (!userId) {
    console.error('No userId in session metadata')
    return
  }

  try {
    // STEP 1: If this was a founder price purchase, decrement the spots
    if (isFounderPrice === 'true' && tierId) {
      console.log(`Decrementing founder spots for tier: ${tierId}`)
      await decrementFounderSpots(tierId)  // UPDATED: Using the pricing service
    }

    // STEP 2: Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_id: session.payment_intent || session.id,
        amount: session.amount_total / 100, // Convert from cents to dollars
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
      console.error('Error recording payment:', paymentError)
    } else {
      console.log('Payment recorded successfully')
    }

    // STEP 3: If this was a single report purchase, create a report record
    if (productType === 'single' && reportData) {
      try {
        const reportParams = JSON.parse(reportData)
        
        const { data: report, error: reportError } = await supabase
          .from('reports')
          .insert({
            user_id: userId,
            company_name: reportParams.companyName || companyName,
            industry: reportParams.industry || '',
            city: reportParams.city || '',
            state: reportParams.state || '',
            status: 'pending',
            stripe_payment_id: session.payment_intent || session.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (reportError) {
          console.error('Error creating report:', reportError)
        } else {
          console.log('Report created with ID:', report.id)
        }
      } catch (e) {
        console.error('Error parsing report data:', e)
      }
    }

    // STEP 4: Send confirmation email
    try {
      await resend.emails.send({
        from: 'Veridian Group <billing@veridiangroup.com>',
        to: session.customer_email,
        subject: 'Payment Confirmation - Your Report is Being Generated',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0A1A2F;">Thank You for Your Purchase!</h1>
            <p>Hello ${companyName || 'Valued Client'},</p>
            <p>We've received your payment of <strong>$${session.amount_total / 100}</strong>.</p>
            ${productType === 'single' 
              ? '<p>Your regulatory intelligence report is being generated and will be ready within 24 hours.</p>' 
              : '<p>Your subscription is now active. You can start generating reports immediately.</p>'
            }
            <p>You can access your account here:</p>
            <p><a href="${process.env.NEXT_PUBLIC_URL}/dashboard" style="background: #C6A13B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">View Dashboard</a></p>
            <hr style="border: 1px solid #E2E8F0; margin: 30px 0;" />
            <p style="color: #64748B; font-size: 14px;">
              Need help? Contact us at support@veridiangroup.com<br />
              Veridian Group - Regulatory Intelligence for Digital Assets
            </p>
          </div>
        `
      })
      console.log('Confirmation email sent')
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
    }

    // STEP 5: Log the successful payment
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

    console.log(`Checkout completed successfully for user ${userId}`)

  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error)
    
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
      .single()

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

    // Update subscription period
    await supabase
      .from('users')
      .update({
        subscription_period_start: new Date(invoice.period_start * 1000).toISOString(),
        subscription_period_end: new Date(invoice.period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // Send receipt email
    await resend.emails.send({
      from: 'Veridian Group <billing@veridiangroup.com>',
      to: user.email,
      subject: 'Your Receipt - Veridian Group',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A1A2F;">Payment Receipt</h1>
          <p>Hello ${user.company_name || user.email},</p>
          <p>Your ${user.subscription_tier} subscription payment of <strong>$${invoice.amount_paid / 100}</strong> has been processed.</p>
          <p>Your subscription is active until: <strong>${new Date(invoice.period_end * 1000).toLocaleDateString()}</strong></p>
          <hr style="border: 1px solid #E2E8F0; margin: 30px 0;" />
          <p style="color: #64748B; font-size: 14px;">
            Need help? Contact us at support@veridiangroup.com
          </p>
        </div>
      `
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
      .single()

    if (!user) {
      console.error(`No user found for customer ${customerId}`)
      return
    }

    // Map price ID to tier (you'll need to add your actual price IDs)
    const priceId = subscription.items.data[0].price.id
    let newTier = 'free'
    
    // TODO: Add your actual Stripe Price IDs here
    if (priceId === 'price_quarterly') newTier = 'quarterly'
    else if (priceId === 'price_monthly') newTier = 'monthly'
    else if (priceId === 'price_enterprise') newTier = 'enterprise'

    const oldTier = user.subscription_tier

    // Update user's subscription
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

    // Log the change if tier changed
    if (oldTier !== newTier) {
      await supabase
        .from('audit_log')
        .insert({
          user_id: user.id,
          action: 'subscription_changed',
          entity_type: 'subscription',
          metadata: {
            oldTier,
            newTier,
            subscriptionId: subscription.id
          },
          created_at: new Date().toISOString()
        })

      // Send email about tier change
      await resend.emails.send({
        from: 'Veridian Group <billing@veridiangroup.com>',
        to: user.email,
        subject: 'Subscription Updated - Veridian Group',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0A1A2F;">Subscription Updated</h1>
            <p>Hello ${user.company_name || user.email},</p>
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

    console.log(`Subscription updated for user ${user.id} to ${newTier}`)

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
      .single()

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

    // Log cancellation
    await supabase
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'subscription_canceled',
        entity_type: 'subscription',
        metadata: {
          subscriptionId: subscription.id
        },
        created_at: new Date().toISOString()
      })

    // Send cancellation email
    await resend.emails.send({
      from: 'Veridian Group <billing@veridiangroup.com>',
      to: user.email,
      subject: 'Subscription Cancellation - Veridian Group',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A1A2F;">Subscription Cancellation</h1>
          <p>Hello ${user.company_name || user.email},</p>
          <p>Your subscription has been canceled and will end on <strong>${new Date(subscription.current_period_end * 1000).toLocaleDateString()}</strong>.</p>
          <p>You'll continue to have access until this date.</p>
          <p>We're sorry to see you go! If you'd like to reactivate, you can do so anytime.</p>
          <hr style="border: 1px solid #E2E8F0; margin: 30px 0;" />
          <p style="color: #64748B; font-size: 14px;">
            Questions? Contact us at support@veridiangroup.com
          </p>
        </div>
      `
    })

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
      .single()

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

    // Send notification email
    await resend.emails.send({
      from: 'Veridian Group <billing@veridiangroup.com>',
      to: user.email,
      subject: 'Payment Failed - Veridian Group',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A1A2F;">Payment Failed</h1>
          <p>Hello ${user.company_name || user.email},</p>
          <p>Your recent payment of <strong>$${paymentIntent.amount / 100}</strong> failed.</p>
          <p>Please update your payment information to continue your subscription.</p>
          <p><a href="${process.env.NEXT_PUBLIC_URL}/account/billing" style="background: #C6A13B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">Update Payment Method</a></p>
          <hr style="border: 1px solid #E2E8F0; margin: 30px 0;" />
          <p style="color: #64748B; font-size: 14px;">
            Need help? Contact us at support@veridiangroup.com
          </p>
        </div>
      `
    })

    console.log(`Payment failed logged for user ${user.id}`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}
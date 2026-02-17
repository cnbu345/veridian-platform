 a// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe, handleCheckoutCompleted, handleInvoicePaid, handleSubscriptionUpdated } from '@/lib/stripe/stripe'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No stripe signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
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
    // Handle the event
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
        // Handle subscription cancellation
        await handleSubscriptionDeleted(event.data.object)
        break
        
      case 'payment_intent.payment_failed':
        // Handle failed payment
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

// Additional handlers
async function handleSubscriptionDeleted(subscription: any) {
  const supabase = await createClient()
  const customerId = subscription.customer

  const { data: user } = await supabase
    .from('users')
    .select('id, email, company_name')
    .eq('stripe_customer_id', customerId)
    .single()

  if (user) {
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
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'subscription_canceled',
      entity_type: 'subscription',
      metadata: {
        subscriptionId: subscription.id,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`Subscription canceled for user ${user.id}`)
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  const supabase = await createClient()
  const customerId = paymentIntent.customer

  const { data: user } = await supabase
    .from('users')
    .select('id, email, company_name')
    .eq('stripe_customer_id', customerId)
    .single()

  if (user) {
    // Log failed payment
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'payment_failed',
      entity_type: 'payment',
      metadata: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        timestamp: new Date().toISOString()
      }
    })

    // Send notification email
    const resend = new Resend(process.env.RESEND_API_KEY)
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

    console.log(`Payment failed for user ${user.id}`)
  }
}
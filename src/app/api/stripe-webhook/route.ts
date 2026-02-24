// src/app/api/stripe-webhook/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { 
  handleCheckoutCompleted, 
  handleInvoicePaid, 
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handlePaymentFailed,
  getStripe 
} from '@/lib/stripe/stripe'

export async function POST(req: Request) {
  console.log('\n' + '='.repeat(80))
  console.log('WEBHOOK POST RECEIVED')
  console.log('='.repeat(80))
  
  try {
    // Get the raw body text
    const body = await req.text()
    console.log('Raw body length:', body.length)
    
    // Get headers - IMPORTANT: await the headers() function
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    console.log('Stripe signature present:', !!signature)

    if (!signature) {
      console.log('No stripe signature provided')
      return NextResponse.json(
        { error: 'No stripe signature provided' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      const stripe = getStripe()
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      console.log('Webhook secret exists:', !!webhookSecret)
      
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set')
      }

      console.log('Constructing event...')
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('Event constructed successfully. Type:', event.type)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log('Processing event type:', event.type)
    
    // Handle the different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Handling checkout.session.completed')
        await handleCheckoutCompleted(event.data.object)
        break
        
      case 'invoice.paid':
        console.log('Handling invoice.paid')
        await handleInvoicePaid(event.data.object)
        break
        
      case 'customer.subscription.updated':
        console.log('Handling customer.subscription.updated')
        await handleSubscriptionUpdated(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        console.log('Handling customer.subscription.deleted')
        await handleSubscriptionDeleted(event.data.object)
        break
        
      case 'payment_intent.payment_failed':
        console.log('Handling payment_intent.payment_failed')
        await handlePaymentFailed(event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    console.log('Webhook processed successfully')
    console.log('='.repeat(80) + '\n')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Optional: Handle GET requests for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is ready',
    timestamp: new Date().toISOString()
  })
}
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const productType = session.metadata?.productType

        if (userId) {
          // Update user's subscription status
          await supabase
            .from('users')
            .update({
              subscription_tier: productType === 'monthly_subscription' ? 'premium' : 'paid',
              stripe_customer_id: session.customer as string
            })
            .eq('id', userId)

          // If this is for a specific report, mark it as paid
          if (session.metadata?.reportData) {
            const reportData = JSON.parse(session.metadata.reportData)
            // You can trigger report generation here if needed
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Update user's subscription status
        await supabase
          .from('users')
          .update({
            subscription_tier: 'premium',
            stripe_customer_id: customerId
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Downgrade user to free tier
        await supabase
          .from('users')
          .update({
            subscription_tier: 'free'
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'invoice.payment_succeeded': {
        // Handle successful subscription payment
        const invoice = event.data.object as Stripe.Invoice
        // You could send a payment confirmation email here
        break
      }

      case 'invoice.payment_failed': {
        // Handle failed payment
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        
        // Notify user of payment failure
        await supabase
          .from('users')
          .update({
            subscription_tier: 'payment_failed'
          })
          .eq('stripe_customer_id', customerId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
// src/lib/stripe/stripe.ts
import Stripe from 'stripe'

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
}

// Create checkout session for single report
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: 'single' | 'quarterly' | 'monthly' | 'enterprise' = 'single',
  reportData?: any
) {
  try {
    const stripe = getStripe()
    
    // Map tier to price ID
    const priceIds = {
      single: process.env.STRIPE_SINGLE_REPORT_PRICE_ID,
      quarterly: process.env.STRIPE_QUARTERLY_PRICE_ID,
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    }
    
    const priceId = priceIds[tier]
    
    if (!priceId) {
      throw new Error(`No price ID configured for tier: ${tier}`)
    }
    
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: tier === 'single' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      metadata: {
        userId,
        productType: `${tier}_report`,
        reportData: reportData ? JSON.stringify(reportData) : ''
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    return session
  } catch (error) {
    console.error('Stripe session creation error:', error)
    throw error
  }
}

// Create enterprise quote/invoice
export async function createEnterpriseQuote(
  userId: string,
  userEmail: string,
  companyName: string,
  requirements: string
) {
  try {
    const stripe = getStripe()
    
    // Create a customer first
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        userId,
        companyName
      }
    })
    
    // Create a quote for enterprise
    const quote = await stripe.quotes.create({
      customer: customer.id,
      line_items: [
        {
          price: process.env.STRIPE_ENTERPRISE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        companyName,
        requirements
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    })
    
    return quote
  } catch (error) {
    console.error('Stripe quote creation error:', error)
    throw error
  }
}

// Handle webhook events
export async function handleStripeWebhook(
  payload: string,
  signature: string
) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }
  
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await handleCheckoutCompleted(session)
        break
      case 'invoice.paid':
        const invoice = event.data.object
        await handleInvoicePaid(invoice)
        break
      case 'customer.subscription.updated':
        const subscription = event.data.object
        await handleSubscriptionUpdated(subscription)
        break
    }
    
    return { received: true }
  } catch (error) {
    console.error('Webhook error:', error)
    throw error
  }
}

// Handle successful checkout
async function handleCheckoutCompleted(session: any) {
  const { userId, productType, reportData } = session.metadata || {}
  
  if (!userId) {
    console.error('No userId in session metadata')
    return
  }
  
  // Here you would:
  // 1. Update user's subscription status in database
  // 2. Trigger report generation if single purchase
  // 3. Send confirmation email
  // 4. Update analytics
  
  console.log(`Checkout completed for user ${userId}, product: ${productType}`)
}

// Handle paid invoice
async function handleInvoicePaid(invoice: any) {
  const customerId = invoice.customer
  
  // Here you would:
  // 1. Update subscription status
  // 2. Grant access to paid features
  // 3. Send receipt email
  
  console.log(`Invoice paid for customer ${customerId}`)
}

// Handle subscription update
async function handleSubscriptionUpdated(subscription: any) {
  const customerId = subscription.customer
  
  // Here you would:
  // 1. Update user's subscription tier in database
  // 2. Handle upgrades/downgrades
  // 3. Send confirmation email
  
  console.log(`Subscription updated for customer ${customerId}`)
}
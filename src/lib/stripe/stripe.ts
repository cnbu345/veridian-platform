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
  reportData?: any
) {
  try {
    const stripe = getStripe()
    
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_SINGLE_REPORT_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      metadata: {
        userId,
        productType: 'single_report',
        reportData: JSON.stringify(reportData || {})
      },
      allow_promotion_codes: true,
    })

    return session
  } catch (error) {
    console.error('Stripe session creation error:', error)
    throw error
  }
}

// Create subscription session
export async function createSubscriptionSession(
  userId: string,
  userEmail: string
) {
  try {
    const stripe = getStripe()
    
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_MONTHLY_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      metadata: {
        userId,
        productType: 'monthly_subscription'
      },
      allow_promotion_codes: true,
    })

    return session
  } catch (error) {
    console.error('Stripe subscription creation error:', error)
    throw error
  }
}
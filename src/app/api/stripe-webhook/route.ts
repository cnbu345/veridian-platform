// src/app/api/stripe-webhook/route.ts - COMPLETE REPLACEMENT FILE
console.log('\n🚨🚨🚨 WEBHOOK FILE IS BEING EXECUTED 🚨🚨🚨')
console.log('Time:', new Date().toISOString())
console.log('File path:', __filename)
console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n')

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { reportQueue } from '@/lib/queue/reportQueue'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  // ULTRA DEBUG - Write EVERYTHING to console
  console.log('\n' + '🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴')
  console.log('🔴 WEBHOOK RECEIVED AT:', new Date().toISOString())
  console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴\n')
  
  try {
    // Get the raw body
    const body = await req.text()
    console.log('📦 Raw body length:', body.length)
    console.log('📦 First 200 chars of body:', body.substring(0, 200))
    
    // Get headers
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    console.log('🔑 Signature present:', !!signature)
    
    if (!signature) {
      console.log('❌ No signature - returning 400')
      return NextResponse.json(
        { error: 'No stripe signature' },
        { status: 400 }
      )
    }

    // Construct event
    let event: Stripe.Event
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      console.log('🔐 Webhook secret exists:', !!webhookSecret)
      
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set')
      }
      
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Event constructed successfully')
      console.log('📋 Event type:', event.type)
      console.log('📋 Event ID:', event.id)
    } catch (err) {
      console.error('❌ Webhook construction failed:', err)
      return NextResponse.json(
        { error: 'Webhook construction failed' },
        { status: 400 }
      )
    }

    // Handle checkout.session.completed ONLY
    if (event.type === 'checkout.session.completed') {
      console.log('\n' + '🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢')
      console.log('🟢 CHECKOUT COMPLETED - PROCESSING')
      console.log('🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢\n')
      
      const session = event.data.object as any
      
      // Log EVERYTHING about the session
      console.log('💰 SESSION DATA:')
      console.log('- ID:', session.id)
      console.log('- Customer:', session.customer)
      console.log('- Customer Email:', session.customer_email)
      console.log('- Payment Intent:', session.payment_intent)
      console.log('- Amount Total:', session.amount_total)
      console.log('- Mode:', session.mode)
      
      console.log('\n📋 METADATA:')
      console.log(JSON.stringify(session.metadata, null, 2))
      
      // Extract metadata - now we have individual fields, not one big reportData string
      const metadata = session.metadata || {}
      
      console.log('\n🔍 EXTRACTED METADATA FIELDS:')
      console.log('- userId:', metadata.userId)
      console.log('- productType:', metadata.productType)
      console.log('- companyName:', metadata.companyName)
      console.log('- city:', metadata.city)
      console.log('- state:', metadata.state)
      console.log('- industry:', metadata.industry)
      console.log('- primaryFocus:', metadata.primaryFocus)
      console.log('- has secondaryFocus:', !!metadata.secondaryFocus)
      console.log('- timeline:', metadata.timeline)
      console.log('- concerns (truncated):', metadata.concerns?.substring(0, 50) + '...')
      console.log('- goals (truncated):', metadata.goals?.substring(0, 50) + '...')
      
      if (!metadata.userId) {
        console.log('❌ CRITICAL: No userId in metadata!')
        return NextResponse.json({ received: true }) // Still return 200 to Stripe
      }
      
      // Now process with extreme debugging - pass the entire metadata object
      await debugHandleCheckout(session, metadata)
    } else {
      console.log('ℹ️ Ignoring event type:', event.type)
    }

    console.log('\n✅ Webhook processed successfully - returning 200\n')
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('\n❌❌❌ WEBHOOK ERROR ❌❌❌')
    console.error(error)
    console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n')
    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 500 }
    )
  }
}

// DEBUG VERSION - UPDATED to handle individual metadata fields
async function debugHandleCheckout(session: any, metadata: any) {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 DEBUG HANDLE CHECKOUT STARTED')
  console.log('='.repeat(60))
  
  const { 
    userId, 
    productType, 
    companyName,
    city,
    state,
    industry,
    companySize,
    budget,
    primaryFocus,
    secondaryFocus,
    timeline,
    concerns,
    goals,
    locationTier
  } = metadata
  
  console.log('📋 Processing with metadata:', {
    userId,
    productType,
    companyName,
    city,
    state,
    industry,
    companySize,
    budget,
    primaryFocus,
    secondaryFocus: secondaryFocus ? secondaryFocus.substring(0, 50) : 'none',
    timeline,
    concernsLength: concerns?.length || 0,
    goalsLength: goals?.length || 0,
    locationTier
  })
  
  // Create Supabase client
  console.log('\n📡 STEP 1: Creating Supabase client...')
  const supabase = await createClient()
  console.log('✅ Supabase client created')
  
  // STEP 1: Test database connection
  console.log('\n📡 STEP 2: Testing database connection...')
  try {
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Database connection FAILED:', testError)
    } else {
      console.log('✅ Database connection successful')
    }
  } catch (dbError) {
    console.log('❌ Database connection EXCEPTION:', dbError)
  }
  
  // STEP 2: Get or create user profile
  console.log('\n👤 STEP 3: Checking user profile...')
  let user = null
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    if (error) {
      console.log('❌ Error fetching user:', error)
    } else {
      user = data
      console.log('✅ User found:', user ? 'yes' : 'no')
    }
  } catch (userError) {
    console.log('❌ Exception fetching user:', userError)
  }
  
  if (!user) {
    console.log('👤 Creating new user profile...')
    try {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: session.customer_email || 'unknown@email.com',
          company_name: companyName || '',
          subscription_tier: productType,
          stripe_customer_id: session.customer,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createError) {
        console.log('❌ Failed to create user:', createError)
        console.log('❌ Error details:', JSON.stringify(createError, null, 2))
      } else {
        console.log('✅ User created successfully')
      }
    } catch (createException) {
      console.log('❌ Exception creating user:', createException)
    }
  } else {
    console.log('👤 Updating existing user...')
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_tier: productType,
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (updateError) {
        console.log('❌ Failed to update user:', updateError)
      } else {
        console.log('✅ User updated successfully')
      }
    } catch (updateException) {
      console.log('❌ Exception updating user:', updateException)
    }
  }
  
  // STEP 3: Record payment
  console.log('\n💰 STEP 4: Recording payment...')
  let paymentId = null
  try {
    const paymentData = {
      user_id: userId,
      stripe_payment_id: session.payment_intent || session.id,
      amount: (session.amount_total || 0) / 100,
      tier: productType,
      status: 'succeeded',
      metadata: {
        sessionId: session.id,
        customerId: session.customer
      },
      created_at: new Date().toISOString()
    }
    console.log('Payment data:', JSON.stringify(paymentData, null, 2))
    
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single()
    
    if (paymentError) {
      console.log('❌ Failed to record payment:', paymentError)
      console.log('❌ Error code:', paymentError.code)
      console.log('❌ Error message:', paymentError.message)
      console.log('❌ Error details:', paymentError.details)
    } else {
      paymentId = payment?.id
      console.log('✅ Payment recorded with ID:', paymentId)
    }
  } catch (paymentException) {
    console.log('❌ Exception recording payment:', paymentException)
  }
  
  // STEP 4: Create report (USING INDIVIDUAL FIELDS, NOT PARSED JSON)
  console.log('\n📄 STEP 5: Creating report record...')
  let reportId = null
  
  if (productType === 'single') {
    try {
      // Process secondaryFocus - convert from comma-separated string back to array if needed
      let secondaryFocusArray = []
      if (secondaryFocus) {
        if (typeof secondaryFocus === 'string') {
          secondaryFocusArray = secondaryFocus.split(',').filter(Boolean)
        } else if (Array.isArray(secondaryFocus)) {
          secondaryFocusArray = secondaryFocus
        }
      }
      
      // Prepare report data using individual fields from metadata
      const reportInsert = {
        user_id: userId,
        company_name: companyName || 'Unknown Company',
        industry: industry || '',
        city: city || '',
        state: state || '',
        location_tier: locationTier || 'unknown',
        status: 'pending',
        stripe_payment_id: session.payment_intent || session.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Report insert data:', JSON.stringify(reportInsert, null, 2))
      
      // TRY CATCH specifically for the insert
      try {
        const { data: report, error: reportError } = await supabase
          .from('reports')
          .insert(reportInsert)
          .select()
          .single()
        
        if (reportError) {
          console.log('❌❌❌ REPORT INSERT FAILED ❌❌❌')
          console.log('Error code:', reportError.code)
          console.log('Error message:', reportError.message)
          console.log('Error details:', reportError.details)
          console.log('Error hint:', reportError.hint)
          
          // Log the actual SQL error
          if (reportError.details) {
            console.log('SQL Details:', reportError.details)
          }
        } else {
          reportId = report?.id
          console.log('✅✅✅ REPORT CREATED SUCCESSFULLY with ID:', reportId)
          console.log('Report data:', JSON.stringify(report, null, 2))
        }
      } catch (insertError: any) {
        console.log('❌❌❌ EXCEPTION DURING INSERT ❌❌❌')
        console.log('Exception:', insertError)
        console.log('Message:', insertError?.message)
        console.log('Stack:', insertError?.stack)
      }
      
    } catch (outerError) {
      console.log('❌ Outer error in report creation:', outerError)
    }
  } else {
    console.log('⚠️ Not creating report: productType=', productType)
  }
  
  // STEP 5: Add to queue
  console.log('\n⏱️ STEP 6: Adding to queue...')
  
  if (reportId && productType === 'single') {
    try {
      // Process secondaryFocus for queue
      let secondaryFocusArray = []
      if (secondaryFocus) {
        if (typeof secondaryFocus === 'string') {
          secondaryFocusArray = secondaryFocus.split(',').filter(Boolean)
        } else if (Array.isArray(secondaryFocus)) {
          secondaryFocusArray = secondaryFocus
        }
      }
      
      const queueParams = {
        companyName: companyName || 'Unknown Company',
        industry: industry || '',
        companySize: companySize || '',
        budget: budget || '',
        city: city || '',
        state: state || '',
        locationTier: locationTier || 'unknown',
        nearestRegulatoryHub: '',
        primaryFocus: primaryFocus || 'compliance',
        secondaryFocus: secondaryFocusArray,
        timeline: timeline || '6-months',
        concerns: concerns || '',
        goals: goals || ''
      }
      
      console.log('Queue params:', JSON.stringify(queueParams, null, 2))
      
      console.log('Calling reportQueue.addToQueue...')
      await reportQueue.addToQueue(
        reportId,
        userId,
        queueParams,
        1
      )
      console.log('✅ Queue add completed (no error thrown)')
      
    } catch (queueError) {
      console.log('❌❌❌ QUEUE ADD FAILED ❌❌❌')
      console.log('Queue error:', queueError)
    }
  } else {
    console.log('⚠️ Not adding to queue: reportId=', reportId, 'productType=', productType)
  }
  
  // FINAL SUMMARY
  console.log('\n' + '📊📊📊 FINAL SUMMARY 📊📊📊')
  console.log('User ID:', userId)
  console.log('Report Created:', reportId ? 'YES - ' + reportId : 'NO')
  console.log('Payment Recorded:', paymentId ? 'YES' : 'NO')
  console.log('='.repeat(60) + '\n')
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook debug endpoint',
    timestamp: new Date().toISOString()
  })
}
// src/app/api/stripe-webhook/route.ts
console.log('\n' + '='.repeat(80))
console.log('🚨🚨🚨 WEBHOOK FILE LOADED/RELOADED 🚨🚨🚨')
console.log('Time:', new Date().toISOString())
console.log('File path:', __filename)
console.log('='.repeat(80) + '\n')

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { reportQueue } from '@/lib/queue/reportQueue'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

console.log('✅ Imports completed')

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})
console.log('✅ Stripe initialized')

export async function POST(req: Request) {
  console.log('\n' + '🔴'.repeat(50))
  console.log('🔴 WEBHOOK POST FUNCTION CALLED at:', new Date().toISOString())
  console.log('🔴'.repeat(50) + '\n')
  
  try {
    // Get the raw body
    console.log('📦 Getting raw body...')
    const body = await req.text()
    console.log('📦 Raw body length:', body.length)
    console.log('📦 First 100 chars:', body.substring(0, 100))
    
    // Get headers
    console.log('📋 Getting headers...')
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    console.log('📋 Signature present:', !!signature)
    
    if (!signature) {
      console.log('❌ No signature - returning 400')
      return NextResponse.json(
        { error: 'No stripe signature' },
        { status: 400 }
      )
    }

    // Construct event
    console.log('🔐 Constructing event with webhook secret...')
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
      console.log('📋 Event API version:', event.api_version)
    } catch (err) {
      console.error('❌ Webhook construction failed:', err)
      return NextResponse.json(
        { error: 'Webhook construction failed' },
        { status: 400 }
      )
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      console.log('\n' + '🟢'.repeat(50))
      console.log('🟢 PROCESSING CHECKOUT.COMPLETED')
      console.log('🟢'.repeat(50) + '\n')
      
      const session = event.data.object as any
      
      console.log('💰 Session ID:', session.id)
      console.log('💰 Customer:', session.customer)
      console.log('💰 Customer Email:', session.customer_email)
      console.log('💰 Amount Total:', session.amount_total)
      
      console.log('\n📋 METADATA:')
      console.log(JSON.stringify(session.metadata, null, 2))
      
      // Extract metadata
      const metadata = session.metadata || {}
      
      console.log('\n🔍 EXTRACTED VALUES:')
      console.log('- userId:', metadata.userId)
      console.log('- productType:', metadata.productType)
      console.log('- companyName:', metadata.companyName)
      console.log('- city:', metadata.city)
      console.log('- state:', metadata.state)
      console.log('- templateId:', metadata.templateId || 'none')  // NEW: Log template ID
      
      if (!metadata.userId) {
        console.log('❌ No userId in metadata!')
        return NextResponse.json({ received: true })
      }
      
      // Process the checkout with template support
      console.log('\n🚀 Calling debugHandleCheckout...')
      const result = await debugHandleCheckout(session, metadata)
      console.log('🚀 debugHandleCheckout completed:', result)
      
    } else {
      console.log('ℹ️ Ignoring event type:', event.type)
    }

    console.log('\n✅ Webhook returning 200\n')
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('\n❌❌❌ WEBHOOK ERROR ❌❌❌')
    console.error(error)
    console.error('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n')
    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 500 }
    )
  }
}

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
    locationTier,
    templateId  // NEW: Extract template ID from metadata
  } = metadata
  
  console.log('📋 Processing with metadata:', {
    userId,
    productType,
    companyName,
    city,
    state,
    industry,
    templateId: templateId || 'none'  // NEW: Log template ID
  })
  
  // Create Supabase client
  console.log('\n📡 STEP 1: Creating Supabase admin client...')
  console.log('URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing Supabase credentials')
    return { success: false, error: 'Missing credentials' }
  }
  
  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  console.log('✅ Supabase admin client created')
  
  // Test database connection
  console.log('\n📡 STEP 2: Testing database connection...')
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Database connection FAILED:', error.message)
    } else {
      console.log('✅ Database connection successful')
    }
  } catch (dbError) {
    console.log('❌ Database connection EXCEPTION:', dbError)
  }
  
  // STEP 3: Get or create user profile
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
  
  // STEP 4: Record payment
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
        customerId: session.customer,
        templateId: templateId || null
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
    } else {
      paymentId = payment?.id
      console.log('✅ Payment recorded with ID:', paymentId)
    }
  } catch (paymentException) {
    console.log('❌ Exception recording payment:', paymentException)
  }
  
  // STEP 5: Create report with template_id
  console.log('\n📄 STEP 5: Creating report record...')
  let reportId = null
  
  if (productType === 'single') {
    try {
      // Determine valid location_tier
      const validTiers = ['major', 'suburban', 'rural']
      let tierValue = 'rural' // Default to 'rural'
      
      if (locationTier && validTiers.includes(locationTier)) {
        tierValue = locationTier
      }
      
      // Process secondaryFocus - convert from comma-separated string to array
      let secondaryFocusArray = []
      if (secondaryFocus) {
        if (typeof secondaryFocus === 'string') {
          secondaryFocusArray = secondaryFocus.split(',').filter(Boolean)
        } else if (Array.isArray(secondaryFocus)) {
          secondaryFocusArray = secondaryFocus
        }
      }
      
      // Validate template ID if provided
      let validTemplateId = null
      if (templateId) {
        console.log('🔍 Validating template ID:', templateId)
        try {
          const { data: templateCheck, error: templateError } = await supabase
            .from('user_templates')
            .select('id, user_id')
            .eq('id', templateId)
            .eq('user_id', userId)
            .maybeSingle()
          
          if (templateError) {
            console.log('⚠️ Error checking template:', templateError)
          } else if (templateCheck) {
            validTemplateId = templateId
            console.log('✅ Template validated successfully:', validTemplateId)
          } else {
            console.log('⚠️ Template not found or not owned by user, ignoring')
          }
        } catch (templateCheckError) {
          console.log('⚠️ Exception checking template:', templateCheckError)
        }
      }
      
      // Prepare report insert with template_id
      const reportInsert = {
        user_id: userId,
        company_name: companyName || 'Unknown Company',
        industry: industry || '',
        city: city || '',
        state: state || '',
        location_tier: tierValue,
        template_id: validTemplateId,
        report_content: {
          companyName: companyName,
          industry: industry,
          city: city,
          state: state,
          concerns: concerns,
          goals: goals,
          primaryFocus: primaryFocus,
          secondaryFocus: secondaryFocusArray,
          timeline: timeline,
          companySize: companySize,
          budget: budget,
          locationTier: tierValue,
          templateId: validTemplateId,
          status: 'pending',
          created_at: new Date().toISOString()
        },
        status: 'pending',
        stripe_payment_id: session.payment_intent || session.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('📦 Report insert data:', JSON.stringify(reportInsert, null, 2))
      
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
      } else {
        reportId = report?.id
        console.log('✅✅✅ REPORT CREATED SUCCESSFULLY with ID:', reportId)
        console.log('📋 Template ID saved:', validTemplateId || 'none')
        
        // STEP 6: Add to queue with template_id
        console.log('\n⏱️ STEP 6: Adding to queue...')
        
        const queueParams = {
          companyName: companyName || 'Unknown Company',
          industry: industry || '',
          companySize: companySize || '',
          budget: budget || '',
          city: city || '',
          state: state || '',
          locationTier: tierValue,
          nearestRegulatoryHub: '',
          primaryFocus: primaryFocus || 'compliance',
          secondaryFocus: secondaryFocusArray,
          timeline: timeline || '6-months',
          concerns: concerns || '',
          goals: goals || '',
          templateId: validTemplateId
        }
        
        console.log('Queue params:', JSON.stringify(queueParams, null, 2))
        
        await reportQueue.addToQueue(
          report.id,
          userId,
          queueParams,
          1,
          validTemplateId
        )
        console.log('✅ Queue add completed with template ID:', validTemplateId || 'none')
      }
      
    } catch (insertError) {
      console.log('❌❌❌ EXCEPTION DURING INSERT ❌❌❌')
      console.log('Exception:', insertError)
      if (insertError instanceof Error) {
        console.log('Message:', insertError.message)
        console.log('Stack:', insertError.stack)
      }
    }
  } else {
    console.log('⚠️ Not creating report: productType=', productType)
  }
  
  // FINAL SUMMARY
  console.log('\n' + '📊📊📊 FINAL SUMMARY 📊📊📊')
  console.log('User ID:', userId)
  console.log('Report Created:', reportId ? 'YES - ' + reportId : 'NO')
  console.log('Payment Recorded:', paymentId ? 'YES' : 'NO')
  console.log('Template Applied:', templateId ? 'YES - ' + templateId : 'NO')  // NEW: Log template status
  console.log('='.repeat(60) + '\n')
  
  return { success: !!reportId, reportId }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook debug endpoint',
    timestamp: new Date().toISOString()
  })
}
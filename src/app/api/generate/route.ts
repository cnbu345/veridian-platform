import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeb3Report } from '@/lib/openai'
import { classifyLocation } from '@/lib/locationService'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyName, industry, companySize, budget, concerns, city, state } = body

    if (!companyName || !industry || !city || !state) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Classify location
    const locationData = await classifyLocation(city, state)

    // Generate AI report
    const reportContent = await generateWeb3Report(
      {
        name: companyName,
        industry,
        size: companySize || 'Not specified',
        budget: budget || 'Not specified'
      },
      locationData,
      concerns || 'Not specified'
    )

    // Save to database
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        company_name: companyName,
        industry,
        city,
        state,
        location_tier: locationData.tier,
        nearest_major_city: locationData.nearestMajorCity || locationData.nearestWeb3Hub,
        report_content: { 
          content: reportContent,
          generated_at: new Date().toISOString(),
          company_data: body,
          location_data: locationData
        },
        stripe_payment_id: body.stripePaymentId || 'free_trial'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      message: 'Report generated successfully'
    })

  } catch (error: any) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}
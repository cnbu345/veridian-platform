// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRegulatoryReport } from '@/lib/openai/openai'
import { classifyLocation } from '@/lib/location/locationService'
import { saveReportRequest } from '@/lib/reports/storage'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      companyName, 
      industry, 
      companySize, 
      budget, 
      city, 
      state,
      concerns,
      goals,
      primaryFocus,
      secondaryFocus,
      timeline,
      stripePaymentId,
      website,
      description,
      founded
    } = body

    // Validate required fields
    if (!companyName || !industry || !city || !state || !primaryFocus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Starting report generation for:', companyName)

    // Step 1: Classify location
    const locationData = await classifyLocation(city, state)

    // Step 2: Generate AI report using your service
    const reportContent = await generateRegulatoryReport({
      companyName,
      industry,
      companySize: companySize || 'Not specified',
      budget: budget || 'Not specified',
      city,
      state,
      locationTier: locationData.tier,
      nearestRegulatoryHub: locationData.nearestRegulatoryHub || locationData.nearestMajorCity,
      primaryFocus,
      secondaryFocus: secondaryFocus || [],
      timeline: timeline || '6-months',
      concerns: concerns || 'No specific concerns provided',
      goals: goals || 'Establish compliant digital asset operations'
    })

    // Step 3: Save to database using your storage function
    const savedReport = await saveReportRequest(
      user.id,
      {
        company: {
          name: companyName,
          industry,
          size: companySize,
          budget,
          description,
          website,
          founded
        },
        location: {
          city,
          state,
          tier: locationData.tier,
          nearestRegulatoryHub: locationData.nearestRegulatoryHub,
          nearestMajorCity: locationData.nearestMajorCity,
          distanceToMajor: locationData.distanceToMajor,
          regulatoryClimate: locationData.regulatoryClimate,
          talentDensity: locationData.talentDensity,
          msaName: locationData.msaName,
          msaPopulation: locationData.msaPopulation
        },
        strategy: {
          primary: primaryFocus,
          secondary: secondaryFocus || [],
          timeline: timeline || '6-months',
          concerns: concerns || '',
          goals: goals || ''
        }
      },
      stripePaymentId || 'free_trial'
    )

    // Step 4: Update report with generated content
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        report_content: {
          content: reportContent,
          generated_at: new Date().toISOString(),
          location_data: locationData,
          company_data: {
            name: companyName,
            industry,
            size: companySize,
            budget,
            website,
            description,
            founded
          },
          strategy_data: {
            primary: primaryFocus,
            secondary: secondaryFocus,
            timeline,
            concerns,
            goals
          },
          status: 'ready'
        }
      })
      .eq('id', savedReport.id)

    if (updateError) {
      console.error('Error updating report content:', updateError)
    }

    return NextResponse.json({ 
      success: true, 
      reportId: savedReport.id,
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
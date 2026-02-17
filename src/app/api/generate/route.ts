// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/lib/supabase/server'
import { reportQueue } from '@/lib/queue/reportQueue'
import { generateRegulatoryReport } from '@/lib/openai/openai'
import { classifyLocation } from '@/lib/location/locationService'
import { saveReportRequest } from '@/lib/reports/storage'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      companyName, 
      industry, 
      companySize, 
      budget, 
      city, 
      state, 
      locationTier,
      nearestRegulatoryHub,
      primaryFocus,
      secondaryFocus,
      timeline,
      concerns,
      goals,
      isSample = false,
      // Additional fields from original
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

    const supabase = await createClient()

    // Step 1: Classify location (using locationService)
    const locationData = await classifyLocation(city, state)

    // Use locationData for tier and hub if not provided directly
    const effectiveLocationTier = locationTier || locationData.tier
    const effectiveNearestRegulatoryHub = nearestRegulatoryHub || locationData.nearestRegulatoryHub || locationData.nearestMajorCity

    // Step 2: Create report record
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        company_name: companyName,
        industry,
        city,
        state,
        location_tier: effectiveLocationTier,
        nearest_regulatory_hub: effectiveNearestRegulatoryHub,
        status: isSample ? 'ready' : 'pending',
        report_content: isSample ? { isSample: true } : null,
        created_at: new Date().toISOString(),
        // Additional fields for comprehensive data storage
        metadata: {
          company_size: companySize,
          budget,
          website,
          description,
          founded,
          stripe_payment_id: stripePaymentId,
          strategy: {
            primary: primaryFocus,
            secondary: secondaryFocus || [],
            timeline: timeline || '6-months',
            concerns: concerns || '',
            goals: goals || ''
          },
          location_details: locationData
        }
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Step 3: Handle sample vs full report generation
    if (isSample) {
      // For sample reports, just return success
      return NextResponse.json({ 
        success: true, 
        reportId: report.id,
        isSample: true,
        message: 'Sample report created successfully'
      })
    }

    // Step 4: For non-sample reports, proceed with full generation
    try {
      // Generate AI report using OpenAI service
      const reportContent = await generateRegulatoryReport({
        companyName,
        industry,
        companySize: companySize || 'Not specified',
        budget: budget || 'Not specified',
        city,
        state,
        locationTier: effectiveLocationTier,
        nearestRegulatoryHub: effectiveNearestRegulatoryHub,
        primaryFocus,
        secondaryFocus: secondaryFocus || [],
        timeline: timeline || '6-months',
        concerns: concerns || 'No specific concerns provided',
        goals: goals || 'Establish compliant digital asset operations'
      })

      // Update report with generated content
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
            }
          },
          status: 'ready'
        })
        .eq('id', report.id)

      if (updateError) {
        console.error('Error updating report content:', updateError)
        // Don't throw - we still want to return the report ID even if content update fails
      }

      // Add to queue for any additional processing (optional)
      await reportQueue.addToQueue(
        report.id,
        user.id,
        {
          companyName,
          industry,
          companySize,
          budget,
          city,
          state,
          locationTier: effectiveLocationTier,
          nearestRegulatoryHub: effectiveNearestRegulatoryHub,
          primaryFocus,
          secondaryFocus,
          timeline,
          concerns,
          goals
        },
        1 // Normal priority
      )

      // Also save using the storage function for backward compatibility
      await saveReportRequest(
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

      return NextResponse.json({ 
        success: true, 
        reportId: report.id,
        isSample: false,
        message: 'Report generated successfully'
      })

    } catch (generationError: any) {
      // If generation fails, update status to failed
      console.error('Report generation error:', generationError)
      
      await supabase
        .from('reports')
        .update({
          status: 'failed',
          metadata: {
            ...report.metadata,
            error: generationError.message || 'Generation failed'
          }
        })
        .eq('id', report.id)

      return NextResponse.json(
        { 
          error: generationError.message || 'Failed to generate report',
          reportId: report.id 
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}
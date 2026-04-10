// src/app/api/generate-report/route.ts
// Hallucination-safe report generation API with multi-provider AI support
// UPDATED: Uses new licensing_requirements table and comprehensive data

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSafeReport } from '@/lib/regulatory/safeReportGenerator'
import { getActiveProvider } from '@/lib/ai/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { reportId, params } = body

    // Validate required parameters
    if (!reportId) {
      return NextResponse.json({
        success: false,
        error: 'Report ID is required'
      }, { status: 400 })
    }

    if (!params || !params.state) {
      return NextResponse.json({
        success: false,
        error: 'State parameter is required'
      }, { status: 400 })
    }

    // Log which AI provider we're using
    const activeProvider = getActiveProvider()
    console.log(`[API] Starting report generation for report ${reportId}`)
    console.log(`[API] AI Provider: ${activeProvider.name}`)
    console.log(`[API] Model: ${activeProvider.model}`)
    console.log(`[API] State: ${params.state}, Company: ${params.companyName}`)

    // Update report status to 'generating'
    await supabase
      .from('reports')
      .update({ status: 'generating', updated_at: new Date().toISOString() })
      .eq('id', reportId)

    // Generate the report using the safe generator
    const result = await generateSafeReport(params, reportId)

    if (!result.success) {
      // Update report status to 'failed'
      await supabase
        .from('reports')
        .update({ 
          status: 'failed', 
          updated_at: new Date().toISOString(),
          report_content: { error: result.error, timestamp: new Date().toISOString() }
        })
        .eq('id', reportId)

      return NextResponse.json({
        success: false,
        error: result.error,
        insufficientData: result.insufficientData,
        missingState: result.missingState
      }, { status: result.insufficientData ? 422 : 500 })
    }

    // Save the successful report to database
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        report_content: { 
          content: result.reportContent,
          facts_used: result.factsUsed.map(f => ({
            claim: f.fact.claim,
            source_name: f.fact.source_name,
            source_url: f.fact.source_url
          })),
          licensing_data: result.licensingData,
          enforcement_history: result.enforcementHistory,
          pending_legislation: result.pendingLegislation,
          ai_provider: result.aiProvider,
          verification: result.verification,
          generation_time_ms: Date.now() - startTime
        },
        status: result.verification?.safe ? 'ready' : 'needs_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (updateError) {
      console.error('[API] Error saving report to database:', updateError)
      // Continue anyway - we still return the report to the user
    }

    // Log completion
    console.log(`[API] Report generation complete in ${Date.now() - startTime}ms`)
    console.log(`[API] Status: ${result.verification?.safe ? 'READY' : 'NEEDS_REVIEW'}`)
    console.log(`[API] Verification: ${result.verification?.verifiedCount} verified, ${result.verification?.hallucinationCount} hallucinations`)

    // Return the successful response
    return NextResponse.json({
      success: true,
      reportContent: result.reportContent,
      aiProvider: result.aiProvider,
      verification: result.verification,
      factsUsed: result.factsUsed.length,
      generationTimeMs: Date.now() - startTime,
      reportStatus: result.verification?.safe ? 'ready' : 'needs_review'
    })

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
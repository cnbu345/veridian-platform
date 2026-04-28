// src/app/api/generate-report/route.ts
// Hallucination-safe report generation API with multi-state support
// UPDATED: Fetches licensing data directly from database

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSafeReport, generateMultiStateReport } from '@/lib/regulatory/safeReportGenerator'
import { getActiveProvider } from '@/lib/ai/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 🔥 NEW: Fetch licensing data directly from the database
async function fetchLicensingData(stateCode: string) {
  try {
    console.log(`📡 Fetching licensing data for ${stateCode} from database...`)
    
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .single()
    
    if (error) {
      console.warn(`⚠️ No licensing data found for ${stateCode}:`, error.message)
      return null
    }
    
    console.log(`✅ Retrieved licensing data for ${stateCode}:`, {
      application_fee: data?.application_fee,
      license_required: data?.license_required,
      regulator_name: data?.regulator_name,
      bond_min: data?.bond_requirement_min,
      bond_max: data?.bond_requirement_max
    })
    
    return data
  } catch (error) {
    console.error(`❌ Error fetching licensing data for ${stateCode}:`, error)
    return null
  }
}

// 🔥 NEW: Fetch multi-state licensing data
async function fetchMultiStateLicensingData(stateCodes: string[]) {
  try {
    const upperStates = stateCodes.map(s => s.toUpperCase())
    console.log(`📡 Fetching multi-state licensing data for: ${upperStates.join(', ')}`)
    
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .in('state_code', upperStates)
    
    if (error) {
      console.warn(`⚠️ Error fetching multi-state licensing data:`, error.message)
      return []
    }
    
    console.log(`✅ Retrieved licensing data for ${data?.length || 0} states`)
    return data || []
  } catch (error) {
    console.error(`❌ Error fetching multi-state licensing data:`, error)
    return []
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { reportId, params } = body
    const { state, secondaryStates = [], userTier = 'single' } = params

    // Validate required parameters
    if (!reportId) {
      return NextResponse.json({
        success: false,
        error: 'Report ID is required'
      }, { status: 400 })
    }

    if (!state) {
      return NextResponse.json({
        success: false,
        error: 'State parameter is required'
      }, { status: 400 })
    }

    // Log which AI provider we're using
    const activeProvider = getActiveProvider()
    console.log(`[API] Starting report generation for report ${reportId}`)
    console.log(`[API] AI Provider: ${activeProvider.name}`)
    console.log(`[API] Primary State: ${state}`)
    console.log(`[API] Secondary States: ${secondaryStates.join(', ') || 'None'}`)
    console.log(`[API] User Tier: ${userTier}`)

    // 🔥 FETCH LICENSING DATA BEFORE GENERATION
    const primaryLicensingData = await fetchLicensingData(state)
    
    let multiStateLicensingData: any[] = []
    if (secondaryStates.length > 0) {
      const allStates = [state, ...secondaryStates]
      multiStateLicensingData = await fetchMultiStateLicensingData(allStates)
    }

    // Update report status to 'generating' WITH licensing data
    await supabase
      .from('reports')
      .update({ 
        status: 'generating',  // Valid status per CHECK constraint
        updated_at: new Date().toISOString(),
        report_content: { 
          primary_state: state,
          secondary_states: secondaryStates,
          started_at: new Date().toISOString(),
          // 🔥 STORE LICENSING DATA IMMEDIATELY
          licensing_data: primaryLicensingData,
          multi_state_licensing_data: multiStateLicensingData
        }
      })
      .eq('id', reportId)

    let result

    // Check if this is a multi-state report (Enterprise users with secondary states)
    if (secondaryStates && secondaryStates.length > 0 && userTier === 'enterprise') {
      console.log(`[API] Generating MULTI-STATE report for ${state} + ${secondaryStates.length} states`)
      result = await generateMultiStateReport(params, reportId)
    } else {
      console.log(`[API] Generating SINGLE-STATE report for ${state}`)
      result = await generateSafeReport(params, reportId)
    }

    if (!result.success) {
      await supabase
        .from('reports')
        .update({ 
          status: 'failed',  // Valid status per CHECK constraint
          updated_at: new Date().toISOString(),
          report_content: { 
            error: result.error, 
            timestamp: new Date().toISOString(),
            // Preserve licensing data even on failure
            licensing_data: primaryLicensingData,
            multi_state_licensing_data: multiStateLicensingData
          }
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
    // 🔥 MERGE licensing data with the result
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        report_content: { 
          content: result.reportContent,
          facts_used: result.factsUsed?.map(f => ({
            claim: f.fact?.claim || f.claim,
            source_name: f.fact?.source_name || f.source_name,
            source_url: f.fact?.source_url || f.source_url
          })) || [],
          // 🔥 USE THE LICENSING DATA WE FETCHED (not result.licensingData which may be null)
          licensing_data: primaryLicensingData || result.licensingData,
          multi_state_licensing_data: multiStateLicensingData,
          enforcement_history: result.enforcementHistory,
          pending_legislation: result.pendingLegislation,
          ai_provider: result.aiProvider,
          verification: result.verification,
          generation_time_ms: Date.now() - startTime,
          primary_state: state,
          secondary_states: secondaryStates,
          report_type: secondaryStates.length > 0 ? 'multi-state' : 'single-state'
        },
        status: result.verification?.safe ? 'ready' : 'needs_review',  // Both valid per CHECK constraint
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (updateError) {
      console.error('[API] Error saving report to database:', updateError)
    }

    console.log(`[API] Report generation complete in ${Date.now() - startTime}ms`)
    console.log(`[API] Status: ${result.verification?.safe ? 'READY' : 'NEEDS_REVIEW'}`)
    console.log(`[API] Licensing data saved: ${!!primaryLicensingData}`)

    return NextResponse.json({
      success: true,
      reportContent: result.reportContent,
      aiProvider: result.aiProvider,
      verification: result.verification,
      factsUsed: result.factsUsed?.length || 0,
      generationTimeMs: Date.now() - startTime,
      reportStatus: result.verification?.safe ? 'ready' : 'needs_review',
      reportType: secondaryStates.length > 0 ? 'multi-state' : 'single-state',
      hasLicensingData: !!primaryLicensingData
    })

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
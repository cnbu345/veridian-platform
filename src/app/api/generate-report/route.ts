// src/app/api/generate-report/route.ts
// Hallucination-safe report generation API with multi-provider AI support

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAndSaveReportClaims } from '@/lib/regulatory/safeReportGenerator'
import { prepareRAGContext } from '@/lib/regulatory/rag'
import { generateWithAI } from '@/lib/ai/service'
import { getActiveProvider } from '@/lib/ai/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId, params } = body

    // Log which AI provider we're using
    const activeProvider = getActiveProvider()
    console.log(`[Report Generation] Using AI provider: ${activeProvider.name}`)
    console.log(`[Report Generation] Model: ${activeProvider.model}`)

    // STEP 1: Check if we have sufficient data
    const ragContext = await prepareRAGContext(params.state, params.state)
    
    if (!ragContext.hasData) {
      return NextResponse.json({
        success: false,
        error: `INSUFFICIENT DATA: Only ${ragContext.facts.length} verified facts found for ${params.state}. Minimum 3 required.`,
        insufficientData: true,
        missingState: params.state
      }, { status: 422 })
    }

    console.log(`[Report Generation] Retrieved ${ragContext.facts.length} verified facts`)

    // STEP 2: Build the safe prompt
    const stateInfo = { name: params.state }
    const safePrompt = buildSafePrompt(params, ragContext.promptContext, stateInfo)

    // STEP 3: Generate report with the configured AI provider
    console.log(`[Report Generation] Sending prompt to ${activeProvider.name}...`)
    
    let reportContent: string
    let aiProvider: string
    
    try {
      const aiResponse = await generateWithAI(safePrompt, {
        companyName: params.companyName,
        industry: params.industry,
        location: `${params.city}, ${params.state}`
      })
      
      reportContent = aiResponse.content
      aiProvider = aiResponse.provider
      
      console.log(`[Report Generation] Received response from ${aiProvider}`)
      console.log(`[Report Generation] Response length: ${reportContent.length} characters`)
      
      if (aiResponse.usage) {
        console.log(`[Report Generation] Token usage:`, aiResponse.usage)
      }
      
    } catch (aiError) {
      console.error(`[Report Generation] AI provider error:`, aiError)
      
      // Return a graceful error response
      return NextResponse.json({
        success: false,
        error: `AI provider (${activeProvider.name}) failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`,
        provider: activeProvider.name,
        insufficientData: false
      }, { status: 503 })
    }

    // STEP 4: Verify the generated report for hallucinations
    console.log(`[Report Generation] Verifying report claims...`)
    const verification = await verifyAndSaveReportClaims(reportId, reportContent, params.state)
    
    console.log(`[Report Generation] Verification complete:`)
    console.log(`  - Verified claims: ${verification.verifiedCount}`)
    console.log(`  - Potential hallucinations: ${verification.hallucinationCount}`)
    console.log(`  - Report safe: ${verification.safe}`)

    // STEP 5: Save the report to database
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        report_content: { 
          content: reportContent, 
          facts_used: ragContext.facts,
          ai_provider: aiProvider,
          verification_result: verification
        },
        status: verification.safe ? 'ready' : 'needs_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (updateError) {
      console.error('[Report Generation] Error saving report:', updateError)
      // Continue anyway - we still want to return the report to the user
    }

    // STEP 6: Return the report with metadata
    return NextResponse.json({
      success: true,
      reportContent,
      aiProvider,
      verification: {
        verifiedCount: verification.verifiedCount,
        hallucinationCount: verification.hallucinationCount,
        safe: verification.safe
      },
      factsUsed: ragContext.facts.length,
      facts: ragContext.facts.map(f => ({
        content: f.content,
        source: f.source_name
      }))
    })

  } catch (error) {
    console.error('[Report Generation] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

function buildSafePrompt(params: any, verifiedContext: string, stateInfo: any): string {
  return `You are a regulatory compliance AI for financial institutions. You have ZERO tolerance for hallucinations.

${verifiedContext}

COMPANY INFORMATION:
- Company: ${params.companyName}
- Industry: ${params.industry}
- Location: ${params.city}, ${params.state}
- Market Tier: ${params.locationTier}
- Compliance Focus: ${params.primaryFocus}
${params.secondaryFocus ? `- Secondary Focus: ${params.secondaryFocus}` : ''}
${params.timeline ? `- Timeline: ${params.timeline}` : ''}

REPORT REQUIREMENTS:
Generate a regulatory intelligence report with the following structure:

## 1. EXECUTIVE SUMMARY
- ONLY summarize verified facts from the context above
- If information is missing for any section, state "No verified data available"
- Include the company name and primary compliance focus

## 2. REGULATORY REQUIREMENTS
- List ONLY the verified license requirements from the context above
- For each requirement, cite the source URL in format [Source: Source Name]
- If a requirement type is not listed, say "No verified data available"
- Include specific statute or regulation numbers if provided

## 3. COMPLIANCE TIMELINE
- ONLY use verified timeline facts from the context
- Include estimated processing times if verified
- If no timeline data exists, state "Timeline data not verified for this jurisdiction"

## 4. RISK ASSESSMENT
- Based ONLY on the verified regulatory climate rating above
- Identify compliance gaps based on missing verified data
- DO NOT speculate about unverified risks

## 5. RECOMMENDED NEXT STEPS
- Based ONLY on verified requirements
- Prioritize actions that have verified timelines
- Recommend legal counsel review for any unclear requirements

CRITICAL RULES (MUST FOLLOW EXACTLY):
1. DO NOT invent any regulatory requirements, fees, bonds, or timelines
2. DO NOT guess or estimate missing information
3. If a fact isn't in the context above, say "INSUFFICIENT DATA" or "No verified data available"
4. ALWAYS cite sources using the provided URLs in format [Source: Source Name]
5. Use exact numbers from the context - do not round or approximate
6. Include this exact disclaimer at the end:

---
**DISCLAIMER**: This report uses only verified regulatory data from official sources as cited above. Veridian Group is not a law firm. All compliance strategies should be reviewed with qualified legal counsel in ${params.state} before implementation. Regulations are subject to change without notice. This report reflects verified data as of the retrieval date.
---

Generate the complete report now following these exact requirements:`
}
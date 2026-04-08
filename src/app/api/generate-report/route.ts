// src/app/api/generate-report/route.ts
// Hallucination-safe report generation API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSafeReport, verifyAndSaveReportClaims } from '@/lib/regulatory/safeReportGenerator'
import { prepareRAGContext } from '@/lib/regulatory/rag'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId, params } = body

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

    // STEP 2: Build the safe prompt
    const stateInfo = { name: params.state } // Simplified
    const safePrompt = buildSafePrompt(params, ragContext.promptContext, stateInfo)

    // STEP 3: Generate report with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are a regulatory compliance AI. You NEVER hallucinate. You ONLY use the verified facts provided. If information is missing, you say "INSUFFICIENT DATA".' 
        },
        { role: 'user', content: safePrompt }
      ],
      temperature: 0.1, // Low temperature = less creativity = less hallucination
      max_tokens: 4000
    })

    const reportContent = completion.choices[0].message.content

    // STEP 4: Verify the generated report
    const verification = await verifyAndSaveReportClaims(reportId, reportContent || '', params.state)

    // STEP 5: Save the report to database
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        report_content: { content: reportContent, facts_used: ragContext.facts },
        status: verification.safe ? 'ready' : 'needs_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (updateError) {
      console.error('Error saving report:', updateError)
    }

    // STEP 6: Return the report
    return NextResponse.json({
      success: true,
      reportContent,
      verification: {
        verifiedCount: verification.verifiedCount,
        hallucinationCount: verification.hallucinationCount,
        safe: verification.safe
      },
      factsUsed: ragContext.facts.length
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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

REPORT REQUIREMENTS:
Generate a regulatory intelligence report with the following structure:

## 1. EXECUTIVE SUMMARY
- ONLY summarize verified facts from above
- If information is missing, state "No verified data available"

## 2. REGULATORY REQUIREMENTS
- List ONLY the verified license requirements from the context above
- For each requirement, cite the source URL
- If a requirement type is not listed, say "No verified data available"

## 3. COMPLIANCE TIMELINE
- ONLY use verified timeline facts
- If no timeline data exists, provide a disclaimer

## 4. RISK ASSESSMENT
- Based ONLY on the verified regulatory climate rating above

CRITICAL RULES:
1. DO NOT invent any regulatory requirements
2. DO NOT guess timelines or fees
3. If a fact isn't in the context above, say "INSUFFICIENT DATA"
4. ALWAYS cite sources using the provided URLs
5. Include this disclaimer: "DISCLAIMER: This report uses only verified regulatory data from official sources. Always consult qualified legal counsel before making compliance decisions."

Generate the report now:`
}
// src/lib/regulatory/reportVerifier.ts
// Phase 3: Post-generation report verification

import { verifyReport, generateVerificationReport, type ReportVerificationResult } from './hallucinationDetector'
import { hasSufficientData, buildPromptFromFacts, searchRelevantFacts } from './simpleRag'
import { getActiveProvider, generateWithAI } from '@/lib/ai/service'

export interface SafeReportOptions {
  companyName: string
  industry: string
  city: string
  state: string
  stateName: string
  primaryFocus: string
  secondaryFocus: string[]
  timeline: string
  concerns: string
  goals: string
  locationTier: string
  nearestRegulatoryHub?: string
  companySize?: string
  budget?: string
}

export interface SafeReportResult {
  success: boolean
  reportContent?: string
  verification?: ReportVerificationResult
  error?: string
  insufficientData?: boolean
  blocked?: boolean
}

/**
 * Generate a hallucination-safe report with post-generation verification
 */
export async function generateSafeReportWithVerification(
  reportId: string,
  options: SafeReportOptions
): Promise<SafeReportResult> {
  console.log(`[ReportVerifier] Generating safe report for ${options.companyName} in ${options.state}`)
  
  // Step 1: Check if we have sufficient data
  const hasData = await hasSufficientData(options.state, 3)
  
  if (!hasData) {
    return {
      success: false,
      insufficientData: true,
      error: `Insufficient verified data for ${options.stateName} (${options.state}). Need at least 3 facts.`
    }
  }
  
  // Step 2: Build the prompt with verified facts
  const query = `Generate regulatory compliance report for ${options.companyName} focusing on ${options.primaryFocus}`
  const relevantFacts = await searchRelevantFacts(query, options.state, 10)
  
  if (relevantFacts.length === 0) {
    return {
      success: false,
      insufficientData: true,
      error: `No relevant facts found for ${options.stateName}`
    }
  }
  
  const prompt = buildPromptFromFacts(query, options.state, options.stateName, relevantFacts)
  
  // Step 3: Generate the report using your AI provider
  const aiResponse = await generateWithAI(prompt)
  
  if (!aiResponse.content) {
    return {
      success: false,
      error: 'AI generation failed'
    }
  }
  
  // Step 4: Verify the generated report for hallucinations
  const verification = await verifyReport(reportId, aiResponse.content, options.state, options.stateName)
  
  // Step 5: Generate verification report for logging
  const verificationReport = generateVerificationReport(verification)
  console.log(verificationReport)
  
  // Step 6: Decide if report should be blocked
  const BLOCK_THRESHOLD = 20 // Block if hallucination rate > 20%
  
  if (verification.hallucinationRate > BLOCK_THRESHOLD) {
    return {
      success: false,
      verification,
      blocked: true,
      error: `Report blocked: Hallucination rate ${verification.hallucinationRate.toFixed(1)}% exceeds ${BLOCK_THRESHOLD}% threshold. ${verification.hallucinationCount} unverified claims found.`
    }
  }
  
  // Step 7: Return the verified report
  return {
    success: true,
    reportContent: aiResponse.content,
    verification
  }
}

/**
 * Re-verify an existing report (for admin review)
 */
export async function reverifyReport(reportId: string): Promise<ReportVerificationResult | null> {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Get the report
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()
  
  if (error || !report) {
    console.error('Report not found:', error)
    return null
  }
  
  // Extract content from JSON
  const reportContent = typeof report.report_content === 'object' && report.report_content !== null
    ? (report.report_content as any).content || JSON.stringify(report.report_content)
    : String(report.report_content)
  
  // Re-verify
  const verification = await verifyReport(reportId, reportContent, report.state, report.city)
  
  return verification
}
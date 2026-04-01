// src/lib/regulatory/hallucinationDetector.ts
// Phase 3: Real-time hallucination detection and verification

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { searchRelevantFacts, type SearchResult } from './simpleRag'

// Initialize Supabase with service role for verification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: ReturnType<typeof createClient<Database>> | null = null

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
}

export interface VerifiedClaim {
  claimText: string
  isVerified: boolean
  confidenceScore: number // 0-100
  supportingFacts: SearchResult[]
  verificationReason: string
  suggestedCorrection?: string
}

export interface ReportVerificationResult {
  reportId: string
  totalClaims: number
  verifiedCount: number
  unverifiedCount: number
  hallucinationCount: number
  hallucinationRate: number // percentage
  isSafe: boolean // <10% hallucination rate
  claims: VerifiedClaim[]
  summary: string
}

/**
 * Extract regulatory claims from a sentence
 * Identifies sentences that make factual regulatory statements
 */
export function extractClaimsFromText(text: string): string[] {
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  
  // Regulatory keywords that indicate a factual claim
  const regulatoryKeywords = [
    'license', 'required', 'must', 'need', 'shall', 'mandatory', 'obligation',
    'regulation', 'regulatory', 'compliance', 'law', 'statute', 'ordinance',
    'fee', 'bond', 'capital', 'reserve', 'reporting', 'disclosure',
    'deadline', 'timeline', 'processing time', 'application period',
    'prohibited', 'allowed', 'permitted', 'restricted', 'forbidden',
    'tax', 'income tax', 'sales tax', 'withholding', 'taxation',
    'enforcement', 'penalty', 'fine', 'sanction', 'violation',
    'pending', 'proposed', 'effective date', 'enacted', 'passed'
  ]
  
  return sentences
    .map(s => s.trim())
    .filter(s => s.length > 30) // Minimum sentence length for claims
    .filter(s => {
      const lower = s.toLowerCase()
      // Must contain at least one regulatory keyword
      const hasKeyword = regulatoryKeywords.some(keyword => lower.includes(keyword))
      if (!hasKeyword) return false
      
      // Filter out non-factual statements
      const nonFactualPatterns = [
        /^i think/i, /^i believe/i, /^maybe/i, /^perhaps/i,
        /^it seems/i, /^could be/i, /^might be/i,
        /^according to some/i, /^some say/i
      ]
      for (const pattern of nonFactualPatterns) {
        if (pattern.test(lower)) return false
      }
      
      return true
    })
}

/**
 * Verify a single claim against the regulatory facts database
 * Enhanced with stricter matching to prevent false positives
 */
export async function verifyClaim(
  claim: string,
  stateCode: string
): Promise<VerifiedClaim> {
  // Search for relevant facts
  const relevantFacts = await searchRelevantFacts(claim, stateCode, 10)
  
  if (relevantFacts.length === 0) {
    return {
      claimText: claim,
      isVerified: false,
      confidenceScore: 0,
      supportingFacts: [],
      verificationReason: 'No matching facts found in database'
    }
  }
  
  // Stricter verification - require exact match for numeric values
  const claimLower = claim.toLowerCase()
  const numericPattern = /\$?[\d,]+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:thousand|million|billion))?/gi
  const claimNumbers = claim.match(numericPattern) || []
  
  // Score each fact with stricter criteria
  const scoredFacts = relevantFacts.map(fact => {
    let score = 0
    const factLower = fact.fact.claim.toLowerCase()
    
    // Exact phrase match (highest score - 100 points)
    if (factLower.includes(claimLower)) {
      score += 100
    }
    // Significant overlap (more than 50% of words match)
    else {
      const claimWords = new Set(claimLower.split(/\s+/).filter(w => w.length > 4))
      const factWords = new Set(factLower.split(/\s+/).filter(w => w.length > 4))
      let matchCount = 0
      for (const word of claimWords) {
        if (factWords.has(word)) matchCount++
      }
      const overlapPercent = claimWords.size > 0 ? matchCount / claimWords.size : 0
      if (overlapPercent > 0.6) score += 60
      else if (overlapPercent > 0.4) score += 30
    }
    
    // Check numeric values (strict match required)
    const factNumbers = fact.fact.claim.match(numericPattern) || []
    if (claimNumbers.length > 0 && factNumbers.length > 0) {
      const claimNumeric = claimNumbers[0].replace(/[$,]/g, '')
      const factNumeric = factNumbers[0].replace(/[$,]/g, '')
      if (claimNumeric === factNumeric) {
        score += 40 // Exact numeric match adds points
      } else if (Math.abs(parseFloat(claimNumeric) - parseFloat(factNumeric)) / parseFloat(factNumeric) < 0.1) {
        score += 20 // Within 10% is close
      } else {
        score -= 30 // Numeric mismatch reduces score significantly
      }
    }
    
    // Category match with context
    const categoryContext: Record<string, string[]> = {
      'license_requirement': ['license', 'required', 'must', 'need', 'permit', 'registration', 'bitlicense', 'money transmitter', 'charter'],
      'timeline': ['time', 'month', 'day', 'week', 'process', 'duration', 'wait', 'period', 'long', 'how long', 'take', 'processing', 'timeline'],
      'fee_amount': ['fee', 'cost', 'price', 'charge', 'payment', 'dollar', '$', 'application fee'],
      'bonding_amount': ['bond', 'surety', 'insurance', 'guarantee', 'bonding'],
      'tax_treatment': ['tax', 'income', 'federal', 'state tax', 'deduction', 'pay', 'irs', 'taxation'],
      'pending_legislation': ['bill', 'act', 'law', 'legislation', 'proposed', 'pending', 'effective', 'enacted', 'statute'],
      'enforcement_action': ['enforcement', 'fine', 'penalty', 'action', 'settlement', 'cease', 'desist']
    }
    
    const keywords = categoryContext[fact.fact.category] || []
    let categoryMatch = false
    for (const keyword of keywords) {
      if (claimLower.includes(keyword)) {
        categoryMatch = true
        score += 15
        break
      }
    }
    
    // Penalize mismatched categories
    if (!categoryMatch && claimNumbers.length > 0 && fact.fact.category === 'fee_amount') {
      score -= 20 // Claim mentions numbers but fact is about fees without matching numbers
    }
    
    return {
      ...fact,
      score
    }
  })
  
  // Sort by score descending
  scoredFacts.sort((a, b) => b.score - a.score)
  const bestMatch = scoredFacts[0]
  
  // Determine verification status based on score threshold
  if (bestMatch.score >= 80) {
    return {
      claimText: claim,
      isVerified: true,
      confidenceScore: Math.min(bestMatch.score, 100),
      supportingFacts: scoredFacts.filter(f => f.score >= 50),
      verificationReason: `Verified by matching fact (${bestMatch.score}% match): "${bestMatch.fact.claim.substring(0, 100)}..."`
    }
  } else if (bestMatch.score >= 50) {
    return {
      claimText: claim,
      isVerified: false,
      confidenceScore: bestMatch.score,
      supportingFacts: [bestMatch],
      verificationReason: `Partial match (${bestMatch.score}% confidence) - requires human review. Best match: "${bestMatch.fact.claim.substring(0, 80)}..."`
    }
  } else {
    return {
      claimText: claim,
      isVerified: false,
      confidenceScore: bestMatch.score,
      supportingFacts: [],
      verificationReason: `No strong match found (${bestMatch.score}% confidence). Claim may be hallucinated.`
    }
  }
}

/**
 * Verify an entire report and track all claims
 */
export async function verifyReport(
  reportId: string,
  reportContent: string,
  stateCode: string,
  stateName: string
): Promise<ReportVerificationResult> {
  if (!supabase) {
    console.error('HallucinationDetector: No Supabase client')
    throw new Error('Database connection unavailable')
  }
  
  // Extract claims from the report
  const claims = extractClaimsFromText(reportContent)
  
  console.log(`[HallucinationDetector] Extracted ${claims.length} claims from report ${reportId}`)
  
  const verifiedClaims: VerifiedClaim[] = []
  let verifiedCount = 0
  let hallucinationCount = 0
  
  // Verify each claim
  for (const claim of claims) {
    const verification = await verifyClaim(claim, stateCode)
    verifiedClaims.push(verification)
    
    if (verification.isVerified) {
      verifiedCount++
    } else {
      hallucinationCount++
    }
    
    // Record the claim in the database
    await supabase
      .from('report_claims')
      .insert({
        report_id: reportId,
        claim: claim,
        supporting_fact_ids: verification.supportingFacts.map(f => f.fact.id),
        verification_status: verification.isVerified ? 'verified' : 'unverified',
        verification_score: verification.confidenceScore / 100,
        verification_notes: verification.verificationReason,
        verified_at: new Date().toISOString()
      })
  }
  
  const totalClaims = claims.length
  const hallucinationRate = totalClaims > 0 ? (hallucinationCount / totalClaims) * 100 : 0
  const isSafe = hallucinationRate < 10 // Less than 10% hallucination rate is acceptable
  
  // Update report status based on verification
  await supabase
    .from('reports')
    .update({
      status: isSafe ? 'ready' : 'needs_review',
      updated_at: new Date().toISOString()
    })
    .eq('id', reportId)
  
  const summary = isSafe
    ? `Report verified with ${verifiedCount}/${totalClaims} claims confirmed. Hallucination rate: ${hallucinationRate.toFixed(1)}% (below 10% threshold).`
    : `WARNING: High hallucination rate (${hallucinationRate.toFixed(1)}%). ${hallucinationCount}/${totalClaims} claims could not be verified. Manual review required.`
  
  return {
    reportId,
    totalClaims,
    verifiedCount,
    unverifiedCount: totalClaims - verifiedCount - hallucinationCount,
    hallucinationCount,
    hallucinationRate,
    isSafe,
    claims: verifiedClaims,
    summary
  }
}

/**
 * Generate a verification report for display
 */
export function generateVerificationReport(
  result: ReportVerificationResult
): string {
  let output = `\n${'='.repeat(60)}\n`
  output += `HALLUCINATION DETECTION REPORT\n`
  output += `Report ID: ${result.reportId}\n`
  output += `Hallucination Rate: ${result.hallucinationRate.toFixed(1)}%\n`
  output += `Status: ${result.isSafe ? '✅ SAFE' : '⚠️ NEEDS REVIEW'}\n`
  output += `${'='.repeat(60)}\n\n`
  
  output += `Claims Summary:\n`
  output += `- Total Claims: ${result.totalClaims}\n`
  output += `- Verified: ${result.verifiedCount}\n`
  output += `- Unverified: ${result.unverifiedCount}\n`
  output += `- Hallucinations: ${result.hallucinationCount}\n\n`
  
  if (!result.isSafe) {
    output += `⚠️  CRITICAL: ${result.hallucinationCount} claims could not be verified!\n`
    output += `   These claims require manual review before publication.\n\n`
  }
  
  output += `Detailed Claim Analysis:\n`
  output += `-`.repeat(60) + `\n`
  
  const unverifiedClaims = result.claims.filter(c => !c.isVerified)
  for (const claim of unverifiedClaims.slice(0, 10)) {
    output += `\n❌ UNVERIFIED: "${claim.claimText.substring(0, 150)}..."\n`
    output += `   Reason: ${claim.verificationReason}\n`
    if (claim.supportingFacts.length > 0) {
      output += `   Closest match: "${claim.supportingFacts[0].fact.claim.substring(0, 100)}..."\n`
    }
  }
  
  if (unverifiedClaims.length > 10) {
    output += `\n... and ${unverifiedClaims.length - 10} more unverified claims\n`
  }
  
  output += `\n${'='.repeat(60)}\n`
  
  return output
}

/**
 * Calculate hallucination statistics for a user/company over time
 */
export async function getHallucinationStats(
  userId?: string,
  days: number = 30
): Promise<{
  totalReports: number
  totalClaims: number
  verifiedClaims: number
  hallucinationClaims: number
  averageHallucinationRate: number
  trend: 'improving' | 'stable' | 'declining'
  recentReports: Array<{
    reportId: string
    date: string
    hallucinationRate: number
    isSafe: boolean
  }>
}> {
  if (!supabase) {
    throw new Error('Database connection unavailable')
  }
  
  let query = supabase
    .from('report_claims')
    .select(`
      id,
      report_id,
      verification_status,
      created_at,
      reports!inner (
        id,
        user_id,
        company_name,
        created_at
      )
    `)
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
  
  if (userId) {
    query = query.eq('reports.user_id', userId)
  }
  
  const { data: claims, error } = await query
  
  if (error || !claims) {
    console.error('Error fetching hallucination stats:', error)
    return {
      totalReports: 0,
      totalClaims: 0,
      verifiedClaims: 0,
      hallucinationClaims: 0,
      averageHallucinationRate: 0,
      trend: 'stable',
      recentReports: []
    }
  }
  
  // Group by report
  const reportMap = new Map<string, { total: number; verified: number; hallucination: number; date: string }>()
  
  for (const claim of claims) {
    const reportId = claim.report_id
    if (!reportMap.has(reportId)) {
      reportMap.set(reportId, {
        total: 0,
        verified: 0,
        hallucination: 0,
        date: claim.created_at
      })
    }
    
    const report = reportMap.get(reportId)!
    report.total++
    
    if (claim.verification_status === 'verified') {
      report.verified++
    } else if (claim.verification_status === 'unverified') {
      report.hallucination++
    }
  }
  
  const recentReports = Array.from(reportMap.entries()).map(([reportId, data]) => ({
    reportId,
    date: data.date,
    hallucinationRate: data.total > 0 ? (data.hallucination / data.total) * 100 : 0,
    isSafe: data.total > 0 ? (data.hallucination / data.total) < 0.1 : true
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  const totalClaims = claims.length
  const verifiedClaims = claims.filter(c => c.verification_status === 'verified').length
  const hallucinationClaims = claims.filter(c => c.verification_status === 'unverified').length
  const averageHallucinationRate = totalClaims > 0 ? (hallucinationClaims / totalClaims) * 100 : 0
  
  // Calculate trend (compare last 7 days to previous 7 days)
  const now = new Date()
  const lastWeek = recentReports.filter(r => new Date(r.date) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
  const previousWeek = recentReports.filter(r => {
    const date = new Date(r.date)
    return date <= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) &&
           date > new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  })
  
  const lastWeekAvg = lastWeek.length > 0 ? lastWeek.reduce((sum, r) => sum + r.hallucinationRate, 0) / lastWeek.length : 0
  const previousWeekAvg = previousWeek.length > 0 ? previousWeek.reduce((sum, r) => sum + r.hallucinationRate, 0) / previousWeek.length : 0
  
  let trend: 'improving' | 'stable' | 'declining' = 'stable'
  if (lastWeekAvg < previousWeekAvg - 5) trend = 'improving'
  else if (lastWeekAvg > previousWeekAvg + 5) trend = 'declining'
  
  return {
    totalReports: reportMap.size,
    totalClaims,
    verifiedClaims,
    hallucinationClaims,
    averageHallucinationRate,
    trend,
    recentReports
  }
}
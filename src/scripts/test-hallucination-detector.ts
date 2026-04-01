// src/scripts/test-hallucination-detector.ts
// Test Phase 3: Hallucination Detector

import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env.local') })

async function testHallucinationDetector() {
  console.log('========================================')
  console.log('PHASE 3: Hallucination Detector Test')
  console.log('========================================\n')
  
  // Import modules
  const { extractClaimsFromText, verifyClaim, verifyReport, generateVerificationReport } = await import('../lib/regulatory/hallucinationDetector.js')
  
  // Test 1: Extract claims from text
  console.log('📋 TEST 1: Extract Claims from Text')
  console.log('-'.repeat(40))
  
  const sampleText = `
    The New York BitLicense requires a minimum processing time of 12-18 months.
    Companies must maintain a surety bond of $250,000 to $500,000.
    The CRYPTO Act of 2026 makes unlicensed activity a criminal offense.
    This is a general statement that doesn't contain regulatory claims.
  `
  
  const extractedClaims = extractClaimsFromText(sampleText)
  console.log(`Extracted ${extractedClaims.length} claims:`)
  extractedClaims.forEach((claim, i) => {
    console.log(`  ${i + 1}. "${claim.substring(0, 100)}..."`)
  })
  console.log()
  
  // Test 2: Verify a known true claim
  console.log('📋 TEST 2: Verify Known True Claim')
  console.log('-'.repeat(40))
  
  const trueClaim = 'New York BitLicense processing time is 12-18 months for virtual currency businesses'
  const trueVerification = await verifyClaim(trueClaim, 'NY')
  console.log(`Claim: "${trueClaim.substring(0, 80)}..."`)
  console.log(`  Verified: ${trueVerification.isVerified ? '✅ YES' : '❌ NO'}`)
  console.log(`  Confidence: ${trueVerification.confidenceScore}%`)
  console.log(`  Reason: ${trueVerification.verificationReason}`)
  console.log()
  
  // Test 3: Verify a false/hallucinated claim
  console.log('📋 TEST 3: Verify False Claim (Hallucination)')
  console.log('-'.repeat(40))
  
  const falseClaim = 'New York requires a $10,000 license fee for crypto businesses'
  const falseVerification = await verifyClaim(falseClaim, 'NY')
  console.log(`Claim: "${falseClaim}"`)
  console.log(`  Verified: ${falseVerification.isVerified ? '✅ YES' : '❌ NO'}`)
  console.log(`  Confidence: ${falseVerification.confidenceScore}%`)
  console.log(`  Reason: ${falseVerification.verificationReason}`)
  console.log()
  
  // Test 4: Create a mock report and verify it
  console.log('📋 TEST 4: Full Report Verification')
  console.log('-'.repeat(40))
  
  const mockReportId = 'test-report-123'
  const mockReportContent = `
    The New York BitLicense processing time is 12-18 months for virtual currency businesses.
    Companies must maintain a surety bond of $250,000 to $500,000.
    The application fee for a BitLicense is $10,000. (This is potentially false - actual fee is $5,000)
    New York has a strict regulatory climate for digital assets.
    The CRYPTO Act of 2026 makes unlicensed activity a criminal offense.
  `
  
  const verification = await verifyReport(mockReportId, mockReportContent, 'NY', 'New York')
  const report = generateVerificationReport(verification)
  console.log(report)
  
  // Summary
  console.log('\n✅ Phase 3 Hallucination Detector Test Complete!')
  console.log(`   Hallucination Rate: ${verification.hallucinationRate.toFixed(1)}%`)
  console.log(`   Safe: ${verification.isSafe ? 'YES' : 'NO'}`)
}

testHallucinationDetector().catch(console.error)
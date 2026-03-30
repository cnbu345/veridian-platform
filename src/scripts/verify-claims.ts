// src/scripts/verify-claims.ts
// Verify existing report claims against regulatory_facts
// Run with: npm run verify:claims

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function verifyExistingClaims() {
  console.log('VERIFYING EXISTING REPORT CLAIMS')
  console.log('================================')
  console.log('')

  // Get all unverified claims
  const { data: claims, error } = await supabase
    .from('report_claims')
    .select(`
      id,
      claim,
      verification_status,
      report_id,
      created_at
    `)
    .is('verified_at', null)
    .limit(50)

  if (error) {
    console.error('Error fetching claims:', error.message)
    return
  }

  if (!claims || claims.length === 0) {
    console.log('No unverified claims found. All claims are verified!')
    return
  }

  console.log(`Found ${claims.length} unverified claims to check`)
  console.log('')

  let verifiedCount = 0
  let hallucinationCount = 0
  let needsReviewCount = 0

  for (const claim of claims) {
    console.log(`Checking claim ID: ${claim.id.substring(0, 8)}...`)
    console.log(`   Claim: "${claim.claim.substring(0, 100)}..."`)
    
    // Try to verify with NY as default state (you can enhance this)
    const { data: verification, error: verifyError } = await supabase.rpc('verify_claim', {
      claim_text: claim.claim,
      state_code: 'NY'
    })

    if (verifyError) {
      console.error(`   Verification failed: ${verifyError.message}`)
      needsReviewCount++
      continue
    }

    const isVerified = verification?.is_verified || false
    const confidenceScore = verification?.confidence_score || 0
    
    let status: 'verified' | 'unverified' | 'hallucination' | 'needs_review'
    let notes: string

    if (isVerified && confidenceScore > 0.8) {
      status = 'verified'
      notes = `Auto-verified with ${Math.round(confidenceScore * 100)}% confidence`
      verifiedCount++
    } else if (!isVerified && confidenceScore < 0.3) {
      status = 'hallucination'
      notes = `Auto-detected as hallucination (${Math.round(confidenceScore * 100)}% confidence). Human review recommended.`
      hallucinationCount++
    } else {
      status = 'needs_review'
      notes = `Ambiguous claim (${Math.round(confidenceScore * 100)}% confidence). Human review required.`
      needsReviewCount++
    }

    const { error: updateError } = await supabase
      .from('report_claims')
      .update({
        verification_status: status,
        verification_score: confidenceScore,
        verified_at: new Date().toISOString(),
        verification_notes: notes
      })
      .eq('id', claim.id)

    if (updateError) {
      console.error(`   Update failed: ${updateError.message}`)
    } else {
      const statusEmoji = status === 'verified' ? '✅' : status === 'hallucination' ? '❌' : '⚠️'
      console.log(`   ${statusEmoji} Status: ${status} (${Math.round(confidenceScore * 100)}% confidence)`)
    }
    console.log('')
  }

  console.log('VERIFICATION SUMMARY')
  console.log('====================')
  console.log(`✅ Verified: ${verifiedCount}`)
  console.log(`❌ Hallucinations: ${hallucinationCount}`)
  console.log(`⚠️ Needs Review: ${needsReviewCount}`)
  console.log(`📊 Total processed: ${claims.length}`)
  
  const hallucinationRate = claims.length > 0 ? (hallucinationCount / claims.length) * 100 : 0
  console.log(`\nHallucination Rate: ${hallucinationRate.toFixed(1)}%`)
  
  if (hallucinationRate > 10) {
    console.log('\n⚠️ WARNING: Hallucination rate exceeds 10% threshold!')
    console.log('   Review the claims marked as "hallucination" above.')
  } else {
    console.log('\n✅ Hallucination rate is within acceptable range (<10%)')
  }
}

verifyExistingClaims()
  .then(() => {
    console.log('\nVerification complete!')
    // Use setTimeout to allow Node to clean up properly
    setTimeout(() => process.exit(0), 100)
  })
  .catch(error => {
    console.error('\nVerification failed:', error)
    setTimeout(() => process.exit(1), 100)
  })
// src/scripts/test-phase1.ts
// Fixed to handle TABLE return type from Supabase

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPhase1() {
  console.log('TESTING PHASE 1: Source-Truth Database')
  console.log('')

  // Test 1: Get verified facts for NY
  console.log('TEST 1: Get verified facts for NY')
  const { data: nyFacts, error: nyError } = await supabase
    .from('regulatory_facts')
    .select('*')
    .eq('state_code', 'NY')
    .eq('verification_status', 'verified')
  
  if (nyError) {
    console.log(`   ERROR: ${nyError.message}`)
  } else {
    console.log(`   Found ${nyFacts?.length || 0} verified facts for NY`)
    if (nyFacts && nyFacts.length > 0) {
      console.log(`   First fact: ${nyFacts[0].claim.substring(0, 100)}...`)
    }
  }
  console.log('')

  // Test 2: Verify a claim using the RPC function
  console.log('TEST 2: Verify a claim using database function')
  const { data: verification, error: verifyError } = await supabase.rpc('verify_claim', {
    input_claim: 'In New York, BitLicense required for cryptocurrency and digital asset businesses.',
    input_state_code: 'NY'
  })

  if (verifyError) {
    console.log(`   RPC Error: ${verifyError.message}`)
  } else {
    // The function returns an array of rows (TABLE return type)
    // For a single-row result, it will be an array with one object
    const result = Array.isArray(verification) && verification.length > 0 ? verification[0] : verification
    
    console.log(`   Is verified: ${result?.is_verified || false}`)
    console.log(`   Confidence score: ${result?.confidence_score || 0}`)
    console.log(`   Matching facts count: ${result?.matching_facts?.length || 0}`)
    
    if (result?.matching_facts && result.matching_facts.length > 0) {
      console.log(`   Top match: ${result.matching_facts[0].claim.substring(0, 80)}...`)
    }
  }
  console.log('')

  // Test 3: Check total facts in database
  console.log('TEST 3: Total facts in database')
  const { count, error: countError } = await supabase
    .from('regulatory_facts')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'verified')

  if (countError) {
    console.log(`   ERROR: ${countError.message}`)
  } else {
    console.log(`   Total verified facts: ${count || 0}`)
  }

  console.log('')
  console.log('Phase 1 test complete!')
}

testPhase1().catch(console.error)
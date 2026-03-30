// src/scripts/check-coverage.ts
// Simple script to check data coverage (no embeddings)

import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env.local') })

// Dynamically import to avoid module resolution issues
async function checkCoverage() {
  console.log('========================================')
  console.log('PHASE 2: Data Coverage Check')
  console.log('========================================\n')
  
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌')
    console.error('\n   Make sure your .env.local file has these values.')
    process.exit(1)
  }
  
  console.log('✅ Environment variables found')
  console.log(`   Supabase URL: ${supabaseUrl.substring(0, 30)}...`)
  
  // Import Supabase dynamically
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Get all facts
  const { data: facts, error } = await supabase
    .from('regulatory_facts')
    .select('state_code')
    .eq('verification_status', 'verified')
  
  if (error) {
    console.error('❌ Database error:', error.message)
    process.exit(1)
  }
  
  if (!facts || facts.length === 0) {
    console.log('\n⚠️  No facts found in database!')
    console.log('   Run: npm run seed:regulatory')
    process.exit(0)
  }
  
  // Count by state
  const coverage: Record<string, number> = {}
  for (const fact of facts) {
    coverage[fact.state_code] = (coverage[fact.state_code] || 0) + 1
  }
  
  console.log('\nSTATE DATA COVERAGE:')
  console.log('====================')
  
  let ready = 0
  let partial = 0
  
  for (const [state, count] of Object.entries(coverage).sort()) {
    const sufficient = count >= 3
    const status = sufficient ? 'READY' : 'PARTIAL'
    const icon = sufficient ? '✅' : '⚠️'
    
    if (sufficient) ready++
    else partial++
    
    console.log(`${icon} ${state}: ${count} facts - ${status}`)
  }
  
  console.log('\n========================================')
  console.log(`SUMMARY: ${ready} states READY, ${partial} states PARTIAL`)
  console.log('========================================')
  
  if (ready >= 10) {
    console.log('\n✅ You have sufficient data to generate reports!')
    console.log('   Phase 2 is complete.')
  } else {
    console.log('\n⚠️  Add more facts to reach 3+ per state for best results.')
  }
}

checkCoverage().catch(console.error)
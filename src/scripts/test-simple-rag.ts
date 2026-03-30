// src/scripts/test-simple-rag.ts
// Test Phase 2 simple RAG (no embeddings)

import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env.local') })

async function testSimpleRAG() {
  console.log('========================================')
  console.log('TESTING PHASE 2: Simple RAG (No Embeddings)')
  console.log('========================================\n')
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
    console.error('\n   Make sure your .env.local has SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  
  console.log('✅ Environment variables found')
  console.log(`   Using service role key (bypasses RLS)\n`)
  
  // Import Supabase
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // First, verify we can read the data directly
  console.log('🔍 Verifying database access...')
  const { data: allFacts, error: accessError } = await supabase
    .from('regulatory_facts')
    .select('state_code, claim', { count: 'exact' })
    .eq('verification_status', 'verified')
  
  if (accessError) {
    console.error('❌ Cannot access regulatory_facts table:', accessError.message)
    process.exit(1)
  }
  
  console.log(`✅ Successfully accessed database. Found ${allFacts?.length || 0} total facts.\n`)
  
  // Now import the RAG functions
  const { searchRelevantFacts, buildPromptFromFacts, hasSufficientData } = await import('../lib/regulatory/simpleRag.js')
  
  const testCases = [
    { query: 'How long does it take to get a BitLicense?', state: 'NY', stateName: 'New York' },
    { query: 'What are the money transmitter requirements?', state: 'CA', stateName: 'California' },
    { query: 'Do I need to pay state income tax on crypto?', state: 'TX', stateName: 'Texas' },
    { query: 'What crypto laws exist in Wyoming?', state: 'WY', stateName: 'Wyoming' }
  ]
  
  for (const { query, state, stateName } of testCases) {
    console.log(`\n📋 Query: "${query}"`)
    console.log(`📍 State: ${state} (${stateName})`)
    console.log('-'.repeat(60))
    
    // Direct check first
    const { count: directCount } = await supabase
      .from('regulatory_facts')
      .select('*', { count: 'exact', head: true })
      .eq('state_code', state)
      .eq('verification_status', 'verified')
    
    console.log(`Direct DB check: ${directCount || 0} facts found for ${state}`)
    
    // Check via the function
    const sufficient = await hasSufficientData(state, 3)
    console.log(`hasSufficientData(): ${sufficient ? '✅ YES' : '❌ NO'}`)
    
    // Search for relevant facts
    const results = await searchRelevantFacts(query, state, 5)
    
    console.log(`Found ${results.length} relevant facts\n`)
    
    if (results.length > 0) {
      for (let i = 0; i < Math.min(results.length, 3); i++) {
        const result = results[i]
        const relevanceLabel = result.relevanceScore > 30 ? 'HIGH' : result.relevanceScore > 10 ? 'MEDIUM' : 'LOW'
        const matchIcon = result.matchReason === 'exact' ? '🎯' : result.matchReason === 'category' ? '📁' : '🔍'
        
        console.log(`  ${matchIcon} [${relevanceLabel}] (${result.relevanceScore} pts)`)
        console.log(`     ${result.fact.claim.substring(0, 120)}...`)
        console.log(`     Source: ${result.fact.source_name} (${result.fact.source_date})`)
        console.log('')
      }
    } else {
      console.log('  No relevant facts found for this query')
      
      // Debug: Show all facts for this state
      const { data: stateFacts } = await supabase
        .from('regulatory_facts')
        .select('claim, category')
        .eq('state_code', state)
        .eq('verification_status', 'verified')
      
      if (stateFacts && stateFacts.length > 0) {
        console.log(`\n  All facts for ${state} (${stateFacts.length} total):`)
        for (const fact of stateFacts) {
          console.log(`    - [${fact.category}] ${fact.claim.substring(0, 80)}...`)
        }
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 ALL STATES COVERAGE SUMMARY')
  console.log('='.repeat(60))
  
  const { data: summary } = await supabase
    .from('regulatory_facts')
    .select('state_code, category')
    .eq('verification_status', 'verified')
  
  if (summary) {
    const stateCounts: Record<string, number> = {}
    const stateCategories: Record<string, Set<string>> = {}
    
    for (const fact of summary) {
      stateCounts[fact.state_code] = (stateCounts[fact.state_code] || 0) + 1
      if (!stateCategories[fact.state_code]) {
        stateCategories[fact.state_code] = new Set()
      }
      stateCategories[fact.state_code].add(fact.category)
    }
    
    console.log('\nState | Facts | Categories | Status')
    console.log('-'.repeat(50))
    
    for (const [state, count] of Object.entries(stateCounts).sort()) {
      const categories = stateCategories[state]?.size || 0
      const status = count >= 3 ? '✅ READY' : count >= 1 ? '⚠️ PARTIAL' : '❌ INSUFFICIENT'
      console.log(`${state.padEnd(5)} | ${String(count).padEnd(5)} | ${String(categories).padEnd(10)} | ${status}`)
    }
  }
  
  console.log('\n✨ Phase 2 test complete!')
}

testSimpleRAG().catch(console.error)
// src/scripts/check-data-coverage.ts
// Check which states have sufficient data for report generation

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCoverage() {
  console.log('DATA COVERAGE REPORT')
  console.log('====================')
  console.log('')

  const { data: facts, error } = await supabase
    .from('regulatory_facts')
    .select('state_code, category')
    .eq('verification_status', 'verified')

  if (error) {
    console.error('Error:', error.message)
    return
  }

  const stateCounts: Record<string, number> = {}
  const stateCategories: Record<string, Set<string>> = {}

  for (const fact of facts) {
    stateCounts[fact.state_code] = (stateCounts[fact.state_code] || 0) + 1
    if (!stateCategories[fact.state_code]) {
      stateCategories[fact.state_code] = new Set()
    }
    stateCategories[fact.state_code].add(fact.category)
  }

  const allStates = [...new Set(facts.map(f => f.state_code))].sort()

  console.log('STATE COVERAGE SUMMARY:')
  console.log('-----------------------')
  console.log('')
  console.log('State | Facts | Categories | Status')
  console.log('------|-------|------------|-------')

  for (const state of allStates) {
    const count = stateCounts[state] || 0
    const categories = stateCategories[state]?.size || 0
    const status = count >= 3 ? 'READY' : count >= 1 ? 'PARTIAL' : 'INSUFFICIENT'
    const statusIcon = count >= 3 ? '✅' : count >= 1 ? '⚠️' : '❌'
    
    console.log(`${statusIcon} ${state.padEnd(4)} | ${String(count).padEnd(5)} | ${String(categories).padEnd(10)} | ${status}`)
  }

  console.log('')
  console.log('SUMMARY:')
  console.log(`Total states with data: ${allStates.length}`)
  console.log(`States READY for reports (>=3 facts): ${allStates.filter(s => stateCounts[s] >= 3).length}`)
  console.log(`States PARTIAL (1-2 facts): ${allStates.filter(s => stateCounts[s] >= 1 && stateCounts[s] < 3).length}`)
  console.log(`States with NO data: 0 (all 50 states need to be added eventually)`)

  console.log('')
  console.log('NEXT STEPS:')
  console.log('1. Add more facts for PARTIAL states')
  console.log('2. Add facts for remaining 40 states')
  console.log('3. Monitor hallucination rate dashboard')
}

checkCoverage()
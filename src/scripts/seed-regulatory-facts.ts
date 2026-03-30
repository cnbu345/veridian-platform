// src/scripts/seed-regulatory-facts.ts
// Phase 1: Seed initial verified facts from STATE_REGULATIONS

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/supabase.js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get the current file's directory (for ES modules)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local from project root
dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing environment variables. Check your .env.local file')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('Using Supabase URL:', supabaseUrl.substring(0, 30) + '...')
console.log('Service key present:', !!supabaseServiceKey)

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Source data - extracted from your STATE_REGULATIONS constant
const STATE_REGULATIONS_DATA: Record<string, any> = {
  'NY': {
    name: 'New York',
    cryptoFriendly: 'strict',
    moneyTransmitter: 'BitLicense required',
    taxTreatment: 'Income tax applies',
    notes: 'BitLicense required for crypto businesses. CRYPTO Act (2026) makes unlicensed virtual currency activity a criminal offense. Processing time 12-18 months.',
    lastUpdated: '2026-03-01',
    source: 'New York DFS',
    sourceUrl: 'https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses'
  },
  'CA': {
    name: 'California',
    cryptoFriendly: 'strict',
    moneyTransmitter: 'DFPI licensing required',
    taxTreatment: 'Income tax applies',
    notes: 'Digital Financial Assets Law (DFAL) becomes operative JULY 1, 2026. Companies must be licensed by DFPI to operate in CA.',
    lastUpdated: '2026-03-01',
    source: 'California DFPI',
    sourceUrl: 'https://dfpi.ca.gov/digital-financial-assets/'
  },
  'TX': {
    name: 'Texas',
    cryptoFriendly: 'friendly',
    moneyTransmitter: 'License required',
    taxTreatment: 'No state income tax',
    notes: 'Very crypto-friendly. Texas Department of Banking regulates money transmission.',
    lastUpdated: '2026-03-01',
    source: 'Texas Department of Banking',
    sourceUrl: 'https://www.dob.texas.gov/money-services-businesses'
  },
  'FL': {
    name: 'Florida',
    cryptoFriendly: 'friendly',
    moneyTransmitter: 'License required',
    taxTreatment: 'No state income tax',
    notes: 'CS/CS/SB 198 (2026) creates new regulatory framework for virtual currency kiosks.',
    lastUpdated: '2026-03-01',
    source: 'Florida Office of Financial Regulation',
    sourceUrl: 'https://www.flofr.gov/sitePages/Industry/moneytransmitter.htm'
  },
  'WY': {
    name: 'Wyoming',
    cryptoFriendly: 'friendly',
    moneyTransmitter: 'License required',
    taxTreatment: 'No state income tax',
    notes: 'Most crypto-friendly state. Comprehensive DAO and crypto laws. 50+ crypto-friendly laws.',
    lastUpdated: '2026-03-01',
    source: 'Wyoming Division of Banking',
    sourceUrl: 'https://wyomingbankingdivision.wyo.gov/'
  },
  'CO': {
    name: 'Colorado',
    cryptoFriendly: 'friendly',
    moneyTransmitter: 'License required',
    taxTreatment: 'Income tax applies',
    notes: 'Colorado Digital Token Act exempts certain crypto from securities laws. Accepts crypto for tax payments.',
    lastUpdated: '2026-03-01',
    source: 'Colorado Division of Banking',
    sourceUrl: 'https://coag.gov/'
  },
  'WA': {
    name: 'Washington',
    cryptoFriendly: 'strict',
    moneyTransmitter: 'License required',
    taxTreatment: 'Income tax applies',
    notes: 'Strict regulations. Money transmitter license required.',
    lastUpdated: '2026-03-01',
    source: 'Washington Department of Financial Institutions',
    sourceUrl: 'https://dfi.wa.gov/money-transmitter-licensing'
  },
  'IL': {
    name: 'Illinois',
    cryptoFriendly: 'moderate',
    moneyTransmitter: 'License required',
    taxTreatment: 'Income tax applies',
    notes: 'Digital Asset Regulatory Study completed 2025. Blockchain Task Force active.',
    lastUpdated: '2026-03-01',
    source: 'Illinois Department of Financial and Professional Regulation',
    sourceUrl: 'https://idfpr.illinois.gov/banking/money-transmitters.html'
  },
  'MA': {
    name: 'Massachusetts',
    cryptoFriendly: 'strict',
    moneyTransmitter: 'License required',
    taxTreatment: 'Income tax applies',
    notes: 'Strict securities laws apply to some tokens. Attorney General active in crypto enforcement.',
    lastUpdated: '2026-03-01',
    source: 'Massachusetts Division of Banks',
    sourceUrl: 'https://www.mass.gov/orgs/division-of-banks'
  },
  'NJ': {
    name: 'New Jersey',
    cryptoFriendly: 'strict',
    moneyTransmitter: 'License required',
    taxTreatment: 'Income tax applies',
    notes: 'Digital Asset and Blockchain Technology Act passed 2024, fully effective 2025.',
    lastUpdated: '2026-03-01',
    source: 'New Jersey Department of Banking and Insurance',
    sourceUrl: 'https://www.nj.gov/dobi/banklicensing/moneytransmitters.shtml'
  }
}

function getCryptoFriendlyRating(climate: string): string {
  switch (climate) {
    case 'friendly': return 'friendly'
    case 'moderate': return 'moderate'
    case 'strict': return 'strict'
    default: return 'moderate'
  }
}

function generateFactsForState(stateCode: string, data: any): Array<any> {
  const facts = []
  const today = new Date().toISOString().split('T')[0]

  facts.push({
    state_code: stateCode,
    claim: `In ${data.name}, ${data.moneyTransmitter} for cryptocurrency and digital asset businesses.`,
    category: 'license_requirement',
    source_name: data.source,
    source_url: data.sourceUrl,
    source_date: data.lastUpdated,
    verification_status: 'verified',
    notes: `Original source: ${data.notes.substring(0, 200)}`
  })

  facts.push({
    state_code: stateCode,
    claim: `${data.name} ${data.taxTreatment} for cryptocurrency transactions and digital asset income.`,
    category: 'tax_treatment',
    source_name: data.source,
    source_url: data.sourceUrl,
    source_date: data.lastUpdated,
    verification_status: 'verified',
    notes: `Tax status: ${data.taxTreatment}`
  })

  facts.push({
    state_code: stateCode,
    claim: `${data.name} has a ${getCryptoFriendlyRating(data.cryptoFriendly)} regulatory climate for digital asset businesses.`,
    category: 'license_requirement',
    source_name: data.source,
    source_url: data.sourceUrl,
    source_date: data.lastUpdated,
    verification_status: 'verified',
    notes: `Climate rating: ${data.cryptoFriendly}`
  })

  if (stateCode === 'NY') {
    facts.push({
      state_code: stateCode,
      claim: 'New York BitLicense processing time is 12-18 months for virtual currency businesses.',
      category: 'timeline',
      source_name: 'New York DFS',
      source_url: 'https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses',
      source_date: today,
      verification_status: 'verified',
      numeric_value: 12,
      numeric_unit: 'months'
    })
    
    facts.push({
      state_code: stateCode,
      claim: 'The New York CRYPTO Act (2026) makes unlicensed virtual currency activity a criminal offense.',
      category: 'pending_legislation',
      source_name: 'New York DFS',
      source_url: 'https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses',
      source_date: today,
      verification_status: 'verified'
    })
  }

  if (stateCode === 'CA') {
    facts.push({
      state_code: stateCode,
      claim: 'California Digital Financial Assets Law (DFAL) becomes operative July 1, 2026.',
      category: 'pending_legislation',
      source_name: 'California DFPI',
      source_url: 'https://dfpi.ca.gov/digital-financial-assets/',
      source_date: today,
      verification_status: 'verified',
      expires_at: '2026-07-01'
    })
  }

  if (stateCode === 'FL') {
    facts.push({
      state_code: stateCode,
      claim: 'Florida CS/CS/SB 198 (2026) creates regulatory framework for virtual currency kiosks with daily limits and consumer disclosures.',
      category: 'pending_legislation',
      source_name: 'Florida Office of Financial Regulation',
      source_url: 'https://www.flofr.gov/sitePages/Industry/moneytransmitter.htm',
      source_date: today,
      verification_status: 'verified'
    })
  }

  if (stateCode === 'WY') {
    facts.push({
      state_code: stateCode,
      claim: 'Wyoming has over 50 crypto-friendly laws including DAO LLC legislation and crypto banking charters.',
      category: 'license_requirement',
      source_name: 'Wyoming Division of Banking',
      source_url: 'https://wyomingbankingdivision.wyo.gov/',
      source_date: today,
      verification_status: 'verified'
    })
  }

  return facts
}

async function seedRegulatoryFacts() {
  console.log('SEEDING REGULATORY FACTS')
  console.log('============================')
  console.log('')

  let totalInserted = 0
  let totalSkipped = 0

  for (const [stateCode, data] of Object.entries(STATE_REGULATIONS_DATA)) {
    console.log(`Processing ${data.name} (${stateCode})...`)
    
    const { data: existingFacts, error: checkError } = await supabase
      .from('regulatory_facts')
      .select('id')
      .eq('state_code', stateCode)
      .limit(1)

    if (checkError) {
      console.error(`   ERROR checking existing facts: ${checkError.message}`)
      continue
    }

    if (existingFacts && existingFacts.length > 0) {
      console.log(`   SKIPPING - facts already exist for ${stateCode}`)
      totalSkipped++
      continue
    }

    const facts = generateFactsForState(stateCode, data)
    
    const { data: inserted, error: insertError } = await supabase
      .from('regulatory_facts')
      .insert(facts)
      .select()

    if (insertError) {
      console.error(`   INSERT FAILED: ${insertError.message}`)
    } else {
      console.log(`   SUCCESS: Inserted ${facts.length} facts for ${stateCode}`)
      totalInserted += facts.length
    }
  }

  console.log('')
  console.log('SEEDING SUMMARY')
  console.log('==================')
  console.log(`Total facts inserted: ${totalInserted}`)
  console.log(`States skipped (already have facts): ${totalSkipped}`)
  console.log(`Total states processed: ${Object.keys(STATE_REGULATIONS_DATA).length}`)

  console.log('')
  console.log('VERIFICATION')
  console.log('==================')
  const { data: allFacts, error: verifyError } = await supabase
    .from('regulatory_facts')
    .select('state_code')
    .eq('verification_status', 'verified')

  if (verifyError) {
    console.error(`Verification failed: ${verifyError.message}`)
  } else {
    console.log(`Total verified facts in database: ${allFacts?.length || 0}`)
    
    const stateCounts: Record<string, number> = {}
    allFacts?.forEach(fact => {
      stateCounts[fact.state_code] = (stateCounts[fact.state_code] || 0) + 1
    })
    
    console.log('')
    console.log('Facts by state:')
    for (const [state, count] of Object.entries(stateCounts).sort()) {
      console.log(`   ${state}: ${count} facts`)
    }
  }
}

seedRegulatoryFacts()
  .then(() => {
    console.log('')
    console.log('Seeding complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('')
    console.error('Seeding failed:', error)
    process.exit(1)
  })
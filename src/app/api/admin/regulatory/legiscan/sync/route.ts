// src/app/api/admin/regulatory/legiscan/sync/route.ts
// POST - Sync bills from LegiScan API with usage tracking and debugging

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUsageStats, recordSyncUsage } from '@/lib/regulatory/legiscan-usage'

// LegiScan API Configuration
const LEGISCAN_API_KEY = process.env.LEGISCAN_API_KEY
const LEGISCAN_API_URL = 'https://api.legiscan.com'
const MONTHLY_LIMIT = 30000

// States with their LegiScan IDs
const LEGISCAN_STATES = [
  { id: 1, code: 'AK', name: 'Alaska' }, { id: 2, code: 'AL', name: 'Alabama' },
  { id: 3, code: 'AR', name: 'Arkansas' }, { id: 4, code: 'AZ', name: 'Arizona' },
  { id: 5, code: 'CA', name: 'California' }, { id: 6, code: 'CO', name: 'Colorado' },
  { id: 7, code: 'CT', name: 'Connecticut' }, { id: 8, code: 'DE', name: 'Delaware' },
  { id: 9, code: 'FL', name: 'Florida' }, { id: 10, code: 'GA', name: 'Georgia' },
  { id: 11, code: 'HI', name: 'Hawaii' }, { id: 12, code: 'IA', name: 'Iowa' },
  { id: 13, code: 'ID', name: 'Idaho' }, { id: 14, code: 'IL', name: 'Illinois' },
  { id: 15, code: 'IN', name: 'Indiana' }, { id: 16, code: 'KS', name: 'Kansas' },
  { id: 17, code: 'KY', name: 'Kentucky' }, { id: 18, code: 'LA', name: 'Louisiana' },
  { id: 19, code: 'MA', name: 'Massachusetts' }, { id: 20, code: 'MD', name: 'Maryland' },
  { id: 21, code: 'ME', name: 'Maine' }, { id: 22, code: 'MI', name: 'Michigan' },
  { id: 23, code: 'MN', name: 'Minnesota' }, { id: 24, code: 'MO', name: 'Missouri' },
  { id: 25, code: 'MS', name: 'Mississippi' }, { id: 26, code: 'MT', name: 'Montana' },
  { id: 27, code: 'NC', name: 'North Carolina' }, { id: 28, code: 'ND', name: 'North Dakota' },
  { id: 29, code: 'NE', name: 'Nebraska' }, { id: 30, code: 'NH', name: 'New Hampshire' },
  { id: 31, code: 'NJ', name: 'New Jersey' }, { id: 32, code: 'NM', name: 'New Mexico' },
  { id: 33, code: 'NV', name: 'Nevada' }, { id: 34, code: 'NY', name: 'New York' },
  { id: 35, code: 'OH', name: 'Ohio' }, { id: 36, code: 'OK', name: 'Oklahoma' },
  { id: 37, code: 'OR', name: 'Oregon' }, { id: 38, code: 'PA', name: 'Pennsylvania' },
  { id: 39, code: 'RI', name: 'Rhode Island' }, { id: 40, code: 'SC', name: 'South Carolina' },
  { id: 41, code: 'SD', name: 'South Dakota' }, { id: 42, code: 'TN', name: 'Tennessee' },
  { id: 43, code: 'TX', name: 'Texas' }, { id: 44, code: 'UT', name: 'Utah' },
  { id: 45, code: 'VA', name: 'Virginia' }, { id: 46, code: 'VT', name: 'Vermont' },
  { id: 47, code: 'WA', name: 'Washington' }, { id: 48, code: 'WI', name: 'Wisconsin' },
  { id: 49, code: 'WV', name: 'West Virginia' }, { id: 50, code: 'WY', name: 'Wyoming' }
]

// Expanded keywords including "kiosk"
const CRYPTO_KEYWORDS = [
  'cryptocurrency',
  'digital asset',
  'virtual currency',
  'blockchain',
  'bitcoin',
  'crypto',
  'money transmitter',
  'bitlicense',
  'DAO',
  'kiosk',
  'stablecoin',
  'token',
  'web3'
]

// Map LegiScan status to our status
function mapLegiScanStatus(legiscanStatus: string): string {
  const status = legiscanStatus?.toLowerCase() || ''
  if (status.includes('enact')) return 'enacted'
  if (status.includes('pass')) return 'passed_house'
  if (status.includes('fail')) return 'failed'
  if (status.includes('veto')) return 'vetoed'
  if (status.includes('introduc')) return 'introduced'
  if (status.includes('committee')) return 'in_committee'
  return 'introduced'
}

// Convert LegiScan bill object (which may be an object with numeric keys) to array
function billsToArray(billsObj: any): any[] {
  if (!billsObj) return []
  if (Array.isArray(billsObj)) return billsObj
  
  // If it's an object with numeric keys (0, 1, 2...), convert to array
  const bills = []
  for (let i = 0; i < 1000; i++) {
    if (billsObj[i]) {
      bills.push(billsObj[i])
    } else {
      break
    }
  }
  return bills
}

// Fetch bills from LegiScan using getSearch with improved parsing
async function searchBills(stateId: number, keyword: string, year: number) {
  try {
    const url = `${LEGISCAN_API_URL}/?key=${LEGISCAN_API_KEY}&op=getSearch&state=${stateId}&query=${encodeURIComponent(keyword)}&year=${year}`
    console.log(`   📡 API: ${keyword} in ${stateId} (${url.substring(0, 120)}...)`)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log(`   📊 Response status: ${data.status}`)
    
    if (data.status !== 'OK') {
      console.log(`   ⚠️ API returned status: ${data.status}`)
      return []
    }
    
    const searchResult = data.searchresult
    if (!searchResult) {
      console.log(`   ⚠️ No searchresult in response`)
      return []
    }
    
    // Get bills - they might be in searchresult.bills or searchresult directly
    let bills = searchResult.bills || searchResult
    
    if (!bills) {
      console.log(`   ⚠️ No bills found in searchresult`)
      console.log(`   Keys: ${Object.keys(searchResult).join(', ')}`)
      return []
    }
    
    // Convert to array if needed
    bills = billsToArray(bills)
    
    console.log(`   ✅ Found ${bills.length} bills for "${keyword}"`)
    
    // Log first few bills
    if (bills.length > 0) {
      const sampleBills = bills.slice(0, 3)
      sampleBills.forEach((bill: any, idx: number) => {
        console.log(`      ${idx + 1}. ${bill.bill_number} - ${bill.title?.substring(0, 60)}...`)
      })
    }
    
    return bills
  } catch (error) {
    console.error(`   ❌ Error searching bills for state ${stateId}:`, error)
    return []
  }
}

// Fetch full bill details
async function getBillDetails(billId: number) {
  try {
    const url = `${LEGISCAN_API_URL}/?key=${LEGISCAN_API_KEY}&op=getBill&id=${billId}`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.bill) {
      return null
    }
    
    return data.bill
  } catch (error) {
    console.error(`   ❌ Error fetching bill ${billId}:`, error)
    return null
  }
}

export async function POST(request: NextRequest) {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 LEGISCAN SYNC STARTED')
  console.log('='.repeat(60) + '\n')
  
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('❌ Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!LEGISCAN_API_KEY) {
      console.log('❌ LegiScan API key not configured')
      return NextResponse.json({ error: 'LegiScan API key not configured' }, { status: 500 })
    }

    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('legislation_tracker')
      .select('id', { count: 'exact', head: true })
    
    console.log(`📊 Database connection: ${testError ? '❌ FAILED: ' + testError.message : '✅ OK'}`)
    console.log(`   Current bills in database: ${testData?.count || 0}\n`)

    // Check usage limit
    const usageStats = await getUsageStats()
    if (usageStats.isOverLimit) {
      console.log(`❌ Monthly API limit reached (${MONTHLY_LIMIT.toLocaleString()} queries)`)
      return NextResponse.json({ 
        error: `Monthly API limit reached`,
        limitReached: true,
        remainingQueries: 0
      }, { status: 429 })
    }

    const body = await request.json()
    const { year = new Date().getFullYear(), stateCode } = body

    let statesToSync = LEGISCAN_STATES
    if (stateCode) {
      statesToSync = LEGISCAN_STATES.filter(s => s.code === stateCode)
      console.log(`🎯 Target state: ${stateCode}`)
    } else {
      console.log(`🎯 Target: All 50 states`)
    }
    console.log(`📅 Year: ${year}\n`)

    let totalAdded = 0
    let totalUpdated = 0
    let totalSkipped = 0
    let totalQueries = 0
    let totalBillsFound = 0

    for (const state of statesToSync) {
      console.log(`\n📍 Processing ${state.name} (${state.code})...`)
      
      const allBills = new Map()
      
      // Search for each keyword
      for (const keyword of CRYPTO_KEYWORDS) {
        console.log(`\n   🔍 Searching for "${keyword}"...`)
        const bills = await searchBills(state.id, keyword, year)
        totalQueries++
        
        for (const bill of bills) {
          if (!allBills.has(bill.bill_id)) {
            totalBillsFound++
            // Get full bill details
            const billDetails = await getBillDetails(bill.bill_id)
            totalQueries++
            
            if (billDetails) {
              allBills.set(bill.bill_id, {
                ...bill,
                title: billDetails.title || bill.title,
                description: billDetails.description || '',
                status_date: billDetails.status_date
              })
            } else {
              allBills.set(bill.bill_id, bill)
            }
          }
        }
        
        // Rate limiting - 500ms between searches
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      console.log(`\n   📋 Total unique bills found in ${state.name}: ${allBills.size}`)

      let stateAdded = 0
      let stateUpdated = 0
      let stateSkipped = 0

      for (const bill of allBills.values()) {
        const status = mapLegiScanStatus(bill.status)
        const billUrl = `https://legiscan.com/${state.code}/bill/${bill.bill_number}/${year}`
        
        // Check if bill already exists
        const { data: existing } = await supabase
          .from('legislation_tracker')
          .select('id, status')
          .eq('state_code', state.code)
          .eq('bill_number', bill.bill_number)
          .maybeSingle()

        if (existing) {
          // Update if status changed
          if (existing.status !== status) {
            await supabase
              .from('legislation_tracker')
              .update({
                status: status,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id)
            stateUpdated++
            console.log(`      🔄 Updated: ${bill.bill_number} (${existing.status} → ${status})`)
          } else {
            stateSkipped++
          }
        } else {
          // Insert new bill
          const { error } = await supabase
            .from('legislation_tracker')
            .insert({
              state_code: state.code,
              bill_number: bill.bill_number,
              title: bill.title || bill.bill_number,
              description: bill.description || '',
              status: status,
              introduced_date: bill.status_date || new Date().toISOString(),
              bill_url: billUrl,
              legiscan_bill_id: bill.bill_id,
              created_by: user.id
            })

          if (!error) {
            stateAdded++
            console.log(`      ✅ Added: ${bill.bill_number} - ${bill.title?.substring(0, 50)}...`)
          } else {
            console.log(`      ❌ Error adding ${bill.bill_number}: ${error.message}`)
          }
        }
      }

      totalAdded += stateAdded
      totalUpdated += stateUpdated
      totalSkipped += stateSkipped
      
      console.log(`\n   📊 ${state.name} summary: +${stateAdded} added, 🔄${stateUpdated} updated, ⏭️${stateSkipped} skipped`)
      
      // Rate limiting between states
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Record the usage
    await recordSyncUsage(totalQueries)

    // Get updated remaining count
    const updatedStats = await getUsageStats()

    // Log the sync
    await supabase.from('regulatory_audit_log').insert({
      table_name: 'legiscan_sync',
      record_id: 'sync',
      action: 'SYNC',
      new_data: { 
        added: totalAdded, 
        updated: totalUpdated, 
        skipped: totalSkipped,
        billsFound: totalBillsFound,
        queries: totalQueries,
        year,
        timestamp: new Date().toISOString() 
      },
      changed_by: user.id,
      changed_by_name: user.email,
      changed_at: new Date().toISOString()
    })

    console.log('\n' + '='.repeat(60))
    console.log('📊 SYNC SUMMARY')
    console.log('='.repeat(60))
    console.log(`   Bills found total: ${totalBillsFound}`)
    console.log(`   Added: ${totalAdded}`)
    console.log(`   Updated: ${totalUpdated}`)
    console.log(`   Skipped: ${totalSkipped}`)
    console.log(`   API Queries: ${totalQueries}`)
    console.log(`   Remaining: ${updatedStats.remaining.toLocaleString()}`)
    console.log('='.repeat(60) + '\n')

    return NextResponse.json({
      success: true,
      message: `Added ${totalAdded} new bills, updated ${totalUpdated} existing bills, skipped ${totalSkipped} unchanged. Found ${totalBillsFound} total bills. Used ${totalQueries} API queries.`,
      added: totalAdded,
      updated: totalUpdated,
      skipped: totalSkipped,
      billsFound: totalBillsFound,
      queries: totalQueries,
      remainingQueries: updatedStats.remaining
    })
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
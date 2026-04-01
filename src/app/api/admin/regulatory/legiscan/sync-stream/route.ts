// src/app/api/admin/regulatory/legiscan/sync-stream/route.ts
// Streaming API for LegiScan sync with real-time progress

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUsageStats, recordSyncUsage } from '@/lib/regulatory/legiscan-usage'

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

const CRYPTO_KEYWORDS = [
  'cryptocurrency', 'digital asset', 'virtual currency', 'blockchain',
  'bitcoin', 'crypto', 'money transmitter', 'bitlicense', 'DAO'
]

function mapLegiScanStatus(legiscanStatus: string): string {
  const status = legiscanStatus?.toLowerCase() || ''
  if (status.includes('enact')) return 'enacted'
  if (status.includes('pass')) return 'passed_house'
  if (status.includes('fail')) return 'failed'
  if (status.includes('veto')) return 'vetoed'
  return 'introduced'
}

async function searchBills(stateId: number, keyword: string, year: number) {
  const url = `${LEGISCAN_API_URL}/?key=${LEGISCAN_API_KEY}&op=getSearch&state=${stateId}&query=${encodeURIComponent(keyword)}&year=${year}`
  const response = await fetch(url)
  const data = await response.json()
  if (data.status !== 'OK') return []
  return data.searchresult?.bills || []
}

async function getBillDetails(billId: number) {
  const url = `${LEGISCAN_API_URL}/?key=${LEGISCAN_API_KEY}&op=getBill&id=${billId}`
  const response = await fetch(url)
  const data = await response.json()
  if (data.status !== 'OK' || !data.bill) return null
  return data.bill
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          send({ type: 'error', message: 'Unauthorized' })
          controller.close()
          return
        }

        if (!LEGISCAN_API_KEY) {
          send({ type: 'error', message: 'LegiScan API key not configured' })
          controller.close()
          return
        }

        const usageStats = await getUsageStats()
        if (usageStats.isOverLimit) {
          send({ type: 'error', message: `Monthly API limit reached (${MONTHLY_LIMIT.toLocaleString()} queries)` })
          controller.close()
          return
        }

        const body = await request.json()
        const { year = new Date().getFullYear() } = body

        let totalAdded = 0
        let totalUpdated = 0
        let totalSkipped = 0
        let totalQueries = 0
        let statesProcessed = 0
        let billsFound = 0

        for (const state of LEGISCAN_STATES) {
          const allBills = new Map()
          
          send({ 
            type: 'progress', 
            message: `🔍 Searching ${state.name} (${state.code})...`,
            currentState: state.code,
            statesProcessed,
            totalStates: LEGISCAN_STATES.length,
            billsFound,
            billsAdded: totalAdded,
            billsUpdated: totalUpdated
          })
          
          for (const keyword of CRYPTO_KEYWORDS) {
            send({ 
              type: 'progress', 
              message: `   🔎 Searching for "${keyword}" in ${state.name}...`,
              currentState: state.code,
              currentKeyword: keyword,
              statesProcessed,
              totalStates: LEGISCAN_STATES.length,
              billsFound,
              billsAdded: totalAdded,
              billsUpdated: totalUpdated
            })
            
            const bills = await searchBills(state.id, keyword, year)
            totalQueries++
            
            for (const bill of bills) {
              if (!allBills.has(bill.bill_id)) {
                billsFound++
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
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          send({ 
            type: 'progress', 
            message: `📋 Found ${allBills.size} bills in ${state.name}`,
            currentState: state.code,
            statesProcessed,
            totalStates: LEGISCAN_STATES.length,
            billsFound,
            billsAdded: totalAdded,
            billsUpdated: totalUpdated
          })

          for (const bill of allBills.values()) {
            const status = mapLegiScanStatus(bill.status)
            const billUrl = `https://legiscan.com/${state.code}/bill/${bill.bill_number}/${year}`
            
            const { data: existing } = await supabase
              .from('legislation_tracker')
              .select('id, status')
              .eq('state_code', state.code)
              .eq('bill_number', bill.bill_number)
              .maybeSingle()

            if (existing) {
              if (existing.status !== status) {
                await supabase
                  .from('legislation_tracker')
                  .update({ status, updated_at: new Date().toISOString() })
                  .eq('id', existing.id)
                totalUpdated++
                send({ 
                  type: 'progress', 
                  message: `   🔄 Updated ${state.code} ${bill.bill_number}: ${existing.status} → ${status}`,
                  currentState: state.code,
                  statesProcessed,
                  totalStates: LEGISCAN_STATES.length,
                  billsFound,
                  billsAdded: totalAdded,
                  billsUpdated: totalUpdated
                })
              } else {
                totalSkipped++
              }
            } else {
              await supabase
                .from('legislation_tracker')
                .insert({
                  state_code: state.code,
                  bill_number: bill.bill_number,
                  title: bill.title || bill.bill_number,
                  description: bill.description || '',
                  status,
                  introduced_date: bill.status_date || new Date().toISOString(),
                  bill_url: billUrl,
                  legiscan_bill_id: bill.bill_id,
                  created_by: user.id
                })
              totalAdded++
              send({ 
                type: 'progress', 
                message: `   ✅ Added ${state.code} ${bill.bill_number}: ${bill.title?.substring(0, 60)}...`,
                currentState: state.code,
                statesProcessed,
                totalStates: LEGISCAN_STATES.length,
                billsFound,
                billsAdded: totalAdded,
                billsUpdated: totalUpdated
              })
            }
          }
          
          statesProcessed++
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        await recordSyncUsage(totalQueries)
        const updatedStats = await getUsageStats()

        await supabase.from('regulatory_audit_log').insert({
          table_name: 'legiscan_sync',
          record_id: 'sync',
          action: 'SYNC',
          new_data: { added: totalAdded, updated: totalUpdated, skipped: totalSkipped, queries: totalQueries, year },
          changed_by: user.id,
          changed_by_name: user.email,
          changed_at: new Date().toISOString()
        })

        send({ 
          type: 'complete', 
          added: totalAdded, 
          updated: totalUpdated, 
          skipped: totalSkipped,
          queries: totalQueries,
          remainingQueries: updatedStats.remaining,
          message: `✅ Sync complete! Added ${totalAdded}, updated ${totalUpdated}, skipped ${totalSkipped}`
        })
        
        controller.close()
      } catch (error) {
        console.error('Stream error:', error)
        send({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' })
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
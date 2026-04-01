// src/lib/regulatory/legiscan-client.ts
// LegiScan API Client for legislation tracking

const LEGISCAN_API_KEY = process.env.LEGISCAN_API_KEY
const LEGISCAN_API_URL = 'https://api.legiscan.com'

export interface LegiScanBill {
  bill_id: number
  bill_number: string
  title: string
  description: string
  state: string
  state_id: number
  session: string
  status: string
  status_date: string
  url: string
  text_url: string
  sponsors: Array<{ name: string; party: string }>
  history: Array<{ date: string; action: string }>
}

export interface LegiScanSearchResult {
  status: string
  session: {
    session_id: number
    session_name: string
    year_start: number
    year_end: number
  }
  bills: Array<{
    bill_id: number
    bill_number: string
    title: string
    status: string
    status_date: string
  }>
}

/**
 * Get bill details by bill ID
 */
export async function getBill(billId: number): Promise<LegiScanBill | null> {
  try {
    const response = await fetch(
      `${LEGISCAN_API_URL}/?key=${LEGISCAN_API_KEY}&op=getBill&id=${billId}`
    )
    const data = await response.json()
    return data.bill || null
  } catch (error) {
    console.error('Error fetching bill:', error)
    return null
  }
}

/**
 * Search for bills by state and query
 */
export async function searchBills(
  state: string,
  query: string,
  year?: number
): Promise<LegiScanSearchResult | null> {
  try {
    const params = new URLSearchParams({
      key: LEGISCAN_API_KEY!,
      op: 'search',
      state: state,
      query: query
    })
    if (year) params.append('year', year.toString())

    const response = await fetch(`${LEGISCAN_API_URL}/?${params}`)
    const data = await response.json()
    return data.searchresult || null
  } catch (error) {
    console.error('Error searching bills:', error)
    return null
  }
}

/**
 * Get bills for a specific state (crypto-related keywords)
 */
export async function getCryptoBillsByState(
  state: string,
  year: number = 2026
): Promise<LegiScanSearchResult | null> {
  const keywords = [
    'cryptocurrency',
    'digital asset',
    'virtual currency',
    'blockchain',
    'bitcoin',
    'crypto',
    'money transmitter',
    'bitlicense',
    'DAO'
  ]
  
  const allResults: LegiScanBill[] = []
  
  for (const keyword of keywords) {
    const result = await searchBills(state, keyword, year)
    if (result?.bills) {
      allResults.push(...result.bills)
    }
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Deduplicate by bill_id
  const uniqueBills = Array.from(
    new Map(allResults.map(bill => [bill.bill_id, bill])).values()
  )
  
  return {
    status: 'ok',
    session: result?.session || { session_id: 0, session_name: '', year_start: year, year_end: year },
    bills: uniqueBills.slice(0, 50)
  }
}

/**
 * Get all 50 states
 */
export const LEGISCAN_STATES = [
  { id: 1, code: 'AK', name: 'Alaska' }, { id: 2, code: 'AL', name: 'Alabama' },
  { id: 3, code: 'AR', name: 'Arkansas' }, { id: 4, code: 'AZ', name: 'Arizona' },
  { id: 5, code: 'CA', name: 'California' }, { id: 6, code: 'CO', name: 'Colorado' },
  { id: 7, code: 'CT', name: 'Connecticut' }, { id: 8, code: 'DC', name: 'District of Columbia' },
  { id: 9, code: 'DE', name: 'Delaware' }, { id: 10, code: 'FL', name: 'Florida' },
  { id: 11, code: 'GA', name: 'Georgia' }, { id: 12, code: 'HI', name: 'Hawaii' },
  { id: 13, code: 'IA', name: 'Iowa' }, { id: 14, code: 'ID', name: 'Idaho' },
  { id: 15, code: 'IL', name: 'Illinois' }, { id: 16, code: 'IN', name: 'Indiana' },
  { id: 17, code: 'KS', name: 'Kansas' }, { id: 18, code: 'KY', name: 'Kentucky' },
  { id: 19, code: 'LA', name: 'Louisiana' }, { id: 20, code: 'MA', name: 'Massachusetts' },
  { id: 21, code: 'MD', name: 'Maryland' }, { id: 22, code: 'ME', name: 'Maine' },
  { id: 23, code: 'MI', name: 'Michigan' }, { id: 24, code: 'MN', name: 'Minnesota' },
  { id: 25, code: 'MO', name: 'Missouri' }, { id: 26, code: 'MS', name: 'Mississippi' },
  { id: 27, code: 'MT', name: 'Montana' }, { id: 28, code: 'NC', name: 'North Carolina' },
  { id: 29, code: 'ND', name: 'North Dakota' }, { id: 30, code: 'NE', name: 'Nebraska' },
  { id: 31, code: 'NH', name: 'New Hampshire' }, { id: 32, code: 'NJ', name: 'New Jersey' },
  { id: 33, code: 'NM', name: 'New Mexico' }, { id: 34, code: 'NV', name: 'Nevada' },
  { id: 35, code: 'NY', name: 'New York' }, { id: 36, code: 'OH', name: 'Ohio' },
  { id: 37, code: 'OK', name: 'Oklahoma' }, { id: 38, code: 'OR', name: 'Oregon' },
  { id: 39, code: 'PA', name: 'Pennsylvania' }, { id: 40, code: 'RI', name: 'Rhode Island' },
  { id: 41, code: 'SC', name: 'South Carolina' }, { id: 42, code: 'SD', name: 'South Dakota' },
  { id: 43, code: 'TN', name: 'Tennessee' }, { id: 44, code: 'TX', name: 'Texas' },
  { id: 45, code: 'UT', name: 'Utah' }, { id: 46, code: 'VA', name: 'Virginia' },
  { id: 47, code: 'VT', name: 'Vermont' }, { id: 48, code: 'WA', name: 'Washington' },
  { id: 49, code: 'WI', name: 'Wisconsin' }, { id: 50, code: 'WV', name: 'West Virginia' },
  { id: 51, code: 'WY', name: 'Wyoming' }
]
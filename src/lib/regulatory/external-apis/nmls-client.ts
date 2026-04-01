// src/lib/regulatory/external-apis/nmls-client.ts
// NMLS API client for money transmitter licensing data

export interface NMLSLicenseData {
  state: string
  license_name: string
  license_type: string
  application_fee: number | null
  application_fee_unit: string
  annual_renewal_fee: number | null
  bond_requirement_min: number | null
  bond_requirement_max: number | null
  net_worth_requirement: number | null
  processing_time_min_months: number | null
  processing_time_max_months: number | null
  source_url: string
  last_updated: string
}

export async function fetchNMLSLicenseData(stateCode: string): Promise<NMLSLicenseData | null> {
  try {
    // TODO: Replace with actual NMLS API endpoint after obtaining credentials
    const response = await fetch(
      `https://api.nmls.org/v1/money-transmitter-license/${stateCode}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NMLS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`NMLS API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching NMLS data for ${stateCode}:`, error)
    return null
  }
}

export async function fetchAllNMLSData(): Promise<Map<string, NMLSLicenseData>> {
  const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'WA', 'MA', 'NJ', 'CO', 'AZ', 'NV', 'UT', 'NH', 'WY']
  const results = new Map()
  
  for (const state of states) {
    const data = await fetchNMLSLicenseData(state)
    if (data) {
      results.set(state, data)
    }
    // Rate limiting: 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}
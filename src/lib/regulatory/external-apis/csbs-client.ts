// src/lib/regulatory/external-apis/csbs-client.ts
// CSBS API client for regulatory actions and aggregated data

export interface CSBSRegulatoryAction {
  type: 'Enforcement Action' | 'Cease and Desist' | 'License Revocation' | 'Settlement' | 'Fine'
  date: string
  entity: string
  description: string
  penalty: number | null
  source_url: string
}

export interface CSBSStateData {
  state: string
  actions: CSBSRegulatoryAction[]
  last_updated: string
}

export async function fetchCSBSRegulatoryActions(stateCode: string): Promise<CSBSStateData | null> {
  try {
    // TODO: Replace with actual CSBS API endpoint after obtaining credentials
    const response = await fetch(
      `https://api.csbs.org/v1/regulatory-actions/${stateCode}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CSBS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`CSBS API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching CSBS data for ${stateCode}:`, error)
    return null
  }
}
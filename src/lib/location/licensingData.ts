// src/lib/location/licensingData.ts - Comprehensive licensing data for all states

export interface LicenseInfo {
  state: string
  licenseType: string
  timeline: string
  fees: string
  bonding: string
  renewal: string
  notes?: string
  required: boolean
}

export const LICENSING_DATA: LicenseInfo[] = [
  // Texas
  {
    state: 'TX',
    licenseType: 'Money Services Business',
    timeline: '3-4 months',
    fees: '$500',
    bonding: '$50,000',
    renewal: 'Annual (by December 31)',
    required: true
  },
  {
    state: 'TX',
    licenseType: 'Foreign Exchange Dealer',
    timeline: '3-4 months',
    fees: '$1,000',
    bonding: '$100,000',
    renewal: 'Annual',
    required: false
  },
  
  // New York
  {
    state: 'NY',
    licenseType: 'BitLicense',
    timeline: '6-12 months',
    fees: '$5,000',
    bonding: '$250,000',
    renewal: 'Biennial (every 2 years)',
    required: true
  },
  {
    state: 'NY',
    licenseType: 'Money Transmitter License',
    timeline: '6-9 months',
    fees: '$3,000',
    bonding: '$500,000',
    renewal: 'Annual',
    required: true
  },
  
  // California
  {
    state: 'CA',
    licenseType: 'Money Transmitter License',
    timeline: '4-8 months',
    fees: '$1,000 application + $5,000 license',
    bonding: '$250,000 - $500,000',
    renewal: 'Annual (by March 31)',
    required: true
  },
  {
    state: 'CA',
    licenseType: 'DFPI License',
    timeline: '4-8 months',
    fees: '$1,000',
    bonding: '$100,000',
    renewal: 'Annual',
    required: false
  },
  
  // Florida
  {
    state: 'FL',
    licenseType: 'Money Transmitter License',
    timeline: '3-6 months',
    fees: '$1,000',
    bonding: '$75,000 - $300,000',
    renewal: 'Biennial (every 2 years)',
    required: true
  },
  
  // Illinois
  {
    state: 'IL',
    licenseType: 'Money Transmitter License',
    timeline: '4-6 months',
    fees: '$2,000',
    bonding: '$250,000 - $500,000',
    renewal: 'Annual (by June 30)',
    required: true
  },
  
  // Colorado
  {
    state: 'CO',
    licenseType: 'Money Transmitter License',
    timeline: '3-5 months',
    fees: '$500',
    bonding: '$50,000 - $250,000',
    renewal: 'Annual',
    required: true
  },
  
  // Washington
  {
    state: 'WA',
    licenseType: 'Money Transmitter License',
    timeline: '4-7 months',
    fees: '$1,000',
    bonding: '$100,000 - $300,000',
    renewal: 'Annual',
    required: true
  },
  
  // Arizona
  {
    state: 'AZ',
    licenseType: 'Money Transmitter License',
    timeline: '3-5 months',
    fees: '$500',
    bonding: '$50,000',
    renewal: 'Annual',
    required: true
  },
  
  // Nevada
  {
    state: 'NV',
    licenseType: 'Money Transmitter License',
    timeline: '3-5 months',
    fees: '$1,000',
    bonding: '$100,000',
    renewal: 'Annual',
    required: true
  },
  
  // Pennsylvania
  {
    state: 'PA',
    licenseType: 'Money Transmitter License',
    timeline: '4-6 months',
    fees: '$1,500',
    bonding: '$250,000',
    renewal: 'Annual',
    required: true
  },
  
  // New Jersey
  {
    state: 'NJ',
    licenseType: 'Money Transmitter License',
    timeline: '4-6 months',
    fees: '$1,500',
    bonding: '$250,000',
    renewal: 'Annual',
    required: true
  },
  
  // Massachusetts
  {
    state: 'MA',
    licenseType: 'Money Transmitter License',
    timeline: '4-7 months',
    fees: '$1,000',
    bonding: '$250,000',
    renewal: 'Annual',
    required: true
  },
  
  // Virginia
  {
    state: 'VA',
    licenseType: 'Money Transmitter License',
    timeline: '3-5 months',
    fees: '$500',
    bonding: '$50,000',
    renewal: 'Annual',
    required: true
  },
  
  // Georgia
  {
    state: 'GA',
    licenseType: 'Money Transmitter License',
    timeline: '3-5 months',
    fees: '$1,000',
    bonding: '$100,000',
    renewal: 'Annual',
    required: true
  },
  
  // North Carolina
  {
    state: 'NC',
    licenseType: 'Money Transmitter License',
    timeline: '3-5 months',
    fees: '$1,000',
    bonding: '$150,000',
    renewal: 'Annual',
    required: true
  },
  
  // Michigan
  {
    state: 'MI',
    licenseType: 'Money Transmitter License',
    timeline: '4-6 months',
    fees: '$1,000',
    bonding: '$250,000',
    renewal: 'Annual',
    required: true
  },
  
  // Ohio
  {
    state: 'OH',
    licenseType: 'Money Transmitter License',
    timeline: '3-5 months',
    fees: '$1,000',
    bonding: '$100,000',
    renewal: 'Annual',
    required: true
  },
  
  // Tennessee
  {
    state: 'TN',
    licenseType: 'Money Transmitter License',
    timeline: '3-5 months',
    fees: '$750',
    bonding: '$100,000',
    renewal: 'Annual',
    required: true
  },
  
  // Wyoming
  {
    state: 'WY',
    licenseType: 'Money Transmitter License',
    timeline: '2-4 months',
    fees: '$500',
    bonding: '$50,000',
    renewal: 'Annual',
    required: false
  },
  {
    state: 'WY',
    licenseType: 'SPDI Bank Charter',
    timeline: '6-12 months',
    fees: '$10,000',
    bonding: '$3,000,000',
    renewal: 'Annual',
    required: false
  },
  
  // South Dakota
  {
    state: 'SD',
    licenseType: 'Money Transmitter License',
    timeline: '2-4 months',
    fees: '$500',
    bonding: '$50,000',
    renewal: 'Annual',
    required: false
  },
]

// Get licenses for a specific state
export function getLicensesForState(state: string, requiredOnly: boolean = true): LicenseInfo[] {
  const stateLicenses = LICENSING_DATA.filter(l => l.state === state)
  
  if (requiredOnly) {
    return stateLicenses.filter(l => l.required)
  }
  
  return stateLicenses
}

// Get all states with license requirements
export function getAllStateLicenses(limit?: number): LicenseInfo[] {
  const allLicenses = LICENSING_DATA.filter(l => l.required)
  
  // Deduplicate by state (keep first license per state)
  const stateMap = new Map<string, LicenseInfo>()
  allLicenses.forEach(license => {
    if (!stateMap.has(license.state)) {
      stateMap.set(license.state, license)
    }
  })
  
  const uniqueLicenses = Array.from(stateMap.values())
  
  if (limit) {
    return uniqueLicenses.slice(0, limit)
  }
  
  return uniqueLicenses
}
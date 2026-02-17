// src/lib/locationService.ts
// Major US cities (top 50) - for market classification
const MAJOR_CITIES = [
  { city: 'New York', state: 'NY', population: 8419000 },
  { city: 'Los Angeles', state: 'CA', population: 3929000 },
  { city: 'Chicago', state: 'IL', population: 2716000 },
  { city: 'Houston', state: 'TX', population: 2303000 },
  { city: 'Phoenix', state: 'AZ', population: 1608000 },
  { city: 'Philadelphia', state: 'PA', population: 1584000 },
  { city: 'San Antonio', state: 'TX', population: 1547000 },
  { city: 'San Diego', state: 'CA', population: 1387000 },
  { city: 'Dallas', state: 'TX', population: 1344000 },
  { city: 'Austin', state: 'TX', population: 974000 },
  { city: 'San Jose', state: 'CA', population: 971000 },
  { city: 'Fort Worth', state: 'TX', population: 958000 },
  { city: 'Jacksonville', state: 'FL', population: 954000 },
  { city: 'Charlotte', state: 'NC', population: 910000 },
  { city: 'Columbus', state: 'OH', population: 907000 },
  { city: 'Indianapolis', state: 'IN', population: 876000 },
  { city: 'San Francisco', state: 'CA', population: 815000 },
  { city: 'Seattle', state: 'WA', population: 794000 },
  { city: 'Denver', state: 'CO', population: 734000 },
  { city: 'Washington', state: 'DC', population: 712000 },
  { city: 'Boston', state: 'MA', population: 692000 },
  { city: 'El Paso', state: 'TX', population: 679000 },
  { city: 'Nashville', state: 'TN', population: 678000 },
  { city: 'Detroit', state: 'MI', population: 631000 },
  { city: 'Oklahoma City', state: 'OK', population: 687000 },
  { city: 'Portland', state: 'OR', population: 652000 },
  { city: 'Las Vegas', state: 'NV', population: 656000 },
  { city: 'Memphis', state: 'TN', population: 630000 },
  { city: 'Louisville', state: 'KY', population: 628000 },
  { city: 'Baltimore', state: 'MD', population: 576000 },
  { city: 'Milwaukee', state: 'WI', population: 563000 },
  { city: 'Albuquerque', state: 'NM', population: 562000 },
  { city: 'Tucson', state: 'AZ', population: 548000 },
  { city: 'Fresno', state: 'CA', population: 545000 },
  { city: 'Mesa', state: 'AZ', population: 517000 },
  { city: 'Sacramento', state: 'CA', population: 525000 },
  { city: 'Atlanta', state: 'GA', population: 498000 },
  { city: 'Kansas City', state: 'MO', population: 508000 },
  { city: 'Colorado Springs', state: 'CO', population: 483000 },
  { city: 'Raleigh', state: 'NC', population: 476000 },
  { city: 'Miami', state: 'FL', population: 442000 },
  { city: 'Virginia Beach', state: 'VA', population: 455000 },
  { city: 'Omaha', state: 'NE', population: 485000 },
  { city: 'Oakland', state: 'CA', population: 425000 },
  { city: 'Minneapolis', state: 'MN', population: 429000 },
  { city: 'Tulsa', state: 'OK', population: 413000 },
  { city: 'Arlington', state: 'TX', population: 394000 },
  { city: 'New Orleans', state: 'LA', population: 369000 },
  { city: 'Wichita', state: 'KS', population: 397000 },
  { city: 'Cleveland', state: 'OH', population: 367000 },
]

// Major compliance/regulatory hubs (where specialized counsel exists)
const REGULATORY_HUBS = [
  { city: 'New York', state: 'NY', type: 'primary', specialty: 'BitLicense, Banking' },
  { city: 'San Francisco', state: 'CA', type: 'primary', specialty: 'FinTech, DFPI' },
  { city: 'Washington', state: 'DC', type: 'primary', specialty: 'Federal, SEC' },
  { city: 'Chicago', state: 'IL', type: 'secondary', specialty: 'Commodities, Futures' },
  { city: 'Boston', state: 'MA', type: 'secondary', specialty: 'Securities' },
  { city: 'Austin', state: 'TX', type: 'secondary', specialty: 'Money Transmission' },
  { city: 'Miami', state: 'FL', type: 'secondary', specialty: 'International' },
  { city: 'Denver', state: 'CO', type: 'secondary', specialty: 'Digital Assets' },
  { city: 'Seattle', state: 'WA', type: 'secondary', specialty: 'Tech Regulation' },
  { city: 'Wilmington', state: 'DE', type: 'primary', specialty: 'Corporate, Banking' },
  { city: 'Cheyenne', state: 'WY', type: 'secondary', specialty: 'DAO, Crypto' },
]

// State regulatory climate data
export const STATE_REGULATORY_CLIMATE = {
  'NY': { climate: 'strict', license: 'BitLicense', tax: 'income' },
  'CA': { climate: 'strict', license: 'DFPI', tax: 'income' },
  'TX': { climate: 'friendly', license: 'none', tax: 'none' },
  'FL': { climate: 'friendly', license: 'none', tax: 'none' },
  'WY': { climate: 'friendly', license: 'none', tax: 'none', special: 'DAO LLC' },
  'NV': { climate: 'friendly', license: 'none', tax: 'none' },
  'DE': { climate: 'friendly', license: 'none', tax: 'corporate' },
  'IL': { climate: 'moderate', license: 'required', tax: 'income' },
  'MA': { climate: 'moderate', license: 'required', tax: 'income' },
  'WA': { climate: 'strict', license: 'required', tax: 'income' },
  'CO': { climate: 'friendly', license: 'none', tax: 'income' },
  'AZ': { climate: 'friendly', license: 'none', tax: 'income' },
  'NC': { climate: 'moderate', license: 'required', tax: 'income' },
  'GA': { climate: 'moderate', license: 'none', tax: 'income' },
  'PA': { climate: 'moderate', license: 'none', tax: 'income' },
  'OH': { climate: 'friendly', license: 'none', tax: 'income' },
  'MI': { climate: 'moderate', license: 'none', tax: 'income' },
  'VA': { climate: 'friendly', license: 'none', tax: 'income' },
  'TN': { climate: 'friendly', license: 'none', tax: 'none' },
  'NH': { climate: 'friendly', license: 'none', tax: 'none' },
}

export interface LocationData {
  city: string
  state: string
  tier: 'major' | 'suburban' | 'rural'
  nearestMajorCity?: string
  nearestRegulatoryHub?: string
  regulatoryHubType?: 'primary' | 'secondary'
  regulatoryHubSpecialty?: string
  distanceToMajor?: number
  regulatoryClimate?: 'friendly' | 'moderate' | 'strict'
  licenseRequired?: string
  taxStatus?: 'income' | 'none' | 'corporate'
}

export async function classifyLocation(city: string, state: string): Promise<LocationData> {
  const normalizedCity = city.trim().toLowerCase()
  const normalizedState = state.trim().toUpperCase()

  // Get regulatory data for the state
  const regulatoryData = STATE_REGULATORY_CLIMATE[normalizedState as keyof typeof STATE_REGULATORY_CLIMATE] || {
    climate: 'moderate',
    license: 'unknown',
    tax: 'income'
  }

  // Check if it's a major city
  const isMajor = MAJOR_CITIES.some(
    mc => mc.city.toLowerCase() === normalizedCity && mc.state === normalizedState
  )

  if (isMajor) {
    // Find if it's a regulatory hub
    const regulatoryHub = REGULATORY_HUBS.find(
      hub => hub.city.toLowerCase() === normalizedCity && hub.state === normalizedState
    )
    
    return {
      city,
      state,
      tier: 'major',
      nearestRegulatoryHub: regulatoryHub ? regulatoryHub.city : city,
      regulatoryHubType: regulatoryHub?.type || undefined,
      regulatoryHubSpecialty: regulatoryHub?.specialty,
      regulatoryClimate: regulatoryData.climate,
      licenseRequired: regulatoryData.license,
      taxStatus: regulatoryData.tax
    }
  }

  // Check for suburban (within 50 miles of major city)
  const isSuburban = MAJOR_CITIES.some(mc => 
    mc.state === normalizedState && 
    normalizedCity.includes(mc.city.toLowerCase().substring(0, 3))
  )

  if (isSuburban) {
    const majorInState = MAJOR_CITIES.find(mc => mc.state === normalizedState)
    const regulatoryHubInState = REGULATORY_HUBS.find(hub => hub.state === normalizedState)
    
    return {
      city,
      state,
      tier: 'suburban',
      nearestMajorCity: majorInState?.city,
      nearestRegulatoryHub: regulatoryHubInState?.city || majorInState?.city,
      regulatoryHubType: regulatoryHubInState?.type,
      regulatoryHubSpecialty: regulatoryHubInState?.specialty,
      distanceToMajor: 25,
      regulatoryClimate: regulatoryData.climate,
      licenseRequired: regulatoryData.license,
      taxStatus: regulatoryData.tax
    }
  }

  // Default to rural
  // Find nearest regulatory hub
  const nearestHub = REGULATORY_HUBS.reduce((nearest, current) => {
    if (current.state[0] === normalizedState[0]) return current
    return nearest
  }, REGULATORY_HUBS[0])

  const nearestMajor = MAJOR_CITIES.reduce((nearest, current) => {
    if (current.state[0] === normalizedState[0]) return current
    return nearest
  }, MAJOR_CITIES[0])

  return {
    city,
    state,
    tier: 'rural',
    nearestMajorCity: nearestMajor.city,
    nearestRegulatoryHub: nearestHub.city,
    regulatoryHubType: nearestHub.type,
    regulatoryHubSpecialty: nearestHub.specialty,
    distanceToMajor: 75,
    regulatoryClimate: regulatoryData.climate,
    licenseRequired: regulatoryData.license,
    taxStatus: regulatoryData.tax
  }
}
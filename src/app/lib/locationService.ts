// Major US cities (top 50)
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

// Major Web3 hubs
const WEB3_HUBS = [
  { city: 'San Francisco', state: 'CA', type: 'primary' },
  { city: 'New York', state: 'NY', type: 'primary' },
  { city: 'Austin', state: 'TX', type: 'primary' },
  { city: 'Miami', state: 'FL', type: 'primary' },
  { city: 'Denver', state: 'CO', type: 'secondary' },
  { city: 'Seattle', state: 'WA', type: 'secondary' },
  { city: 'Boston', state: 'MA', type: 'secondary' },
  { city: 'Los Angeles', state: 'CA', type: 'secondary' },
  { city: 'Chicago', state: 'IL', type: 'secondary' },
]

export interface LocationData {
  city: string
  state: string
  tier: 'major' | 'suburban' | 'rural'
  nearestMajorCity?: string
  nearestWeb3Hub?: string
  distanceToMajor?: number
  web3HubType?: 'primary' | 'secondary'
}

export async function classifyLocation(city: string, state: string): Promise<LocationData> {
  const normalizedCity = city.trim().toLowerCase()
  const normalizedState = state.trim().toUpperCase()

  // Check if it's a major city
  const isMajor = MAJOR_CITIES.some(
    mc => mc.city.toLowerCase() === normalizedCity && mc.state === normalizedState
  )

  if (isMajor) {
    // Find if it's a Web3 hub
    const web3Hub = WEB3_HUBS.find(
      hub => hub.city.toLowerCase() === normalizedCity && hub.state === normalizedState
    )
    
    return {
      city,
      state,
      tier: 'major',
      nearestWeb3Hub: web3Hub ? web3Hub.city : city,
      web3HubType: web3Hub?.type || undefined
    }
  }

  // Check for suburban (within 50 miles of major city)
  // For simplicity, we'll check if it's in a major state
  const isSuburban = MAJOR_CITIES.some(mc => 
    mc.state === normalizedState && 
    normalizedCity.includes(mc.city.toLowerCase().substring(0, 3))
  )

  if (isSuburban) {
    const majorInState = MAJOR_CITIES.find(mc => mc.state === normalizedState)
    const web3HubInState = WEB3_HUBS.find(hub => hub.state === normalizedState)
    
    return {
      city,
      state,
      tier: 'suburban',
      nearestMajorCity: majorInState?.city,
      nearestWeb3Hub: web3HubInState?.city || majorInState?.city,
      web3HubType: web3HubInState?.type,
      distanceToMajor: 25
    }
  }

  // Default to rural
  // Find nearest major city in any state
  const nearestMajor = MAJOR_CITIES.reduce((nearest, current) => {
    // Simple proximity based on alphabetical closeness (in reality use geocoding)
    if (current.state[0] === normalizedState[0]) return current
    return nearest
  }, MAJOR_CITIES[0])

  const nearestWeb3 = WEB3_HUBS.reduce((nearest, current) => {
    if (current.state[0] === normalizedState[0]) return current
    return nearest
  }, WEB3_HUBS[0])

  return {
    city,
    state,
    tier: 'rural',
    nearestMajorCity: nearestMajor.city,
    nearestWeb3Hub: nearestWeb3.city,
    web3HubType: nearestWeb3.type,
    distanceToMajor: 75
  }
}
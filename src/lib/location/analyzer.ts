// src/lib/location/analyzer.ts // Location analysis
import { MAJOR_CITIES, REGULATORY_HUBS, MSAS } from './cities'
import { getStateRegulation } from './regulations'

export interface LocationAnalysis {
  city: string
  state: string
  tier: 'major' | 'suburban' | 'rural'
  nearestMajorCity?: string
  nearestRegulatoryHub?: string
  regulatoryHubType?: 'primary' | 'secondary'
  regulatoryHubScore?: number
  distanceToMajor?: number
  msaName?: string
  msaPopulation?: number
  regulatoryClimate: 'friendly' | 'moderate' | 'strict' | 'unknown'
  licenseRequired: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies'
  talentDensity: 'high' | 'medium' | 'low'
  marketOpportunity: 'excellent' | 'good' | 'fair' | 'challenging'
}

export async function analyzeLocation(city: string, state: string): Promise<LocationAnalysis> {
  const normalizedCity = city.trim().toLowerCase()
  const normalizedState = state.trim().toUpperCase()
  
  console.log('🔍 Analyzing location:', { city, state, normalizedCity, normalizedState })

  // Check if it's a major city
  const majorCity = MAJOR_CITIES.find(
    mc => mc.city.toLowerCase() === normalizedCity && mc.state === normalizedState
  )

  console.log('📍 Major city found:', majorCity ? 'YES' : 'NO', majorCity)
  
  if (majorCity) {
    const regulatoryHub = REGULATORY_HUBS.find(
      hub => hub.city.toLowerCase() === normalizedCity && hub.state === normalizedState
    )
    
    const regulation = getStateRegulation(normalizedState)
    
    // Determine license type
    let licenseRequired: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies' = 'varies'
    if (regulation.moneyTransmitter.includes('BitLicense')) licenseRequired = 'bitlicense'
    else if (regulation.moneyTransmitter.includes('DFPI')) licenseRequired = 'dfpi'
    else if (regulation.moneyTransmitter.includes('required')) licenseRequired = 'mtl'
    else if (regulation.moneyTransmitter.includes('No specific')) licenseRequired = 'none'
    
    const result = {
      city,
      state,
      tier: 'major' as const,
      nearestRegulatoryHub: regulatoryHub?.city || majorCity.city,
      regulatoryHubType: regulatoryHub?.type,
      regulatoryHubScore: regulatoryHub?.score,
      regulatoryClimate: regulation.cryptoFriendly as any,
      licenseRequired,
      talentDensity: regulatoryHub ? ('high' as const) : ('medium' as const),
      marketOpportunity: regulatoryHub ? ('excellent' as const) : ('good' as const)
    }
    
    console.log('✅ Analysis result:', result)
    return result
  }
  
  // Check if it's in an MSA (suburban)
  const msa = MSAS.find(msa => 
    msa.states.includes(normalizedState) && 
    msa.name.toLowerCase().includes(normalizedCity)
  )
  
  if (msa) {
    const majorInState = MAJOR_CITIES.find(mc => mc.state === normalizedState)
    const regulatoryHubInState = REGULATORY_HUBS.find(hub => hub.state === normalizedState)
    const regulation = getStateRegulation(normalizedState)
    
    // Determine license type
    let licenseRequired: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies' = 'varies'
    if (regulation.moneyTransmitter.includes('BitLicense')) licenseRequired = 'bitlicense'
    else if (regulation.moneyTransmitter.includes('DFPI')) licenseRequired = 'dfpi'
    else if (regulation.moneyTransmitter.includes('required')) licenseRequired = 'mtl'
    else if (regulation.moneyTransmitter.includes('No specific')) licenseRequired = 'none'
    
    return {
      city,
      state,
      tier: 'suburban',
      nearestMajorCity: majorInState?.city,
      nearestRegulatoryHub: regulatoryHubInState?.city || majorInState?.city,
      regulatoryHubType: regulatoryHubInState?.type,
      regulatoryHubScore: regulatoryHubInState?.score,
      distanceToMajor: 25,
      msaName: msa.name,
      msaPopulation: msa.population,
      regulatoryClimate: regulation.cryptoFriendly as any,
      licenseRequired,
      talentDensity: regulatoryHubInState ? 'medium' : 'low',
      marketOpportunity: 'good'
    }
  }
  
  // Default to rural
  const nearestMajor = MAJOR_CITIES.reduce((nearest, current) => {
    if (current.state === normalizedState) return current
    if (!nearest) return current
    return nearest
  }, MAJOR_CITIES[0])
  
  const nearestRegulatory = REGULATORY_HUBS.reduce((nearest, current) => {
    if (current.state === normalizedState) return current
    if (!nearest) return current
    return nearest
  }, REGULATORY_HUBS[0])
  
  const regulation = getStateRegulation(normalizedState)
  
  // Determine license type
  let licenseRequired: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies' = 'varies'
  if (regulation.moneyTransmitter.includes('BitLicense')) licenseRequired = 'bitlicense'
  else if (regulation.moneyTransmitter.includes('DFPI')) licenseRequired = 'dfpi'
  else if (regulation.moneyTransmitter.includes('required')) licenseRequired = 'mtl'
  else if (regulation.moneyTransmitter.includes('No specific')) licenseRequired = 'none'
  
  return {
    city,
    state,
    tier: 'rural',
    nearestMajorCity: nearestMajor.city,
    nearestRegulatoryHub: nearestRegulatory.city,
    regulatoryHubType: nearestRegulatory.type,
    regulatoryHubScore: nearestRegulatory.score,
    distanceToMajor: 75,
    regulatoryClimate: regulation.cryptoFriendly as any,
    licenseRequired,
    talentDensity: 'low',
    marketOpportunity: 'fair'
  }
}

// Get regulatory compliance score
export function getComplianceScore(state: string, tier: string): number {
  const regulation = getStateRegulation(state)
  let score = 50
  
  // Regulatory factor - stricter = more compliance work needed = lower score
  if (regulation.cryptoFriendly === 'friendly') score += 20
  if (regulation.cryptoFriendly === 'moderate') score += 10
  if (regulation.cryptoFriendly === 'strict') score -= 20
  
  // Tier factor - major cities have more compliance resources
  if (tier === 'major') score += 15
  if (tier === 'suburban') score += 5
  if (tier === 'rural') score -= 10
  
  return Math.min(100, Math.max(0, score))
}

// Get market opportunity score
export function getMarketScore(state: string, tier: string): number {
  const regulation = getStateRegulation(state)
  let score = 50
  
  // Regulatory factor - friendly = more opportunity
  if (regulation.cryptoFriendly === 'friendly') score += 30
  if (regulation.cryptoFriendly === 'moderate') score += 15
  if (regulation.cryptoFriendly === 'strict') score -= 20
  
  // Tier factor
  if (tier === 'major') score += 20
  if (tier === 'suburban') score += 10
  if (tier === 'rural') score -= 10
  
  return Math.min(100, Math.max(0, score))
}
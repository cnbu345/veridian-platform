import { MAJOR_CITIES, WEB3_HUBS, MSAS } from './cities'
import { getStateRegulation } from './regulations'

export interface LocationAnalysis {
  city: string
  state: string
  tier: 'major' | 'suburban' | 'rural'
  nearestMajorCity?: string
  nearestWeb3Hub?: string
  web3HubType?: 'primary' | 'secondary'
  web3HubScore?: number
  distanceToMajor?: number
  msaName?: string
  msaPopulation?: number
  regulatoryClimate: 'friendly' | 'moderate' | 'strict' | 'unknown'
  talentDensity: 'high' | 'medium' | 'low'
  marketOpportunity: 'excellent' | 'good' | 'fair' | 'challenging'
}

export async function analyzeLocation(city: string, state: string): Promise<LocationAnalysis> {
  const normalizedCity = city.trim().toLowerCase()
  const normalizedState = state.trim().toUpperCase()
  
  // Check if it's a major city
  const majorCity = MAJOR_CITIES.find(
    mc => mc.city.toLowerCase() === normalizedCity && mc.state === normalizedState
  )
  
  if (majorCity) {
    const web3Hub = WEB3_HUBS.find(
      hub => hub.city.toLowerCase() === normalizedCity && hub.state === normalizedState
    )
    
    const regulation = getStateRegulation(normalizedState)
    
    return {
      city,
      state,
      tier: 'major',
      nearestWeb3Hub: web3Hub?.city || majorCity.city,
      web3HubType: web3Hub?.type,
      web3HubScore: web3Hub?.score,
      regulatoryClimate: regulation.cryptoFriendly as any,
      talentDensity: web3Hub ? 'high' : 'medium',
      marketOpportunity: web3Hub ? 'excellent' : 'good'
    }
  }
  
  // Check if it's in an MSA (suburban)
  const msa = MSAS.find(msa => 
    msa.states.includes(normalizedState) && 
    msa.name.toLowerCase().includes(normalizedCity)
  )
  
  if (msa) {
    const majorInState = MAJOR_CITIES.find(mc => mc.state === normalizedState)
    const web3HubInState = WEB3_HUBS.find(hub => hub.state === normalizedState)
    const regulation = getStateRegulation(normalizedState)
    
    return {
      city,
      state,
      tier: 'suburban',
      nearestMajorCity: majorInState?.city,
      nearestWeb3Hub: web3HubInState?.city || majorInState?.city,
      web3HubType: web3HubInState?.type,
      web3HubScore: web3HubInState?.score,
      distanceToMajor: 25,
      msaName: msa.name,
      msaPopulation: msa.population,
      regulatoryClimate: regulation.cryptoFriendly as any,
      talentDensity: web3HubInState ? 'medium' : 'low',
      marketOpportunity: 'good'
    }
  }
  
  // Default to rural
  const nearestMajor = MAJOR_CITIES.reduce((nearest, current) => {
    if (current.state === normalizedState) return current
    if (!nearest) return current
    return nearest
  }, MAJOR_CITIES[0])
  
  const nearestWeb3 = WEB3_HUBS.reduce((nearest, current) => {
    if (current.state === normalizedState) return current
    if (!nearest) return current
    return nearest
  }, WEB3_HUBS[0])
  
  const regulation = getStateRegulation(normalizedState)
  
  return {
    city,
    state,
    tier: 'rural',
    nearestMajorCity: nearestMajor.city,
    nearestWeb3Hub: nearestWeb3.city,
    web3HubType: nearestWeb3.type,
    web3HubScore: nearestWeb3.score,
    distanceToMajor: 75,
    regulatoryClimate: regulation.cryptoFriendly as any,
    talentDensity: 'low',
    marketOpportunity: 'fair'
  }
}

// Get Web3 talent density score
export function getTalentScore(state: string, tier: string): number {
  const web3Hub = WEB3_HUBS.find(hub => hub.state === state)
  
  if (web3Hub) {
    return web3Hub.score
  }
  
  if (tier === 'major') return 70
  if (tier === 'suburban') return 45
  return 25
}

// Get market opportunity score
export function getMarketScore(state: string, tier: string): number {
  const regulation = getStateRegulation(state)
  let score = 50
  
  // Regulatory factor
  if (regulation.cryptoFriendly === 'friendly') score += 30
  if (regulation.cryptoFriendly === 'moderate') score += 15
  if (regulation.cryptoFriendly === 'strict') score -= 20
  
  // Tier factor
  if (tier === 'major') score += 20
  if (tier === 'suburban') score += 10
  if (tier === 'rural') score -= 10
  
  return Math.min(100, Math.max(0, score))
}
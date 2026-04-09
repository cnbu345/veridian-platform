// src/lib/location/analyzer.ts
// Location analysis with licensing data from unified service
// Last updated: April 9, 2026

import { MAJOR_CITIES, REGULATORY_HUBS, MSAS } from './cities'
import { getSimplifiedLicensing, type SimplifiedLicensing } from './licensing'

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
  licenseDescription: string
  applicationFee: number | null
  applicationFeeFormatted: string
  bondRequirement: string
  processingTime: string
  taxTreatment: string
  talentDensity: 'high' | 'medium' | 'low'
  marketOpportunity: 'excellent' | 'good' | 'fair' | 'challenging'
  complianceScore: number
  marketScore: number
}

/**
 * Calculate compliance score based on state and tier
 * Higher score = more compliance work needed (strict = higher score)
 */
function calculateComplianceScore(
  regulatoryClimate: string,
  licenseRequired: string,
  tier: string
): number {
  let score = 50 // baseline
  
  // Regulatory factor - stricter = more compliance work
  if (regulatoryClimate === 'strict') {
    score += 25
  } else if (regulatoryClimate === 'moderate') {
    score += 10
  } else if (regulatoryClimate === 'friendly') {
    score -= 10
  }
  
  // License factor - more requirements = more compliance work
  if (licenseRequired === 'bitlicense') {
    score += 20
  } else if (licenseRequired === 'dfpi' || licenseRequired === 'mtl') {
    score += 10
  } else if (licenseRequired === 'none') {
    score -= 15
  }
  
  // Tier factor - major cities have more compliance resources
  if (tier === 'major') {
    score += 5
  } else if (tier === 'rural') {
    score -= 10
  }
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate market opportunity score
 * Higher score = better opportunity for crypto business
 */
function calculateMarketScore(
  regulatoryClimate: string,
  licenseRequired: string,
  taxTreatment: string,
  tier: string
): number {
  let score = 50 // baseline
  
  // Regulatory factor - friendly = more opportunity
  if (regulatoryClimate === 'friendly') {
    score += 25
  } else if (regulatoryClimate === 'moderate') {
    score += 10
  } else if (regulatoryClimate === 'strict') {
    score -= 20
  }
  
  // License factor - fewer requirements = more opportunity
  if (licenseRequired === 'none') {
    score += 15
  } else if (licenseRequired === 'mtl') {
    score += 5
  } else if (licenseRequired === 'bitlicense' || licenseRequired === 'dfpi') {
    score -= 10
  }
  
  // Tax factor - no income tax = more opportunity
  if (taxTreatment.includes('No state income tax')) {
    score += 15
  }
  
  // Tier factor - major cities = more opportunity
  if (tier === 'major') {
    score += 20
  } else if (tier === 'suburban') {
    score += 10
  } else if (tier === 'rural') {
    score -= 10
  }
  
  return Math.min(100, Math.max(0, score))
}

/**
 * Determine talent density based on location
 */
function determineTalentDensity(
  tier: string,
  isRegulatoryHub: boolean,
  stateCode: string
): 'high' | 'medium' | 'low' {
  // Major regulatory hubs have high talent density
  if (isRegulatoryHub) return 'high'
  
  // Major cities have medium-high talent
  if (tier === 'major') return 'medium'
  
  // States with active crypto ecosystems
  const highTalentStates = ['NY', 'CA', 'TX', 'FL', 'IL', 'WA', 'CO', 'MA', 'NJ']
  if (highTalentStates.includes(stateCode)) {
    return tier === 'rural' ? 'low' : 'medium'
  }
  
  // Suburban areas have medium-low talent
  if (tier === 'suburban') return 'low'
  
  return 'low'
}

/**
 * Determine market opportunity based on scores
 */
function determineMarketOpportunity(marketScore: number): 'excellent' | 'good' | 'fair' | 'challenging' {
  if (marketScore >= 75) return 'excellent'
  if (marketScore >= 55) return 'good'
  if (marketScore >= 35) return 'fair'
  return 'challenging'
}

/**
 * Main location analysis function
 */
export async function analyzeLocation(city: string, state: string): Promise<LocationAnalysis> {
  const normalizedCity = city.trim().toLowerCase()
  const normalizedState = state.trim().toUpperCase()
  
  console.log('🔍 Analyzing location:', { city, state, normalizedCity, normalizedState })

  // Get licensing data from unified service
  const licensing = await getSimplifiedLicensing(normalizedState)

  // Check if it's a major city
  const majorCity = MAJOR_CITIES.find(
    mc => mc.city.toLowerCase() === normalizedCity && mc.state === normalizedState
  )

  console.log('📍 Major city found:', majorCity ? 'YES' : 'NO', majorCity)
  
  if (majorCity) {
    const regulatoryHub = REGULATORY_HUBS.find(
      hub => hub.city.toLowerCase() === normalizedCity && hub.state === normalizedState
    )
    
    const isRegulatoryHub = !!regulatoryHub
    const talentDensity = determineTalentDensity('major', isRegulatoryHub, normalizedState)
    const complianceScore = calculateComplianceScore(
      licensing.cryptoFriendly,
      licensing.licenseRequired,
      'major'
    )
    const marketScore = calculateMarketScore(
      licensing.cryptoFriendly,
      licensing.licenseRequired,
      licensing.taxTreatment,
      'major'
    )
    const marketOpportunity = determineMarketOpportunity(marketScore)
    
    const result: LocationAnalysis = {
      city,
      state,
      tier: 'major',
      nearestRegulatoryHub: regulatoryHub?.city || majorCity.city,
      regulatoryHubType: regulatoryHub?.type,
      regulatoryHubScore: regulatoryHub?.score,
      regulatoryClimate: licensing.cryptoFriendly,
      licenseRequired: licensing.licenseRequired,
      licenseDescription: licensing.moneyTransmitter,
      applicationFee: licensing.applicationFee,
      applicationFeeFormatted: licensing.applicationFeeFormatted,
      bondRequirement: licensing.bondRequirementFormatted,
      processingTime: licensing.processingTimeFormatted,
      taxTreatment: licensing.taxTreatment,
      talentDensity,
      marketOpportunity,
      complianceScore,
      marketScore
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
    const isRegulatoryHub = !!regulatoryHubInState
    const talentDensity = determineTalentDensity('suburban', isRegulatoryHub, normalizedState)
    const complianceScore = calculateComplianceScore(
      licensing.cryptoFriendly,
      licensing.licenseRequired,
      'suburban'
    )
    const marketScore = calculateMarketScore(
      licensing.cryptoFriendly,
      licensing.licenseRequired,
      licensing.taxTreatment,
      'suburban'
    )
    const marketOpportunity = determineMarketOpportunity(marketScore)
    
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
      regulatoryClimate: licensing.cryptoFriendly,
      licenseRequired: licensing.licenseRequired,
      licenseDescription: licensing.moneyTransmitter,
      applicationFee: licensing.applicationFee,
      applicationFeeFormatted: licensing.applicationFeeFormatted,
      bondRequirement: licensing.bondRequirementFormatted,
      processingTime: licensing.processingTimeFormatted,
      taxTreatment: licensing.taxTreatment,
      talentDensity,
      marketOpportunity,
      complianceScore,
      marketScore
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
  
  const talentDensity = determineTalentDensity('rural', false, normalizedState)
  const complianceScore = calculateComplianceScore(
    licensing.cryptoFriendly,
    licensing.licenseRequired,
    'rural'
  )
  const marketScore = calculateMarketScore(
    licensing.cryptoFriendly,
    licensing.licenseRequired,
    licensing.taxTreatment,
    'rural'
  )
  const marketOpportunity = determineMarketOpportunity(marketScore)
  
  return {
    city,
    state,
    tier: 'rural',
    nearestMajorCity: nearestMajor.city,
    nearestRegulatoryHub: nearestRegulatory.city,
    regulatoryHubType: nearestRegulatory.type,
    regulatoryHubScore: nearestRegulatory.score,
    distanceToMajor: 75,
    regulatoryClimate: licensing.cryptoFriendly,
    licenseRequired: licensing.licenseRequired,
    licenseDescription: licensing.moneyTransmitter,
    applicationFee: licensing.applicationFee,
    applicationFeeFormatted: licensing.applicationFeeFormatted,
    bondRequirement: licensing.bondRequirementFormatted,
    processingTime: licensing.processingTimeFormatted,
    taxTreatment: licensing.taxTreatment,
    talentDensity,
    marketOpportunity,
    complianceScore,
    marketScore
  }
}

/**
 * Get regulatory compliance score (0-100)
 * Higher score = more compliance requirements
 */
export async function getComplianceScore(state: string, city: string, tier: string): Promise<number> {
  const licensing = await getSimplifiedLicensing(state)
  return calculateComplianceScore(licensing.cryptoFriendly, licensing.licenseRequired, tier)
}

/**
 * Get market opportunity score (0-100)
 * Higher score = better opportunity for crypto business
 */
export async function getMarketScore(state: string, city: string, tier: string): Promise<number> {
  const licensing = await getSimplifiedLicensing(state)
  return calculateMarketScore(
    licensing.cryptoFriendly,
    licensing.licenseRequired,
    licensing.taxTreatment,
    tier
  )
}
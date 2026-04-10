// src/lib/location/licensing.ts
// Unified licensing service - reads from Supabase first, falls back to static data
// Last updated: April 9, 2026

// Server-only guard
if (typeof window !== 'undefined') {
  throw new Error('❌ licensing.ts is SERVER-ONLY. Use licensing-client.ts for client components.')
}

import { createClient } from '@/lib/supabase/server'
import { LICENSING_DATA, getLicensesForState as getStaticLicenses, type LicenseInfo } from './licensingData'

export interface LicensingRequirement {
  state_code: string
  license_required: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies'
  license_name: string | null
  license_description: string | null
  regulatory_climate: 'friendly' | 'moderate' | 'strict' | 'unknown'
  application_fee: number | null
  application_fee_unit: string
  annual_renewal_fee: number | null
  bond_requirement_min: number | null
  bond_requirement_max: number | null
  net_worth_requirement: number | null
  processing_time_min_months: number | null
  processing_time_max_months: number | null
  source_name: string
  source_url: string
  effective_date: string | null
  regulator_name: string | null
  regulator_website: string | null
  regulator_phone: string | null
  regulator_email: string | null
  notes: string | null
  verification_status: 'verified' | 'needs_review' | 'deprecated'
  confidence_score: number
}

export interface SimplifiedLicensing {
  licenseRequired: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies'
  cryptoFriendly: 'friendly' | 'moderate' | 'strict' | 'unknown'
  moneyTransmitter: string
  taxTreatment: string
  notes: string
  applicationFee: number | null
  applicationFeeFormatted: string
  bondRequirementMin: number | null
  bondRequirementMax: number | null
  bondRequirementFormatted: string
  processingTimeMinMonths: number | null
  processingTimeMaxMonths: number | null
  processingTimeFormatted: string
}

// Cache for database licensing data
let dbLicensingCache: Map<string, LicensingRequirement> | null = null
let cacheTimestamp: number | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// States with no income tax
const NO_INCOME_TAX_STATES = new Set([
  'TX', 'FL', 'NV', 'SD', 'TN', 'WY', 'AK', 'NH', 'WA'
])

// State name mapping
const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming'
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number | null): string {
  if (amount === null) return 'Varies'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format bond requirement for display
 */
function formatBondRequirement(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Varies'
  if (min !== null && max !== null && min !== max) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`
  }
  if (min !== null) return formatCurrency(min)
  if (max !== null) return formatCurrency(max)
  return 'Varies'
}

/**
 * Format processing time for display
 */
function formatProcessingTime(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Varies'
  if (min !== null && max !== null && min !== max) {
    return `${min}-${max} months`
  }
  if (min !== null) return `${min} months`
  if (max !== null) return `${max} months`
  return 'Varies'
}

/**
 * Get licensing requirement from database (with fallback to static data)
 */
export async function getLicensingRequirement(stateCode: string): Promise<LicensingRequirement | null> {
  const upperStateCode = stateCode.toUpperCase()
  
  // Check cache first
  if (dbLicensingCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    const cached = dbLicensingCache.get(upperStateCode)
    if (cached) return cached
  }
  
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .eq('state_code', upperStateCode)
      .single()
    
    if (!error && data) {
      // Cache the result
      if (!dbLicensingCache) dbLicensingCache = new Map()
      dbLicensingCache.set(upperStateCode, data)
      cacheTimestamp = Date.now()
      return data
    }
  } catch (error) {
    console.warn(`Database unavailable for ${stateCode}, using static fallback`)
  }
  
  // Fallback to static data from licensingData.ts
  return getStaticLicensingFallback(upperStateCode)
}

/**
 * Fallback to static data when database is unavailable
 */
function getStaticLicensingFallback(stateCode: string): LicensingRequirement | null {
  const staticLicenses = getStaticLicenses(stateCode, true)
  
  if (staticLicenses.length === 0) {
    return null
  }
  
  const primaryLicense = staticLicenses[0]
  
  // Determine license type based on static data
  let licenseRequired: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies' = 'varies'
  const licenseTypeLower = primaryLicense.licenseType.toLowerCase()
  
  if (licenseTypeLower.includes('bitlicense')) {
    licenseRequired = 'bitlicense'
  } else if (licenseTypeLower.includes('dfpi')) {
    licenseRequired = 'dfpi'
  } else if (licenseTypeLower.includes('money transmitter') || licenseTypeLower.includes('money services')) {
    licenseRequired = 'mtl'
  } else if (primaryLicense.required === false) {
    licenseRequired = 'none'
  }
  
  // Determine regulatory climate based on state
  let regulatoryClimate: 'friendly' | 'moderate' | 'strict' | 'unknown' = 'moderate'
  const friendlyStates = ['TX', 'FL', 'WY', 'NV', 'SD', 'TN', 'AZ', 'CO', 'UT', 'NH']
  const strictStates = ['NY', 'CA', 'NJ', 'MA', 'WA', 'CT']
  
  if (friendlyStates.includes(stateCode)) {
    regulatoryClimate = 'friendly'
  } else if (strictStates.includes(stateCode)) {
    regulatoryClimate = 'strict'
  }
  
  // Parse timeline for months
  let processingTimeMin: number | null = null
  let processingTimeMax: number | null = null
  const timelineMatch = primaryLicense.timeline.match(/(\d+)-(\d+)/)
  if (timelineMatch) {
    processingTimeMin = parseInt(timelineMatch[1])
    processingTimeMax = parseInt(timelineMatch[2])
  }
  
  // Parse fees for numeric value
  let applicationFee: number | null = null
  const feeMatch = primaryLicense.fees.match(/\$([\d,]+)/)
  if (feeMatch) {
    applicationFee = parseInt(feeMatch[1].replace(/,/g, ''))
  }
  
  // Parse bonding for numeric value
  let bondMin: number | null = null
  let bondMax: number | null = null
  const bondMatch = primaryLicense.bonding.match(/\$([\d,]+)(?:\s*-\s*\$([\d,]+))?/)
  if (bondMatch) {
    bondMin = parseInt(bondMatch[1].replace(/,/g, ''))
    if (bondMatch[2]) {
      bondMax = parseInt(bondMatch[2].replace(/,/g, ''))
    }
  }
  
  return {
    state_code: stateCode,
    license_required: licenseRequired,
    license_name: primaryLicense.licenseType,
    license_description: primaryLicense.notes || `${primaryLicense.licenseType} required for digital asset businesses.`,
    regulatory_climate: regulatoryClimate,
    application_fee: applicationFee,
    application_fee_unit: 'USD',
    annual_renewal_fee: null,
    bond_requirement_min: bondMin,
    bond_requirement_max: bondMax,
    net_worth_requirement: null,
    processing_time_min_months: processingTimeMin,
    processing_time_max_months: processingTimeMax,
    source_name: 'Static Data',
    source_url: '',
    effective_date: null,
    regulator_name: null,
    regulator_website: null,
    regulator_phone: null,
    regulator_email: null,
    notes: primaryLicense.notes || null,
    verification_status: 'needs_review',
    confidence_score: 0.5
  }
}

/**
 * Get simplified licensing info for location analysis and public display
 */
export async function getSimplifiedLicensing(stateCode: string): Promise<SimplifiedLicensing> {
  const licensing = await getLicensingRequirement(stateCode)
  
  if (!licensing) {
    return {
      licenseRequired: 'varies',
      cryptoFriendly: 'unknown',
      moneyTransmitter: 'Consult legal counsel',
      taxTreatment: 'Consult tax professional',
      notes: 'Consult with local legal counsel for specific regulations.',
      applicationFee: null,
      applicationFeeFormatted: 'Varies',
      bondRequirementMin: null,
      bondRequirementMax: null,
      bondRequirementFormatted: 'Varies',
      processingTimeMinMonths: null,
      processingTimeMaxMonths: null,
      processingTimeFormatted: 'Varies'
    }
  }
  
  // Map license type to description
  let moneyTransmitterDesc = ''
  switch (licensing.license_required) {
    case 'bitlicense':
      moneyTransmitterDesc = 'BitLicense required for virtual currency businesses'
      break
    case 'dfpi':
      moneyTransmitterDesc = 'DFPI licensing required'
      break
    case 'mtl':
      moneyTransmitterDesc = 'Money Transmitter License required'
      break
    case 'none':
      moneyTransmitterDesc = 'No specific license required'
      break
    default:
      moneyTransmitterDesc = 'License requirements vary by activity'
  }
  
  // Get tax treatment
  const taxTreatment = NO_INCOME_TAX_STATES.has(stateCode) 
    ? 'No state income tax' 
    : 'Income tax applies'
  
  return {
    licenseRequired: licensing.license_required,
    cryptoFriendly: licensing.regulatory_climate,
    moneyTransmitter: moneyTransmitterDesc,
    taxTreatment: taxTreatment,
    notes: licensing.notes || '',
    applicationFee: licensing.application_fee,
    applicationFeeFormatted: formatCurrency(licensing.application_fee),
    bondRequirementMin: licensing.bond_requirement_min,
    bondRequirementMax: licensing.bond_requirement_max,
    bondRequirementFormatted: formatBondRequirement(
      licensing.bond_requirement_min,
      licensing.bond_requirement_max
    ),
    processingTimeMinMonths: licensing.processing_time_min_months,
    processingTimeMaxMonths: licensing.processing_time_max_months,
    processingTimeFormatted: formatProcessingTime(
      licensing.processing_time_min_months,
      licensing.processing_time_max_months
    )
  }
}

/**
 * Preload all licensing data into cache
 */
export async function preloadLicensingData(): Promise<void> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('licensing_requirements')
      .select('*')
      .eq('verification_status', 'verified')
    
    if (error || !data) {
      console.warn('Failed to preload licensing data from database')
      return
    }
    
    dbLicensingCache = new Map()
    data.forEach(item => {
      dbLicensingCache!.set(item.state_code, item)
    })
    cacheTimestamp = Date.now()
  } catch (error) {
    console.warn('Error preloading licensing data:', error)
  }
}

/**
 * Clear the licensing cache (useful after updates)
 */
export function clearLicensingCache(): void {
  dbLicensingCache = null
  cacheTimestamp = null
}

// Re-export LicenseInfo type for convenience
export type { LicenseInfo }
export { getLicensesForState, getAllStateLicenses } from './licensingData'
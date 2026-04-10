// src/lib/location/licensing-client.ts
// Client-safe licensing helper (does NOT import server-only modules)
// Use this in client components only

import { createClient } from '@/lib/supabase/client'

export interface SimplifiedLicensingClient {
  licenseRequired: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies'
  cryptoFriendly: 'friendly' | 'moderate' | 'strict' | 'unknown'
  moneyTransmitter: string
  taxTreatment: string
  notes: string
  applicationFee: number | null
  applicationFeeFormatted: string
  bondRequirement: string
  processingTime: string
}

/**
 * Get simplified licensing info for client components
 * Uses browser client instead of server client
 */
export async function getSimplifiedLicensingClient(stateCode: string): Promise<SimplifiedLicensingClient> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('licensing_requirements')
    .select('*')
    .eq('state_code', stateCode.toUpperCase())
    .single()
  
  if (error || !data) {
    // Return default values when no data found
    return {
      licenseRequired: 'varies',
      cryptoFriendly: 'unknown',
      moneyTransmitter: 'Consult legal counsel',
      taxTreatment: 'Consult tax professional',
      notes: 'Consult with local legal counsel for specific regulations.',
      applicationFee: null,
      applicationFeeFormatted: 'Contact regulator',
      bondRequirement: 'Contact regulator',
      processingTime: 'Contact regulator'
    }
  }
  
  // States with no income tax
  const NO_INCOME_TAX_STATES = new Set([
    'TX', 'FL', 'NV', 'SD', 'TN', 'WY', 'AK', 'NH', 'WA'
  ])
  
  // Format currency
  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return 'Contact regulator'
    return `$${amount.toLocaleString()}`
  }
  
  // Format bond requirement
  const formatBondRequirement = (min: number | null, max: number | null): string => {
    if (min === null && max === null) return 'Contact regulator'
    if (min !== null && max !== null && min !== max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    }
    if (min !== null) return `$${min.toLocaleString()}`
    if (max !== null) return `$${max.toLocaleString()}`
    return 'Contact regulator'
  }
  
  // Format processing time
  const formatProcessingTime = (min: number | null, max: number | null): string => {
    if (min === null && max === null) return 'Contact regulator'
    if (min !== null && max !== null && min !== max) {
      return `${min}-${max} months`
    }
    if (min !== null) return `${min} months`
    if (max !== null) return `${max} months`
    return 'Contact regulator'
  }
  
  // Map license type to description
  let moneyTransmitterDesc = ''
  switch (data.license_required) {
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
  
  // Determine tax treatment
  const taxTreatment = NO_INCOME_TAX_STATES.has(stateCode.toUpperCase()) 
    ? 'No state income tax' 
    : 'Income tax applies'
  
  return {
    licenseRequired: data.license_required,
    cryptoFriendly: data.regulatory_climate,
    moneyTransmitter: moneyTransmitterDesc,
    taxTreatment: taxTreatment,
    notes: data.notes || '',
    applicationFee: data.application_fee,
    applicationFeeFormatted: formatCurrency(data.application_fee),
    bondRequirement: formatBondRequirement(data.bond_requirement_min, data.bond_requirement_max),
    processingTime: formatProcessingTime(data.processing_time_min_months, data.processing_time_max_months)
  }
}
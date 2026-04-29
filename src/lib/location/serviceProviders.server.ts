// src/lib/location/serviceProviders.server.ts
// SERVER-ONLY - Do not import this in client components
// Use for API routes, server components, and report generation

import { createClient } from '@/lib/supabase/server'

export interface ServiceProvider {
  id: string
  name: string
  type: 'lawFirm' | 'consultant' | 'techProvider' | 'association' | 'regulator'
  phone: string
  email: string
  website?: string
  specialty: string
  cities?: string[]
  states: string[]
  national?: boolean
  is_active: boolean
}

// Cache for service providers
let serviceProvidersCache: ServiceProvider[] | null = null
let cacheTimestamp: number | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchAllServiceProviders(): Promise<ServiceProvider[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching service providers:', error)
    return []
  }

  return (data || []).map(provider => ({
    id: provider.id,
    name: provider.name,
    type: provider.provider_type,
    phone: provider.phone || '',
    email: provider.email || '',
    website: provider.website || undefined,
    specialty: provider.specialty || '',
    cities: provider.cities || undefined,
    states: provider.states || [],
    national: provider.is_national,
    is_active: provider.is_active
  }))
}

async function getServiceProviders(): Promise<ServiceProvider[]> {
  const now = Date.now()
  if (serviceProvidersCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    return serviceProvidersCache
  }
  
  serviceProvidersCache = await fetchAllServiceProviders()
  cacheTimestamp = now
  return serviceProvidersCache
}

export async function getProvidersForLocation(
  city: string, 
  state: string, 
  tier: 'major' | 'suburban' | 'rural'
): Promise<{
  legalCounsel: ServiceProvider[]
  consultants: ServiceProvider[]
  techProviders: ServiceProvider[]
  associations: ServiceProvider[]
  regulator: ServiceProvider
}> {
  console.log(`📍 Getting service providers for ${city}, ${state} (${tier} market)`)
  
  const allProviders = await getServiceProviders()
  
  const providersForLocation = allProviders.filter(provider => {
    if (provider.national) return true
    if (provider.states && provider.states.includes(state)) {
      if (provider.cities && provider.cities.length > 0) {
        return provider.cities.some(c => 
          c.toLowerCase() === city.toLowerCase() ||
          c.toLowerCase().includes(city.toLowerCase())
        )
      }
      return true
    }
    return false
  })
  
  let legalCounsel = providersForLocation.filter(p => p.type === 'lawFirm').slice(0, 4)
  let consultants = providersForLocation.filter(p => p.type === 'consultant').slice(0, 3)
  let techProviders = providersForLocation.filter(p => p.type === 'techProvider').slice(0, 4)
  let associations = providersForLocation.filter(p => p.type === 'association').slice(0, 2)
  
  const regulator = providersForLocation.find(p => 
    p.type === 'regulator' && p.states?.includes(state)
  ) || getDefaultRegulator(state)
  
  if (tier !== 'major') {
    const nationalProviders = allProviders.filter(p => p.national)
    
    if (legalCounsel.length < 2) {
      legalCounsel.push(...nationalProviders.filter(p => p.type === 'lawFirm').slice(0, 2 - legalCounsel.length))
    }
    if (consultants.length < 2) {
      consultants.push(...nationalProviders.filter(p => p.type === 'consultant').slice(0, 2 - consultants.length))
    }
    if (techProviders.length < 3) {
      techProviders.push(...nationalProviders.filter(p => p.type === 'techProvider').slice(0, 3 - techProviders.length))
    }
  }
  
  return {
    legalCounsel: [...new Map(legalCounsel.map(p => [p.id, p])).values()],
    consultants: [...new Map(consultants.map(p => [p.id, p])).values()],
    techProviders: [...new Map(techProviders.map(p => [p.id, p])).values()],
    associations: [...new Map(associations.map(p => [p.id, p])).values()],
    regulator
  }
}

function getDefaultRegulator(state: string): ServiceProvider {
  const regulators: Record<string, ServiceProvider> = {
    'NY': {
      id: 'default-ny',
      name: 'New York State Department of Financial Services (NYDFS)',
      type: 'regulator',
      phone: '(212) 709-3500',
      email: 'licensing@dfs.ny.gov',
      website: 'www.dfs.ny.gov',
      specialty: 'BitLicense & Money Transmitter Regulation',
      states: ['NY'],
      is_active: true
    },
    'CA': {
      id: 'default-ca',
      name: 'California Department of Financial Protection and Innovation (DFPI)',
      type: 'regulator',
      phone: '(866) 275-2677',
      email: 'licensing@dfpi.ca.gov',
      website: 'www.dfpi.ca.gov',
      specialty: 'Money Transmitter & Digital Asset Regulation',
      states: ['CA'],
      is_active: true
    },
    'TX': {
      id: 'default-tx',
      name: 'Texas Department of Banking',
      type: 'regulator',
      phone: '(877) 276-5554',
      email: 'info@dob.texas.gov',
      website: 'www.dob.texas.gov',
      specialty: 'Money Services Business Regulation',
      states: ['TX'],
      is_active: true
    }
  }
  
  return regulators[state] || {
    id: 'default',
    name: `${state} Department of Banking`,
    type: 'regulator',
    phone: 'Contact state website',
    email: 'Check website',
    website: 'www.google.com/search?q=state+banking+department',
    specialty: 'Financial Services Regulation',
    states: [state],
    is_active: true
  }
}

export function clearServiceProvidersCache(): void {
  serviceProvidersCache = null
  cacheTimestamp = null
}

export async function refreshServiceProviders(): Promise<ServiceProvider[]> {
  clearServiceProvidersCache()
  return getServiceProviders()
}
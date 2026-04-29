// src/lib/location/serviceProviders.client.ts
// CLIENT-SAFE - Static fallback data for client components
// Use this in client components only

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

// Static fallback data for client components (when server data isn't available)
const FALLBACK_PROVIDERS: ServiceProvider[] = [
  {
    id: 'fallback-1',
    name: 'Perkins Coie LLP',
    type: 'lawFirm',
    phone: '(212) 123-4567',
    email: 'blockchain@perkinscoie.com',
    website: 'www.perkinscoie.com',
    specialty: 'Blockchain & Digital Assets',
    states: ['NY', 'CA', 'IL', 'WA', 'TX', 'CO'],
    national: true,
    is_active: true
  },
  {
    id: 'fallback-2',
    name: 'Cooley LLP',
    type: 'lawFirm',
    phone: '(415) 123-4567',
    email: 'fintech@cooley.com',
    website: 'www.cooley.com',
    specialty: 'FinTech Regulatory',
    states: ['CA', 'NY', 'VA', 'CO', 'MA'],
    national: true,
    is_active: true
  },
  {
    id: 'fallback-3',
    name: 'Chainalysis',
    type: 'techProvider',
    phone: '(212) 123-4567',
    email: 'sales@chainalysis.com',
    website: 'www.chainalysis.com',
    specialty: 'Blockchain analytics & transaction monitoring',
    states: ['NY', 'CA', 'TX', 'IL', 'FL'],
    national: true,
    is_active: true
  },
  {
    id: 'fallback-4',
    name: 'Compliance Solutions Group',
    type: 'consultant',
    phone: '(512) 123-4567',
    email: 'info@compliancesolutions.com',
    website: 'www.compliancesolutions.com',
    specialty: 'Full-service compliance',
    states: ['TX', 'NY', 'CA', 'FL', 'IL'],
    national: true,
    is_active: true
  }
]

// Client-safe version that uses static data
export function getProvidersForLocationClient(
  city: string, 
  state: string, 
  tier: 'major' | 'suburban' | 'rural'
): {
  legalCounsel: ServiceProvider[]
  consultants: ServiceProvider[]
  techProviders: ServiceProvider[]
  associations: ServiceProvider[]
  regulator: ServiceProvider
} {
  console.log(`📍 Getting service providers (client) for ${city}, ${state}`)
  
  const legalCounsel = FALLBACK_PROVIDERS.filter(p => p.type === 'lawFirm').slice(0, 3)
  const consultants = FALLBACK_PROVIDERS.filter(p => p.type === 'consultant').slice(0, 2)
  const techProviders = FALLBACK_PROVIDERS.filter(p => p.type === 'techProvider').slice(0, 3)
  const associations: ServiceProvider[] = []
  
  const regulator: ServiceProvider = {
    id: 'default-regulator',
    name: `${state} Department of Banking`,
    type: 'regulator',
    phone: 'Contact state website',
    email: 'Check website',
    website: 'www.google.com/search?q=state+banking+department',
    specialty: 'Financial Services Regulation',
    states: [state],
    is_active: true
  }
  
  return { legalCounsel, consultants, techProviders, associations, regulator }
}
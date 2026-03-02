// src/lib/location/serviceProviders.ts - Law firms, consultants, tech providers by location

export interface ServiceProvider {
  name: string
  type: 'lawFirm' | 'consultant' | 'techProvider' | 'association' | 'regulator'
  phone: string
  email: string
  website?: string
  specialty: string
  cities?: string[] // Cities they serve
  states: string[] // States they operate in
  national?: boolean // If they serve nationally
}

// National providers (available everywhere)
export const NATIONAL_PROVIDERS: ServiceProvider[] = [
  // National Law Firms
  {
    name: 'Perkins Coie LLP',
    type: 'lawFirm',
    phone: '(212) 123-4567',
    email: 'blockchain@perkinscoie.com',
    website: 'www.perkinscoie.com',
    specialty: 'Blockchain & Digital Assets',
    states: ['NY', 'CA', 'IL', 'WA', 'TX', 'CO'],
    national: true
  },
  {
    name: 'Cooley LLP',
    type: 'lawFirm',
    phone: '(415) 123-4567',
    email: 'fintech@cooley.com',
    website: 'www.cooley.com',
    specialty: 'FinTech Regulatory',
    states: ['CA', 'NY', 'VA', 'CO', 'MA'],
    national: true
  },
  {
    name: 'Fenwick & West',
    type: 'lawFirm',
    phone: '(650) 123-4567',
    email: 'crypto@fenwick.com',
    website: 'www.fenwick.com',
    specialty: 'Cryptocurrency Compliance',
    states: ['CA', 'NY', 'WA'],
    national: true
  },
  {
    name: 'Sullivan & Cromwell',
    type: 'lawFirm',
    phone: '(212) 558-4000',
    email: 'fintech@sullcrom.com',
    website: 'www.sullcrom.com',
    specialty: 'Financial Services Regulation',
    states: ['NY', 'CA', 'DC'],
    national: true
  },
  
  // National Consultants
  {
    name: 'Compliance Solutions Group',
    type: 'consultant',
    phone: '(512) 123-4567',
    email: 'info@compliancesolutions.com',
    website: 'www.compliancesolutions.com',
    specialty: 'Full-service compliance',
    states: ['TX', 'NY', 'CA', 'FL', 'IL'],
    national: true
  },
  {
    name: 'Regulatory Partners LLC',
    type: 'consultant',
    phone: '(512) 123-4568',
    email: 'partners@regpartners.com',
    website: 'www.regpartners.com',
    specialty: 'Multi-state licensing',
    states: ['TX', 'NY', 'CA', 'FL', 'IL'],
    national: true
  },
  {
    name: 'AML Consultants Network',
    type: 'consultant',
    phone: '(212) 123-4569',
    email: 'info@amlconsultants.com',
    website: 'www.amlconsultants.com',
    specialty: 'KYC/AML Program Development',
    states: ['NY', 'CA', 'TX', 'FL', 'IL'],
    national: true
  },
  
  // National Tech Providers
  {
    name: 'Chainalysis',
    type: 'techProvider',
    phone: '(212) 123-4567',
    email: 'sales@chainalysis.com',
    website: 'www.chainalysis.com',
    specialty: 'Blockchain analytics & transaction monitoring',
    states: ['NY', 'CA', 'TX', 'IL', 'FL'],
    national: true
  },
  {
    name: 'ComplyAdvantage',
    type: 'techProvider',
    phone: '(212) 123-4568',
    email: 'info@complyadvantage.com',
    website: 'www.complyadvantage.com',
    specialty: 'AML/KYC solutions & sanctions screening',
    states: ['NY', 'CA', 'TX', 'IL', 'FL'],
    national: true
  },
  {
    name: 'Elliptic',
    type: 'techProvider',
    phone: '(212) 123-4569',
    email: 'contact@elliptic.com',
    website: 'www.elliptic.com',
    specialty: 'Compliance screening & blockchain analytics',
    states: ['NY', 'CA', 'TX', 'IL', 'FL'],
    national: true
  },
  {
    name: 'Trulioo',
    type: 'techProvider',
    phone: '(604) 123-4567',
    email: 'sales@trulioo.com',
    website: 'www.trulioo.com',
    specialty: 'Identity verification & KYC',
    states: ['NY', 'CA', 'TX', 'IL', 'FL'],
    national: true
  },
]

// State-specific providers
export const STATE_PROVIDERS: Record<string, ServiceProvider[]> = {
  // Texas providers
  'TX': [
    {
      name: 'Baker Botts LLP',
      type: 'lawFirm',
      phone: '(512) 123-4567',
      email: 'blockchain@bakerbotts.com',
      website: 'www.bakerbotts.com',
      specialty: 'Blockchain & Digital Assets',
      states: ['TX'],
      cities: ['Houston', 'Dallas', 'Austin']
    },
    {
      name: 'Haynes Boone',
      type: 'lawFirm',
      phone: '(214) 123-4567',
      email: 'fintech@haynesboone.com',
      website: 'www.haynesboone.com',
      specialty: 'FinTech Regulatory',
      states: ['TX'],
      cities: ['Dallas', 'Austin', 'Houston']
    },
    {
      name: 'Texas Blockchain Association',
      type: 'association',
      phone: '(512) 123-4567',
      email: 'info@txblockchain.org',
      website: 'www.txblockchain.org',
      specialty: 'Texas blockchain advocacy',
      states: ['TX']
    }
  ],
  
  // New York providers
  'NY': [
    {
      name: 'Fried Frank',
      type: 'lawFirm',
      phone: '(212) 859-8000',
      email: 'fintech@friedfrank.com',
      website: 'www.friedfrank.com',
      specialty: 'Financial Services Regulation',
      states: ['NY'],
      cities: ['New York']
    },
    {
      name: 'Willkie Farr & Gallagher',
      type: 'lawFirm',
      phone: '(212) 728-8000',
      email: 'digitalassets@willkie.com',
      website: 'www.willkie.com',
      specialty: 'Digital Assets & Blockchain',
      states: ['NY'],
      cities: ['New York']
    },
    {
      name: 'New York Law Journal',
      type: 'association',
      phone: '(212) 123-4567',
      email: 'info@nylj.com',
      website: 'www.nylj.com',
      specialty: 'Legal resources & events',
      states: ['NY']
    }
  ],
  
  // California providers
  'CA': [
    {
      name: 'Cooley LLP',
      type: 'lawFirm',
      phone: '(415) 123-4567',
      email: 'fintech@cooley.com',
      website: 'www.cooley.com',
      specialty: 'FinTech Regulatory',
      states: ['CA'],
      cities: ['San Francisco', 'Palo Alto', 'San Diego']
    },
    {
      name: 'Fenwick & West',
      type: 'lawFirm',
      phone: '(650) 123-4567',
      email: 'crypto@fenwick.com',
      website: 'www.fenwick.com',
      specialty: 'Cryptocurrency Compliance',
      states: ['CA'],
      cities: ['Mountain View', 'San Francisco']
    },
    {
      name: 'California Blockchain Association',
      type: 'association',
      phone: '(415) 123-4567',
      email: 'info@cablockschain.org',
      website: 'www.cablockschain.org',
      specialty: 'California blockchain advocacy',
      states: ['CA']
    }
  ],
  
  // Florida providers
  'FL': [
    {
      name: 'Greenberg Traurig',
      type: 'lawFirm',
      phone: '(305) 123-4567',
      email: 'blockchain@gtlaw.com',
      website: 'www.gtlaw.com',
      specialty: 'Blockchain & Digital Assets',
      states: ['FL'],
      cities: ['Miami', 'Fort Lauderdale']
    },
    {
      name: 'Holland & Knight',
      type: 'lawFirm',
      phone: '(305) 123-4567',
      email: 'digitalassets@hklaw.com',
      website: 'www.hklaw.com',
      specialty: 'Digital Assets & FinTech',
      states: ['FL'],
      cities: ['Miami', 'Tampa', 'Jacksonville']
    },
    {
      name: 'Florida Blockchain Association',
      type: 'association',
      phone: '(305) 123-4567',
      email: 'info@flblockchain.org',
      website: 'www.flblockchain.org',
      specialty: 'Florida blockchain advocacy',
      states: ['FL']
    }
  ],
  
  // Illinois providers
  'IL': [
    {
      name: 'Kirkland & Ellis',
      type: 'lawFirm',
      phone: '(312) 123-4567',
      email: 'digitalassets@kirkland.com',
      website: 'www.kirkland.com',
      specialty: 'Digital Assets & Blockchain',
      states: ['IL'],
      cities: ['Chicago']
    },
    {
      name: 'Sidley Austin',
      type: 'lawFirm',
      phone: '(312) 123-4567',
      email: 'fintech@sidley.com',
      website: 'www.sidley.com',
      specialty: 'Financial Services Regulation',
      states: ['IL'],
      cities: ['Chicago']
    },
    {
      name: 'Chicago Blockchain Center',
      type: 'association',
      phone: '(312) 123-4567',
      email: 'info@chicagoblockchain.org',
      website: 'www.chicagoblockchain.org',
      specialty: 'Chicago blockchain ecosystem',
      states: ['IL']
    }
  ],
  
  // Colorado providers
  'CO': [
    {
      name: 'Holland & Hart',
      type: 'lawFirm',
      phone: '(303) 123-4567',
      email: 'blockchain@hollandhart.com',
      website: 'www.hollandhart.com',
      specialty: 'Blockchain & Digital Assets',
      states: ['CO'],
      cities: ['Denver', 'Boulder']
    },
    {
      name: 'Colorado Blockchain Association',
      type: 'association',
      phone: '(303) 123-4567',
      email: 'info@coblockchain.org',
      website: 'www.coblockchain.org',
      specialty: 'Colorado blockchain advocacy',
      states: ['CO']
    }
  ],
  
  // Washington providers
  'WA': [
    {
      name: 'Perkins Coie LLP',
      type: 'lawFirm',
      phone: '(206) 123-4567',
      email: 'blockchain@perkinscoie.com',
      website: 'www.perkinscoie.com',
      specialty: 'Blockchain & Digital Assets',
      states: ['WA'],
      cities: ['Seattle', 'Bellevue']
    },
    {
      name: 'Washington Blockchain Association',
      type: 'association',
      phone: '(206) 123-4567',
      email: 'info@wablockchain.org',
      website: 'www.wablockchain.org',
      specialty: 'Washington blockchain advocacy',
      states: ['WA']
    }
  ],
  
  // Massachusetts providers
  'MA': [
    {
      name: 'Ropes & Gray',
      type: 'lawFirm',
      phone: '(617) 123-4567',
      email: 'digitalassets@ropesgray.com',
      website: 'www.ropesgray.com',
      specialty: 'Digital Assets & FinTech',
      states: ['MA'],
      cities: ['Boston']
    },
    {
      name: 'Goodwin Procter',
      type: 'lawFirm',
      phone: '(617) 123-4567',
      email: 'fintech@goodwinlaw.com',
      website: 'www.goodwinlaw.com',
      specialty: 'Financial Services Regulation',
      states: ['MA'],
      cities: ['Boston']
    },
    {
      name: 'Massachusetts Blockchain Association',
      type: 'association',
      phone: '(617) 123-4567',
      email: 'info@mablockchain.org',
      website: 'www.mablockchain.org',
      specialty: 'Massachusetts blockchain advocacy',
      states: ['MA']
    }
  ]
}

// Helper function to get providers for a location
export function getProvidersForLocation(
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
  console.log(`📍 Getting service providers for ${city}, ${state} (${tier} market)`)
  
  // Get national providers
  const nationalLawFirms = NATIONAL_PROVIDERS.filter(p => p.type === 'lawFirm')
  const nationalConsultants = NATIONAL_PROVIDERS.filter(p => p.type === 'consultant')
  const nationalTechProviders = NATIONAL_PROVIDERS.filter(p => p.type === 'techProvider')
  const nationalAssociations = NATIONAL_PROVIDERS.filter(p => p.type === 'association')
  
  // Get state-specific providers
  const stateProviders = STATE_PROVIDERS[state] || []
  const stateLawFirms = stateProviders.filter(p => p.type === 'lawFirm')
  const stateConsultants = stateProviders.filter(p => p.type === 'consultant')
  const stateTechProviders = stateProviders.filter(p => p.type === 'techProvider')
  const stateAssociations = stateProviders.filter(p => p.type === 'association')
  
  // For suburban/rural areas, we may need to recommend providers from nearest major city
  let nearbyLawFirms: ServiceProvider[] = []
  let nearbyConsultants: ServiceProvider[] = []
  
  if (tier !== 'major') {
    // Get providers from major cities in the state
    const allStateLawFirms = stateLawFirms.filter(f => f.cities && f.cities.length > 0)
    nearbyLawFirms = allStateLawFirms.slice(0, 2)
    
    const allStateConsultants = stateConsultants.filter(c => c.cities && c.cities.length > 0)
    nearbyConsultants = allStateConsultants.slice(0, 2)
  }
  
  // Combine and deduplicate
  const legalCounsel = [
    ...stateLawFirms.slice(0, 2),
    ...nationalLawFirms.slice(0, 2),
    ...nearbyLawFirms
  ].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i).slice(0, 3)
  
  const consultants = [
    ...stateConsultants.slice(0, 2),
    ...nationalConsultants.slice(0, 2),
    ...nearbyConsultants
  ].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i).slice(0, 3)
  
  const techProviders = [
    ...stateTechProviders.slice(0, 2),
    ...nationalTechProviders.slice(0, 3)
  ].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i).slice(0, 4)
  
  const associations = [
    ...stateAssociations.slice(0, 1),
    ...nationalAssociations.slice(0, 1)
  ].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i).slice(0, 2)
  
  // Get regulator
  const regulator = getRegulatorContact(state)
  
  return {
    legalCounsel,
    consultants,
    techProviders,
    associations,
    regulator
  }
}

// Regulator contacts by state
function getRegulatorContact(state: string): ServiceProvider {
  const regulators: Record<string, ServiceProvider> = {
    'NY': {
      name: 'New York State Department of Financial Services (NYDFS)',
      type: 'regulator',
      phone: '(212) 709-3500',
      email: 'licensing@dfs.ny.gov',
      website: 'www.dfs.ny.gov',
      specialty: 'BitLicense & Money Transmitter Regulation',
      states: ['NY']
    },
    'CA': {
      name: 'California Department of Financial Protection and Innovation (DFPI)',
      type: 'regulator',
      phone: '(866) 275-2677',
      email: 'licensing@dfpi.ca.gov',
      website: 'www.dfpi.ca.gov',
      specialty: 'Money Transmitter & Digital Asset Regulation',
      states: ['CA']
    },
    'TX': {
      name: 'Texas Department of Banking',
      type: 'regulator',
      phone: '(877) 276-5554',
      email: 'info@dob.texas.gov',
      website: 'www.dob.texas.gov',
      specialty: 'Money Services Business Regulation',
      states: ['TX']
    },
    'FL': {
      name: 'Florida Office of Financial Regulation',
      type: 'regulator',
      phone: '(850) 487-9687',
      email: 'licensing@flofr.gov',
      website: 'www.flofr.gov',
      specialty: 'Money Transmitter Regulation',
      states: ['FL']
    },
    'IL': {
      name: 'Illinois Department of Financial and Professional Regulation',
      type: 'regulator',
      phone: '(312) 814-2000',
      email: 'fpr.licensing@illinois.gov',
      website: 'www.idfpr.com',
      specialty: 'Money Transmitter Regulation',
      states: ['IL']
    },
    'CO': {
      name: 'Colorado Division of Banking',
      type: 'regulator',
      phone: '(303) 894-7575',
      email: 'banking@state.co.us',
      website: 'www.colorado.gov/pacific/dora/Division-of-Banking',
      specialty: 'Money Transmitter Regulation',
      states: ['CO']
    },
    'WA': {
      name: 'Washington State Department of Financial Institutions',
      type: 'regulator',
      phone: '(360) 902-8700',
      email: 'banking@dfi.wa.gov',
      website: 'www.dfi.wa.gov',
      specialty: 'Money Transmitter Regulation',
      states: ['WA']
    },
    'MA': {
      name: 'Massachusetts Division of Banks',
      type: 'regulator',
      phone: '(617) 956-1500',
      email: 'dob.licensing@mass.gov',
      website: 'www.mass.gov/dob',
      specialty: 'Money Transmitter Regulation',
      states: ['MA']
    }
  }
  
  return regulators[state] || {
    name: `${state} Department of Banking`,
    type: 'regulator',
    phone: 'Contact state website',
    email: 'Check website',
    website: 'www.google.com/search?q=state+banking+department',
    specialty: 'Financial Services Regulation',
    states: [state]
  }
}
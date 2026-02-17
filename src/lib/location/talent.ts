// src/lib/location/talent.ts
// Compliance and digital assets talent density by state and major city
export interface TalentData {
  totalComplianceProfessionals: number
  legalFirms: number
  meetups: number
  universities: string[]
  growthRate: number // YoY percentage
  avgSalary: number // in USD
  remote: 'high' | 'medium' | 'low'
}

// Primary talent hubs for digital assets compliance
export const COMPLIANCE_TALENT_HUBS = {
  'New York': {
    state: 'NY',
    totalComplianceProfessionals: 8500,
    legalFirms: 320,
    meetups: 28,
    universities: ['NYU', 'Columbia', 'Fordham'],
    growthRate: 35,
    avgSalary: 185000,
    remote: 'medium'
  },
  'San Francisco': {
    state: 'CA',
    totalComplianceProfessionals: 7200,
    legalFirms: 290,
    meetups: 24,
    universities: ['Stanford', 'UC Berkeley', 'USF'],
    growthRate: 32,
    avgSalary: 195000,
    remote: 'medium'
  },
  'Washington': {
    state: 'DC',
    totalComplianceProfessionals: 6800,
    legalFirms: 310,
    meetups: 22,
    universities: ['Georgetown', 'GWU', 'American'],
    growthRate: 28,
    avgSalary: 175000,
    remote: 'medium'
  },
  'Chicago': {
    state: 'IL',
    totalComplianceProfessionals: 5400,
    legalFirms: 245,
    meetups: 18,
    universities: ['UChicago', 'Northwestern', 'Loyola'],
    growthRate: 25,
    avgSalary: 165000,
    remote: 'medium'
  },
  'Boston': {
    state: 'MA',
    totalComplianceProfessionals: 4800,
    legalFirms: 210,
    meetups: 16,
    universities: ['Harvard', 'MIT', 'BU', 'BC'],
    growthRate: 27,
    avgSalary: 170000,
    remote: 'medium'
  },
  'Austin': {
    state: 'TX',
    totalComplianceProfessionals: 3200,
    legalFirms: 145,
    meetups: 14,
    universities: ['UT Austin', 'St. Edwards'],
    growthRate: 42,
    avgSalary: 150000,
    remote: 'high'
  },
  'Miami': {
    state: 'FL',
    totalComplianceProfessionals: 2800,
    legalFirms: 130,
    meetups: 12,
    universities: ['University of Miami', 'FIU'],
    growthRate: 48,
    avgSalary: 145000,
    remote: 'high'
  },
  'Los Angeles': {
    state: 'CA',
    totalComplianceProfessionals: 4100,
    legalFirms: 185,
    meetups: 15,
    universities: ['UCLA', 'USC', 'Loyola'],
    growthRate: 24,
    avgSalary: 160000,
    remote: 'medium'
  },
  'Seattle': {
    state: 'WA',
    totalComplianceProfessionals: 2900,
    legalFirms: 125,
    meetups: 11,
    universities: ['UW', 'Seattle U'],
    growthRate: 30,
    avgSalary: 165000,
    remote: 'medium'
  },
  'Denver': {
    state: 'CO',
    totalComplianceProfessionals: 2100,
    legalFirms: 95,
    meetups: 9,
    universities: ['CU Boulder', 'Denver U'],
    growthRate: 33,
    avgSalary: 150000,
    remote: 'high'
  }
} as const

// Secondary markets with growing compliance talent
export const SECONDARY_TALENT_MARKETS = [
  { city: 'Salt Lake City', state: 'UT', professionals: 950, growth: 38 },
  { city: 'Raleigh', state: 'NC', professionals: 1100, growth: 35 },
  { city: 'Nashville', state: 'TN', professionals: 850, growth: 40 },
  { city: 'Portland', state: 'OR', professionals: 1200, growth: 26 },
  { city: 'Phoenix', state: 'AZ', professionals: 1000, growth: 32 },
  { city: 'San Diego', state: 'CA', professionals: 1500, growth: 22 },
  { city: 'Dallas', state: 'TX', professionals: 1800, growth: 28 },
  { city: 'Houston', state: 'TX', professionals: 1400, growth: 24 },
  { city: 'Philadelphia', state: 'PA', professionals: 1300, growth: 20 },
  { city: 'Atlanta', state: 'GA', professionals: 1600, growth: 30 },
  { city: 'Minneapolis', state: 'MN', professionals: 950, growth: 21 },
  { city: 'St. Louis', state: 'MO', professionals: 700, growth: 18 },
]

// Remote-friendly states for compliance roles
export const REMOTE_FRIENDLY_STATES = [
  'TX', 'FL', 'TN', 'NV', 'WY', 'SD', 'NH', 'AZ', 'CO', 'NC', 'GA', 'UT'
]

// State compliance talent scores (0-100)
export const STATE_TALENT_SCORES: Record<string, number> = {
  'NY': 98,
  'CA': 95,
  'DC': 94,
  'IL': 85,
  'MA': 88,
  'TX': 76,
  'FL': 72,
  'WA': 75,
  'CO': 70,
  'GA': 65,
  'NC': 62,
  'VA': 64,
  'PA': 60,
  'OH': 52,
  'MI': 48,
  'MN': 55,
  'TN': 53,
  'AZ': 51,
  'OR': 57,
  'MD': 61,
  'UT': 58,
  'DE': 82,
  'WY': 70
}

// Get talent score for a location
export function getTalentScoreForLocation(city: string, state: string): {
  score: number
  rank: 'high' | 'medium' | 'low'
  details: {
    professionals: number
    growthRate: number
    remote: 'high' | 'medium' | 'low'
  }
} {
  // Check if it's a primary hub
  const hubEntry = Object.entries(COMPLIANCE_TALENT_HUBS).find(
    ([hubCity, data]) => hubCity === city && data.state === state
  )
  
  if (hubEntry) {
    const [_, data] = hubEntry
    return {
      score: 95,
      rank: 'high',
      details: {
        professionals: data.totalComplianceProfessionals,
        growthRate: data.growthRate,
        remote: data.remote
      }
    }
  }
  
  // Check secondary markets
  const secondary = SECONDARY_TALENT_MARKETS.find(
    m => m.city === city && m.state === state
  )
  
  if (secondary) {
    return {
      score: 70,
      rank: 'medium',
      details: {
        professionals: secondary.professionals,
        growthRate: secondary.growth,
        remote: REMOTE_FRIENDLY_STATES.includes(state) ? 'high' : 'medium'
      }
    }
  }
  
  // Use state score for other locations
  const stateScore = STATE_TALENT_SCORES[state] || 40
  
  return {
    score: stateScore,
    rank: stateScore >= 70 ? 'high' : stateScore >= 45 ? 'medium' : 'low',
    details: {
      professionals: Math.round(stateScore * 8),
      growthRate: 12 + Math.round(stateScore / 4),
      remote: REMOTE_FRIENDLY_STATES.includes(state) ? 'high' : 'medium'
    }
  }
}

// Get talent recommendations based on location
export function getTalentRecommendations(
  city: string, 
  state: string, 
  tier: string
): {
  strategy: string
  hiringApproach: 'local' | 'remote' | 'hybrid'
  salaryMultiplier: number
  topChannels: string[]
  estimatedTimeToHire: string
} {
  const talentScore = getTalentScoreForLocation(city, state)
  const isHub = !!Object.keys(COMPLIANCE_TALENT_HUBS).find(h => h === city)
  const remoteFriendly = REMOTE_FRIENDLY_STATES.includes(state)
  
  let hiringApproach: 'local' | 'remote' | 'hybrid' = 'hybrid'
  let salaryMultiplier = 1.0
  let estimatedTimeToHire = '6-8 weeks'
  
  if (isHub) {
    hiringApproach = 'local'
    salaryMultiplier = 1.3
    estimatedTimeToHire = '4-6 weeks'
  } else if (tier === 'rural') {
    hiringApproach = 'remote'
    salaryMultiplier = 0.9
    estimatedTimeToHire = '8-10 weeks'
  } else if (remoteFriendly) {
    hiringApproach = 'hybrid'
    salaryMultiplier = 1.0
    estimatedTimeToHire = '6-8 weeks'
  }
  
  let topChannels: string[] = []
  
  if (isHub) {
    topChannels = [
      'Local compliance networking events',
      `${city} Bar Association - FinTech section`,
      'University law school career services',
      'Regulatory agency alumni networks'
    ]
  } else if (tier === 'major') {
    topChannels = [
      'LinkedIn Recruiter - compliance focus',
      'Specialized legal search firms',
      'Compliance professional associations',
      'Remote compliance job boards'
    ]
  } else {
    topChannels = [
      'Remote compliance job boards',
      'International talent platforms',
      'Virtual compliance communities',
      'Contract-to-hire arrangements'
    ]
  }
  
  return {
    strategy: isHub 
      ? `Leverage ${city}'s deep compliance talent pool through local hiring and partnerships with law firms.`
      : remoteFriendly
        ? `Combine local compliance hires with remote talent to build an effective team.`
        : `Focus on remote-first compliance hiring with quarterly in-person gatherings.`,
    hiringApproach,
    salaryMultiplier,
    topChannels,
    estimatedTimeToHire
  }
}
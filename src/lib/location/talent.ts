// Web3 talent density by state and major city
export interface TalentData {
  totalDevelopers: number
  companies: number
  meetups: number
  universities: string[]
  growthRate: number // YoY percentage
  avgSalary: number // in USD
  remote: 'high' | 'medium' | 'low'
}

// Primary Web3 hubs with detailed talent data
export const WEB3_TALENT_HUBS = {
  'San Francisco': {
    state: 'CA',
    totalDevelopers: 15700,
    companies: 842,
    meetups: 47,
    universities: ['Stanford', 'UC Berkeley', 'USF'],
    growthRate: 32,
    avgSalary: 185000,
    remote: 'medium'
  },
  'New York': {
    state: 'NY',
    totalDevelopers: 14300,
    companies: 756,
    meetups: 52,
    universities: ['NYU', 'Columbia', 'Cornell Tech'],
    growthRate: 28,
    avgSalary: 175000,
    remote: 'medium'
  },
  'Austin': {
    state: 'TX',
    totalDevelopers: 8900,
    companies: 423,
    meetups: 31,
    universities: ['UT Austin', 'St. Edwards'],
    growthRate: 45,
    avgSalary: 155000,
    remote: 'high'
  },
  'Miami': {
    state: 'FL',
    totalDevelopers: 5600,
    companies: 312,
    meetups: 24,
    universities: ['University of Miami', 'FIU'],
    growthRate: 52,
    avgSalary: 145000,
    remote: 'high'
  },
  'Los Angeles': {
    state: 'CA',
    totalDevelopers: 7200,
    companies: 389,
    meetups: 28,
    universities: ['UCLA', 'USC', 'Caltech'],
    growthRate: 25,
    avgSalary: 165000,
    remote: 'medium'
  },
  'Chicago': {
    state: 'IL',
    totalDevelopers: 4800,
    companies: 256,
    meetups: 19,
    universities: ['UChicago', 'Northwestern', 'UIUC'],
    growthRate: 22,
    avgSalary: 148000,
    remote: 'medium'
  },
  'Seattle': {
    state: 'WA',
    totalDevelopers: 6100,
    companies: 334,
    meetups: 23,
    universities: ['UW', 'Seattle U'],
    growthRate: 30,
    avgSalary: 172000,
    remote: 'medium'
  },
  'Denver': {
    state: 'CO',
    totalDevelopers: 3900,
    companies: 198,
    meetups: 17,
    universities: ['CU Boulder', 'Denver U', 'CSU'],
    growthRate: 35,
    avgSalary: 152000,
    remote: 'high'
  },
  'Boston': {
    state: 'MA',
    totalDevelopers: 5200,
    companies: 287,
    meetups: 21,
    universities: ['MIT', 'Harvard', 'BU', 'Northeastern'],
    growthRate: 27,
    avgSalary: 168000,
    remote: 'medium'
  },
  'Atlanta': {
    state: 'GA',
    totalDevelopers: 3100,
    companies: 167,
    meetups: 14,
    universities: ['Georgia Tech', 'Emory', 'GSU'],
    growthRate: 38,
    avgSalary: 142000,
    remote: 'high'
  }
} as const

// Secondary markets with growing talent
export const SECONDARY_TALENT_MARKETS = [
  { city: 'Salt Lake City', state: 'UT', developers: 1800, growth: 42 },
  { city: 'Raleigh', state: 'NC', developers: 2100, growth: 39 },
  { city: 'Nashville', state: 'TN', developers: 1600, growth: 44 },
  { city: 'Portland', state: 'OR', developers: 2200, growth: 28 },
  { city: 'Phoenix', state: 'AZ', developers: 1900, growth: 35 },
  { city: 'San Diego', state: 'CA', developers: 2800, growth: 24 },
  { city: 'Dallas', state: 'TX', developers: 3400, growth: 31 },
  { city: 'Houston', state: 'TX', developers: 2600, growth: 27 },
  { city: 'Philadelphia', state: 'PA', developers: 2300, growth: 21 },
  { city: 'Detroit', state: 'MI', developers: 1200, growth: 18 },
  { city: 'Minneapolis', state: 'MN', developers: 1700, growth: 23 },
  { city: 'St. Louis', state: 'MO', developers: 1100, growth: 19 },
  { city: 'Kansas City', state: 'MO', developers: 1300, growth: 22 },
  { city: 'New Orleans', state: 'LA', developers: 800, growth: 31 },
  { city: 'Memphis', state: 'TN', developers: 600, growth: 25 }
]

// Remote-friendly states (based on laws, time zones, infrastructure)
export const REMOTE_FRIENDLY_STATES = [
  'TX', 'FL', 'TN', 'NV', 'WY', 'SD', 'NH', 'AZ', 'CO', 'NC', 'GA'
]

// State talent scores (0-100)
export const STATE_TALENT_SCORES: Record<string, number> = {
  'CA': 98,
  'NY': 95,
  'TX': 82,
  'FL': 76,
  'IL': 71,
  'WA': 79,
  'CO': 74,
  'MA': 81,
  'GA': 65,
  'NC': 62,
  'VA': 60,
  'PA': 58,
  'OH': 52,
  'MI': 48,
  'MN': 55,
  'TN': 53,
  'AZ': 51,
  'OR': 59,
  'MD': 57,
  'UT': 56
}

// Get talent score for a location
export function getTalentScoreForLocation(city: string, state: string): {
  score: number
  rank: 'high' | 'medium' | 'low'
  details: {
    developers: number
    growthRate: number
    remote: 'high' | 'medium' | 'low'
  }
} {
  // Check if it's a primary hub
  const hubEntry = Object.entries(WEB3_TALENT_HUBS).find(
    ([hubCity, data]) => hubCity === city && data.state === state
  )
  
  if (hubEntry) {
    const [_, data] = hubEntry
    return {
      score: 95,
      rank: 'high',
      details: {
        developers: data.totalDevelopers,
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
        developers: secondary.developers,
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
      developers: Math.round(stateScore * 15),
      growthRate: 15 + Math.round(stateScore / 5),
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
  const isHub = !!Object.keys(WEB3_TALENT_HUBS).find(h => h === city)
  const remoteFriendly = REMOTE_FRIENDLY_STATES.includes(state)
  
  let hiringApproach: 'local' | 'remote' | 'hybrid' = 'hybrid'
  let salaryMultiplier = 1.0
  let estimatedTimeToHire = '4-6 weeks'
  
  if (isHub) {
    hiringApproach = 'local'
    salaryMultiplier = 1.3
    estimatedTimeToHire = '2-4 weeks'
  } else if (tier === 'rural') {
    hiringApproach = 'remote'
    salaryMultiplier = 0.9
    estimatedTimeToHire = '6-8 weeks'
  } else if (remoteFriendly) {
    hiringApproach = 'hybrid'
    salaryMultiplier = 1.0
    estimatedTimeToHire = '4-6 weeks'
  }
  
  let topChannels: string[] = []
  
  if (isHub) {
    topChannels = [
      'Local meetups and hackathons',
      `${city} Blockchain Developers group`,
      'University career fairs',
      'Local VC portfolio companies'
    ]
  } else if (tier === 'major') {
    topChannels = [
      'Remote-first job boards',
      'Web3 talent platforms',
      'Industry Discord servers',
      'Twitter crypto community'
    ]
  } else {
    topChannels = [
      'Remote job boards (WeWorkRemotely, RemoteOK)',
      'Web3 native hiring platforms',
      'International developer communities',
      'Bounty-based hiring'
    ]
  }
  
  return {
    strategy: isHub 
      ? `Leverage ${city}'s deep talent pool through local hiring and partnerships with blockchain meetups.`
      : remoteFriendly
        ? `Combine local hiring with remote talent to access the best of both worlds.`
        : `Focus on remote-first hiring with occasional in-person gatherings for team building.`,
    hiringApproach,
    salaryMultiplier,
    topChannels,
    estimatedTimeToHire
  }
}
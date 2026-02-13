import { CompanyFormData } from './validation'
import { LocationAnalysis } from '../location/analyzer'
import { StrategyFormData } from './validation'
import { getStateRegulation, getComplianceChecklist } from '../location/regulations'
import { getTalentScoreForLocation, getTalentRecommendations } from '../location/talent'
import { GeneratedReport } from './types'

export interface GenerationResult {
  executive_summary: string
  location_analysis: any
  regulatory_analysis: any
  talent_analysis: any
  competitor_analysis: any
  implementation_roadmap: any
  resource_directory: any
  risk_assessment: any
}

export async function generateReport(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData,
  userId: string
): Promise<GenerationResult> {
  console.log('Starting report generation for:', company.name)
  
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const regulation = getStateRegulation(location.state)
  const talentScore = getTalentScoreForLocation(location.city, location.state)
  const talentRecs = getTalentRecommendations(location.city, location.state, location.tier)
  const complianceChecklist = getComplianceChecklist(location.state)
  
  // Generate executive summary
  const executive_summary = generateExecutiveSummary(company, location, strategy, regulation)
  
  // Generate location analysis
  const location_analysis = generateLocationAnalysis(location, talentScore)
  
  // Generate regulatory analysis
  const regulatory_analysis = generateRegulatoryAnalysis(location, regulation, complianceChecklist)
  
  // Generate talent analysis
  const talent_analysis = generateTalentAnalysis(location, talentScore, talentRecs)
  
  // Generate competitor analysis
  const competitor_analysis = generateCompetitorAnalysis(location, company)
  
  // Generate implementation roadmap
  const implementation_roadmap = generateRoadmap(strategy)
  
  // Generate resource directory
  const resource_directory = generateResourceDirectory(location)
  
  // Generate risk assessment
  const risk_assessment = generateRiskAssessment(location, strategy)
  
  return {
    executive_summary,
    location_analysis,
    regulatory_analysis,
    talent_analysis,
    competitor_analysis,
    implementation_roadmap,
    resource_directory,
    risk_assessment
  }
}

function generateExecutiveSummary(
  company: CompanyFormData,
  location: LocationAnalysis,
  strategy: StrategyFormData,
  regulation: any
): string {
  const marketDesc = location.tier === 'major' 
    ? 'major metropolitan Web3 hub'
    : location.tier === 'suburban'
      ? `suburban market with access to ${location.nearestMajorCity}`
      : 'rural market ideal for remote-first Web3 operations'
  
  const regulatoryDesc = regulation.cryptoFriendly === 'friendly'
    ? 'favorable regulatory environment'
    : regulation.cryptoFriendly === 'moderate'
      ? 'moderate regulatory requirements'
      : 'strict regulatory framework requiring careful compliance'
  
  return `# Executive Summary: ${company.name} Web3 Strategy

## Company Overview
${company.name} operates in the ${company.industry} industry with ${company.size} employees. 
With a budget of ${company.budget.replace('-', ' to ').replace('k', 'K')}, 
the company is positioned to explore Web3 opportunities strategically.

## Location Advantage
Based in ${location.city}, ${location.state}, your company has access to a ${marketDesc}. 
This location offers ${location.talentDensity} talent density and a ${regulatoryDesc}.

## Strategic Focus
Based on your primary focus on ${strategy.primary.replace('-', ' ')}, 
we've developed a ${strategy.timeline} roadmap that addresses your key concerns:
${strategy.concerns.substring(0, 150)}...

## Key Recommendations
1. ${location.tier === 'major' ? 'Leverage local Web3 talent and community' : 'Build a remote-first team with periodic gatherings'}
2. ${regulation.cryptoFriendly === 'strict' ? 'Prioritize compliance infrastructure early' : 'Move quickly while maintaining compliance basics'}
3. Focus on ${strategy.secondary.slice(0, 2).join(' and ')} as secondary priorities

## Expected Outcomes
Within ${strategy.timeline}, you can expect to have a functional Web3 strategy 
aligned with your business goals and compliant with ${location.state} regulations.
`
}

function generateLocationAnalysis(location: LocationAnalysis, talentScore: any): any {
  return {
    marketTier: location.tier,
    nearestHub: location.nearestWeb3Hub,
    hubDistance: location.distanceToMajor || 0,
    talentScore: talentScore.score,
    talentRank: talentScore.rank,
    developers: talentScore.details.developers,
    growthRate: talentScore.details.growthRate,
    msaInfo: location.msaName ? {
      name: location.msaName,
      population: location.msaPopulation
    } : null,
    summary: `${location.city} is a ${location.tier} market with ${
      talentScore.rank === 'high' ? 'strong' : 'developing'
    } Web3 talent. ${location.nearestWeb3Hub ? `Nearest major hub: ${location.nearestWeb3Hub}` : ''}`
  }
}

function generateRegulatoryAnalysis(location: LocationAnalysis, regulation: any, checklist: string[]): any {
  return {
    climate: regulation.cryptoFriendly,
    moneyTransmitter: regulation.moneyTransmitter,
    taxTreatment: regulation.taxTreatment,
    notes: regulation.notes,
    checklist,
    lastUpdated: regulation.lastUpdated,
    summary: `${location.state} has a ${regulation.cryptoFriendly} regulatory climate. ${
      regulation.cryptoFriendly === 'friendly' 
        ? 'This presents fewer compliance barriers for Web3 initiatives.'
        : regulation.cryptoFriendly === 'strict'
          ? 'Expect significant compliance requirements and regulatory oversight.'
          : 'Moderate compliance requirements with room to operate.'
    }`
  }
}

function generateTalentAnalysis(location: LocationAnalysis, talentScore: any, recs: any): any {
  return {
    score: talentScore.score,
    rank: talentScore.rank,
    estimatedDevelopers: talentScore.details.developers,
    growthRate: talentScore.details.growthRate,
    remoteCapability: talentScore.details.remote,
    hiringStrategy: recs.strategy,
    approach: recs.hiringApproach,
    salaryMultiplier: recs.salaryMultiplier,
    channels: recs.topChannels,
    timeToHire: recs.estimatedTimeToHire
  }
}

function generateCompetitorAnalysis(location: LocationAnalysis, company: CompanyFormData): any {
  const competitorsByTier = {
    major: 15 + Math.floor(Math.random() * 10),
    suburban: 8 + Math.floor(Math.random() * 7),
    rural: 3 + Math.floor(Math.random() * 5)
  }
  
  const competitorCount = competitorsByTier[location.tier as keyof typeof competitorsByTier] || 5
  
  return {
    totalCompetitors: competitorCount,
    activeInWeb3: Math.floor(competitorCount * 0.6),
    raisingFunding: Math.floor(competitorCount * 0.3),
    gaps: [
      'Most competitors lack location-specific strategy',
      'Few are addressing regulatory compliance comprehensively',
      'Talent acquisition remains a common pain point'
    ],
    opportunities: [
      `Differentiate through ${location.state}-specific compliance expertise`,
      `Build community in ${location.city} before competitors establish presence`,
      'Focus on your specific industry vertical'
    ]
  }
}

function generateRoadmap(strategy: StrategyFormData): any {
  const months = strategy.timeline === '3-months' ? 3 : strategy.timeline === '6-months' ? 6 : 12
  
  return {
    timeline: strategy.timeline,
    phases: [
      {
        month: 1,
        focus: 'Foundation',
        tasks: [
          'Legal entity setup and compliance review',
          'Team education and Web3 fundamentals training',
          'Technology stack selection',
          'Initial community building'
        ]
      },
      {
        month: Math.floor(months / 3),
        focus: 'Development',
        tasks: [
          'MVP or pilot program development',
          'Partnership outreach',
          'Regulatory documentation preparation',
          'User testing with early adopters'
        ]
      },
      {
        month: Math.floor(months * 0.66),
        focus: 'Launch',
        tasks: [
          'Public launch or pilot expansion',
          'Marketing and community engagement',
          'Performance monitoring setup',
          'Iterate based on feedback'
        ]
      }
    ],
    milestones: [
      `Complete regulatory review by end of Month 1`,
      `Launch pilot by end of Month ${Math.floor(months / 2)}`,
      `Public launch by end of Month ${months}`
    ]
  }
}

function generateResourceDirectory(location: LocationAnalysis): any {
  return {
    legalFirms: [
      { name: 'Perkins Coie', focus: 'Blockchain & Crypto', national: true },
      { name: 'Anderson Kill', focus: 'Cryptocurrency', national: true },
      { name: 'Cooley LLP', focus: 'Tech & Blockchain', national: true }
    ],
    localResources: [
      {
        type: 'Meetup',
        name: `${location.city} Blockchain Developers`,
        url: `https://meetup.com/${location.city}-blockchain`
      },
      {
        type: 'Accelerator',
        name: 'Web3 Launchpad',
        url: 'https://web3launchpad.io'
      },
      {
        type: 'Community',
        name: 'Crypto Commons',
        url: 'https://cryptocommons.community'
      }
    ],
    fundingSources: [
      'Local angel investor networks',
      'Web3-focused VC firms',
      'State economic development grants',
      'Crypto native DAO treasuries'
    ],
    developmentPartners: [
      'ConsenSys',
      'Alchemy Ventures',
      'ThirdWeb',
      'Local dev shops'
    ]
  }
}

function generateRiskAssessment(location: LocationAnalysis, strategy: StrategyFormData): any {
  const risks = [
    {
      category: 'Regulatory',
      risk: `Regulatory changes in ${location.state}`,
      likelihood: location.regulatoryClimate === 'strict' ? 'high' : 'medium',
      impact: 'high',
      mitigation: 'Regular compliance reviews, legal counsel retainer, flexible architecture'
    },
    {
      category: 'Market',
      risk: 'Market volatility and crypto winter',
      likelihood: 'medium',
      impact: 'high',
      mitigation: 'Diversified treasury strategy, focus on fundamentals, extended runway planning'
    },
    {
      category: 'Talent',
      risk: `Difficulty hiring in ${location.tier} market`,
      likelihood: location.talentDensity === 'low' ? 'high' : 'medium',
      impact: 'medium',
      mitigation: location.talentDensity === 'low' 
        ? 'Remote-first hiring, relocation packages, contractor relationships'
        : 'Competitive packages, culture building, internship programs'
    },
    {
      category: 'Technical',
      risk: 'Security vulnerabilities or smart contract risks',
      likelihood: 'medium',
      impact: 'critical',
      mitigation: 'Multiple security audits, bug bounty program, gradual feature rollout'
    }
  ]
  
  return {
    risks,
    overall: location.regulatoryClimate === 'strict' ? 'elevated' : 'moderate',
    recommendations: [
      'Conduct quarterly compliance reviews',
      'Maintain legal counsel retainer in your state',
      'Implement multi-signature security for all contracts',
      'Build with upgradeable contract architecture',
      'Diversify across multiple chains/protocols'
    ]
  }
}
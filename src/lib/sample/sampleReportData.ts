// src/lib/sample/sampleReportData.ts
import { 
  Scale, 
  Gavel, 
  Clock, 
  Landmark, 
  AlertTriangle,
  FileText,
  Users,
  Shield,
  TrendingUp,
  Target,
  Award
} from 'lucide-react'


const getRecentDate = (): string => {
    const now = new Date()
    const daysAgo = Math.floor(Math.random()*7)+1
    const reportDate = new Date(now)
    reportDate.setDate(now.getDate() - daysAgo)
    return reportDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })
}

export const sampleReportData = {
  company: {
    name: 'Innovate Financial Solutions',
    industry: 'Digital Asset Management',
    city: 'Austin',
    state: 'TX',
    date: getRecentDate(),
    locationTier: 'major',
    msa: 'Austin-Round Rock MSA',
    population: '2.2M',
    regulatoryClimate: 'friendly',
    primaryFocus: 'compliance',
    timeline: '6-months',
    concerns: 'We operate in 15 states and need clarity on licensing requirements across multiple jurisdictions. Regulatory enforcement actions keep us up at night.',
    goals: 'Obtain all necessary licenses, implement a comprehensive compliance monitoring system, and pass regulatory examinations with no findings.',
  },
  
  keyFindings: [
    {
      text: 'Texas maintains a business-friendly regulatory climate with no specific money transmitter license requirements',
      icon: 'Shield'
    },
    {
      text: 'Multi-state licensing requirements span 15+ jurisdictions with timelines ranging from 3-12 months',
      icon: 'Gavel'
    },
    {
      text: 'Critical compliance deadlines require immediate action within the next 30-90 days',
      icon: 'Clock'
    },
    {
      text: 'Moderate regulatory risk with primary concerns centered on multi-state licensing and enforcement preparedness',
      icon: 'AlertTriangle'
    },
  ],

  metrics: [
    { label: 'Regulatory Climate', value: 'Friendly', color: 'text-green-600' },
    { label: 'Risk Rating', value: 'Moderate', color: 'text-amber-600' },
    { label: 'Licenses Required', value: '15+ States', color: 'text-navy-900' },
  ],

  riskSummary: {
    text: 'Moderate regulatory risk based on current compliance posture. Primary concerns include multi-state licensing requirements and enforcement preparedness.',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    icon: 'AlertTriangle'
  },

  strategicFocus: {
    text: 'Prioritize license applications in Q2 while simultaneously building compliance infrastructure. Focus on regulatory compliance with secondary emphasis on risk management.',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: 'Target'
  },

  regulatoryAnalysis: {
    summary: 'Texas maintains a business-friendly regulatory environment with no specific money transmitter license requirements, though federal regulations apply. The Texas Department of Banking regulates money transmission activities and has taken enforcement actions against unlicensed operators.',
    requirements: [
      { type: 'Money Transmitter License', requirement: 'Not Required', timeline: '3-6 months' },
      { type: 'State Registration', requirement: 'Required', timeline: '1-2 months' },
      { type: 'AML Program', requirement: 'Mandatory', timeline: '2-3 months' },
    ],
    regulator: {
      name: 'Texas Department of Banking',
      phone: '(877) 276-5554',
      email: 'banking@texas.gov',
      website: 'www.dob.texas.gov'
    }
  },

  licensingMatrix: [
    { state: 'Texas', license: 'Money Services Business', timeline: '3-4 months', bonding: '$50,000', renewal: 'Annual' },
    { state: 'New York', license: 'BitLicense', timeline: '6-12 months', bonding: '$250,000', renewal: 'Biennial' },
    { state: 'California', license: 'DFPI License', timeline: '4-8 months', bonding: '$100,000', renewal: 'Annual' },
    { state: 'Florida', license: 'Money Transmitter', timeline: '3-6 months', bonding: '$75,000', renewal: 'Biennial' },
    { state: 'Illinois', license: 'Money Transmitter', timeline: '4-6 months', bonding: '$250,000', renewal: 'Annual' },
  ],

  applicationRequirements: [
    'Complete application forms',
    'Background checks for principals',
    'Audited financial statements',
    'Surety bonds as specified',
    'Designate compliance officer',
    'Written policies and procedures',
  ],

  compliancePhases: [
    {
      phase: 'Immediate (Days 1-30)',
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      items: [
        'Engage qualified compliance counsel',
        'Submit initial license applications',
        'Designate Chief Compliance Officer',
        'Draft compliance policies',
      ]
    },
    {
      phase: 'Short-Term (Days 31-90)',
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      items: [
        'Complete remaining license applications',
        'Implement transaction monitoring',
        'Conduct staff training',
        'Establish reporting protocols',
      ]
    },
    {
      phase: 'Ongoing (90+ Days)',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      items: [
        'Quarterly regulatory reporting',
        'Annual compliance audit',
        'Continuous employee training',
        'Regulatory change monitoring',
      ]
    }
  ],

  regulatorContacts: [
    { state: 'Texas', agency: 'Texas Department of Banking', phone: '(877) 276-5554' },
    { state: 'New York', agency: 'NYDFS', phone: '(212) 709-3500' },
    { state: 'California', agency: 'DFPI', phone: '(866) 275-2677' },
  ],

  legalCounsel: [
    { name: 'Perkins Coie LLP', specialty: 'Blockchain & Digital Assets', phone: '(212) 123-4567' },
    { name: 'Cooley LLP', specialty: 'FinTech Regulatory', phone: '(415) 123-4567' },
  ],

  technologyProviders: [
    { name: 'Chainalysis', specialty: 'Blockchain analytics' },
    { name: 'ComplyAdvantage', specialty: 'AML/KYC solutions' },
  ],

  riskMatrix: [
    { category: 'Regulatory Change', likelihood: 'High', impact: 'Critical', mitigation: 'Continuous monitoring' },
    { category: 'License Delays', likelihood: 'Medium', impact: 'High', mitigation: 'Early application' },
    { category: 'Enforcement Action', likelihood: 'Low', impact: 'Critical', mitigation: 'Proactive compliance' },
  ],

  overallRisk: {
    rating: 'Moderate',
    description: 'Prioritize licensing and monitoring systems with quarterly reviews. Maintain proactive relationships with regulators.'
  },

  features: [
    {
      icon: 'Scale',
      title: 'State-by-State Analysis',
      description: 'Comprehensive regulatory breakdown for every jurisdiction you operate in'
    },
    {
      icon: 'Gavel',
      title: 'Licensing Matrix',
      description: 'Clear roadmap of required licenses, fees, timelines, and renewal schedules'
    },
    {
      icon: 'Clock',
      title: 'Implementation Roadmap',
      description: '90-day action plan with immediate, short-term, and ongoing priorities'
    },
    {
      icon: 'Landmark',
      title: 'Regulator Contacts',
      description: 'Direct contacts at state banking departments and regulatory agencies'
    },
    {
      icon: 'AlertTriangle',
      title: 'Risk Assessment',
      description: 'Detailed analysis of regulatory risks with mitigation strategies'
    },
    {
      icon: 'Users',
      title: 'Compliance Talent',
      description: 'Recommendations for building your compliance team and finding expertise'
    },
  ],

  testimonials: [
    {
      name: 'Michael Chen',
      role: 'Chief Compliance Officer',
      company: 'CryptoVault Capital',
      content: 'Veridian Group delivered a 30-page report that saved us months of research. We identified licensing requirements we would have missed. Worth every penny.',
      rating: 5
    },
    {
      name: 'Sarah Williams',
      role: 'General Counsel',
      company: 'Blockchain Ventures LLC',
      content: 'The multi-state licensing matrix alone paid for itself 10x over. We used it to prioritize our expansion into 12 new states.',
      rating: 5
    },
    {
      name: 'David Rodriguez',
      role: 'Founder & CEO',
      company: 'Nexus Digital Assets',
      content: 'As a startup, we couldn\'t afford to miss compliance requirements. This report gave us confidence to launch across multiple states.',
      rating: 5
    },
  ],

  faqs: [
    {
      q: 'How is this different from hiring a law firm?',
      a: 'While law firms provide legal advice, our reports provide comprehensive regulatory intelligence across all 50 states. We aggregate and analyze state regulations, licensing requirements, and enforcement actions, saving you months of research. We always recommend reviewing our reports with qualified legal counsel.'
    },
    {
      q: 'How often is the data updated?',
      a: 'Our regulatory database is updated weekly to reflect new legislation, enforcement actions, and regulatory changes. When you purchase a report, you get the latest intelligence available.'
    },
    {
      q: 'What states are covered?',
      a: 'Every report includes analysis for all 50 states, with detailed licensing matrices for states where digital asset regulations exist. We prioritize states based on your operational footprint.'
    },
    {
      q: 'Can I get a sample before purchasing?',
      a: 'You\'re viewing a sample now! This preview shows the quality and depth of our analysis. Your personalized report will include your specific company information and target states.'
    },
  ],
}

// Helper function to get icon component by name
export const getIconByName = (iconName: string) => {
  const icons: Record<string, any> = {
    Scale, Gavel, Clock, Landmark, AlertTriangle, FileText, Users, Shield, TrendingUp, Target, Award
  }
  return icons[iconName] || FileText
}
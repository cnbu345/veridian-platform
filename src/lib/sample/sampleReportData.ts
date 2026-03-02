// src/lib/sample/sampleReportData.ts
// Sample report data for preview page

import { 
  Scale, Gavel, Clock, Landmark, AlertTriangle, FileText, 
  Building2, MapPin, Calendar, CheckCircle, Target, Shield,
  Award, TrendingUp, Users, Star, AlertCircle 
} from 'lucide-react'

// Get current date for dynamic dates
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1
const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1
const nextQuarterYear = currentQuarter === 4 ? currentYear + 1 : currentYear

export const sampleReportData = {
  company: {
    name: 'Apex Digital Assets LLC',
    industry: 'Digital Asset Investment Management',
    city: 'Austin',
    state: 'TX',
    date: currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    msa: 'Austin-Round Rock-San Marcos',
    population: '2.3M',
    regulatoryClimate: 'friendly',
    tier: 'major'
  },
  
  keyFindings: [
    { icon: 'Scale', text: 'Texas maintains business-friendly regulatory environment with no specific money transmitter license' },
    { icon: 'Gavel', text: 'Multi-state licensing requirements span 12+ jurisdictions including NY, CA, FL' },
    { icon: 'Clock', text: `Critical compliance deadlines require immediate action (Q${currentQuarter} ${currentYear})` },
    { icon: 'Shield', text: 'Moderate risk profile with focus on licensing and enforcement preparedness' }
  ],
  
  riskSummary: {
    icon: 'AlertTriangle',
    text: 'Moderate regulatory risk based on current compliance posture.',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800'
  },
  
  strategicFocus: {
    icon: 'Target',
    text: `Prioritize license applications in Q${nextQuarter} ${nextQuarterYear} while building compliance infrastructure.`,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  
  metrics: [
    { label: 'Climate', value: 'Friendly', color: 'text-green-600' },
    { label: 'Licenses', value: '12+', color: 'text-navy-900' },
    { label: 'Risk', value: 'Moderate', color: 'text-yellow-600' },
    { label: 'Timeline', value: '6 months', color: 'text-navy-900' },
    { label: 'Talent', value: 'High', color: 'text-navy-900' },
    { label: 'Market', value: 'Major', color: 'text-navy-900' }
  ],
  
  regulatoryAnalysis: {
    summary: 'Texas maintains a business-friendly regulatory environment with no specific money transmitter license requirements. The state follows a principles-based approach to digital asset regulation.',
    requirements: [
      { type: 'Money Transmitter', requirement: 'Not Required', timeline: 'N/A' },
      { type: 'State Registration', requirement: 'Required', timeline: '1-2 months' },
      { type: 'AML Program', requirement: 'Mandatory', timeline: '2-3 months' }
    ],
    regulator: {
      name: 'Texas Department of Banking',
      phone: '(877) 276-5554',
      email: 'info@dob.texas.gov',
      website: 'www.dob.texas.gov'
    }
  },
  
  licensingMatrix: [
    { state: 'TX', license: 'Money Services Business', timeline: '3-4 months', bonding: '$50,000', renewal: 'Annual' },
    { state: 'NY', license: 'BitLicense', timeline: '6-12 months', bonding: '$250,000', renewal: 'Biennial' },
    { state: 'CA', license: 'DFPI License', timeline: '4-8 months', bonding: '$100,000', renewal: 'Annual' },
    { state: 'FL', license: 'Money Transmitter', timeline: '3-6 months', bonding: '$75,000', renewal: 'Biennial' },
    { state: 'IL', license: 'Money Transmitter', timeline: '4-6 months', bonding: '$250,000', renewal: 'Annual' },
    { state: 'CO', license: 'Money Transmitter', timeline: '3-5 months', bonding: '$50,000', renewal: 'Annual' },
    { state: 'WA', license: 'Money Transmitter', timeline: '4-7 months', bonding: '$100,000', renewal: 'Annual' },
    { state: 'AZ', license: 'Money Transmitter', timeline: '3-5 months', bonding: '$50,000', renewal: 'Annual' }
  ],
  
  applicationRequirements: [
    'Complete application forms with business plans',
    'Fingerprint-based background checks for principals',
    'Audited financial statements',
    'Surety bonds as specified',
    'Designate compliance officer',
    'Written policies and procedures'
  ],
  
  compliancePhases: [
    {
      phase: 'Foundation',
      timeline: 'Days 1-30',
      color: 'bg-red-50',
      textColor: 'text-red-800',
      items: [
        'Engage qualified compliance counsel',
        'Submit initial license applications',
        'Designate Chief Compliance Officer',
        'Draft compliance policies',
        'Begin AML/KYC program development'
      ]
    },
    {
      phase: 'Licensing & Development',
      timeline: 'Days 31-60',
      color: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      items: [
        'Complete remaining license applications',
        'Finalize compliance policies',
        'Select compliance technology',
        'Implement transaction monitoring',
        'Establish reporting protocols'
      ]
    },
    {
      phase: 'Implementation',
      timeline: 'Days 61-90',
      color: 'bg-green-50',
      textColor: 'text-green-800',
      items: [
        'Complete license processing',
        'Full compliance system implementation',
        'Staff training completion',
        'Initial regulatory reporting',
        'Compliance audit preparation'
      ]
    },
    {
      phase: 'Optimization',
      timeline: 'Days 91-180',
      color: 'bg-blue-50',
      textColor: 'text-blue-800',
      items: [
        'Quarterly compliance reviews',
        'Regulatory relationship management',
        'Continuous improvement',
        'Expand to additional jurisdictions',
        'Ongoing monitoring & reporting'
      ]
    }
  ],
  
  regulatorContacts: [
    { state: 'TX', agency: 'Texas Department of Banking', phone: '(877) 276-5554' },
    { state: 'NY', agency: 'NYDFS', phone: '(212) 709-3500' },
    { state: 'CA', agency: 'DFPI', phone: '(866) 275-2677' },
    { state: 'FL', agency: 'Florida Office of Financial Regulation', phone: '(850) 487-9687' }
  ],
  
  legalCounsel: [
    { name: 'Perkins Coie LLP', specialty: 'Blockchain & Digital Assets', phone: '(212) 123-4567' },
    { name: 'Cooley LLP', specialty: 'FinTech Regulatory', phone: '(415) 123-4567' },
    { name: 'Baker Botts', specialty: 'Texas Blockchain Practice', phone: '(512) 123-4567' }
  ],
  
  technologyProviders: [
    { name: 'Chainalysis', specialty: 'Blockchain analytics & transaction monitoring' },
    { name: 'ComplyAdvantage', specialty: 'AML/KYC solutions & sanctions screening' },
    { name: 'Elliptic', specialty: 'Compliance screening & blockchain analytics' },
    { name: 'Trulioo', specialty: 'Identity verification & KYC' }
  ],
  
  riskMatrix: [
    { category: 'Regulatory Change', likelihood: 'High', impact: 'Critical', mitigation: 'Continuous monitoring' },
    { category: 'License Delays', likelihood: 'Medium', impact: 'High', mitigation: 'Early application' },
    { category: 'Enforcement Action', likelihood: 'Low', impact: 'Critical', mitigation: 'Proactive compliance' },
    { category: 'Examination Findings', likelihood: 'Medium', impact: 'High', mitigation: 'Regular audits' }
  ],
  
  overallRisk: {
    rating: 'Moderate',
    description: 'Prioritize licensing and monitoring systems with quarterly reviews'
  },
  
  features: [
    { icon: 'Scale', title: 'State-by-State Analysis', description: 'Detailed regulatory requirements for all 50 states' },
    { icon: 'Gavel', title: 'Licensing Matrix', description: 'Complete licensing requirements with timelines and bonding' },
    { icon: 'Clock', title: 'Compliance Roadmap', description: 'Step-by-step implementation timeline' },
    { icon: 'Landmark', title: 'Regulator Contacts', description: 'Direct contacts for state regulators' },
    { icon: 'AlertTriangle', title: 'Risk Assessment', description: 'Comprehensive risk analysis and mitigation' },
    { icon: 'Users', title: 'Service Providers', description: 'Qualified legal counsel and consultants' }
  ],
  
  testimonials: [
    { name: 'Sarah Chen', role: 'Chief Compliance Officer', company: 'Digital Asset Group', rating: 5, content: 'The most comprehensive regulatory intelligence I\'ve seen. Saved us months of research.' },
    { name: 'Michael Rodriguez', role: 'General Counsel', company: 'Crypto Wealth', rating: 5, content: 'Essential for any digital asset firm navigating multi-state compliance.' },
    { name: 'David Kim', role: 'CEO', company: 'Blockchain Ventures', rating: 5, content: 'The licensing matrix alone is worth 10x the price. Incredible value.' }
  ],
  
  faqs: [
    { q: 'How often is the data updated?', a: 'Our regulatory database is updated weekly with changes to state laws, licensing requirements, and enforcement actions.' },
    { q: 'Can I share this report with my legal counsel?', a: 'Yes, reports are designed to be shared with your legal team. We recommend reviewing all recommendations with qualified counsel.' },
    { q: 'What states are covered?', a: 'Our analysis covers all 50 states, with detailed licensing matrices for states with digital asset regulations.' }
  ]
}

// Helper function to get icon component by name
export function getIconByName(name: string) {
  const icons: Record<string, any> = {
    Scale, Gavel, Clock, Landmark, AlertTriangle, FileText,
    Building2, MapPin, Calendar, CheckCircle, Target, Shield,
    Award, TrendingUp, Users, Star, AlertCircle
  }
  return icons[name] || FileText
}
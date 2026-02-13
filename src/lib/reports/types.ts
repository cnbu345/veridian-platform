// Company information
export interface CompanyData {
  name: string
  website?: string
  industry: string
  size: '1-10' | '11-50' | '51-200' | '201-500' | '500+'
  budget: 'under-10k' | '10k-50k' | '50k-100k' | '100k-250k' | '250k-plus'
  founded?: string
  description?: string
}

// Location data
export interface LocationData {
  city: string
  state: string
  tier: 'major' | 'suburban' | 'rural'
  nearestMajorCity?: string
  nearestWeb3Hub?: string
  distanceToMajor?: number
  web3HubType?: 'primary' | 'secondary'
  msaName?: string
  population?: number
}

// Strategy focus areas
export interface StrategyFocus {
  primary: 'compliance' | 'talent' | 'fundraising' | 'product' | 'go-to-market' | 'partnerships'
  secondary: string[]
  timeline: '3-months' | '6-months' | '12-months'
  concerns: string
  goals: string
}

// Complete report request
export interface ReportRequest {
  company: CompanyData
  location: LocationData
  strategy: StrategyFocus
  userId: string
  paymentId?: string
  createdAt: string
}

// Generated report
export interface GeneratedReport {
  id: string
  userId: string
  companyName: string
  industry: string
  city: string
  state: string
  locationTier: string
  reportContent: {
    executive_summary: string
    location_analysis: any
    regulatory_analysis: any
    talent_analysis: any
    competitor_analysis: any
    implementation_roadmap: any
    resource_directory: any
    risk_assessment: any
    generated_at: string
  }
  pdfUrl?: string
  stripePaymentId?: string
  createdAt: string
  status: 'generating' | 'ready' | 'failed'
}

// Form step state
export interface FormStep {
  id: number
  name: string
  description: string
  isComplete: boolean
}
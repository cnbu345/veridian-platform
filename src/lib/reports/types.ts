// src/lib/reports/types.ts // Report type definitions
// Company information
export interface CompanyData {
  name: string
  website?: string
  industry: string
  size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000-plus'
  budget: 'under-50k' | '50k-100k' | '100k-250k' | '250k-500k' | '500k-plus'
  founded?: string
  description?: string
}

// Location data
export interface LocationData {
  city: string
  state: string
  tier: 'major' | 'suburban' | 'rural'
  nearestMajorCity?: string
  nearestRegulatoryHub?: string
  distanceToMajor?: number
  regulatoryHubType?: 'primary' | 'secondary'
  msaName?: string
  population?: number
  regulatoryClimate?: 'friendly' | 'moderate' | 'strict'
  licenseRequired?: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies'
}

// Strategy focus areas
export interface StrategyFocus {
  primary: 'compliance' | 'licensing' | 'risk' | 'monitoring' | 'talent' | 'strategy'
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
  user_id: string
  company_name: string
  industry: string
  city: string
  state: string
  location_tier: string
  nearest_major_city?: string
  report_content: {
    executive_summary: string
    location_analysis: any
    regulatory_analysis: any
    talent_analysis: any
    licensing_matrix: any
    compliance_roadmap: any
    regulatory_contacts: any
    risk_assessment: any
    generated_at: string
  }
  pdf_url?: string
  stripe_payment_id?: string
  created_at: string
  status: 'generating' | 'ready' | 'failed'
}

// Form step state
export interface FormStep {
  id: number
  name: string
  description: string
  isComplete: boolean
}
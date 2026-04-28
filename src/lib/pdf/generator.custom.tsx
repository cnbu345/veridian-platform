// src/lib/pdf/generator.custom.tsx
// Custom White-Label PDF Generator for Enterprise Templates
// UPDATED: Accepts licensing data, legislation data, and includes Quarterly Upsell

import React from 'react'
import { pdf, Document, Page, View, Text, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { GeneratedReport } from '@/lib/reports/types'
import { 
  buildReportData, 
  formatPrimaryFocus, 
  formatTimeline, 
  formatSecondaryFocus,
  formatCurrency,
  type ReportData 
} from '@/lib/reports/reportData'
import { getProvidersForLocation } from '@/lib/location/serviceProviders'
import { getLicensesForState, getAllStateLicenses } from '@/lib/location/licensingData'

// Interface for legislation bill data
interface LegislationBill {
  id: string
  billNumber: string
  title: string
  description: string | null
  status: string
  stateCode: string
  introducedDate: string | null
  lastActionDate: string | null
  lastAction: string | null
  progress: number
  relevanceScore: number
  category: string
  officialUrl: string | null
  summary: string | null
}

// Template interface
interface TemplateStyles {
  primary_color: string
  secondary_color: string
  font_family: string
  show_logo: boolean
  show_page_numbers: boolean
  show_footer?: boolean
}

interface TemplateSection {
  id: string
  name: string
  type: string
  is_visible: boolean
}

interface Template {
  id: string
  name: string
  description?: string
  logo_url: string | null
  styles: TemplateStyles
  sections: TemplateSection[]
  is_default?: boolean
}

// Helper to format money values
const formatMoney = (value: any): string => {
  if (value === undefined || value === null || value === '') return 'Varies'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num) || num === 0) return 'Varies'
  return `$${num.toLocaleString()}`
}

// Helper to format bond range
const formatBondRange = (min: any, max: any): string => {
  if (!min && !max) return 'Varies'
  const minNum = typeof min === 'string' ? parseFloat(min) : min
  const maxNum = typeof max === 'string' ? parseFloat(max) : max
  if (minNum && maxNum) {
    return minNum === maxNum ? formatMoney(minNum) : `${formatMoney(minNum)} - ${formatMoney(maxNum)}`
  }
  if (minNum) return formatMoney(minNum)
  if (maxNum) return formatMoney(maxNum)
  return 'Varies'
}

// Helper function for status colors
function getStatusColor(status: string): [number, number, number] {
  switch (status) {
    case 'Enacted':
      return [34, 197, 94] // green-500
    case 'Failed':
    case 'Vetoed':
      return [239, 68, 68] // red-500
    case 'Passed Chamber':
    case 'Passed':
      return [59, 130, 246] // blue-500
    case 'In Committee':
    case 'Introduced':
    case 'Pending':
      return [234, 179, 8] // yellow-500
    default:
      return [100, 116, 139] // slate-500
  }
}

// Register custom fonts
const registerCustomFonts = () => {
  try {
    Font.register({
      family: 'Inter',
      fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2' },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7W0Q5nw.woff2', fontWeight: 'bold' },
      ]
    })
    
    Font.register({
      family: 'Helvetica',
      fonts: [
        { src: 'https://fonts.cdnfonts.com/s/29107/Helvetica.woff' },
        { src: 'https://fonts.cdnfonts.com/s/29107/Helvetica-Bold.woff', fontWeight: 'bold' },
      ]
    })
    
    Font.register({
      family: 'Times-Roman',
      fonts: [
        { src: 'https://fonts.cdnfonts.com/s/29107/Times-New-Roman.woff' },
        { src: 'https://fonts.cdnfonts.com/s/29107/Times-New-Roman-Bold.woff', fontWeight: 'bold' },
      ]
    })
    
    Font.register({
      family: 'Georgia',
      fonts: [
        { src: 'https://fonts.cdnfonts.com/s/29107/Georgia.woff' },
        { src: 'https://fonts.cdnfonts.com/s/29107/Georgia-Bold.woff', fontWeight: 'bold' },
      ]
    })
    
    Font.register({
      family: 'Arial',
      fonts: [
        { src: 'https://fonts.cdnfonts.com/s/29107/Arial.woff' },
        { src: 'https://fonts.cdnfonts.com/s/29107/Arial-Bold.woff', fontWeight: 'bold' },
      ]
    })
  } catch (error) {
    console.warn('Font registration failed:', error)
  }
}

registerCustomFonts()

// Dynamic style generator based on template
const createDynamicStyles = (template: Template | null) => {
  const primaryColor = template?.styles?.primary_color || '#0A1A2F'
  const secondaryColor = template?.styles?.secondary_color || '#D4AF37'
  const fontFamily = template?.styles?.font_family === 'Times New Roman' ? 'Times-Roman' 
    : template?.styles?.font_family === 'Georgia' ? 'Georgia'
    : template?.styles?.font_family === 'Arial' ? 'Arial'
    : template?.styles?.font_family || 'Helvetica'
  
  return StyleSheet.create({
    page: {
      padding: 40,
      backgroundColor: '#FFFFFF',
      fontFamily,
    },
    content: {
      flex: 1,
    },
    
    mainTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: 15,
      borderBottomWidth: 2,
      borderBottomColor: secondaryColor,
      paddingBottom: 10,
      marginTop: -15,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: primaryColor,
      marginTop: 15,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
      paddingBottom: 6,
    },
    subsectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1E3A5F',
      marginTop: 12,
      marginBottom: 8,
    },
    normalText: {
      fontSize: 11,
      color: '#2C3E5A',
      lineHeight: 1.5,
      marginBottom: 8,
    },
    smallText: {
      fontSize: 9,
      color: '#64748B',
      lineHeight: 1.4,
    },
    
    highlightCard: {
      backgroundColor: '#F8FAFC',
      borderRadius: 8,
      padding: 15,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    goldCard: {
      backgroundColor: `${secondaryColor}15`,
      borderRadius: 8,
      padding: 15,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: secondaryColor,
    },
    navyCard: {
      backgroundColor: primaryColor,
      borderRadius: 8,
      padding: 20,
      marginVertical: 8,
    },
    clientInputCard: {
      backgroundColor: `${secondaryColor}20`,
      borderRadius: 8,
      padding: 15,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: secondaryColor,
    },
    
    grid2: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -5,
    },
    gridItem2: {
      width: '50%',
      paddingHorizontal: 5,
      marginBottom: 10,
    },
    grid3: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -5,
    },
    gridItem3: {
      width: '33.33%',
      paddingHorizontal: 5,
      marginBottom: 10,
    },
    grid4: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -5,
    },
    gridItem4: {
      width: '25%',
      paddingHorizontal: 5,
      marginBottom: 10,
    },
    
    metricBox: {
      backgroundColor: '#F8FAFC',
      borderRadius: 6,
      padding: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    metricLabel: {
      fontSize: 8,
      color: '#64748B',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: primaryColor,
    },
    
    table: {
      marginVertical: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 6,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#F1F5F9',
      borderBottomWidth: 1,
      borderBottomColor: '#CBD5E1',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
    },
    tableCell: {
      flex: 1,
      padding: 8,
      fontSize: 9,
      color: '#1E3A5F',
    },
    tableHeaderCell: {
      flex: 1,
      padding: 8,
      fontSize: 9,
      fontWeight: 'bold',
      color: primaryColor,
      backgroundColor: '#F1F5F9',
    },
    
    bulletPoint: {
      flexDirection: 'row',
      marginBottom: 5,
      paddingLeft: 8,
    },
    bullet: {
      width: 4,
      height: 4,
      backgroundColor: secondaryColor,
      borderRadius: 2,
      marginRight: 8,
      marginTop: 6,
    },
    bulletText: {
      flex: 1,
      fontSize: 10,
      color: '#2C3E5A',
      lineHeight: 1.4,
    },
    
    contactCard: {
      backgroundColor: '#F8FAFC',
      borderRadius: 6,
      padding: 10,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    contactName: {
      fontSize: 11,
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: 2,
    },
    contactDetail: {
      fontSize: 9,
      color: '#4A5B6E',
      marginBottom: 1,
    },
    contactSpecialty: {
      fontSize: 8,
      color: secondaryColor,
      marginBottom: 2,
      fontStyle: 'italic',
    },
    
    riskTable: {
      marginVertical: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 6,
      overflow: 'hidden',
    },
    riskHeader: {
      flexDirection: 'row',
      backgroundColor: '#F1F5F9',
      borderBottomWidth: 1,
      borderBottomColor: '#CBD5E1',
    },
    riskRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
    },
    riskCell: {
      flex: 1,
      padding: 8,
      fontSize: 9,
      color: '#1E3A5F',
    },
    riskHeaderCell: {
      flex: 1,
      padding: 8,
      fontSize: 9,
      fontWeight: 'bold',
      color: primaryColor,
    },
    
    likelihoodHigh: { color: '#991B1B', fontWeight: 'bold' },
    likelihoodMedium: { color: '#854D0E', fontWeight: 'bold' },
    likelihoodLow: { color: '#166534', fontWeight: 'bold' },
    impactCritical: { color: '#991B1B', fontWeight: 'bold' },
    impactHigh: { color: '#B45309', fontWeight: 'bold' },
    impactMedium: { color: '#854D0E', fontWeight: 'bold' },
    
    budgetTable: {
      marginVertical: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 6,
      overflow: 'hidden',
    },
    budgetRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
    },
    budgetCell: {
      padding: 8,
      fontSize: 9,
      color: '#1E3A5F',
    },
    
    divider: {
      height: 1,
      backgroundColor: '#E2E8F0',
      marginVertical: 12,
    },
    
    phaseCard: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: secondaryColor,
    },
    phaseTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      color: primaryColor,
    },
    phaseTimeline: {
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 8,
      color: secondaryColor,
    },
    
    whiteText: { color: 'white' },
    goldText: { color: secondaryColor },
    
    financialCard: {
      backgroundColor: '#F8FAFC',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    financialLabel: {
      fontSize: 8,
      color: '#64748B',
      textTransform: 'uppercase' as const,
      marginBottom: 2,
    },
    financialValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: 2,
    },
    financialSubtext: {
      fontSize: 7,
      color: '#94A3B8',
    },
    verifiedFactCard: {
      backgroundColor: '#F0FDF4',
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: '#BBF7D0',
    },
    // Quarterly Upsell styles
    quarterlyUpsellCard: {
      backgroundColor: '#FDF9E7',
      borderRadius: 8,
      padding: 20,
      marginVertical: 15,
      borderWidth: 2,
      borderColor: '#EAB308',
    },
    quarterlyUpsellTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#854D0E',
      marginBottom: 10,
    },
    quarterlyUpsellText: {
      fontSize: 11,
      color: '#78350F',
      marginBottom: 15,
      lineHeight: 1.5,
    },
    quarterlyUpsellFeatures: {
      flexDirection: 'row',
      marginBottom: 15,
    },
    quarterlyUpsellFeature: {
      flex: 1,
      fontSize: 10,
      fontWeight: 'bold',
      color: '#92400E',
    },
    quarterlyUpsellCTA: {
      backgroundColor: secondaryColor,
      borderRadius: 6,
      padding: 12,
      textAlign: 'center',
    },
    quarterlyUpsellCTAText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
    },
    inlineUpsellCard: {
      backgroundColor: '#FFFBEB',
      borderColor: '#FDE68A',
      marginTop: 12,
    },
  })
}

// Determine which sections are visible based on template
const getVisibleSections = (template: Template | null): Record<string, boolean> => {
  if (!template || !template.sections || template.sections.length === 0) {
    return {
      showExecutiveSummary: true,
      showClientInput: true,
      showMarketAnalysis: true,
      showRegulatoryAnalysis: true,
      showLicensingMatrix: true,
      showComplianceRoadmap: true,
      showTechnologyTools: true,
      showRegulatoryResources: true,
      showRiskAssessment: true,
      showBudgetGuide: true,
      showNextSteps: true,
    }
  }
  
  const visibleMap: Record<string, boolean> = {
    showExecutiveSummary: false,
    showClientInput: false,
    showMarketAnalysis: false,
    showRegulatoryAnalysis: false,
    showLicensingMatrix: false,
    showComplianceRoadmap: false,
    showTechnologyTools: false,
    showRegulatoryResources: false,
    showRiskAssessment: false,
    showBudgetGuide: false,
    showNextSteps: false,
  }
  
  template.sections.forEach(section => {
    if (section.is_visible) {
      switch (section.type) {
        case 'executive_summary': visibleMap.showExecutiveSummary = true; break
        case 'client_input': visibleMap.showClientInput = true; break
        case 'market_analysis': visibleMap.showMarketAnalysis = true; break
        case 'regulatory_analysis': visibleMap.showRegulatoryAnalysis = true; break
        case 'multi_state_licensing': visibleMap.showLicensingMatrix = true; break
        case 'compliance_roadmap': visibleMap.showComplianceRoadmap = true; break
        case 'technology_tools': visibleMap.showTechnologyTools = true; break
        case 'regulatory_resources': visibleMap.showRegulatoryResources = true; break
        case 'risk_assessment': visibleMap.showRiskAssessment = true; break
        case 'budget_guide': visibleMap.showBudgetGuide = true; break
        case 'next_steps': visibleMap.showNextSteps = true; break
      }
    }
  })
  
  return visibleMap
}

// Helper function to parse secondary focus with proper cleaning
const parseSecondaryFocus = (content: any): string[] => {
  const cleanItem = (item: any): string => {
    if (item === null || item === undefined) return ''
    let str = String(item)
    str = str.replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim()
    str = str.replace(/^["']+|["']+$/g, '').trim()
    return str
  }
  
  const processValue = (value: any): string[] => {
    if (!value) return []
    
    if (Array.isArray(value)) {
      return value.map(cleanItem).filter(Boolean)
    }
    
    if (typeof value === 'string') {
      const trimmed = value.trim()
      
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            return parsed.map(cleanItem).filter(Boolean)
          }
        } catch (e) {
          // Continue to other methods
        }
      }
      
      if (trimmed.includes(',')) {
        return trimmed.split(',').map(cleanItem).filter(Boolean)
      }
      
      const cleaned = cleanItem(trimmed)
      return cleaned ? [cleaned] : []
    }
    
    return []
  }
  
  let result: string[] = []
  
  if (content.secondaryFocus) {
    result = processValue(content.secondaryFocus)
  } else if (content.strategy_focus?.secondary) {
    result = processValue(content.strategy_focus.secondary)
  }
  
  return result
    .map(item => {
      let cleaned = item.replace(/[\[\]"']/g, '').trim()
      cleaned = cleaned.replace(/\b\w/g, char => char.toUpperCase())
      return cleaned
    })
    .filter((item, index, self) => item && self.indexOf(item) === index)
}

// Format license type helper
function formatLicenseType(licenseType: string): string {
  const types: Record<string, string> = {
    'mtl': 'Money Transmitter License',
    'bitlicense': 'BitLicense',
    'dfpi': 'DFPI License',
    'none': 'No License Required',
    'varies': 'Varies by Activity'
  }
  return types[licenseType] || licenseType?.toUpperCase() || 'Money Transmitter License'
}

// Page number component to avoid JSX increment issues
const PageNumber = ({ currentPage, totalPages, styles }: { currentPage: number; totalPages: number; styles: any }) => (
  <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
    Page {currentPage} of {totalPages}
  </Text>
)

// Main Custom Report Document Component
const CustomReportDocument = ({ 
  report, 
  template,
  licensingData: passedLicensingData,
  legislationData
}: { 
  report: GeneratedReport
  template: Template
  licensingData?: any
  legislationData?: LegislationBill[] | null
}) => {
  const styles = createDynamicStyles(template)
  const content = report.report_content || {}
  const createdDate = report.created_at ? new Date(report.created_at) : new Date()
  const visibleSections = getVisibleSections(template)
  
  // USE PASSED LICENSING DATA FIRST, then fall back to report_content
  const licensingData = passedLicensingData || content.licensing_data || {}
  
  // Check if user is subscribed - show upsell for non-subscribers
  const showQuarterlyUpsell = !report.subscription_tier || report.subscription_tier === 'single'
  
  console.log('🎨 Custom PDF Generator - licensingData received:', {
    hasLicensingData: !!passedLicensingData,
    application_fee: licensingData.application_fee,
    annual_renewal_fee: licensingData.annual_renewal_fee,
    bond_min: licensingData.bond_requirement_min,
    bond_max: licensingData.bond_requirement_max,
    net_worth: licensingData.net_worth_requirement,
    showQuarterlyUpsell,
    hasLegislationData: !!legislationData,
    legislationCount: legislationData?.length || 0
  })
  
  // Check if multi-state
  const secondaryStates = content.secondaryStates || []
  const isMultiState = secondaryStates.length > 0
  
  // Get multi-state licensing data if available
  const multiStateLicensingData = content.multi_state_licensing_data || []
  
  // Parse secondary focus
  const secondaryFocus = parseSecondaryFocus(content)
  
  // Build report data with defensive try-catch
  const reportData = (() => {
    try {
      return buildReportData(
        {
          name: report.company_name || 'Company',
          industry: report.industry || 'Financial Services',
          size: content.company?.size || '1-10',
          budget: content.company?.budget || 'under-50k',
        },
        {
          city: report.city || '',
          state: report.state || '',
          tier: (report.location_tier as any) || 'major',
          nearestRegulatoryHub: report.nearest_major_city || '',
          regulatoryClimate: licensingData.regulatory_climate || content.regulatory_analysis?.climate || 'moderate',
          licenseRequired: licensingData.license_required || (content.licensing_matrix?.licenses?.[0]?.required ? 'mtl' : 'varies'),
          talentDensity: 'moderate',
          msaName: null,
          msaPopulation: null,
          distanceToMajor: null,
          nearestMajorCity: report.nearest_major_city || null,
        },
        {
          primary: content.strategy_focus?.primary || content.primaryFocus || 'compliance',
          secondary: secondaryFocus,
          timeline: content.strategy_focus?.timeline || content.timeline || '6-months',
          concerns: content.concerns || 'No specific concerns provided.',
          goals: content.goals || 'No specific goals provided.',
        },
        {
          aiGeneratedContent: content.content,
          verifiedFacts: content.facts_used || [],
          enforcementHistory: content.enforcement_history,
          pendingLegislation: content.pending_legislation,
        }
      )
    } catch (error) {
      console.error('Error building report data for custom PDF:', error)
      // Return fallback data structure (same as before)
      return {
        location: { tier: 'major', regulatoryClimate: licensingData.regulatory_climate || 'moderate' },
        marketAnalysis: { 
          tier: 'Major', 
          description: 'Market analysis in progress.',
          growthRate: 12,
          competitorDensity: 'Medium',
          opportunityScore: 75,
          keyIndustries: ['FinTech', 'Banking']
        },
        talentAnalysis: {
          talentScore: 65,
          talentRank: 'medium',
          totalProfessionals: 1250,
          avgSalary: 95000,
          hiringStrategy: 'Hybrid approach recommended',
          topChannels: ['LinkedIn', 'Industry Job Boards', 'Recruitment Firms'],
          timeToHire: '4-6 weeks',
          growthRate: '8%'
        },
        strategy: {
          primary: 'compliance',
          secondary: secondaryFocus,
          timeline: '6-months',
          concerns: 'No specific concerns provided.',
          goals: 'No specific goals provided.'
        },
        metrics: [
          { label: 'Licenses Required', value: '2-4', color: 'text-white' },
          { label: 'Regulatory Climate', value: licensingData.regulatory_climate === 'friendly' ? 'Friendly' : licensingData.regulatory_climate === 'strict' ? 'Strict' : 'Moderate', color: 'text-white' },
          { label: 'Risk Level', value: 'Moderate', color: 'text-white' }
        ],
        overallRisk: 'Moderate',
        licenses: [],
        multiStateLicenses: [],
        providers: { 
          regulator: { 
            name: licensingData.regulator_name || 'State Banking Department', 
            phone: licensingData.regulator_phone || 'Check state website', 
            email: licensingData.regulator_email || 'Check state website', 
            specialty: 'Digital asset regulation' 
          },
          legalCounsel: [],
          consultants: [],
          techProviders: [],
          associations: []
        },
        compliancePhases: [
          { phase: 'Phase 1: Foundation', timeline: 'Weeks 1-4', items: ['Engage legal counsel', 'Begin license applications', 'Establish compliance policies'] },
          { phase: 'Phase 2: Implementation', timeline: 'Weeks 5-8', items: ['Implement monitoring systems', 'Conduct staff training', 'File remaining applications'] },
          { phase: 'Phase 3: Optimization', timeline: 'Weeks 9-12', items: ['Audit compliance program', 'Address regulator feedback', 'Establish ongoing monitoring'] }
        ],
        techRecommendations: [
          { category: 'Compliance Management', recommendations: [{ name: 'ComplyAdvantage', description: 'AML screening and monitoring', implementationTime: '2-3 weeks', priceRange: '$$$' }] },
          { category: 'Transaction Monitoring', recommendations: [{ name: 'Chainalysis', description: 'Blockchain analytics', implementationTime: '1-2 weeks', priceRange: '$$$' }] }
        ],
        risks: [
          { category: 'Regulatory Change', likelihood: 'Medium', impact: 'High', mitigation: 'Monitor legislative updates' },
          { category: 'Licensing Delays', likelihood: 'Medium', impact: 'Medium', mitigation: 'Submit early, follow up regularly' },
          { category: 'Compliance Gaps', likelihood: 'Low', impact: 'High', mitigation: 'Regular audits and training' }
        ],
        budgetGuide: { 
          breakdown: [
            { category: 'Licensing Fees', amount: formatMoney(licensingData.application_fee) || '$5,000 - $25,000', notes: 'Varies by state' },
            { category: 'Legal Counsel', amount: '$10,000 - $30,000', notes: 'Initial setup and filings' }
          ], 
          totalEstimated: { min: 50000, max: 150000 } 
        },
        nextSteps: { 
          immediate: ['Schedule call with legal counsel', 'Begin documentation', 'Review state requirements'],
          shortTerm: ['Submit license applications', 'Implement monitoring tools', 'Conduct staff training'],
          ongoing: ['Annual renewals', 'Quarterly reviews', 'Transaction monitoring'],
          complianceCalendar: [] 
        },
        stateRegulation: { 
          applicationFee: formatMoney(licensingData.application_fee), 
          bondRequirement: formatBondRange(licensingData.bond_requirement_min, licensingData.bond_requirement_max), 
          processingTime: licensingData.processing_time_description || '3-6 months',
          notes: licensingData.notes || 'Check with state regulator'
        },
        verifiedFacts: content.facts_used || []
      } as any
    }
  })()
  
  // Get providers with fallback
  const providers = (() => {
    try {
      return getProvidersForLocation(report.city || '', report.state || '', reportData.location?.tier || 'major')
    } catch {
      return { 
        regulator: { 
          name: licensingData.regulator_name || 'State Banking Department', 
          phone: licensingData.regulator_phone || 'Check state website', 
          email: licensingData.regulator_email || 'Check state website', 
          specialty: 'Digital asset regulation' 
        },
        legalCounsel: [],
        consultants: [],
        techProviders: [],
        associations: []
      }
    }
  })()
  
  // Build license display from licensing data
  const licenses = (() => {
    if (licensingData.license_required && licensingData.license_required !== 'none') {
      return [{
        licenseType: licensingData.license_name || formatLicenseType(licensingData.license_required),
        required: true,
        timeline: licensingData.processing_time_description || `${licensingData.processing_time_min_months}-${licensingData.processing_time_max_months} months`,
        fees: formatMoney(licensingData.application_fee),
      }]
    }
    try {
      return getLicensesForState(report.state || '') || []
    } catch {
      return []
    }
  })()
  
  // Build multi-state licenses from the actual data
  const multiStateLicenses = (() => {
    if (isMultiState && multiStateLicensingData.length > 0) {
      return multiStateLicensingData.map((item: any) => ({
        state: item.state_code,
        licenseType: item.license_name || formatLicenseType(item.license_required),
        timeline: item.processing_time_description || `${item.processing_time_min_months}-${item.processing_time_max_months} months`,
        bonding: formatBondRange(item.bond_requirement_min, item.bond_requirement_max),
        renewal: item.annual_renewal_fee ? 'Annual' : 'Varies',
        climate: item.regulatory_climate || 'moderate'
      }))
    }
    // Fallback for single state
    if (licensingData.license_required) {
      return [{
        state: report.state,
        licenseType: licensingData.license_name || formatLicenseType(licensingData.license_required),
        timeline: licensingData.processing_time_description || `${licensingData.processing_time_min_months}-${licensingData.processing_time_max_months} months`,
        bonding: formatBondRange(licensingData.bond_requirement_min, licensingData.bond_requirement_max),
        renewal: licensingData.annual_renewal_fee ? 'Annual' : 'Varies',
        climate: licensingData.regulatory_climate || 'moderate'
      }]
    }
    try {
      return getAllStateLicenses(15)
    } catch {
      return []
    }
  })()
  
  // Calculate total pages dynamically
  const visibleCount = Object.values(visibleSections).filter(v => v).length
  // Base pages: Cover (1) + visible sections + Disclaimer (1)
  // Add 1 for Quarterly Upsell page if shown
  const upsellPageCount = showQuarterlyUpsell ? 1 : 0
  const totalPages = 1 + visibleCount + upsellPageCount + 1
  
  let pageNumber = 1
  
  const getRiskStyle = (likelihood: string) => {
    switch(likelihood) {
      case 'High': return styles.likelihoodHigh
      case 'Medium': return styles.likelihoodMedium
      case 'Low': return styles.likelihoodLow
      default: return {}
    }
  }
  
  const getImpactStyle = (impact: string) => {
    switch(impact) {
      case 'Critical': return styles.impactCritical
      case 'High': return styles.impactHigh
      case 'Medium': return styles.impactMedium
      default: return {}
    }
  }
  
  // Safe access helpers
  const locationTier = reportData.location?.tier || 'major'
  const regulatoryClimate = licensingData.regulatory_climate || reportData.location?.regulatoryClimate || 'moderate'
  const climateDisplay = regulatoryClimate === 'friendly' ? 'Friendly' : regulatoryClimate === 'strict' ? 'Strict' : 'Moderate'
  const marketData = reportData.marketAnalysis || { tier: 'Major', description: 'Market analysis in progress.', growthRate: 12, opportunityScore: 75 }
  const budgetData = reportData.budgetGuide || { breakdown: [], totalEstimated: { min: 50000, max: 150000 } }
  const nextStepsData = reportData.nextSteps || { immediate: [], shortTerm: [], ongoing: [] }
  const verifiedFacts = reportData.verifiedFacts || []
  
  const applicationFee = formatMoney(licensingData.application_fee)
  const annualRenewalFee = formatMoney(licensingData.annual_renewal_fee)
  const bondRequirement = formatBondRange(licensingData.bond_requirement_min, licensingData.bond_requirement_max)
  const netWorth = formatMoney(licensingData.net_worth_requirement)
  const processingTime = licensingData.processing_time_description || 
    (licensingData.processing_time_min_months && licensingData.processing_time_max_months 
      ? `${licensingData.processing_time_min_months}-${licensingData.processing_time_max_months} months` 
      : '3-6 months')
  
  return (
    <Document>
      {/* Custom Cover Page */}
      <Page size="LETTER" style={styles.page}>
        <View style={[styles.navyCard, { minHeight: '100%', justifyContent: 'center' }]}>
          {template.styles?.show_logo !== false && template.logo_url && (
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
              <Image src={template.logo_url} style={{ height: 80, objectFit: 'contain' }} />
            </View>
          )}
          
          <Text style={[styles.whiteText, { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }]}>
            Regulatory Intelligence Report
          </Text>
          
          <Text style={[styles.goldText, { fontSize: 18, textAlign: 'center', marginBottom: 40 }]}>
            {report.company_name || 'Company'}
          </Text>
          
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={[styles.whiteText, { fontSize: 14, opacity: 0.9, marginBottom: 5 }]}>
              {report.city || ''}, {report.state || ''}
            </Text>
            <Text style={[styles.whiteText, { fontSize: 12, opacity: 0.7 }]}>
              {format(createdDate, 'MMMM d, yyyy')}
            </Text>
          </View>
        </View>
        
        {template.styles?.show_page_numbers !== false && (
          <PageNumber currentPage={pageNumber} totalPages={totalPages} styles={styles} />
        )}
      </Page>
      
      {/* Executive Summary - Only if visible */}
      {visibleSections.showExecutiveSummary && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Executive Summary</Text>
            
            <View style={[styles.navyCard]}>
              <Text style={[styles.whiteText, { fontSize: 20, fontWeight: 'bold' }]}>
                {report.company_name || 'Company'}
              </Text>
              <Text style={[styles.whiteText, { opacity: 0.8, marginTop: 5 }]}>
                {report.city || ''}, {report.state || ''}
              </Text>
            </View>
            
            {/* Financial Requirements Summary - FROM LICENSING DATA */}
            {licensingData.application_fee && (
              <View style={[styles.highlightCard, { marginTop: 15 }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
                  Financial Requirements Summary
                </Text>
                <View style={styles.grid4}>
                  <View style={styles.gridItem4}>
                    <Text style={styles.financialLabel}>Application Fee</Text>
                    <Text style={styles.financialValue}>{applicationFee}</Text>
                  </View>
                  <View style={styles.gridItem4}>
                    <Text style={styles.financialLabel}>Annual Renewal</Text>
                    <Text style={styles.financialValue}>{annualRenewalFee}</Text>
                  </View>
                  <View style={styles.gridItem4}>
                    <Text style={styles.financialLabel}>Bond Requirement</Text>
                    <Text style={styles.financialValue}>{bondRequirement}</Text>
                  </View>
                  <View style={styles.gridItem4}>
                    <Text style={styles.financialLabel}>Net Worth</Text>
                    <Text style={styles.financialValue}>{netWorth}</Text>
                  </View>
                </View>
              </View>
            )}
            
            {visibleSections.showClientInput && (
              <View style={[styles.clientInputCard, { marginTop: 15 }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: template.styles?.secondary_color || '#D4AF37' }]}>
                  Your Compliance Request
                </Text>
                <Text style={styles.normalText}>
                  <Text style={{ fontWeight: 'bold' }}>Primary Focus: </Text>
                  {formatPrimaryFocus(reportData.strategy?.primary || 'compliance')}
                </Text>
                <Text style={styles.normalText}>
                  <Text style={{ fontWeight: 'bold' }}>Timeline: </Text>
                  {formatTimeline(reportData.strategy?.timeline || '6-months')}
                </Text>
                {reportData.strategy?.secondary && reportData.strategy.secondary.length > 0 && (
                  <Text style={styles.normalText}>
                    <Text style={{ fontWeight: 'bold' }}>Secondary Focus: </Text>
                    {reportData.strategy.secondary.map((f: string) => formatSecondaryFocus(f)).join(', ')}
                  </Text>
                )}
              </View>
            )}
            
            {verifiedFacts.length > 0 && (
              <View style={[styles.verifiedFactCard, { marginTop: 15 }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: '#166534', marginBottom: 5 }]}>
                  Verified Regulatory Facts ({verifiedFacts.length})
                </Text>
                {verifiedFacts.slice(0, 3).map((fact: any, idx: number) => (
                  <View key={idx} style={{ marginBottom: 5 }}>
                    <Text style={[styles.smallText, { fontWeight: 'bold' }]}>• {fact.claim}</Text>
                    {fact.source_name && (
                      <Text style={[styles.smallText, { color: template.styles?.secondary_color || '#D4AF37', fontSize: 7, marginLeft: 12 }]}>
                        Source: {fact.source_name}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            
            <Text style={styles.subsectionTitle}>Key Findings</Text>
            <View>
              {[
                `${report.state || 'Your state'} maintains a ${climateDisplay.toLowerCase()} regulatory climate`,
                `${isMultiState ? `Multi-state licensing requirements span ${multiStateLicenses.length} jurisdictions` : 'Single-state licensing applies'}`,
                `Critical compliance deadlines require immediate action (30-90 days)`,
                `${reportData.overallRisk || 'Moderate'} risk based on current compliance posture`
              ].map((text, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{text}</Text>
                </View>
              ))}
            </View>
            
            {/* Inline Upsell after Key Findings */}
            {showQuarterlyUpsell && (
              <View style={[styles.highlightCard, styles.inlineUpsellCard]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E', marginBottom: 4 }]}>
                  ⚡ Stay Ahead of Regulatory Changes
                </Text>
                <Text style={[styles.smallText, { marginBottom: 6 }]}>
                  Regulations in {report.state} change frequently. Quarterly Intelligence subscribers receive 
                  automatic updates and renewal alerts—never miss a critical deadline again.
                </Text>
                <Text style={[styles.smallText, { color: template.styles?.secondary_color || '#D4AF37' }]}>
                  Upgrade to Quarterly Intelligence for $5,997/year (Save $1,000)
                </Text>
              </View>
            )}
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Market & Talent Analysis */}
      {visibleSections.showMarketAnalysis && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Market & Talent Analysis</Text>
            
            <View style={styles.highlightCard}>
              <Text style={[styles.normalText, { fontWeight: 'bold' }]}>
                Market Overview: {marketData.tier}
              </Text>
              <Text style={styles.smallText}>{marketData.description}</Text>
              
              <View style={styles.grid2}>
                <View style={styles.gridItem2}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Growth Rate</Text>
                    <Text style={styles.metricValue}>{marketData.growthRate}%</Text>
                  </View>
                </View>
                <View style={styles.gridItem2}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Opportunity Score</Text>
                    <Text style={styles.metricValue}>{marketData.opportunityScore}/100</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={[styles.highlightCard, { marginTop: 15 }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold' }]}>
                Talent Analysis: {reportData.talentAnalysis?.talentRank === 'high' ? 'High Density' : reportData.talentAnalysis?.talentRank === 'medium' ? 'Medium Density' : 'Developing'}
              </Text>
              <View style={styles.grid2}>
                <View style={styles.gridItem2}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Talent Score</Text>
                    <Text style={styles.metricValue}>{reportData.talentAnalysis?.talentScore || 65}/100</Text>
                  </View>
                </View>
                <View style={styles.gridItem2}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Avg. Salary</Text>
                    <Text style={styles.metricValue}>{formatCurrency(reportData.talentAnalysis?.avgSalary || 95000)}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Regulatory Analysis */}
      {visibleSections.showRegulatoryAnalysis && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Regulatory Analysis: {report.state || 'State'}</Text>
            
            <View style={[styles.grid2, { marginBottom: 15 }]}>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Regulatory Climate</Text>
                  <Text style={styles.metricValue}>{climateDisplay}</Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Primary License</Text>
                  <Text style={[styles.smallText, { fontWeight: 'bold' }]}>
                    {licenses.length > 0 ? licenses[0].licenseType : 'Money Transmitter License'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* License Description from database */}
            {licensingData.license_description && (
              <View style={[styles.highlightCard, { marginBottom: 15 }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>License Description</Text>
                <Text style={styles.smallText}>{licensingData.license_description}</Text>
              </View>
            )}
            
            <Text style={styles.subsectionTitle}>Licensing Requirements</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>License Type</Text>
                <Text style={styles.tableHeaderCell}>Requirement</Text>
                <Text style={styles.tableHeaderCell}>Timeline</Text>
                <Text style={styles.tableHeaderCell}>Fee</Text>
              </View>
              {licenses.slice(0, 4).map((license: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{license.licenseType}</Text>
                  <Text style={styles.tableCell}>{license.required ? 'Required' : 'May be required'}</Text>
                  <Text style={styles.tableCell}>{license.timeline}</Text>
                  <Text style={styles.tableCell}>{license.fees || formatMoney(licensingData.application_fee) || '$500 - $5,000'}</Text>
                </View>
              ))}
            </View>
            
            {/* Regulator Contact from licensing data */}
            <View style={[styles.highlightCard, { marginTop: 15 }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>Regulator Contact</Text>
              <Text style={styles.normalText}>{licensingData.regulator_name || providers?.regulator?.name || 'State Banking Department'}</Text>
              <Text style={styles.smallText}>Phone: {licensingData.regulator_phone || providers?.regulator?.phone || 'Check state website'}</Text>
              <Text style={styles.smallText}>Email: {licensingData.regulator_email || providers?.regulator?.email || 'Check state website'}</Text>
              {licensingData.regulator_website && (
                <Text style={[styles.smallText, { color: template.styles?.secondary_color || '#D4AF37', marginTop: 4 }]}>
                  Website: {licensingData.regulator_website}
                </Text>
              )}
            </View>
            
            {/* Important Notes from database */}
            {licensingData.notes && (
              <View style={[styles.highlightCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', marginTop: 15 }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E', marginBottom: 5 }]}>
                  Important Notes
                </Text>
                <Text style={[styles.smallText, { color: '#78350F' }]}>{licensingData.notes}</Text>
              </View>
            )}

            {/* Active Legislation Table */}
            {legislationData && legislationData.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                  Active Legislation - {report?.state || 'State'}
                </Text>
                
                {/* Table headers */}
                <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                  <Text style={[styles.smallText, { fontWeight: 'bold', width: '15%' }]}>Bill</Text>
                  <Text style={[styles.smallText, { fontWeight: 'bold', width: '45%' }]}>Title</Text>
                  <Text style={[styles.smallText, { fontWeight: 'bold', width: '20%' }]}>Status</Text>
                  <Text style={[styles.smallText, { fontWeight: 'bold', width: '20%' }]}>Relevance</Text>
                </View>
                
                {/* Divider line */}
                <View style={{ height: 1, backgroundColor: '#CBD5E1', marginBottom: 8 }} />
                
                {/* Table rows */}
                {legislationData.slice(0, 8).map((bill: LegislationBill, index: number) => {
                  const statusColor = getStatusColor(bill.status)
                  const relevancePercent = bill.relevanceScore || 50
                  const filledBars = Math.floor(relevancePercent / 20)
                  const emptyBars = 5 - filledBars
                  const relevanceBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars)
                  
                  return (
                    <View key={bill.id} style={{ flexDirection: 'row', marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                      <Text style={[styles.smallText, { width: '15%' }]}>{bill.billNumber}</Text>
                      <Text style={[styles.smallText, { width: '45%' }]}>
                        {bill.title.length > 45 ? bill.title.substring(0, 42) + '...' : bill.title}
                      </Text>
                      <Text style={[styles.smallText, { width: '20%', color: `rgb(${statusColor[0]}, ${statusColor[1]}, ${statusColor[2]})` }]}>
                        {bill.status}
                      </Text>
                      <Text style={[styles.smallText, { width: '20%' }]}>
                        {relevanceBar} {relevancePercent}%
                      </Text>
                    </View>
                  )
                })}
                
                {/* If there are more bills */}
                {legislationData.length > 8 && (
                  <Text style={[styles.smallText, { marginTop: 8, color: '#64748B' }]}>
                    +{legislationData.length - 8} more bills tracked for {report?.state}
                  </Text>
                )}
                
                {/* Footer note */}
                <Text style={[styles.smallText, { marginTop: 12, color: '#94A3B8', fontSize: 7 }]}>
                  Legislation data provided by LegiScan • Updated daily
                </Text>
              </>
            )}
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Multi-State Licensing Matrix */}
      {visibleSections.showLicensingMatrix && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>
              {isMultiState ? 'Multi-State Licensing Matrix' : 'Licensing Requirements Matrix'}
            </Text>
            
            <Text style={[styles.smallText, { marginBottom: 10 }]}>
              {isMultiState 
                ? `Requirements across ${multiStateLicenses.length} jurisdictions` 
                : `Detailed requirements for ${report.state || 'your state'}`}
            </Text>
            
            {/* Financial Summary Cards */}
            <View style={[styles.grid4, { marginBottom: 15 }]}>
              <View style={styles.gridItem4}>
                <View style={styles.financialCard}>
                  <Text style={styles.financialLabel}>Application Fee</Text>
                  <Text style={styles.financialValue}>{applicationFee}</Text>
                </View>
              </View>
              <View style={styles.gridItem4}>
                <View style={styles.financialCard}>
                  <Text style={styles.financialLabel}>Annual Renewal</Text>
                  <Text style={styles.financialValue}>{annualRenewalFee}</Text>
                </View>
              </View>
              <View style={styles.gridItem4}>
                <View style={styles.financialCard}>
                  <Text style={styles.financialLabel}>Bond Requirement</Text>
                  <Text style={styles.financialValue}>{bondRequirement}</Text>
                </View>
              </View>
              <View style={styles.gridItem4}>
                <View style={styles.financialCard}>
                  <Text style={styles.financialLabel}>Net Worth</Text>
                  <Text style={styles.financialValue}>{netWorth}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>State</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>License Type</Text>
                <Text style={styles.tableHeaderCell}>Application Fee</Text>
                <Text style={styles.tableHeaderCell}>Timeline</Text>
                <Text style={styles.tableHeaderCell}>Bonding</Text>
                <Text style={styles.tableHeaderCell}>Renewal</Text>
              </View>
              {multiStateLicenses.length > 0 ? (
                multiStateLicenses.slice(0, 10).map((item: any, i: number) => {
                  // Get the actual licensing data for this state if multi-state
                  const stateData = isMultiState 
                    ? multiStateLicensingData.find((d: any) => d.state_code === item.state) || {}
                    : licensingData
                  
                  const appFee = stateData.application_fee ? `$${Number(stateData.application_fee).toLocaleString()}` : 'Varies'
                  const timeline = stateData.processing_time_description || 
                    (stateData.processing_time_min_months && stateData.processing_time_max_months 
                      ? `${stateData.processing_time_min_months}-${stateData.processing_time_max_months} months` 
                      : item.timeline || '3-6 months')
                  const bonding = stateData.bond_requirement_min && stateData.bond_requirement_max
                    ? (stateData.bond_requirement_min === stateData.bond_requirement_max 
                        ? `$${Number(stateData.bond_requirement_min).toLocaleString()}`
                        : `$${Number(stateData.bond_requirement_min).toLocaleString()} - $${Number(stateData.bond_requirement_max).toLocaleString()}`)
                    : item.bonding || 'Varies'
                  const renewal = stateData.annual_renewal_fee ? 'Annual' : (item.renewal || 'Annual')
                  
                  return (
                    <View key={i} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 1.2 }]}>
                        {item.state}
                        {!isMultiState && <Text style={{ color: template.styles?.secondary_color || '#D4AF37', fontSize: 7 }}> (Primary)</Text>}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.5 }]}>
                        {stateData.license_name || item.licenseType || 'Money Transmitter License'}
                      </Text>
                      <Text style={styles.tableCell}>{appFee}</Text>
                      <Text style={styles.tableCell}>{timeline}</Text>
                      <Text style={styles.tableCell}>{bonding}</Text>
                      <Text style={styles.tableCell}>{renewal}</Text>
                    </View>
                  )
                })
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', padding: 20 }]}>
                    {licensingData.license_required ? (
                      <Text>
                        <Text style={{ fontWeight: 'bold' }}>{licensingData.license_name || formatLicenseType(licensingData.license_required)}</Text>
                        {' - '}
                        <Text>Fee: {applicationFee}</Text>
                      </Text>
                    ) : 'Loading license data...'}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Source Verification */}
            {(licensingData.source_name || licensingData.source_url) && (
              <View style={[styles.highlightCard, { marginTop: 15, backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: '#166534', marginBottom: 5 }]}>
                  Source Verification
                </Text>
                {licensingData.source_name && (
                  <Text style={styles.smallText}>Source: {licensingData.source_name}</Text>
                )}
                {licensingData.source_url && (
                  <Text style={[styles.smallText, { color: template.styles?.secondary_color || '#D4AF37' }]}>URL: {licensingData.source_url}</Text>
                )}
                {licensingData.last_reviewed_at && (
                  <Text style={styles.smallText}>Last Reviewed: {new Date(licensingData.last_reviewed_at).toLocaleDateString()}</Text>
                )}
                {licensingData.verification_status === 'verified' && (
                  <Text style={[styles.smallText, { color: '#166534', marginTop: 4 }]}>✓ Verified Information</Text>
                )}
              </View>
            )}
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Compliance Roadmap */}
      {visibleSections.showComplianceRoadmap && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Compliance Implementation Roadmap</Text>
            
            {(reportData.compliancePhases || []).map((phase: any, index: number) => (
              <View key={index} style={styles.phaseCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.phaseTitle}>{phase.phase}</Text>
                  <Text style={styles.phaseTimeline}>{phase.timeline}</Text>
                </View>
                <View style={styles.grid2}>
                  {(phase.items || []).slice(0, 4).map((activity: string, idx: number) => (
                    <View key={idx} style={styles.gridItem2}>
                      <View style={styles.bulletPoint}>
                        <View style={styles.bullet} />
                        <Text style={[styles.bulletText, { fontSize: 8 }]}>{activity}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Technology & Tools */}
      {visibleSections.showTechnologyTools && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Technology & Compliance Tools</Text>
            
            {(reportData.techRecommendations || []).map((category: any, catIndex: number) => (
              <View key={catIndex} style={styles.highlightCard}>
                <Text style={[styles.normalText, { fontWeight: 'bold' }]}>{category.category}</Text>
                {(category.recommendations || []).slice(0, 2).map((rec: any, recIndex: number) => (
                  <View key={recIndex} style={{ marginBottom: 10 }}>
                    <Text style={[styles.contactName]}>{rec.name}</Text>
                    <Text style={styles.smallText}>{rec.description}</Text>
                    <Text style={[styles.smallText, { color: template.styles?.secondary_color || '#D4AF37' }]}>
                      {rec.priceRange}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Regulatory Resources */}
      {visibleSections.showRegulatoryResources && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Regulatory Resources</Text>
            
            <Text style={styles.subsectionTitle}>State Regulator</Text>
            <View style={styles.contactCard}>
              <Text style={styles.contactName}>{licensingData.regulator_name || providers.regulator?.name || 'State Banking Department'}</Text>
              <Text style={styles.contactDetail}>Phone: {licensingData.regulator_phone || providers.regulator?.phone || 'Check state website'}</Text>
              <Text style={styles.contactDetail}>Email: {licensingData.regulator_email || providers.regulator?.email || 'Check state website'}</Text>
              {licensingData.regulator_website && (
                <Text style={[styles.contactDetail, { color: template.styles?.secondary_color || '#D4AF37' }]}>
                  Website: {licensingData.regulator_website}
                </Text>
              )}
            </View>
            
            <Text style={styles.subsectionTitle}>Qualified Legal Counsel</Text>
            {(providers.legalCounsel || []).slice(0, 2).map((counsel: any, index: number) => (
              <View key={index} style={styles.contactCard}>
                <Text style={styles.contactName}>{counsel.name}</Text>
                <Text style={styles.contactDetail}>{counsel.phone}</Text>
                <Text style={styles.contactSpecialty}>{counsel.specialty}</Text>
              </View>
            ))}
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Risk Assessment */}
      {visibleSections.showRiskAssessment && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Risk Assessment</Text>
            
            <View style={styles.riskTable}>
              <View style={styles.riskHeader}>
                <Text style={styles.riskHeaderCell}>Risk Category</Text>
                <Text style={styles.riskHeaderCell}>Likelihood</Text>
                <Text style={styles.riskHeaderCell}>Impact</Text>
                <Text style={[styles.riskHeaderCell, { flex: 1.5 }]}>Mitigation</Text>
              </View>
              {(reportData.risks || []).slice(0, 4).map((risk: any, index: number) => (
                <View key={index} style={styles.riskRow}>
                  <Text style={styles.riskCell}>{risk.category}</Text>
                  <Text style={[styles.riskCell, getRiskStyle(risk.likelihood)]}>{risk.likelihood}</Text>
                  <Text style={[styles.riskCell, getImpactStyle(risk.impact)]}>{risk.impact}</Text>
                  <Text style={[styles.riskCell, { flex: 1.5 }]}>{risk.mitigation}</Text>
                </View>
              ))}
            </View>
            
            <View style={[styles.goldCard, { marginTop: 15 }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold' }]}>
                Overall Risk Rating: {reportData.overallRisk || 'Moderate'}
              </Text>
            </View>
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Budget Guide */}
      {visibleSections.showBudgetGuide && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Budget & Investment Guide</Text>
            
            <View style={styles.budgetTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Category</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Estimated Cost</Text>
              </View>
              {(budgetData.breakdown || []).slice(0, 6).map((item: any, index: number) => (
                <View key={index} style={styles.budgetRow}>
                  <Text style={[styles.budgetCell, { flex: 2 }]}>{item.category}</Text>
                  <Text style={[styles.budgetCell, { flex: 1.5, color: template.styles?.secondary_color || '#D4AF37', fontWeight: 'bold' }]}>
                    {item.amount}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={[styles.navyCard]}>
              <Text style={[styles.whiteText, { fontWeight: 'bold' }]}>Total Estimated Investment</Text>
              <Text style={[styles.goldText, { fontSize: 20, fontWeight: 'bold' }]}>
                {formatCurrency(budgetData.totalEstimated?.min || 50000)} - {formatCurrency(budgetData.totalEstimated?.max || 150000)}
              </Text>
            </View>
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Next Steps */}
      {visibleSections.showNextSteps && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Next Steps & Ongoing Compliance</Text>
            
            <View style={styles.grid2}>
              <View style={styles.gridItem2}>
                <View style={[styles.goldCard]}>
                  <Text style={[styles.normalText, { fontWeight: 'bold', color: template.styles?.secondary_color || '#D4AF37' }]}>
                    Immediate (Next 7 Days)
                  </Text>
                  {(nextStepsData.immediate || []).slice(0, 3).map((step: string, index: number) => (
                    <View key={index} style={styles.bulletPoint}>
                      <View style={styles.bullet} />
                      <Text style={[styles.bulletText, { fontSize: 8 }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.gridItem2}>
                <View style={[styles.goldCard]}>
                  <Text style={[styles.normalText, { fontWeight: 'bold', color: template.styles?.secondary_color || '#D4AF37' }]}>
                    Short-Term (30-90 Days)
                  </Text>
                  {(nextStepsData.shortTerm || []).slice(0, 3).map((step: string, index: number) => (
                    <View key={index} style={styles.bulletPoint}>
                      <View style={styles.bullet} />
                      <Text style={[styles.bulletText, { fontSize: 8 }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={[styles.highlightCard, { marginTop: 15 }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold' }]}>Ongoing Obligations</Text>
              {(nextStepsData.ongoing || []).slice(0, 3).map((item: string, index: number) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Quarterly Intelligence Upsell Page - Only for non-subscribers */}
      {showQuarterlyUpsell && (() => {
        const currentPageNum = ++pageNumber
        return (
          <Page size="LETTER" style={styles.page}>
            <Text style={styles.mainTitle}>Stay Compliant Year-Round</Text>
            
            <View style={styles.quarterlyUpsellCard}>
              <Text style={styles.quarterlyUpsellTitle}>
                🔔 Never Miss a Regulatory Change
              </Text>
              
              <Text style={styles.quarterlyUpsellText}>
                Regulations change quarterly. Our Quarterly Intelligence service provides automatic 
                compliance updates, renewal reminders, and expert strategy calls to keep your 
                organization ahead of regulatory changes.
              </Text>
              
              <View style={styles.quarterlyUpsellFeatures}>
                <Text style={styles.quarterlyUpsellFeature}>✓ Quarterly Reports</Text>
                <Text style={styles.quarterlyUpsellFeature}>✓ Email Alerts</Text>
                <Text style={styles.quarterlyUpsellFeature}>✓ Strategy Calls</Text>
              </View>
              
              <View style={[styles.highlightCard, { backgroundColor: '#FFFBEB' }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
                  What You Get with Quarterly Intelligence:
                </Text>
                <View style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold' }}>4 Comprehensive Reports Per Year </Text>
                    - Updated compliance analysis delivered quarterly
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold' }}>Regulatory Change Alerts </Text>
                    - Email notifications when state laws change
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold' }}>2 Strategy Sessions Annually </Text>
                    - $1,000 value included with subscription
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>
                    <Text style={{ fontWeight: 'bold' }}>Priority Support </Text>
                    - Direct access to compliance specialists
                  </Text>
                </View>
              </View>
              
              <View style={[styles.grid2, { marginTop: 15 }]}>
                <View style={styles.gridItem2}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.smallText, { color: '#64748B' }]}>Investment</Text>
                    <Text style={[styles.normalText, { fontSize: 24, fontWeight: 'bold', color: template.styles?.primary_color || '#0A1A2F' }]}>
                      $5,997/year
                    </Text>
                    <Text style={[styles.smallText, { color: template.styles?.secondary_color || '#D4AF37' }]}>
                      Founder's Pricing (Save $1,000)
                    </Text>
                  </View>
                </View>
                <View style={styles.gridItem2}>
                  <View style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <View style={styles.quarterlyUpsellCTA}>
                      <Text style={styles.quarterlyUpsellCTAText}>
                        Upgrade to Quarterly Intelligence →
                      </Text>
                    </View>
                    <Text style={[styles.smallText, { marginTop: 8, textAlign: 'center' }]}>
                      Visit veridiangroup.com/upgrade or contact your account manager
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={[styles.goldCard, { marginTop: 15 }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>
                Why Compliance Officers Choose Quarterly Monitoring
              </Text>
              <Text style={styles.smallText}>
                "In 2025 alone, 47 states introduced new digital asset legislation. Quarterly Intelligence 
                helped our clients stay compliant through over 200 regulatory changes without missing a single deadline."
              </Text>
              <Text style={[styles.smallText, { marginTop: 8, fontStyle: 'italic' }]}>
                — Veridian Group Compliance Team
              </Text>
            </View>
            
            {template.styles?.show_page_numbers !== false && (
              <PageNumber currentPage={currentPageNum} totalPages={totalPages} styles={styles} />
            )}
          </Page>
        )
      })()}
      
      {/* Disclaimer Page */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.content}>
          <View style={[styles.goldCard]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', textAlign: 'center' }]}>
              IMPORTANT LEGAL DISCLAIMER
            </Text>
          </View>
          
          <Text style={styles.normalText}>
            This Regulatory Intelligence Report has been prepared by Veridian Group for the exclusive use of {report.company_name || 'Company'}. 
            Veridian Group is not a law firm. This Report does not constitute legal advice.
          </Text>
          
          <Text style={styles.normalText}>
            All compliance recommendations should be reviewed with qualified legal counsel in {report.state || 'your state'}  
            before implementation. Regulations are subject to change without notice.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={[styles.smallText, { textAlign: 'center' }]}>
            © {new Date().getFullYear()} Veridian Group. All rights reserved.
          </Text>
          <Text style={[styles.smallText, { textAlign: 'center' }]}>
            Report ID: {report.id}
          </Text>
          {licensingData.source_name && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 5 }]}>
              Data Source: {licensingData.source_name}
            </Text>
          )}
          <Text style={[styles.smallText, { textAlign: 'center', marginTop: 10 }]}>
            Template: {template.name}
          </Text>
        </View>
        
        {template.styles?.show_page_numbers !== false && (
          <PageNumber currentPage={totalPages} totalPages={totalPages} styles={styles} />
        )}
      </Page>
    </Document>
  )
}

// Export custom generator functions - NOW ACCEPTS LICENSING DATA AND LEGISLATION DATA
export async function generateCustomReportPDF(
  report: GeneratedReport, 
  template: Template,
  licensingData?: any,
  legislationData?: LegislationBill[] | null
): Promise<Blob> {
  try {
    if (!report || !report.id || !report.company_name) {
      throw new Error('Invalid report data')
    }
    
    if (!template || !template.id) {
      throw new Error('Template required for custom PDF generation')
    }
    
    console.log('🎨 Generating custom PDF with template:', template.name,
      licensingData ? '(with licensing data)' : '(no licensing data)',
      legislationData ? `(with ${legislationData.length} legislation bills)` : '(no legislation data)'
    )
    
    const blob = await pdf(
      <CustomReportDocument 
        report={report} 
        template={template} 
        licensingData={licensingData}
        legislationData={legislationData}
      />
    ).toBlob()
    
    console.log('✅ Custom PDF generated successfully, size:', blob.size, 'bytes')
    return blob
  } catch (error) {
    console.error('Custom PDF generation error:', error)
    throw new Error('Failed to generate custom PDF')
  }
}
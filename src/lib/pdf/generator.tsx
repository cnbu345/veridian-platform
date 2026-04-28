// src/lib/pdf/generator.tsx
// Professional PDF Generator - Standard Veridian Template
// UPDATED: Accepts licensing data for accurate financial display
// UPDATED: Added legislation data support

import React from 'react'
import { pdf, Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'
import { PDFHeader } from './components/PDFHeader'
import { PDFFooter } from './components/PDFFooter'
import { PDFCover } from './components/PDFCover'
import { GeneratedReport } from '@/lib/reports/types'
import { format } from 'date-fns'
import { 
  formatPrimaryFocus, 
  formatTimeline, 
  formatSecondaryFocus,
  formatCurrency,
  type ReportData 
} from '@/lib/reports/reportData'
import { getProvidersForLocation } from '@/lib/location/serviceProviders'
import { getLicensesForState, getAllStateLicenses } from '@/lib/location/licensingData'

// Register fonts
try {
  Font.register({
    family: 'Helvetica',
    fonts: [
      { src: 'https://fonts.cdnfonts.com/s/29107/Helvetica.woff' },
      { src: 'https://fonts.cdnfonts.com/s/29107/Helvetica-Bold.woff', fontWeight: 'bold' },
    ]
  })
} catch (error) {
  console.warn('Font registration failed:', error)
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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  content: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A1A2F',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
    paddingBottom: 10,
    marginTop: -15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A1A2F',
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
    backgroundColor: '#FDF9E7',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  navyCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 8,
    padding: 20,
    marginVertical: 8,
  },
  clientInputCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A1A2F',
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
    color: '#0A1A2F',
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
    backgroundColor: '#D4AF37',
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
    color: '#0A1A2F',
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 9,
    color: '#4A5B6E',
    marginBottom: 1,
  },
  contactSpecialty: {
    fontSize: 8,
    color: '#D4AF37',
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
    color: '#0A1A2F',
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
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0A1A2F',
  },
  phaseTimeline: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#D4AF37',
  },
  whiteText: { color: 'white' },
  goldText: { color: '#D4AF37' },
  navy300Text: { color: '#94A3B8' },
  italicText: { fontStyle: 'italic' },
  riskSummaryCard: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  strategicFocusCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  verifiedFactCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
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
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A1A2F',
    marginBottom: 2,
  },
  financialSubtext: {
    fontSize: 7,
    color: '#94A3B8',
  },
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
    backgroundColor: '#D4AF37',
    borderRadius: 6,
    padding: 12,
    textAlign: 'center',
  },
  quarterlyUpsellCTAText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
})

// Generate the PDF document component
const ReportDocument = ({ 
  report, 
  reportData: prebuiltData,
  licensingData: passedLicensingData,
  legislationData
}: { 
  report: GeneratedReport
  reportData?: ReportData
  licensingData?: any
  legislationData?: LegislationBill[] | null
}) => {
  const content = report.report_content || {}
  const createdDate = report.created_at ? new Date(report.created_at) : new Date()
  
  // USE PASSED LICENSING DATA FIRST, then fall back to report_content
  const licensingData = passedLicensingData || content.licensing_data || {}
  
  console.log('📄 PDF Generator - licensingData received:', {
    hasLicensingData: !!passedLicensingData,
    application_fee: licensingData.application_fee,
    annual_renewal_fee: licensingData.annual_renewal_fee,
    bond_min: licensingData.bond_requirement_min,
    bond_max: licensingData.bond_requirement_max,
    net_worth: licensingData.net_worth_requirement
  })
  
  // Check if multi-state
  const secondaryStates = content.secondaryStates || []
  const isMultiState = secondaryStates.length > 0
  const allStates = isMultiState ? [report.state, ...secondaryStates].filter(Boolean) : [report.state].filter(Boolean)
  
  // Get multi-state licensing data if available
  const multiStateLicensingData = content.multi_state_licensing_data || []
  
  // Use prebuilt data if provided
  const reportData: ReportData = prebuiltData || (content._cachedReportData as ReportData) || {
    location: { tier: 'major', regulatoryClimate: licensingData.regulatory_climate || 'moderate' },
    marketAnalysis: { tier: 'Major', description: '', growthRate: 0, competitorDensity: '', opportunityScore: 0, keyIndustries: [] },
    talentAnalysis: { talentScore: 0, talentRank: 'medium', totalProfessionals: 0, avgSalary: 0, hiringStrategy: '', topChannels: [], timeToHire: '', growthRate: '' },
    strategy: { primary: 'compliance', secondary: [], timeline: '6-months', concerns: '', goals: '' },
    metrics: [],
    overallRisk: 'Moderate',
    licenses: [],
    multiStateLicenses: [],
    providers: { regulator: { name: licensingData.regulator_name || '', phone: licensingData.regulator_phone || '', email: licensingData.regulator_email || '', specialty: '' }, legalCounsel: [], consultants: [], techProviders: [], associations: [] },
    compliancePhases: [],
    techRecommendations: [],
    risks: [],
    budgetGuide: { breakdown: [], totalEstimated: { min: 0, max: 0 } },
    nextSteps: { immediate: [], shortTerm: [], ongoing: [], complianceCalendar: [] },
    stateRegulation: { 
      applicationFee: formatMoney(licensingData.application_fee), 
      bondRequirement: formatBondRange(licensingData.bond_requirement_min, licensingData.bond_requirement_max), 
      processingTime: licensingData.processing_time_description || '3-6 months' 
    },
    aiGeneratedContent: '',
    verifiedFacts: [],
    enforcementHistory: '',
    pendingLegislation: ''
  } as ReportData
  
  const locationData = reportData.location || { tier: 'major', regulatoryClimate: licensingData.regulatory_climate || 'moderate' }
  const regulatoryClimate = licensingData.regulatory_climate || locationData.regulatoryClimate || 'moderate'
  const climateDisplay = regulatoryClimate === 'friendly' ? 'Friendly' : regulatoryClimate === 'strict' ? 'Strict' : 'Moderate'
  
  const metrics = reportData.metrics || []
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
  const verifiedFacts = reportData.verifiedFacts || []
  const enforcementHistory = reportData.enforcementHistory || content.enforcement_history
  const pendingLegislation = reportData.pendingLegislation || content.pending_legislation
  const aiContent = reportData.aiGeneratedContent || content.content

  // DYNAMIC PAGE COUNT - Base pages: Cover (1) + 10 content pages + Disclaimer (1) = 12
  // Add 1 more if showing Quarterly Upsell page
  const showQuarterlyUpsellPage = !report.subscription_tier || report.subscription_tier === 'single'
  const BASE_CONTENT_PAGES = 10
  const TOTAL_CONTENT_PAGES = showQuarterlyUpsellPage ? BASE_CONTENT_PAGES + 1 : BASE_CONTENT_PAGES
  const TOTAL_PAGES = TOTAL_CONTENT_PAGES + 2 // +1 for cover, +1 for disclaimer

  // Get providers
  const providers = (() => {
    try {
      return getProvidersForLocation(report.city || '', report.state || '', locationData.tier || 'major')
    } catch {
      return reportData.providers || { regulator: { name: licensingData.regulator_name || 'State Banking Department', phone: licensingData.regulator_phone || '', email: licensingData.regulator_email || '', specialty: '' } }
    }
  })()

  // Build license display
  const licenses = (() => {
    if (licensingData.license_required && licensingData.license_required !== 'none') {
      return [{
        licenseType: licensingData.license_name || 'Money Transmitter License',
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
    // Ultimate fallback
    try {
      return getAllStateLicenses(15)
    } catch {
      return reportData.multiStateLicenses || []
    }
  })()

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
      {/* Cover Page */}
      <Page size="LETTER" style={styles.page}>
        <PDFCover 
          companyName={report.company_name || 'Company'}
          city={report.city || ''}
          state={report.state || ''}
          date={createdDate}
          reportId={report.id}
        />
      </Page>

      {/* PAGE 1: Executive Summary */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Executive Summary</Text>
          
          {aiContent && typeof aiContent === 'string' && (
            <View style={[styles.goldCard, { marginBottom: 15 }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: '#D4AF37', marginBottom: 5 }]}>
                AI-Generated Regulatory Analysis
              </Text>
              <Text style={[styles.smallText, { fontSize: 9 }]}>
                {aiContent.substring(0, 800)}{aiContent.length > 800 ? '...' : ''}
              </Text>
            </View>
          )}
          
          {/* Company Overview Card */}
          <View style={styles.navyCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <View>
                <Text style={[styles.smallText, { color: '#D4AF37' }]}>INSTITUTION PROFILE</Text>
                <Text style={[styles.normalText, { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 5 }]}>
                  {report.company_name || 'Company'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <Text style={[styles.smallText, { color: '#94A3B8' }]}>{report.city || ''}, {report.state || ''}</Text>
                  <Text style={[styles.smallText, { color: '#94A3B8' }]}>{report.industry || 'Financial Services'}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 8 }}>
                <Text style={[styles.smallText, { color: '#94A3B8' }]}>Report Date</Text>
                <Text style={[styles.normalText, { color: '#D4AF37', fontWeight: 'bold' }]}>
                  {format(createdDate, 'MMMM d, yyyy')}
                </Text>
              </View>
            </View>
            
            <View style={styles.grid3}>
              {metrics.slice(0, 6).map((metric: any, index: number) => (
                <View key={index} style={styles.gridItem3}>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 10 }}>
                    <Text style={[styles.smallText, { color: '#94A3B8' }]}>{metric.label}</Text>
                    <Text style={[styles.normalText, { 
                      color: metric.color?.includes('green') ? '#4ADE80' : 
                             metric.color?.includes('red') ? '#F87171' : 
                             metric.color?.includes('yellow') ? '#FBBF24' : 'white', 
                      fontSize: String(metric.value).length > 20 ? 11 : 16, 
                      fontWeight: 'bold',
                      marginBottom: 0
                    }]}>
                      {metric.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          {/* Client's Specific Input Card */}
          <View style={styles.clientInputCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8, fontSize: 14, color: '#92400E' }]}>
              Your Custom Compliance Request
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 15, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>PRIMARY FOCUS</Text>
                <Text style={[styles.normalText, { marginBottom: 0 }]}>
                  {formatPrimaryFocus(reportData.strategy?.primary || 'compliance')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>TIMELINE</Text>
                <Text style={[styles.normalText, { marginBottom: 0 }]}>
                  {formatTimeline(reportData.strategy?.timeline || '6-months')}
                </Text>
              </View>
            </View>
            
            {reportData.strategy?.secondary && reportData.strategy.secondary.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>
                  SECONDARY FOCUS ({reportData.strategy.secondary.length} areas)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                  {reportData.strategy.secondary.map((focus: string, index: number) => (
                    <View key={index} style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                      <View style={[styles.bullet, { backgroundColor: '#92400E', marginRight: 5 }]} />
                      <Text style={[styles.bulletText, { fontSize: 9, marginBottom: 0 }]}>
                        {formatSecondaryFocus(focus)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              {reportData.strategy?.concerns && reportData.strategy.concerns !== 'No specific concerns provided.' && (
                <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 6, padding: 8 }}>
                  <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>YOUR CONCERNS</Text>
                  <Text style={[styles.smallText, { fontStyle: 'italic' }]}>
                    "{reportData.strategy.concerns.substring(0, 150)}{reportData.strategy.concerns.length > 150 ? '...' : ''}"
                  </Text>
                </View>
              )}
              {reportData.strategy?.goals && reportData.strategy.goals !== 'No specific goals provided.' && (
                <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 6, padding: 8 }}>
                  <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>YOUR GOALS</Text>
                  <Text style={[styles.smallText, { fontStyle: 'italic' }]}>
                    "{reportData.strategy.goals.substring(0, 150)}{reportData.strategy.goals.length > 150 ? '...' : ''}"
                  </Text>
                </View>
              )}
            </View>
            
            <View style={{ marginTop: 5, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#D4AF37' }}>
              <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>
                ✓ HOW THIS REPORT ADDRESSES YOUR NEEDS
              </Text>
              <Text style={[styles.smallText, { fontSize: 8 }]}>
                Tailored to your {formatPrimaryFocus(reportData.strategy?.primary || 'compliance').toLowerCase()} priorities 
                within your {formatTimeline(reportData.strategy?.timeline || '6-months').toLowerCase()}.
              </Text>
            </View>
          </View>
          
          {/* Financial Requirements Summary - FROM LICENSING DATA */}
          {licensingData.application_fee && (
            <View style={styles.highlightCard}>
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
          
          {verifiedFacts.length > 0 && (
            <View style={styles.verifiedFactCard}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: '#166534', marginBottom: 5 }]}>
                Verified Regulatory Facts ({verifiedFacts.length})
              </Text>
              {verifiedFacts.slice(0, 3).map((fact: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 5 }}>
                  <Text style={[styles.smallText, { fontWeight: 'bold' }]}>• {fact.claim}</Text>
                  {fact.source_name && (
                    <Text style={[styles.smallText, { color: '#D4AF37', fontSize: 7, marginLeft: 12 }]}>
                      Source: {fact.source_name}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
          
          {/* Strategic Overview */}
          <View style={styles.goldCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>Strategic Overview</Text>
            <Text style={[styles.normalText, { fontSize: 10, marginBottom: 0 }]}>
              This comprehensive regulatory intelligence report provides detailed compliance analysis for {report.company_name || 'Company'} in {report.city || ''}, {report.state || ''}. 
              Key requirements include {applicationFee} application fee, {bondRequirement} bond requirement, 
              and {processingTime} processing time.
            </Text>
          </View>
          
          {/* Key Findings */}
          <Text style={styles.subsectionTitle}>Key Findings</Text>
          <View>
            {[
              `${report.state || 'Your state'} maintains a ${climateDisplay.toLowerCase()} regulatory climate`,
              `${isMultiState ? 'Multi-state' : 'Single-state'} licensing applies`,
              `Critical compliance deadlines require immediate action (30-90 days)`,
              `${reportData.overallRisk || 'Moderate'} risk based on current compliance posture`
            ].map((text, index) => (
              <View key={index} style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={[styles.bulletText]}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Strategic upsell after key findings */}
          {showQuarterlyUpsellPage && (
            <View style={[styles.highlightCard, { 
              backgroundColor: '#FFFBEB', 
              borderColor: '#FDE68A',
              marginTop: 12 
            }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E', marginBottom: 4 }]}>
                 Stay Ahead of Regulatory Changes
              </Text>
              <Text style={[styles.smallText, { marginBottom: 6 }]}>
                Regulations in {report.state} change frequently. Quarterly Intelligence subscribers receive 
                automatic updates and renewal alerts—never miss a critical deadline again.
              </Text>
              <Text style={[styles.smallText, { color: '#D4AF37' }]}>
                Upgrade to Quarterly Intelligence for $5,997/year (Save $1,000)
              </Text>
            </View>
          )}
          
          {/* Risk and Strategy Cards */}
          <View style={styles.grid2}>
            <View style={[styles.riskSummaryCard, { 
              backgroundColor: reportData.overallRisk === 'Elevated' ? '#FEF2F2' : reportData.overallRisk === 'Low' ? '#F0FDF4' : '#FFFBEB',
              borderWidth: 1,
              borderColor: reportData.overallRisk === 'Elevated' ? '#FECACA' : reportData.overallRisk === 'Low' ? '#BBF7D0' : '#FDE68A'
            }]}>
              <Text style={[styles.normalText, { 
                fontWeight: 'bold', 
                color: reportData.overallRisk === 'Elevated' ? '#991B1B' : reportData.overallRisk === 'Low' ? '#166534' : '#92400E',
                marginBottom: 4
              }]}>
                Risk Summary
              </Text>
              <Text style={[styles.smallText, { 
                color: reportData.overallRisk === 'Elevated' ? '#7F1D1D' : reportData.overallRisk === 'Low' ? '#14532D' : '#78350F'
              }]}>
                {reportData.overallRisk === 'Elevated' ? 'Enhanced compliance measures recommended.' : 
                 reportData.overallRisk === 'Low' ? 'Favorable risk profile.' : 
                 'Moderate risk profile.'}
              </Text>
            </View>
            
            <View style={styles.strategicFocusCard}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: '#1E40AF', marginBottom: 4 }]}>
                Strategic Focus
              </Text>
              <Text style={[styles.smallText, { color: '#1E3A8A' }]}>
                Prioritize license applications in Q{currentQuarter} while building compliance infrastructure.
              </Text>
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={1} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 2: Market & Talent Analysis */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Market & Talent Analysis</Text>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
              Market Overview: {reportData.marketAnalysis?.tier || 'Major'}
            </Text>
            <Text style={[styles.smallText, { marginBottom: 10 }]}>
              {reportData.marketAnalysis?.description || 'Market analysis in progress.'}
            </Text>
            
            <View style={styles.grid2}>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Growth Rate</Text>
                  <Text style={styles.metricValue}>{reportData.marketAnalysis?.growthRate || 12}%</Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Competitor Density</Text>
                  <Text style={styles.metricValue}>{reportData.marketAnalysis?.competitorDensity || 'Medium'}</Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Opportunity Score</Text>
                  <Text style={styles.metricValue}>{reportData.marketAnalysis?.opportunityScore || 75}/100</Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Key Industries</Text>
                  <Text style={[styles.smallText, { fontWeight: 'bold' }]}>
                    {(reportData.marketAnalysis?.keyIndustries || ['FinTech', 'Banking']).join(', ')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
              Compliance Talent Analysis
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
                  <Text style={styles.metricLabel}>Talent Rank</Text>
                  <Text style={styles.metricValue}>
                    {(reportData.talentAnalysis?.talentRank || 'medium') === 'high' ? 'High' : 
                     (reportData.talentAnalysis?.talentRank || 'medium') === 'medium' ? 'Medium' : 'Developing'}
                  </Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Compliance Professionals</Text>
                  <Text style={styles.metricValue}>
                    {(reportData.talentAnalysis?.totalProfessionals || 1250).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Avg. Salary</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(reportData.talentAnalysis?.avgSalary || 95000)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.smallText, { fontWeight: 'bold', marginBottom: 5 }]}>Hiring Strategy:</Text>
              <Text style={[styles.smallText, { marginBottom: 8 }]}>
                {reportData.talentAnalysis?.hiringStrategy || 'Hybrid approach recommended'}
              </Text>
              
              <Text style={[styles.smallText, { fontWeight: 'bold', marginBottom: 5 }]}>Top Recruitment Channels:</Text>
              {(reportData.talentAnalysis?.topChannels || ['LinkedIn', 'Industry Job Boards', 'Recruitment Firms']).map((channel: string, index: number) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={[styles.bulletText, { fontSize: 9 }]}>{channel}</Text>
                </View>
              ))}
              
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.smallText, { fontWeight: 'bold' }]}>
                  Estimated Time to Hire: {reportData.talentAnalysis?.timeToHire || '4-6 weeks'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={2} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 3: Regulatory Analysis */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
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
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>Regulator Contact</Text>
            <Text style={styles.normalText}>{licensingData.regulator_name || providers?.regulator?.name || 'State Banking Department'}</Text>
            <Text style={styles.smallText}>Phone: {licensingData.regulator_phone || providers?.regulator?.phone || 'Check state website'}</Text>
            <Text style={styles.smallText}>Email: {licensingData.regulator_email || providers?.regulator?.email || 'Check state website'}</Text>
            {licensingData.regulator_website && (
              <Text style={[styles.smallText, { color: '#D4AF37', marginTop: 4 }]}>
                Website: {licensingData.regulator_website}
              </Text>
            )}
          </View>
          
          {/* Important Notes from database */}
          {licensingData.notes && (
            <View style={[styles.highlightCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E', marginBottom: 5 }]}>
                Important Notes
              </Text>
              <Text style={[styles.smallText, { color: '#78350F' }]}>{licensingData.notes}</Text>
            </View>
          )}
          
          {enforcementHistory && enforcementHistory !== 'No recent enforcement actions identified' && (
            <View style={[styles.highlightCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E', marginBottom: 5 }]}>
                Recent Enforcement Activity
              </Text>
              <Text style={[styles.smallText, { color: '#78350F' }]}>{enforcementHistory}</Text>
            </View>
          )}
          
          {pendingLegislation && pendingLegislation !== 'No pending legislation identified' && (
            <View style={[styles.highlightCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: '#1E40AF', marginBottom: 5 }]}>
                Pending Legislation
              </Text>
              <Text style={[styles.smallText, { color: '#1E3A8A' }]}>{pendingLegislation}</Text>
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
        </View>
        <PDFFooter pageNumber={3} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 4: Licensing Matrix - WITH FULL LICENSING DATA */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
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

          {/* Main Licensing Table */}
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
                      {!isMultiState && <Text style={{ color: '#D4AF37', fontSize: 7 }}> (Primary)</Text>}
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

          {/* License Description */}
          {licensingData.license_description && (
            <View style={[styles.highlightCard, { marginTop: 15 }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>
                License Description
              </Text>
              <Text style={styles.smallText}>{licensingData.license_description}</Text>
            </View>
          )}

          {/* Important Notes */}
          {licensingData.notes && (
            <View style={[styles.highlightCard, { marginTop: 15, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E', marginBottom: 5 }]}>
                Important Notes
              </Text>
              <Text style={[styles.smallText, { color: '#78350F' }]}>{licensingData.notes}</Text>
            </View>
          )}

          {/* Regulator Contact */}
          <View style={[styles.highlightCard, { marginTop: 15 }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>
              Regulator Contact Information
            </Text>
            <Text style={styles.contactName}>{licensingData.regulator_name || 'State Banking Department'}</Text>
            <Text style={styles.contactDetail}>Phone: {licensingData.regulator_phone || 'Check state website'}</Text>
            <Text style={styles.contactDetail}>Email: {licensingData.regulator_email || 'Check state website'}</Text>
            {licensingData.regulator_website && (
              <Text style={[styles.contactDetail, { color: '#D4AF37' }]}>
                Website: {licensingData.regulator_website}
              </Text>
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
                <Text style={[styles.smallText, { color: '#D4AF37' }]}>URL: {licensingData.source_url}</Text>
              )}
              {licensingData.last_reviewed_at && (
                <Text style={styles.smallText}>
                  Last Reviewed: {new Date(licensingData.last_reviewed_at).toLocaleDateString()}
                </Text>
              )}
              {licensingData.verification_status === 'verified' && (
                <Text style={[styles.smallText, { color: '#166534', marginTop: 4 }]}>✓ Verified Information</Text>
              )}
            </View>
          )}

          {/* Standard Application Requirements */}
          <View style={[styles.goldCard, { marginTop: 15 }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
              Standard Application Requirements
            </Text>
            <View style={styles.grid2}>
              {[
                'Complete application forms with business plans',
                'Fingerprint-based background checks',
                'Audited financial statements',
                'Surety bonds as specified',
                'Designate compliance officer',
                'Written policies and procedures',
                'Proof of net worth requirements',
                'Business continuity plan'
              ].map((item, i) => (
                <View key={i} style={[styles.bulletPoint, { width: '100%' }]}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={4} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 5: Compliance Roadmap */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Compliance Implementation Roadmap</Text>
          
          {(reportData.compliancePhases && reportData.compliancePhases.length > 0 ? reportData.compliancePhases : [
            { phase: 'Phase 1: Foundation', timeline: 'Weeks 1-4', items: ['Engage legal counsel', 'Begin license applications', 'Establish compliance policies'] },
            { phase: 'Phase 2: Implementation', timeline: 'Weeks 5-8', items: ['Implement monitoring systems', 'Conduct staff training', 'File remaining applications'] },
            { phase: 'Phase 3: Optimization', timeline: 'Weeks 9-12', items: ['Audit compliance program', 'Address regulator feedback', 'Establish ongoing monitoring'] }
          ]).map((phase: any, idx: number) => (
            <View key={idx} style={[styles.phaseCard, { 
              backgroundColor: idx === 0 ? '#F0FDF4' : idx === 1 ? '#EFF6FF' : '#FEF3C7',
              borderColor: idx === 0 ? '#BBF7D0' : idx === 1 ? '#BFDBFE' : '#FDE68A'
            }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={styles.phaseTitle}>{phase.phase}</Text>
                <Text style={styles.phaseTimeline}>{phase.timeline}</Text>
              </View>
              {(phase.items || []).map((item: string, i: number) => (
                <View key={i} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
          
          <View style={[styles.highlightCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', marginTop: 10 }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E', marginBottom: 8 }]}>
              Key Milestones
            </Text>
            <View style={styles.grid2}>
              {[
                'Legal counsel engaged by end of Week 1',
                'License applications submitted by end of Month 1',
                'Compliance systems operational by Month 3',
                'Full compliance achieved by Month 6'
              ].map((milestone, i) => (
                <View key={i} style={[styles.bulletPoint, { width: '100%' }]}>
                  <View style={[styles.bullet, { backgroundColor: '#D97706' }]} />
                  <Text style={[styles.bulletText, { color: '#78350F' }]}>{milestone}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={5} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 6: Technology & Tools */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Technology & Compliance Tools</Text>
          
          {(reportData.techRecommendations && reportData.techRecommendations.length > 0 ? reportData.techRecommendations : [
            { category: 'Compliance Management', recommendations: [{ name: 'ComplyAdvantage', description: 'AML screening and monitoring', implementationTime: '2-3 weeks', priceRange: '$$$' }] },
            { category: 'Transaction Monitoring', recommendations: [{ name: 'Chainalysis', description: 'Blockchain analytics', implementationTime: '1-2 weeks', priceRange: '$$$' }] }
          ]).map((category: any, catIndex: number) => (
            <View key={catIndex} style={[styles.highlightCard, { marginBottom: 10 }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>{category.category}</Text>
              {(category.recommendations || []).map((rec: any, recIndex: number) => (
                <View key={recIndex} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[styles.smallText, { fontWeight: 'bold' }]}>{rec.name}</Text>
                    <Text style={[styles.smallText, { color: '#D4AF37' }]}>{rec.priceRange}</Text>
                  </View>
                  <Text style={styles.smallText}>{rec.description}</Text>
                  <Text style={[styles.smallText, { color: '#64748B' }]}>Implementation: {rec.implementationTime}</Text>
                </View>
              ))}
            </View>
          ))}
          
          <View style={[styles.goldCard, { marginTop: 10 }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
              Technology Implementation Timeline
            </Text>
            <View style={styles.grid2}>
              {[
                'Weeks 1-2: Evaluate vendors, request demos',
                'Weeks 3-4: Select platforms, begin contracting',
                'Weeks 5-8: Implementation and integration',
                'Weeks 9-10: Testing and staff training',
                'Week 12: Go live'
              ].map((step, i) => (
                <View key={i} style={[styles.bulletPoint, { width: '100%' }]}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={6} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 7: Regulatory Resources */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Regulatory Resources</Text>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>State Regulator</Text>
            <Text style={styles.contactName}>{licensingData.regulator_name || providers?.regulator?.name || 'State Banking Department'}</Text>
            <Text style={styles.contactDetail}>Phone: {licensingData.regulator_phone || providers?.regulator?.phone || 'Check state website'}</Text>
            <Text style={styles.contactDetail}>Email: {licensingData.regulator_email || providers?.regulator?.email || 'Check state website'}</Text>
            {licensingData.regulator_website && (
              <Text style={styles.contactDetail}>Website: {licensingData.regulator_website}</Text>
            )}
          </View>

          {/* Source Verification */}
          {(licensingData.source_name || licensingData.source_url) && (
            <View style={[styles.highlightCard, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: '#166534', marginBottom: 5 }]}>
                Source Verification
              </Text>
              {licensingData.source_name && (
                <Text style={styles.smallText}>Source: {licensingData.source_name}</Text>
              )}
              {licensingData.source_url && (
                <Text style={[styles.smallText, { color: '#D4AF37' }]}>URL: {licensingData.source_url}</Text>
              )}
              {licensingData.last_reviewed_at && (
                <Text style={styles.smallText}>Last Reviewed: {new Date(licensingData.last_reviewed_at).toLocaleDateString()}</Text>
              )}
              {licensingData.verification_status === 'verified' && (
                <Text style={[styles.smallText, { color: '#166534', marginTop: 4 }]}>✓ Verified Information</Text>
              )}
            </View>
          )}

          <View style={styles.grid2}>
            <View style={styles.gridItem2}>
              <View style={styles.contactCard}>
                <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>Legal Counsel</Text>
                {(providers?.legalCounsel || reportData.providers?.legalCounsel || []).slice(0, 3).map((counsel: any, i: number) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <Text style={styles.contactName}>{counsel.name}</Text>
                    <Text style={styles.contactSpecialty}>{counsel.specialty}</Text>
                    <Text style={styles.contactDetail}>{counsel.phone}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.gridItem2}>
              <View style={styles.contactCard}>
                <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>Compliance Consultants</Text>
                {(providers?.consultants || reportData.providers?.consultants || []).slice(0, 3).map((consultant: any, i: number) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <Text style={styles.contactName}>{consultant.name}</Text>
                    <Text style={styles.contactSpecialty}>{consultant.specialty}</Text>
                    <Text style={styles.contactDetail}>{consultant.phone}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={7} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 8: Risk Assessment */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Risk Assessment</Text>
          
          <View style={styles.riskTable}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskHeaderCell}>Risk Category</Text>
              <Text style={styles.riskHeaderCell}>Likelihood</Text>
              <Text style={styles.riskHeaderCell}>Impact</Text>
              <Text style={[styles.riskHeaderCell, { flex: 1.5 }]}>Mitigation</Text>
            </View>
            {(reportData.risks && reportData.risks.length > 0 ? reportData.risks : [
              { category: 'Regulatory Change', likelihood: 'Medium', impact: 'High', mitigation: 'Monitor legislative updates' },
              { category: 'Licensing Delays', likelihood: 'Medium', impact: 'Medium', mitigation: 'Submit early, follow up regularly' },
              { category: 'Compliance Gaps', likelihood: 'Low', impact: 'High', mitigation: 'Regular audits and training' }
            ]).map((risk: any, i: number) => (
              <View key={i} style={styles.riskRow}>
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
            <Text style={styles.smallText}>
              {reportData.overallRisk === 'Elevated' ? 'Enhanced compliance measures recommended. Prioritize licensing and monitoring systems.' : 
               reportData.overallRisk === 'Low' ? 'Favorable risk profile. Maintain standard compliance protocols.' : 
               'Moderate risk profile. Focus on timely licensing and regular audits.'}
            </Text>
          </View>
          
          <View style={[styles.highlightCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', color: '#1E40AF', marginBottom: 8 }]}>
              Insurance Recommendations
            </Text>
            <View style={styles.grid2}>
              {[
                'Directors & Officers (D&O) Liability: $2-5M coverage',
                'Errors & Omissions (E&O): $1-3M coverage',
                'Cyber Liability: $1-5M coverage',
                'Crime/Fidelity Bond: $500k-1M coverage'
              ].map((item, i) => (
                <View key={i} style={[styles.bulletPoint, { width: '100%' }]}>
                  <View style={[styles.bullet, { backgroundColor: '#2563EB' }]} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={8} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 9: Budget Guide */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Budget & Investment Guide</Text>
          
          <View style={styles.budgetTable}>
            <View style={styles.riskHeader}>
              <Text style={[styles.riskHeaderCell, { flex: 1.5 }]}>Category</Text>
              <Text style={styles.riskHeaderCell}>Estimated Cost</Text>
              <Text style={[styles.riskHeaderCell, { flex: 1.5 }]}>Notes</Text>
            </View>
            {(reportData.budgetGuide?.breakdown && reportData.budgetGuide.breakdown.length > 0 ? reportData.budgetGuide.breakdown : [
              { category: 'Licensing Fees', amount: formatMoney(licensingData.application_fee) || '$5,000 - $25,000', notes: 'Application and annual fees' },
              { category: 'Legal Counsel', amount: '$10,000 - $30,000', notes: 'Initial setup and filings' },
              { category: 'Technology', amount: '$15,000 - $50,000', notes: 'Annual subscription' },
              { category: 'Compliance Staff', amount: '$80,000 - $150,000', notes: 'Annual salary + benefits' }
            ]).map((item: any, i: number) => (
              <View key={i} style={styles.budgetRow}>
                <Text style={[styles.budgetCell, { flex: 1.5 }]}>{item.category}</Text>
                <Text style={[styles.budgetCell, { color: '#D4AF37', fontWeight: 'bold' }]}>{item.amount}</Text>
                <Text style={[styles.budgetCell, { flex: 1.5 }]}>{item.notes}</Text>
              </View>
            ))}
          </View>

          <View style={styles.navyCard}>
            <Text style={[styles.smallText, { color: '#D4AF37' }]}>Total Estimated Investment</Text>
            <Text style={[styles.normalText, { color: 'white', fontSize: 24, fontWeight: 'bold' }]}>
              {formatCurrency(reportData.budgetGuide?.totalEstimated?.min || 50000)} - {formatCurrency(reportData.budgetGuide?.totalEstimated?.max || 150000)}
            </Text>
            <Text style={[styles.smallText, { color: '#94A3B8' }]}>
              *Actual costs may vary based on specific requirements, state fees, and chosen vendors
            </Text>
          </View>
          
          <View style={[styles.highlightCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', marginTop: 10 }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E', marginBottom: 8 }]}>
              Cost-Saving Recommendations
            </Text>
            <View style={styles.grid2}>
              {[
                'Bundle technology platforms where possible',
                'Consider contract-to-hire for compliance roles',
                'Leverage free regulatory monitoring tools initially',
                'Join industry associations for discounted services',
                'Negotiate multi-year vendor contracts',
                'Share compliance resources across entities'
              ].map((tip, i) => (
                <View key={i} style={[styles.bulletPoint, { width: '100%' }]}>
                  <View style={[styles.bullet, { backgroundColor: '#D97706' }]} />
                  <Text style={styles.bulletText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={9} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 10: Next Steps */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Next Steps & Ongoing Compliance</Text>
          
          <View style={styles.grid2}>
            <View style={[styles.gridItem2, { marginBottom: 15 }]}>
              <View style={[styles.highlightCard, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E' }]}>Immediate (Next 7 Days)</Text>
                {(reportData.nextSteps?.immediate && reportData.nextSteps.immediate.length > 0 ? reportData.nextSteps.immediate : [
                  'Schedule call with recommended legal counsel',
                  'Begin gathering required documentation',
                  'Review state-specific requirements'
                ]).map((step: string, idx: number) => (
                  <View key={idx} style={styles.bulletPoint}>
                    <Text style={[styles.bulletText, { fontSize: 9 }]}>• {step}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.gridItem2}>
              <View style={[styles.highlightCard, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: '#1E40AF' }]}>Short-Term (30-90 Days)</Text>
                {(reportData.nextSteps?.shortTerm && reportData.nextSteps.shortTerm.length > 0 ? reportData.nextSteps.shortTerm : [
                  'Submit initial license applications',
                  'Implement compliance monitoring tools',
                  'Conduct staff training sessions'
                ]).map((step: string, idx: number) => (
                  <View key={idx} style={styles.bulletPoint}>
                    <Text style={[styles.bulletText, { fontSize: 9 }]}>• {step}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.highlightCard, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', color: '#166534' }]}>Ongoing Obligations</Text>
            {(reportData.nextSteps?.ongoing && reportData.nextSteps.ongoing.length > 0 ? reportData.nextSteps.ongoing : [
              'Annual license renewals',
              'Quarterly compliance reviews',
              'Transaction monitoring and reporting',
              'Staff training updates'
            ]).map((item: string, idx: number) => (
              <View key={idx} style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
          
          <View style={[styles.highlightCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE', marginTop: 10 }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', color: '#5B21B6', marginBottom: 8 }]}>
              Compliance Calendar
            </Text>
            {(reportData.nextSteps?.complianceCalendar && reportData.nextSteps.complianceCalendar.length > 0 ? reportData.nextSteps.complianceCalendar : [
              { timeframe: 'Q1', tasks: ['Annual report filing', 'License renewal check'] },
              { timeframe: 'Q2', tasks: ['Mid-year compliance review', 'Policy updates'] }
            ]).map((item: any, idx: number) => (
              <View key={idx} style={{ marginBottom: 8 }}>
                <Text style={[styles.smallText, { fontWeight: 'bold', color: '#6D28D9' }]}>{item.timeframe}</Text>
                {(item.tasks || []).map((task: string, taskIdx: number) => (
                  <View key={taskIdx} style={styles.bulletPoint}>
                    <View style={[styles.bullet, { backgroundColor: '#8B5CF6' }]} />
                    <Text style={[styles.bulletText, { fontSize: 9 }]}>{task}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
          
          <View style={[styles.goldCard, { marginTop: 10 }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
              Quarterly Review Checklist
            </Text>
            <View style={styles.grid2}>
              {[
                'Review regulatory changes in all operating states',
                'Audit transaction monitoring alerts and outcomes',
                'Update risk assessment with new findings',
                'Verify all licenses are current and renewals scheduled',
                'Conduct staff training on new requirements',
                'Review and update policies and procedures'
              ].map((item, i) => (
                <View key={i} style={[styles.bulletPoint, { width: '100%' }]}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={10} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* Quarterly Intelligence Upsell - Only show for non-subscribers */}
      {showQuarterlyUpsellPage && (
        <Page size="LETTER" style={styles.page} wrap={false}>
          <PDFHeader date={createdDate} />
          <View style={styles.content}>
            <Text style={styles.mainTitle}>Stay Compliant Year-Round</Text>
            
            <View style={styles.quarterlyUpsellCard}>
              <Text style={styles.quarterlyUpsellTitle}>
                Never Miss a Regulatory Change
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
                    <Text style={[styles.normalText, { fontSize: 24, fontWeight: 'bold', color: '#0A1A2F' }]}>
                      $5,997/year
                    </Text>
                    <Text style={[styles.smallText, { color: '#D4AF37' }]}>
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
          </View>
          <PDFFooter pageNumber={11} totalPages={TOTAL_CONTENT_PAGES} />
        </Page>
      )}

      {/* Disclaimer Page */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} showConfidential={false} />
        <View style={styles.content}>
          <View style={styles.highlightCard}>
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
        </View>
      </Page>
    </Document>
  )
}

// Main PDF generation function - NOW ACCEPTS LICENSING DATA AND LEGISLATION DATA
export async function generateReportPDF(
  report: GeneratedReport, 
  prebuiltReportData?: ReportData,
  licensingData?: any,
  legislationData?: LegislationBill[] | null
): Promise<Blob> {
  try {
    if (!report || !report.id || !report.company_name) {
      throw new Error('Invalid report data')
    }

    console.log('📄 Generating PDF for report:', report.id, 
      prebuiltReportData ? '(with prebuilt data)' : '(building from content)',
      licensingData ? '(with licensing data)' : '(no licensing data)',
      legislationData ? `(with ${legislationData.length} legislation bills)` : '(no legislation data)'
    )
    
    const blob = await pdf(
      <ReportDocument 
        report={report} 
        reportData={prebuiltReportData} 
        licensingData={licensingData}
        legislationData={legislationData}
      />
    ).toBlob()
    
    console.log('✅ PDF generated successfully, size:', blob.size, 'bytes')
    return blob
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Failed to generate PDF')
  }
}

// Download function with storage check - NOW ACCEPTS LICENSING DATA AND LEGISLATION DATA
export async function downloadReportPDF(
  report: GeneratedReport, 
  prebuiltReportData?: ReportData,
  licensingData?: any,
  legislationData?: LegislationBill[] | null
): Promise<Blob> {
  try {
    console.log('📥 Starting PDF download for report:', report.id)
    
    if (!report || !report.id || !report.company_name) {
      throw new Error('Invalid report data')
    }

    if (report.pdf_url) {
      console.log('📎 Found existing PDF URL, downloading...')
      try {
        const response = await fetch(report.pdf_url)
        if (response.ok) {
          const blob = await response.blob()
          console.log('✅ Downloaded existing PDF, size:', blob.size, 'bytes')
          return blob
        }
      } catch (fetchError) {
        console.warn('Failed to fetch existing PDF, generating new one:', fetchError)
      }
    }

    console.log('🔄 Generating new PDF...')
    const blob = await generateReportPDF(report, prebuiltReportData, licensingData, legislationData)
    
    if (!blob || blob.size === 0) {
      throw new Error('Generated PDF is empty')
    }
    
    console.log('✅ PDF generation complete, size:', blob.size, 'bytes')
    return blob
    
  } catch (error) {
    console.error('❌ PDF download error:', error)
    throw error
  }
}

// Save PDF to storage via API
export async function savePDFToStorage(report: GeneratedReport, blob: Blob): Promise<boolean> {
  try {
    const formData = new FormData()
    formData.append('reportId', report.id)
    formData.append('file', blob, `${report.company_name}_Report.pdf`)

    const response = await fetch('/api/reports/save-pdf', {
      method: 'POST',
      body: formData
    })

    return response.ok
  } catch (error) {
    console.error('Failed to save PDF to storage:', error)
    return false
  }
}
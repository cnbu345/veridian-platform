// src/lib/pdf/generator.tsx - 10-Page Premium Report
// Professional PDF Generator with expanded 10-page structure

import React from 'react'
import { pdf, Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { pdfTheme } from './theme'
import { PDFHeader } from './components/PDFHeader'
import { PDFFooter } from './components/PDFFooter'
import { PDFCover } from './components/PDFCover'
import { GeneratedReport } from '@/lib/reports/types'
import { format } from 'date-fns'
import { 
  buildReportData, 
  formatPrimaryFocus, 
  formatTimeline, 
  formatSecondaryFocus,
  formatCurrency 
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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  content: {
    flex: 1,
  },
  
  // Header Styles
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
  
  // Text Styles
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
  
  // Card Styles
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
  
  // Grid Layouts
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
  
  // Metric Boxes
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
  
  // Table Styles
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
  
  // Bullet Points
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
  
  // Contact Card Styles
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
  
  // Risk Table Styles
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
  
  // Risk Badges
  likelihoodHigh: {
    color: '#991B1B',
    fontWeight: 'bold',
  },
  likelihoodMedium: {
    color: '#854D0E',
    fontWeight: 'bold',
  },
  likelihoodLow: {
    color: '#166534',
    fontWeight: 'bold',
  },
  impactCritical: {
    color: '#991B1B',
    fontWeight: 'bold',
  },
  impactHigh: {
    color: '#B45309',
    fontWeight: 'bold',
  },
  impactMedium: {
    color: '#854D0E',
    fontWeight: 'bold',
  },
  
  // Budget Table
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
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  
  // Disclaimer
  disclaimer: {
    fontSize: 7,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    lineHeight: 1.4,
  },
  
  // Phase Cards (for roadmap)
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
  
  // White text for navy cards
  whiteText: {
    color: 'white',
  },
  goldText: {
    color: '#D4AF37',
  },
  navy300Text: {
    color: '#94A3B8',
  },
  italicText: {
    fontStyle: 'italic',
  },
})

// Helper function to clean section titles
const cleanTitle = (title: string): string => {
  return title
    .replace(/^\*\d+\.\s*/, '')
    .replace(/^\*{2}\d+\.\s*/, '')
    .replace(/^#{1,6}\s*\d+\.?\s*/, '')
    .replace(/\*/g, '')
    .replace(/\|/g, '')
    .replace(/\[|\]/g, '')
    .trim()
}

// Generate the PDF document component
const ReportDocument = ({ report }: { report: GeneratedReport }) => {
  const content = report.report_content || {}
  const createdDate = new Date(report.created_at)
  
  // Parse secondary focus correctly
  let secondaryFocus: string[] = []
  if (content.secondaryFocus) {
    if (Array.isArray(content.secondaryFocus)) {
      secondaryFocus = content.secondaryFocus
    } else if (typeof content.secondaryFocus === 'string') {
      try {
        const parsed = JSON.parse(content.secondaryFocus)
        if (Array.isArray(parsed)) {
          secondaryFocus = parsed
        }
      } catch (e) {
        secondaryFocus = content.secondaryFocus.split(',').map(s => s.trim())
      }
    }
  } else if (content.strategy_focus?.secondary) {
    if (Array.isArray(content.strategy_focus.secondary)) {
      secondaryFocus = content.strategy_focus.secondary
    } else if (typeof content.strategy_focus.secondary === 'string') {
      try {
        const parsed = JSON.parse(content.strategy_focus.secondary)
        if (Array.isArray(parsed)) {
          secondaryFocus = parsed
        }
      } catch (e) {
        secondaryFocus = content.strategy_focus.secondary.split(',').map(s => s.trim())
      }
    }
  }
  
  // Build report data from real sources
  const reportData = buildReportData(
    {
      name: report.company_name,
      industry: report.industry,
      size: '1-10',
      budget: 'under-50k',
    },
    {
      city: report.city,
      state: report.state,
      tier: (report.location_tier as any) || 'major',
      nearestRegulatoryHub: report.nearest_major_city,
      regulatoryClimate: content.regulatory_analysis?.climate || 'moderate',
      licenseRequired: content.licensing_matrix?.licenses?.[0]?.required ? 'mtl' : 'none',
      talentDensity: 'moderate',
    },
    {
      primary: content.strategy_focus?.primary || 'compliance',
      secondary: secondaryFocus,
      timeline: content.strategy_focus?.timeline || '6-months',
      concerns: content.concerns || 'No specific concerns provided.',
      goals: content.goals || 'No specific goals provided.',
    }
  )
  
  // Get formatted content if available
  const formatted = content.formatted || null
  
  // Get providers for this location
  const providers = getProvidersForLocation(report.city, report.state, reportData.location.tier)
  
  // Get licenses
  const licenses = getLicensesForState(report.state)
  const multiStateLicenses = getAllStateLicenses(15)
  
  // Helper function to get risk style
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

  const TOTAL_CONTENT_PAGES = 10

  return (
    <Document>
      {/* Cover Page */}
      <Page size="LETTER" style={styles.page}>
        <PDFCover 
          companyName={report.company_name}
          city={report.city}
          state={report.state}
          date={createdDate}
          reportId={report.id}
        />
      </Page>

      {/* PAGE 1: Executive Summary with Client Input */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Executive Summary</Text>
          
          {/* Company Overview Card */}
          <View style={styles.navyCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <Text style={[styles.smallText, { color: '#D4AF37' }]}>INSTITUTION PROFILE</Text>
                </View>
                <Text style={[styles.normalText, { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 5 }]}>
                  {report.company_name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <Text style={[styles.smallText, { color: '#94A3B8' }]}>{report.city}, {report.state}</Text>
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
            
            {/* Key Metrics Grid */}
            <View style={styles.grid3}>
              {reportData.metrics.slice(0, 3).map((metric, index) => (
                <View key={index} style={styles.gridItem3}>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 10 }}>
                    <Text style={[styles.smallText, { color: '#94A3B8' }]}>{metric.label}</Text>
                    <Text style={[styles.normalText, { 
                      color: metric.label === 'Licenses Required' ? '#D4AF37' : 'white', 
                      fontSize: 16, 
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
            
            {/* Primary Focus & Timeline row */}
            <View style={{ flexDirection: 'row', gap: 15, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>
                  PRIMARY FOCUS
                </Text>
                <Text style={[styles.normalText, { marginBottom: 0 }]}>
                  {formatPrimaryFocus(reportData.strategy.primary)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>
                  TIMELINE
                </Text>
                <Text style={[styles.normalText, { marginBottom: 0 }]}>
                  {formatTimeline(reportData.strategy.timeline)}
                </Text>
              </View>
            </View>
            
            {/* Secondary Focus Areas */}
            {reportData.strategy.secondary && reportData.strategy.secondary.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>
                  SECONDARY FOCUS ({reportData.strategy.secondary.length} areas)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
                  {reportData.strategy.secondary.map((focus, index) => (
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
            
            {/* Concerns & Goals */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              {reportData.strategy.concerns && reportData.strategy.concerns !== 'No specific concerns provided.' && (
                <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 6, padding: 8 }}>
                  <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>
                    YOUR CONCERNS
                  </Text>
                  <Text style={[styles.smallText, { fontStyle: 'italic' }]}>
                    "{reportData.strategy.concerns.substring(0, 100)}..."
                  </Text>
                </View>
              )}
              {reportData.strategy.goals && reportData.strategy.goals !== 'No specific goals provided.' && (
                <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 6, padding: 8 }}>
                  <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>
                    YOUR GOALS
                  </Text>
                  <Text style={[styles.smallText, { fontStyle: 'italic' }]}>
                    "{reportData.strategy.goals.substring(0, 100)}..."
                  </Text>
                </View>
              )}
            </View>
            
            {/* How We Addressed This */}
            <View style={{ marginTop: 5, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#D4AF37' }}>
              <Text style={[styles.smallText, { color: '#92400E', fontWeight: 'bold' }]}>
                ✓ HOW THIS REPORT ADDRESSES YOUR NEEDS
              </Text>
              <Text style={[styles.smallText, { fontSize: 8 }]}>
                Tailored to your {formatPrimaryFocus(reportData.strategy.primary).toLowerCase()} priorities 
                within your {formatTimeline(reportData.strategy.timeline).toLowerCase()}.
              </Text>
            </View>
          </View>
          
          {/* Strategic Overview */}
          <View style={styles.goldCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>
              Strategic Overview
            </Text>
            <Text style={[styles.normalText, { fontSize: 10, marginBottom: 0 }]}>
              {formatted?.executiveSummary?.overview || 
               `Comprehensive regulatory analysis for ${report.company_name} in ${report.city}, ${report.state}.`}
            </Text>
          </View>
          
          {/* Key Findings */}
          <Text style={styles.subsectionTitle}>Key Findings</Text>
          <View>
            {[
              `${report.state} maintains a ${reportData.location.regulatoryClimate} regulatory climate`,
              `Multi-state licensing requirements span ${multiStateLicenses.length}+ jurisdictions`,
              `Critical compliance deadlines require immediate action (30-90 days)`,
              `${reportData.overallRisk} risk based on current compliance posture`
            ].map((text, index) => (
              <View key={index} style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>
        <PDFFooter pageNumber={1} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 2: Market & Talent Analysis */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Market & Talent Analysis</Text>
          
          {/* Market Analysis Card */}
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
              Market Overview: {reportData.marketAnalysis.tier}
            </Text>
            <Text style={[styles.smallText, { marginBottom: 10 }]}>
              {reportData.marketAnalysis.description}
            </Text>
            
            <View style={styles.grid2}>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Growth Rate</Text>
                  <Text style={styles.metricValue}>{reportData.marketAnalysis.growthRate}%</Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Competitor Density</Text>
                  <Text style={styles.metricValue}>{reportData.marketAnalysis.competitorDensity}</Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Opportunity Score</Text>
                  <Text style={styles.metricValue}>{reportData.marketAnalysis.opportunityScore}/100</Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Key Industries</Text>
                  <Text style={[styles.smallText, { fontWeight: 'bold' }]}>
                    {reportData.marketAnalysis.keyIndustries.join(', ')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Talent Analysis Card */}
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
              Compliance Talent Analysis
            </Text>
            
            <View style={styles.grid2}>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Talent Score</Text>
                  <Text style={styles.metricValue}>{reportData.talentAnalysis.talentScore}/100</Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Talent Rank</Text>
                  <Text style={styles.metricValue}>
                    {reportData.talentAnalysis.talentRank === 'high' ? 'High' :
                     reportData.talentAnalysis.talentRank === 'medium' ? 'Medium' : 'Developing'}
                  </Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Compliance Professionals</Text>
                  <Text style={styles.metricValue}>
                    {reportData.talentAnalysis.totalProfessionals.toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Avg. Salary</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(reportData.talentAnalysis.avgSalary)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.smallText, { fontWeight: 'bold', marginBottom: 5 }]}>
                Hiring Strategy:
              </Text>
              <Text style={[styles.smallText, { marginBottom: 8 }]}>
                {reportData.talentAnalysis.hiringStrategy}
              </Text>
              
              <Text style={[styles.smallText, { fontWeight: 'bold', marginBottom: 5 }]}>
                Top Recruitment Channels:
              </Text>
              {reportData.talentAnalysis.topChannels.map((channel, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={[styles.bulletText, { fontSize: 9 }]}>{channel}</Text>
                </View>
              ))}
              
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.smallText, { fontWeight: 'bold' }]}>
                  Estimated Time to Hire: {reportData.talentAnalysis.timeToHire}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={2} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 3: Regulatory Analysis - Primary State */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Regulatory Analysis: {report.state}</Text>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>
              Regulatory Framework
            </Text>
            <Text style={styles.normalText}>
              {reportData.stateRegulation?.notes || 
               `${report.state} maintains ${reportData.location.regulatoryClimate} regulatory requirements.`}
            </Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Licensing Requirements</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>License Type</Text>
              <Text style={styles.tableHeaderCell}>Requirement</Text>
              <Text style={styles.tableHeaderCell}>Timeline</Text>
              <Text style={styles.tableHeaderCell}>Fee</Text>
            </View>
            {licenses.slice(0, 4).map((license, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{license.licenseType}</Text>
                <Text style={styles.tableCell}>{license.required ? 'Required' : 'May be required'}</Text>
                <Text style={styles.tableCell}>{license.timeline}</Text>
                <Text style={styles.tableCell}>{license.fees || '$500 - $5,000'}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.subsectionTitle}>Regulator Contact</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>{providers.regulator.name}</Text>
            <Text style={styles.contactDetail}>Phone: {providers.regulator.phone}</Text>
            <Text style={styles.contactDetail}>Email: {providers.regulator.email}</Text>
            <Text style={styles.contactSpecialty}>{providers.regulator.specialty}</Text>
          </View>
          
          <View style={styles.goldCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>
              Recent Enforcement Activity
            </Text>
            <Text style={[styles.smallText]}>
              {reportData.stateRegulation?.cryptoFriendly === 'strict' 
                ? 'Active enforcement program with 5+ actions in 2025. Focus on unlicensed money transmission.'
                : reportData.stateRegulation?.cryptoFriendly === 'friendly'
                ? 'Limited enforcement activity. Consumer protection remains priority.'
                : 'Moderate enforcement activity. Regular examinations conducted.'}
            </Text>
          </View>
        </View>
        <PDFFooter pageNumber={3} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 4: Multi-State Licensing Matrix (Expanded) */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Multi-State Licensing Requirements</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>State</Text>
              <Text style={styles.tableHeaderCell}>License</Text>
              <Text style={styles.tableHeaderCell}>Timeline</Text>
              <Text style={styles.tableHeaderCell}>Bonding</Text>
              <Text style={styles.tableHeaderCell}>Renewal</Text>
            </View>
            {multiStateLicenses.map((license, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{license.state}</Text>
                <Text style={styles.tableCell}>{license.licenseType}</Text>
                <Text style={styles.tableCell}>{license.timeline}</Text>
                <Text style={styles.tableCell}>{license.bonding}</Text>
                <Text style={styles.tableCell}>{license.renewal}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.subsectionTitle}>Application Requirements</Text>
          <View style={styles.grid2}>
            {[
              'Complete application forms with business plans',
              'Fingerprint-based background checks for principals',
              'Audited financial statements',
              'Surety bonds as specified',
              'Designate compliance officer',
              'Written policies and procedures',
              'Proof of net worth requirements',
              'Business continuity plan'
            ].map((item, index) => (
              <View key={index} style={styles.gridItem2}>
                <View style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={[styles.bulletText, { fontSize: 8 }]}>{item}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <PDFFooter pageNumber={4} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 5: Compliance Roadmap */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Compliance Implementation Roadmap</Text>
          
          {reportData.compliancePhases.map((phase, index) => (
            <View key={index} style={[styles.phaseCard, { backgroundColor: phase.color.split(' ')[0] }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[styles.normalText, { 
                  fontWeight: 'bold', 
                  fontSize: 14,
                  color: '#D4AF37'
                }]}>
                  {phase.phase}
                </Text>
                <Text style={[styles.smallText, { color: '#D4AF37', fontWeight: 'bold' }]}>
                  {phase.timeline}
                </Text>
              </View>
              <View style={styles.grid2}>
                {phase.items.map((activity, idx) => (
                  <View key={idx} style={styles.gridItem2}>
                    <View style={styles.bulletPoint}>
                      <View style={styles.bullet} />
                      <Text style={[styles.bulletText, { fontSize: 8, color: '#94A3B8'}]}>{activity}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
          
          <View style={styles.goldCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold' }]}>Key Milestones</Text>
            <View style={styles.grid2}>
              {[
                'Legal counsel engaged: Week 1',
                'License applications: Month 1',
                'Compliance systems: Month 3',
                'Full compliance: Month 6'
              ].map((milestone, index) => (
                <View key={index} style={styles.gridItem2}>
                  <View style={styles.bulletPoint}>
                    <View style={styles.bullet} />
                    <Text style={[styles.bulletText, { fontSize: 8 }]}>{milestone}</Text>
                  </View>
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
          
          {reportData.techRecommendations.map((category, catIndex) => (
            <View key={catIndex} style={styles.highlightCard}>
              <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 8 }]}>
                {category.category}
              </Text>
              
              {category.recommendations.map((rec, recIndex) => (
                <View key={recIndex} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[styles.contactName]}>{rec.name}</Text>
                    <Text style={[styles.smallText, { color: '#D4AF37' }]}>{rec.priceRange}</Text>
                  </View>
                  <Text style={[styles.smallText, { marginBottom: 2 }]}>{rec.description}</Text>
                  <Text style={[styles.smallText, { fontStyle: 'italic' }]}>
                    Implementation: {rec.implementationTime}
                  </Text>
                </View>
              ))}
            </View>
          ))}
          
          <View style={styles.goldCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>
              Technology Implementation Timeline
            </Text>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Weeks 1-2: Evaluate vendors, request demos</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Weeks 3-4: Select platforms, begin contracting</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Weeks 5-8: Implementation and integration</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Weeks 9-10: Testing and staff training</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Week 12: Go live</Text>
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
          
          <Text style={styles.subsectionTitle}>State Regulator</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>{providers.regulator.name}</Text>
            <Text style={styles.contactDetail}>Phone: {providers.regulator.phone}</Text>
            <Text style={styles.contactDetail}>Email: {providers.regulator.email}</Text>
            <Text style={styles.contactSpecialty}>{providers.regulator.specialty}</Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Qualified Legal Counsel</Text>
          {providers.legalCounsel.slice(0, 3).map((counsel, index) => (
            <View key={index} style={styles.contactCard}>
              <Text style={styles.contactName}>{counsel.name}</Text>
              <Text style={styles.contactDetail}>{counsel.phone}</Text>
              <Text style={styles.contactDetail}>{counsel.email}</Text>
              <Text style={styles.contactSpecialty}>{counsel.specialty}</Text>
            </View>
          ))}
          
          <Text style={styles.subsectionTitle}>Compliance Consultants</Text>
          {providers.consultants.slice(0, 2).map((consultant, index) => (
            <View key={index} style={styles.contactCard}>
              <Text style={styles.contactName}>{consultant.name}</Text>
              <Text style={styles.contactDetail}>{consultant.phone}</Text>
              <Text style={styles.contactDetail}>{consultant.email}</Text>
              <Text style={styles.contactSpecialty}>{consultant.specialty}</Text>
            </View>
          ))}
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
              <Text style={styles.riskHeaderCell}>Mitigation</Text>
            </View>
            {reportData.risks.map((risk, index) => (
              <View key={index} style={styles.riskRow}>
                <Text style={styles.riskCell}>{risk.category}</Text>
                <Text style={[styles.riskCell, getRiskStyle(risk.likelihood)]}>{risk.likelihood}</Text>
                <Text style={[styles.riskCell, getImpactStyle(risk.impact)]}>{risk.impact}</Text>
                <Text style={styles.riskCell}>{risk.mitigation}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.goldCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold' }]}>
              Overall Risk: {reportData.overallRisk}
            </Text>
            <Text style={styles.smallText}>
              {reportData.overallRisk === 'Elevated' 
                ? 'Enhanced compliance measures recommended. Prioritize licensing and monitoring systems.'
                : reportData.overallRisk === 'Low'
                ? 'Favorable risk profile. Maintain standard compliance protocols.'
                : 'Moderate risk profile. Focus on timely licensing and regular audits.'}
            </Text>
          </View>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>
              Insurance Recommendations
            </Text>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Directors & Officers (D&O) Liability: $2-5M coverage</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Errors & Omissions (E&O): $1-3M coverage</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Cyber Liability: $1-5M coverage</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Crime/Fidelity Bond: $500k-1M coverage</Text>
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={8} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 9: Budget & Timeline Guide */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Budget & Investment Guide</Text>
          
          <View style={styles.budgetTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Category</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Estimated Cost</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Notes</Text>
            </View>
            {reportData.budgetGuide.breakdown.map((item, index) => (
              <View key={index} style={styles.budgetRow}>
                <Text style={[styles.budgetCell, { flex: 2 }]}>{item.category}</Text>
                <Text style={[styles.budgetCell, { flex: 1.5, color: '#D4AF37', fontWeight: 'bold' }]}>{item.amount}</Text>
                <Text style={[styles.budgetCell, { flex: 2 }]}>{item.notes}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.navyCard}>
            <Text style={[styles.normalText, { color: 'white', fontWeight: 'bold', marginBottom: 5 }]}>
              Total Estimated Investment
            </Text>
            <Text style={[styles.normalText, { color: '#D4AF37', fontSize: 20, fontWeight: 'bold' }]}>
              {formatCurrency(reportData.budgetGuide.totalEstimated.min)} - {formatCurrency(reportData.budgetGuide.totalEstimated.max)}
            </Text>
            <Text style={[styles.smallText, { color: '#94A3B8', marginTop: 5 }]}>
              *Actual costs may vary based on specific requirements, state fees, and chosen vendors
            </Text>
          </View>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 5 }]}>
              Cost-Saving Recommendations
            </Text>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Bundle technology platforms where possible</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Consider contract-to-hire for compliance roles</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Leverage free regulatory monitoring tools initially</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Join industry associations for discounted services</Text>
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={9} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* PAGE 10: Next Steps & Ongoing Compliance */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Next Steps & Ongoing Compliance</Text>
          
          <View style={styles.grid2}>
            <View style={styles.gridItem2}>
              <View style={[styles.highlightCard, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: '#92400E' }]}>
                  Immediate (Next 7 Days)
                </Text>
                {reportData.nextSteps.immediate.map((step, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <View style={[styles.bullet, { backgroundColor: '#92400E' }]} />
                    <Text style={[styles.bulletText, { fontSize: 8 }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.gridItem2}>
              <View style={[styles.highlightCard, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: '#0369A1' }]}>
                  Short-Term (30-90 Days)
                </Text>
                {reportData.nextSteps.shortTerm.map((step, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <View style={[styles.bullet, { backgroundColor: '#0369A1' }]} />
                    <Text style={[styles.bulletText, { fontSize: 8 }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold' }]}>
              Ongoing Compliance Calendar
            </Text>
            {reportData.nextSteps.complianceCalendar.map((item, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={[styles.smallText, { fontWeight: 'bold', color: '#D4AF37' }]}>
                  {item.timeframe}:
                </Text>
                {item.tasks.map((task, idx) => (
                  <View key={idx} style={styles.bulletPoint}>
                    <View style={styles.bullet} />
                    <Text style={[styles.bulletText, { fontSize: 8 }]}>{task}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
          
          <View style={styles.goldCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold' }]}>
              Quarterly Review Checklist
            </Text>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Review regulatory changes in all operating states</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Audit transaction monitoring alerts and outcomes</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Update risk assessment with new findings</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Verify all licenses are current and renewals scheduled</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Conduct staff training on new requirements</Text>
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={10} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

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
            This Regulatory Intelligence Report has been prepared by Veridian Group for the exclusive use of {report.company_name}. 
            Veridian Group is not a law firm. This Report does not constitute legal advice.
          </Text>
          
          <Text style={styles.normalText}>
            All compliance recommendations should be reviewed with qualified legal counsel in {report.state}  
            before implementation. Regulations are subject to change without notice.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={[styles.smallText, { textAlign: 'center' }]}>
            © {new Date().getFullYear()} Veridian Group. All rights reserved.
          </Text>
          <Text style={[styles.smallText, { textAlign: 'center' }]}>
            Report ID: {report.id}
          </Text>
          <Text style={[styles.smallText, { textAlign: 'center', marginTop: 5 }]}>
            Data last verified: March 1, 2026
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Main PDF generation function
export async function generateReportPDF(report: GeneratedReport): Promise<Blob> {
  try {
    if (!report || !report.id || !report.company_name) {
      throw new Error('Invalid report data')
    }

    const blob = await pdf(<ReportDocument report={report} />).toBlob()
    return blob
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Failed to generate PDF')
  }
}

// Download function for client-side
export async function downloadReportPDF(report: GeneratedReport): Promise<Blob> {
  try {
    console.log('📥 Generating PDF for report:', report.id)
    
    if (!report || !report.id || !report.company_name) {
      throw new Error('Invalid report data')
    }

    const blob = await generateReportPDF(report)
    
    if (!blob || blob.size === 0) {
      throw new Error('Generated PDF is empty')
    }
    
    console.log('✅ PDF generated successfully, size:', blob.size, 'bytes')
    return blob
    
  } catch (error) {
    console.error('❌ PDF generation error:', error)
    throw error
  }
}
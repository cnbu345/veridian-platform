// src/lib/pdf/generator.custom.tsx
// Custom White-Label PDF Generator for Enterprise Templates
// This generator handles dynamic branding, colors, fonts, and section visibility

import React from 'react'
import { pdf, Document, Page, View, Text, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { GeneratedReport } from '@/lib/reports/types'
import { 
  buildReportData, 
  formatPrimaryFocus, 
  formatTimeline, 
  formatSecondaryFocus,
  formatCurrency 
} from '@/lib/reports/reportData'
import { getProvidersForLocation } from '@/lib/location/serviceProviders'
import { getLicensesForState, getAllStateLicenses } from '@/lib/location/licensingData'

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

// Main Custom Report Document Component
const CustomReportDocument = ({ report, template }: { report: GeneratedReport; template: Template }) => {
  const styles = createDynamicStyles(template)
  const content = report.report_content || {}
  const createdDate = new Date(report.created_at)
  const visibleSections = getVisibleSections(template)
  
  // Parse secondary focus
  let secondaryFocus: string[] = []
  if (content.secondaryFocus) {
    if (Array.isArray(content.secondaryFocus)) {
      secondaryFocus = content.secondaryFocus
    } else if (typeof content.secondaryFocus === 'string') {
      try {
        const parsed = JSON.parse(content.secondaryFocus)
        if (Array.isArray(parsed)) secondaryFocus = parsed
      } catch (e) {
        secondaryFocus = content.secondaryFocus.split(',').map(s => s.trim())
      }
    }
  }
  
  // Build report data
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
  
  const providers = getProvidersForLocation(report.city, report.state, reportData.location.tier)
  const licenses = getLicensesForState(report.state)
  const multiStateLicenses = getAllStateLicenses(15)
  
  const visibleCount = Object.values(visibleSections).filter(v => v).length
  let currentPage = 1
  
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
            {report.company_name}
          </Text>
          
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={[styles.whiteText, { fontSize: 14, opacity: 0.9, marginBottom: 5 }]}>
              {report.city}, {report.state}
            </Text>
            <Text style={[styles.whiteText, { fontSize: 12, opacity: 0.7 }]}>
              {format(createdDate, 'MMMM d, yyyy')}
            </Text>
          </View>
        </View>
      </Page>
      
      {/* Executive Summary - Only if visible */}
      {visibleSections.showExecutiveSummary && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Executive Summary</Text>
          
          <View style={[styles.navyCard]}>
            <Text style={[styles.whiteText, { fontSize: 20, fontWeight: 'bold' }]}>
              {report.company_name}
            </Text>
            <Text style={[styles.whiteText, { opacity: 0.8, marginTop: 5 }]}>
              {report.city}, {report.state}
            </Text>
          </View>
          
          {visibleSections.showClientInput && (
            <View style={[styles.clientInputCard, { marginTop: 15 }]}>
              <Text style={[styles.normalText, { fontWeight: 'bold', color: template.styles?.secondary_color }]}>
                Your Compliance Request
              </Text>
              <Text style={styles.normalText}>
                <Text style={{ fontWeight: 'bold' }}>Primary Focus: </Text>
                {formatPrimaryFocus(reportData.strategy.primary)}
              </Text>
              <Text style={styles.normalText}>
                <Text style={{ fontWeight: 'bold' }}>Timeline: </Text>
                {formatTimeline(reportData.strategy.timeline)}
              </Text>
            </View>
          )}
          
          <Text style={styles.subsectionTitle}>Key Findings</Text>
          <View>
            {[
              `${report.state} maintains a ${reportData.location.regulatoryClimate} regulatory climate`,
              `Multi-state licensing requirements span ${multiStateLicenses.length}+ jurisdictions`,
              `${reportData.overallRisk} risk based on current compliance posture`
            ].map((text, index) => (
              <View key={index} style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{text}</Text>
              </View>
            ))}
          </View>
          
          {template.styles?.show_page_numbers !== false && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Market & Talent Analysis */}
      {visibleSections.showMarketAnalysis && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Market & Talent Analysis</Text>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold' }]}>
              Market Overview: {reportData.marketAnalysis.tier}
            </Text>
            <Text style={styles.smallText}>{reportData.marketAnalysis.description}</Text>
            
            <View style={styles.grid2}>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Growth Rate</Text>
                  <Text style={styles.metricValue}>{reportData.marketAnalysis.growthRate}%</Text>
                </View>
              </View>
              <View style={styles.gridItem2}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Opportunity Score</Text>
                  <Text style={styles.metricValue}>{reportData.marketAnalysis.opportunityScore}/100</Text>
                </View>
              </View>
            </View>
          </View>
          
          {template.styles?.show_page_numbers !== false && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Regulatory Analysis */}
      {visibleSections.showRegulatoryAnalysis && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Regulatory Analysis: {report.state}</Text>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold' }]}>Regulatory Framework</Text>
            <Text style={styles.normalText}>
              {reportData.stateRegulation?.notes || `${report.state} maintains ${reportData.location.regulatoryClimate} regulatory requirements.`}
            </Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Licensing Requirements</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>License Type</Text>
              <Text style={styles.tableHeaderCell}>Requirement</Text>
              <Text style={styles.tableHeaderCell}>Timeline</Text>
            </View>
            {licenses.slice(0, 4).map((license, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{license.licenseType}</Text>
                <Text style={styles.tableCell}>{license.required ? 'Required' : 'May be required'}</Text>
                <Text style={styles.tableCell}>{license.timeline}</Text>
              </View>
            ))}
          </View>
          
          {template.styles?.show_page_numbers !== false && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Multi-State Licensing Matrix */}
      {visibleSections.showLicensingMatrix && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Multi-State Licensing Requirements</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>State</Text>
              <Text style={styles.tableHeaderCell}>License</Text>
              <Text style={styles.tableHeaderCell}>Timeline</Text>
              <Text style={styles.tableHeaderCell}>Bonding</Text>
            </View>
            {multiStateLicenses.slice(0, 8).map((license, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{license.state}</Text>
                <Text style={styles.tableCell}>{license.licenseType}</Text>
                <Text style={styles.tableCell}>{license.timeline}</Text>
                <Text style={styles.tableCell}>{license.bonding}</Text>
              </View>
            ))}
          </View>
          
          {template.styles?.show_page_numbers !== false && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Compliance Roadmap */}
      {visibleSections.showComplianceRoadmap && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Compliance Implementation Roadmap</Text>
          
          {reportData.compliancePhases.map((phase, index) => (
            <View key={index} style={styles.phaseCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.phaseTitle}>{phase.phase}</Text>
                <Text style={styles.phaseTimeline}>{phase.timeline}</Text>
              </View>
              <View style={styles.grid2}>
                {phase.items.slice(0, 4).map((activity, idx) => (
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
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Technology & Tools */}
      {visibleSections.showTechnologyTools && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Technology & Compliance Tools</Text>
          
          {reportData.techRecommendations.map((category, catIndex) => (
            <View key={catIndex} style={styles.highlightCard}>
              <Text style={[styles.normalText, { fontWeight: 'bold' }]}>{category.category}</Text>
              {category.recommendations.slice(0, 2).map((rec, recIndex) => (
                <View key={recIndex} style={{ marginBottom: 10 }}>
                  <Text style={[styles.contactName]}>{rec.name}</Text>
                  <Text style={styles.smallText}>{rec.description}</Text>
                </View>
              ))}
            </View>
          ))}
          
          {template.styles?.show_page_numbers !== false && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Regulatory Resources */}
      {visibleSections.showRegulatoryResources && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Regulatory Resources</Text>
          
          <Text style={styles.subsectionTitle}>State Regulator</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>{providers.regulator.name}</Text>
            <Text style={styles.contactDetail}>Phone: {providers.regulator.phone}</Text>
            <Text style={styles.contactSpecialty}>{providers.regulator.specialty}</Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Qualified Legal Counsel</Text>
          {providers.legalCounsel.slice(0, 2).map((counsel, index) => (
            <View key={index} style={styles.contactCard}>
              <Text style={styles.contactName}>{counsel.name}</Text>
              <Text style={styles.contactDetail}>{counsel.phone}</Text>
            </View>
          ))}
          
          {template.styles?.show_page_numbers !== false && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Risk Assessment */}
      {visibleSections.showRiskAssessment && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Risk Assessment</Text>
          
          <View style={styles.riskTable}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskHeaderCell}>Risk Category</Text>
              <Text style={styles.riskHeaderCell}>Likelihood</Text>
              <Text style={styles.riskHeaderCell}>Impact</Text>
            </View>
            {reportData.risks.slice(0, 4).map((risk, index) => (
              <View key={index} style={styles.riskRow}>
                <Text style={styles.riskCell}>{risk.category}</Text>
                <Text style={[styles.riskCell, getRiskStyle(risk.likelihood)]}>{risk.likelihood}</Text>
                <Text style={[styles.riskCell, getImpactStyle(risk.impact)]}>{risk.impact}</Text>
              </View>
            ))}
          </View>
          
          {template.styles?.show_page_numbers !== false && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Budget Guide */}
      {visibleSections.showBudgetGuide && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Budget & Investment Guide</Text>
          
          <View style={styles.budgetTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Category</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Estimated Cost</Text>
            </View>
            {reportData.budgetGuide.breakdown.slice(0, 6).map((item, index) => (
              <View key={index} style={styles.budgetRow}>
                <Text style={[styles.budgetCell, { flex: 2 }]}>{item.category}</Text>
                <Text style={[styles.budgetCell, { flex: 1.5, color: template.styles?.secondary_color, fontWeight: 'bold' }]}>
                  {item.amount}
                </Text>
              </View>
            ))}
          </View>
          
          <View style={[styles.navyCard]}>
            <Text style={[styles.whiteText, { fontWeight: 'bold' }]}>Total Estimated Investment</Text>
            <Text style={[styles.goldText, { fontSize: 20, fontWeight: 'bold' }]}>
              {formatCurrency(reportData.budgetGuide.totalEstimated.min)} - {formatCurrency(reportData.budgetGuide.totalEstimated.max)}
            </Text>
          </View>
          
          {template.styles?.show_page_numbers !== false && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Next Steps */}
      {visibleSections.showNextSteps && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.mainTitle}>Next Steps & Ongoing Compliance</Text>
          
          <View style={styles.grid2}>
            <View style={styles.gridItem2}>
              <View style={[styles.goldCard]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: template.styles?.secondary_color }]}>
                  Immediate (Next 7 Days)
                </Text>
                {reportData.nextSteps.immediate.slice(0, 3).map((step, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <View style={styles.bullet} />
                    <Text style={[styles.bulletText, { fontSize: 8 }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.gridItem2}>
              <View style={[styles.goldCard]}>
                <Text style={[styles.normalText, { fontWeight: 'bold', color: template.styles?.secondary_color }]}>
                  Short-Term (30-90 Days)
                </Text>
                {reportData.nextSteps.shortTerm.slice(0, 3).map((step, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <View style={styles.bullet} />
                    <Text style={[styles.bulletText, { fontSize: 8 }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {template.styles?.show_page_numbers !== false && (
            <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
              Page {currentPage++} of {visibleCount + 1}
            </Text>
          )}
        </Page>
      )}
      
      {/* Disclaimer Page */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.content}>
          <View style={[styles.goldCard]}>
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
          <Text style={[styles.smallText, { textAlign: 'center', marginTop: 10 }]}>
            Template: {template.name}
          </Text>
        </View>
        
        {template.styles?.show_page_numbers !== false && (
          <Text style={[styles.smallText, { textAlign: 'center', marginTop: 20 }]}>
            Page {currentPage++} of {visibleCount + 1}
          </Text>
        )}
      </Page>
    </Document>
  )
}

// Export custom generator functions
export async function generateCustomReportPDF(report: GeneratedReport, template: Template): Promise<Blob> {
  try {
    if (!report || !report.id || !report.company_name) {
      throw new Error('Invalid report data')
    }
    
    if (!template || !template.id) {
      throw new Error('Template required for custom PDF generation')
    }
    
    console.log('🎨 Generating custom PDF with template:', template.name)
    
    const blob = await pdf(<CustomReportDocument report={report} template={template} />).toBlob()
    return blob
  } catch (error) {
    console.error('Custom PDF generation error:', error)
    throw new Error('Failed to generate custom PDF')
  }
}
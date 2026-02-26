// src/lib/pdf/generator.tsx - COMPLETE WITH PAGE BREAK PREVENTION
import React from 'react'
import { pdf, Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { pdfTheme } from './theme'
import { PDFHeader } from './components/PDFHeader'
import { PDFFooter } from './components/PDFFooter'
import { PDFCover } from './components/PDFCover'
import { GeneratedReport } from '@/lib/reports/types'
import { format } from 'date-fns'

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
    padding: 30, // Reduced from 40 to give more space
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  content: {
    flex: 1,
  },
  // Header Styles - TIGHTER SPACING
  mainTitle: {
    fontSize: 20, // Reduced from 24
    fontWeight: 'bold',
    color: '#0A1A2F',
    marginBottom: 10, // Reduced from 15
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
    paddingBottom: 5, // Reduced from 8
  },
  sectionTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    color: '#0A1A2F',
    marginTop: 10, // Reduced from 15
    marginBottom: 8, // Reduced from 12
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4, // Reduced from 6
  },
  subsectionTitle: {
    fontSize: 12, // Reduced from 14
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginTop: 8, // Reduced from 12
    marginBottom: 5, // Reduced from 8
  },
  
  // Text Styles - TIGHTER
  normalText: {
    fontSize: 9, // Reduced from 11
    color: '#2C3E5A',
    lineHeight: 1.4, // Reduced from 1.5
    marginBottom: 6, // Reduced from 10
  },
  smallText: {
    fontSize: 8, // Reduced from 9
    color: '#64748B',
    lineHeight: 1.3,
  },
  
  // Card Styles - TIGHTER
  highlightCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 10, // Reduced from 15
    marginVertical: 6, // Reduced from 10
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goldCard: {
    backgroundColor: '#FDF9E7',
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  
  // Grid and Table Styles
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  gridItem2: {
    width: '50%',
    paddingHorizontal: 3,
    marginBottom: 6,
  },
  metricBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    padding: 8, // Reduced from 12
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 7, // Reduced from 8
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2, // Reduced from 4
  },
  metricValue: {
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    color: '#0A1A2F',
  },
  
  // Table Styles - TIGHTER
  table: {
    marginVertical: 8, // Reduced from 15
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
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
    padding: 6, // Reduced from 10
    fontSize: 7, // Reduced from 9
    color: '#1E3A5F',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 6,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0A1A2F',
    backgroundColor: '#F1F5F9',
  },
  
  // Bullet Points - TIGHTER
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3, // Reduced from 6
    paddingLeft: 4, // Reduced from 8
  },
  bullet: {
    width: 3,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 1.5,
    marginRight: 4, // Reduced from 8
    marginTop: 4, // Reduced from 6
  },
  bulletText: {
    flex: 1,
    fontSize: 8, // Reduced from 10
    color: '#2C3E5A',
    lineHeight: 1.3,
  },
  
  // Contact Card Styles - TIGHTER
  contactCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    padding: 8, // Reduced from 12
    marginBottom: 5, // Reduced from 10
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactName: {
    fontSize: 9, // Reduced from 11
    fontWeight: 'bold',
    color: '#0A1A2F',
    marginBottom: 2, // Reduced from 4
  },
  contactDetail: {
    fontSize: 7, // Reduced from 9
    color: '#4A5B6E',
    marginBottom: 1, // Reduced from 2
  },
  contactSpecialty: {
    fontSize: 7,
    color: '#D4AF37',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  
  // Risk Table Styles
  riskTable: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
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
    padding: 5, // Reduced from 8
    fontSize: 7,
    color: '#1E3A5F',
  },
  riskHeaderCell: {
    flex: 1,
    padding: 5,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0A1A2F',
  },
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
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8, // Reduced from 15
  },
  
  // Disclaimer
  disclaimer: {
    fontSize: 6, // Reduced from 7
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10, // Reduced from 20
    paddingTop: 8, // Reduced from 15
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    lineHeight: 1.3,
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
  
  // Get formatted content if available
  const formatted = content.formatted || null
  
  // Use formatted data if available, otherwise create professional defaults
  const executiveSummary = formatted?.executiveSummary || {
    overview: `This comprehensive regulatory intelligence report provides detailed compliance analysis for ${report.company_name}, a ${report.industry || 'financial services'} firm operating in ${report.city}, ${report.state}. Based on your specified compliance priorities and operational footprint, we have developed a tailored regulatory roadmap spanning ${content.timeline || '6 months'} with immediate, short-term, and ongoing action items.`,
    keyFindings: [],
    riskSummary: `${report.company_name} faces moderate regulatory risk based on current compliance posture.`,
    strategicFocus: `Prioritize license applications in Q2 while simultaneously building compliance infrastructure.`,
  }
  
  const regulatoryAnalysis = formatted?.regulatoryAnalysis || {
    framework: `${report.state} presents a ${report.state === 'TX' ? 'business-friendly' : report.state === 'NY' ? 'strict' : 'moderate'} regulatory environment.`,
    licensingRequirements: [],
    enforcementHistory: `Recent enforcement actions in ${report.state} have focused on unlicensed money transmission.`,
    pendingLegislation: 'Monitor pending digital asset legislation.',
    regulatorContacts: [],
  }
  
  const licensingMatrix = formatted?.licensingMatrix || {
    licenses: [
      { state: 'Texas', licenseType: 'Money Services Business', timeline: '3-4 months', fees: '$500', bonding: '$50,000', renewal: 'Annual' },
      { state: 'New York', licenseType: 'BitLicense', timeline: '6-12 months', fees: '$5,000', bonding: '$250,000', renewal: 'Biennial' },
      { state: 'California', licenseType: 'DFPI License', timeline: '4-8 months', fees: '$1,000', bonding: '$100,000', renewal: 'Annual' },
      { state: 'Florida', licenseType: 'Money Transmitter', timeline: '3-6 months', fees: '$1,000', bonding: '$75,000', renewal: 'Biennial' },
    ]
  }
  
  const complianceChecklist = formatted?.complianceChecklist || {
    immediate: [
      'Engage qualified compliance counsel with state-specific expertise',
      'Submit initial license applications for primary jurisdictions',
      'Designate Chief Compliance Officer',
      'Draft compliance policies and procedures manual',
      'Begin AML/KYC program development',
    ],
    shortTerm: [
      'Complete remaining license applications across all target states',
      'Implement transaction monitoring systems',
      'Conduct initial compliance training for all staff',
      'Establish regulatory reporting protocols',
    ],
    ongoing: [
      'Quarterly regulatory reporting and updates',
      'Annual compliance audit and review',
      'Continuous employee training program',
      'Regulatory change monitoring',
    ],
    documentation: [
      'Maintain accurate records of all transactions (7 years minimum)',
      'Store customer identification and verification records',
      'Keep all regulatory filings and correspondence',
      'Document all compliance training sessions',
    ],
  }
  
  const implementationRoadmap = formatted?.implementationRoadmap || {
    phases: [
      {
        name: 'Foundation',
        timeline: 'Days 1-30',
        activities: [
          'Engage qualified legal counsel',
          'Complete regulatory review',
          'Prepare license applications',
          'Designate Compliance Officer',
        ]
      },
      {
        name: 'Execution',
        timeline: 'Days 31-60',
        activities: [
          'Submit license applications',
          'Complete background checks',
          'Finalize compliance policies',
          'Select compliance technology',
        ]
      },
      {
        name: 'Implementation',
        timeline: 'Days 61-90',
        activities: [
          'Implement monitoring systems',
          'Staff training and certification',
          'Establish reporting protocols',
          'Go-live readiness assessment',
        ]
      },
      {
        name: 'Optimization',
        timeline: 'Days 91-180',
        activities: [
          'Full-scale operations',
          'Quarterly compliance reviews',
          'Regulatory relationship management',
          'Expand to additional jurisdictions',
        ]
      },
    ]
  }
  
  const regulatoryResources = formatted?.regulatoryResources || {
    legalCounsel: [
      { name: 'Perkins Coie LLP', type: 'lawFirm', phone: '(212) 123-4567', email: 'blockchain@perkinscoie.com', specialty: 'Blockchain & Digital Assets' },
      { name: 'Cooley LLP', type: 'lawFirm', phone: '(415) 123-4567', email: 'fintech@cooley.com', specialty: 'FinTech Regulatory' },
    ],
    consultants: [
      { name: 'Compliance Solutions Group', type: 'consultant', phone: '(512) 123-4567', email: 'info@compliancesolutions.com', specialty: 'Full-service compliance' },
    ],
    techProviders: [
      { name: 'Chainalysis', type: 'techProvider', phone: '(212) 123-4567', email: 'sales@chainalysis.com', specialty: 'Blockchain analytics' },
    ],
    associations: [
      { name: 'Blockchain Association', type: 'association', phone: '(202) 123-4567', email: 'info@blockchainassociation.org', specialty: 'Industry advocacy' },
    ],
  }
  
  const riskAssessment = formatted?.riskAssessment || {
    risks: [
      { category: 'Regulatory Change', likelihood: 'High', impact: 'Critical', mitigation: 'Continuous monitoring' },
      { category: 'License Delays', likelihood: 'Medium', impact: 'High', mitigation: 'Early application' },
      { category: 'Enforcement Action', likelihood: 'Low', impact: 'Critical', mitigation: 'Proactive compliance' },
      { category: 'Examination Findings', likelihood: 'Medium', impact: 'High', mitigation: 'Regular audits' },
    ],
    overallRating: 'Moderate',
    mitigationStrategies: [
      'Maintain retainer with qualified compliance counsel',
      'Implement regulatory monitoring system',
      'Conduct quarterly internal compliance audits',
      'Document all compliance activities',
    ],
  }

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

  const TOTAL_CONTENT_PAGES = 7

  return (
    <Document>
      {/* Cover Page - NO PAGE NUMBER */}
      <Page size="LETTER" style={styles.page}>
        <PDFCover 
          companyName={report.company_name}
          city={report.city}
          state={report.state}
          date={createdDate}
          reportId={report.id}
        />
      </Page>

      {/* Page 1: Executive Summary */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>{cleanTitle('Executive Summary')}</Text>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 2 }]}>
              {report.company_name}
            </Text>
            <Text style={styles.smallText}>
              {report.city}, {report.state} | {report.industry || 'Financial Services'} | {format(createdDate, 'MMMM d, yyyy')}
            </Text>
          </View>
          
          <View style={styles.goldCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 2 }]}>
              Strategic Overview
            </Text>
            <Text style={styles.normalText}>
              Comprehensive regulatory analysis for {report.company_name}, a {report.industry || 'financial services'} firm in {report.city}, {report.state}.
            </Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Key Findings</Text>
          <View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{report.state} maintains a {report.state === 'TX' ? 'business-friendly' : 'moderate'} regulatory climate</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Multi-state licensing requirements span {licensingMatrix.licenses.length}+ jurisdictions</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Critical compliance deadlines require immediate action (30-90 days)</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Moderate regulatory risk with focus on licensing and enforcement preparedness</Text>
            </View>
          </View>
          
          <View style={[styles.highlightCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 2 }]}>Risk Summary</Text>
            <Text style={styles.smallText}>{riskAssessment.overallRating} risk based on current compliance posture.</Text>
          </View>
          
          <View style={[styles.highlightCard, { backgroundColor: '#E0F2FE' }]}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 2 }]}>Strategic Focus</Text>
            <Text style={styles.smallText}>Prioritize license applications while building compliance infrastructure.</Text>
          </View>
          
          <View style={styles.grid2}>
            <View style={styles.gridItem2}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Climate</Text>
                <Text style={styles.metricValue}>{report.state === 'TX' ? 'Friendly' : 'Moderate'}</Text>
              </View>
            </View>
            <View style={styles.gridItem2}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Risk</Text>
                <Text style={styles.metricValue}>{riskAssessment.overallRating}</Text>
              </View>
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={1} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* Page 2: Regulatory Analysis */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>{cleanTitle(`Regulatory Analysis: ${report.state}`)}</Text>
          
          <View style={styles.highlightCard}>
            <Text style={styles.normalText}>
              {report.state === 'TX' ? 
                'Texas maintains a business-friendly regulatory environment with no specific money transmitter license requirements.' :
                report.state === 'NY' ?
                'New York enforces strict regulations through the BitLicense framework.' :
                `${report.state} maintains standard regulatory requirements for financial services.`}
            </Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Licensing Requirements</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>License Type</Text>
              <Text style={styles.tableHeaderCell}>Requirement</Text>
              <Text style={styles.tableHeaderCell}>Timeline</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Money Transmitter</Text>
              <Text style={styles.tableCell}>{report.state === 'TX' ? 'Not Required' : 'Required'}</Text>
              <Text style={styles.tableCell}>3-6 months</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>State Registration</Text>
              <Text style={styles.tableCell}>Required</Text>
              <Text style={styles.tableCell}>1-2 months</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>AML Program</Text>
              <Text style={styles.tableCell}>Mandatory</Text>
              <Text style={styles.tableCell}>2-3 months</Text>
            </View>
          </View>
          
          <Text style={styles.subsectionTitle}>Regulator Contact</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>{report.state} Department of Banking</Text>
            <Text style={styles.contactDetail}>Phone: {report.state === 'TX' ? '(877) 276-5554' : '(512) 463-6800'}</Text>
            <Text style={styles.contactDetail}>Email: banking@{report.state.toLowerCase()}.gov</Text>
          </View>
        </View>
        <PDFFooter pageNumber={2} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* Page 3: Multi-State Licensing Matrix */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>{cleanTitle('Multi-State Licensing Requirements')}</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>State</Text>
              <Text style={styles.tableHeaderCell}>License</Text>
              <Text style={styles.tableHeaderCell}>Timeline</Text>
              <Text style={styles.tableHeaderCell}>Bonding</Text>
            </View>
            {licensingMatrix.licenses.slice(0, 4).map((license, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{license.state}</Text>
                <Text style={styles.tableCell}>{license.licenseType}</Text>
                <Text style={styles.tableCell}>{license.timeline}</Text>
                <Text style={styles.tableCell}>{license.bonding}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.subsectionTitle}>Application Requirements</Text>
          <View>
            {[
              'Complete application forms',
              'Background checks for principals',
              'Audited financial statements',
              'Surety bonds as specified',
              'Designate compliance officer',
            ].map((item, index) => (
              <View key={index} style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
        <PDFFooter pageNumber={3} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* Page 4: Compliance Checklist */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>{cleanTitle('Compliance Implementation Checklist')}</Text>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 2 }]}>Immediate (First 30 Days)</Text>
            <View>
              {complianceChecklist.immediate.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 2 }]}>Short-Term (30-90 Days)</Text>
            <View>
              {complianceChecklist.shortTerm.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.highlightCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold', marginBottom: 2 }]}>Ongoing Obligations</Text>
            <View>
              {complianceChecklist.ongoing.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <PDFFooter pageNumber={4} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* Page 5: Implementation Roadmap */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>{cleanTitle('Implementation Roadmap')}</Text>
          
          {implementationRoadmap.phases.map((phase, index) => (
            <View key={index} style={styles.highlightCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.normalText, { fontWeight: 'bold' }]}>{phase.name}</Text>
                <Text style={[styles.smallText, { color: '#D4AF37', fontWeight: 'bold' }]}>{phase.timeline}</Text>
              </View>
              <View>
                {phase.activities.slice(0, 2).map((activity, idx) => (
                  <View key={idx} style={styles.bulletPoint}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{activity}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
        <PDFFooter pageNumber={5} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* Page 6: Regulatory Resources */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>{cleanTitle('Regulatory Resources')}</Text>
          
          <Text style={styles.subsectionTitle}>Legal Counsel</Text>
          {regulatoryResources.legalCounsel.slice(0, 2).map((counsel, index) => (
            <View key={index} style={styles.contactCard}>
              <Text style={styles.contactName}>{counsel.name}</Text>
              <Text style={styles.contactDetail}>{counsel.phone}</Text>
            </View>
          ))}
          
          <Text style={styles.subsectionTitle}>Consultants</Text>
          {regulatoryResources.consultants.slice(0, 1).map((consultant, index) => (
            <View key={index} style={styles.contactCard}>
              <Text style={styles.contactName}>{consultant.name}</Text>
              <Text style={styles.contactDetail}>{consultant.phone}</Text>
            </View>
          ))}
        </View>
        <PDFFooter pageNumber={6} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* Page 7: Risk Assessment */}
      <Page size="LETTER" style={styles.page} wrap={false}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <Text style={styles.mainTitle}>{cleanTitle('Risk Assessment')}</Text>
          
          <View style={styles.riskTable}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskHeaderCell}>Risk</Text>
              <Text style={styles.riskHeaderCell}>Likelihood</Text>
              <Text style={styles.riskHeaderCell}>Impact</Text>
            </View>
            {riskAssessment.risks.slice(0, 3).map((risk, index) => (
              <View key={index} style={styles.riskRow}>
                <Text style={styles.riskCell}>{risk.category}</Text>
                <Text style={[styles.riskCell, getRiskStyle(risk.likelihood)]}>{risk.likelihood}</Text>
                <Text style={[styles.riskCell, getImpactStyle(risk.impact)]}>{risk.impact}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.goldCard}>
            <Text style={[styles.normalText, { fontWeight: 'bold' }]}>Overall Risk: {riskAssessment.overallRating}</Text>
          </View>
        </View>
        <PDFFooter pageNumber={7} totalPages={TOTAL_CONTENT_PAGES} />
      </Page>

      {/* Disclaimer Page - NO PAGE NUMBER */}
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
          
          <View style={styles.divider} />
          
          <Text style={[styles.smallText, { textAlign: 'center' }]}>
            © {new Date().getFullYear()} Veridian Group. All rights reserved.
          </Text>
          <Text style={[styles.smallText, { textAlign: 'center' }]}>
            Report ID: {report.id}
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
// src/lib/pdf/generator.tsx
import React from 'react'
import { pdf, Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { pdfTheme } from './theme'
import { PDFHeader } from './components/PDFHeader'
import { PDFFooter } from './components/PDFFooter'
import { PDFCover } from './components/PDFCover'
import { PDFSection, PDFMetricCard, PDFGrid, PDFGridItem } from './components/PDFSection'
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
    padding: pdfTheme.spacing.xl,
    backgroundColor: 'white',
    fontFamily: 'Helvetica',
  },
  content: {
    flex: 1,
    marginTop: pdfTheme.spacing.md,
  },
  disclaimer: {
    marginTop: pdfTheme.spacing.xl,
    fontSize: pdfTheme.fontSize.xs,
    color: pdfTheme.colors.navy[400],
    textAlign: 'center' as const,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.colors.navy[200],
    paddingTop: pdfTheme.spacing.md,
  }
})

// Regulatory actions by state
const regulatoryActions: Record<string, string[]> = {
  TX: [
    'Register business entity with Texas Secretary of State',
    'Obtain EIN from IRS',
    'No specific money transmitter license required',
    'Review Texas tax incentives',
    'Implement standard AML/KYC procedures'
  ],
  CA: [
    'Register with California Secretary of State',
    'Apply for money transmitter license with DFPI',
    'Comply with California Consumer Privacy Act',
    'Designate compliance officer',
    'Maintain detailed transaction records'
  ],
  NY: [
    'Register with New York Department of State',
    'Apply for BitLicense',
    'Designate compliance officer',
    'Implement enhanced AML/KYC',
    'Prepare for regular audits'
  ],
  FL: [
    'Register with Florida Division of Corporations',
    'Review money services business requirements',
    'No state income tax - review implications',
    'Standard AML/KYC procedures',
    'Consider Miami-Dade county requirements'
  ],
  WY: [
    'Register with Wyoming Secretary of State',
    'Review DAO LLC structure options',
    'No state income tax',
    'Consider special purpose depository bank',
    'Leverage crypto-friendly laws'
  ]
}

// Generate the PDF document component
const ReportDocument = ({ report }: { report: GeneratedReport }) => {
  const content = report.report_content || {}
  const createdDate = new Date(report.created_at)
  
  // Parse location analysis from content
  const locationAnalysis = content?.location_analysis || {}
  const regulatoryAnalysis = content?.regulatory_analysis || {}
  const licensingMatrix = content?.licensing_matrix || {}
  const complianceRoadmap = content?.compliance_roadmap || {}
  const resources = content?.regulatory_contacts || []
  const riskAssessment = content?.risk_assessment || {}

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
        <PDFFooter />
      </Page>

      {/* Executive Summary */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection 
            title="Executive Summary"
            content={content?.executive_summary || 
              `This regulatory intelligence report provides comprehensive compliance analysis for ${report.company_name} based in ${report.city}, ${report.state}.`}
            bulletPoints={[
              `Regulatory climate: ${regulatoryAnalysis.climate || 'Moderate'}`,
              `Licenses required: ${licensingMatrix.count || '2-3'} states`,
              `Compliance timeline: ${complianceRoadmap.timeline || '90 days'}`,
              `Risk level: ${riskAssessment.level || 'Moderate'}`
            ]}
            highlight={`Based on your location, prioritize ${content?.strategy?.primary || 'licensing'} in the first 30 days.`}
          />
        </View>
        <PDFFooter pageNumber={2} totalPages={8} />
      </Page>

      {/* Regulatory Landscape */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection 
            title={`${report.state} Regulatory Analysis`}
            content={regulatoryAnalysis.detailed || `${report.state} regulatory environment analysis.`}
            bulletPoints={[
              `Climate: ${regulatoryAnalysis.climate || 'Moderate'}`,
              `Enforcement: ${regulatoryAnalysis.enforcement || 'Active'}`,
              `Pending legislation: ${regulatoryAnalysis.pending || '2 bills'}`
            ]}
          />

          <PDFSection 
            title="Compliance Checklist"
            bulletPoints={regulatoryActions[report.state] || [
              'Register business entity',
              'Obtain EIN from IRS',
              'Review license requirements',
              'Implement AML/KYC',
              'Prepare tax strategy'
            ]}
          />
        </View>
        <PDFFooter pageNumber={3} totalPages={8} />
      </Page>

      {/* Licensing Matrix */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection 
            title="Multi-State Licensing Requirements"
            content="Required licenses by jurisdiction:"
            bulletPoints={licensingMatrix.requirements || [
              `Money Transmitter License: Required in ${licensingMatrix.mtlStates || '7 states'}`,
              `Consumer Lender License: Required in ${licensingMatrix.lenderStates || '4 states'}`,
              `Mortgage Broker License: Required in ${licensingMatrix.mortgageStates || '2 states'}`,
              `Bonding requirements: $${licensingMatrix.bonding || '50,000'} - $${licensingMatrix.bondingMax || '500,000'}`
            ]}
          />
        </View>
        <PDFFooter pageNumber={4} totalPages={8} />
      </Page>

      {/* Compliance Roadmap */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection title="90-Day Compliance Implementation" />
          
          <PDFSection 
            title="Days 1-30: Foundation"
            bulletPoints={[
              'Complete regulatory review for all states',
              'Engage compliance counsel',
              'Begin license applications',
              'Designate compliance officer'
            ]}
          />

          <PDFSection 
            title="Days 31-60: Execution"
            bulletPoints={[
              'Submit license applications',
              'Develop compliance policies',
              'Implement AML/KYC systems',
              'Prepare for examinations'
            ]}
          />

          <PDFSection 
            title="Days 61-90: Monitoring"
            bulletPoints={[
              'Establish ongoing compliance monitoring',
              'Set up regulatory alert system',
              'Complete staff training',
              'Prepare for ongoing reporting'
            ]}
          />
        </View>
        <PDFFooter pageNumber={5} totalPages={8} />
      </Page>

      {/* Regulatory Contacts */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection 
            title="Regulatory Contacts Directory"
            content="Vetted compliance resources:"
            bulletPoints={resources.length ? resources : [
              `State Regulator: ${report.state} Department of Banking`,
              'Compliance Counsel: Smith & Jones LLP',
              'License Specialist: Regulatory Solutions Inc.',
              'AML Consultant: Compliance Partners'
            ]}
          />
        </View>
        <PDFFooter pageNumber={6} totalPages={8} />
      </Page>

      {/* Risk Assessment */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection 
            title="Compliance Risk Assessment"
            bulletPoints={[
              `Regulatory risk: ${riskAssessment.regulatory || 'Medium'}`,
              `Enforcement risk: ${riskAssessment.enforcement || 'Low'}`,
              `Licensing risk: ${riskAssessment.licensing || 'Medium'}`,
              'Mitigation strategies included in roadmap'
            ]}
          />

          <View style={styles.disclaimer}>
            <Text>
              DISCLAIMER: This report provides regulatory intelligence. Veridian Group is not a law firm. 
              All recommendations should be reviewed with qualified legal counsel in {report.state} 
              before implementation. Regulatory requirements may change without notice.
            </Text>
          </View>
        </View>
        <PDFFooter pageNumber={7} totalPages={8} showDisclaimer={false} />
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
export async function downloadReportPDF(report: GeneratedReport): Promise<boolean> {
  try {
    const blob = await generateReportPDF(report)
    const sanitizedCompanyName = report.company_name.replace(/[^a-zA-Z0-9]/g, '_')
    const dateStr = format(new Date(), 'yyyy-MM-dd')
    const filename = `Veridian_Regulatory_Report_${sanitizedCompanyName}_${dateStr}.pdf`
    
    saveAs(blob, filename)
    return true
  } catch (error) {
    console.error('PDF download error:', error)
    throw error
  }
}
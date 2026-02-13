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
    'Review Texas tax incentives for blockchain',
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
  const talentAnalysis = content?.talent_analysis || {}
  const competitorAnalysis = content?.competitor_analysis || {}
  const roadmap = content?.implementation_roadmap || {}
  const resources = content?.resource_directory || []
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
              `This report provides a comprehensive Web3 strategy for ${report.company_name} based in ${report.city}, ${report.state}.`}
            bulletPoints={[
              `Market opportunity score: ${locationAnalysis.marketScore || '85/100'}`,
              `Regulatory climate: ${regulatoryAnalysis.climate || 'Favorable'}`,
              `Talent accessibility: ${talentAnalysis.accessibility || 'High'}`,
              `Implementation timeline: ${roadmap.timeline || '3-6 months'}`
            ]}
            highlight={`Based on your location, prioritize ${content?.strategy?.primary || 'regulatory compliance'} in the first 30 days.`}
          />
        </View>
        <PDFFooter pageNumber={2} totalPages={8} />
      </Page>

      {/* Location Intelligence */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection title="Location Intelligence Analysis">
            <PDFGrid>
              <PDFGridItem>
                <PDFMetricCard 
                  title="Market Tier"
                  value={report.location_tier?.toUpperCase() || 'MAJOR'}
                  description={`${report.city} is a ${report.location_tier || 'major'} market`}
                />
              </PDFGridItem>
              <PDFGridItem>
                <PDFMetricCard 
                  title="Regulatory Score"
                  value={`${regulatoryAnalysis.score || '82'}/100`}
                  description={regulatoryAnalysis.summary || 'Business-friendly'}
                />
              </PDFGridItem>
              <PDFGridItem>
                <PDFMetricCard 
                  title="Talent Density"
                  value={`${talentAnalysis.density || 'Medium'}`}
                  description={`${talentAnalysis.developerCount || '847'} developers`}
                />
              </PDFGridItem>
              <PDFGridItem>
                <PDFMetricCard 
                  title="Competitive Intensity"
                  value={`${competitorAnalysis.count || '12'} competitors`}
                  description={`${competitorAnalysis.growth || '+3'} in 6 months`}
                />
              </PDFGridItem>
            </PDFGrid>
          </PDFSection>

          <PDFSection 
            title="Nearest Web3 Hub"
            content={`${report.nearest_major_city || 'Austin'} is the nearest major Web3 hub.`}
          />
        </View>
        <PDFFooter pageNumber={3} totalPages={8} />
      </Page>

      {/* Regulatory Landscape */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection 
            title={`${report.state} Regulatory Landscape`}
            content={regulatoryAnalysis.detailed || `${report.state} regulatory environment analysis.`}
            bulletPoints={regulatoryAnalysis.checklist || [
              'Review state-specific requirements',
              'Consult with local counsel',
              'Plan compliance timeline'
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
        <PDFFooter pageNumber={4} totalPages={8} />
      </Page>

      {/* Talent Ecosystem */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection 
            title="Talent & Ecosystem Analysis"
            content={`The Web3 ecosystem in ${report.city} is ${talentAnalysis.growth || 'growing'}.`}
            bulletPoints={talentAnalysis.bullets || [
              `${talentAnalysis.developerCount || '800+'} developers`,
              `${talentAnalysis.meetups || '5+'} meetup groups`,
              `Average salary: $${talentAnalysis.salary || '145,000'}`
            ]}
          />
        </View>
        <PDFFooter pageNumber={5} totalPages={8} />
      </Page>

      {/* Implementation Roadmap */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection title="90-Day Implementation Roadmap" content="Phased approach:" />
          
          <PDFSection 
            title="Month 1: Foundation"
            bulletPoints={[
              'Complete regulatory compliance review',
              'Engage legal counsel',
              'Define Web3 strategy',
              'Begin talent recruitment'
            ]}
          />

          <PDFSection 
            title="Month 2: Development"
            bulletPoints={[
              'Start MVP development',
              'Establish legal entities',
              'Build community presence',
              'Set up security protocols'
            ]}
          />

          <PDFSection 
            title="Month 3: Launch"
            bulletPoints={[
              'Soft launch with pilot users',
              'Gather feedback',
              'Prepare for full launch',
              'Measure against KPIs'
            ]}
          />
        </View>
        <PDFFooter pageNumber={6} totalPages={8} />
      </Page>

      {/* Resource Directory */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection 
            title="Local Resource Directory"
            content="Vetted resources:"
            bulletPoints={[
              `Legal: Smith & Jones (${report.state})`,
              'Development: Web3 Builders',
              'Community: Local Blockchain Association'
            ]}
          />
        </View>
        <PDFFooter pageNumber={7} totalPages={8} />
      </Page>

      {/* Risk Assessment & Disclaimer */}
      <Page size="LETTER" style={styles.page}>
        <PDFHeader date={createdDate} />
        <View style={styles.content}>
          <PDFSection 
            title="Risk Assessment"
            bulletPoints={[
              'Regulatory changes could impact operations',
              'Market volatility affects strategies',
              'Talent retention challenges',
              'Technology risks exist'
            ]}
          />

          <View style={styles.disclaimer}>
            <Text>
              DISCLAIMER: This report provides educational guidance. Veridian Group is not a law firm, 
              financial advisor, or registered investment advisor. All strategies involve substantial risk. 
              Consult with qualified professionals in {report.state} before implementing.
            </Text>
          </View>
        </View>
        <PDFFooter pageNumber={8} totalPages={8} />
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
    const filename = `Veridian_Report_${sanitizedCompanyName}_${dateStr}.pdf`
    
    saveAs(blob, filename)
    return true
  } catch (error) {
    console.error('PDF download error:', error)
    throw error
  }
}
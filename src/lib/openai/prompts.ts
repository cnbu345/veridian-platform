// src/lib/openai/prompts.ts
// Centralized prompts for regulatory intelligence reports

export interface ReportPromptParams {
  companyName: string
  industry: string
  companySize: string
  budget: string
  city: string
  state: string
  locationTier: string
  nearestRegulatoryHub?: string
  primaryFocus: string
  secondaryFocus: string[]
  timeline: string
  concerns: string
  goals: string
}

export function getRegulatoryReportPrompt(params: ReportPromptParams): string {
  return `Generate a comprehensive Regulatory Intelligence Report for ${params.companyName} 
based in ${params.city}, ${params.state}.

INSTITUTION DETAILS:
- Industry: ${params.industry}
- Institution Size: ${params.companySize}
- Compliance Budget: ${params.budget}
- Primary Compliance Focus: ${params.primaryFocus}
- Secondary Focus Areas: ${params.secondaryFocus.join(', ')}
- Timeline: ${params.timeline}

LOCATION ANALYSIS:
- Jurisdiction: ${params.city}, ${params.state}
- Market Classification: ${params.locationTier}
- Nearest Regulatory Hub: ${params.nearestRegulatoryHub || 'N/A'}

COMPLIANCE CONCERNS:
${params.concerns}

COMPLIANCE GOALS:
${params.goals}

REPORT STRUCTURE (must follow exactly):

# REGULATORY INTELLIGENCE REPORT: ${params.companyName}

## 1. EXECUTIVE SUMMARY
- Summary of key compliance findings for ${params.state}
- Overview of regulatory requirements by jurisdiction
- Critical compliance deadlines and action items
- Risk assessment summary

## 2. STATE REGULATORY ANALYSIS (${params.state})
- Current regulatory framework for digital assets
- Licensing requirements (money transmitter, BitLicense, etc.)
- Enforcement history and recent actions
- Pending legislation and regulatory trends
- State regulator contact information

## 3. MULTI-STATE LICENSING MATRIX
- Licenses required by state
- Application timelines and fees
- Bonding and capital requirements
- Renewal and reporting schedules

## 4. COMPLIANCE CHECKLIST
- Immediate actions (30 days)
- Short-term requirements (90 days)
- Ongoing compliance obligations
- Documentation requirements

## 5. COMPLIANCE IMPLEMENTATION ROADMAP
- Days 1-30: Foundation & Legal Setup
- Days 31-60: Licensing & Policy Development
- Days 61-90: Implementation & Monitoring
- Ongoing: Compliance maintenance

## 6. REGULATORY RESOURCES
- Qualified legal counsel in ${params.state}
- Compliance consultants and service providers
- Regulatory technology solutions
- Industry associations and working groups

## 7. RISK ASSESSMENT
- Regulatory risk factors
- Enforcement risk analysis
- Compliance gap assessment
- Mitigation strategies

IMPORTANT GUIDELINES:
- Use professional, authoritative tone suitable for compliance officers
- Include specific regulatory references where applicable
- Provide actionable, practical recommendations
- Be conservative and risk-aware in all recommendations

REQUIRED DISCLAIMER:
"DISCLAIMER: This report provides regulatory intelligence for informational purposes only. Veridian Group is not a law firm. All compliance strategies should be reviewed with qualified legal counsel in ${params.state} before implementation. Regulations are subject to change without notice."

Generate the complete report now:`
}

export function getExecutiveSummaryPrompt(params: ReportPromptParams): string {
  return `Write a concise executive summary for a regulatory intelligence report for ${params.companyName} in ${params.city}, ${params.state}.

Key points to cover:
- Regulatory climate in ${params.state}
- Primary compliance focus: ${params.primaryFocus}
- Timeline: ${params.timeline}
- Key concerns: ${params.concerns.substring(0, 100)}...

Keep it to 3-4 paragraphs, professional tone.`
}

export function getStateAnalysisPrompt(state: string, industry: string): string {
  return `Provide a detailed regulatory analysis for digital asset compliance in ${state} for a ${industry} company.

Include:
- Current regulatory framework
- Specific license requirements
- Enforcement history
- Pending legislation
- State regulator contact information

Format as a comprehensive section for a regulatory report.`
}

export const REPORT_SECTIONS = {
  executive: 'executive-summary',
  regulatory: 'regulatory-analysis',
  licensing: 'licensing-matrix',
  checklist: 'compliance-checklist',
  roadmap: 'implementation-roadmap',
  resources: 'regulatory-resources',
  risk: 'risk-assessment'
} as const
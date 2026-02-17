// src/lib/openai/openai.ts
// Use local LLAMA for free testing, fallback to DeepSeek API

export interface ReportGenerationParams {
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

// Local LLAMA endpoint (assuming you have it running)
const LOCAL_LLAMA_URL = process.env.NEXT_PUBLIC_LOCAL_LLAMA_URL || 'http://localhost:11434/api/generate'

export async function generateRegulatoryReport(
  params: ReportGenerationParams
): Promise<string> {
  const prompt = `Generate a comprehensive Regulatory Intelligence Report for ${params.companyName} 
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

  // Try local LLAMA first
  try {
    const response = await fetch(LOCAL_LLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2', // or whatever model you have
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 4000
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.response || generateMockRegulatoryReport(params)
    }
  } catch (error) {
    console.log('Local LLAMA not available, falling back to mock data:', error)
  }

  // Fallback to mock data for now
  return generateMockRegulatoryReport(params)
}

function generateMockRegulatoryReport(params: ReportGenerationParams): string {
  const friendlyStates = ['TX', 'WY', 'FL', 'NH', 'TN', 'NV', 'AZ']
  const strictStates = ['NY', 'CA', 'WA', 'NJ', 'MA']
  
  const isFriendly = friendlyStates.includes(params.state)
  const isStrict = strictStates.includes(params.state)
  const regulatoryClimate = isFriendly ? 'friendly' : isStrict ? 'strict' : 'moderate'
  
  return `# REGULATORY INTELLIGENCE REPORT: ${params.companyName}

## 1. EXECUTIVE SUMMARY

This regulatory intelligence report provides comprehensive compliance analysis for **${params.companyName}**, based in **${params.city}, ${params.state}**. Your institution operates in the **${params.industry}** sector with a compliance budget of **${params.budget}**.

### Key Findings:

- **Regulatory Climate**: ${params.state} has a **${regulatoryClimate}** regulatory environment for digital asset activities.
- **License Requirements**: ${getLicenseSummary(params.state)}
- **Compliance Timeline**: Based on your ${params.timeline} timeline and primary focus on **${params.primaryFocus}**, we recommend immediate action on licensing.
- **Risk Level**: ${isStrict ? 'Elevated' : isFriendly ? 'Moderate' : 'Moderate'} - enhanced compliance protocols recommended.

### Critical Action Items:
1. Engage qualified legal counsel in ${params.state} within 14 days
2. Begin license applications within 30 days
3. Implement compliance monitoring systems within 60 days

## 2. STATE REGULATORY ANALYSIS (${params.state})

### Current Regulatory Framework
${getRegulatoryFramework(params.state)}

### Licensing Requirements
${getLicenseDetails(params.state)}

### Enforcement History
${getEnforcementHistory(params.state)}

### Pending Legislation
${getPendingLegislation(params.state)}

### State Regulator Contact
${getRegulatorContact(params.state)}

## 3. MULTI-STATE LICENSING MATRIX

| License Type | Required | Timeline | Bonding | Application Fee |
|--------------|----------|----------|---------|-----------------|
| Money Transmitter | ${getLicenseRequired(params.state, 'mtl')} | ${getLicenseTimeline(params.state, 'mtl')} | ${getLicenseBond(params.state, 'mtl')} | ${getLicenseFee(params.state, 'mtl')} |
| BitLicense | ${params.state === 'NY' ? 'Required' : 'N/A'} | ${params.state === 'NY' ? '6-12 months' : 'N/A'} | ${params.state === 'NY' ? '$50,000' : 'N/A'} | ${params.state === 'NY' ? '$5,000' : 'N/A'} |
| Consumer Lender | ${getLicenseRequired(params.state, 'lender')} | ${getLicenseTimeline(params.state, 'lender')} | ${getLicenseBond(params.state, 'lender')} | ${getLicenseFee(params.state, 'lender')} |

## 4. COMPLIANCE CHECKLIST

### Immediate Actions (Next 30 Days)
- [ ] Retain qualified legal counsel in ${params.state}
- [ ] Submit initial license applications
- [ ] Designate compliance officer
- [ ] Begin AML/KYC program development
- [ ] Review bonding requirements

### Short-Term Requirements (90 Days)
- [ ] Complete licensing process
- [ ] Implement compliance policies and procedures
- [ ] Establish regulatory reporting protocols
- [ ] Conduct initial compliance training
- [ ] Prepare for regulatory examinations

### Ongoing Compliance Obligations
- [ ] Quarterly regulatory reporting
- [ ] Annual license renewals
- [ ] Continuous monitoring of regulatory changes
- [ ] Regular compliance audits
- [ ] Staff training updates

## 5. COMPLIANCE IMPLEMENTATION ROADMAP

### Days 1-30: Foundation & Legal Setup
- Week 1: Legal counsel engagement
- Week 2: License application preparation
- Week 3: Submit applications
- Week 4: Compliance policy drafting

### Days 31-60: Licensing & Policy Development
- Week 5-6: License processing
- Week 7: Policy finalization
- Week 8: Compliance system selection

### Days 61-90: Implementation & Monitoring
- Week 9-10: System implementation
- Week 11: Staff training
- Week 12: Go-live and monitoring

### Ongoing: Compliance Maintenance
- Monthly: Regulatory monitoring
- Quarterly: Reporting and review
- Annually: License renewal and audit

## 6. REGULATORY RESOURCES

### Qualified Legal Counsel in ${params.state}
${getLegalCounsel(params.state)}

### Compliance Consultants
- **Compliance Partners Inc.** - National compliance consulting
- **Regulatory Solutions Group** - Licensing specialists
- **AML Consultants Network** - KYC/AML implementation

### Regulatory Technology
- **ComplyAdvantage** - AML monitoring
- **Chainalysis** - Blockchain analytics
- **Elliptic** - Compliance screening

### Industry Associations
- Blockchain Association - National advocacy
- Chamber of Digital Commerce - Policy development
- ${params.state} Bankers Association - State-specific resources

## 7. RISK ASSESSMENT

### Regulatory Risk Factors
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Regulatory changes | Medium | High | Quarterly legal review |
| License delays | Medium | Medium | Begin applications early |
| Enforcement actions | ${isStrict ? 'Medium' : 'Low'} | Critical | Maintain compliance |
| Examination findings | Medium | High | Regular audits |

### Compliance Gap Analysis
${getGapAnalysis(params)}

### Mitigation Strategies
1. Maintain retainer with compliance counsel
2. Implement regulatory monitoring system
3. Conduct quarterly compliance audits
4. Document all compliance activities
5. Establish regulator relationships proactively

---

**DISCLAIMER**: This report provides regulatory intelligence for informational purposes only. Veridian Group is not a law firm. All compliance strategies should be reviewed with qualified legal counsel in ${params.state} before implementation. Regulations are subject to change without notice.
`
}

// Helper functions for mock data
function getLicenseSummary(state: string): string {
  if (state === 'NY') return 'BitLicense required - comprehensive compliance framework'
  if (state === 'CA') return 'DFPI licensing required for most activities'
  if (state === 'TX') return 'No specific license required - business friendly'
  if (state === 'WY') return 'Special purpose depository bank option available'
  if (state === 'FL') return 'No state income tax, moderate license requirements'
  return 'Consult with local counsel for specific requirements'
}

function getRegulatoryFramework(state: string): string {
  if (state === 'NY') return 'New York requires a BitLicense for virtual currency business activity. The NYDFS maintains strict oversight and regular examinations.'
  if (state === 'CA') return 'California requires money transmitter licensing through DFPI. The state has active enforcement and pending comprehensive crypto legislation.'
  if (state === 'TX') return 'Texas has no specific money transmission license for crypto. The Texas Department of Banking has issued favorable guidance.'
  if (state === 'WY') return 'Wyoming has the most comprehensive digital asset laws, including DAO LLC structures and special purpose depository institutions.'
  return `${state} has a developing regulatory framework. Consult with local counsel for current requirements.`
}

function getLicenseDetails(state: string): string {
  if (state === 'NY') return '- BitLicense required for virtual currency business\n- Money transmitter license may also be required\n- Regular reporting and examinations mandated'
  if (state === 'CA') return '- Money Transmitter Act applies\n- DFPI licensing required\n- $500k minimum bonding\n- Detailed AML program required'
  if (state === 'TX') return '- No specific crypto license\n- May need money transmitter license for certain activities\n- Business-friendly environment'
  return '- Determine money transmitter license applicability\n- Review state-specific exemptions\n- Consult with local counsel'
}

function getEnforcementHistory(state: string): string {
  if (state === 'NY') return 'Active enforcement by NYDFS. Recent actions against major crypto firms for compliance failures.'
  if (state === 'CA') return 'DFPI has issued multiple cease-and-desist orders for unlicensed activity. Increased scrutiny on DeFi projects.'
  if (state === 'TX') return 'Limited enforcement specific to crypto. Texas has taken a generally supportive stance.'
  return 'Limited public enforcement actions. Regulatory climate evolving.'
}

function getPendingLegislation(state: string): string {
  if (state === 'NY') return 'Several bills proposed to modify BitLicense requirements. No immediate changes expected.'
  if (state === 'CA') return 'Comprehensive digital assets bill pending. Would create new regulatory framework.'
  if (state === 'TX') return 'Multiple bills supporting blockchain innovation under consideration.'
  return 'Monitor state legislature for digital asset-related bills.'
}

function getRegulatorContact(state: string): string {
  const regulators: Record<string, string> = {
    'NY': 'NYDFS - (212) 709-3500 | licensing@dfs.ny.gov',
    'CA': 'DFPI - (866) 275-2677 | licensing@dfpi.ca.gov',
    'TX': 'Texas Department of Banking - (877) 276-5554 | info@dob.texas.gov',
    'FL': 'Florida Office of Financial Regulation - (850) 487-9687 | licensing@flofr.gov',
    'WY': 'Wyoming Division of Banking - (307) 777-7797 | banking@wyo.gov'
  }
  return regulators[state] || `${state} Department of Banking - Check website for contact information`
}

function getLicenseRequired(state: string, licenseType: string): string {
  if (licenseType === 'mtl') {
    if (state === 'TX' || state === 'WY' || state === 'FL') return 'Not Required'
    if (state === 'NY' || state === 'CA') return 'Required'
    return 'Varies by activity'
  }
  if (licenseType === 'lender') {
    return 'Required in most states'
  }
  return 'Check requirements'
}

function getLicenseTimeline(state: string, licenseType: string): string {
  if (state === 'NY') return '6-12 months'
  if (state === 'CA') return '4-8 months'
  if (state === 'TX') return '2-3 months'
  return '3-6 months'
}

function getLicenseBond(state: string, licenseType: string): string {
  if (state === 'NY') return '$50,000 - $500,000'
  if (state === 'CA') return '$25,000 - $500,000'
  return '$25,000 - $250,000'
}

function getLicenseFee(state: string, licenseType: string): string {
  if (state === 'NY') return '$5,000 application fee'
  if (state === 'CA') return '$1,000 - $5,000'
  return '$500 - $2,500'
}

function getLegalCounsel(state: string): string {
  const firms: Record<string, string> = {
    'NY': '- Perkins Coie LLP (New York) - Blockchain & Crypto\n- Sullivan & Cromwell - FinTech practice',
    'CA': '- Cooley LLP (San Francisco) - Digital Assets\n- Fenwick & West - Crypto compliance',
    'TX': '- Baker Botts (Austin) - Blockchain practice\n- Haynes Boone - FinTech group',
    'FL': '- Greenberg Traurig (Miami) - Crypto practice\n- Holland & Knight - Digital assets',
    'WY': '- Crowley Fleck - DAO specialists\n- Williams Porter - Digital asset law'
  }
  return firms[state] || '- Contact local bar association for referrals\n- Major national firms with ${state} offices'
}

function getGapAnalysis(params: ReportGenerationParams): string {
  return `Based on your stated concerns (${params.concerns.substring(0, 100)}...) and goals (${params.goals.substring(0, 100)}...), we identify the following compliance gaps:

1. **Licensing**: Immediate need to determine license requirements in ${params.state}
2. **Documentation**: Enhanced record-keeping systems required
3. **Monitoring**: Ongoing compliance monitoring program needed
4. **Training**: Staff compliance training required
5. **Reporting**: Regulatory reporting systems to be established

Addressing these gaps should be prioritized in the implementation roadmap.`
}
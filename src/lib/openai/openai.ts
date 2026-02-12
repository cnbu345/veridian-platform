// Use DeepSeek API (OpenAI compatible)
export async function generateWeb3Report(
  companyData: {
    name: string
    industry: string
    size: string
    budget: string
  },
  locationData: any,
  concerns: string
): Promise<string> {
  const prompt = `Generate a comprehensive Web3 strategy report for ${companyData.name} 
based in ${locationData.city}, ${locationData.state}.

COMPANY DETAILS:
- Industry: ${companyData.industry}
- Company Size: ${companyData.size}
- Budget: ${companyData.budget}
- Primary Concerns: ${concerns}

LOCATION ANALYSIS:
- Location Tier: ${locationData.tier}
- State: ${locationData.state}
- ${locationData.tier === 'major' ? `Major metropolitan area with strong infrastructure` : ''}
- ${locationData.tier === 'suburban' ? `Suburban area near ${locationData.nearestMajorCity || 'major city'}` : ''}
- ${locationData.tier === 'rural' ? `Rural area, nearest major hub: ${locationData.nearestMajorCity} (${locationData.distanceToMajor} miles)` : ''}
- Nearest Web3 Hub: ${locationData.nearestWeb3Hub} (${locationData.web3HubType || 'hub'})

REPORT STRUCTURE:
1. EXECUTIVE SUMMARY
   - Key Opportunities for ${companyData.name}
   - Location Advantages in ${locationData.city}, ${locationData.state}
   - Risk Assessment Summary

2. LOCATION-SPECIFIC OPPORTUNITIES
   - Web3 Talent Pool Access
   - Local Crypto Regulations in ${locationData.state}
   - Infrastructure Availability
   - Partnership Opportunities in ${locationData.nearestWeb3Hub}

3. STATE REGULATORY LANDSCAPE
   - ${locationData.state} Crypto Laws Summary
   - Tax Implications
   - Compliance Requirements
   - Recommended Legal Counsel in State

4. 90-DAY IMPLEMENTATION ROADMAP
   - Month 1: Foundation & Education
   - Month 2: Pilot Program Design
   - Month 3: Launch & Community Building

5. RESOURCE DIRECTORY
   - Local Web3 Meetups & Events
   - ${locationData.state} Blockchain Organizations
   - Recommended Service Providers
   - Funding Opportunities

6. RISK MITIGATION
   - Location-Specific Risks
   - Regulatory Compliance Plan
   - Security Protocols
   - Contingency Planning

TONE: Professional, authoritative, actionable. Write as a top-tier consulting firm.
LENGTH: Approximately 5 pages worth of content.
FORMAT: Use markdown with clear headers, bullet points, and numbered lists.

IMPORTANT: Include this disclaimer at the end:
"DISCLAIMER: This report provides educational guidance and strategic recommendations based on AI analysis. ${companyData.name} should consult with licensed legal, financial, and technical professionals in ${locationData.state} before implementing any Web3 strategies. Regulations vary by location and change frequently. Veridian Group is not responsible for implementation outcomes."

Now generate the comprehensive report:`

  try {
    // For now, return mock data. Replace with actual API call.
    // In production, use DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      // Fallback to mock response for testing
      return generateMockReport(companyData, locationData, concerns)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || generateMockReport(companyData, locationData, concerns)
    
  } catch (error) {
    console.error('AI API Error:', error)
    return generateMockReport(companyData, locationData, concerns)
  }
}

function generateMockReport(companyData: any, locationData: any, concerns: string): string {
  return `# Web3 Strategy Report for ${companyData.name}

## Executive Summary

${companyData.name}, based in ${locationData.city}, ${locationData.state}, has significant opportunities in the Web3 space. Your location (${locationData.tier} tier) provides unique advantages for ${companyData.industry} industry transformation.

### Key Findings:
1. **Location Advantage**: ${locationData.city} offers ${locationData.tier === 'major' ? 'direct access to major Web3 talent and infrastructure' : locationData.tier === 'suburban' ? 'proximity to resources in nearby metropolitan areas' : 'opportunities for remote-first Web3 operations'}.
2. **Regulatory Environment**: ${locationData.state} has ${getRegulatorySummary(locationData.state)}.
3. **Implementation Readiness**: Based on your ${companyData.size} size and ${companyData.budget} budget, we recommend a phased approach.

## Location-Specific Opportunities

### Talent Access
- **Local Talent**: ${locationData.tier === 'major' ? 'Strong local Web3 developer community' : 'Consider remote hiring or relocation packages'}
- **Nearby Hubs**: Access to talent from ${locationData.nearestWeb3Hub}

### Infrastructure
- High-speed internet availability assessment
- Local data center partnerships
- Energy costs and sustainability considerations

## ${locationData.state} Regulatory Compliance

### Key Regulations
${getStateRegulations(locationData.state)}

### Recommended Actions
1. Register appropriate business entities
2. Obtain necessary licenses
3. Implement KYC/AML procedures
4. Maintain proper record-keeping

## 90-Day Implementation Roadmap

### Month 1: Foundation
- Team education and training
- Legal structure setup
- Technology stack selection
- Partner identification

### Month 2: Development
- MVP design and development
- Community building
- Regulatory compliance setup
- Security audit planning

### Month 3: Launch
- Pilot program launch
- Performance monitoring
- Scale planning
- Community engagement

## Resource Directory

### Local Organizations
- ${locationData.state} Blockchain Association
- ${locationData.nearestWeb3Hub} Web3 Meetup
- University blockchain programs in state

### Service Providers
- Legal firms specializing in crypto law
- Accounting firms with crypto experience
- Development agencies

### Funding Sources
- Local angel investor networks
- State economic development grants
- Web3-focused VC firms

## Risk Assessment

### Identified Risks
1. Regulatory changes in ${locationData.state}
2. Market volatility
3. Technology adoption barriers
4. Security vulnerabilities

### Mitigation Strategies
- Regular compliance reviews
- Diversified tokenomics
- Phased implementation
- Multi-signature security

---

**Disclaimer**: This report provides educational guidance. Consult with licensed professionals in ${locationData.state} for legal/financial advice.`
}

function getRegulatorySummary(state: string): string {
  const friendlyStates = ['TX', 'WY', 'FL', 'NH', 'TN', 'NV']
  const strictStates = ['NY', 'CA', 'WA']
  
  if (friendlyStates.includes(state)) return 'a crypto-friendly regulatory environment'
  if (strictStates.includes(state)) return 'strict regulations requiring careful compliance'
  return 'moderate regulations with growing crypto acceptance'
}

function getStateRegulations(state: string): string {
  const regulations: Record<string, string> = {
    'TX': '- No specific money transmission license required for crypto\n- Business-friendly environment\n- No state income tax',
    'CA': '- Money transmission laws apply\n- DFPI licensing may be required\n- Strict consumer protection laws',
    'NY': '- BitLicense required for crypto businesses\n- Stringent compliance requirements\n- Regular audits necessary',
    'FL': '- No state income tax\n- Generally crypto-friendly\n- Money services business registration may be needed',
    'WY': '- Most crypto-friendly state\n- Special purpose depository institutions allowed\n- Clear legal framework'
  }
  
  return regulations[state] || '- Consult with local legal counsel for specific regulations\n- Monitor state legislative developments\n- Consider joining state blockchain associations'
}
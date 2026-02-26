// src/lib/openai/openai.ts
import { generateWithAI } from '../ai/service'
import { generateMockRegulatoryReport } from './mockData'
import { getRegulatoryReportPrompt } from './prompts'
import { ReportFormatter } from '../pdf/reportFormatter'

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

export interface FormattedReportOutput {
  raw: string
  formatted: ReturnType<ReportFormatter['format']>
}

export async function generateRegulatoryReport(
  params: ReportGenerationParams
): Promise<FormattedReportOutput> {
  const prompt = getRegulatoryReportPrompt(params)

  try {
    // Try AI generation first
    const result = await generateWithAI(prompt, params)
    console.log(`Report generated with ${result.provider}`, {
      tokens: result.usage
    })
    
    // Format the raw AI output into a beautiful, structured report
    const formatter = new ReportFormatter(result.content)
    const formatted = formatter.format()
    
    return {
      raw: result.content,
      formatted
    }
  } catch (error) {
    console.error('AI generation failed, falling back to mock:', error)
    const mockContent = generateMockRegulatoryReport(params)
    const formatter = new ReportFormatter(mockContent)
    const formatted = formatter.format()
    
    return {
      raw: mockContent,
      formatted
    }
  }
}
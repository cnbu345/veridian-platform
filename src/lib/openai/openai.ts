// src/lib/openai/openai.ts // Main AI generation function

import { generateWithAI } from '../ai/service';
import { generateMockRegulatoryReport } from './mockData';
import { getRegulatoryReportPrompt } from './prompts';

export interface ReportGenerationParams {
  companyName: string;
  industry: string;
  companySize: string;
  budget: string;
  city: string;
  state: string;
  locationTier: string;
  nearestRegulatoryHub?: string;
  primaryFocus: string;
  secondaryFocus: string[];
  timeline: string;
  concerns: string;
  goals: string;
}

export async function generateRegulatoryReport(
  params: ReportGenerationParams
): Promise<string> {
  const prompt = getRegulatoryReportPrompt(params);

  try {
    // Try AI generation first
    const result = await generateWithAI(prompt, params);
    console.log(`Report generated with ${result.provider}`, {
      tokens: result.usage
    });
    return result.content;
  } catch (error) {
    console.error('AI generation failed, falling back to mock:', error);
    return generateMockRegulatoryReport(params);
  }
}
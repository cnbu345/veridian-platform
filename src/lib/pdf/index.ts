// src/lib/pdf/index.ts
// Factory pattern to select the appropriate PDF generator based on template availability

import { GeneratedReport } from '@/lib/reports/types'
import { generateReportPDF, downloadReportPDF, savePDFToStorage } from './generator'
import { generateCustomReportPDF } from './generator.custom'

// Template interface
interface Template {
  id: string
  name: string
  logo_url: string | null
  styles: {
    primary_color: string
    secondary_color: string
    font_family: string
    show_logo: boolean
    show_page_numbers: boolean
  }
  sections?: any[]
}

// Main generator that selects the correct PDF type
export async function generatePDF(
  report: GeneratedReport & { template?: Template | null },
  template?: Template | null
): Promise<Blob> {
  // If a custom template is provided and has custom styles, use custom generator
  if (template && template.id && template.styles) {
    console.log('🎨 Using custom template generator for:', template.name)
    return generateCustomReportPDF(report, template)
  }
  
  // Otherwise use the standard Veridian template
  console.log('📄 Using standard Veridian template generator')
  return generateReportPDF(report)
}

// Main download function that selects the correct PDF type
export async function downloadPDF(
  report: GeneratedReport & { template?: Template | null }
): Promise<Blob> {
  try {
    console.log('📥 Starting PDF download for report:', report.id)
    
    if (!report || !report.id || !report.company_name) {
      throw new Error('Invalid report data')
    }
    
    // Check if we have a template to use
    const template = report.template || null
    
    // Check if we already have a stored PDF URL
    if (report.pdf_url) {
      console.log('📎 Found existing PDF URL, downloading...')
      const response = await fetch(report.pdf_url)
      if (response.ok) {
        const blob = await response.blob()
        console.log('✅ Downloaded existing PDF, size:', blob.size, 'bytes')
        return blob
      }
      console.log('⚠️ Failed to download existing PDF, will regenerate')
    }
    
    // Generate new PDF with appropriate generator
    const blob = await generatePDF(report, template)
    
    if (!blob || blob.size === 0) {
      throw new Error('Generated PDF is empty')
    }
    
    console.log('✅ PDF generation complete, size:', blob.size, 'bytes')
    return blob
    
  } catch (error) {
    console.error('❌ PDF download error:', error)
    throw error
  }
}

// Re-export storage function
export { savePDFToStorage } from './generator'
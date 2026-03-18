// src/lib/storage/batch-download.ts
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { ClientStorage } from './client-storage'

export interface Report {
  id: string
  company_name: string
  created_at: string
  pdf_url?: string | null
  status?: string
}

export class BatchDownloader {
  /**
   * Download multiple reports as a ZIP file
   */
  static async downloadReportsAsZip(
    reports: Report[],
    options: {
      zipName?: string
      onProgress?: (progress: number) => void
    } = {}
  ) {
    const {
      zipName = `reports-export-${new Date().toISOString().split('T')[0]}.zip`,
      onProgress
    } = options

    const zip = new JSZip()
    const folder = zip.folder('reports')
    
    if (!folder) {
      throw new Error('Failed to create ZIP folder')
    }

    let successCount = 0
    let failCount = 0
    const errors: Array<{ reportId: string; error: string }> = []

    // Process each report
    for (let i = 0; i < reports.length; i++) {
      const report = reports[i]
      
      try {
        // Update progress
        if (onProgress) {
          onProgress(Math.round((i / reports.length) * 100))
        }

        // Skip if report is not ready
        if (report.status !== 'ready') {
          throw new Error('Report is not ready')
        }

        // Check if we have a PDF URL
        if (!report.pdf_url) {
          throw new Error('No PDF available')
        }

        // Fetch the PDF
        const blob = await ClientStorage.fetchPDFBlob(report.pdf_url)
        
        // Create clean filename
        const fileName = `${report.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${new Date(report.created_at).toISOString().split('T')[0]}.pdf`
        
        // Add to ZIP
        folder.file(fileName, await blob.arrayBuffer())
        successCount++
      } catch (error) {
        failCount++
        errors.push({
          reportId: report.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Final progress
    if (onProgress) {
      onProgress(100)
    }

    // Generate and download ZIP
    const content = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })
    
    saveAs(content, zipName)

    return {
      total: reports.length,
      success: successCount,
      failed: failCount,
      errors
    }
  }
}
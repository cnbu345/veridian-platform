// src/lib/pdf/download.ts
// Client-safe PDF download utility

export class PDFDownloader {
  /**
   * Download a PDF from a URL
   */
  static async downloadFromUrl(url: string, fileName: string): Promise<void> {
    try {
      console.log('📥 Downloading PDF from:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty')
      }
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      }, 100)
      
      console.log('✅ Download complete, size:', blob.size, 'bytes')
    } catch (error) {
      console.error('❌ Download failed:', error)
      throw error
    }
  }

  /**
   * Get a PDF URL for a report
   */
  static async refreshPDFUrl(reportId: string): Promise<string | null> {
    try {
      console.log('🔍 Fetching PDF for report:', reportId)

      // Use GET to fetch the PDF
      const response = await fetch(`/api/reports/${reportId}/pdf`, {
        method: 'GET'
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', response.headers)
      
      if (!response.ok) {
        console.error('Failed to get PDF:', response.status)
        return null
      }
      
      // Get the PDF blob and create a local object URL
      const blob = await response.blob()
      console.log('📄 PDF blob size:', blob.size)

      const localUrl = URL.createObjectURL(blob)
      return localUrl
    } catch (error) {
      console.error('Failed to refresh PDF URL:', error)
      return null
    }
  }

  /**
   * Generate a clean filename from company name
   */
  static generateFileName(companyName: string, date?: string): string {
    const cleanName = companyName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50)
    
    const dateStr = date || new Date().toISOString().split('T')[0]
    return `${cleanName}_Regulatory_Report_${dateStr}.pdf`
  }
}
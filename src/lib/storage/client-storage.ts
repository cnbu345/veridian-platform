// src/lib/storage/client-storage.ts
// Client-safe storage operations (does NOT use next/headers)

export class ClientStorage {
  /**
   * Download a PDF from a URL (client-side only)
   */
  static async downloadPDF(url: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      
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
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  }

  /**
   * Fetch a PDF blob from URL
   */
  static async fetchPDFBlob(url: string): Promise<Blob> {
    try {
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
        
        return blob
    } catch (error) {
        console.error('Fetch failed:', error)
        throw error
    }
    }

    // Get stored PDF URL for a report (if available)
  static getStoredPDFUrl(report: any): string | null {
    // If the report has a pdf_url and it's a Supabase URL, use it
    if (report.pdf_url) {
      return report.pdf_url
    }
    return null
  }
}
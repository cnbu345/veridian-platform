// src/lib/storage/report-storage.ts
import { createClient } from '@/lib/supabase/server'
import { GeneratedReport } from '@/lib/reports/types'

export interface StoredReport {
  reportId: string
  userId: string
  fileName: string
  storagePath: string
  publicUrl: string
  fileSize: number
  createdAt: string
}

export class ReportStorage {
  private bucketName = 'reports'

  /**
   * Save a generated PDF to storage
   */
  static async saveReportPDF(
    report: GeneratedReport,
    pdfBlob: Blob
  ): Promise<{ storagePath: string; publicUrl: string; fileSize: number } | null> {
    try {
      const supabase = await createClient()
      
      // Create a clean filename
      const sanitizedCompanyName = report.company_name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 50)
      
      const fileName = `${sanitizedCompanyName}_Regulatory_Report_${new Date().toISOString().split('T')[0]}.pdf`
      const storagePath = `${report.user_id}/${report.id}/${fileName}`
      
      // Convert blob to file
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' })
      
      // Upload to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('reports')
        .upload(storagePath, file, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: true // Replace if exists
        })

      if (error) {
        console.error('Storage upload error:', error)
        return null
      }

      // Get public URL (signed URL for security)
      const { data: { signedUrl } } = await supabase
        .storage
        .from('reports')
        .createSignedUrl(storagePath, 31536000) // 1 year expiry

      if (!signedUrl) {
        console.error('Failed to generate signed URL')
        return null
      }

      // Update reports table with storage info
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          storage_path: storagePath,
          pdf_url: signedUrl,
          file_size: pdfBlob.size,
          updated_at: new Date().toISOString()
        })
        .eq('id', report.id)

      if (updateError) {
        console.error('Failed to update report with storage info:', updateError)
        // Still return the URL even if update fails
      }

      return {
        storagePath,
        publicUrl: signedUrl,
        fileSize: pdfBlob.size
      }
    } catch (error) {
      console.error('Error in saveReportPDF:', error)
      return null
    }
  }

  /**
   * Get the stored PDF URL for a report
   */
  static async getReportPDFUrl(report: GeneratedReport): Promise<string | null> {
    // If we already have a valid URL, use it
    if (report.pdf_url) {
      // Check if URL is expired (signed URLs expire)
      const supabase = await createClient()
      
      // Generate a fresh signed URL
      if (report.storage_path) {
        const { data: { signedUrl } } = await supabase
          .storage
          .from('reports')
          .createSignedUrl(report.storage_path, 31536000) // 1 year
        
        if (signedUrl) {
          // Update the stored URL
          await supabase
            .from('reports')
            .update({ pdf_url: signedUrl })
            .eq('id', report.id)
          
          return signedUrl
        }
      }
      
      return report.pdf_url
    }
    
    return null
  }

  /**
   * Check if a report has a stored PDF
   */
  static async hasStoredPDF(report: GeneratedReport): Promise<boolean> {
    if (!report.storage_path) return false
    
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .storage
        .from('reports')
        .list(report.storage_path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: report.storage_path.split('/').pop()
        })

      return !error && data && data.length > 0
    } catch {
      return false
    }
  }

  /**
   * Delete a stored PDF
   */
  static async deleteReportPDF(report: GeneratedReport): Promise<boolean> {
    if (!report.storage_path) return true
    
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .storage
        .from('reports')
        .remove([report.storage_path])

      if (error) {
        console.error('Error deleting PDF:', error)
        return false
      }

      // Clear storage fields
      await supabase
        .from('reports')
        .update({
          storage_path: null,
          pdf_url: null,
          file_size: null
        })
        .eq('id', report.id)

      return true
    } catch (error) {
      console.error('Error in deleteReportPDF:', error)
      return false
    }
  }

  /**
   * Batch generate signed URLs for multiple reports
   */
  static async batchGetPDFUrls(reports: GeneratedReport[]): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>()
    const supabase = await createClient()
    
    for (const report of reports) {
      if (report.storage_path) {
        const { data: { signedUrl } } = await supabase
          .storage
          .from('reports')
          .createSignedUrl(report.storage_path, 31536000)
        
        if (signedUrl) {
          urlMap.set(report.id, signedUrl)
        }
      }
    }
    
    return urlMap
  }
}
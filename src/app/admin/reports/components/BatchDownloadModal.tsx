// src/app/admin/reports/components/BatchDownloadModal.tsx
'use client'

import { useState } from 'react'
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Archive
} from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface BatchDownloadModalProps {
  reports: any[]
  onClose: () => void
}

export default function BatchDownloadModal({ reports, onClose }: BatchDownloadModalProps) {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentReport, setCurrentReport] = useState('')
  const [results, setResults] = useState<{
    total: number
    success: number
    failed: number
    errors: Array<{ reportId: string; error: string }>
  } | null>(null)

  // Filter out reports that aren't ready
  const readyReports = reports.filter(r => r.status === 'ready')
  const skippedCount = reports.length - readyReports.length

  const handleDownload = async () => {
    setDownloading(true)
    setProgress(0)

    try {
      const zip = new JSZip()
      
      let successCount = 0
      let failCount = 0
      const errors: Array<{ reportId: string; error: string }> = []

      // Process each report sequentially
      for (let i = 0; i < readyReports.length; i++) {
        const report = readyReports[i]
        const progressPercent = Math.round((i / readyReports.length) * 100)
        setProgress(progressPercent)
        setCurrentReport(report.company_name)
        
        try {
          console.log(`[${i + 1}/${readyReports.length}] 📥 Fetching PDF for: ${report.company_name} (ID: ${report.id})`)
          
          const response = await fetch(`/api/reports/${report.id}/pdf`, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache'
            }
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const blob = await response.blob()
          
          if (blob.size === 0) {
            throw new Error('Empty PDF (0 bytes)')
          }
          
          // Generate a UNIQUE filename using report ID to prevent overwrites
          const safeCompanyName = report.company_name.replace(/[^a-zA-Z0-9]/g, '_')
          const dateStr = new Date(report.created_at).toISOString().split('T')[0]
          const uniqueId = report.id.slice(0, 8) // First 8 chars of UUID for uniqueness
          const fileName = `${safeCompanyName}_${dateStr}_${uniqueId}.pdf`
          
          console.log(`[${i + 1}/${readyReports.length}] 📄 Adding file: ${fileName} (${blob.size} bytes)`)
          
          // Add to ZIP - use the unique filename
          zip.file(`reports/${fileName}`, blob)
          
          console.log(`[${i + 1}/${readyReports.length}] ✅ Successfully added ${fileName}`)
          successCount++
          
        } catch (error) {
          console.error(`[${i + 1}/${readyReports.length}] ❌ Failed for ${report.company_name}:`, error)
          failCount++
          errors.push({
            reportId: report.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      setProgress(100)
      setCurrentReport('')

      // Generate and download ZIP
      if (successCount > 0) {
        console.log(`📦 Creating ZIP with ${successCount} files...`)
        
        // Log all files that will be in the ZIP
        const files = Object.keys(zip.files)
        console.log('Files in ZIP:', files)
        
        const content = await zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        })
        
        const zipFileName = `reports-export-${new Date().toISOString().split('T')[0]}.zip`
        saveAs(content, zipFileName)
        
        console.log(`✅ ZIP downloaded: ${content.size} bytes (${successCount} files)`)
      } else {
        console.log('❌ No PDFs were successfully downloaded')
      }

      setResults({
        total: readyReports.length,
        success: successCount,
        failed: failCount,
        errors
      })
    } catch (error) {
      console.error('Batch download failed:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy-900">Batch Download Reports</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-navy-400" />
            </button>
          </div>

          {!results ? (
            <>
              {skippedCount > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    ⚠️ {skippedCount} report(s) skipped because they're not ready for download
                  </p>
                </div>
              )}

              <p className="text-navy-600 mb-4">
                You are about to download <span className="font-bold">{readyReports.length}</span> report(s) as a ZIP file.
                {readyReports.length > 10 && (
                  <span className="block mt-2 text-amber-600 text-sm">
                    ⚠️ Large download may take a few minutes
                  </span>
                )}
              </p>

              {downloading && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-navy-600 mb-2">
                    <span>
                      {currentReport ? `Downloading: ${currentReport}` : 'Preparing reports...'}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gold-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={downloading}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading || readyReports.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700 disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  {downloading ? 'Creating ZIP...' : 'Download ZIP'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {results.failed === 0 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  )}
                  <div>
                    <h3 className="font-semibold text-navy-900">Download Complete</h3>
                    <p className="text-sm text-navy-500">
                      {results.success} of {results.total} reports downloaded successfully
                    </p>
                  </div>
                </div>

                {results.failed > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-sm font-medium text-red-600 mb-2">
                      Failed downloads ({results.failed}):
                    </p>
                    <div className="max-h-32 overflow-y-auto text-xs text-navy-500 space-y-1">
                      {results.errors.map((err, idx) => (
                        <div key={idx}>• {err.reportId.slice(0,8)}: {err.error}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-navy-900 text-white rounded-lg text-sm hover:bg-navy-800"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
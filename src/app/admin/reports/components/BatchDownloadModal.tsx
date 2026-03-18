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
import { BatchDownloader } from '@/lib/storage/batch-download'

interface BatchDownloadModalProps {
  reports: any[]
  onClose: () => void
}

export default function BatchDownloadModal({ reports, onClose }: BatchDownloadModalProps) {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
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
        // First, refresh all PDF URLs
        const refreshedReports = []
        
        for (let i = 0; i < readyReports.length; i++) {
        const report = readyReports[i]
        setProgress(Math.round((i / readyReports.length) * 50))
        
        try {
            // Try to get a fresh URL
            const freshUrl = await PDFDownloader.refreshPDFUrl(report.id)
            
            if (freshUrl) {
            refreshedReports.push({
                ...report,
                pdf_url: freshUrl
            })
            } else {
            refreshedReports.push(report)
            }
        } catch {
            refreshedReports.push(report)
        }
        }

        // Then download the ZIP with fresh URLs
        const result = await BatchDownloader.downloadReportsAsZip(refreshedReports, {
        zipName: `reports-export-${new Date().toISOString().split('T')[0]}.zip`,
        onProgress: (progress) => {
            setProgress(50 + Math.round(progress * 0.5))
        }
        })
        
        setResults(result)
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
                    <span>Preparing reports...</span>
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
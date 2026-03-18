//src/app/admin/components/RecentReports.tsx // RECENT REPORTS
'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Report {
  id: string
  company_name: string
  state: string
  status: 'generating' | 'ready' | 'failed'
  created_at: string
  user_id: string
}

export default function RecentReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchReports()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('reports-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          if (autoRefresh) fetchReports()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [autoRefresh])

  const fetchReports = async () => {
    try {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      setReports(data || [])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'generating':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-navy-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'generating':
        return 'bg-blue-100 text-blue-800'
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-navy-100 text-navy-800'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-navy-900">Recent Reports</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-300"
            />
            Auto-refresh
          </label>
          <button
            onClick={fetchReports}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 text-navy-500" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getStatusIcon(report.status)}
                </div>
                <div>
                  <h3 className="font-medium text-navy-900">{report.company_name}</h3>
                  <p className="text-sm text-navy-500">
                    {report.state} • {format(new Date(report.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
                
                {report.status === 'ready' && (
                  <button 
                    onClick={async () => {
                      try {
                        const { PDFDownloader } = await import('@/lib/pdf/download')
                        const fileName = PDFDownloader.generateFileName(
                          report.company_name, 
                          new Date(report.created_at).toISOString().split('T')[0]
                        )
                        
                        // Try to get a fresh URL
                        const freshUrl = await PDFDownloader.refreshPDFUrl(report.id)
                        
                        if (freshUrl) {
                          await PDFDownloader.downloadFromUrl(freshUrl, fileName)
                        } else {
                          alert('PDF not available for download')
                        }
                      } catch (error) {
                        console.error('Download failed:', error)
                        alert('Failed to download PDF. Please try again.')
                      }
                    }}
                    className="p-2 hover:bg-slate-200 rounded-lg"
                  >
                    <Download className="w-4 h-4 text-navy-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
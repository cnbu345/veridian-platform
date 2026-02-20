// src/app/dashboard/reports/page.tsx
import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserReports } from '@/lib/reports/storage'
import ReportsList from '../components/ReportsList'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

export default async function ReportsPage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  try {
    const reports = await getUserReports(user.id)
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 mb-1">My Reports</h1>
            <p className="text-navy-600">
              View and manage all your regulatory intelligence reports
            </p>
          </div>
          
          <Link
            href="/generate"
            className="inline-flex items-center px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Link>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No reports yet</h3>
            <p className="text-navy-600 mb-6">
              Generate your first regulatory intelligence report to get started.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Your First Report
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <ReportsList reports={reports} />
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error loading reports:', error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600">Failed to load reports. Please try again.</p>
      </div>
    )
  }
}
// src/app/dashboard/reports/page.tsx
import { createClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserReports } from '@/lib/reports/storage'
import ReportsList from '../components/ReportsList'
import Link from 'next/link'
import { Plus, FileText, Sparkles, ArrowRight } from 'lucide-react'

export default async function ReportsPage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth')
  }

  try {
    const reports = await getUserReports(user.id)
    
    return (
      <div className="space-y-6">
        {/* Premium Header with gradient and decorative elements */}
        <div className="relative">
          {/* Decorative gradient line */}
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold-400 via-gold-600 to-gold-400 rounded-full" />
          
          <div className="pl-6">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-navy-900 to-navy-700 bg-clip-text text-transparent">
                My Reports
              </h1>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gold-50 rounded-full">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span className="text-xs font-semibold text-gold-700">
                  {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
                </span>
              </div>
            </div>
            
            <p className="text-navy-600 text-lg max-w-2xl">
              Access and manage your comprehensive regulatory intelligence reports. 
              Each report provides deep insights into compliance requirements and market opportunities.
            </p>
          </div>
        </div>

        {/* Reports List with Premium Styling */}
        {reports.length === 0 ? (
          <div className="relative bg-gradient-to-br from-white to-navy-50/30 rounded-2xl border border-navy-100 p-16 text-center overflow-hidden group">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-navy-500 rounded-full blur-3xl" />
            </div>
            
            <div className="relative">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-gold-100 to-gold-200 rounded-3xl flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gold-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gold-500" />
                </div>
              </div>
              
              <h2 className="text-3xl font-display font-bold text-navy-900 mb-4">
                Begin Your Intelligence Journey
              </h2>
              
              <p className="text-navy-600 text-lg mb-10 max-w-lg mx-auto">
                Generate your first regulatory intelligence report to unlock comprehensive compliance analysis and market insights tailored to your needs.
              </p>
              
              <Link
                href="/generate"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 hover:scale-105 shadow-xl shadow-gold-500/25 group"
              >
                <Plus className="w-5 h-5" />
                Generate Your First Report
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy-100 shadow-xl shadow-navy-900/5 overflow-hidden">
            <div className="p-8">
              <ReportsList reports={reports} />
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error loading reports:', error)
    return (
      <div className="bg-rose-50/80 backdrop-blur-sm border border-rose-200 rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rose-800">Unable to Load Reports</h2>
            <p className="text-rose-600">Please refresh the page or contact support if the issue persists.</p>
          </div>
        </div>
      </div>
    )
  }
}
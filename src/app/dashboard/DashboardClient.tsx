// src/app/dashboard/DashboardClient.tsx
'use client'

import { cn } from '@/lib/utils/utils'
import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Scale
} from 'lucide-react'
import ReportsList from './components/ReportsList'
import EmptyState from './components/EmptyState'
import Settings from '@/app/dashboard/settings/'

interface DashboardClientProps {
  user: User
  initialReports: any[]
  error?: string
}

export default function DashboardClient({ 
  user, 
  initialReports, 
  error 
}: DashboardClientProps) {
  const [reports] = useState(initialReports)

  // Stats calculation
  const totalReports = reports.length
  const reportsThisMonth = reports.filter(r => {
    const date = new Date(r.created_at)
    const now = new Date()
    return date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear()
  }).length

  const completedReports = reports.filter(r => 
    r.report_content?.status === 'ready' || r.status === 'ready'
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">
            Welcome back, {user.email?.split('@')[0]}
          </h1>
          <p className="text-navy-600">
            Manage your regulatory intelligence reports and compliance analysis
          </p>
        </div>
        
        <Link
          href="/generate"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/25 group"
        >
          <Plus className="w-5 h-5 mr-2" />
          Generate New Report
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-navy-500" />
            <span className="text-2xl font-bold text-navy-900">{totalReports}</span>
          </div>
          <p className="text-sm text-navy-600">Total Reports</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-navy-900">{reportsThisMonth}</span>
          </div>
          <p className="text-sm text-navy-600">This Month</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-navy-900">{completedReports}</span>
          </div>
          <p className="text-sm text-navy-600">Completed</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-bold text-navy-900">
              {totalReports - completedReports}
            </span>
          </div>
          <p className="text-sm text-navy-600">In Progress</p>
        </div>
      </div>

      {/* Reports Section */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Your Reports</h2>
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <EmptyState />
        ) : (
          <ReportsList reports={reports} />
        )}
      </div>
    </div>
  )
}
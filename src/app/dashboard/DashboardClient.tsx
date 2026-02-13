'use client'

import { cn } from '@/lib/utils/utils'
import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download,
  Eye,
  MoreVertical,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react'
import ReportsList from './components/ReportsList'
import EmptyState from './components/EmptyState'

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
  const [reports, setReports] = useState(initialReports)
  const [isLoading, setIsLoading] = useState(false)

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
    <div className={cn("min-h-screen", "bg-slate-50")}>
      {/* Header */}
      <div className={cn("bg-white", "border-b border-slate-200")}>
        <div className={cn("container-custom", "py-8")}>
          <div className={cn(
            "flex flex-col md:flex-row",
            "md:items-center md:justify-between",
            "gap-4"
          )}>
            <div>
              <h1 className={cn(
                "heading-2",
                "text-navy-900",
                "mb-2"
              )}>
                Welcome back, {user.email?.split('@')[0]}
              </h1>
              <p className={cn("text-navy-600")}>
                Manage your Web3 strategy reports and generate new insights
              </p>
            </div>
            
            <Link
              href="/generate"
              className={cn(
                "inline-flex items-center justify-center",
                "px-6 py-3",
                "bg-gradient-to-r from-gold-600 to-gold-500",
                "text-white font-semibold rounded-xl",
                "hover:from-gold-500 hover:to-gold-400",
                "transition-all duration-300 hover:scale-105",
                "shadow-lg shadow-gold-500/25",
                "group"
              )}
            >
              <Plus className={cn("w-5 h-5", "mr-2")} />
              Generate New Report
              <ArrowRight className={cn(
                "w-4 h-4",
                "ml-2",
                "group-hover:translate-x-1 transition-transform"
              )} />
            </Link>
          </div>

          {/* Stats Grid */}
          <div className={cn(
            "grid grid-cols-2 md:grid-cols-4",
            "gap-4",
            "mt-8"
          )}>
            <div className={cn(
              "bg-slate-50",
              "rounded-xl p-4",
              "border border-slate-200"
            )}>
              <div className={cn(
                "flex items-center justify-between",
                "mb-2"
              )}>
                <FileText className={cn("w-5 h-5", "text-navy-500")} />
                <span className={cn(
                  "text-2xl",
                  "font-bold",
                  "text-navy-900"
                )}>{totalReports}</span>
              </div>
              <p className={cn("text-sm", "text-navy-600")}>Total Reports</p>
            </div>
            
            <div className={cn(
              "bg-slate-50",
              "rounded-xl p-4",
              "border border-slate-200"
            )}>
              <div className={cn(
                "flex items-center justify-between",
                "mb-2"
              )}>
                <TrendingUp className={cn("w-5 h-5", "text-green-600")} />
                <span className={cn(
                  "text-2xl",
                  "font-bold",
                  "text-navy-900"
                )}>{reportsThisMonth}</span>
              </div>
              <p className={cn("text-sm", "text-navy-600")}>This Month</p>
            </div>
            
            <div className={cn(
              "bg-slate-50",
              "rounded-xl p-4",
              "border border-slate-200"
            )}>
              <div className={cn(
                "flex items-center justify-between",
                "mb-2"
              )}>
                <CheckCircle className={cn("w-5 h-5", "text-blue-600")} />
                <span className={cn(
                  "text-2xl",
                  "font-bold",
                  "text-navy-900"
                )}>{completedReports}</span>
              </div>
              <p className={cn("text-sm", "text-navy-600")}>Completed</p>
            </div>
            
            <div className={cn(
              "bg-slate-50",
              "rounded-xl p-4",
              "border border-slate-200"
            )}>
              <div className={cn(
                "flex items-center justify-between",
                "mb-2"
              )}>
                <Clock className={cn("w-5 h-5", "text-amber-600")} />
                <span className={cn(
                  "text-2xl",
                  "font-bold",
                  "text-navy-900"
                )}>
                  {totalReports - completedReports}
                </span>
              </div>
              <p className={cn("text-sm", "text-navy-600")}>In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("container-custom", "py-8")}>
        {error ? (
          <div className={cn(
            "bg-red-50",
            "border border-red-200",
            "rounded-xl p-6",
            "text-center"
          )}>
            <AlertCircle className={cn(
              "w-12 h-12",
              "text-red-500",
              "mx-auto mb-4"
            )} />
            <h3 className={cn(
              "text-lg font-semibold",
              "text-red-800",
              "mb-2"
            )}>Error Loading Dashboard</h3>
            <p className={cn(
              "text-red-600",
              "mb-4"
            )}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "px-4 py-2",
                "bg-red-600 text-white",
                "rounded-lg",
                "hover:bg-red-700"
              )}
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
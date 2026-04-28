// src/app/admin/data/page.tsx
// FOCUSED ON REPORT DATA ONLY - No legal/attorney data
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Database as DatabaseIcon, Server, DollarSign, TrendingUp, Users, Shield, Clock, 
  CalendarCheck, RefreshCw, CheckCircle, AlertCircle, ArrowRight, 
  FileText, Building2
} from 'lucide-react'

interface TableStats {
  name: string
  displayName: string
  href: string
  count: number
  lastUpdated: string | null
  icon: any
  color: string
  description: string
}

// REPORT DATA ONLY - No licensing_requirements, no legal tables
const tableConfigs = [
  { 
    key: 'technology_vendors', 
    displayName: 'Technology Vendors', 
    icon: Server, 
    color: 'bg-cyan-100 text-cyan-700',
    description: 'Compliance technology vendor recommendations with pricing and implementation timelines'
  },
  { 
    key: 'budget_templates', 
    displayName: 'Budget Templates', 
    icon: DollarSign, 
    color: 'bg-emerald-100 text-emerald-700',
    description: 'Budget ranges by company size, industry, and state'
  },
  { 
    key: 'market_metrics', 
    displayName: 'Market Metrics', 
    icon: TrendingUp, 
    color: 'bg-purple-100 text-purple-700',
    description: 'Market growth rates, competitor density, and opportunity scores by state'
  },
  { 
    key: 'talent_metrics', 
    displayName: 'Talent Metrics', 
    icon: Users, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Compliance talent availability, salaries, and recruitment channels'
  },
  { 
    key: 'risk_factors', 
    displayName: 'Risk Factors', 
    icon: Shield, 
    color: 'bg-red-100 text-red-700',
    description: 'Risk assessment factors with state-specific overrides'
  },
  { 
    key: 'compliance_phases', 
    displayName: 'Compliance Phases', 
    icon: Clock, 
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Roadmap phases with conditional action items'
  },
  { 
    key: 'next_steps_templates', 
    displayName: 'Next Steps & Calendar', 
    icon: CalendarCheck, 
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Action items and compliance calendar templates'
  }
]

export default function DataManagementDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<TableStats[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFreshness, setDataFreshness] = useState({ 
    totalTables: 0,
    updatedRecently: 0,
    needsAttention: 0
  })
  const [recentChanges, setRecentChanges] = useState<any[]>([])
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const results: TableStats[] = []
      let recentlyUpdatedCount = 0
      let needsAttentionCount = 0
      
      for (const config of tableConfigs) {
        // Get count
        const { count, error: countError } = await supabase
          .from(config.key as any)
          .select('*', { count: 'exact', head: true })
        
        if (countError) {
          console.warn(`Error counting ${config.key}:`, countError)
        }
        
        // Get last updated
        let lastUpdated: string | null = null
        const { data: lastRecord, error: lastError } = await supabase
          .from(config.key as any)
          .select('updated_at')
          .order('updated_at', { ascending: false })
          .limit(1)
        
        if (!lastError && lastRecord && lastRecord.length > 0) {
          lastUpdated = lastRecord[0].updated_at
          
          // Check if updated within last 30 days
          const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceUpdate <= 30) {
            recentlyUpdatedCount++
          } else {
            needsAttentionCount++
          }
        } else {
          needsAttentionCount++
        }
        
        results.push({
          name: config.key,
          displayName: config.displayName,
          href: `/admin/data/${config.key.replace(/_/g, '-')}`,
          count: count || 0,
          lastUpdated,
          icon: config.icon,
          color: config.color,
          description: config.description
        })
      }
      
      setStats(results)
      
      setDataFreshness({
        totalTables: tableConfigs.length,
        updatedRecently: recentlyUpdatedCount,
        needsAttention: needsAttentionCount
      })
      
      // Get recent audit log entries (only for report data tables)
      const { data: auditLog, error: auditError } = await supabase
        .from('regulatory_audit_log')
        .select('*')
        .in('table_name', tableConfigs.map(c => c.key))
        .order('changed_at', { ascending: false })
        .limit(10)
      
      if (!auditError && auditLog) {
        setRecentChanges(auditLog)
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setNotification({ type: 'error', message: 'Failed to load dashboard data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const getLastUpdatedText = (date: string | null) => {
    if (!date) return 'Never updated'
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const getStatusColor = (date: string | null) => {
    if (!date) return 'text-red-500'
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days < 30) return 'text-green-500'
    if (days < 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (notification) {
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Report Data Management</h1>
            <p className="text-navy-600">Manage all dynamic data powering regulatory reports</p>
          </div>
          <button 
            onClick={fetchAllData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </button>
        </div>
      </div>
      
      {notification && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}
      
      {/* Data Freshness Summary Cards - No legal data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Data Tables</p>
              <p className="text-2xl font-bold">{dataFreshness.totalTables}</p>
            </div>
            <DatabaseIcon className="w-8 h-8 text-gold-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Updated Recently (30 days)</p>
              <p className="text-2xl font-bold text-green-600">{dataFreshness.updatedRecently}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Needs Attention</p>
              <p className="text-2xl font-bold text-yellow-600">{dataFreshness.needsAttention}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>
      
      {/* Quick Actions - Removed legal link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link 
          href="/admin/data/verification"
          className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between group"
        >
          <div>
            <h3 className="font-semibold text-amber-800">Data Verification</h3>
            <p className="text-sm text-amber-700">Check all state data for freshness and schedule reviews</p>
          </div>
          <RefreshCw className="w-5 h-5 text-amber-600 group-hover:rotate-180 transition-transform" />
        </Link>
        
        <Link 
          href="/admin/data/audit"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between group"
        >
          <div>
            <h3 className="font-semibold text-blue-800">Audit Log</h3>
            <p className="text-sm text-blue-700">View all data change history</p>
          </div>
          <FileText className="w-5 h-5 text-blue-600" />
        </Link>
      </div>
      
      {/* Stats Grid - All Report Data Tables */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Data Tables Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.name}
                href={stat.href}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gold-500 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{stat.displayName}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{stat.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-900">{stat.count.toLocaleString()} records</span>
                    <span className={`text-xs ${getStatusColor(stat.lastUpdated)}`}>
                      {getLastUpdatedText(stat.lastUpdated)}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* Recent Changes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Changes
          </h3>
          <Link href="/admin/data/audit" className="text-sm text-gold-600 hover:underline">
            View All →
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gold-600" />
          </div>
        ) : recentChanges.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentChanges.map((change) => (
              <div key={change.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      change.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                      change.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {change.action}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {change.table_name?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {change.changed_by_email || 'System'} • {new Date(change.changed_at).toLocaleString()}
                  </p>
                </div>
                {change.reason && (
                  <p className="text-xs text-gray-400 max-w-md truncate">{change.reason}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No recent changes</p>
          </div>
        )}
      </div>
      
      {/* Help Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
        <p className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          These tables power the dynamic content in regulatory reports. Updates made here will automatically appear in new reports.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Note: Legal & Compliance data (licensing requirements, legislation, enforcement) is managed separately in the Legal section.
        </p>
      </div>
    </div>
  )
}
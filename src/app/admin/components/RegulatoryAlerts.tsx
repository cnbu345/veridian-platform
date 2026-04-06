// src/app/admin/components/RegulatoryAlerts.tsx
// Regulatory Alerts - Live data from regulatory system

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  AlertCircle, 
  Gavel, 
  Bell, 
  ChevronRight, 
  ExternalLink, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface RegulatoryAlert {
  id: string
  state: string
  state_code: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  effective_date: string | null
  source_url: string
  type: 'legislation' | 'enforcement' | 'update' | 'review'
  created_at: string
}

interface AlertCounts {
  total: number
  high: number
  medium: number
  low: number
}

export default function RegulatoryAlerts() {
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>([])
  const [counts, setCounts] = useState<AlertCounts>({ total: 0, high: 0, medium: 0, low: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const fetchAlerts = async () => {
    setRefreshing(true)
    try {
      const url = filter === 'all' 
        ? '/api/admin/regulatory/alerts?limit=10'
        : `/api/admin/regulatory/alerts?limit=10&severity=${filter}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      setAlerts(data.alerts || [])
      setCounts(data.counts || { total: 0, high: 0, medium: 0, low: 0 })
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [filter])

  const getSeverityStyles = (severity: string) => {
    switch(severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-l-4 border-red-500',
          text: 'text-red-800',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-l-4 border-yellow-500',
          text: 'text-yellow-800',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        }
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-l-4 border-blue-500',
          text: 'text-blue-800',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-l-4 border-gray-500',
          text: 'text-gray-800',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600'
        }
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'legislation':
        return <FileText className="w-4 h-4" />
      case 'enforcement':
        return <Gavel className="w-4 h-4" />
      case 'update':
        return <Clock className="w-4 h-4" />
      case 'review':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'legislation': return 'Legislation'
      case 'enforcement': return 'Enforcement'
      case 'update': return 'Pending Update'
      case 'review': return 'Needs Review'
      default: return 'Alert'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-navy-900">Regulatory Alerts</h2>
          <div className="animate-pulse w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-50 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gold-600" />
            <h2 className="text-lg font-semibold text-navy-900">Regulatory Alerts</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              {counts.total} Active
            </span>
            <button
              onClick={fetchAlerts}
              disabled={refreshing}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'all' 
                ? 'bg-navy-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'high' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            High ({counts.high})
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'medium' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            Medium ({counts.medium})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'low' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Low ({counts.low})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p>No regulatory alerts at this time</p>
            <p className="text-sm mt-1">All caught up!</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity)
            return (
              <div key={alert.id} className={`p-4 ${styles.bg} ${styles.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${styles.iconBg}`}>
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium bg-white/50 px-2 py-0.5 rounded">
                          {alert.state_code}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          alert.type === 'legislation' ? 'bg-green-100 text-green-700' :
                          alert.type === 'enforcement' ? 'bg-red-100 text-red-700' :
                          alert.type === 'update' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {getTypeLabel(alert.type)}
                        </span>
                      </div>
                      {alert.effective_date && (
                        <span className="text-xs text-gray-500">
                          Effective: {new Date(alert.effective_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-navy-900 mb-1">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{alert.description}</p>
                    <div className="flex items-center gap-3">
                      {alert.source_url && alert.source_url !== '#' && (
                        <a
                          href={alert.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700"
                        >
                          View Source
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {alert.type === 'update' && (
                        <Link
                          href="/admin/regulatory/updates"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          Review Update
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                      {alert.type === 'review' && (
                        <Link
                          href="/admin/regulatory/content"
                          className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                        >
                          Review Fact
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <Link
          href="/admin/regulatory"
          className="w-full flex items-center justify-center gap-2 text-sm text-navy-600 hover:text-navy-800 transition-colors"
        >
          View All Regulatory Activity
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
// src/app/admin/components/RegulatoryAlerts.tsx // Regulatory Alerts
'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Gavel, Bell, ChevronRight, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RegulatoryAlert {
  id: string
  state: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  effective_date: string
  source_url: string
}

export default function RegulatoryAlerts() {
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>([
    // Mock data for now
    {
      id: '1',
      state: 'California',
      title: 'Digital Asset Licensing Update',
      description: 'New licensing requirements for money transmission involving digital assets',
      severity: 'high',
      effective_date: '2024-06-01',
      source_url: '#'
    },
    {
      id: '2',
      state: 'New York',
      title: 'BitLicense Amendments',
      description: 'Proposed amendments to virtual currency regulations',
      severity: 'medium',
      effective_date: '2024-07-15',
      source_url: '#'
    },
    {
      id: '3',
      state: 'Texas',
      title: 'Money Services Act Changes',
      description: 'Updated definitions for virtual currency businesses',
      severity: 'low',
      effective_date: '2024-05-30',
      source_url: '#'
    }
  ])

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-l-4 border-red-600'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-l-4 border-blue-600'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'medium':
        return <Gavel className="w-4 h-4 text-yellow-600" />
      case 'low':
        return <Bell className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-navy-900">Regulatory Alerts</h2>
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          {alerts.length} Active
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start gap-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-navy-900">{alert.state}</h3>
                  <span className="text-xs text-navy-500">
                    Effective: {new Date(alert.effective_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">{alert.title}</p>
                <p className="text-xs text-navy-600 mb-2">{alert.description}</p>
                <a
                  href={alert.source_url}
                  className="inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700"
                >
                  View Source
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-slate-50 text-navy-600 rounded-lg text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
        View All Alerts
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
// src/app/admin/customers/health/page.tsx // Customer Health Dashboard
'use client'

import { useState, useEffect } from 'react'
import {
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Clock,
  Mail,
  Phone,
  Calendar,
  Activity,
  Shield,
  DollarSign,
  MessageSquare,
  BarChart3,
  Filter,
  Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CustomerHealthData {
  id: string
  company_name: string
  contact_name: string
  email: string
  health_score: number
  risk_level: 'healthy' | 'moderate' | 'at_risk'
  last_login: string
  report_count: number
  support_tickets: number
  nps_score?: number
  csat_score?: number
  churn_probability: number
  expansion_opportunity: string[]
  subscription_tier: string
  mrr: number
}

export default function CustomerHealthDashboard() {
  const [customers, setCustomers] = useState<CustomerHealthData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'healthy' | 'moderate' | 'at_risk'>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchCustomerHealth()
  }, [])

  const fetchCustomerHealth = async () => {
    try {
      // This would be a real API call
      const mockData: CustomerHealthData[] = [
        {
          id: '1',
          company_name: 'First Regional Bank',
          contact_name: 'Sarah Mitchell',
          email: 'sarah@firstregional.com',
          health_score: 92,
          risk_level: 'healthy',
          last_login: '2026-02-17T10:30:00',
          report_count: 8,
          support_tickets: 1,
          nps_score: 9,
          csat_score: 4.8,
          churn_probability: 0.05,
          expansion_opportunity: ['Enterprise upgrade', 'Multi-state'],
          subscription_tier: 'monthly',
          mrr: 7997
        },
        {
          id: '2',
          company_name: 'Chen & Associates Law',
          contact_name: 'James Chen',
          email: 'james@chenlaw.com',
          health_score: 68,
          risk_level: 'moderate',
          last_login: '2026-02-01T14:15:00',
          report_count: 3,
          support_tickets: 2,
          nps_score: 7,
          csat_score: 3.9,
          churn_probability: 0.25,
          expansion_opportunity: [],
          subscription_tier: 'quarterly',
          mrr: 3997
        },
        {
          id: '3',
          company_name: 'Midwest Crypto Advisors',
          contact_name: 'Mike Thompson',
          email: 'mike@midwestcrypto.com',
          health_score: 34,
          risk_level: 'at_risk',
          last_login: '2026-01-15T09:45:00',
          report_count: 1,
          support_tickets: 3,
          nps_score: 4,
          csat_score: 2.5,
          churn_probability: 0.78,
          expansion_opportunity: [],
          subscription_tier: 'single',
          mrr: 0
        }
      ]
      setCustomers(mockData)
    } catch (error) {
      console.error('Failed to fetch customer health:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'healthy':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Healthy</span>
      case 'moderate':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">Moderate</span>
      case 'at_risk':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">At Risk</span>
      default:
        return null
    }
  }

  const filteredCustomers = customers.filter(c => {
    if (filter === 'all') return true
    return c.risk_level === filter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Customer Health</h1>
          <p className="text-navy-600">Monitor customer engagement and churn risk</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Average Health Score</span>
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">78</div>
          <div className="text-sm text-amber-600 mt-1">↓ 3 points from last month</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">At Risk Customers</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">3</div>
          <div className="text-sm text-red-600 mt-1">${(3 * 7997).toLocaleString()} MRR at risk</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Expansion Opportunities</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">8</div>
          <div className="text-sm text-green-600 mt-1">$124K potential upsell</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">NPS Score</span>
            <MessageSquare className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">42</div>
          <div className="text-sm text-green-600 mt-1">↑ 5 points</div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Health Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-green-600">Healthy (80-100)</span>
                <span className="font-medium">12</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: '60%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-amber-600">Moderate (50-79)</span>
                <span className="font-medium">5</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600" style={{ width: '25%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-red-600">At Risk (0-49)</span>
                <span className="font-medium">3</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 col-span-2">
          <h3 className="font-semibold text-navy-900 mb-4">Risk Factors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-800 mb-1">Low engagement</div>
              <div className="text-2xl font-bold text-red-900">4</div>
              <div className="text-xs text-red-600">customers</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-sm text-amber-800 mb-1">Multiple support tickets</div>
              <div className="text-2xl font-bold text-amber-900">3</div>
              <div className="text-xs text-amber-600">customers</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800 mb-1">Payment issues</div>
              <div className="text-2xl font-bold text-blue-900">2</div>
              <div className="text-xs text-blue-600">customers</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-800 mb-1">Feature requests</div>
              <div className="text-2xl font-bold text-purple-900">5</div>
              <div className="text-xs text-purple-600">customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'all'
              ? 'bg-navy-900 text-white'
              : 'bg-white text-navy-600 border border-slate-200'
          }`}
        >
          All Customers
        </button>
        <button
          onClick={() => setFilter('healthy')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'healthy'
              ? 'bg-green-600 text-white'
              : 'bg-white text-navy-600 border border-slate-200'
          }`}
        >
          Healthy
        </button>
        <button
          onClick={() => setFilter('moderate')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'moderate'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-navy-600 border border-slate-200'
          }`}
        >
          Moderate
        </button>
        <button
          onClick={() => setFilter('at_risk')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'at_risk'
              ? 'bg-red-600 text-white'
              : 'bg-white text-navy-600 border border-slate-200'
          }`}
        >
          At Risk
        </button>
      </div>

      {/* Customer Health Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500">Health Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500">Reports</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500">Tickets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500">Churn Prob</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-navy-900">{customer.company_name}</div>
                    <div className="text-sm text-navy-500">{customer.contact_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(customer.health_score)}`}>
                    {customer.health_score}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getRiskBadge(customer.risk_level)}
                </td>
                <td className="px-6 py-4 text-sm text-navy-600">
                  {new Date(customer.last_login).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-navy-600">{customer.report_count}</td>
                <td className="px-6 py-4 text-sm text-navy-600">{customer.support_tickets}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                      <div
                        className={`h-full ${
                          customer.churn_probability > 0.5 ? 'bg-red-600' : 'bg-amber-600'
                        }`}
                        style={{ width: `${customer.churn_probability * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-navy-500">
                      {(customer.churn_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-gold-600 hover:text-gold-700 text-sm font-medium">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* At Risk Alerts */}
      {filteredCustomers.some(c => c.risk_level === 'at_risk') && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Action Required: At-Risk Customers</h3>
              <p className="text-red-700 text-sm mb-4">
                {filteredCustomers.filter(c => c.risk_level === 'at_risk').length} customers need immediate attention to prevent churn.
              </p>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                View At-Risk Customers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// src/app/admin/customers/health/page.tsx - Customer Health Dashboard with Real Data
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
  Calendar,
  Activity,
  Shield,
  DollarSign,
  MessageSquare,
  Download
} from 'lucide-react'
import Link from 'next/link'

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
  last_feedback_date?: string
  feedback_trend?: 'improving' | 'declining' | 'stable'
  feature_requests?: string[]
}

export default function CustomerHealthDashboard() {
  const [customers, setCustomers] = useState<CustomerHealthData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'healthy' | 'moderate' | 'at_risk'>('all')
  const [metrics, setMetrics] = useState({
    averageHealthScore: 0,
    atRiskCount: 0,
    atRiskMrr: 0,
    expansionOpportunities: 0,
    expansionPotential: 0,
    npsScore: 0
  })

  useEffect(() => {
    fetchCustomerHealth()
  }, [])

  const fetchCustomerHealth = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch real data from your API
      const response = await fetch('/api/admin/customers?filter=all')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customers')
      }
      
      setCustomers(data.customers || [])
      setMetrics(data.metrics || {})
    } catch (error) {
      console.error('Failed to fetch customer health:', error)
      setError(error instanceof Error ? error.message : 'Failed to load customer data')
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
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Healthy</span>
      case 'moderate':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Moderate</span>
      case 'at_risk':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">At Risk</span>
      default:
        return null
    }
  }

  const filteredCustomers = customers.filter(c => {
    if (filter === 'all') return true
    return c.risk_level === filter
  })

  // Calculate feedback metrics for the insights section
  const calculateFeedbackMetrics = () => {
    const customersWithFeedback = customers.filter(c => c.last_feedback_date)
    
    // Latest feedback date
    const latestFeedback = customersWithFeedback.length > 0 
      ? new Date(Math.max(...customersWithFeedback.map(c => new Date(c.last_feedback_date!).getTime())))
      : null
    
    // Trend counts
    const improvingCount = customers.filter(c => c.feedback_trend === 'improving').length
    const decliningCount = customers.filter(c => c.feedback_trend === 'declining').length
    const stableCount = customers.filter(c => c.feedback_trend === 'stable').length
    
    // Aggregate feature requests
    const allFeatureRequests = customers
      .flatMap(c => c.feature_requests || [])
      .reduce((acc: Record<string, number>, request) => {
        acc[request] = (acc[request] || 0) + 1
        return acc
      }, {})
    
    const topRequests = Object.entries(allFeatureRequests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
    
    const totalRequests = Object.keys(allFeatureRequests).length
    const totalRequestCount = Object.values(allFeatureRequests).reduce((a, b) => a + b, 0)
    
    return {
      latestFeedback,
      improvingCount,
      decliningCount,
      stableCount,
      topRequests,
      totalRequests,
      totalRequestCount,
      hasFeedbackData: customersWithFeedback.length > 0
    }
  }

  const feedbackMetrics = calculateFeedbackMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Health Data</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchCustomerHealth}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Customer Health</h1>
          <p className="text-navy-600">Monitor customer engagement and churn risk</p>
        </div>
        <button 
          onClick={fetchCustomerHealth}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Average Health Score</span>
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{metrics.averageHealthScore}</div>
          <div className="text-sm text-amber-600 mt-1">Based on {customers.length} customers</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">At Risk Customers</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{metrics.atRiskCount}</div>
          <div className="text-sm text-red-600 mt-1">${metrics.atRiskMrr.toLocaleString()} MRR at risk</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Expansion Opportunities</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{metrics.expansionOpportunities}</div>
          <div className="text-sm text-green-600 mt-1">${metrics.expansionPotential.toLocaleString()} potential upsell</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">NPS Score</span>
            <MessageSquare className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{metrics.npsScore}</div>
          <div className="text-sm text-green-600 mt-1">Based on customer feedback</div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Health Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-green-600">Healthy (80-100)</span>
                <span className="font-medium">{customers.filter(c => c.health_score >= 80).length}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600" 
                  style={{ width: `${(customers.filter(c => c.health_score >= 80).length / customers.length) * 100}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-amber-600">Moderate (50-79)</span>
                <span className="font-medium">{customers.filter(c => c.health_score >= 50 && c.health_score < 80).length}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600" 
                  style={{ width: `${(customers.filter(c => c.health_score >= 50 && c.health_score < 80).length / customers.length) * 100}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-red-600">At Risk (0-49)</span>
                <span className="font-medium">{customers.filter(c => c.health_score < 50).length}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600" 
                  style={{ width: `${(customers.filter(c => c.health_score < 50).length / customers.length) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-navy-900 mb-4">Risk Factors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-800 mb-1">Low engagement</div>
              <div className="text-2xl font-bold text-red-900">
                {customers.filter(c => c.report_count < 2).length}
              </div>
              <div className="text-xs text-red-600">customers with &lt;2 reports</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-sm text-amber-800 mb-1">Multiple support tickets</div>
              <div className="text-2xl font-bold text-amber-900">
                {customers.filter(c => c.support_tickets > 2).length}
              </div>
              <div className="text-xs text-amber-600">customers with &gt;2 tickets</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800 mb-1">Long inactive</div>
              <div className="text-2xl font-bold text-blue-900">
                {customers.filter(c => {
                  const daysInactive = (new Date().getTime() - new Date(c.last_login).getTime()) / (1000 * 60 * 60 * 24)
                  return daysInactive > 30
                }).length}
              </div>
              <div className="text-xs text-blue-600">no login in &gt;30 days</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-800 mb-1">Feature requests</div>
              <div className="text-2xl font-bold text-purple-900">
                {customers.filter(c => c.feature_requests && c.feature_requests.length > 0).length}
              </div>
              <div className="text-xs text-purple-600">customers with requests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Insights Section */}
      {feedbackMetrics.hasFeedbackData && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Feedback Insights</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-navy-500 mb-1">Last Feedback Received</div>
              <div className="text-2xl font-bold text-navy-900">
                {feedbackMetrics.latestFeedback ? feedbackMetrics.latestFeedback.toLocaleDateString() : 'No feedback'}
              </div>
              {feedbackMetrics.latestFeedback && (
                <div className="text-sm text-navy-500 mt-1">
                  {Math.round((new Date().getTime() - feedbackMetrics.latestFeedback.getTime()) / (1000 * 60 * 60 * 24))} days ago
                </div>
              )}
            </div>
            
            <div>
              <div className="text-sm text-navy-500 mb-1">Feedback Trend</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">{feedbackMetrics.improvingCount}</span>
                <span className="text-navy-600">improving</span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <span className="text-amber-600">{feedbackMetrics.stableCount} stable</span>
                <span className="text-red-600">{feedbackMetrics.decliningCount} declining</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-navy-500 mb-1">Feature Requests</div>
              <div className="text-2xl font-bold text-navy-900">
                {feedbackMetrics.totalRequests}
              </div>
              <div className="text-sm text-amber-600 mt-1">
                {feedbackMetrics.totalRequestCount} total requests
              </div>
            </div>
          </div>
          
          {/* Top Feature Requests */}
          {feedbackMetrics.topRequests.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-navy-900">Top Feature Requests</h4>
                <Link href="/admin/customers/feedback" className="text-sm text-gold-600 hover:text-gold-700">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {feedbackMetrics.topRequests.map(([request, count]) => (
                  <div key={request} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                      <span className="text-sm text-navy-700">{request}</span>
                    </div>
                    <span className="text-xs bg-gold-50 text-gold-700 px-2 py-1 rounded-full">
                      {count} {count === 1 ? 'request' : 'requests'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'all'
              ? 'bg-navy-900 text-white'
              : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Customers ({customers.length})
        </button>
        <button
          onClick={() => setFilter('healthy')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'healthy'
              ? 'bg-green-600 text-white'
              : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Healthy ({customers.filter(c => c.risk_level === 'healthy').length})
        </button>
        <button
          onClick={() => setFilter('moderate')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'moderate'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Moderate ({customers.filter(c => c.risk_level === 'moderate').length})
        </button>
        <button
          onClick={() => setFilter('at_risk')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'at_risk'
              ? 'bg-red-600 text-white'
              : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          At Risk ({customers.filter(c => c.risk_level === 'at_risk').length})
        </button>
      </div>

      {/* Customer Health Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Health Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Reports</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Tickets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Churn Prob</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Feedback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Actions</th>
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
                    {customer.last_feedback_date && (
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${
                          customer.feedback_trend === 'improving' ? 'text-green-600' :
                          customer.feedback_trend === 'declining' ? 'text-red-600' :
                          'text-amber-600'
                        }`}>
                          {customer.feedback_trend === 'improving' && '↑'}
                          {customer.feedback_trend === 'declining' && '↓'}
                          {customer.feedback_trend === 'stable' && '→'}
                        </span>
                        <span className="text-xs text-navy-500">
                          {new Date(customer.last_feedback_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/customers/${customer.id}`}
                      className="text-gold-600 hover:text-gold-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <Link 
                href="/admin/customers?filter=at_risk" 
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                View At-Risk Customers
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
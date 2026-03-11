// src/app/admin/customers/page.tsx - All Customers
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Download, 
  RefreshCw,
  ChevronRight,
  Mail,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Heart
} from 'lucide-react'
import CustomerFilters from './components/CustomerFilters'
import MobileCustomerCard from './components/MobileCustomerCard'

interface Customer {
  id: string
  company_name: string
  email: string
  health_score: number
  risk_level: 'healthy' | 'moderate' | 'at_risk'
  last_login: string
  report_count: number
  churn_probability: number
  subscription_tier: string
}

interface Metrics {
  averageHealthScore: number
  atRiskCount: number
  atRiskMrr: number
  expansionOpportunities: number
  expansionPotential: number
  npsScore: number
}

export default function AllCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchCustomers = async () => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams({
        filter,
        search
      })
      
      const response = await fetch(`/api/admin/customers?${params}`)
      const data = await response.json()
      
      setCustomers(data.customers || [])
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [filter, search])

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 50) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
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

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">All Customers</h1>
          <p className="text-navy-600 mt-1">Manage and monitor your customer base</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            disabled={refreshing}
            className="p-2 text-navy-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Cards - Responsive Grid */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-navy-600">Avg Health</span>
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-navy-900">{metrics.averageHealthScore}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-navy-600">At Risk</span>
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-navy-900">{metrics.atRiskCount}</div>
            <div className="text-xs text-red-600 mt-1">${metrics.atRiskMrr.toLocaleString()} MRR</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-navy-600">Expansions</span>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-navy-900">{metrics.expansionOpportunities}</div>
            <div className="text-xs text-green-600 mt-1">${metrics.expansionPotential.toLocaleString()}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-navy-600">NPS</span>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-navy-900">{metrics.npsScore}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-navy-600">Total</span>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-navy-600" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-navy-900">{customers.length}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <CustomerFilters 
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
          </div>
        </div>
      )}

      {/* Desktop Table - Hidden on Mobile */}
      {!loading && customers.length > 0 && (
        <>
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Health</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Reports</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Churn Prob</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-navy-900">{customer.company_name}</div>
                          <div className="text-sm text-navy-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
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
                      <td className="px-6 py-4 text-sm text-navy-600">
                        <span className="capitalize">{customer.subscription_tier}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/customers/${customer.id}`}
                          className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1"
                        >
                          View
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {customers.map((customer) => (
              <MobileCustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && customers.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No customers found</h3>
          <p className="text-navy-600">
            {search ? 'Try adjusting your search or filters' : 'No customers match the selected criteria'}
          </p>
        </div>
      )}
    </div>
  )
}
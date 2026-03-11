// src/app/admin/customers/churned/page.tsx
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
  TrendingDown,
  AlertCircle,
  Clock,
  DollarSign,
  Filter,
  ArrowLeft
} from 'lucide-react'

interface ChurnedCustomer {
  id: string
  company_name: string
  email: string
  contact_name: string
  subscription_tier: string
  churned_at: string
  churn_reason?: string
  lifetime_value?: number
  report_count: number
  feedback?: string
  last_active_date: string
}

export default function ChurnedCustomersPage() {
  const [customers, setCustomers] = useState<ChurnedCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<'30' | '90' | '180' | 'all'>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const fetchChurnedCustomers = async () => {
    try {
      setRefreshing(true)
      setError(null)
      
      // Build query params
      const params = new URLSearchParams({
        status: 'churned',
        ...(dateRange !== 'all' && { days: dateRange })
      })
      
      const response = await fetch(`/api/admin/customers?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch churned customers')
      }
      
      // Filter for churned customers (you'll need to add a churned flag to your data)
      // For now, we'll use the API response
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Failed to fetch churned customers:', error)
      setError(error instanceof Error ? error.message : 'Failed to load churned customers')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchChurnedCustomers()
  }, [dateRange])

  const filteredCustomers = customers.filter(customer => {
    // Search filter
    if (search && !customer.company_name?.toLowerCase().includes(search.toLowerCase()) && 
        !customer.email?.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    
    return true
  })

  // Calculate metrics
  const totalChurned = customers.length
  const totalLtv = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0)
  const avgLtv = totalChurned > 0 ? Math.round(totalLtv / totalChurned) : 0
  const recentChurn = customers.filter(c => {
    const daysAgo = (Date.now() - new Date(c.churned_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysAgo <= 30
  }).length

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
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Churned Customers</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchChurnedCustomers}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Churned Customers</h1>
              <p className="text-navy-600 mt-1">Analyze customer churn and feedback</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchChurnedCustomers}
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

      {/* Churn Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Total Churned</span>
            <Users className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{totalChurned}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Lost Revenue</span>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">${totalLtv.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Avg LTV</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">${avgLtv.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Last 30 Days</span>
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{recentChurn}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search churned customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-navy-600"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Date Range
            </span>
            <span className="text-navy-400">{showMobileFilters ? '▲' : '▼'}</span>
          </button>
          
          {showMobileFilters && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { value: '30', label: 'Last 30 Days' },
                { value: '90', label: 'Last 90 Days' },
                { value: '180', label: 'Last 180 Days' },
                { value: 'all', label: 'All Time' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    setDateRange(range.value as any)
                    setShowMobileFilters(false)
                  }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range.value
                      ? 'bg-navy-900 text-white'
                      : 'bg-white text-navy-600 border border-slate-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Date Filters */}
        <div className="hidden lg:flex items-center gap-3">
          <span className="text-sm text-navy-500">Date Range:</span>
          {[
            { value: '30', label: 'Last 30 Days' },
            { value: '90', label: 'Last 90 Days' },
            { value: '180', label: 'Last 180 Days' },
            { value: 'all', label: 'All Time' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range.value
                  ? 'bg-navy-900 text-white'
                  : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Churned Customers List */}
      {filteredCustomers.length > 0 ? (
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div 
              key={customer.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-navy-900">{customer.company_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-navy-500 mt-1">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                      {customer.contact_name && (
                        <div className="text-sm text-navy-500 mt-1">
                          Contact: {customer.contact_name}
                        </div>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium self-start">
                      Churned
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div>
                      <div className="text-xs text-navy-500">Churn Date</div>
                      <div className="text-sm font-medium text-navy-900">
                        {new Date(customer.churned_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-navy-500">Last Active</div>
                      <div className="text-sm font-medium text-navy-900">
                        {new Date(customer.last_active_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-navy-500">Tier</div>
                      <div className="text-sm font-medium text-navy-900 capitalize">
                        {customer.subscription_tier}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-navy-500">LTV</div>
                      <div className="text-sm font-medium text-navy-900">
                        ${customer.lifetime_value?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                  
                  {customer.churn_reason && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-navy-500 mb-1">Churn Reason</div>
                      <div className="text-sm text-navy-900">{customer.churn_reason}</div>
                    </div>
                  )}
                  
                  {customer.feedback && (
                    <div className="mt-3">
                      <div className="text-xs text-navy-500 mb-1">Feedback</div>
                      <div className="text-sm text-navy-700 italic">"{customer.feedback}"</div>
                    </div>
                  )}
                </div>
                
                <div className="flex lg:flex-col items-center gap-2 lg:min-w-[120px]">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="w-full px-4 py-2 bg-gold-600 text-white rounded-lg text-sm font-medium hover:bg-gold-700 text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No churned customers found</h3>
          <p className="text-navy-600">
            {search ? 'Try adjusting your search' : 'No customers have churned in this period'}
          </p>
          <Link 
            href="/admin/customers"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Customers
          </Link>
        </div>
      )}
    </div>
  )
}
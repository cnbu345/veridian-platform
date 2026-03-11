// src/app/admin/customers/enterprise/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Download, 
  RefreshCw,
  ChevronRight,
  Mail,
  Calendar,
  FileText,
  TrendingUp,
  Shield,
  Users,
  Crown
} from 'lucide-react'
import CustomerFilters from '../components/CustomerFilters'
import MobileCustomerCard from '../components/MobileCustomerCard'

interface EnterpriseCustomer {
  id: string
  company_name: string
  email: string
  health_score: number
  risk_level: 'healthy' | 'moderate' | 'at_risk'
  last_login: string
  report_count: number
  churn_probability: number
  subscription_tier: string
  organization_size?: string
  contract_value?: number
}

export default function EnterpriseCustomersPage() {
  const [customers, setCustomers] = useState<EnterpriseCustomer[]>([])
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
      
      // Filter for enterprise customers (you can adjust the logic)
      const enterpriseCustomers = (data.customers || []).filter(
        (c: EnterpriseCustomer) => 
          c.subscription_tier === 'enterprise' || 
          c.company_name?.toLowerCase().includes('bank') ||
          c.company_name?.toLowerCase().includes('financial')
      )
      
      setCustomers(enterpriseCustomers)
    } catch (error) {
      console.error('Failed to fetch enterprise customers:', error)
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

  // Calculate enterprise metrics
  const totalEnterpriseValue = customers.reduce((sum, c) => sum + (c.contract_value || 50000), 0)
  const avgHealthScore = customers.length > 0 
    ? Math.round(customers.reduce((sum, c) => sum + c.health_score, 0) / customers.length)
    : 0
  const atRiskCount = customers.filter(c => c.risk_level === 'at_risk').length

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-gold-600" />
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Enterprise Customers</h1>
              <p className="text-navy-600 mt-1">Manage your high-value enterprise accounts</p>
            </div>
          </div>
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

      {/* Enterprise Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-navy-200">Total Enterprise Value</span>
            <Building2 className="w-5 h-5 text-gold-400" />
          </div>
          <div className="text-2xl font-bold">${totalEnterpriseValue.toLocaleString()}</div>
          <div className="text-sm text-navy-300 mt-1">Annual contract value</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Total Accounts</span>
            <Users className="w-5 h-5 text-navy-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{customers.length}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Avg Health Score</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{avgHealthScore}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">At Risk</span>
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{atRiskCount}</div>
        </div>
      </div>

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

      {/* Desktop Table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase">Contract Value</th>
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
                      <td className="px-6 py-4 text-sm text-navy-600">
                        ${(customer.contract_value || 50000).toLocaleString()}
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
          <Crown className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No enterprise customers found</h3>
          <p className="text-navy-600">
            {search ? 'Try adjusting your search' : 'No enterprise customers match the selected criteria'}
          </p>
        </div>
      )}
    </div>
  )
}
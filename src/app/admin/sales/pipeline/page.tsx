// src/app/admin/sales/pipeline/page.tsx - Enhanced Sales Pipeline Analytics
'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  Plus,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import AddDealModal from '../components/AddDealModal'

interface PipelineStage {
  name: string
  value: number
  count: number
  probability: number
  color: string
  weightedValue: number
}

interface UpcomingClosure {
  companyName: string
  value: number
  stage: string
  probability: number
  closeDate: string
  owner: string
}

interface PipelineMetrics {
  totalPipeline: number
  weightedPipeline: number
  activeDeals: number
  winRate: number
  pipelineStages: PipelineStage[]
  upcomingClosures: UpcomingClosure[]
}

export default function SalesPipeline() {
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState('month')
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false)
  
  useEffect(() => {
    fetchPipelineData()
  }, [dateRange])
  
  const fetchPipelineData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/sales/pipeline?range=${dateRange}`)
      const data = await res.json()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to fetch pipeline data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPipelineData()
  }
  
  const handleExport = () => {
    if (!metrics) return
    
    const csv = [
      ['Stage', 'Deals', 'Value', 'Probability', 'Weighted Value'],
      ...metrics.pipelineStages.map(stage => [
        stage.name,
        stage.count.toString(),
        `$${stage.value.toLocaleString()}`,
        `${stage.probability}%`,
        `$${stage.weightedValue.toLocaleString()}`
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pipeline-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900"></div>
      </div>
    )
  }
  
  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-navy-900 mb-2">Failed to Load Pipeline</h2>
        <button
          onClick={handleRefresh}
          className="text-gold-600 hover:text-gold-700"
        >
          Try Again
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Sales Pipeline</h1>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button 
            onClick={() => setIsAddDealModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>
      </div>
      
      {/* Pipeline Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Total Pipeline</span>
            <DollarSign className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">
            ${(metrics.totalPipeline / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-green-600 mt-1">↑ 12% from last month</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Weighted Pipeline</span>
            <Target className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">
            ${(metrics.weightedPipeline / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-navy-500 mt-1">Expected revenue</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Active Deals</span>
            <Users className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{metrics.activeDeals}</div>
          <div className="text-sm text-amber-600 mt-1">
            {metrics.upcomingClosures.length} closing this month
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Win Rate</span>
            <TrendingUp className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{metrics.winRate}%</div>
          <div className="text-sm text-green-600 mt-1">↑ 5% from last quarter</div>
        </div>
      </div>
      
      {/* Pipeline Visualization */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-navy-900 mb-6">Pipeline by Stage</h3>
        <div className="space-y-4">
          {metrics.pipelineStages.map((stage) => (
            <div key={stage.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stage.name}</span>
                  <span className="text-xs text-navy-500">({stage.count} deals)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">${(stage.value / 1000000).toFixed(1)}M</span>
                  <span className="text-xs text-navy-500 w-12 text-right">{stage.probability}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color}`}
                    style={{ width: `${stage.probability}%` }}
                  />
                </div>
                <span className="text-xs text-navy-500 w-20">
                  ${(stage.weightedValue / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-navy-600 mb-1">Average Deal Size</div>
            <div className="text-lg font-semibold text-navy-900">
              ${metrics.activeDeals > 0 
                ? Math.round(metrics.totalPipeline / metrics.activeDeals).toLocaleString() 
                : 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-navy-600 mb-1">Pipeline Velocity</div>
            <div className="text-lg font-semibold text-navy-900">45 days</div>
          </div>
        </div>
      </div>
      
      {/* Upcoming Closures */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-navy-900 mb-4">Closing This Month</h3>
        {metrics.upcomingClosures.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Company</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Value</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Stage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Probability</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Close Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-navy-500">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {metrics.upcomingClosures.map((deal, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 font-medium">{deal.companyName}</td>
                  <td className="px-4 py-3">${deal.value.toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{deal.stage.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deal.probability >= 75 ? 'bg-green-100 text-green-800' :
                      deal.probability >= 50 ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {deal.probability}%
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(deal.closeDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{deal.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-navy-400 py-8">No deals closing this month</p>
        )}
      </div>
      
      {/* Win/Loss Analysis */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Win/Loss by Stage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Consultation → Proposal</span>
              <span className="text-sm font-medium text-green-600">78%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Proposal → Negotiation</span>
              <span className="text-sm font-medium text-green-600">65%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Negotiation → Closed Won</span>
              <span className="text-sm font-medium text-amber-600">52%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Top Loss Reasons</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Price too high</span>
              <span className="text-sm font-medium">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Chose competitor</span>
              <span className="text-sm font-medium">28%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">No decision</span>
              <span className="text-sm font-medium">18%</span>
            </div>
          </div>
        </div>
      </div>
      <AddDealModal 
        isOpen={isAddDealModalOpen}
        onClose={() => setIsAddDealModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
// src/app/admin/sales/pipeline/page.tsx // Sales Pipeline Analytics
'use client'

import { useState } from 'react'
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
  BarChart3
} from 'lucide-react'

export default function SalesPipeline() {
  const pipelineStages = [
    { name: 'New', value: 450000, count: 15, probability: 10, color: 'bg-blue-500' },
    { name: 'Contacted', value: 850000, count: 12, probability: 20, color: 'bg-purple-500' },
    { name: 'Consultation', value: 1250000, count: 8, probability: 35, color: 'bg-amber-500' },
    { name: 'Proposal', value: 2100000, count: 6, probability: 50, color: 'bg-indigo-500' },
    { name: 'Negotiation', value: 1850000, count: 4, probability: 75, color: 'bg-orange-500' },
    { name: 'Closed Won', value: 3200000, count: 12, probability: 100, color: 'bg-green-500' },
    { name: 'Closed Lost', value: 1500000, count: 8, probability: 0, color: 'bg-red-500' }
  ]
  
  const totalPipeline = pipelineStages.reduce((sum, stage) => 
    stage.name !== 'Closed Won' && stage.name !== 'Closed Lost' ? sum + stage.value : sum, 0
  )
  
  const weightedPipeline = pipelineStages.reduce((sum, stage) => 
    stage.name !== 'Closed Won' && stage.name !== 'Closed Lost' 
      ? sum + (stage.value * stage.probability / 100) 
      : sum, 0
  )
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Sales Pipeline</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg">
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
          <div className="text-3xl font-bold text-navy-900">${(totalPipeline / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-green-600 mt-1">↑ 12% from last month</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Weighted Pipeline</span>
            <Target className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">${(weightedPipeline / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-green-600 mt-1">Expected revenue</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Active Deals</span>
            <Users className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">45</div>
          <div className="text-sm text-amber-600 mt-1">8 closing this month</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Win Rate</span>
            <TrendingUp className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">38%</div>
          <div className="text-sm text-green-600 mt-1">↑ 5% from last quarter</div>
        </div>
      </div>
      
      {/* Pipeline Visualization */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-navy-900 mb-6">Pipeline by Stage</h3>
        <div className="space-y-4">
          {pipelineStages.map((stage) => (
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
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Upcoming Closures */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-navy-900 mb-4">Closing This Month</h3>
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
            <tr>
              <td className="px-4 py-3">First Regional Bank</td>
              <td className="px-4 py-3">$45,000</td>
              <td className="px-4 py-3">Negotiation</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">75%</span>
              </td>
              <td className="px-4 py-3">Feb 28, 2026</td>
              <td className="px-4 py-3">Sarah</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
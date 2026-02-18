// src/app/admin/sales/leads/page.tsx // Lead Scoring & Intelligence Dashboard
'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  TrendingUp,
  Target,
  Phone,
  Mail,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Plus,
  Star,
  Flame,
  Snowflake
} from 'lucide-react'

interface Lead {
  id: string
  companyName: string
  industry: string
  state: string
  contactName: string
  contactTitle: string
  email: string
  phone: string
  source: string
  score: number
  stage: string
  value: number
  lastContact: string
  nextAction: string
  assignedTo: string
  tags: string[]
}

export default function LeadIntelligence() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filters, setFilters] = useState({
    minScore: 0,
    stage: 'all',
    state: 'all',
    industry: 'all'
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchLeads()
  }, [])
  
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/admin/sales/leads')
      const data = await res.json()
      setLeads(data)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-slate-600 bg-slate-50 border-slate-200'
  }
  
  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Flame className="w-4 h-4 text-green-600" />
    if (score >= 50) return <Star className="w-4 h-4 text-amber-600" />
    return <Snowflake className="w-4 h-4 text-slate-600" />
  }
  
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-purple-100 text-purple-800',
      'consultation_scheduled': 'bg-amber-100 text-amber-800',
      'consultation_completed': 'bg-indigo-100 text-indigo-800',
      'proposal': 'bg-gold-100 text-gold-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed_won': 'bg-green-100 text-green-800',
      'closed_lost': 'bg-red-100 text-red-800'
    }
    return colors[stage] || 'bg-slate-100 text-slate-800'
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Lead Intelligence</h1>
          <p className="text-navy-600">AI-powered lead scoring and tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>
      
      {/* Score Distribution */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Hot Leads (80-100)</span>
            <Flame className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">24</div>
          <div className="text-sm text-green-600 mt-1">↑ 12% from last week</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Warm Leads (50-79)</span>
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">47</div>
          <div className="text-sm text-amber-600 mt-1">↑ 8% from last week</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Cold Leads (0-49)</span>
            <Snowflake className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">38</div>
          <div className="text-sm text-slate-600 mt-1">↓ 5% from last week</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Conversion Rate</span>
            <Target className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">23%</div>
          <div className="text-sm text-green-600 mt-1">↑ 3% from last month</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-navy-400" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select
            value={filters.minScore}
            onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          >
            <option value={0}>All Scores</option>
            <option value={80}>Hot (80+)</option>
            <option value={50}>Warm (50+)</option>
          </select>
          
          <select
            value={filters.stage}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="consultation_scheduled">Consultation Scheduled</option>
            <option value="proposal">Proposal</option>
          </select>
          
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">All States</option>
            <option value="NY">New York</option>
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="FL">Florida</option>
          </select>
        </div>
      </div>
      
      {/* Lead Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Last Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-navy-600" />
                    </div>
                    <div>
                      <div className="font-medium text-navy-900">{lead.companyName}</div>
                      <div className="text-sm text-navy-500">{lead.contactName}</div>
                      <div className="text-xs text-navy-400">{lead.industry}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                    {getScoreIcon(lead.score)}
                    {lead.score}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
                    {lead.stage.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-navy-600">{lead.source}</td>
                <td className="px-6 py-4 text-sm font-medium text-navy-900">${lead.value.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-navy-600">{new Date(lead.lastContact).toLocaleDateString()}</div>
                  <div className="text-xs text-navy-400">{lead.nextAction}</div>
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
    </div>
  )
}
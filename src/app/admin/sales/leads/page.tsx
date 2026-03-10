// src/app/admin/sales/leads/page.tsx - Enhanced Lead Scoring & Intelligence Dashboard
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Snowflake,
  Search,
  RefreshCw
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

interface LeadStats {
  hot: number
  warm: number
  cold: number
  conversionRate: number
  hotGrowth: number
  warmGrowth: number
  coldGrowth: number
  conversionGrowth: number
}

export default function LeadIntelligence() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats>({
    hot: 0,
    warm: 0,
    cold: 0,
    conversionRate: 0,
    hotGrowth: 12,
    warmGrowth: 8,
    coldGrowth: -5,
    conversionGrowth: 3
  })
  
  const [filters, setFilters] = useState({
    minScore: '0',
    stage: 'all',
    state: 'all',
    industry: 'all',
    search: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  useEffect(() => {
    fetchLeads()
  }, [])
  
  useEffect(() => {
    applyFilters()
  }, [leads, filters])
  
  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.minScore !== '0') params.append('minScore', filters.minScore)
      if (filters.stage !== 'all') params.append('stage', filters.stage)
      if (filters.state !== 'all') params.append('state', filters.state)
      if (filters.industry !== 'all') params.append('industry', filters.industry)
      
      const res = await fetch(`/api/admin/sales/leads?${params.toString()}`)
      const data = await res.json()
      setLeads(data)
      
      // Calculate stats
      const hot = data.filter((l: Lead) => l.score >= 80).length
      const warm = data.filter((l: Lead) => l.score >= 50 && l.score < 80).length
      const cold = data.filter((l: Lead) => l.score < 50).length
      const total = data.length
      const converted = data.filter((l: Lead) => l.stage === 'closed_won').length
      
      setStats(prev => ({
        ...prev,
        hot,
        warm,
        cold,
        conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0
      }))
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  const applyFilters = () => {
    let filtered = [...leads]
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(lead => 
        lead.companyName.toLowerCase().includes(searchLower) ||
        lead.contactName.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower)
      )
    }
    
    setFilteredLeads(filtered)
  }
  
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLeads()
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
  
  const handleExport = () => {
    const csv = [
      ['Company', 'Contact', 'Email', 'Phone', 'Score', 'Stage', 'Value', 'Last Contact'],
      ...filteredLeads.map(lead => [
        lead.companyName,
        lead.contactName,
        lead.email,
        lead.phone,
        lead.score.toString(),
        lead.stage,
        lead.value.toString(),
        new Date(lead.lastContact).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
            onClick={() => router.push('/admin/sales/leads/new')}
            className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800"
          >
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
          <div className="text-3xl font-bold text-navy-900">{stats.hot}</div>
          <div className={`text-sm mt-1 ${stats.hotGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.hotGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.hotGrowth)}% from last week
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Warm Leads (50-79)</span>
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{stats.warm}</div>
          <div className={`text-sm mt-1 ${stats.warmGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.warmGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.warmGrowth)}% from last week
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Cold Leads (0-49)</span>
            <Snowflake className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{stats.cold}</div>
          <div className={`text-sm mt-1 ${stats.coldGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.coldGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.coldGrowth)}% from last week
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Conversion Rate</span>
            <Target className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">{stats.conversionRate}%</div>
          <div className={`text-sm mt-1 ${stats.conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.conversionGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.conversionGrowth)}% from last month
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-navy-400" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select
            value={filters.minScore}
            onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          >
            <option value="0">All Scores</option>
            <option value="80">Hot (80+)</option>
            <option value="50">Warm (50+)</option>
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
            <option value="consultation_completed">Consultation Completed</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
          
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">All States</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="HI">Hawaii</option>
            <option value="ID">Idaho</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="ME">Maine</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="MT">Montana</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NH">New Hampshire</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="ND">North Dakota</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="RI">Rhode Island</option>
            <option value="SC">South Carolina</option>
            <option value="SD">South Dakota</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VT">Vermont</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WV">West Virginia</option>
            <option value="WI">Wisconsin</option>
            <option value="WY">Wyoming</option>
          </select>
          
          <select
            value={filters.industry}
            onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">All Industries</option>
            <option value="Banking">Banking</option>
            <option value="Fintech">Fintech</option>
            <option value="Insurance">Insurance</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Retail">Retail</option>
            <option value="Technology">Technology</option>
          </select>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Lead Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900"></div>
          </div>
        ) : (
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
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/admin/sales/leads/${lead.id}`)}
                  className="hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-navy-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-navy-900 truncate">{lead.companyName}</div>
                        <div className="text-sm text-navy-500 truncate">{lead.contactName}</div>
                        <div className="text-xs text-navy-400 truncate">{lead.industry}</div>
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
                  <td className="px-6 py-4 text-sm text-navy-600 capitalize">{lead.source}</td>
                  <td className="px-6 py-4 text-sm font-medium text-navy-900">${lead.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-navy-600">{new Date(lead.lastContact).toLocaleDateString()}</div>
                    {lead.nextAction && (
                      <div className="text-xs text-navy-400 truncate max-w-[150px]">{lead.nextAction}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/sales/leads/${lead.id}`)
                      }}
                      className="text-gold-600 hover:text-gold-700 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-navy-400">
                    No leads found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination (if needed) */}
      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-navy-600">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
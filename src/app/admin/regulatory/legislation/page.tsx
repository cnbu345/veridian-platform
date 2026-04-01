// src/app/admin/regulatory/legislation/page.tsx
// Legislation Tracker - Track bills affecting digital assets with LegiScan integration

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  Globe,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Types
interface Legislation {
  id: string
  state_code: string
  bill_number: string
  title: string
  description: string
  status: string
  introduced_date: string
  effective_date: string | null
  bill_url: string | null
  summary: string | null
  impact_assessment: string | null
  legiscan_bill_id: number | null
  reviewed_by_user?: {
    id: string
    email: string
    full_name: string
  }
  created_by_user?: {
    id: string
    email: string
    full_name: string
  }
  created_at: string
  updated_at: string
}

interface UsageStats {
  currentMonth: number
  remaining: number
  percentageUsed: number
  isNearLimit: boolean
  isOverLimit: boolean
  lastSyncDate: string | null
  syncsThisMonth: number
}

// State options
const STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
]

const STATUS_OPTIONS = [
  { value: 'introduced', label: 'Introduced', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_committee', label: 'In Committee', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'passed_house', label: 'Passed House', color: 'bg-purple-100 text-purple-800' },
  { value: 'passed_senate', label: 'Passed Senate', color: 'bg-purple-100 text-purple-800' },
  { value: 'enacted', label: 'Enacted', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
  { value: 'vetoed', label: 'Vetoed', color: 'bg-gray-100 text-gray-800' }
]

export default function LegislationTrackerPage() {
  const [legislation, setLegislation] = useState<Legislation[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState<string | null>(null)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncWarning, setSyncWarning] = useState<string | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    state_code: '',
    bill_number: '',
    title: '',
    description: '',
    status: 'introduced',
    introduced_date: '',
    effective_date: '',
    bill_url: '',
    summary: '',
    impact_assessment: ''
  })
  const [syncLog, setSyncLog] = useState<string[]>([])
  const [syncStats, setSyncStats] = useState({
    statesProcessed: 0,
    totalStates: 50,
    billsFound: 0,
    billsAdded: 0,
    billsUpdated: 0,
    currentState: '',
    currentKeyword: ''
  })
  const [filters, setFilters] = useState({
    state: '',
    status: ''
  })
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  })
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createClient()

  // Fetch legislation
  const fetchLegislation = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('legislation_tracker')
        .select('*', { count: 'exact' })
        .order('introduced_date', { ascending: false })
        .range(pagination.offset, pagination.offset + pagination.limit - 1)

      if (filters.state) query = query.eq('state_code', filters.state)
      if (filters.status) query = query.eq('status', filters.status)

      const { data, error, count } = await query

      if (error) throw error
      setLegislation(data || [])
      setPagination(prev => ({ ...prev, total: count || 0 }))
    } catch (error) {
      console.error('Error fetching legislation:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check sync availability
  const checkSyncAvailability = async () => {
    try {
      const res = await fetch('/api/admin/regulatory/legiscan/usage')
      const data = await res.json()
      setUsageStats(data)
      if (data.isNearLimit) {
        setSyncWarning(`⚠️ Warning: Only ${data.remaining.toLocaleString()} API queries remaining this month.`)
      } else {
        setSyncWarning(null)
      }
      setShowSyncModal(true)
    } catch (error) {
      console.error('Error checking sync availability:', error)
      setShowSyncModal(true)
    }
  }

  // Sync with LegiScan
  const syncWithLegiScan = async () => {
    setShowSyncModal(false)
    setSyncing(true)
    setSyncProgress('Starting sync...')
    
    try {
      const currentYear = new Date().getFullYear()
      
      const res = await fetch('/api/admin/regulatory/legiscan/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: currentYear })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSyncProgress(`Sync complete: ${data.added} new bills added, ${data.updated} updated`)
        alert(`Sync complete!\n\nAdded: ${data.added} new bills\nUpdated: ${data.updated} bills\nSkipped: ${data.skipped}\nUsed: ${data.queries} API queries\nRemaining: ${data.remainingQueries?.toLocaleString()} queries`)
        fetchLegislation()
      } else if (data.limitReached) {
        alert(`Monthly API limit reached. ${data.error}`)
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error) {
      console.error('Error syncing with LegiScan:', error)
      alert(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncProgress(null), 5000)
    }
  }
  // New function for sync with streaming progress
 const syncWithLegiScanStreaming = async () => {
    setShowSyncModal(false)
    setSyncing(true)
    setSyncLog([])
    setSyncStats({
        statesProcessed: 0,
        totalStates: 50,
        billsFound: 0,
        billsAdded: 0,
        billsUpdated: 0,
        currentState: '',
        currentKeyword: ''
    })
    setSyncProgress('Starting sync...')
    
    try {
        const currentYear = new Date().getFullYear()
        
        // Use EventSource for streaming progress (or polling)
        const response = await fetch('/api/admin/regulatory/legiscan/sync-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: currentYear })
        })
        
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (!reader) throw new Error('No reader available')
        
        while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
            try {
                const data = JSON.parse(line.slice(6))
                
                if (data.type === 'progress') {
                setSyncStats(prev => ({
                    ...prev,
                    statesProcessed: data.statesProcessed || prev.statesProcessed,
                    billsFound: data.billsFound || prev.billsFound,
                    billsAdded: data.billsAdded || prev.billsAdded,
                    billsUpdated: data.billsUpdated || prev.billsUpdated,
                    currentState: data.currentState || prev.currentState,
                    currentKeyword: data.currentKeyword || prev.currentKeyword
                }))
                setSyncProgress(data.message)
                setSyncLog(prev => [...prev, data.message])
                } else if (data.type === 'complete') {
                setSyncProgress(`Sync complete: ${data.added} new bills added, ${data.updated} updated`)
                setSyncStats(prev => ({
                    ...prev,
                    billsAdded: data.added,
                    billsUpdated: data.updated
                }))
                alert(`Sync complete!\n\nAdded: ${data.added} new bills\nUpdated: ${data.updated} bills\nSkipped: ${data.skipped}\nUsed: ${data.queries} API queries\nRemaining: ${data.remainingQueries?.toLocaleString()} queries`)
                fetchLegislation()
                } else if (data.type === 'error') {
                throw new Error(data.message)
                }
            } catch (e) {
                console.error('Error parsing progress:', e)
            }
            }
        }
        }
    } catch (error) {
        console.error('Error syncing with LegiScan:', error)
        setSyncLog(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`])
        alert(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
        setSyncing(false)
        setTimeout(() => {
        setSyncProgress(null)
        setTimeout(() => setSyncLog([]), 10000) // Clear log after 10 seconds
        }, 3000)
    }
  }

  // Handle create/update
  const handleSubmit = async () => {
    if (!formData.state_code || !formData.bill_number || !formData.title) {
      alert('Please fill in required fields: State, Bill Number, and Title')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId 
        ? `/api/admin/regulatory/legislation/${editingId}`
        : '/api/admin/regulatory/legislation'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          effective_date: formData.effective_date || null,
          bill_url: formData.bill_url || null,
          summary: formData.summary || null,
          impact_assessment: formData.impact_assessment || null
        })
      })

      if (res.ok) {
        setShowForm(false)
        setEditingId(null)
        setFormData({
          state_code: '',
          bill_number: '',
          title: '',
          description: '',
          status: 'introduced',
          introduced_date: '',
          effective_date: '',
          bill_url: '',
          summary: '',
          impact_assessment: ''
        })
        fetchLegislation()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving legislation:', error)
      alert('Failed to save legislation')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this legislation? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/regulatory/legislation/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchLegislation()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting legislation:', error)
      alert('Failed to delete legislation')
    }
  }

  // Handle mark as reviewed
  const handleMarkReviewed = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/regulatory/legislation/${id}/review`, {
        method: 'POST'
      })

      if (res.ok) {
        fetchLegislation()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error marking reviewed:', error)
      alert('Failed to mark as reviewed')
    }
  }

  // Edit handler
  const handleEdit = (item: Legislation) => {
    setEditingId(item.id)
    setFormData({
      state_code: item.state_code,
      bill_number: item.bill_number,
      title: item.title,
      description: item.description || '',
      status: item.status,
      introduced_date: item.introduced_date.split('T')[0],
      effective_date: item.effective_date ? item.effective_date.split('T')[0] : '',
      bill_url: item.bill_url || '',
      summary: item.summary || '',
      impact_assessment: item.impact_assessment || ''
    })
    setShowForm(true)
  }

  useEffect(() => {
    fetchLegislation()
  }, [filters, pagination.offset])

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const option = STATUS_OPTIONS.find(s => s.value === status)
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${option?.color || 'bg-gray-100'}`}>
        {option?.label || status}
      </span>
    )
  }

  // Filtered legislation (client-side search)
  const filteredLegislation = legislation.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bill_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Test sync with a single state
const testSyncWithLegiScan = async (stateCode: string) => {
  setSyncing(true)
  setSyncProgress(`Testing sync for ${stateCode}...`)
  
  try {
    const currentYear = new Date().getFullYear()
    
    const res = await fetch('/api/admin/regulatory/legiscan/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: currentYear, stateCode })
    })
    
    const data = await res.json()
    
    if (data.success) {
      setSyncProgress(`Test complete: Found ${data.added} new bills in ${stateCode}`)
      alert(`Test Sync Complete!\n\nState: ${stateCode}\nAdded: ${data.added} new bills\nUpdated: ${data.updated} bills\nUsed: ${data.queries} API queries`)
      fetchLegislation() // Refresh the list
    } else if (data.limitReached) {
      alert(`API limit reached: ${data.error}`)
    } else {
      throw new Error(data.error || 'Sync failed')
    }
  } catch (error) {
    console.error('Error testing sync:', error)
    alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    setSyncing(false)
    setTimeout(() => setSyncProgress(null), 3000)
  }
}
// Test sync with a single state

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Legislation Tracker</h1>
          <p className="text-gray-500 mt-1">Track bills affecting digital assets across all states</p>
        </div>
        <div className="flex gap-3">
          {/* LegiScan Sync Button */}
          <button
            onClick={checkSyncAvailability}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            title="Sync with LegiScan API - Import crypto-related bills automatically"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync with LegiScan'}
          </button>
          
          {/* Add Bill Button */}
          <button
            onClick={() => {
              setEditingId(null)
              setFormData({
                state_code: '',
                bill_number: '',
                title: '',
                description: '',
                status: 'introduced',
                introduced_date: '',
                effective_date: '',
                bill_url: '',
                summary: '',
                impact_assessment: ''
              })
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Bill
          </button>
        </div>
      </div>

      {/* Sync Progress Indicator */}
      {syncProgress && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm text-blue-700">{syncProgress}</span>
        </div>
      )}

      {/* Info Card - LegiScan Integration */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">LegiScan Integration Active</h3>
            <p className="text-sm text-blue-700 mt-1">
              Click <strong>Sync with LegiScan</strong> to automatically import crypto-related bills from all 50 states. 
              The system searches for keywords like "cryptocurrency", "digital asset", "blockchain", and "virtual currency".
              Bills are automatically added to your tracker for review.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All States</option>
            {STATES.map(state => (
              <option key={state.code} value={state.code}>{state.code} - {state.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFilters({ state: '', status: '' })}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </button>
          <button
            onClick={fetchLegislation}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Legislation Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading legislation...</p>
          </div>
        ) : filteredLegislation.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No legislation found</p>
            <div className="flex justify-center gap-3 mt-3">
              <button
                onClick={() => setShowForm(true)}
                className="text-gold-600 hover:text-gold-700"
              >
                Add a bill manually →
              </button>
              <button
                onClick={checkSyncAvailability}
                disabled={syncing}
                className="text-blue-600 hover:text-blue-700"
              >
                Sync with LegiScan →
              </button>
              {/* Test Sync Button - Single State */}
             <button
                onClick={() => testSyncWithLegiScan('FL')}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Test Sync (FL)
            </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Introduced</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLegislation.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                        {item.state_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900">{item.bill_number}</span>
                      {item.legiscan_bill_id && (
                        <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          LegiScan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-900 font-medium truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.introduced_date ? new Date(item.introduced_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.effective_date ? new Date(item.effective_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.bill_url && (
                          <a
                            href={item.bill_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="View Bill"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleMarkReviewed(item.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as Reviewed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredLegislation.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} bills
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                disabled={pagination.offset === 0}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LegiScan Sync Confirmation Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                LegiScan Sync
                </h3>
                <button
                onClick={() => setShowSyncModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
                >
                <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Usage Stats */}
            {usageStats && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Monthly Usage</span>
                    <span className="font-medium">{usageStats.currentMonth.toLocaleString()} / 30,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                    className={`h-2 rounded-full transition-all ${
                        usageStats.percentageUsed > 90 ? 'bg-red-500' : 
                        usageStats.percentageUsed > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(usageStats.percentageUsed, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Remaining: {usageStats.remaining.toLocaleString()}</span>
                    <span>Syncs this month: {usageStats.syncsThisMonth}</span>
                </div>
                </div>
            )}

            {/* Warning Message */}
            {syncWarning && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-700">{syncWarning}</p>
                </div>
                </div>
            )}

            <p className="text-gray-600 mb-4">
                This will search for crypto-related bills in all 50 states and import them into your tracker.
                {usageStats && (
                <span className="block text-xs text-gray-400 mt-2">
                    Estimated queries: ~1,500-2,000 per full sync
                </span>
                )}
            </p>

            <div className="flex gap-3">
                <button
                onClick={syncWithLegiScanStreaming}
                disabled={usageStats?.remaining === 0}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                {usageStats?.remaining === 0 ? 'Monthly Limit Reached' : 'Start Sync'}
                </button>
                <button
                onClick={() => setShowSyncModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                Cancel
                </button>
            </div>

            {usageStats?.remaining === 0 && (
                <p className="text-xs text-red-500 mt-3 text-center">
                Monthly API limit reached. Resets on the first of the month.
                </p>
            )}
            </div>
        </div>
    )}

    {/* Enhanced Sync Progress Display */}
    {syncing && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <h3 className="font-medium text-blue-800">LegiScan Sync in Progress</h3>
            </div>
            </div>
            
            <div className="p-4 space-y-4">
            {/* Progress Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">States Processed</p>
                <p className="text-lg font-bold text-blue-600">{syncStats.statesProcessed} / {syncStats.totalStates}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Bills Found</p>
                <p className="text-lg font-bold text-purple-600">{syncStats.billsFound}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">New Bills Added</p>
                <p className="text-lg font-bold text-green-600">{syncStats.billsAdded}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Bills Updated</p>
                <p className="text-lg font-bold text-yellow-600">{syncStats.billsUpdated}</p>
                </div>
            </div>
            
            {/* Current Operation */}
            <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                <span className="font-medium">Currently:</span> {syncProgress}
                </p>
                {syncStats.currentState && (
                <p className="text-xs text-gray-400 mt-1">
                    State: {syncStats.currentState} | Keyword: {syncStats.currentKeyword}
                </p>
                )}
            </div>
            
            {/* Progress Bar */}
            <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall Progress</span>
                <span>{Math.round((syncStats.statesProcessed / syncStats.totalStates) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(syncStats.statesProcessed / syncStats.totalStates) * 100}%` }}
                />
                </div>
            </div>
            
            {/* Live Log */}
            {syncLog.length > 0 && (
                <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Live Activity Log</p>
                <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-xs">
                    {syncLog.slice(-15).map((log, idx) => (
                    <div key={idx} className={`py-0.5 ${log.includes('✅') ? 'text-green-400' : log.includes('❌') ? 'text-red-400' : 'text-gray-300'}`}>
                        {log}
                    </div>
                    ))}
                </div>
                </div>
            )}
            </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Edit Bill' : 'Add New Bill'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    value={formData.state_code}
                    onChange={(e) => setFormData({ ...formData, state_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">Select State</option>
                    {STATES.map(state => (
                      <option key={state.code} value={state.code}>{state.code} - {state.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number *</label>
                  <input
                    type="text"
                    value={formData.bill_number}
                    onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="HB 1234, SB 567, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Bill title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Bill description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Introduced Date</label>
                  <input
                    type="date"
                    value={formData.introduced_date}
                    onChange={(e) => setFormData({ ...formData, introduced_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill URL</label>
                  <input
                    type="url"
                    value={formData.bill_url}
                    onChange={(e) => setFormData({ ...formData, bill_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Brief summary of the bill..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact Assessment</label>
                <textarea
                  value={formData.impact_assessment}
                  onChange={(e) => setFormData({ ...formData, impact_assessment: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="How does this affect digital asset businesses?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-gold-600 text-white py-2 rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Bill' : 'Add Bill'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
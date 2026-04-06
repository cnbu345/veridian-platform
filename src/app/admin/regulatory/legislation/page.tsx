// src/app/admin/regulatory/legislation/page.tsx
// Legislation Tracker - Track bills affecting digital assets across all states

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
  AlertCircle,
  Clock,
  Activity,
  Bell,
  Check,
  X as XIcon
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

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
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
  { value: 'introduced', label: 'Introduced', color: 'bg-blue-100 text-blue-800', icon: FileText },
  { value: 'in_committee', label: 'In Committee', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'passed_house', label: 'Passed House', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  { value: 'passed_senate', label: 'Passed Senate', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  { value: 'enacted', label: 'Enacted', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800', icon: XCircle },
  { value: 'vetoed', label: 'Vetoed', color: 'bg-gray-100 text-gray-800', icon: XCircle }
]

// Safe date formatter that preserves the date as-is without timezone conversion
function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-')
    return `${month}/${day}/${year}`
  }
  return new Date(dateString).toLocaleDateString()
}

// Toast notification component
function Toast({ toast, onClose }: { toast: ToastMessage; onClose: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, toast.duration || 5000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[toast.type]

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Bell
  }[toast.type]

  return (
    <div className={`${bgColor} rounded-lg shadow-lg border p-4 mb-3 animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          <p className="text-sm opacity-90">{toast.message}</p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="p-1 hover:bg-black/10 rounded-lg transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function LegislationTrackerPage() {
  const [legislation, setLegislation] = useState<Legislation[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncingSpecific, setSyncingSpecific] = useState(false)
  const [selectedSyncState, setSelectedSyncState] = useState('')
  const [syncProgress, setSyncProgress] = useState<string | null>(null)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncWarning, setSyncWarning] = useState<string | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
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

  // Add toast notification
  const addToast = (type: ToastMessage['type'], title: string, message: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, type, title, message, duration }])
  }

  // Remove toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

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
      addToast('error', 'Error', 'Failed to load legislation')
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

  // Full sync (all states)
  const syncAllStates = async () => {
    setShowSyncModal(false)
    setSyncingAll(true)
    setSyncProgress('Starting full sync of all 50 states...')
    
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
        addToast(
          'success',
          'Sync Complete',
          `Added ${data.added} new bills, updated ${data.updated} bills. Used ${data.queries} API queries.`,
          8000
        )
        fetchLegislation()
      } else if (data.limitReached) {
        addToast('error', 'API Limit Reached', data.error)
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error) {
      console.error('Error syncing with LegiScan:', error)
      addToast('error', 'Sync Failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setSyncingAll(false)
      setTimeout(() => setSyncProgress(null), 3000)
    }
  }

  // Sync a specific state
  const syncSpecificState = async () => {
    if (!selectedSyncState) {
      addToast('warning', 'No State Selected', 'Please select a state to sync')
      return
    }
    
    const stateName = STATES.find(s => s.code === selectedSyncState)?.name || selectedSyncState
    setSyncingSpecific(true)
    setSyncProgress(`Syncing ${stateName}...`)
    
    try {
      const currentYear = new Date().getFullYear()
      
      const res = await fetch('/api/admin/regulatory/legiscan/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: currentYear, stateCode: selectedSyncState })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSyncProgress(`Sync complete: ${data.added} new bills in ${stateName}`)
        addToast(
          'success',
          `${stateName} Sync Complete`,
          `Added ${data.added} new bills, updated ${data.updated} bills. Used ${data.queries} API queries.`,
          6000
        )
        fetchLegislation()
        setSelectedSyncState('')
      } else if (data.limitReached) {
        addToast('error', 'API Limit Reached', data.error)
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error) {
      console.error('Error syncing state:', error)
      addToast('error', 'Sync Failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setSyncingSpecific(false)
      setTimeout(() => setSyncProgress(null), 3000)
    }
  }

  // Handle create/update
  const handleSubmit = async () => {
    if (!formData.state_code || !formData.bill_number || !formData.title) {
      addToast('warning', 'Missing Fields', 'Please fill in State, Bill Number, and Title')
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
        addToast(
          'success',
          editingId ? 'Bill Updated' : 'Bill Added',
          editingId ? 'The bill has been successfully updated.' : 'The bill has been successfully added to the tracker.'
        )
        fetchLegislation()
      } else {
        const error = await res.json()
        addToast('error', 'Error', error.error || 'Failed to save bill')
      }
    } catch (error) {
      console.error('Error saving legislation:', error)
      addToast('error', 'Error', 'Failed to save bill')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string, billNumber: string) => {
    if (!confirm(`Are you sure you want to delete ${billNumber}? This action cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/regulatory/legislation/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        addToast('success', 'Bill Deleted', `${billNumber} has been removed from the tracker.`)
        fetchLegislation()
      } else {
        const error = await res.json()
        addToast('error', 'Error', error.error || 'Failed to delete bill')
      }
    } catch (error) {
      console.error('Error deleting legislation:', error)
      addToast('error', 'Error', 'Failed to delete bill')
    }
  }

  // Handle mark as reviewed
  const handleMarkReviewed = async (id: string, billNumber: string) => {
    try {
      const res = await fetch(`/api/admin/regulatory/legislation/${id}/review`, {
        method: 'POST'
      })

      if (res.ok) {
        addToast('success', 'Marked as Reviewed', `${billNumber} has been marked as reviewed by legal team.`)
        fetchLegislation()
      } else {
        const error = await res.json()
        addToast('error', 'Error', error.error || 'Failed to mark as reviewed')
      }
    } catch (error) {
      console.error('Error marking reviewed:', error)
      addToast('error', 'Error', 'Failed to mark as reviewed')
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
      introduced_date: item.introduced_date?.split('T')[0] || '',
      effective_date: item.effective_date?.split('T')[0] || '',
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
    const Icon = option?.icon || FileText
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${option?.color || 'bg-gray-100'}`}>
        <Icon className="w-3 h-3" />
        {option?.label || status}
      </span>
    )
  }

  // Filtered legislation (client-side search)
  const filteredLegislation = legislation.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bill_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isSyncing = syncingAll || syncingSpecific

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 w-96 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Legislation Tracker</h1>
          <p className="text-gray-500 mt-1">Track bills affecting digital assets across all states</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Sync Selected State Button */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSyncState}
              onChange={(e) => setSelectedSyncState(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
              disabled={isSyncing}
            >
              <option value="">Select a state...</option>
              {STATES.map(state => (
                <option key={state.code} value={state.code}>{state.code} - {state.name}</option>
              ))}
            </select>
            <button
              onClick={syncSpecificState}
              disabled={!selectedSyncState || isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              title="Sync selected state"
            >
              <RefreshCw className={`w-4 h-4 ${syncingSpecific ? 'animate-spin' : ''}`} />
              {syncingSpecific ? 'Syncing...' : 'Sync State'}
            </button>
          </div>
          
          {/* LegiScan Full Sync Button */}
          <button
            onClick={checkSyncAvailability}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            title="Sync all 50 states"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
            {syncingAll ? 'Syncing All...' : 'Sync All States'}
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

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">LegiScan Integration Active</h3>
            <p className="text-sm text-blue-700 mt-1">
              Track crypto-related bills across all 50 states. Use the dropdown to sync a specific state, 
              or click <strong>Sync All States</strong> for a full update. Bills are automatically imported 
              with status, last action, and introduced date.
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
                disabled={isSyncing}
                className="text-blue-600 hover:text-blue-700"
              >
                Sync with LegiScan →
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Introduced</th>
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-900">{item.bill_number}</span>
                        {item.legiscan_bill_id && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            LegiScan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium max-w-md truncate" title={item.title}>
                        {item.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {item.description ? (
                        <div className="max-w-xs">
                          <p className="text-xs text-gray-500 line-clamp-2" title={item.description}>
                            {item.description}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(item.introduced_date)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.bill_url && (
                          <a
                            href={item.bill_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="View Bill on LegiScan"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleMarkReviewed(item.id, item.bill_number)}
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
                          onClick={() => handleDelete(item.id, item.bill_number)}
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
          <div className="bg-white rounded-xl max-w-md w-full p-6">
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
            </p>

            <div className="flex gap-3">
              <button
                onClick={syncAllStates}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Action</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Latest action on this bill..."
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
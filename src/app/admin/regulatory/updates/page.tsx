// src/app/admin/regulatory/updates/page.tsx
// State Updates - Track and manage pending regulatory changes

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Scale,
  PlusCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  Calendar,
  Flag,
  Building2,
  Eye
} from 'lucide-react'

// Types
interface RegulatoryUpdate {
  id: string
  state_code: string
  title: string
  description: string
  category: string
  current_value: string | null
  proposed_value: string | null
  source_name: string
  source_url: string
  effective_date: string | null
  status: string
  priority: string
  review_notes: string | null
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
  reviewed_at: string | null
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

const CATEGORIES = [
  { value: 'license', label: 'License Requirement', color: 'bg-blue-100 text-blue-800' },
  { value: 'fee', label: 'Fee Amount', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'bond', label: 'Bonding Requirement', color: 'bg-purple-100 text-purple-800' },
  { value: 'timeline', label: 'Processing Timeline', color: 'bg-green-100 text-green-800' },
  { value: 'tax', label: 'Tax Treatment', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'legislation', label: 'Legislation', color: 'bg-red-100 text-red-800' },
  { value: 'enforcement', label: 'Enforcement', color: 'bg-orange-100 text-orange-800' }
]

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' }
]

export default function StateUpdatesPage() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    state_code: '',
    title: '',
    description: '',
    category: 'license',
    current_value: '',
    proposed_value: '',
    source_name: '',
    source_url: '',
    effective_date: '',
    priority: 'medium'
  })
  const [filters, setFilters] = useState({
    state: '',
    category: '',
    status: 'pending_review',
    priority: ''
  })
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  })
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUpdate, setSelectedUpdate] = useState<RegulatoryUpdate | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Fetch updates
  const fetchUpdates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.state) params.append('state', filters.state)
      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      params.append('limit', pagination.limit.toString())
      params.append('offset', pagination.offset.toString())

      const res = await fetch(`/api/admin/regulatory/updates?${params}`)
      const data = await res.json()
      setUpdates(data.data || [])
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }))
    } catch (error) {
      console.error('Error fetching updates:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle create/update
  const handleSubmit = async () => {
    if (!formData.state_code || !formData.title || !formData.source_name) {
      alert('Please fill in required fields: State, Title, and Source')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId 
        ? `/api/admin/regulatory/updates/${editingId}`
        : '/api/admin/regulatory/updates'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const payload = {
        state_code: formData.state_code,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        current_value: formData.current_value || null,
        proposed_value: formData.proposed_value || null,
        source_name: formData.source_name,
        source_url: formData.source_url,
        effective_date: formData.effective_date || null,
        priority: formData.priority
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setShowForm(false)
        setEditingId(null)
        setFormData({
          state_code: '',
          title: '',
          description: '',
          category: 'license',
          current_value: '',
          proposed_value: '',
          source_name: '',
          source_url: '',
          effective_date: '',
          priority: 'medium'
        })
        fetchUpdates()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving update:', error)
      alert('Failed to save update')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/regulatory/updates/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      })

      if (res.ok) {
        fetchUpdates()
        alert('Update approved successfully')
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error approving update:', error)
      alert('Failed to approve update')
    }
  }

  // Handle reject
  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      const res = await fetch(`/api/admin/regulatory/updates/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: rejectReason })
      })

      if (res.ok) {
        setShowRejectModal(false)
        setRejectReason('')
        fetchUpdates()
        alert('Update rejected')
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error rejecting update:', error)
      alert('Failed to reject update')
    }
  }

  // Handle edit
  const handleEdit = (update: RegulatoryUpdate) => {
    setEditingId(update.id)
    setFormData({
      state_code: update.state_code,
      title: update.title,
      description: update.description || '',
      category: update.category,
      current_value: update.current_value || '',
      proposed_value: update.proposed_value || '',
      source_name: update.source_name,
      source_url: update.source_url || '',
      effective_date: update.effective_date?.split('T')[0] || '',
      priority: update.priority
    })
    setShowForm(true)
  }

  // Handle view details
  const handleViewDetails = (update: RegulatoryUpdate) => {
    setSelectedUpdate(update)
    setShowDetailModal(true)
  }

  useEffect(() => {
    fetchUpdates()
  }, [filters, pagination.offset])

  // Priority badge
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority)
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${option?.color || 'bg-gray-100'}`}>
        <Flag className="w-3 h-3" />
        {option?.label || priority}
      </span>
    )
  }

  // Category badge
  const CategoryBadge = ({ category }: { category: string }) => {
    const cat = CATEGORIES.find(c => c.value === category)
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat?.color || 'bg-gray-100'}`}>
        {cat?.label || category}
      </span>
    )
  }

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'pending_review') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Pending Review
        </span>
      )
    }
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      )
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <AlertCircle className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const filteredUpdates = updates.filter(update =>
    update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    update.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">State Updates</h1>
          <p className="text-gray-500 mt-1">Track and manage pending regulatory changes</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({
              state_code: '',
              title: '',
              description: '',
              category: 'license',
              current_value: '',
              proposed_value: '',
              source_name: '',
              source_url: '',
              effective_date: '',
              priority: 'medium'
            })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Update
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-600">
                {updates.filter(u => u.status === 'pending_review').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {updates.filter(u => u.status === 'approved').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {updates.filter(u => u.status === 'rejected').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Critical Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {updates.filter(u => u.priority === 'critical' && u.status === 'pending_review').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
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
                placeholder="Search updates..."
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
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFilters({ state: '', category: '', status: 'pending_review', priority: '' })}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </button>
          <button
            onClick={fetchUpdates}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Updates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading updates...</p>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="p-12 text-center">
            <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No updates found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-gold-600 hover:text-gold-700"
            >
              Add your first update →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUpdates.map((update) => (
                  <tr key={update.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewDetails(update)}>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                        {update.state_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-900">{update.title}</p>
                        <p className="text-xs text-gray-500 truncate">{update.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CategoryBadge category={update.category} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={update.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={update.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="text-gray-600">{update.source_name}</p>
                        {update.source_url && (
                          <a
                            href={update.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold-600 hover:text-gold-700 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Source <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {update.status === 'pending_review' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(update.id)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUpdate(update)
                              setShowRejectModal(true)
                            }}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(update)}
                            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(update)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredUpdates.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} updates
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Edit Update' : 'Add New Update'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="e.g., BitLicense Fee Increase Proposed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Detailed description of the proposed change..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                  <input
                    type="text"
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., $5,000 application fee"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Value</label>
                  <input
                    type="text"
                    value={formData.proposed_value}
                    onChange={(e) => setFormData({ ...formData, proposed_value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., $7,500 application fee"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Name *</label>
                  <input
                    type="text"
                    value={formData.source_name}
                    onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., NYDFS Press Release"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
                  <input
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="https://..."
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {PRIORITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-gold-600 text-white py-2 rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Add Update'}
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

      {/* Detail Modal */}
      {showDetailModal && selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Update Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-xs text-gray-500">State</p>
                  <p className="font-medium">{selectedUpdate.state_code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <CategoryBadge category={selectedUpdate.category} />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Title</p>
                <p className="font-medium text-lg">{selectedUpdate.title}</p>
              </div>

              {selectedUpdate.description && (
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-700">{selectedUpdate.description}</p>
                </div>
              )}

              {(selectedUpdate.current_value || selectedUpdate.proposed_value) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedUpdate.current_value && (
                    <div>
                      <p className="text-xs text-gray-500">Current Value</p>
                      <p className="text-sm font-mono bg-gray-50 p-2 rounded">{selectedUpdate.current_value}</p>
                    </div>
                  )}
                  {selectedUpdate.proposed_value && (
                    <div>
                      <p className="text-xs text-gray-500">Proposed Value</p>
                      <p className="text-sm font-mono bg-yellow-50 p-2 rounded">{selectedUpdate.proposed_value}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="text-sm">{selectedUpdate.source_name}</p>
                {selectedUpdate.source_url && (
                  <a
                    href={selectedUpdate.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-600 hover:text-gold-700 text-sm flex items-center gap-1 mt-1"
                  >
                    View Source <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Effective Date</p>
                  <p className="text-sm">{selectedUpdate.effective_date ? new Date(selectedUpdate.effective_date).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority</p>
                  <PriorityBadge priority={selectedUpdate.priority} />
                </div>
              </div>

              {selectedUpdate.review_notes && (
                <div>
                  <p className="text-xs text-gray-500">Review Notes</p>
                  <p className="text-sm text-gray-600 italic">{selectedUpdate.review_notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-xs text-gray-400">
                  {new Date(selectedUpdate.created_at).toLocaleString()}
                  {selectedUpdate.created_by_user?.full_name && ` by ${selectedUpdate.created_by_user.full_name}`}
                </p>
                {selectedUpdate.reviewed_at && (
                  <>
                    <p className="text-xs text-gray-500 mt-2">Reviewed</p>
                    <p className="text-xs text-gray-400">
                      {new Date(selectedUpdate.reviewed_at).toLocaleString()}
                      {selectedUpdate.reviewed_by_user?.full_name && ` by ${selectedUpdate.reviewed_by_user.full_name}`}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              {selectedUpdate.status === 'pending_review' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      handleApprove(selectedUpdate.id)
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedUpdate(selectedUpdate)
                      setShowRejectModal(true)
                    }}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  handleEdit(selectedUpdate)
                }}
                className="flex-1 bg-gold-600 text-white py-2 rounded-lg hover:bg-gold-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reject Update</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this update:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 mb-4"
              placeholder="Reason for rejection..."
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleReject(selectedUpdate.id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
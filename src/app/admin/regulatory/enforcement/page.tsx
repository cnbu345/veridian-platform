// src/app/admin/regulatory/enforcement/page.tsx
// Enforcement Actions - Track regulatory enforcement against crypto businesses

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Gavel,
  PlusCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  Building2,
  AlertTriangle,
  FileText,
  DollarSign,
  Scale,
  Eye
} from 'lucide-react'

// Types
interface EnforcementAction {
  id: string
  state_code: string
  agency_name: string
  defendant: string
  action_type: string
  description: string
  penalty_amount: number | null
  penalty_currency: string
  action_date: string
  resolution_date: string | null
  source_url: string | null
  document_urls: string[] | null
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

const ACTION_TYPES = [
  { value: 'cease_and_desist', label: 'Cease and Desist', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  { value: 'fine', label: 'Fine', color: 'bg-red-100 text-red-800', icon: DollarSign },
  { value: 'license_revocation', label: 'License Revocation', color: 'bg-purple-100 text-purple-800', icon: Scale },
  { value: 'settlement', label: 'Settlement', color: 'bg-blue-100 text-blue-800', icon: FileText },
  { value: 'criminal_charges', label: 'Criminal Charges', color: 'bg-red-100 text-red-800', icon: Gavel },
  { value: 'warning', label: 'Warning', color: 'bg-gray-100 text-gray-600', icon: AlertTriangle }
]

const AGENCIES = [
  'NYDFS', 'DFPI', 'Texas DOB', 'Florida OFR', 'Wyoming Banking', 'Colorado AG',
  'Washington DFI', 'Illinois IDFPR', 'Massachusetts Division of Banks', 'New Jersey DOBI',
  'SEC', 'CFTC', 'FinCEN', 'DOJ', 'FTC'
]

export default function EnforcementActionsPage() {
  const [actions, setActions] = useState<EnforcementAction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    state_code: '',
    agency_name: '',
    defendant: '',
    action_type: 'cease_and_desist',
    description: '',
    penalty_amount: '',
    penalty_currency: 'USD',
    action_date: '',
    resolution_date: '',
    source_url: '',
    document_urls: ''
  })
  const [filters, setFilters] = useState({
    state: '',
    agency: ''
  })
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  })
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<EnforcementAction | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Fetch enforcement actions
  const fetchActions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.state) params.append('state', filters.state)
      if (filters.agency) params.append('agency', filters.agency)
      params.append('limit', pagination.limit.toString())
      params.append('offset', pagination.offset.toString())

      const res = await fetch(`/api/admin/regulatory/enforcement?${params}`)
      const data = await res.json()
      setActions(data.data || [])
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }))
    } catch (error) {
      console.error('Error fetching enforcement actions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle create/update
  const handleSubmit = async () => {
    if (!formData.state_code || !formData.agency_name || !formData.defendant || !formData.action_type) {
      alert('Please fill in required fields: State, Agency, Defendant, and Action Type')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId 
        ? `/api/admin/regulatory/enforcement/${editingId}`
        : '/api/admin/regulatory/enforcement'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const payload = {
        state_code: formData.state_code,
        agency_name: formData.agency_name,
        defendant: formData.defendant,
        action_type: formData.action_type,
        description: formData.description,
        penalty_amount: formData.penalty_amount ? parseFloat(formData.penalty_amount) : null,
        penalty_currency: formData.penalty_currency,
        action_date: formData.action_date,
        resolution_date: formData.resolution_date || null,
        source_url: formData.source_url || null,
        document_urls: formData.document_urls ? formData.document_urls.split(',').map(u => u.trim()) : null
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
          agency_name: '',
          defendant: '',
          action_type: 'cease_and_desist',
          description: '',
          penalty_amount: '',
          penalty_currency: 'USD',
          action_date: '',
          resolution_date: '',
          source_url: '',
          document_urls: ''
        })
        fetchActions()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving enforcement action:', error)
      alert('Failed to save enforcement action')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enforcement action? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/regulatory/enforcement/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchActions()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting enforcement action:', error)
      alert('Failed to delete enforcement action')
    }
  }

  // Handle edit
  const handleEdit = (item: EnforcementAction) => {
    setEditingId(item.id)
    setFormData({
      state_code: item.state_code,
      agency_name: item.agency_name,
      defendant: item.defendant,
      action_type: item.action_type,
      description: item.description || '',
      penalty_amount: item.penalty_amount?.toString() || '',
      penalty_currency: item.penalty_currency,
      action_date: item.action_date.split('T')[0],
      resolution_date: item.resolution_date ? item.resolution_date.split('T')[0] : '',
      source_url: item.source_url || '',
      document_urls: item.document_urls?.join(', ') || ''
    })
    setShowForm(true)
  }

  // Handle view details
  const handleViewDetails = (action: EnforcementAction) => {
    setSelectedAction(action)
    setShowDetailModal(true)
  }

  useEffect(() => {
    fetchActions()
  }, [filters, pagination.offset])

  // Action type badge component
  const ActionTypeBadge = ({ type }: { type: string }) => {
    const action = ACTION_TYPES.find(a => a.value === type)
    const Icon = action?.icon || Gavel
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${action?.color || 'bg-gray-100'}`}>
        <Icon className="w-3 h-3" />
        {action?.label || type}
      </span>
    )
  }

  // Format currency
  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }

  // Filtered actions (client-side search)
  const filteredActions = actions.filter(item =>
    item.defendant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.agency_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Enforcement Actions</h1>
          <p className="text-gray-500 mt-1">Track regulatory enforcement actions against digital asset businesses</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({
              state_code: '',
              agency_name: '',
              defendant: '',
              action_type: 'cease_and_desist',
              description: '',
              penalty_amount: '',
              penalty_currency: 'USD',
              action_date: '',
              resolution_date: '',
              source_url: '',
              document_urls: ''
            })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Enforcement Action
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Actions</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Gavel className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Fines & Penalties</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  actions.reduce((sum, a) => sum + (a.penalty_amount || 0), 0),
                  'USD'
                )}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">License Revocations</p>
              <p className="text-2xl font-bold">
                {actions.filter(a => a.action_type === 'license_revocation').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Cases</p>
              <p className="text-2xl font-bold">
                {actions.filter(a => !a.resolution_date).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
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
                placeholder="Search by defendant, agency, or description..."
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
            value={filters.agency}
            onChange={(e) => setFilters({ ...filters, agency: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Agencies</option>
            {AGENCIES.map(agency => (
              <option key={agency} value={agency}>{agency}</option>
            ))}
          </select>
          <button
            onClick={() => setFilters({ state: '', agency: '' })}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </button>
          <button
            onClick={fetchActions}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Enforcement Actions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading enforcement actions...</p>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="p-12 text-center">
            <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No enforcement actions found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-gold-600 hover:text-gold-700"
            >
              Add your first enforcement action →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defendant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredActions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewDetails(item)}>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                        {item.state_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{item.agency_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{item.defendant}</span>
                      {item.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{item.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <ActionTypeBadge type={item.action_type} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(item.penalty_amount, item.penalty_currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.action_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
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
        {!loading && filteredActions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} actions
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
                {editingId ? 'Edit Enforcement Action' : 'Add New Enforcement Action'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agency *</label>
                  <input
                    type="text"
                    value={formData.agency_name}
                    onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                    list="agencies"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., NYDFS, SEC"
                  />
                  <datalist id="agencies">
                    {AGENCIES.map(agency => (
                      <option key={agency} value={agency} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Defendant *</label>
                <input
                  type="text"
                  value={formData.defendant}
                  onChange={(e) => setFormData({ ...formData, defendant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Company or individual name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type *</label>
                  <select
                    value={formData.action_type}
                    onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {ACTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Amount</label>
                    <input
                      type="number"
                      value={formData.penalty_amount}
                      onChange={(e) => setFormData({ ...formData, penalty_amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={formData.penalty_currency}
                      onChange={(e) => setFormData({ ...formData, penalty_currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Detailed description of the violation..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Date *</label>
                  <input
                    type="date"
                    value={formData.action_date}
                    onChange={(e) => setFormData({ ...formData, action_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Date</label>
                  <input
                    type="date"
                    value={formData.resolution_date}
                    onChange={(e) => setFormData({ ...formData, resolution_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document URLs (comma separated)</label>
                <input
                  type="text"
                  value={formData.document_urls}
                  onChange={(e) => setFormData({ ...formData, document_urls: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="https://..., https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-gold-600 text-white py-2 rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Action' : 'Add Action'}
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
      {showDetailModal && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Enforcement Action Details</h3>
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
                  <p className="font-medium">{selectedAction.state_code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Agency</p>
                  <p className="font-medium">{selectedAction.agency_name}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Defendant</p>
                <p className="font-medium text-lg">{selectedAction.defendant}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Action Type</p>
                <ActionTypeBadge type={selectedAction.action_type} />
              </div>

              {selectedAction.penalty_amount && (
                <div>
                  <p className="text-xs text-gray-500">Penalty</p>
                  <p className="font-medium text-red-600 text-lg">
                    {formatCurrency(selectedAction.penalty_amount, selectedAction.penalty_currency)}
                  </p>
                </div>
              )}

              {selectedAction.description && (
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAction.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Action Date</p>
                  <p className="text-sm">{new Date(selectedAction.action_date).toLocaleDateString()}</p>
                </div>
                {selectedAction.resolution_date && (
                  <div>
                    <p className="text-xs text-gray-500">Resolution Date</p>
                    <p className="text-sm">{new Date(selectedAction.resolution_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {selectedAction.source_url && (
                <div>
                  <p className="text-xs text-gray-500">Source</p>
                  <a
                    href={selectedAction.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-600 hover:text-gold-700 text-sm flex items-center gap-1"
                  >
                    View Source <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {selectedAction.document_urls && selectedAction.document_urls.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500">Documents</p>
                  <div className="space-y-1 mt-1">
                    {selectedAction.document_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-600 hover:text-gold-700 text-sm flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Document {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-xs text-gray-400">
                  {new Date(selectedAction.created_at).toLocaleString()}
                  {selectedAction.created_by_user?.full_name && ` by ${selectedAction.created_by_user.full_name}`}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  handleEdit(selectedAction)
                }}
                className="flex-1 bg-gold-600 text-white py-2 rounded-lg hover:bg-gold-700 transition-colors"
              >
                Edit Action
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
    </div>
  )
}
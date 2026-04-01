// src/app/admin/regulatory/content/page.tsx
// Content Library - Review, edit, and verify regulatory facts

'use client'

import { useEffect, useState } from 'react'
import {
  Database,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
  RefreshCw,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  CheckSquare,
  Square,
  History,
  UserCheck,
  Calendar
} from 'lucide-react'

// Types
interface RegulatoryFact {
  id: string
  state_code: string
  claim: string
  category: string
  source_name: string
  source_url: string
  source_date: string
  verification_status: 'verified' | 'needs_update' | 'deprecated'
  review_required: boolean
  review_reason: string | null
  confidence_score: number
  verified_by: string | null
  verified_by_name: string | null
  last_reviewed_at: string | null
  created_at: string
  updated_at: string
  notes: string | null
  numeric_value: number | null
  numeric_unit: string | null
}

interface StateRegulatorLink {
  state_code: string
  state_name: string
  regulator_name: string
  website_url: string
  license_page_url: string | null
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
  { value: 'license_requirement', label: 'License Requirement', color: 'bg-blue-100 text-blue-800' },
  { value: 'timeline', label: 'Timeline', color: 'bg-green-100 text-green-800' },
  { value: 'fee_amount', label: 'Fee Amount', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'bonding_amount', label: 'Bonding Amount', color: 'bg-purple-100 text-purple-800' },
  { value: 'tax_treatment', label: 'Tax Treatment', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'pending_legislation', label: 'Pending Legislation', color: 'bg-red-100 text-red-800' },
  { value: 'enforcement_action', label: 'Enforcement Action', color: 'bg-orange-100 text-orange-800' },
  { value: 'regulator_contact', label: 'Regulator Contact', color: 'bg-gray-100 text-gray-800' },
  { value: 'reporting_requirement', label: 'Reporting Requirement', color: 'bg-teal-100 text-teal-800' },
  { value: 'capital_requirement', label: 'Capital Requirement', color: 'bg-pink-100 text-pink-800' }
]

export default function ContentLibraryPage() {
  const [facts, setFacts] = useState<RegulatoryFact[]>([])
  const [regulatorLinks, setRegulatorLinks] = useState<Map<string, StateRegulatorLink>>(new Map())
  const [loading, setLoading] = useState(true)
  const [selectedFacts, setSelectedFacts] = useState<Set<string>>(new Set())
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFact, setEditingFact] = useState<RegulatoryFact | null>(null)
  const [editForm, setEditForm] = useState({
    claim: '',
    source_name: '',
    source_url: '',
    source_date: '',
    notes: '',
    verification_status: 'needs_update' as 'verified' | 'needs_update' | 'deprecated',
    confidence_score: 0.7,
    numeric_value: '',
    numeric_unit: ''
  })
  const [filters, setFilters] = useState({
    state: '',
    category: '',
    status: '',
    needsReview: false
  })
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  })
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<any[]>([])

  // Fetch regulatory facts
  const fetchFacts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.state) params.append('state', filters.state)
      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)
      if (filters.needsReview) params.append('needs_review', 'true')
      params.append('limit', pagination.limit.toString())
      params.append('offset', pagination.offset.toString())

      const res = await fetch(`/api/admin/regulatory/facts?${params}`)
      const data = await res.json()
      setFacts(data.data || [])
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }))
    } catch (error) {
      console.error('Error fetching facts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch regulator links
  const fetchRegulatorLinks = async () => {
    try {
      const res = await fetch('/api/admin/regulatory/state-links')
      const data = await res.json()
      const linksMap = new Map()
      data.forEach((link: StateRegulatorLink) => {
        linksMap.set(link.state_code, link)
      })
      setRegulatorLinks(linksMap)
    } catch (error) {
      console.error('Error fetching regulator links:', error)
    }
  }

  // Handle bulk verify
  const handleBulkVerify = async () => {
    if (selectedFacts.size === 0) {
      alert('Please select facts to verify')
      return
    }

    const notes = prompt('Add verification notes (optional):')
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/regulatory/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factIds: Array.from(selectedFacts),
          notes: notes || undefined
        })
      })

      if (res.ok) {
        setSelectedFacts(new Set())
        fetchFacts()
        alert(`Successfully verified ${selectedFacts.size} facts`)
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error bulk verifying:', error)
      alert('Failed to verify facts')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle single verify
  const handleVerify = async (id: string) => {
    const notes = prompt('Add verification notes (optional):')
    
    try {
      const res = await fetch('/api/admin/regulatory/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factIds: [id],
          notes: notes || undefined
        })
      })

      if (res.ok) {
        fetchFacts()
        alert('Fact verified successfully')
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error verifying fact:', error)
      alert('Failed to verify fact')
    }
  }

  // Handle edit
  const handleEdit = (fact: RegulatoryFact) => {
    setEditingFact(fact)
    setEditForm({
      claim: fact.claim,
      source_name: fact.source_name,
      source_url: fact.source_url,
      source_date: fact.source_date?.split('T')[0] || '',
      notes: fact.notes || '',
      verification_status: fact.verification_status,
      confidence_score: fact.confidence_score,
      numeric_value: fact.numeric_value?.toString() || '',
      numeric_unit: fact.numeric_unit || ''
    })
    setShowEditModal(true)
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingFact) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/regulatory/facts/${editingFact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: editForm.claim,
          source_name: editForm.source_name,
          source_url: editForm.source_url,
          source_date: editForm.source_date,
          notes: editForm.notes,
          verification_status: editForm.verification_status,
          confidence_score: editForm.confidence_score,
          numeric_value: editForm.numeric_value ? parseFloat(editForm.numeric_value) : null,
          numeric_unit: editForm.numeric_unit || null
        })
      })

      if (res.ok) {
        setShowEditModal(false)
        setEditingFact(null)
        fetchFacts()
        alert('Fact updated successfully')
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving fact:', error)
      alert('Failed to save fact')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle view history
  const handleViewHistory = async (factId: string) => {
    try {
      const res = await fetch(`/api/admin/regulatory/audit?recordId=${factId}&table=regulatory_facts&limit=50`)
      const data = await res.json()
      setHistoryEntries(data.data || [])
      setShowHistoryModal(true)
    } catch (error) {
      console.error('Error fetching history:', error)
      alert('Failed to load history')
    }
  }

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedFacts.size === filteredFacts.length) {
      setSelectedFacts(new Set())
    } else {
      setSelectedFacts(new Set(filteredFacts.map(f => f.id)))
    }
  }

  // Toggle select single
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedFacts)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedFacts(newSet)
  }

  useEffect(() => {
    fetchFacts()
    fetchRegulatorLinks()
  }, [filters, pagination.offset])

  // Filter facts client-side for search
  const filteredFacts = facts.filter(fact =>
    fact.claim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fact.state_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Status badge component
  const StatusBadge = ({ fact }: { fact: RegulatoryFact }) => {
    if (fact.review_required) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Needs Review
        </span>
      )
    }
    if (fact.verification_status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      )
    }
    if (fact.verification_status === 'deprecated') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <XCircle className="w-3 h-3" />
          Deprecated
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3" />
        Needs Update
      </span>
    )
  }

  // Confidence score component
  const ConfidenceScore = ({ score }: { score: number }) => {
    const percentage = Math.round(score * 100)
    const color = score >= 0.9 ? 'bg-green-500' : score >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-200 rounded-full h-1.5">
          <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
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

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Content Library</h1>
          <p className="text-gray-500 mt-1">Review, verify, and edit regulatory facts</p>
        </div>
        <div className="flex gap-3">
          {selectedFacts.size > 0 && (
            <button
              onClick={handleBulkVerify}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Verify Selected ({selectedFacts.size})
            </button>
          )}
          <button
            onClick={fetchFacts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Facts</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Needs Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {facts.filter(f => f.review_required).length}
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
              <p className="text-gray-500 text-sm">Verified</p>
              <p className="text-2xl font-bold text-green-600">
                {facts.filter(f => f.verification_status === 'verified' && !f.review_required).length}
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
              <p className="text-gray-500 text-sm">Avg Confidence</p>
              <p className="text-2xl font-bold">
                {Math.round((facts.reduce((sum, f) => sum + f.confidence_score, 0) / (facts.length || 1)) * 100)}%
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
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
                placeholder="Search facts..."
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
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.needsReview}
              onChange={(e) => setFilters({ ...filters, needsReview: e.target.checked })}
              className="w-4 h-4 text-gold-600 rounded"
            />
            <span className="text-sm text-gray-600">Needs Review Only</span>
          </label>
          <button
            onClick={() => setFilters({ state: '', category: '', status: '', needsReview: false })}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Facts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading facts...</p>
          </div>
        ) : filteredFacts.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No facts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 text-xs font-medium text-gray-500"
                    >
                      {selectedFacts.size === filteredFacts.length ? (
                        <CheckSquare className="w-4 h-4 text-gold-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFacts.map((fact) => (
                  <tr key={fact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(fact.id)}
                        className="flex items-center"
                      >
                        {selectedFacts.has(fact.id) ? (
                          <CheckSquare className="w-4 h-4 text-gold-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                        {fact.state_code}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <CategoryBadge category={fact.category} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-900 line-clamp-2">{fact.claim}</p>
                        {fact.notes && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">📝 {fact.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge fact={fact} />
                    </td>
                    <td className="px-4 py-4">
                      <ConfidenceScore score={fact.confidence_score} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs">
                        <p className="text-gray-600">{fact.source_name}</p>
                        {fact.source_url && (
                          <a
                            href={fact.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold-600 hover:text-gold-700 flex items-center gap-1"
                          >
                            Source <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {regulatorLinks.get(fact.state_code) && (
                          <a
                            href={regulatorLinks.get(fact.state_code)?.license_page_url || regulatorLinks.get(fact.state_code)?.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gold-600 transition-colors"
                            title="State Regulator Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleViewHistory(fact.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(fact.id)}
                          disabled={!fact.review_required && fact.verification_status === 'verified'}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Verify"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(fact)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
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
        {!loading && filteredFacts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} facts
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

      {/* Edit Modal */}
      {showEditModal && editingFact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Regulatory Fact</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editingFact.state_code}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={CATEGORIES.find(c => c.value === editingFact.category)?.label || editingFact.category}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim *</label>
                <textarea
                  value={editForm.claim}
                  onChange={(e) => setEditForm({ ...editForm, claim: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Name *</label>
                  <input
                    type="text"
                    value={editForm.source_name}
                    onChange={(e) => setEditForm({ ...editForm, source_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Date</label>
                  <input
                    type="date"
                    value={editForm.source_date}
                    onChange={(e) => setEditForm({ ...editForm, source_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
                <input
                  type="url"
                  value={editForm.source_url}
                  onChange={(e) => setEditForm({ ...editForm, source_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numeric Value</label>
                  <input
                    type="number"
                    value={editForm.numeric_value}
                    onChange={(e) => setEditForm({ ...editForm, numeric_value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editForm.numeric_unit}
                    onChange={(e) => setEditForm({ ...editForm, numeric_unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="USD, months, percent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Internal)</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Internal notes about this fact..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                  <select
                    value={editForm.verification_status}
                    onChange={(e) => setEditForm({ ...editForm, verification_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="verified">Verified</option>
                    <option value="needs_update">Needs Update</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Score</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={editForm.confidence_score}
                    onChange={(e) => setEditForm({ ...editForm, confidence_score: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-right text-sm text-gray-500">{Math.round(editForm.confidence_score * 100)}%</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={submitting}
                  className="flex-1 bg-gold-600 text-white py-2 rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5" />
                Change History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {historyEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No history available</p>
            ) : (
              <div className="space-y-4">
                {historyEntries.map((entry, idx) => (
                  <div key={idx} className="border-l-4 border-gray-200 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                        entry.action === 'VERIFY' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.action}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(entry.changed_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {entry.changed_by_name || 'System'} - {entry.reason || 'No reason provided'}
                    </p>
                    {entry.old_data && entry.new_data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer">View changes</summary>
                        <pre className="text-xs text-gray-500 mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                          {JSON.stringify({ old: entry.old_data, new: entry.new_data }, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
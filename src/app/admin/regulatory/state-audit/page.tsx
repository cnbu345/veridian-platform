// src/app/admin/regulatory/state-audit/page.tsx
// State Audit Tool - Quarterly review checklist with editable links

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Calendar,
  FileText,
  DollarSign,
  Gavel,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronDown,
  Edit,
  Save,
  X,
  Globe,
  Link as LinkIcon
} from 'lucide-react'

interface StateAudit {
  id?: string
  state_code: string
  state_name: string
  last_reviewed: string | null
  licensing_verified: boolean
  fees_verified: boolean
  bonding_verified: boolean
  enforcement_verified: boolean
  notes: string | null
  // Editable links
  regulator_url: string
  license_page_url: string | null
  fee_page_url: string | null
  bond_page_url: string | null
  enforcement_page_url: string | null
}

// Initial state data with default links (will be updated from database)
const INITIAL_STATES: Omit<StateAudit, 'id' | 'last_reviewed' | 'licensing_verified' | 'fees_verified' | 'bonding_verified' | 'enforcement_verified' | 'notes'>[] = [
  { state_code: 'AL', state_name: 'Alabama', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'AK', state_name: 'Alaska', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'AZ', state_name: 'Arizona', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'AR', state_name: 'Arkansas', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'CA', state_name: 'California', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'CO', state_name: 'Colorado', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'CT', state_name: 'Connecticut', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'DE', state_name: 'Delaware', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'FL', state_name: 'Florida', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'GA', state_name: 'Georgia', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'HI', state_name: 'Hawaii', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'ID', state_name: 'Idaho', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'IL', state_name: 'Illinois', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'IN', state_name: 'Indiana', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'IA', state_name: 'Iowa', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'KS', state_name: 'Kansas', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'KY', state_name: 'Kentucky', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'LA', state_name: 'Louisiana', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'ME', state_name: 'Maine', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'MD', state_name: 'Maryland', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'MA', state_name: 'Massachusetts', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'MI', state_name: 'Michigan', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'MN', state_name: 'Minnesota', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'MS', state_name: 'Mississippi', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'MO', state_name: 'Missouri', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'MT', state_name: 'Montana', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'NE', state_name: 'Nebraska', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'NV', state_name: 'Nevada', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'NH', state_name: 'New Hampshire', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'NJ', state_name: 'New Jersey', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'NM', state_name: 'New Mexico', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'NY', state_name: 'New York', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'NC', state_name: 'North Carolina', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'ND', state_name: 'North Dakota', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'OH', state_name: 'Ohio', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'OK', state_name: 'Oklahoma', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'OR', state_name: 'Oregon', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'PA', state_name: 'Pennsylvania', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'RI', state_name: 'Rhode Island', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'SC', state_name: 'South Carolina', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'SD', state_name: 'South Dakota', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'TN', state_name: 'Tennessee', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'TX', state_name: 'Texas', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'UT', state_name: 'Utah', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'VT', state_name: 'Vermont', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'VA', state_name: 'Virginia', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'WA', state_name: 'Washington', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'WV', state_name: 'West Virginia', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'WI', state_name: 'Wisconsin', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null },
  { state_code: 'WY', state_name: 'Wyoming', regulator_url: '', license_page_url: null, fee_page_url: null, bond_page_url: null, enforcement_page_url: null }
]

export default function StateAuditPage() {
  const [audits, setAudits] = useState<StateAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedState, setExpandedState] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<{ stateCode: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  const supabase = createClient()

  // Load audits from database
  const loadAudits = async () => {
    setLoading(true)
    try {
      // Load state audit tracker data
      const { data: auditData, error: auditError } = await supabase
        .from('state_audit_tracker')
        .select('*')

      if (auditError) throw auditError

      // Load state regulator links
      const { data: linksData, error: linksError } = await supabase
        .from('state_regulator_links')
        .select('*')

      if (linksError) throw linksError

      // Create a map of links by state code
      const linksMap = new Map()
      linksData?.forEach(link => {
        linksMap.set(link.state_code, link)
      })

      // Merge all data
      const mergedAudits: StateAudit[] = INITIAL_STATES.map(state => {
        const audit = auditData?.find(a => a.state_code === state.state_code)
        const links = linksMap.get(state.state_code)
        
        return {
          ...state,
          id: audit?.id,
          last_reviewed: audit?.last_reviewed || null,
          licensing_verified: audit?.licensing_verified || false,
          fees_verified: audit?.fees_verified || false,
          bonding_verified: audit?.bonding_verified || false,
          enforcement_verified: audit?.enforcement_verified || false,
          notes: audit?.notes || null,
          regulator_url: links?.website_url || '',
          license_page_url: links?.license_page_url || null,
          fee_page_url: null,
          bond_page_url: null,
          enforcement_page_url: links?.enforcement_page_url || null
        }
      })

      setAudits(mergedAudits)
    } catch (error) {
      console.error('Error loading audits:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update a link
  const updateLink = async (stateCode: string, field: string, value: string) => {
    setSaving(stateCode)
    try {
      // Determine which column in state_regulator_links to update
      let columnName = ''
      switch (field) {
        case 'regulator_url': columnName = 'website_url'; break
        case 'license_page_url': columnName = 'license_page_url'; break
        case 'enforcement_page_url': columnName = 'enforcement_page_url'; break
        default: return
      }

      // Update the link in database
      const { error } = await supabase
        .from('state_regulator_links')
        .update({ [columnName]: value || null, updated_at: new Date().toISOString() })
        .eq('state_code', stateCode)

      if (error) throw error

      // Update local state
      setAudits(prev => prev.map(a => 
        a.state_code === stateCode ? { ...a, [field]: value || null } : a
      ))

    } catch (error) {
      console.error('Error updating link:', error)
      alert('Failed to update link')
    } finally {
      setSaving(null)
      setEditingLink(null)
    }
  }

  // Toggle a verification checkbox
  const toggleCheck = async (audit: StateAudit, field: keyof Pick<StateAudit, 'licensing_verified' | 'fees_verified' | 'bonding_verified' | 'enforcement_verified'>) => {
    setSaving(audit.state_code)
    try {
      const updated = { ...audit, [field]: !audit[field] }
      
      const { error } = await supabase
        .from('state_audit_tracker')
        .upsert({
          state_code: audit.state_code,
          last_reviewed: new Date().toISOString(),
          licensing_verified: updated.licensing_verified,
          fees_verified: updated.fees_verified,
          bonding_verified: updated.bonding_verified,
          enforcement_verified: updated.enforcement_verified,
          notes: audit.notes
        })

      if (error) throw error

      setAudits(prev => prev.map(a => 
        a.state_code === audit.state_code ? { ...updated, last_reviewed: new Date().toISOString() } : a
      ))
    } catch (error) {
      console.error('Error saving audit:', error)
      alert('Failed to save audit')
    } finally {
      setSaving(null)
    }
  }

  // Update notes
  const updateNotes = async (audit: StateAudit, notes: string) => {
    setSaving(audit.state_code)
    try {
      const { error } = await supabase
        .from('state_audit_tracker')
        .upsert({
          state_code: audit.state_code,
          last_reviewed: new Date().toISOString(),
          licensing_verified: audit.licensing_verified,
          fees_verified: audit.fees_verified,
          bonding_verified: audit.bonding_verified,
          enforcement_verified: audit.enforcement_verified,
          notes: notes
        })

      if (error) throw error

      setAudits(prev => prev.map(a => 
        a.state_code === audit.state_code ? { ...audit, notes, last_reviewed: new Date().toISOString() } : a
      ))
    } catch (error) {
      console.error('Error updating notes:', error)
      alert('Failed to update notes')
    } finally {
      setSaving(null)
    }
  }

  // Start editing a link
  const startEdit = (stateCode: string, field: string, currentValue: string | null) => {
    setEditingLink({ stateCode, field })
    setEditValue(currentValue || '')
  }

  useEffect(() => {
    loadAudits()
  }, [])

  // Filter audits
  const filteredAudits = audits.filter(a => {
    if (searchTerm && !a.state_name.toLowerCase().includes(searchTerm.toLowerCase()) && !a.state_code.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (filter === 'pending') {
      return !a.licensing_verified || !a.fees_verified || !a.bonding_verified || !a.enforcement_verified
    }
    if (filter === 'verified') {
      return a.licensing_verified && a.fees_verified && a.bonding_verified && a.enforcement_verified
    }
    return true
  })

  const stats = {
    total: audits.length,
    fullyVerified: audits.filter(a => a.licensing_verified && a.fees_verified && a.bonding_verified && a.enforcement_verified).length,
    needsReview: audits.filter(a => {
      const lastReview = a.last_reviewed ? new Date(a.last_reviewed) : null
      return !lastReview || (Date.now() - lastReview.getTime()) > 90 * 24 * 60 * 60 * 1000
    }).length
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading state audit tool...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">State Audit Tool</h1>
          <p className="text-gray-500 mt-1">Quarterly review checklist with editable regulator links</p>
        </div>
        <button
          onClick={loadAudits}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 self-start"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total States</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Fully Verified</p>
              <p className="text-2xl font-bold text-green-600">{stats.fullyVerified}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Needs Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.needsReview}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by state name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-gold-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All States
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Needs Review
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'verified' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Verified
            </button>
          </div>
        </div>
      </div>

      {/* State Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAudits.map((audit) => {
          const allVerified = audit.licensing_verified && audit.fees_verified && audit.bonding_verified && audit.enforcement_verified
          const needsReview = !audit.last_reviewed || (Date.now() - new Date(audit.last_reviewed).getTime()) > 90 * 24 * 60 * 60 * 1000
          const isExpanded = expandedState === audit.state_code
          const isSaving = saving === audit.state_code
          
          return (
            <div key={audit.state_code} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
              needsReview && !allVerified ? 'border-yellow-200 bg-yellow-50/20' : allVerified ? 'border-green-200' : 'border-gray-100'
            }`}>
              {/* Header */}
              <div className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${needsReview && !allVerified ? 'bg-yellow-50/50' : 'bg-gray-50'}`} onClick={() => setExpandedState(isExpanded ? null : audit.state_code)}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-lg font-bold">{audit.state_code}</span>
                    <span className="ml-2 text-sm text-gray-600">{audit.state_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {allVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : needsReview ? (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-300" />
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {audit.last_reviewed && (
                  <div className="text-xs text-gray-400 mt-1">
                    Last reviewed: {new Date(audit.last_reviewed).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {/* Content - Expandable */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {/* Editable Links Section */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      REGULATOR LINKS (Click ✏️ to edit)
                    </p>
                    
                    {/* Regulator Website */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group">
                      {editingLink?.stateCode === audit.state_code && editingLink?.field === 'regulator_url' ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="url"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
                            placeholder="https://..."
                            autoFocus
                          />
                          <button
                            onClick={() => updateLink(audit.state_code, 'regulator_url', editValue)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingLink(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 truncate max-w-[200px]">{audit.regulator_url || 'No URL set'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {audit.regulator_url && (
                              <a
                                href={audit.regulator_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-400 hover:text-gold-600"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => startEdit(audit.state_code, 'regulator_url', audit.regulator_url)}
                              className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* License Page */}
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg group">
                      {editingLink?.stateCode === audit.state_code && editingLink?.field === 'license_page_url' ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="url"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
                            placeholder="https://..."
                            autoFocus
                          />
                          <button
                            onClick={() => updateLink(audit.state_code, 'license_page_url', editValue)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingLink(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-700 truncate max-w-[200px]">{audit.license_page_url || 'No URL set'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {audit.license_page_url && (
                              <a
                                href={audit.license_page_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-400 hover:text-gold-600"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => startEdit(audit.state_code, 'license_page_url', audit.license_page_url)}
                              className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Enforcement Page */}
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg group">
                      {editingLink?.stateCode === audit.state_code && editingLink?.field === 'enforcement_page_url' ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="url"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gold-500"
                            placeholder="https://..."
                            autoFocus
                          />
                          <button
                            onClick={() => updateLink(audit.state_code, 'enforcement_page_url', editValue)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingLink(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Gavel className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-700 truncate max-w-[200px]">{audit.enforcement_page_url || 'No URL set'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {audit.enforcement_page_url && (
                              <a
                                href={audit.enforcement_page_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-400 hover:text-gold-600"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => startEdit(audit.state_code, 'enforcement_page_url', audit.enforcement_page_url)}
                              className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Verification Checklist */}
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">VERIFICATION CHECKLIST</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => toggleCheck(audit, 'licensing_verified')}
                        disabled={isSaving}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Licensing Requirements</span>
                        </div>
                        {audit.licensing_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleCheck(audit, 'fees_verified')}
                        disabled={isSaving}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Fee Schedules</span>
                        </div>
                        {audit.fees_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleCheck(audit, 'bonding_verified')}
                        disabled={isSaving}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <Gavel className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Bond Requirements</span>
                        </div>
                        {audit.bonding_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleCheck(audit, 'enforcement_verified')}
                        disabled={isSaving}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <Gavel className="w-4 h-4 text-red-500" />
                          <span className="text-sm">Enforcement Actions</span>
                        </div>
                        {audit.enforcement_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="border-t pt-3">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Internal Notes</label>
                    <textarea
                      value={audit.notes || ''}
                      onChange={(e) => updateNotes(audit, e.target.value)}
                      disabled={isSaving}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:opacity-50"
                      placeholder="Add notes about this state's regulations..."
                    />
                  </div>

                  {/* Save Indicator */}
                  {isSaving && (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Saving...
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAudits.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No states match your filters</p>
          <button
            onClick={() => { setSearchTerm(''); setFilter('all') }}
            className="mt-2 text-gold-600 hover:text-gold-700"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
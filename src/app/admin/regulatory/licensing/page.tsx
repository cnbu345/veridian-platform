// src/app/admin/regulatory/licensing/page.tsx
// Licensing Requirement Manager - Central source of truth for state licensing

'use client'

import { useEffect, useState } from 'react'
import {
  Scale,
  Save,
  RotateCcw,
  CheckCircle,
  History,
  AlertTriangle,
  DollarSign,
  Clock,
  Building2,
  ExternalLink,
  Search,
  ChevronDown,
  Loader2,
  UserCheck,
  Calendar
} from 'lucide-react'
import ResearchAssistant from '@/components/admin/ResearchAssistant'

// Types
interface LicensingRequirement {
  id: string
  state_code: string
  license_required: string
  license_name: string
  license_description: string
  regulatory_climate: string
  application_fee: number
  application_fee_unit: string
  annual_renewal_fee: number
  annual_renewal_fee_unit: string
  bond_requirement_min: number
  bond_requirement_max: number
  bond_requirement_unit: string
  net_worth_requirement: number
  net_worth_requirement_unit: string
  processing_time_min_months: number
  processing_time_max_months: number
  processing_time_description: string
  source_name: string
  source_url: string
  effective_date: string
  verified_by: string
  verified_at: string
  last_reviewed_at: string
  regulator_name: string
  regulator_website: string
  regulator_phone: string
  regulator_email: string
  notes: string
  internal_notes: string
  verification_status: 'verified' | 'needs_review' | 'deprecated'
  review_priority: 'critical' | 'high' | 'medium' | 'low'
  confidence_score: number
  created_at: string
  updated_at: string
}

const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const LICENSE_OPTIONS = [
  { value: 'none', label: 'No License Required' },
  { value: 'mtl', label: 'Money Transmitter License (MTL)' },
  { value: 'bitlicense', label: 'BitLicense' },
  { value: 'dfpi', label: 'DFPI License' },
  { value: 'varies', label: 'Varies by Activity' }
]

const CLIMATE_OPTIONS = [
  { value: 'friendly', label: 'Friendly', color: 'text-green-600 bg-green-50' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'strict', label: 'Strict', color: 'text-red-600 bg-red-50' }
]

const STATUS_OPTIONS = [
  { value: 'verified', label: 'Verified', color: 'text-green-600 bg-green-50' },
  { value: 'needs_review', label: 'Needs Review', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'deprecated', label: 'Deprecated', color: 'text-red-600 bg-red-50' }
]

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-50' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'low', label: 'Low', color: 'text-gray-600 bg-gray-50' }
]

export default function LicensingManagerPage() {
  const [requirements, setRequirements] = useState<Record<string, LicensingRequirement>>({})
  const [selectedState, setSelectedState] = useState<string>('NY')
  const [currentData, setCurrentData] = useState<Partial<LicensingRequirement>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<any[]>([])
  const [showConfidenceModal, setShowConfidenceModal] = useState(false)

  // Fetch all licensing requirements
  const fetchRequirements = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/regulatory/licensing')
      const data = await res.json()
      
      const requirementsMap: Record<string, LicensingRequirement> = {}
      data.data?.forEach((req: LicensingRequirement) => {
        requirementsMap[req.state_code] = req
      })
      setRequirements(requirementsMap)
      
      // Set current data for selected state
      if (requirementsMap[selectedState]) {
        setCurrentData(requirementsMap[selectedState])
      } else {
        // Initialize empty form for new state
        setCurrentData({
          state_code: selectedState,
          license_required: 'none',
          regulatory_climate: 'moderate',
          verification_status: 'needs_review',
          review_priority: 'medium',
          application_fee_unit: 'USD',
          bond_requirement_unit: 'USD',
          net_worth_requirement_unit: 'USD'
        })
      }
    } catch (error) {
      console.error('Error fetching requirements:', error)
    } finally {
      setLoading(false)
    }
  }

  // Save current state data
  const saveCurrentState = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/regulatory/licensing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      })
      
      if (res.ok) {
        await fetchRequirements()
        alert(`${selectedState} requirements saved successfully!`)
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save requirements')
    } finally {
      setSaving(false)
    }
  }

  // Mark as verified
  const markAsVerified = async () => {
    const updated = {
      ...currentData,
      verification_status: 'verified',
      last_reviewed_at: new Date().toISOString(),
      confidence_score: 1.0
    }
    setCurrentData(updated)
    
    try {
      const res = await fetch('/api/admin/regulatory/licensing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      
      if (res.ok) {
        await fetchRequirements()
        alert(`${selectedState} marked as verified!`)
      }
    } catch (error) {
      console.error('Error marking verified:', error)
    }
  }

  // View history
  const viewHistory = async () => {
    try {
      const res = await fetch(`/api/admin/regulatory/audit?table=licensing_requirements&recordId=${selectedState}&limit=50`)
      const data = await res.json()
      setHistoryEntries(data.data || [])
      setShowHistory(true)
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  // Update confidence score
  const updateConfidence = async () => {
    const updated = {
      ...currentData,
      confidence_score: currentData.confidence_score || 0.7
    }
    setCurrentData(updated)
    setShowConfidenceModal(false)
    await saveCurrentState()
  }

  useEffect(() => {
    fetchRequirements()
  }, [])

  useEffect(() => {
    if (requirements[selectedState]) {
      setCurrentData(requirements[selectedState])
    } else {
      setCurrentData({
        state_code: selectedState,
        license_required: 'none',
        regulatory_climate: 'moderate',
        verification_status: 'needs_review',
        review_priority: 'medium'
      })
    }
  }, [selectedState, requirements])

  // Filter states for sidebar
  const filteredStates = ALL_STATES.filter(state => {
    const req = requirements[state]
    const matchesSearch = state.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || req?.verification_status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Status badge
  const StatusBadge = ({ status, priority }: { status: string; priority?: string }) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status)
    const priorityConfig = PRIORITY_OPTIONS.find(p => p.value === priority)
    
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100'}`}>
          {statusConfig?.label || status}
        </span>
        {priority && priority !== 'medium' && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig?.color || 'bg-gray-100'}`}>
            {priorityConfig?.label}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Sidebar - State List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-navy-900 mb-3">States</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="needs_review">Needs Review</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            filteredStates.map(stateCode => {
              const req = requirements[stateCode]
              return (
                <button
                  key={stateCode}
                  onClick={() => setSelectedState(stateCode)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedState === stateCode ? 'bg-gold-50 border-l-4 border-l-gold-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium">{stateCode}</span>
                    {req && <StatusBadge status={req.verification_status} priority={req.review_priority} />}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Content - Licensing Form */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Header */}
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-navy-900">
                Licensing Requirements: {selectedState}
                </h1>
                <p className="text-gray-500 mt-1">
                Maintain accurate licensing data for this state
                </p>
            </div>
            <div className="flex gap-3 items-center">
                
                <button
                onClick={viewHistory}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                <History className="w-4 h-4" />
                History
                </button>
                <button
                onClick={markAsVerified}
                disabled={currentData.verification_status === 'verified'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                <CheckCircle className="w-4 h-4" />
                Mark Verified
                </button>
                <button
                onClick={saveCurrentState}
                disabled={saving}
                className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors flex items-center gap-2"
                >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            </div>
            <div className='flex justify-end pb-3'>
                {/* Research Assistant - Now in the header */}
                <ResearchAssistant 
                    stateCode={selectedState}
                    onSourceUrlFound={(url, sourceName) => {
                        setCurrentData({
                        ...currentData,
                        source_url: url,
                        source_name: sourceName
                        })
                        alert(`Source added: ${sourceName}\nURL: ${url}\n\nReview and save to confirm.`)
                    }}
                />
            </div>

            {/* Status Banner */}
            {currentData.verification_status !== 'verified' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">This state requires review</p>
                    <p className="text-sm text-yellow-700">Verify all information against official sources before marking as verified.</p>
                  </div>
                </div>
                <button
                  onClick={markAsVerified}
                  className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                >
                  Review Now
                </button>
              </div>
            )}

            {/* Form Sections */}
            <div className="space-y-6">
              {/* Section 1: Basic Requirements */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-gold-600" />
                  Basic Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Required *</label>
                    <select
                      value={currentData.license_required || 'none'}
                      onChange={(e) => setCurrentData({ ...currentData, license_required: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    >
                      {LICENSE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Name</label>
                    <input
                      type="text"
                      value={currentData.license_name || ''}
                      onChange={(e) => setCurrentData({ ...currentData, license_name: e.target.value })}
                      placeholder="e.g., BitLicense, Money Transmitter License"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Description</label>
                    <textarea
                      value={currentData.license_description || ''}
                      onChange={(e) => setCurrentData({ ...currentData, license_description: e.target.value })}
                      rows={3}
                      placeholder="Detailed description of licensing requirements..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Climate *</label>
                    <select
                      value={currentData.regulatory_climate || 'moderate'}
                      onChange={(e) => setCurrentData({ ...currentData, regulatory_climate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    >
                      {CLIMATE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Priority</label>
                    <select
                      value={currentData.review_priority || 'medium'}
                      onChange={(e) => setCurrentData({ ...currentData, review_priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    >
                      {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Financial Requirements */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gold-600" />
                  Financial Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Fee</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={currentData.application_fee || ''}
                        onChange={(e) => setCurrentData({ ...currentData, application_fee: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                        placeholder="Amount"
                      />
                      <select
                        value={currentData.application_fee_unit || 'USD'}
                        onChange={(e) => setCurrentData({ ...currentData, application_fee_unit: e.target.value })}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Renewal Fee</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={currentData.annual_renewal_fee || ''}
                        onChange={(e) => setCurrentData({ ...currentData, annual_renewal_fee: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                        placeholder="Amount"
                      />
                      <select
                        value={currentData.annual_renewal_fee_unit || 'USD'}
                        onChange={(e) => setCurrentData({ ...currentData, annual_renewal_fee_unit: e.target.value })}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bond Requirement</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={currentData.bond_requirement_min || ''}
                        onChange={(e) => setCurrentData({ ...currentData, bond_requirement_min: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                        placeholder="Min"
                      />
                      <span className="self-center text-gray-500">-</span>
                      <input
                        type="number"
                        value={currentData.bond_requirement_max || ''}
                        onChange={(e) => setCurrentData({ ...currentData, bond_requirement_max: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                        placeholder="Max"
                      />
                      <select
                        value={currentData.bond_requirement_unit || 'USD'}
                        onChange={(e) => setCurrentData({ ...currentData, bond_requirement_unit: e.target.value })}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Net Worth Requirement</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={currentData.net_worth_requirement || ''}
                        onChange={(e) => setCurrentData({ ...currentData, net_worth_requirement: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                        placeholder="Amount"
                      />
                      <select
                        value={currentData.net_worth_requirement_unit || 'USD'}
                        onChange={(e) => setCurrentData({ ...currentData, net_worth_requirement_unit: e.target.value })}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time (months)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={currentData.processing_time_min_months || ''}
                        onChange={(e) => setCurrentData({ ...currentData, processing_time_min_months: parseInt(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                        placeholder="Min"
                      />
                      <span className="self-center text-gray-500">-</span>
                      <input
                        type="number"
                        value={currentData.processing_time_max_months || ''}
                        onChange={(e) => setCurrentData({ ...currentData, processing_time_max_months: parseInt(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time Description</label>
                    <input
                      type="text"
                      value={currentData.processing_time_description || ''}
                      onChange={(e) => setCurrentData({ ...currentData, processing_time_description: e.target.value })}
                      placeholder="e.g., 12-18 months from application submission"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Source Verification */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gold-600" />
                  Source Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source Name *</label>
                    <input
                      type="text"
                      value={currentData.source_name || ''}
                      onChange={(e) => setCurrentData({ ...currentData, source_name: e.target.value })}
                      placeholder="e.g., NYDFS Official Website"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source URL *</label>
                    <input
                      type="url"
                      value={currentData.source_url || ''}
                      onChange={(e) => setCurrentData({ ...currentData, source_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={currentData.effective_date?.split('T')[0] || ''}
                      onChange={(e) => setCurrentData({ ...currentData, effective_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Score</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${(currentData.confidence_score || 0) >= 0.9 ? 'bg-green-500' : (currentData.confidence_score || 0) >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${(currentData.confidence_score || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round((currentData.confidence_score || 0) * 100)}%</span>
                      <button
                        onClick={() => setShowConfidenceModal(true)}
                        className="text-xs text-gold-600 hover:text-gold-700"
                      >
                        Adjust
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Additional Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gold-600" />
                  Regulator & Additional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regulator Name</label>
                    <input
                      type="text"
                      value={currentData.regulator_name || ''}
                      onChange={(e) => setCurrentData({ ...currentData, regulator_name: e.target.value })}
                      placeholder="e.g., New York Department of Financial Services"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regulator Website</label>
                    <input
                      type="url"
                      value={currentData.regulator_website || ''}
                      onChange={(e) => setCurrentData({ ...currentData, regulator_website: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regulator Phone</label>
                    <input
                      type="tel"
                      value={currentData.regulator_phone || ''}
                      onChange={(e) => setCurrentData({ ...currentData, regulator_phone: e.target.value })}
                      placeholder="(212) 555-1234"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regulator Email</label>
                    <input
                      type="email"
                      value={currentData.regulator_email || ''}
                      onChange={(e) => setCurrentData({ ...currentData, regulator_email: e.target.value })}
                      placeholder="licensing@dfs.ny.gov"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Notes</label>
                    <textarea
                      value={currentData.notes || ''}
                      onChange={(e) => setCurrentData({ ...currentData, notes: e.target.value })}
                      rows={2}
                      placeholder="Notes visible to customers on the public dashboard..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                    <textarea
                      value={currentData.internal_notes || ''}
                      onChange={(e) => setCurrentData({ ...currentData, internal_notes: e.target.value })}
                      rows={2}
                      placeholder="Internal notes for attorney use only..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>

              {/* Last Updated Info */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Last updated: {currentData.updated_at ? new Date(currentData.updated_at).toLocaleString() : 'Never'}
                  </div>
                  {currentData.verified_by && (
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      Verified by: {currentData.verified_by}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Revert to last saved version? Unsaved changes will be lost.')) {
                      if (requirements[selectedState]) {
                        setCurrentData(requirements[selectedState])
                      }
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Revert
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5" />
                Change History: {selectedState}
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
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
                        entry.action === 'CREATE' ? 'bg-green-100 text-green-800' :
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confidence Score Modal */}
      {showConfidenceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Adjust Confidence Score</h3>
            <p className="text-sm text-gray-600 mb-4">
              How confident are you that this information is accurate?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setCurrentData({ ...currentData, confidence_score: 1.0 })
                  setShowConfidenceModal(false)
                }}
                className="w-full p-3 text-left border rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="font-medium">100% - Fully Verified</div>
                <p className="text-xs text-gray-500">Verified against official source with legal review</p>
              </button>
              <button
                onClick={() => {
                  setCurrentData({ ...currentData, confidence_score: 0.8 })
                  setShowConfidenceModal(false)
                }}
                className="w-full p-3 text-left border rounded-lg hover:bg-yellow-50 transition-colors"
              >
                <div className="font-medium">80% - High Confidence</div>
                <p className="text-xs text-gray-500">Verified against official source</p>
              </button>
              <button
                onClick={() => {
                  setCurrentData({ ...currentData, confidence_score: 0.6 })
                  setShowConfidenceModal(false)
                }}
                className="w-full p-3 text-left border rounded-lg hover:bg-orange-50 transition-colors"
              >
                <div className="font-medium">60% - Needs Review</div>
                <p className="text-xs text-gray-500">Partially verified, requires additional confirmation</p>
              </button>
              <button
                onClick={() => {
                  setCurrentData({ ...currentData, confidence_score: 0.3 })
                  setShowConfidenceModal(false)
                }}
                className="w-full p-3 text-left border rounded-lg hover:bg-red-50 transition-colors"
              >
                <div className="font-medium">30% - Low Confidence</div>
                <p className="text-xs text-gray-500">Preliminary data, needs attorney review</p>
              </button>
            </div>
            <button
              onClick={() => setShowConfidenceModal(false)}
              className="mt-4 w-full px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper component for XCircle icon
function XCircle(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
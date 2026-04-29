// src/app/admin/data/risk-factors/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import {
  Shield, Plus, Edit, Trash2, Save, X, RefreshCw, CheckCircle, AlertCircle,
  AlertTriangle, MapPin, ChevronDown, ChevronRight
} from 'lucide-react'

interface RiskFactor {
  id: string
  category: string
  description: string
  default_likelihood: string
  default_impact: string
  mitigation_strategy: string
  sort_order: number
  created_at: string
  updated_at: string
  state_overrides?: RiskStateOverride[]
}

interface RiskStateOverride {
  id: string
  risk_factor_id: string
  state_code: string
  override_likelihood: string | null
  override_impact: string | null
  notes: string | null
}

const likelihoods = ['Low', 'Medium', 'High']
const impacts = ['Low', 'Medium', 'High', 'Critical']
const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

export default function RiskFactorsPage() {
  const supabase = createClient()
  const [risks, setRisks] = useState<RiskFactor[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null)
  
  // Main Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<RiskFactor>>({})
  
  // Override Modal state
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  const [addingOverrideRiskId, setAddingOverrideRiskId] = useState<string | null>(null)
  const [overrideFormData, setOverrideFormData] = useState<Partial<RiskStateOverride>>({})
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchRisks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/risk-factors')
      const result = await response.json()
      if (result.data) setRisks(result.data)
    } catch (error) {
      console.error('Error fetching risks:', error)
      setNotification({ type: 'error', message: 'Failed to load risk factors' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRisks()
  }, [])

  // Helper function to update form fields
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateOverrideField = (field: string, value: any) => {
    setOverrideFormData(prev => ({ ...prev, [field]: value }))
  }

  // Main Modal open/close functions
  const openAddModal = () => {
    setFormData({
      category: '',
      description: '',
      default_likelihood: 'Medium',
      default_impact: 'High',
      mitigation_strategy: '',
      sort_order: 0,
      state_overrides: []
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item: RiskFactor) => {
    setFormData({
      category: item.category,
      description: item.description,
      default_likelihood: item.default_likelihood,
      default_impact: item.default_impact,
      mitigation_strategy: item.mitigation_strategy,
      sort_order: item.sort_order,
      state_overrides: item.state_overrides
    })
    setEditingId(item.id)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({})
  }

  // Override Modal functions
  const openOverrideModal = (riskId: string) => {
    setAddingOverrideRiskId(riskId)
    setOverrideFormData({
      state_code: '',
      override_likelihood: null,
      override_impact: null,
      notes: null
    })
    setIsOverrideModalOpen(true)
  }

  const closeOverrideModal = () => {
    setIsOverrideModalOpen(false)
    setAddingOverrideRiskId(null)
    setOverrideFormData({})
  }

  const handleSave = async () => {
    const isNew = !editingId
    try {
      const response = await fetch(`/api/admin/risk-factors${isNew ? '' : `?id=${editingId}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Risk factor added successfully' : 'Risk factor updated successfully' })
        fetchRisks()
        closeModal()
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save risk factor' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/risk-factors?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Risk factor deleted successfully' })
        fetchRisks()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete risk factor' })
    }
  }

  const handleAddOverride = async () => {
    if (!addingOverrideRiskId || !overrideFormData.state_code) return
    
    const risk = risks.find(r => r.id === addingOverrideRiskId)
    if (risk) {
      const newOverride: RiskStateOverride = {
        id: crypto.randomUUID(),
        risk_factor_id: addingOverrideRiskId,
        state_code: overrideFormData.state_code,
        override_likelihood: overrideFormData.override_likelihood || null,
        override_impact: overrideFormData.override_impact || null,
        notes: overrideFormData.notes || null
      }
      const updatedOverrides = [...(risk.state_overrides || []), newOverride]
      
      // Save the updated risk with the new override
      const response = await fetch(`/api/admin/risk-factors?id=${risk.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...risk, state_overrides: updatedOverrides })
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: `Override added for ${overrideFormData.state_code}` })
        fetchRisks()
        closeOverrideModal()
        setTimeout(() => setNotification(null), 3000)
      } else {
        setNotification({ type: 'error', message: 'Failed to add override' })
      }
    }
  }

  const handleRemoveOverride = async (riskId: string, overrideId: string) => {
    const risk = risks.find(r => r.id === riskId)
    if (risk) {
      const updatedOverrides = (risk.state_overrides || []).filter(o => o.id !== overrideId)
      const response = await fetch(`/api/admin/risk-factors?id=${risk.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...risk, state_overrides: updatedOverrides })
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Override removed' })
        fetchRisks()
        setTimeout(() => setNotification(null), 3000)
      } else {
        setNotification({ type: 'error', message: 'Failed to remove override' })
      }
    }
  }

  // Main Modal Render Function
  const renderModal = () => {
    if (!isModalOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Risk Factor' : 'Add New Risk Factor'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                placeholder="e.g., Regulatory Change, License Processing Delays"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                placeholder="Describe the risk..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Likelihood</label>
                <select
                  value={formData.default_likelihood || 'Medium'}
                  onChange={(e) => updateField('default_likelihood', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {likelihoods.map(likelihood => (
                    <option key={likelihood} value={likelihood}>{likelihood}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Impact</label>
                <select
                  value={formData.default_impact || 'High'}
                  onChange={(e) => updateField('default_impact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {impacts.map(impact => (
                    <option key={impact} value={impact}>{impact}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mitigation Strategy</label>
              <textarea
                value={formData.mitigation_strategy || ''}
                onChange={(e) => updateField('mitigation_strategy', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                placeholder="Describe how to mitigate this risk..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => updateField('sort_order', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t sticky bottom-0 bg-white">
            <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-500">
              <Save className="w-4 h-4 inline mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Override Modal Render Function
  const renderOverrideModal = () => {
    if (!isOverrideModalOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Add State Override</h3>
            <button onClick={closeOverrideModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={overrideFormData.state_code || ''}
                onChange={(e) => updateOverrideField('state_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select State</option>
                {usStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Override Likelihood (optional)</label>
              <select
                value={overrideFormData.override_likelihood || ''}
                onChange={(e) => updateOverrideField('override_likelihood', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Use Default</option>
                {likelihoods.map(likelihood => (
                  <option key={likelihood} value={likelihood}>{likelihood}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Override Impact (optional)</label>
              <select
                value={overrideFormData.override_impact || ''}
                onChange={(e) => updateOverrideField('override_impact', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Use Default</option>
                {impacts.map(impact => (
                  <option key={impact} value={impact}>{impact}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={overrideFormData.notes || ''}
                onChange={(e) => updateOverrideField('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Why does this state need an override?"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t">
            <button onClick={closeOverrideModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleAddOverride}
              disabled={!overrideFormData.state_code}
              className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-500 disabled:opacity-50"
            >
              Add Override
            </button>
          </div>
        </div>
      </div>
    )
  }

  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null
    
    const risk = risks.find(r => r.id === showDeleteConfirm)
    if (!risk) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Are you sure you want to delete the risk factor <span className="font-semibold">{risk.category}</span>?
              This will also remove all state overrides for this risk. This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 p-4 border-t">
            <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500">
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getLikelihoodBadge = (likelihood: string) => {
    const colors = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-red-100 text-red-800'
    }
    return <span className={`px-2 py-1 text-xs rounded-full ${colors[likelihood as keyof typeof colors] || 'bg-gray-100'}`}>{likelihood}</span>
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800'
    }
    return <span className={`px-2 py-1 text-xs rounded-full ${colors[impact as keyof typeof colors] || 'bg-gray-100'}`}>{impact}</span>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Risk Factors</h1>
            <p className="text-navy-600">Manage risk assessment factors and state-specific overrides</p>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
            <Plus className="w-4 h-4" />
            Add Risk Factor
          </button>
        </div>
      </div>
      
      {notification && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gold-600" />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {risks.map((risk) => (
              <div key={risk.id} className="hover:bg-gray-50">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedRisk === risk.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-gold-600" />
                        <span className="font-semibold text-gray-900">{risk.category}</span>
                        <div className="flex gap-2">
                          {getLikelihoodBadge(risk.default_likelihood)}
                          {getImpactBadge(risk.default_impact)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{risk.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(risk)} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setShowDeleteConfirm(risk.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {expandedRisk === risk.id && (
                  <div className="px-6 pb-4 pl-14">
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Mitigation Strategy</h4>
                      <p className="text-sm text-gray-600">{risk.mitigation_strategy}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">State Overrides</h4>
                      <button
                        onClick={() => openOverrideModal(risk.id)}
                        className="text-xs text-gold-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Override
                      </button>
                    </div>
                    
                    {(risk.state_overrides && risk.state_overrides.length > 0) ? (
                      <div className="space-y-2">
                        {risk.state_overrides.map((override) => (
                          <div key={override.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{override.state_code}</span>
                              <div className="flex gap-2">
                                {override.override_likelihood && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">Likelihood:</span>
                                    {getLikelihoodBadge(override.override_likelihood)}
                                  </div>
                                )}
                                {override.override_impact && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">Impact:</span>
                                    {getImpactBadge(override.override_impact)}
                                  </div>
                                )}
                              </div>
                              {override.notes && (
                                <p className="text-xs text-gray-500">{override.notes}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveOverride(risk.id, override.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No state overrides configured</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {risks.length === 0 && !loading && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No risk factors found</p>
            <button onClick={openAddModal} className="mt-3 text-gold-600 hover:underline">
              Add your first risk factor
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {renderModal()}
      {renderOverrideModal()}
      <DeleteConfirmModal />
    </div>
  )
}
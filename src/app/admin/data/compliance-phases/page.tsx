// src/app/admin/data/compliance-phases/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import {
  Clock, Plus, Edit, Trash2, Save, X, RefreshCw, CheckCircle, AlertCircle,
  ChevronDown, ChevronRight, GripVertical, Calendar, ListTodo
} from 'lucide-react'

interface CompliancePhase {
  id: string
  phase_name: string
  phase_key: string
  default_timeline_start_days: number
  default_timeline_end_days: number | null
  default_timeline_display: string
  color_class: string
  text_color_class: string
  sort_order: number
  created_at: string
  updated_at: string
  action_items?: ActionItem[]
}

interface ActionItem {
  id: string
  phase_id: string
  description: string
  is_conditional: boolean
  condition_field: string | null
  condition_value: string | null
  condition_operator: string
  sort_order: number
  created_at: string
  updated_at: string
}

const phaseKeys = ['foundation', 'licensing', 'implementation', 'optimization']
const colorClasses = [
  'bg-red-50 border-red-200',
  'bg-yellow-50 border-yellow-200',
  'bg-green-50 border-green-200',
  'bg-blue-50 border-blue-200',
  'bg-purple-50 border-purple-200',
  'bg-pink-50 border-pink-200',
  'bg-indigo-50 border-indigo-200'
]
const textColorClasses = [
  'text-red-800',
  'text-yellow-800',
  'text-green-800',
  'text-blue-800',
  'text-purple-800',
  'text-pink-800',
  'text-indigo-800'
]
const conditionFields = ['license_required', 'timeline']
const conditionValues = ['mtl', 'none', '3-months', '6-months', '12-months']

export default function CompliancePhasesPage() {
  const supabase = createClient()
  const [phases, setPhases] = useState<CompliancePhase[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  
  // Phase Modal state
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false)
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null)
  const [phaseFormData, setPhaseFormData] = useState<Partial<CompliancePhase>>({})
  
  // Action Item Modal state
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [editingActionId, setEditingActionId] = useState<string | null>(null)
  const [actionFormData, setActionFormData] = useState<Partial<ActionItem>>({})
  const [currentActionPhaseId, setCurrentActionPhaseId] = useState<string | null>(null)
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'phase' | 'action'; id: string; phaseId?: string } | null>(null)

  const fetchPhases = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/compliance-phases')
      const result = await response.json()
      if (result.data) setPhases(result.data)
    } catch (error) {
      console.error('Error fetching phases:', error)
      setNotification({ type: 'error', message: 'Failed to load compliance phases' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhases()
  }, [])

  // Helper functions for phase form
  const updatePhaseField = (field: string, value: any) => {
    const updated = { ...phaseFormData, [field]: value }
    
    // Auto-generate timeline display if start/end days change
    if (field === 'default_timeline_start_days' || field === 'default_timeline_end_days') {
      const start = field === 'default_timeline_start_days' ? value : phaseFormData.default_timeline_start_days
      const end = field === 'default_timeline_end_days' ? value : phaseFormData.default_timeline_end_days
      if (start && end) {
        updated.default_timeline_display = `Days ${start}-${end}`
      }
    }
    
    setPhaseFormData(updated)
  }

  // Phase Modal open/close functions
  const openAddPhaseModal = () => {
    setPhaseFormData({
      phase_name: '',
      phase_key: '',
      default_timeline_start_days: 1,
      default_timeline_end_days: 30,
      default_timeline_display: 'Days 1-30',
      color_class: 'bg-red-50 border-red-200',
      text_color_class: 'text-red-800',
      sort_order: phases.length,
      action_items: []
    })
    setEditingPhaseId(null)
    setIsPhaseModalOpen(true)
  }

  const openEditPhaseModal = (item: CompliancePhase) => {
    setPhaseFormData({
      phase_name: item.phase_name,
      phase_key: item.phase_key,
      default_timeline_start_days: item.default_timeline_start_days,
      default_timeline_end_days: item.default_timeline_end_days,
      default_timeline_display: item.default_timeline_display,
      color_class: item.color_class,
      text_color_class: item.text_color_class,
      sort_order: item.sort_order,
      action_items: item.action_items
    })
    setEditingPhaseId(item.id)
    setIsPhaseModalOpen(true)
  }

  const closePhaseModal = () => {
    setIsPhaseModalOpen(false)
    setEditingPhaseId(null)
    setPhaseFormData({})
  }

  // Helper functions for action item form
  const updateActionField = (field: string, value: any) => {
    setActionFormData(prev => ({ ...prev, [field]: value }))
  }

  // Action Item Modal open/close functions
  const openAddActionModal = (phaseId: string) => {
    setActionFormData({
      description: '',
      is_conditional: false,
      condition_field: null,
      condition_value: null,
      condition_operator: 'equals',
      sort_order: 0
    })
    setEditingActionId(null)
    setCurrentActionPhaseId(phaseId)
    setIsActionModalOpen(true)
  }

  const openEditActionModal = (actionItem: ActionItem, phaseId: string) => {
    setActionFormData({
      description: actionItem.description,
      is_conditional: actionItem.is_conditional,
      condition_field: actionItem.condition_field,
      condition_value: actionItem.condition_value,
      condition_operator: actionItem.condition_operator,
      sort_order: actionItem.sort_order
    })
    setEditingActionId(actionItem.id)
    setCurrentActionPhaseId(phaseId)
    setIsActionModalOpen(true)
  }

  const closeActionModal = () => {
    setIsActionModalOpen(false)
    setEditingActionId(null)
    setCurrentActionPhaseId(null)
    setActionFormData({})
  }

  const handleSavePhase = async () => {
    const isNew = !editingPhaseId
    try {
      const response = await fetch(`/api/admin/compliance-phases${isNew ? '' : `?id=${editingPhaseId}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phaseFormData)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Phase added successfully' : 'Phase updated successfully' })
        fetchPhases()
        closePhaseModal()
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save phase' })
    }
  }

  const handleSaveActionItem = async () => {
    if (!currentActionPhaseId) return
    
    const isNew = !editingActionId
    try {
      const response = await fetch(`/api/admin/compliance-phases/actions${isNew ? '' : `?id=${editingActionId}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...actionFormData, phase_id: currentActionPhaseId })
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Action item added successfully' : 'Action item updated successfully' })
        fetchPhases()
        closeActionModal()
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save action item' })
    }
  }

  const handleDeletePhase = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/compliance-phases?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Phase deleted successfully' })
        fetchPhases()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete phase' })
    }
  }

  const handleDeleteActionItem = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/compliance-phases/actions?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Action item deleted successfully' })
        fetchPhases()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete action item' })
    }
  }

  // Phase Modal Render Function
  const renderPhaseModal = () => {
    if (!isPhaseModalOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {editingPhaseId ? 'Edit Phase' : 'Add New Phase'}
            </h3>
            <button onClick={closePhaseModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase Name</label>
              <input
                type="text"
                value={phaseFormData.phase_name || ''}
                onChange={(e) => updatePhaseField('phase_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Foundation, Implementation"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase Key</label>
              <select
                value={phaseFormData.phase_key || ''}
                onChange={(e) => updatePhaseField('phase_key', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select</option>
                {phaseKeys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
                <input
                  type="number"
                  value={phaseFormData.default_timeline_start_days || ''}
                  onChange={(e) => updatePhaseField('default_timeline_start_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Day</label>
                <input
                  type="number"
                  value={phaseFormData.default_timeline_end_days || ''}
                  onChange={(e) => updatePhaseField('default_timeline_end_days', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeline Display</label>
              <input
                type="text"
                value={phaseFormData.default_timeline_display || ''}
                onChange={(e) => updatePhaseField('default_timeline_display', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Days 1-30"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Class</label>
                <select
                  value={phaseFormData.color_class || ''}
                  onChange={(e) => updatePhaseField('color_class', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {colorClasses.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                <div className={`mt-2 p-2 rounded ${phaseFormData.color_class || 'bg-gray-100'}`}>
                  Preview
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color Class</label>
                <select
                  value={phaseFormData.text_color_class || ''}
                  onChange={(e) => updatePhaseField('text_color_class', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {textColorClasses.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                <div className={`mt-2 p-2 font-semibold ${phaseFormData.text_color_class || 'text-gray-800'}`}>
                  Preview Text
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={phaseFormData.sort_order || 0}
                onChange={(e) => updatePhaseField('sort_order', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t">
            <button onClick={closePhaseModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSavePhase} className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-500">
              <Save className="w-4 h-4 inline mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Action Item Modal Render Function
  const renderActionModal = () => {
    if (!isActionModalOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {editingActionId ? 'Edit Action Item' : 'Add Action Item'}
            </h3>
            <button onClick={closeActionModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={actionFormData.description || ''}
                onChange={(e) => updateActionField('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Describe the action item..."
              />
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={actionFormData.is_conditional || false}
                  onChange={(e) => updateActionField('is_conditional', e.target.checked)}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Conditional (only shown for specific states/timelines)</span>
              </label>
            </div>
            
            {actionFormData.is_conditional && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition Field</label>
                  <select
                    value={actionFormData.condition_field || ''}
                    onChange={(e) => updateActionField('condition_field', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select</option>
                    {conditionFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition Value</label>
                  <select
                    value={actionFormData.condition_value || ''}
                    onChange={(e) => updateActionField('condition_value', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select</option>
                    {conditionValues.map(value => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={actionFormData.sort_order || 0}
                onChange={(e) => updateActionField('sort_order', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t">
            <button onClick={closeActionModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSaveActionItem}
              className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-500"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Are you sure you want to delete this {showDeleteConfirm.type}? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 p-4 border-t">
            <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => {
                if (showDeleteConfirm.type === 'phase') {
                  handleDeletePhase(showDeleteConfirm.id)
                } else {
                  handleDeleteActionItem(showDeleteConfirm.id)
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Compliance Phases</h1>
            <p className="text-navy-600">Manage compliance roadmap phases and action items</p>
          </div>
          <button onClick={openAddPhaseModal} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
            <Plus className="w-4 h-4" />
            Add Phase
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
            {phases.map((phase) => (
              <div key={phase.id} className="hover:bg-gray-50">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedPhase === phase.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className={`p-2 rounded ${phase.color_class}`}>
                      <Clock className={`w-5 h-5 ${phase.text_color_class}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{phase.phase_name}</span>
                        <span className="text-sm text-gray-500">{phase.default_timeline_display}</span>
                      </div>
                      <p className="text-xs text-gray-400">Key: {phase.phase_key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditPhaseModal(phase)} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setShowDeleteConfirm({ type: 'phase', id: phase.id })} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {expandedPhase === phase.id && (
                  <div className="px-6 pb-4 pl-14">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <ListTodo className="w-4 h-4" />
                        Action Items
                      </h4>
                      <button
                        onClick={() => openAddActionModal(phase.id)}
                        className="text-xs text-gold-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Action Item
                      </button>
                    </div>
                    
                    {(phase.action_items && phase.action_items.length > 0) ? (
                      <div className="space-y-2">
                        {phase.action_items.map((item) => (
                          <div key={item.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-700">{item.description}</span>
                              </div>
                              {item.is_conditional && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Condition: {item.condition_field} = {item.condition_value}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditActionModal(item, phase.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm({ type: 'action', id: item.id, phaseId: phase.id })}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No action items for this phase</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {phases.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No compliance phases found</p>
            <button onClick={openAddPhaseModal} className="mt-3 text-gold-600 hover:underline">
              Add your first phase
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {renderPhaseModal()}
      {renderActionModal()}
      <DeleteConfirmModal />
    </div>
  )
}
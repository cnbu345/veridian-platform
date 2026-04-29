// src/app/admin/data/metropolitan-areas/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, Plus, Edit, Trash2, Save, X, RefreshCw, 
  CheckCircle, AlertCircle, Search, MapPin, Users,
  Globe, ChevronUp, ChevronDown, PlusCircle, MinusCircle
} from 'lucide-react'

interface MetropolitanArea {
  id: string
  name: string
  states: string[]
  population: number | null
  primary_city: string | null
  primary_state: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function MetropolitanAreasPage() {
  const supabase = createClient()
  const [areas, setAreas] = useState<MetropolitanArea[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<MetropolitanArea>>({})
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchAreas = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/metropolitan-areas'
      const params = new URLSearchParams()
      if (stateFilter) params.append('state_code', stateFilter)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      const result = await response.json()
      if (result.data) setAreas(result.data)
    } catch (error) {
      console.error('Error fetching metropolitan areas:', error)
      setNotification({ type: 'error', message: 'Failed to load metropolitan areas' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAreas()
  }, [stateFilter])

  // Helper function to update form fields
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateStates = (state: string, add: boolean) => {
    setFormData(prev => {
      const currentStates = [...(prev.states || [])]
      if (add && !currentStates.includes(state)) {
        currentStates.push(state)
      } else if (!add) {
        const index = currentStates.indexOf(state)
        if (index !== -1) currentStates.splice(index, 1)
      }
      return { ...prev, states: currentStates }
    })
  }

  // Format population for display
  const formatPopulation = (pop: number | null | undefined) => {
    if (!pop) return ''
    return pop.toLocaleString()
  }

  // Parse population from input string
  const parsePopulation = (value: string) => {
    const parsed = parseInt(value.replace(/,/g, ''))
    return isNaN(parsed) ? null : parsed
  }

  // Modal open/close functions
  const openAddModal = () => {
    setFormData({
      name: '',
      states: [],
      population: null,
      primary_city: null,
      primary_state: null,
      sort_order: areas.length,
      is_active: true
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item: MetropolitanArea) => {
    setFormData({
      name: item.name,
      states: item.states,
      population: item.population,
      primary_city: item.primary_city,
      primary_state: item.primary_state,
      sort_order: item.sort_order,
      is_active: item.is_active
    })
    setEditingId(item.id)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({})
  }

  const handleSave = async () => {
    const isNew = !editingId
    try {
      const response = await fetch(`/api/admin/metropolitan-areas${isNew ? '' : `?id=${editingId}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Metropolitan area added successfully' : 'Metropolitan area updated successfully' })
        fetchAreas()
        closeModal()
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save metropolitan area' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/metropolitan-areas?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Metropolitan area deleted successfully' })
        fetchAreas()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete metropolitan area' })
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = areas.findIndex(a => a.id === id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= areas.length) return
    
    const newAreas = [...areas]
    const temp = newAreas[currentIndex]
    newAreas[currentIndex] = newAreas[newIndex]
    newAreas[newIndex] = temp
    
    for (let i = 0; i < newAreas.length; i++) {
      await fetch(`/api/admin/metropolitan-areas?id=${newAreas[i].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAreas[i], sort_order: i })
      })
    }
    
    setAreas(newAreas)
    setNotification({ type: 'success', message: 'Order updated' })
    setTimeout(() => setNotification(null), 2000)
  }

  const filteredAreas = areas.filter(area => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Modal Render Function
  const renderModal = () => {
    if (!isModalOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Metropolitan Area' : 'Add Metropolitan Area'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                placeholder="e.g., New York-Newark-Jersey City, NY-NJ-PA"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">States in this MSA</label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
                {usStates.map(state => (
                  <label key={state} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(formData.states || []).includes(state)}
                      onChange={(e) => updateStates(state, e.target.checked)}
                      className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{state}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Population</label>
              <input
                type="text"
                value={formatPopulation(formData.population)}
                onChange={(e) => updateField('population', parsePopulation(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 19,300,000"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary City</label>
                <input
                  type="text"
                  value={formData.primary_city || ''}
                  onChange={(e) => updateField('primary_city', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary State</label>
                <select
                  value={formData.primary_state || ''}
                  onChange={(e) => updateField('primary_state', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select State</option>
                  {usStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order || 0}
                  onChange={(e) => updateField('sort_order', parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active !== false}
                    onChange={(e) => updateField('is_active', e.target.checked)}
                    className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t">
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

  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null
    
    const area = areas.find(a => a.id === showDeleteConfirm)
    if (!area) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{area.name}</span>?
              This action cannot be undone.
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

  if (loading && areas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gold-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Metropolitan Statistical Areas</h1>
            <p className="text-navy-600">Manage MSAs for suburban market classification</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
          >
            <Plus className="w-4 h-4" />
            Add MSA
          </button>
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by area name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
          
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="">All States</option>
            {usStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          
          <button
            onClick={fetchAreas}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Areas Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">States</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Population</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAreas.map((area, index) => (
                <tr key={area.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReorder(area.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(area.id, 'down')}
                        disabled={index === filteredAreas.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 line-clamp-2 max-w-md">{area.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {area.states.map(state => (
                        <span key={state} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                          {state}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {area.population ? area.population.toLocaleString() : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {area.primary_city ? `${area.primary_city}, ${area.primary_state}` : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {area.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(area)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(area.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAreas.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No metropolitan areas found</p>
            <button onClick={openAddModal} className="mt-3 text-gold-600 hover:underline">
              Add your first MSA
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {renderModal()}
      <DeleteConfirmModal />
    </div>
  )
}
// src/app/admin/data/service-providers/page.tsx
// COMPLETE CLEAN VERSION - No parsing errors

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, Plus, Edit, Trash2, Save, X, RefreshCw, 
  CheckCircle, AlertCircle, Search, Briefcase, Users,
  Server, Globe, MapPin, ChevronUp, ChevronDown, ExternalLink, Shield
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface ServiceProvider {
  id: string
  name: string
  provider_type: 'lawFirm' | 'consultant' | 'techProvider' | 'association' | 'regulator'
  phone: string | null
  email: string | null
  website: string | null
  specialty: string | null
  is_national: boolean
  states: string[] | null
  cities: string[] | null
  sort_order: number
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================
// CONSTANTS
// ============================================

const providerTypes = [
  { value: 'lawFirm', label: 'Law Firm', icon: Briefcase, color: 'bg-purple-100 text-purple-800' },
  { value: 'consultant', label: 'Consultant', icon: Users, color: 'bg-blue-100 text-blue-800' },
  { value: 'techProvider', label: 'Tech Provider', icon: Server, color: 'bg-cyan-100 text-cyan-800' },
  { value: 'association', label: 'Association', icon: Building2, color: 'bg-green-100 text-green-800' },
  { value: 'regulator', label: 'Regulator', icon: Shield, color: 'bg-red-100 text-red-800' }
]

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

// ============================================
// MAIN COMPONENT
// ============================================

export default function ServiceProvidersPage() {
  const supabase = createClient()
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [nationalFilter, setNationalFilter] = useState('all')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null)
  const [formData, setFormData] = useState<Partial<ServiceProvider>>({
    name: '',
    provider_type: 'lawFirm',
    phone: null,
    email: null,
    website: null,
    specialty: null,
    is_national: false,
    states: [],
    cities: [],
    sort_order: 0,
    is_active: true,
    notes: null
  })
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/api/admin/service-providers'
      const params = new URLSearchParams()
      if (typeFilter) params.append('provider_type', typeFilter)
      if (nationalFilter !== 'all') params.append('is_national', nationalFilter === 'true')
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      const result = await response.json()
      if (result.data) setProviders(result.data)
    } catch (error) {
      console.error('Error fetching service providers:', error)
      setNotification({ type: 'error', message: 'Failed to load service providers' })
    } finally {
      setLoading(false)
    }
  }, [typeFilter, nationalFilter])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  // ============================================
  // MODAL HANDLERS
  // ============================================

  const openAddModal = () => {
    setFormData({
      name: '',
      provider_type: 'lawFirm',
      phone: null,
      email: null,
      website: null,
      specialty: null,
      is_national: false,
      states: [],
      cities: [],
      sort_order: providers.length,
      is_active: true,
      notes: null
    })
    setEditingProvider(null)
    setIsModalOpen(true)
  }

  const openEditModal = (provider: ServiceProvider) => {
    setFormData({
      name: provider.name,
      provider_type: provider.provider_type,
      phone: provider.phone,
      email: provider.email,
      website: provider.website,
      specialty: provider.specialty,
      is_national: provider.is_national,
      states: provider.states || [],
      cities: provider.cities || [],
      sort_order: provider.sort_order,
      is_active: provider.is_active,
      notes: provider.notes
    })
    setEditingProvider(provider)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProvider(null)
    setFormData({
      name: '',
      provider_type: 'lawFirm',
      phone: null,
      email: null,
      website: null,
      specialty: null,
      is_national: false,
      states: [],
      cities: [],
      sort_order: 0,
      is_active: true,
      notes: null
    })
  }

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateStates = (state: string, add: boolean) => {
    const currentStates = [...(formData.states || [])]
    if (add && !currentStates.includes(state)) {
      currentStates.push(state)
    } else if (!add) {
      const index = currentStates.indexOf(state)
      if (index !== -1) currentStates.splice(index, 1)
    }
    updateFormField('states', currentStates)
  }

  const updateCities = (citiesString: string) => {
    const cities = citiesString.split(',').map(c => c.trim()).filter(c => c)
    updateFormField('cities', cities)
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const handleSave = async () => {
    const isNew = !editingProvider
    try {
      const response = await fetch(`/api/admin/service-providers${isNew ? '' : `?id=${editingProvider!.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Service provider added successfully' : 'Service provider updated successfully' })
        fetchProviders()
        closeModal()
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save service provider' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/service-providers?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Service provider deleted successfully' })
        fetchProviders()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete service provider' })
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = providers.findIndex(p => p.id === id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= providers.length) return
    
    const newProviders = [...providers]
    const temp = newProviders[currentIndex]
    newProviders[currentIndex] = newProviders[newIndex]
    newProviders[newIndex] = temp
    
    for (let i = 0; i < newProviders.length; i++) {
      await fetch(`/api/admin/service-providers?id=${newProviders[i].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProviders[i], sort_order: i })
      })
    }
    
    setProviders(newProviders)
    setNotification({ type: 'success', message: 'Order updated' })
    setTimeout(() => setNotification(null), 2000)
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getTypeIcon = (type: string) => {
    const typeInfo = providerTypes.find(t => t.value === type)
    if (!typeInfo) return Briefcase
    return typeInfo.icon
  }

  const getTypeBadge = (type: string) => {
    const typeInfo = providerTypes.find(t => t.value === type)
    if (!typeInfo) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{type}</span>
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    )
  }

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (provider.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    return matchesSearch
  })

  // ============================================
  // MODAL RENDERERS
  // ============================================

  const renderModal = () => {
    if (!isModalOpen) return null
    
    const TypeIcon = getTypeIcon(formData.provider_type || 'lawFirm')
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">
              {editingProvider ? `Edit ${editingProvider.name}` : 'Add Service Provider'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => updateFormField('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type *</label>
              <select
                value={formData.provider_type || 'lawFirm'}
                onChange={(e) => updateFormField('provider_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {providerTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => updateFormField('phone', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="(212) 555-1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateFormField('email', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => updateFormField('website', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="www.example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <input
                type="text"
                value={formData.specialty || ''}
                onChange={(e) => updateFormField('specialty', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Blockchain & Digital Assets"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_national || false}
                  onChange={(e) => updateFormField('is_national', e.target.checked)}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">National Provider (serves all states)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => updateFormField('is_active', e.target.checked)}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            
            {!formData.is_national && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">States Served</label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
                    {usStates.map((state) => (
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cities Served (Optional)</label>
                  <input
                    type="text"
                    value={(formData.cities || []).join(', ')}
                    onChange={(e) => updateCities(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="New York, Los Angeles, Chicago"
                  />
                  <p className="text-xs text-gray-400 mt-1">Comma-separated list of cities (leave empty for all cities in selected states)</p>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Internal Use)</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateFormField('notes', e.target.value || null)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Internal notes about this provider..."
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

  const renderDeleteModal = () => {
    if (!showDeleteConfirm) return null
    
    const provider = providers.find((p) => p.id === showDeleteConfirm)
    if (!provider) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{provider.name}</span>?
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

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading && providers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gold-600" />
      </div>
    )
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Service Providers</h1>
            <p className="text-navy-600">Manage law firms, consultants, tech providers, and associations</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
          >
            <Plus className="w-4 h-4" />
            Add Provider
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Types</option>
            {providerTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <select
            value={nationalFilter}
            onChange={(e) => setNationalFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Providers</option>
            <option value="true">National Only</option>
            <option value="false">State-Specific Only</option>
          </select>
          
          <button
            onClick={fetchProviders}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Providers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProviders.map((provider, index) => {
                const TypeIcon = getTypeIcon(provider.provider_type)
                return (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorder(provider.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReorder(provider.id, 'down')}
                          disabled={index === filteredProviders.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{provider.name}</span>
                      </div>
                      {provider.website && (
                        <a 
                          href={`https://${provider.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gold-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          {provider.website} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(provider.provider_type)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{provider.specialty || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {provider.is_national ? (
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <Globe className="w-3 h-3" />
                          National
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(provider.states || []).slice(0, 3).map((state) => (
                            <span key={state} className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                              {state}
                            </span>
                          ))}
                          {(provider.states?.length || 0) > 3 && (
                            <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                              +{(provider.states?.length || 0) - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {provider.is_active ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditModal(provider)} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setShowDeleteConfirm(provider.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No service providers found</p>
            <button onClick={openAddModal} className="mt-3 text-gold-600 hover:underline">
              Add your first provider
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {renderModal()}
      {renderDeleteModal()}
    </div>
  )
}
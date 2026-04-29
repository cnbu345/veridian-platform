// src/app/admin/data/major-cities/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, Plus, Edit, Trash2, Save, X, RefreshCw, 
  CheckCircle, AlertCircle, Search, MapPin, Star,
  Users, Globe, ChevronUp, ChevronDown
} from 'lucide-react'

interface MajorCity {
  id: string
  city: string
  state_code: string
  population: number | null
  region: string | null
  tier: string
  is_regulatory_hub: boolean
  latitude: number | null
  longitude: number | null
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

const regions = ['Northeast', 'South', 'Midwest', 'West']

export default function MajorCitiesPage() {
  const supabase = createClient()
  const [cities, setCities] = useState<MajorCity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [hubFilter, setHubFilter] = useState('all')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<MajorCity>>({})
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchCities = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/major-cities'
      const params = new URLSearchParams()
      if (regionFilter) params.append('region', regionFilter)
      if (hubFilter !== 'all') params.append('is_regulatory_hub', hubFilter === 'true')
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      const result = await response.json()
      if (result.data) setCities(result.data)
    } catch (error) {
      console.error('Error fetching cities:', error)
      setNotification({ type: 'error', message: 'Failed to load major cities' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCities()
  }, [regionFilter, hubFilter])

  // Helper function to update form fields
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
      city: '',
      state_code: '',
      population: null,
      region: null,
      tier: 'major',
      is_regulatory_hub: false,
      latitude: null,
      longitude: null,
      sort_order: cities.length,
      is_active: true
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item: MajorCity) => {
    setFormData({
      city: item.city,
      state_code: item.state_code,
      population: item.population,
      region: item.region,
      tier: item.tier,
      is_regulatory_hub: item.is_regulatory_hub,
      latitude: item.latitude,
      longitude: item.longitude,
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
      const response = await fetch(`/api/admin/major-cities${isNew ? '' : `?id=${editingId}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'City added successfully' : 'City updated successfully' })
        fetchCities()
        closeModal()
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save city' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/major-cities?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'City deleted successfully' })
        fetchCities()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete city' })
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = cities.findIndex(c => c.id === id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= cities.length) return
    
    const newCities = [...cities]
    const temp = newCities[currentIndex]
    newCities[currentIndex] = newCities[newIndex]
    newCities[newIndex] = temp
    
    for (let i = 0; i < newCities.length; i++) {
      await fetch(`/api/admin/major-cities?id=${newCities[i].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCities[i], sort_order: i })
      })
    }
    
    setCities(newCities)
    setNotification({ type: 'success', message: 'Order updated' })
    setTimeout(() => setNotification(null), 2000)
  }

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         city.state_code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Modal Render Function
  const renderModal = () => {
    if (!isModalOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Major City' : 'Add Major City'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <select
                  value={formData.state_code || ''}
                  onChange={(e) => updateField('state_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Population</label>
                <input
                  type="text"
                  value={formatPopulation(formData.population)}
                  onChange={(e) => updateField('population', parsePopulation(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 8,419,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={formData.region || ''}
                  onChange={(e) => updateField('region', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude ?? ''}
                  onChange={(e) => updateField('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 40.7128"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude ?? ''}
                  onChange={(e) => updateField('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., -74.0060"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => updateField('sort_order', parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_regulatory_hub || false}
                    onChange={(e) => updateField('is_regulatory_hub', e.target.checked)}
                    className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Regulatory Hub</span>
                </label>
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
    
    const city = cities.find(c => c.id === showDeleteConfirm)
    if (!city) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{city.city}, {city.state_code}</span> from major cities?
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

  if (loading && cities.length === 0) {
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
            <h1 className="text-2xl font-bold text-navy-900">Major Cities</h1>
            <p className="text-navy-600">Manage major US cities for market classification</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
          >
            <Plus className="w-4 h-4" />
            Add City
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
              placeholder="Search by city or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
          
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          
          <select
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="all">All Cities</option>
            <option value="true">Regulatory Hubs Only</option>
            <option value="false">Non-Regulatory Hubs</option>
          </select>
          
          <button
            onClick={fetchCities}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Cities Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Population</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regulatory Hub</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCities.map((city, index) => (
                <tr key={city.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReorder(city.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(city.id, 'down')}
                        disabled={index === filteredCities.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{city.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{city.state_code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {city.population ? city.population.toLocaleString() : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{city.region || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {city.is_regulatory_hub ? (
                      <span className="flex items-center gap-1 text-xs text-purple-600">
                        <Star className="w-3 h-3" />
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {city.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(city)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(city.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCities.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No major cities found</p>
            <button onClick={openAddModal} className="mt-3 text-gold-600 hover:underline">
              Add your first city
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
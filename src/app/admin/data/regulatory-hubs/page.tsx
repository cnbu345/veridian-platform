// src/app/admin/data/regulatory-hubs/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, Plus, Edit, Trash2, Save, X, RefreshCw, 
  CheckCircle, AlertCircle, Search, MapPin, Star
} from 'lucide-react'

interface RegulatoryHub {
  id: string
  city: string
  state_code: string
  hub_type: 'primary' | 'secondary'
  score: number | null
  specialty: string | null
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

export default function RegulatoryHubsPage() {
  const supabase = createClient()
  const [hubs, setHubs] = useState<RegulatoryHub[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<RegulatoryHub>>({})
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchHubs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/regulatory-hubs')
      const result = await response.json()
      if (result.data) setHubs(result.data)
    } catch (error) {
      console.error('Error fetching hubs:', error)
      setNotification({ type: 'error', message: 'Failed to load regulatory hubs' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHubs()
  }, [])

  // Helper function to update form fields
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Modal open/close functions
  const openAddModal = () => {
    setFormData({
      city: '',
      state_code: '',
      hub_type: 'secondary',
      score: 75,
      specialty: '',
      sort_order: hubs.length,
      is_active: true
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item: RegulatoryHub) => {
    setFormData({
      city: item.city,
      state_code: item.state_code,
      hub_type: item.hub_type,
      score: item.score,
      specialty: item.specialty,
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
      const response = await fetch(`/api/admin/regulatory-hubs${isNew ? '' : `?id=${editingId}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Hub added successfully' : 'Hub updated successfully' })
        fetchHubs()
        closeModal()
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save hub' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/regulatory-hubs?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Hub deleted successfully' })
        fetchHubs()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete hub' })
    }
  }

  const filteredHubs = hubs.filter(hub => {
    const matchesSearch = hub.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hub.state_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || hub.hub_type === typeFilter
    return matchesSearch && matchesType
  })

  // Modal Render Function
  const renderModal = () => {
    if (!isModalOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Regulatory Hub' : 'Add Regulatory Hub'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Hub Type</label>
                <select
                  value={formData.hub_type || 'secondary'}
                  onChange={(e) => updateField('hub_type', e.target.value as 'primary' | 'secondary')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
                <input
                  type="number"
                  value={formData.score || ''}
                  onChange={(e) => updateField('score', e.target.value ? parseInt(e.target.value) : null)}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <input
                type="text"
                value={formData.specialty || ''}
                onChange={(e) => updateField('specialty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., BitLicense, Banking Law"
              />
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
    
    const hub = hubs.find(h => h.id === showDeleteConfirm)
    if (!hub) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{hub.city}, {hub.state_code}</span> from regulatory hubs?
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

  if (loading && hubs.length === 0) {
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
            <h1 className="text-2xl font-bold text-navy-900">Regulatory Hubs</h1>
            <p className="text-navy-600">Manage cities with strong compliance and legal infrastructure for digital assets</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
          >
            <Plus className="w-4 h-4" />
            Add Hub
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
              placeholder="Search by city or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="all">All Types</option>
            <option value="primary">Primary Hubs</option>
            <option value="secondary">Secondary Hubs</option>
          </select>
          
          <button
            onClick={fetchHubs}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Hubs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHubs.map((hub) => (
                <tr key={hub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{hub.city}</span>
                    </div>
                   </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{hub.state_code}</span>
                   </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      hub.hub_type === 'primary' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {hub.hub_type === 'primary' ? 'Primary' : 'Secondary'}
                    </span>
                   </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{hub.score || '—'}</span>
                    </div>
                   </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{hub.specialty || '—'}</span>
                   </td>
                  <td className="px-6 py-4">
                    {hub.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Inactive</span>
                    )}
                   </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(hub)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(hub.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
        
        {filteredHubs.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No regulatory hubs found</p>
            <button onClick={openAddModal} className="mt-3 text-gold-600 hover:underline">
              Add your first hub
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
// src/app/admin/data/technology-vendors/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import {
  Server, Plus, Edit, Trash2, Save, X, RefreshCw, CheckCircle, XCircle,
  ChevronUp, ChevronDown, Search, Filter, ExternalLink, AlertCircle
} from 'lucide-react'

interface TechnologyVendor {
  id: string
  category: string
  name: string
  description: string | null
  price_range_low: number | null
  price_range_high: number | null
  price_display: string | null
  implementation_time: string | null
  website_url: string | null
  is_recommended: boolean
  sort_order: number
  applicable_states: string[] | null
  created_at: string
  updated_at: string
}

const categories = [
  'AML/KYC',
  'Regulatory Change Management',
  'Compliance Management',
  'Reporting',
  'Transaction Monitoring',
  'Identity Verification',
  'Risk Assessment'
]

export default function TechnologyVendorsPage() {
  const supabase = createClient()
  const [vendors, setVendors] = useState<TechnologyVendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [recommendedOnly, setRecommendedOnly] = useState(false)
  const [editingVendor, setEditingVendor] = useState<TechnologyVendor | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newVendor, setNewVendor] = useState<Partial<TechnologyVendor>>({
    category: '',
    name: '',
    description: '',
    price_display: '',
    implementation_time: '',
    is_recommended: false,
    sort_order: 0,
    applicable_states: []
  })
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/technology-vendors')
      const result = await response.json()
      if (result.data) setVendors(result.data)
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setNotification({ type: 'error', message: 'Failed to load vendors' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  const handleSave = async (vendor: TechnologyVendor, isNew: boolean) => {
    try {
      const response = await fetch(`/api/admin/technology-vendors${isNew ? '' : `?id=${vendor.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Vendor added successfully' : 'Vendor updated successfully' })
        fetchVendors()
        setEditingVendor(null)
        setIsAdding(false)
        setNewVendor({
          category: '',
          name: '',
          description: '',
          price_display: '',
          implementation_time: '',
          is_recommended: false,
          sort_order: 0,
          applicable_states: []
        })
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save vendor' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/technology-vendors?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Vendor deleted successfully' })
        fetchVendors()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete vendor' })
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = vendors.findIndex(v => v.id === id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= vendors.length) return
    
    const newVendors = [...vendors]
    const temp = newVendors[currentIndex]
    newVendors[currentIndex] = newVendors[newIndex]
    newVendors[newIndex] = temp
    
    // Update sort_order for both vendors
    for (let i = 0; i < newVendors.length; i++) {
      await fetch(`/api/admin/technology-vendors?id=${newVendors[i].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newVendors[i], sort_order: i })
      })
    }
    
    setVendors(newVendors)
    setNotification({ type: 'success', message: 'Order updated' })
    setTimeout(() => setNotification(null), 2000)
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vendor.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || vendor.category === categoryFilter
    const matchesRecommended = !recommendedOnly || vendor.is_recommended
    return matchesSearch && matchesCategory && matchesRecommended
  })

  const EditModal = () => {
    const vendor = editingVendor
    if (!vendor && !isAdding) return null
    
    const currentVendor = editingVendor || newVendor
    
    const updateField = (field: string, value: any) => {
      if (isAdding) {
        setNewVendor({ ...newVendor, [field]: value })
      } else if (editingVendor) {
        setEditingVendor({ ...editingVendor, [field]: value })
      }
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">
              {isAdding ? 'Add New Technology Vendor' : `Edit ${editingVendor?.name}`}
            </h3>
            <button onClick={() => { setEditingVendor(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={currentVendor.category || ''}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={currentVendor.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={currentVendor.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                placeholder="Describe the vendor's product and key features..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Display</label>
                <input
                  type="text"
                  value={currentVendor.price_display || ''}
                  onChange={(e) => updateField('price_display', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  placeholder="e.g., $25,000 - $100,000/year"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Implementation Time</label>
                <input
                  type="text"
                  value={currentVendor.implementation_time || ''}
                  onChange={(e) => updateField('implementation_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  placeholder="e.g., 4-6 weeks"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range Low ($)</label>
                <input
                  type="number"
                  value={currentVendor.price_range_low || ''}
                  onChange={(e) => updateField('price_range_low', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range High ($)</label>
                <input
                  type="number"
                  value={currentVendor.price_range_high || ''}
                  onChange={(e) => updateField('price_range_high', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input
                type="url"
                value={currentVendor.website_url || ''}
                onChange={(e) => updateField('website_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                placeholder="https://..."
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentVendor.is_recommended || false}
                  onChange={(e) => updateField('is_recommended', e.target.checked)}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Recommended Vendor</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={currentVendor.sort_order || 0}
                  onChange={(e) => updateField('sort_order', parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t sticky bottom-0 bg-white">
            <button
              onClick={() => { setEditingVendor(null); setIsAdding(false); }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(currentVendor as TechnologyVendor, isAdding)}
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
    
    const vendor = vendors.find(v => v.id === showDeleteConfirm)
    if (!vendor) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{vendor.name}</span>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 p-4 border-t">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(showDeleteConfirm)}
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Technology Vendors</h1>
            <p className="text-navy-600">Manage compliance technology vendor recommendations for reports</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
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
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md">
            <input
              type="checkbox"
              checked={recommendedOnly}
              onChange={(e) => setRecommendedOnly(e.target.checked)}
              className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Recommended Only</span>
          </label>
          
          <button
            onClick={fetchVendors}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gold-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Implementation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map((vendor, index) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorder(vendor.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReorder(vendor.id, 'down')}
                          disabled={index === filteredVendors.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {vendor.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                      {vendor.description && (
                        <div className="text-xs text-gray-500 max-w-md truncate">{vendor.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.price_display || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.implementation_time || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vendor.is_recommended ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {vendor.website_url && (
                          <a
                            href={vendor.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setEditingVendor(vendor)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(vendor.id)}
                          className="text-red-600 hover:text-red-800"
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
        
        {filteredVendors.length === 0 && !loading && (
          <div className="text-center py-12">
            <Server className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No vendors found</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-3 text-gold-600 hover:underline"
            >
              Add your first vendor
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <EditModal />
      <DeleteConfirmModal />
    </div>
  )
}
// src/app/admin/data/talent-metrics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users, Plus, Edit, Trash2, Save, X, RefreshCw, CheckCircle, AlertCircle,
  MapPin, TrendingUp, DollarSign, Clock, Award
} from 'lucide-react'

interface TalentMetric {
  id: string
  state_code: string
  city_name: string | null
  talent_score: number | null
  talent_rank: string | null
  total_professionals: number | null
  growth_rate: number | null
  avg_salary_min: number | null
  avg_salary_max: number | null
  time_to_hire_weeks: string | null
  top_channels: string[] | null
  created_at: string
  updated_at: string
}

const talentRanks = [
  { value: 'high', label: 'High', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', color: 'bg-red-100 text-red-800' }
]

const recruitmentChannels = [
  'LinkedIn Recruiter',
  'Remote job boards',
  'Specialized search firms',
  'Local compliance associations',
  'University programs',
  'Industry conferences',
  'Indeed',
  'Glassdoor',
  'ZipRecruiter',
  'Monster',
  'CareerBuilder',
  'Stack Overflow'
]

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

export default function TalentMetricsPage() {
  const supabase = createClient()
  const [metrics, setMetrics] = useState<TalentMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [stateFilter, setStateFilter] = useState('')
  const [rankFilter, setRankFilter] = useState('')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<TalentMetric>>({})
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/talent-metrics'
      const params = new URLSearchParams()
      if (stateFilter) params.append('state_code', stateFilter)
      if (rankFilter) params.append('talent_rank', rankFilter)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      const result = await response.json()
      if (result.data) setMetrics(result.data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      setNotification({ type: 'error', message: 'Failed to load talent metrics' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [stateFilter, rankFilter])

  // Helper function to update form fields
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateChannels = (channel: string, add: boolean) => {
    const currentChannels = formData.top_channels || []
    let newChannels: string[]
    if (add) {
      newChannels = [...currentChannels, channel]
    } else {
      newChannels = currentChannels.filter(c => c !== channel)
    }
    updateField('top_channels', newChannels)
  }

  // Modal open/close functions
  const openAddModal = () => {
    setFormData({
      state_code: '',
      city_name: null,
      talent_score: 65,
      talent_rank: 'medium',
      total_professionals: 5000,
      growth_rate: 8,
      avg_salary_min: 110000,
      avg_salary_max: 150000,
      time_to_hire_weeks: '6-8 weeks',
      top_channels: ['LinkedIn Recruiter', 'Remote job boards']
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item: TalentMetric) => {
    setFormData({
      state_code: item.state_code,
      city_name: item.city_name,
      talent_score: item.talent_score,
      talent_rank: item.talent_rank,
      total_professionals: item.total_professionals,
      growth_rate: item.growth_rate,
      avg_salary_min: item.avg_salary_min,
      avg_salary_max: item.avg_salary_max,
      time_to_hire_weeks: item.time_to_hire_weeks,
      top_channels: item.top_channels
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
      const response = await fetch(`/api/admin/talent-metrics${isNew ? '' : `?id=${editingId}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Talent metric added successfully' : 'Talent metric updated successfully' })
        fetchMetrics()
        closeModal()
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save talent metric' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/talent-metrics?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Talent metric deleted successfully' })
        fetchMetrics()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete talent metric' })
    }
  }

  // Modal Render Function
  const renderModal = () => {
    if (!isModalOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Talent Metric' : 'Add New Talent Metric'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State Code *</label>
                <select
                  value={formData.state_code || ''}
                  onChange={(e) => updateField('state_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  required
                >
                  <option value="">Select State</option>
                  {usStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City (optional)</label>
                <input
                  type="text"
                  value={formData.city_name || ''}
                  onChange={(e) => updateField('city_name', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Leave blank for state-level data"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Talent Score (0-100)</label>
                <input
                  type="number"
                  value={formData.talent_score || ''}
                  onChange={(e) => updateField('talent_score', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Talent Rank</label>
                <select
                  value={formData.talent_rank || ''}
                  onChange={(e) => updateField('talent_rank', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select</option>
                  {talentRanks.map(rank => (
                    <option key={rank.value} value={rank.value}>{rank.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Professionals</label>
                <input
                  type="number"
                  value={formData.total_professionals || ''}
                  onChange={(e) => updateField('total_professionals', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growth Rate (%)</label>
                <input
                  type="number"
                  value={formData.growth_rate || ''}
                  onChange={(e) => updateField('growth_rate', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time to Hire</label>
                <input
                  type="text"
                  value={formData.time_to_hire_weeks || ''}
                  onChange={(e) => updateField('time_to_hire_weeks', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 4-6 weeks"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg Salary Min ($)</label>
                  <input
                    type="number"
                    value={formData.avg_salary_min || ''}
                    onChange={(e) => updateField('avg_salary_min', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg Salary Max ($)</label>
                  <input
                    type="number"
                    value={formData.avg_salary_max || ''}
                    onChange={(e) => updateField('avg_salary_max', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Top Recruitment Channels</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                {recruitmentChannels.map(channel => (
                  <label key={channel} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(formData.top_channels || []).includes(channel)}
                      onChange={(e) => updateChannels(channel, e.target.checked)}
                      className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{channel}</span>
                  </label>
                ))}
              </div>
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

  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null
    
    const metric = metrics.find(m => m.id === showDeleteConfirm)
    if (!metric) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Are you sure you want to delete talent data for <span className="font-semibold">{metric.state_code}</span>
              {metric.city_name && ` (${metric.city_name})`}? This action cannot be undone.
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

  const getRankBadge = (rank: string) => {
    const rankInfo = talentRanks.find(r => r.value === rank)
    return rankInfo ? (
      <span className={`px-2 py-1 text-xs rounded-full ${rankInfo.color}`}>
        {rankInfo.label}
      </span>
    ) : rank
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Talent Metrics</h1>
            <p className="text-navy-600">Manage compliance talent availability data by state</p>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
            <Plus className="w-4 h-4" />
            Add Metric
          </button>
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="">All Ranks</option>
            {talentRanks.map(rank => (
              <option key={rank.value} value={rank.value}>{rank.label}</option>
            ))}
          </select>
          
          <button onClick={fetchMetrics} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Professionals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time to Hire</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gold-500" />
                        <span className="text-sm font-medium text-gray-900">{metric.state_code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.city_name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">{metric.talent_score || '—'}/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRankBadge(metric.talent_rank || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.total_professionals?.toLocaleString() || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-green-600">
                        {metric.growth_rate ? `+${metric.growth_rate}%` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-900">
                          {metric.avg_salary_min && metric.avg_salary_max 
                            ? `$${(metric.avg_salary_min / 1000).toFixed(0)}k - $${(metric.avg_salary_max / 1000).toFixed(0)}k`
                            : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-500">{metric.time_to_hire_weeks || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(metric)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(metric.id)} className="text-red-600 hover:text-red-800">
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
        
        {metrics.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No talent metrics found</p>
            <button onClick={openAddModal} className="mt-3 text-gold-600 hover:underline">
              Add your first talent metric
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
// src/app/admin/data/market-metrics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import {
  TrendingUp, Plus, Edit, Trash2, Save, X, RefreshCw, CheckCircle, AlertCircle,
  MapPin, Globe, Building2, Star
} from 'lucide-react'

interface MarketMetric {
  id: string
  state_code: string
  city_name: string | null
  tier: string
  growth_rate: number | null
  competitor_density: string | null
  opportunity_score: number | null
  key_industries: string[] | null
  nearest_regulatory_hub: string | null
  distance_to_hub_miles: number | null
  created_at: string
  updated_at: string
}

const tiers = [
  { value: 'major', label: 'Major Market', color: 'bg-purple-100 text-purple-800' },
  { value: 'suburban', label: 'Suburban Market', color: 'bg-blue-100 text-blue-800' },
  { value: 'rural', label: 'Rural Market', color: 'bg-green-100 text-green-800' }
]

const competitorDensities = ['Low', 'Medium', 'High']
const industryOptions = [
  'Financial Services', 'Technology', 'Banking', 'Healthcare', 'Retail',
  'Manufacturing', 'Real Estate', 'Energy', 'Education', 'Aerospace',
  'Biotech', 'Insurance', 'Logistics', 'Entertainment', 'Agriculture'
]

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

export default function MarketMetricsPage() {
  const supabase = createClient()
  const [metrics, setMetrics] = useState<MarketMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [stateFilter, setStateFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [editingMetric, setEditingMetric] = useState<MarketMetric | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newMetric, setNewMetric] = useState<Partial<MarketMetric>>({
    state_code: '',
    city_name: null,
    tier: 'major',
    growth_rate: 12,
    competitor_density: 'Medium',
    opportunity_score: 75,
    key_industries: ['Financial Services', 'Technology'],
    nearest_regulatory_hub: '',
    distance_to_hub_miles: null
  })
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/market-metrics'
      const params = new URLSearchParams()
      if (stateFilter) params.append('state_code', stateFilter)
      if (tierFilter) params.append('tier', tierFilter)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      const result = await response.json()
      if (result.data) setMetrics(result.data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      setNotification({ type: 'error', message: 'Failed to load market metrics' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [stateFilter, tierFilter])

  const handleSave = async (metric: MarketMetric, isNew: boolean) => {
    try {
      const response = await fetch(`/api/admin/market-metrics${isNew ? '' : `?id=${metric.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Market metric added successfully' : 'Market metric updated successfully' })
        fetchMetrics()
        setEditingMetric(null)
        setIsAdding(false)
        setNewMetric({
          state_code: '',
          city_name: null,
          tier: 'major',
          growth_rate: 12,
          competitor_density: 'Medium',
          opportunity_score: 75,
          key_industries: ['Financial Services', 'Technology'],
          nearest_regulatory_hub: '',
          distance_to_hub_miles: null
        })
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save market metric' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/market-metrics?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Market metric deleted successfully' })
        fetchMetrics()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete market metric' })
    }
  }

  const EditModal = () => {
    const metric = editingMetric
    if (!metric && !isAdding) return null
    
    const currentMetric = editingMetric || newMetric
    
    const updateField = (field: string, value: any) => {
      const updated = { ...currentMetric, [field]: value }
      if (isAdding) {
        setNewMetric(updated)
      } else if (editingMetric) {
        setEditingMetric(updated as MarketMetric)
      }
    }
    
    const updateIndustries = (industry: string, add: boolean) => {
      const currentIndustries = currentMetric.key_industries || []
      let newIndustries: string[]
      if (add) {
        newIndustries = [...currentIndustries, industry]
      } else {
        newIndustries = currentIndustries.filter(i => i !== industry)
      }
      updateField('key_industries', newIndustries)
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">
              {isAdding ? 'Add New Market Metric' : `Edit ${editingMetric?.state_code} Market Data`}
            </h3>
            <button onClick={() => { setEditingMetric(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State Code *</label>
                <select
                  value={currentMetric.state_code || ''}
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
                  value={currentMetric.city_name || ''}
                  onChange={(e) => updateField('city_name', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Leave blank for state-level data"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Tier *</label>
                <select
                  value={currentMetric.tier || ''}
                  onChange={(e) => updateField('tier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                >
                  {tiers.map(tier => (
                    <option key={tier.value} value={tier.value}>{tier.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growth Rate (%)</label>
                <input
                  type="number"
                  value={currentMetric.growth_rate || ''}
                  onChange={(e) => updateField('growth_rate', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competitor Density</label>
                <select
                  value={currentMetric.competitor_density || ''}
                  onChange={(e) => updateField('competitor_density', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select</option>
                  {competitorDensities.map(density => (
                    <option key={density} value={density}>{density}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Score (0-100)</label>
                <input
                  type="number"
                  value={currentMetric.opportunity_score || ''}
                  onChange={(e) => updateField('opportunity_score', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Industries</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                {industryOptions.map(industry => (
                  <label key={industry} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(currentMetric.key_industries || []).includes(industry)}
                      onChange={(e) => updateIndustries(industry, e.target.checked)}
                      className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{industry}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Regulatory Hub</label>
                <input
                  type="text"
                  value={currentMetric.nearest_regulatory_hub || ''}
                  onChange={(e) => updateField('nearest_regulatory_hub', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., New York City, San Francisco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance to Hub (miles)</label>
                <input
                  type="number"
                  value={currentMetric.distance_to_hub_miles || ''}
                  onChange={(e) => updateField('distance_to_hub_miles', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t sticky bottom-0 bg-white">
            <button onClick={() => { setEditingMetric(null); setIsAdding(false); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => handleSave(currentMetric as MarketMetric, isAdding)} className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-500">
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
              Are you sure you want to delete market data for <span className="font-semibold">{metric.state_code}</span>
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

  const getTierBadge = (tier: string) => {
    const tierInfo = tiers.find(t => t.value === tier)
    return tierInfo ? (
      <span className={`px-2 py-1 text-xs rounded-full ${tierInfo.color}`}>
        {tierInfo.label}
      </span>
    ) : tier
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Market Metrics</h1>
            <p className="text-navy-600">Manage market data by state and tier for report generation</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
            <Plus className="w-4 h-4" />
            Add Metric
          </button>
        </div>
      </div>
      
      {notification && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}
      
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
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="">All Tiers</option>
            {tiers.map(tier => (
              <option key={tier.value} value={tier.value}>{tier.label}</option>
            ))}
          </select>
          
          <button onClick={fetchMetrics} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Competitors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opportunity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Industries</th>
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
                      {getTierBadge(metric.tier)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-green-600 font-medium">
                        {metric.growth_rate ? `+${metric.growth_rate}%` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.competitor_density || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-900">{metric.opportunity_score || '—'}/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(metric.key_industries || []).slice(0, 2).map(ind => (
                          <span key={ind} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            {ind}
                          </span>
                        ))}
                        {(metric.key_industries?.length || 0) > 2 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            +{(metric.key_industries?.length || 0) - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingMetric(metric)} className="text-blue-600 hover:text-blue-800">
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
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No market metrics found</p>
            <button onClick={() => setIsAdding(true)} className="mt-3 text-gold-600 hover:underline">
              Add your first market metric
            </button>
          </div>
        )}
      </div>
      
      <EditModal />
      <DeleteConfirmModal />
    </div>
  )
}
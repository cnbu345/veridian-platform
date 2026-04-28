// src/app/admin/data/budget-templates/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import {
  DollarSign, Plus, Edit, Trash2, Save, X, RefreshCw, CheckCircle, AlertCircle,
  Building2, Briefcase, Users, Cpu, Scale, FileText
} from 'lucide-react'

interface BudgetTemplate {
  id: string
  company_size: string
  industry: string | null
  state_code: string | null
  legal_fees_min: number
  legal_fees_max: number
  legal_fees_description: string
  licensing_fees_min: number
  licensing_fees_max: number
  licensing_fees_description: string
  technology_min: number
  technology_max: number
  technology_description: string
  staffing_min: number
  staffing_max: number
  staffing_description: string
  total_min: number
  total_max: number
  created_at: string
  updated_at: string
}

const companySizes = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'enterprise', label: 'Enterprise (201+ employees)' }
]

const industries = [
  'FinTech', 'Banking', 'Nonprofit', 'Cryptocurrency', 'Payment Processing',
  'Investment', 'Insurance', 'Real Estate', 'Healthcare', 'Retail', 'Technology'
]

export default function BudgetTemplatesPage() {
  const supabase = createClient()
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [companySizeFilter, setCompanySizeFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [editingTemplate, setEditingTemplate] = useState<BudgetTemplate | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Partial<BudgetTemplate>>({
    company_size: 'small',
    industry: null,
    state_code: null,
    legal_fees_min: 25000,
    legal_fees_max: 100000,
    legal_fees_description: 'Legal counsel retainer, license application support, ongoing advice',
    licensing_fees_min: 5000,
    licensing_fees_max: 30000,
    licensing_fees_description: 'Application fees, surety bonds, state filing costs',
    technology_min: 30000,
    technology_max: 150000,
    technology_description: 'AML/KYC platforms, monitoring tools, compliance software',
    staffing_min: 80000,
    staffing_max: 250000,
    staffing_description: 'Compliance officer salary, training, ongoing resources',
    total_min: 140000,
    total_max: 550000
  })
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/budget-templates'
      const params = new URLSearchParams()
      if (companySizeFilter) params.append('company_size', companySizeFilter)
      if (stateFilter) params.append('state_code', stateFilter)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      const result = await response.json()
      if (result.data) setTemplates(result.data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      setNotification({ type: 'error', message: 'Failed to load templates' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [companySizeFilter, stateFilter])

  const calculateTotals = (template: Partial<BudgetTemplate>) => {
    const legalMin = template.legal_fees_min || 0
    const legalMax = template.legal_fees_max || 0
    const licensingMin = template.licensing_fees_min || 0
    const licensingMax = template.licensing_fees_max || 0
    const techMin = template.technology_min || 0
    const techMax = template.technology_max || 0
    const staffingMin = template.staffing_min || 0
    const staffingMax = template.staffing_max || 0
    
    return {
      total_min: legalMin + licensingMin + techMin + staffingMin,
      total_max: legalMax + licensingMax + techMax + staffingMax
    }
  }

  const handleSave = async (template: BudgetTemplate, isNew: boolean) => {
    const totals = calculateTotals(template)
    const templateToSave = { ...template, ...totals }
    
    try {
      const response = await fetch(`/api/admin/budget-templates${isNew ? '' : `?id=${template.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateToSave)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Template added successfully' : 'Template updated successfully' })
        fetchTemplates()
        setEditingTemplate(null)
        setIsAdding(false)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save template' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/budget-templates?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Template deleted successfully' })
        fetchTemplates()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete template' })
    }
  }

  const EditModal = () => {
    const template = editingTemplate
    if (!template && !isAdding) return null
    
    const currentTemplate = editingTemplate || newTemplate
    
    const updateField = (field: string, value: any) => {
      const updated = { ...currentTemplate, [field]: value }
      if (isAdding) {
        setNewTemplate(updated)
      } else if (editingTemplate) {
        setEditingTemplate(updated as BudgetTemplate)
      }
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold">
              {isAdding ? 'Add New Budget Template' : `Edit ${editingTemplate?.company_size} Template`}
            </h3>
            <button onClick={() => { setEditingTemplate(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size *</label>
                <select
                  value={currentTemplate.company_size || ''}
                  onChange={(e) => updateField('company_size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  required
                >
                  {companySizes.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry (optional)</label>
                <select
                  value={currentTemplate.industry || ''}
                  onChange={(e) => updateField('industry', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="">All Industries</option>
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Legal Fees */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-gold-600" />
                Legal & Compliance Counsel
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min ($)</label>
                  <input
                    type="number"
                    value={currentTemplate.legal_fees_min || ''}
                    onChange={(e) => updateField('legal_fees_min', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max ($)</label>
                  <input
                    type="number"
                    value={currentTemplate.legal_fees_max || ''}
                    onChange={(e) => updateField('legal_fees_max', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={currentTemplate.legal_fees_description || ''}
                  onChange={(e) => updateField('legal_fees_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Licensing Fees */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gold-600" />
                Licensing & Filing Fees
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min ($)</label>
                  <input
                    type="number"
                    value={currentTemplate.licensing_fees_min || ''}
                    onChange={(e) => updateField('licensing_fees_min', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max ($)</label>
                  <input
                    type="number"
                    value={currentTemplate.licensing_fees_max || ''}
                    onChange={(e) => updateField('licensing_fees_max', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={currentTemplate.licensing_fees_description || ''}
                  onChange={(e) => updateField('licensing_fees_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Technology */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gold-600" />
                Technology & Software
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min ($)</label>
                  <input
                    type="number"
                    value={currentTemplate.technology_min || ''}
                    onChange={(e) => updateField('technology_min', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max ($)</label>
                  <input
                    type="number"
                    value={currentTemplate.technology_max || ''}
                    onChange={(e) => updateField('technology_max', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={currentTemplate.technology_description || ''}
                  onChange={(e) => updateField('technology_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Staffing */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-600" />
                Compliance Staff
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min ($)</label>
                  <input
                    type="number"
                    value={currentTemplate.staffing_min || ''}
                    onChange={(e) => updateField('staffing_min', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max ($)</label>
                  <input
                    type="number"
                    value={currentTemplate.staffing_max || ''}
                    onChange={(e) => updateField('staffing_max', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={currentTemplate.staffing_description || ''}
                  onChange={(e) => updateField('staffing_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Total Preview */}
            <div className="bg-navy-50 rounded-lg p-4">
              <h4 className="font-semibold text-navy-900 mb-2">Total Estimated Investment</h4>
              <p className="text-2xl font-bold text-gold-600">
                ${(calculateTotals(currentTemplate).total_min || 0).toLocaleString()} - ${(calculateTotals(currentTemplate).total_max || 0).toLocaleString()}
              </p>
              <p className="text-xs text-navy-500 mt-1">Auto-calculated from above categories</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t sticky bottom-0 bg-white">
            <button
              onClick={() => { setEditingTemplate(null); setIsAdding(false); }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(currentTemplate as BudgetTemplate, isAdding)}
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
    
    const template = templates.find(t => t.id === showDeleteConfirm)
    if (!template) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">Confirm Delete</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Are you sure you want to delete the budget template for <span className="font-semibold">{template.company_size}</span>?
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

  const getCompanySizeLabel = (size: string) => {
    return companySizes.find(s => s.value === size)?.label || size
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Budget Templates</h1>
            <p className="text-navy-600">Manage budget ranges by company size, industry, and state</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
            <Plus className="w-4 h-4" />
            Add Template
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={companySizeFilter}
            onChange={(e) => setCompanySizeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          >
            <option value="">All Company Sizes</option>
            {companySizes.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Filter by state code (e.g., CA, TX)"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value.toUpperCase())}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          />
          
          <button onClick={fetchTemplates} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Legal Fees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licensing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technology</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staffing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getCompanySizeLabel(template.company_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {template.industry || 'All'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {template.state_code || 'All'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${template.legal_fees_min.toLocaleString()} - ${template.legal_fees_max.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${template.licensing_fees_min.toLocaleString()} - ${template.licensing_fees_max.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${template.technology_min.toLocaleString()} - ${template.technology_max.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${template.staffing_min.toLocaleString()} - ${template.staffing_max.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gold-600">
                        ${template.total_min.toLocaleString()} - ${template.total_max.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingTemplate(template)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(template.id)} className="text-red-600 hover:text-red-800">
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
        
        {templates.length === 0 && !loading && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No budget templates found</p>
            <button onClick={() => setIsAdding(true)} className="mt-3 text-gold-600 hover:underline">
              Add your first template
            </button>
          </div>
        )}
      </div>
      
      <EditModal />
      <DeleteConfirmModal />
    </div>
  )
}
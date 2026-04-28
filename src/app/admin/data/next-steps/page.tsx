// src/app/admin/data/next-steps/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import {
  CalendarCheck, Plus, Edit, Trash2, Save, X, RefreshCw, CheckCircle, AlertCircle,
  ChevronDown, ChevronRight, Clock, ListTodo, Calendar
} from 'lucide-react'

interface NextStepTemplate {
  id: string
  template_type: string
  description: string
  is_conditional: boolean
  condition_field: string | null
  condition_value: string | null
  sort_order: number
  created_at: string
}

interface CalendarTemplate {
  id: string
  timeframe: string
  default_days_offset: number | null
  sort_order: number
  created_at: string
  tasks?: CalendarTask[]
}

interface CalendarTask {
  id: string
  calendar_template_id: string
  description: string
  is_conditional: boolean
  condition_field: string | null
  condition_value: string | null
  sort_order: number
  created_at: string
}

const templateTypes = ['immediate', 'short_term', 'ongoing']
const conditionFields = ['license_required']
const conditionValues = ['mtl', 'none']
const timeframes = ['Week 1', 'Month 1', 'Month 2-3', 'Quarterly', 'Annually']

export default function NextStepsPage() {
  const supabase = createClient()
  const [nextSteps, setNextSteps] = useState<NextStepTemplate[]>([])
  const [calendarTemplates, setCalendarTemplates] = useState<CalendarTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'steps' | 'calendar'>('steps')
  const [expandedCalendar, setExpandedCalendar] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<NextStepTemplate | null>(null)
  const [editingCalendar, setEditingCalendar] = useState<CalendarTemplate | null>(null)
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null)
  const [isAddingStep, setIsAddingStep] = useState(false)
  const [isAddingCalendar, setIsAddingCalendar] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newStep, setNewStep] = useState<Partial<NextStepTemplate>>({
    template_type: 'immediate',
    description: '',
    is_conditional: false,
    condition_field: null,
    condition_value: null,
    sort_order: 0
  })
  const [newCalendar, setNewCalendar] = useState<Partial<CalendarTemplate>>({
    timeframe: '',
    default_days_offset: null,
    sort_order: 0,
    tasks: []
  })
  const [newTask, setNewTask] = useState<Partial<CalendarTask>>({
    description: '',
    is_conditional: false,
    condition_field: null,
    condition_value: null,
    sort_order: 0
  })
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'step' | 'calendar' | 'task'; id: string; calendarId?: string } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/next-steps')
      const result = await response.json()
      if (result.data) {
        setNextSteps(result.data.next_steps || [])
        setCalendarTemplates(result.data.compliance_calendar || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setNotification({ type: 'error', message: 'Failed to load data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSaveStep = async (step: NextStepTemplate, isNew: boolean) => {
    try {
      const response = await fetch(`/api/admin/next-steps?type=next_step${isNew ? '' : `&id=${step.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Step added successfully' : 'Step updated successfully' })
        fetchData()
        setEditingStep(null)
        setIsAddingStep(false)
        setNewStep({
          template_type: 'immediate',
          description: '',
          is_conditional: false,
          condition_field: null,
          condition_value: null,
          sort_order: 0
        })
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save step' })
    }
  }

  const handleSaveCalendar = async (calendar: CalendarTemplate, isNew: boolean) => {
    try {
      const response = await fetch(`/api/admin/next-steps?type=calendar_template${isNew ? '' : `&id=${calendar.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calendar)
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Calendar template added successfully' : 'Calendar template updated successfully' })
        fetchData()
        setEditingCalendar(null)
        setIsAddingCalendar(false)
        setNewCalendar({
          timeframe: '',
          default_days_offset: null,
          sort_order: 0,
          tasks: []
        })
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save calendar template' })
    }
  }

  const handleSaveTask = async (task: CalendarTask, calendarId: string, isNew: boolean) => {
    try {
      const response = await fetch(`/api/admin/next-steps?type=calendar_task${isNew ? '' : `&id=${task.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, calendar_template_id: calendarId })
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: isNew ? 'Task added successfully' : 'Task updated successfully' })
        fetchData()
        setEditingTask(null)
        setIsAddingTask(false)
        setNewTask({
          description: '',
          is_conditional: false,
          condition_field: null,
          condition_value: null,
          sort_order: 0
        })
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save task' })
    }
  }

  const handleDeleteStep = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/next-steps?type=next_step&id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Step deleted successfully' })
        fetchData()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete step' })
    }
  }

  const handleDeleteCalendar = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/next-steps?type=calendar_template&id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Calendar template deleted successfully' })
        fetchData()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete calendar template' })
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/next-steps?type=calendar_task&id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Task deleted successfully' })
        fetchData()
        setShowDeleteConfirm(null)
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete task' })
    }
  }

  const StepModal = () => {
    const step = editingStep
    if (!step && !isAddingStep) return null
    
    const currentStep = editingStep || newStep
    
    const updateField = (field: string, value: any) => {
      const updated = { ...currentStep, [field]: value }
      if (isAddingStep) {
        setNewStep(updated)
      } else if (editingStep) {
        setEditingStep(updated as NextStepTemplate)
      }
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {isAddingStep ? 'Add Next Step' : 'Edit Next Step'}
            </h3>
            <button onClick={() => { setEditingStep(null); setIsAddingStep(false); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={currentStep.template_type || ''}
                onChange={(e) => updateField('template_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {templateTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={currentStep.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Describe the action item..."
              />
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentStep.is_conditional || false}
                  onChange={(e) => updateField('is_conditional', e.target.checked)}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Conditional (only shown for MTL states)</span>
              </label>
            </div>
            
            {currentStep.is_conditional && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition Field</label>
                  <select
                    value={currentStep.condition_field || ''}
                    onChange={(e) => updateField('condition_field', e.target.value || null)}
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
                    value={currentStep.condition_value || ''}
                    onChange={(e) => updateField('condition_value', e.target.value || null)}
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
                value={currentStep.sort_order || 0}
                onChange={(e) => updateField('sort_order', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t">
            <button onClick={() => { setEditingStep(null); setIsAddingStep(false); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => handleSaveStep(currentStep as NextStepTemplate, isAddingStep)} className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-500">
              <Save className="w-4 h-4 inline mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  const CalendarModal = () => {
    const calendar = editingCalendar
    if (!calendar && !isAddingCalendar) return null
    
    const currentCalendar = editingCalendar || newCalendar
    
    const updateField = (field: string, value: any) => {
      const updated = { ...currentCalendar, [field]: value }
      if (isAddingCalendar) {
        setNewCalendar(updated)
      } else if (editingCalendar) {
        setEditingCalendar(updated as CalendarTemplate)
      }
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {isAddingCalendar ? 'Add Calendar Template' : 'Edit Calendar Template'}
            </h3>
            <button onClick={() => { setEditingCalendar(null); setIsAddingCalendar(false); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
              <select
                value={currentCalendar.timeframe || ''}
                onChange={(e) => updateField('timeframe', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select</option>
                {timeframes.map(tf => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Days Offset (optional)</label>
              <input
                type="number"
                value={currentCalendar.default_days_offset || ''}
                onChange={(e) => updateField('default_days_offset', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 7, 30, 90"
              />
              <p className="text-xs text-gray-400 mt-1">Number of days from report generation</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={currentCalendar.sort_order || 0}
                onChange={(e) => updateField('sort_order', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t">
            <button onClick={() => { setEditingCalendar(null); setIsAddingCalendar(false); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => handleSaveCalendar(currentCalendar as CalendarTemplate, isAddingCalendar)} className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-500">
              <Save className="w-4 h-4 inline mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  const TaskModal = () => {
    const task = editingTask
    const calendarId = expandedCalendar
    if ((!task && !isAddingTask) || !calendarId) return null
    
    const currentTask = editingTask || newTask
    
    const updateField = (field: string, value: any) => {
      const updated = { ...currentTask, [field]: value }
      if (isAddingTask) {
        setNewTask(updated)
      } else if (editingTask) {
        setEditingTask(updated as CalendarTask)
      }
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {isAddingTask ? 'Add Calendar Task' : 'Edit Calendar Task'}
            </h3>
            <button onClick={() => { setEditingTask(null); setIsAddingTask(false); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={currentTask.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Describe the task..."
              />
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentTask.is_conditional || false}
                  onChange={(e) => updateField('is_conditional', e.target.checked)}
                  className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Conditional (only shown for MTL states)</span>
              </label>
            </div>
            
            {currentTask.is_conditional && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition Field</label>
                  <select
                    value={currentTask.condition_field || ''}
                    onChange={(e) => updateField('condition_field', e.target.value || null)}
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
                    value={currentTask.condition_value || ''}
                    onChange={(e) => updateField('condition_value', e.target.value || null)}
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
                value={currentTask.sort_order || 0}
                onChange={(e) => updateField('sort_order', parseInt(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 border-t">
            <button onClick={() => { setEditingTask(null); setIsAddingTask(false); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => handleSaveTask(currentTask as CalendarTask, calendarId, isAddingTask)}
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
                if (showDeleteConfirm.type === 'step') {
                  handleDeleteStep(showDeleteConfirm.id)
                } else if (showDeleteConfirm.type === 'calendar') {
                  handleDeleteCalendar(showDeleteConfirm.id)
                } else {
                  handleDeleteTask(showDeleteConfirm.id)
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

  const getTypeLabel = (type: string) => {
    const labels = {
      immediate: 'Immediate (Next 7 Days)',
      short_term: 'Short-Term (30-90 Days)',
      ongoing: 'Ongoing Obligations'
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Next Steps & Compliance Calendar</h1>
            <p className="text-navy-600">Manage action items and compliance calendar templates</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('steps')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'steps'
                  ? 'bg-gold-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next Steps
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-gold-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Compliance Calendar
            </button>
          </div>
        </div>
      </div>
      
      {notification && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}
      
      {activeTab === 'steps' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-navy-900">Next Steps Templates</h3>
            <button onClick={() => setIsAddingStep(true)} className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-500">
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gold-600" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {templateTypes.map(type => {
                const stepsOfType = nextSteps.filter(s => s.template_type === type)
                if (stepsOfType.length === 0) return null
                
                return (
                  <div key={type} className="p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">{getTypeLabel(type)}</h4>
                    <div className="space-y-2">
                      {stepsOfType.map((step) => (
                        <div key={step.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-700">{step.description}</span>
                            </div>
                            {step.is_conditional && (
                              <p className="text-xs text-gray-400 mt-1">
                                Condition: {step.condition_field} = {step.condition_value}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditingStep(step)} className="text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setShowDeleteConfirm({ type: 'step', id: step.id })} className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {nextSteps.length === 0 && !loading && (
            <div className="text-center py-12">
              <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No next steps templates found</p>
              <button onClick={() => setIsAddingStep(true)} className="mt-3 text-gold-600 hover:underline">
                Add your first step
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-navy-900">Compliance Calendar Templates</h3>
            <button onClick={() => setIsAddingCalendar(true)} className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-500">
              <Plus className="w-4 h-4" />
              Add Calendar Template
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gold-600" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {calendarTemplates.map((calendar) => (
                <div key={calendar.id} className="hover:bg-gray-50">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => setExpandedCalendar(expandedCalendar === calendar.id ? null : calendar.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedCalendar === calendar.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                      <div className="p-2 rounded bg-blue-100">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">{calendar.timeframe}</span>
                          {calendar.default_days_offset && (
                            <span className="text-sm text-gray-500">({calendar.default_days_offset} days offset)</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingCalendar(calendar)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowDeleteConfirm({ type: 'calendar', id: calendar.id })} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedCalendar === calendar.id && (
                    <div className="px-6 pb-4 pl-14">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <ListTodo className="w-4 h-4" />
                          Tasks
                        </h4>
                        <button
                          onClick={() => {
                            setExpandedCalendar(calendar.id)
                            setIsAddingTask(true)
                            setNewTask({
                              description: '',
                              is_conditional: false,
                              condition_field: null,
                              condition_value: null,
                              sort_order: (calendar.tasks?.length || 0)
                            })
                          }}
                          className="text-xs text-gold-600 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Task
                        </button>
                      </div>
                      
                      {(calendar.tasks && calendar.tasks.length > 0) ? (
                        <div className="space-y-2">
                          {calendar.tasks.map((task) => (
                            <div key={task.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-gray-700">{task.description}</span>
                                </div>
                                {task.is_conditional && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Condition: {task.condition_field} = {task.condition_value}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingTask(task)
                                    setExpandedCalendar(calendar.id)
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm({ type: 'task', id: task.id, calendarId: calendar.id })}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No tasks for this calendar template</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {calendarTemplates.length === 0 && !loading && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No calendar templates found</p>
              <button onClick={() => setIsAddingCalendar(true)} className="mt-3 text-gold-600 hover:underline">
                Add your first calendar template
              </button>
            </div>
          )}
        </div>
      )}
      
      <StepModal />
      <CalendarModal />
      <TaskModal />
      <DeleteConfirmModal />
    </div>
  )
}
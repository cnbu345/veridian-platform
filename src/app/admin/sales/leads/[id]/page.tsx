// src/app/admin/sales/leads/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Tag,
  Calendar,
  Clock,
  MessageSquare,
  Phone as PhoneIcon,
  Video,
  FileText,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Flame,
  Snowflake,
  Plus,
  Send,
  Save,
  X,
  TrendingUp,
} from 'lucide-react'

// Interface definitions
interface LeadDetail {
  id: string
  company_name: string
  company_website?: string
  industry?: string
  state?: string
  city?: string
  contact_name?: string
  contact_title?: string
  contact_email?: string
  contact_phone?: string
  source: string
  score: number
  stage: string
  value?: number
  probability?: number
  notes?: string
  tags: string[]
  assigned_to?: string
  last_contact?: string
  next_action?: string
  next_action_date?: string
  created_at: string
  updated_at: string
  deal_health_score?: number
  deal_health_status?: string
  days_in_stage?: number
  stage_entered_at?: string
  expected_close_date?: string
}

interface Activity {
  id: string
  type: string
  description: string
  metadata?: any
  created_at: string
}

interface DealTask {
  id: string
  title: string
  task_type: string
  description?: string
  due_date: string
  completed: boolean
  completed_at?: string
}

interface StageHistory {
  id: string
  previous_stage: string
  new_stage: string
  days_in_stage: number
  reason?: string
  created_at: string
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  
  // State declarations
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<DealTask[]>([])
  const [stageHistory, setStageHistory] = useState<StageHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [newNote, setNewNote] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    task_type: 'follow_up',
    due_date: '',
    description: ''
  })
  
  // Fetch lead details on component mount or ID change
  useEffect(() => {
    fetchLeadDetails()
  }, [params.id])
  
  // Main data fetching function
  const fetchLeadDetails = async () => {
    try {
      const res = await fetch(`/api/admin/sales/leads/${params.id}`)
      const data = await res.json()
      setLead(data.lead)
      setActivities(data.activities || [])
      setEditForm(data.lead)
      
      // Fetch tasks for this lead
      const tasksRes = await fetch(`/api/admin/sales/leads/${params.id}/tasks`)
      const tasksData = await tasksRes.json()
      setTasks(tasksData.tasks || [])
      
      // Fetch stage history
      const historyRes = await fetch(`/api/admin/sales/leads/${params.id}/stage-history`)
      const historyData = await historyRes.json()
      setStageHistory(historyData.history || [])
    } catch (error) {
      console.error('Failed to fetch lead details:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Helper functions
  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Flame className="w-5 h-5 text-green-600" />
    if (score >= 50) return <Star className="w-5 h-5 text-amber-600" />
    return <Snowflake className="w-5 h-5 text-slate-600" />
  }
  
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-purple-100 text-purple-800',
      'consultation_scheduled': 'bg-amber-100 text-amber-800',
      'consultation_completed': 'bg-indigo-100 text-indigo-800',
      'proposal': 'bg-gold-100 text-gold-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed_won': 'bg-green-100 text-green-800',
      'closed_lost': 'bg-red-100 text-red-800'
    }
    return colors[stage] || 'bg-slate-100 text-slate-800'
  }
  
  const getHealthColor = (status: string) => {
    const colors: Record<string, string> = {
      'on_track': 'bg-green-100 text-green-800',
      'at_risk': 'bg-yellow-100 text-yellow-800',
      'stalled': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }
  
  // Action handlers
  const handleUpdateLead = async () => {
    try {
      const res = await fetch(`/api/admin/sales/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      
      if (res.ok) {
        setIsEditing(false)
        fetchLeadDetails()
      }
    } catch (error) {
      console.error('Failed to update lead:', error)
    }
  }
  
  const handleAddActivity = async (type: string) => {
    if (!newNote.trim()) return
    
    try {
      const res = await fetch(`/api/admin/sales/leads/${params.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          description: newNote,
          metadata: {}
        })
      })
      
      if (res.ok) {
        setNewNote('')
        fetchLeadDetails()
      }
    } catch (error) {
      console.error('Failed to add activity:', error)
    }
  }
  
  const handleAddTask = async () => {
    if (!newTask.title) return
    
    try {
      const res = await fetch(`/api/admin/sales/leads/${params.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })
      
      if (res.ok) {
        setShowAddTask(false)
        setNewTask({ title: '', task_type: 'follow_up', due_date: '', description: '' })
        
        // Refresh tasks
        const tasksRes = await fetch(`/api/admin/sales/leads/${params.id}/tasks`)
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      }
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }
  
  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/admin/sales/leads/${params.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true })
      })
      
      if (res.ok) {
        // Refresh tasks
        const tasksRes = await fetch(`/api/admin/sales/leads/${params.id}/tasks`)
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900"></div>
      </div>
    )
  }
  
  // Lead not found state
  if (!lead) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-navy-900 mb-2">Lead Not Found</h2>
        <button
          onClick={() => router.back()}
          className="text-gold-600 hover:text-gold-700"
        >
          Go Back
        </button>
      </div>
    )
  }
  
  // Edit mode UI
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-navy-900">Edit Lead</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleUpdateLead}
              className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Company Information */}
            <div>
              <h3 className="font-medium text-navy-900 mb-4">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={editForm?.company_name || ''}
                    onChange={(e) => setEditForm({...editForm, company_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editForm?.company_website || ''}
                    onChange={(e) => setEditForm({...editForm, company_website: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={editForm?.industry || ''}
                    onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm?.city || ''}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={editForm?.state || ''}
                      onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-medium text-navy-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={editForm?.contact_name || ''}
                    onChange={(e) => setEditForm({...editForm, contact_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Contact Title
                  </label>
                  <input
                    type="text"
                    value={editForm?.contact_title || ''}
                    onChange={(e) => setEditForm({...editForm, contact_title: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm?.contact_email || ''}
                    onChange={(e) => setEditForm({...editForm, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm?.contact_phone || ''}
                    onChange={(e) => setEditForm({...editForm, contact_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Deal Information */}
            <div className="col-span-2">
              <h3 className="font-medium text-navy-900 mb-4">Deal Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Deal Value ($)
                  </label>
                  <input
                    type="number"
                    value={editForm?.value || ''}
                    onChange={(e) => setEditForm({...editForm, value: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm?.probability || ''}
                    onChange={(e) => setEditForm({...editForm, probability: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={editForm?.expected_close_date?.slice(0, 10) || ''}
                    onChange={(e) => setEditForm({...editForm, expected_close_date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Stage
                  </label>
                  <select
                    value={editForm?.stage || 'new'}
                    onChange={(e) => setEditForm({...editForm, stage: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="consultation_scheduled">Consultation Scheduled</option>
                    <option value="consultation_completed">Consultation Completed</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Source
                  </label>
                  <select
                    value={editForm?.source || 'manual'}
                    onChange={(e) => setEditForm({...editForm, source: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="manual">Manual</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="direct">Direct</option>
                    <option value="conference">Conference</option>
                    <option value="outbound">Outbound</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Next Action
                  </label>
                  <input
                    type="text"
                    value={editForm?.next_action || ''}
                    onChange={(e) => setEditForm({...editForm, next_action: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Send proposal, Schedule call..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Next Action Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm?.next_action_date?.slice(0, 16) || ''}
                    onChange={(e) => setEditForm({...editForm, next_action_date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={editForm?.tags?.join(', ') || ''}
                onChange={(e) => setEditForm({
                  ...editForm, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="enterprise, follow-up, hot"
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Notes
              </label>
              <textarea
                value={editForm?.notes || ''}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Additional notes about this lead..."
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Regular view mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">{lead.company_name}</h1>
            <p className="text-navy-600">{lead.contact_name} • {lead.contact_title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Lead Score Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900">Lead Intelligence</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStageColor(lead.stage)}`}>
            <span className="text-sm font-medium">{lead.stage.replace('_', ' ')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-navy-600 mb-1">Lead Score</div>
            <div className="flex items-center gap-2">
              {getScoreIcon(lead.score)}
              <span className="text-2xl font-bold text-navy-900">{lead.score}</span>
              <span className="text-sm text-navy-500">/100</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-navy-600 mb-1">Deal Value</div>
            <div className="text-2xl font-bold text-navy-900">
              ${lead.value?.toLocaleString() || 0}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-navy-600 mb-1">Probability</div>
            <div className="text-2xl font-bold text-navy-900">{lead.probability || 0}%</div>
          </div>
          
          <div>
            <div className="text-sm text-navy-600 mb-1">Source</div>
            <div className="text-lg font-medium text-navy-900 capitalize">{lead.source}</div>
          </div>
        </div>
      </div>
      
      {/* Progress Tracking Cards - NEW SECTION */}
      <div className="grid grid-cols-3 gap-6">
        {/* Deal Health Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Deal Health</h3>
          
          {/* Health Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-navy-600">Health Score</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                getHealthColor(lead.deal_health_status || 'unknown')
              }`}>
                {lead.deal_health_status?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  (lead.deal_health_score || 50) >= 80 ? 'bg-green-600' :
                  (lead.deal_health_score || 50) >= 60 ? 'bg-yellow-500' :
                  (lead.deal_health_score || 50) >= 40 ? 'bg-orange-500' :
                  'bg-red-600'
                }`}
                style={{ width: `${lead.deal_health_score || 50}%` }}
              ></div>
            </div>
          </div>
          
          {/* Days in Pipeline */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-sm text-navy-600 mb-1">Days in Pipeline</div>
            <div className="text-2xl font-bold text-navy-900">
              {Math.ceil((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 3600 * 24))}
            </div>
            <div className="text-xs text-navy-400 mt-1">
              {lead.days_in_stage || 0} days in current stage
            </div>
          </div>
        </div>

        {/* Stage Timeline Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Stage Timeline</h3>
          <div className="space-y-3">
            {['new', 'contacted', 'consultation_scheduled', 'consultation_completed', 'proposal', 'negotiation'].map((stage, index) => {
              const stageIndex = ['new', 'contacted', 'consultation_scheduled', 'consultation_completed', 'proposal', 'negotiation'].indexOf(lead.stage);
              const isActive = lead.stage === stage;
              const isPast = stageIndex >= index;
              
              return (
                <div key={stage} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isActive ? 'bg-gold-600 text-white' :
                    isPast ? 'bg-green-100 text-green-600' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isPast ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`text-sm ${isActive ? 'font-medium text-navy-900' : 'text-navy-500'}`}>
                    {stage.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Stage History Dropdown */}
          {stageHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <details className="text-sm">
                <summary className="cursor-pointer text-navy-600 hover:text-navy-900">
                  View Stage History ({stageHistory.length})
                </summary>
                <div className="mt-3 space-y-2">
                  {stageHistory.map((history) => (
                    <div key={history.id} className="text-xs bg-slate-50 p-2 rounded">
                      <span className="font-medium">{history.previous_stage}</span> → <span className="font-medium">{history.new_stage}</span>
                      <br />
                      <span className="text-navy-400">{history.days_in_stage} days in stage</span>
                      <br />
                      <span className="text-navy-400">{new Date(history.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Tasks Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900">Follow-ups</h3>
            <button
              onClick={() => setShowAddTask(true)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tasks.filter(t => !t.completed).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleCompleteTask(task.id)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">{task.title}</p>
                  <p className="text-xs text-navy-400">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.task_type === 'call' ? 'bg-green-100 text-green-800' :
                  task.task_type === 'email' ? 'bg-purple-100 text-purple-800' :
                  task.task_type === 'meeting' ? 'bg-amber-100 text-amber-800' :
                  task.task_type === 'proposal' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {task.task_type}
                </span>
              </div>
            ))}
            
            {tasks.filter(t => !t.completed).length === 0 && (
              <p className="text-center text-navy-400 py-4">No pending tasks</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {['overview', 'activity', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-navy-500 hover:text-navy-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {lead.contact_email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-navy-400" />
                  <a href={`mailto:${lead.contact_email}`} className="text-gold-600 hover:underline">
                    {lead.contact_email}
                  </a>
                </div>
              )}
              {lead.contact_phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-navy-400" />
                  <a href={`tel:${lead.contact_phone}`} className="text-navy-900">
                    {lead.contact_phone}
                  </a>
                </div>
              )}
              {lead.company_website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-navy-400" />
                  <a href={lead.company_website} target="_blank" rel="noopener" className="text-gold-600 hover:underline">
                    {lead.company_website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {(lead.city || lead.state) && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-navy-400" />
                  <span className="text-navy-900">
                    {[lead.city, lead.state].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Company Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Company Details</h3>
            <div className="space-y-3">
              {lead.industry && (
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-navy-400" />
                  <span className="text-navy-900">{lead.industry}</span>
                </div>
              )}
              {lead.tags && lead.tags.length > 0 && (
                <div className="flex items-start gap-3 text-sm">
                  <Tag className="w-4 h-4 text-navy-400 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 text-navy-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Next Steps</h3>
            <div className="space-y-3">
              {lead.next_action && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-navy-400" />
                  <span className="text-navy-900">{lead.next_action}</span>
                </div>
              )}
              {lead.next_action_date && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-navy-400" />
                  <span className="text-navy-900">
                    {new Date(lead.next_action_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {lead.expected_close_date && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-navy-400" />
                  <span className="text-navy-900">
                    Expected Close: {new Date(lead.expected_close_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-sm text-navy-600 mb-2">Notes</div>
                <p className="text-sm text-navy-900">{lead.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'activity' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Activity Timeline</h3>
            
            {/* Add Activity */}
            <div className="mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note or activity..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                rows={3}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleAddActivity('note')}
                  className="px-3 py-1.5 bg-navy-900 text-white text-sm rounded-lg hover:bg-navy-800"
                >
                  Add Note
                </button>
                <button
                  onClick={() => handleAddActivity('email')}
                  className="px-3 py-1.5 border border-slate-300 text-sm rounded-lg hover:bg-slate-50"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAddActivity('call')}
                  className="px-3 py-1.5 border border-slate-300 text-sm rounded-lg hover:bg-slate-50"
                >
                  <PhoneIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAddActivity('meeting')}
                  className="px-3 py-1.5 border border-slate-300 text-sm rounded-lg hover:bg-slate-50"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Activity List */}
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'note' && <FileText className="w-5 h-5 text-navy-400" />}
                    {activity.type === 'email' && <Mail className="w-5 h-5 text-purple-400" />}
                    {activity.type === 'call' && <PhoneIcon className="w-5 h-5 text-green-400" />}
                    {activity.type === 'meeting' && <Video className="w-5 h-5 text-amber-400" />}
                    {activity.type === 'status_change' && <AlertCircle className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-navy-900">{activity.description}</p>
                    <span className="text-xs text-navy-400">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <p className="text-center text-navy-400 py-8">No activity yet</p>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Quick Actions</h3>
            
            {/* Stage-specific actions */}
            <div className="space-y-3 mb-6">
                {lead.stage === 'new' && (
                <button 
                    onClick={async () => {
                    // Update stage to contacted
                    const res = await fetch(`/api/admin/sales/leads/${lead.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ stage: 'contacted' })
                    })
                    if (res.ok) {
                        fetchLeadDetails()
                    }
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                    <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Mark as Contacted</span>
                    </div>
                    <span className="text-xs bg-blue-200 px-2 py-1 rounded-full">1-click</span>
                </button>
                )}
                
                {lead.stage === 'contacted' && (
                <button 
                    onClick={() => {
                    setNewTask({
                        title: `Consultation call with ${lead.company_name}`,
                        task_type: 'call',
                        due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                        description: `Initial consultation call with ${lead.contact_name}`
                    })
                    setShowAddTask(true)
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                >
                    <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Schedule Consultation</span>
                    </div>
                    <span className="text-xs bg-purple-200 px-2 py-1 rounded-full">creates task</span>
                </button>
                )}
                
                {lead.stage === 'consultation_scheduled' && (
                <button 
                    onClick={async () => {
                    // Update stage to consultation_completed
                    const res = await fetch(`/api/admin/sales/leads/${lead.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ stage: 'consultation_completed' })
                    })
                    if (res.ok) {
                        fetchLeadDetails()
                    }
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                >
                    <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Complete Consultation</span>
                    </div>
                    <span className="text-xs bg-indigo-200 px-2 py-1 rounded-full">1-click</span>
                </button>
                )}
                
                {lead.stage === 'consultation_completed' && (
                <button 
                    onClick={() => {
                    setNewTask({
                        title: `Send proposal to ${lead.company_name}`,
                        task_type: 'proposal',
                        due_date: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
                        description: `Prepare and send proposal based on consultation`
                    })
                    setShowAddTask(true)
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100"
                >
                    <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Create Proposal</span>
                    </div>
                    <span className="text-xs bg-amber-200 px-2 py-1 rounded-full">creates task</span>
                </button>
                )}
                
                {lead.stage === 'proposal' && (
                <button 
                    onClick={async () => {
                    // Update stage to negotiation
                    const res = await fetch(`/api/admin/sales/leads/${lead.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ stage: 'negotiation' })
                    })
                    if (res.ok) {
                        fetchLeadDetails()
                    }
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100"
                >
                    <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">Move to Negotiation</span>
                    </div>
                    <span className="text-xs bg-orange-200 px-2 py-1 rounded-full">1-click</span>
                </button>
                )}
                
                {lead.stage === 'negotiation' && (
                <div className="grid grid-cols-2 gap-2">
                    <button 
                    onClick={async () => {
                        // Win the deal
                        const res = await fetch(`/api/admin/sales/leads/${lead.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            stage: 'closed_won', 
                            probability: 100 
                        })
                        })
                        if (res.ok) {
                        fetchLeadDetails()
                        }
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                    >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Win</span>
                    </button>
                    <button 
                    onClick={async () => {
                        // Lose the deal
                        const res = await fetch(`/api/admin/sales/leads/${lead.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            stage: 'closed_lost', 
                            probability: 0 
                        })
                        })
                        if (res.ok) {
                        fetchLeadDetails()
                        }
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                    >
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Lose</span>
                    </button>
                </div>
                )}
            </div>
            
            {/* Universal Actions */}
            <div className="space-y-2">
                <h4 className="text-xs font-medium text-navy-500 uppercase tracking-wider mb-2">Communication</h4>
                
                <button 
                onClick={() => {
                    window.location.href = `mailto:${lead.contact_email}?subject=Following up with ${lead.company_name}`
                }}
                className="w-full flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm"
                >
                <Mail className="w-4 h-4 text-navy-500" />
                <span>Send Email</span>
                </button>
                
                <button 
                onClick={() => {
                    setNewTask({
                    title: `Call with ${lead.contact_name}`,
                    task_type: 'call',
                    due_date: new Date().toISOString().slice(0, 16),
                    description: `Follow-up call with ${lead.company_name}`
                    })
                    setShowAddTask(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm"
                >
                <PhoneIcon className="w-4 h-4 text-navy-500" />
                <span>Log Call</span>
                </button>
                
                <button 
                onClick={() => {
                    setNewTask({
                    title: `Meeting with ${lead.company_name}`,
                    task_type: 'meeting',
                    due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                    description: `Scheduled meeting with ${lead.contact_name}`
                    })
                    setShowAddTask(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm"
                >
                <Video className="w-4 h-4 text-navy-500" />
                <span>Schedule Meeting</span>
                </button>
                
                <button 
                onClick={() => {
                    setNewTask({
                    title: `Follow up with ${lead.company_name}`,
                    task_type: 'follow_up',
                    due_date: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
                    description: `General follow-up`
                    })
                    setShowAddTask(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm"
                >
                <Clock className="w-4 h-4 text-navy-500" />
                <span>Set Reminder</span>
                </button>
            </div>
            
            {/* Stage change hint */}
            <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-navy-400">
                {lead.stage === 'new' && '➡️ Click to mark as contacted'}
                {lead.stage === 'contacted' && '📞 Schedule consultation call'}
                {lead.stage === 'consultation_scheduled' && '✅ Complete the consultation'}
                {lead.stage === 'consultation_completed' && '📄 Create and send proposal'}
                {lead.stage === 'proposal' && '🤝 Move to negotiation'}
                {lead.stage === 'negotiation' && '💰 Close or lose the deal'}
                </p>
            </div>
            </div>
        </div>
      )}
      
      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Add New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Follow up on proposal..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Task Type
                </label>
                <select
                  value={newTask.task_type}
                  onChange={(e) => setNewTask({...newTask, task_type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="proposal">Send Proposal</option>
                  <option value="follow_up">Follow Up</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Additional details..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.title}
                className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
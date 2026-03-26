// src/app/admin/health/alerts/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Bell, 
  Mail, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  AlertTriangle,
  Clock,
  Loader2,
  Save,
  Power,
  PowerOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Types
interface AlertRule {
  id: string
  name: string
  service: string
  metric: string
  threshold: number
  operator: string
  severity: 'critical' | 'warning' | 'info'
  cooldown_minutes: number
  enabled: boolean
  notification_channels: string[] | string
  created_at: string
  updated_at: string
}

interface NotificationChannel {
  id: string
  name: string
  type: string
  enabled: boolean
}

const METRIC_LABELS: Record<string, string> = {
  error_rate: 'Error Rate (%)',
  response_time: 'Response Time (ms)',
  disk_usage: 'Disk Usage (%)',
  cpu_usage: 'CPU Usage (%)',
  memory_usage: 'Memory Usage (%)',
  failure_rate: 'Failure Rate (%)',
  query_time: 'Query Time (ms)',
  success_rate: 'Success Rate (%)',
  queue_size: 'Queue Size',
  latency: 'Latency (ms)',
  uptime: 'Uptime (%)'
}

const SERVICE_LABELS: Record<string, string> = {
  api: 'API Gateway',
  database: 'Database',
  storage: 'Storage',
  server: 'Server',
  application: 'Application',
  reports: 'Reports',
  payments: 'Payments',
  auth: 'Auth Service',
  queue: 'Queue System',
  stripe: 'Stripe',
  openai: 'OpenAI',
  pdfGeneration: 'PDF Generation',
  email: 'Email Service',
  supabase: 'Supabase',
  vercel: 'Vercel'
}

const OPERATOR_LABELS: Record<string, string> = {
  gt: 'Greater than (>)',
  lt: 'Less than (<)',
  gte: 'Greater or equal (≥)',
  lte: 'Less or equal (≤)',
  eq: 'Equal to (=)'
}

export default function AlertConfiguration() {
  // State
  const [rules, setRules] = useState<AlertRule[]>([])
  const [channels, setChannels] = useState<NotificationChannel[]>([])
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const supabase = createClient()

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch alert rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('alert_rules')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (rulesError) throw rulesError
      
      // Parse notification_channels from JSONB
      const parsedRules = (rulesData || []).map(rule => ({
        ...rule,
        notification_channels: parseNotificationChannels(rule.notification_channels)
      }))
      setRules(parsedRules)
      
      // Fetch notification channels
      const { data: channelsData, error: channelsError } = await supabase
        .from('notification_channels')
        .select('id, name, type, enabled')
        .eq('enabled', true)
        .order('name', { ascending: true })
      
      if (channelsError) throw channelsError
      setChannels(channelsData || [])
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load alert configuration'
      setError(message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Helper to parse notification channels from various formats
  const parseNotificationChannels = (channels: any): string[] => {
    if (!channels) return []
    if (Array.isArray(channels)) return channels
    if (typeof channels === 'string') {
      try {
        return JSON.parse(channels)
      } catch {
        return []
      }
    }
    if (typeof channels === 'object') {
      return Object.values(channels)
    }
    return []
  }

  // Save rule
  const handleSaveRule = async () => {
    if (!editingRule) return
    if (!editingRule.name.trim()) {
      setError('Rule name is required')
      return
    }
    if (editingRule.threshold <= 0 && editingRule.metric !== 'queue_size') {
      setError('Threshold must be greater than 0')
      return
    }
    
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const channelsJsonb = JSON.stringify(editingRule.notification_channels || [])
      
      if (editingRule.id === 'new') {
        // Create new rule
        const { data, error } = await supabase
          .from('alert_rules')
          .insert([{
            name: editingRule.name.trim(),
            service: editingRule.service,
            metric: editingRule.metric,
            threshold: editingRule.threshold,
            operator: editingRule.operator,
            severity: editingRule.severity,
            cooldown_minutes: editingRule.cooldown_minutes,
            enabled: editingRule.enabled,
            notification_channels: channelsJsonb,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
        
        if (error) throw error
        
        if (data && data[0]) {
          setRules([{
            ...data[0],
            notification_channels: parseNotificationChannels(data[0].notification_channels)
          }, ...rules])
          setSuccessMessage('Alert rule created successfully')
        }
      } else {
        // Update existing rule
        const { error } = await supabase
          .from('alert_rules')
          .update({
            name: editingRule.name.trim(),
            service: editingRule.service,
            metric: editingRule.metric,
            threshold: editingRule.threshold,
            operator: editingRule.operator,
            severity: editingRule.severity,
            cooldown_minutes: editingRule.cooldown_minutes,
            enabled: editingRule.enabled,
            notification_channels: channelsJsonb,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRule.id)
        
        if (error) throw error
        
        setRules(rules.map(r => 
          r.id === editingRule.id ? editingRule : r
        ))
        setSuccessMessage('Alert rule updated successfully')
      }
      
      setShowRuleModal(false)
      setEditingRule(null)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save alert rule'
      setError(message)
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  // Delete rule
  const handleDeleteRule = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return
    
    setSaving(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setRules(rules.filter(r => r.id !== id))
      setSuccessMessage(`"${name}" deleted successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete alert rule'
      setError(message)
      console.error('Delete error:', err)
    } finally {
      setSaving(false)
    }
  }

  // Toggle rule enabled status
  const handleToggleRule = async (id: string, currentEnabled: boolean, name: string) => {
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({ 
          enabled: !currentEnabled, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
      
      if (error) throw error
      
      setRules(rules.map(r => 
        r.id === id ? { ...r, enabled: !currentEnabled } : r
      ))
      
      setSuccessMessage(`"${name}" ${!currentEnabled ? 'enabled' : 'disabled'}`)
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update rule status'
      setError(message)
      console.error('Toggle error:', err)
    } finally {
      setSaving(false)
    }
  }

  const getOperatorSymbol = (operator: string) => {
    const symbols: Record<string, string> = {
      gt: '>', lt: '<', gte: '≥', lte: '≤', eq: '='
    }
    return symbols[operator] || operator
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading alert configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Toast Notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="ml-2 text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Alert Configuration</h1>
          <p className="text-navy-600">Manage alert rules for system monitoring</p>
        </div>
        <button
          onClick={() => {
            setEditingRule({
              id: 'new',
              name: '',
              service: 'api',
              metric: 'latency',
              threshold: 0,
              operator: 'gt',
              severity: 'warning',
              cooldown_minutes: 15,
              enabled: true,
              notification_channels: ['Admin Email'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            setShowRuleModal(true)
          }}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Alert Rule
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-navy-900">{rules.length}</div>
          <div className="text-sm text-navy-500">Total Rules</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">{rules.filter(r => r.enabled).length}</div>
          <div className="text-sm text-navy-500">Enabled</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-red-600">{rules.filter(r => r.severity === 'critical').length}</div>
          <div className="text-sm text-navy-500">Critical Rules</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-amber-600">{rules.filter(r => r.severity === 'warning').length}</div>
          <div className="text-sm text-navy-500">Warning Rules</div>
        </div>
      </div>

      {/* Alert Rules List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Rule Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Channels</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-navy-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.enabled, rule.name)}
                      disabled={saving}
                      className="focus:outline-none"
                    >
                      {rule.enabled ? (
                        <Power className="w-5 h-5 text-green-600 hover:text-green-700" />
                      ) : (
                        <PowerOff className="w-5 h-5 text-slate-400 hover:text-slate-500" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy-900">{rule.name}</div>
                    <div className="text-xs text-navy-500">{SERVICE_LABELS[rule.service] || rule.service}</div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      {rule.metric} {getOperatorSymbol(rule.operator)} {rule.threshold}
                    </code>
                    <div className="text-xs text-navy-500 mt-1">
                      Cooldown: {rule.cooldown_minutes} min
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      rule.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {parseNotificationChannels(rule.notification_channels).slice(0, 2).map(channel => (
                        <span key={channel} className="text-xs bg-slate-100 text-navy-600 px-2 py-0.5 rounded">
                          {channel}
                        </span>
                      ))}
                      {parseNotificationChannels(rule.notification_channels).length > 2 && (
                        <span className="text-xs text-navy-400">
                          +{parseNotificationChannels(rule.notification_channels).length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingRule(rule)
                          setShowRuleModal(true)
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Edit rule"
                      >
                        <Edit2 className="w-4 h-4 text-navy-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id, rule.name)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete rule"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {rules.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-navy-600 font-medium">No alert rules configured</p>
            <p className="text-sm text-navy-400 mt-1">Click "New Alert Rule" to start monitoring</p>
          </div>
        )}
      </div>

      {/* Rule Modal */}
      {showRuleModal && editingRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-navy-900">
                  {editingRule.id === 'new' ? 'Create Alert Rule' : 'Edit Alert Rule'}
                </h3>
                <button
                  onClick={() => setShowRuleModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Rule Name */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Rule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., High API Latency"
                    autoFocus
                  />
                </div>
                
                {/* Service & Metric */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Service</label>
                    <select
                      value={editingRule.service}
                      onChange={(e) => setEditingRule({ ...editingRule, service: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Metric</label>
                    <select
                      value={editingRule.metric}
                      onChange={(e) => setEditingRule({ ...editingRule, metric: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {Object.entries(METRIC_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Operator & Threshold */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Operator</label>
                    <select
                      value={editingRule.operator}
                      onChange={(e) => setEditingRule({ ...editingRule, operator: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {Object.entries(OPERATOR_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Threshold</label>
                    <input
                      type="number"
                      value={editingRule.threshold}
                      onChange={(e) => setEditingRule({ ...editingRule, threshold: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                      step="any"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Severity</label>
                    <select
                      value={editingRule.severity}
                      onChange={(e) => setEditingRule({ ...editingRule, severity: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="critical">Critical</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                    </select>
                  </div>
                </div>
                
                {/* Cooldown */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Cooldown (minutes)</label>
                  <input
                    type="number"
                    value={editingRule.cooldown_minutes}
                    onChange={(e) => setEditingRule({ ...editingRule, cooldown_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    min="1"
                    max="1440"
                  />
                  <p className="text-xs text-navy-500 mt-1">How long to wait before sending another alert</p>
                </div>
                
                {/* Notification Channels */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Notification Channels</label>
                  {channels.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                      {channels.map(channel => (
                        <label key={channel.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={(editingRule.notification_channels || []).includes(channel.name)}
                            onChange={(e) => {
                              const current = Array.isArray(editingRule.notification_channels) 
                                ? editingRule.notification_channels 
                                : []
                              if (e.target.checked) {
                                setEditingRule({
                                  ...editingRule,
                                  notification_channels: [...current, channel.name]
                                })
                              } else {
                                setEditingRule({
                                  ...editingRule,
                                  notification_channels: current.filter(name => name !== channel.name)
                                })
                              }
                            }}
                            className="rounded border-slate-300 focus:ring-gold-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-navy-500" />
                              <span className="text-sm font-medium text-navy-700">{channel.name}</span>
                            </div>
                            <p className="text-xs text-navy-500 capitalize">{channel.type}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">No notification channels configured.</p>
                      <a href="/admin/health/channels" className="text-sm text-amber-700 underline mt-1 inline-block">
                        Go to Channels →
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={handleSaveRule}
                  disabled={saving || !editingRule.name.trim()}
                  className="flex-1 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  {editingRule.id === 'new' ? 'Create Rule' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
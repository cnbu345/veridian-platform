// src/app/admin/health/channels/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Webhook, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Save,
  Power,
  PowerOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NotificationChannel {
  id: string
  type: 'email' | 'slack' | 'webhook' | 'sms'
  name: string
  config: {
    emails?: string[]
    webhook_url?: string
    channel?: string
    phone_numbers?: string[]
  }
  enabled: boolean
  created_at: string
  updated_at: string
}

const CHANNEL_TYPES = [
  { value: 'email', label: 'Email', icon: Mail, description: 'Send alerts to email addresses', color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'slack', label: 'Slack', icon: MessageSquare, description: 'Send alerts to Slack channels', color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'webhook', label: 'Webhook', icon: Webhook, description: 'Send alerts to custom webhook URL', color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'sms', label: 'SMS', icon: Phone, description: 'Send SMS alerts to phone numbers', color: 'text-orange-600', bg: 'bg-orange-50' },
]

export default function NotificationChannelsPage() {
  const [channels, setChannels] = useState<NotificationChannel[]>([])
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null)
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const supabase = createClient()

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('notification_channels')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true })
      
      if (error) throw error
      setChannels(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load channels'
      setError(message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  const handleSaveChannel = async () => {
    if (!editingChannel) return
    if (!editingChannel.name.trim()) {
      setError('Channel name is required')
      return
    }
    
    setSaving(true)
    setError(null)
    
    try {
      if (editingChannel.id === 'new') {
        const { data, error } = await supabase
          .from('notification_channels')
          .insert([{
            type: editingChannel.type,
            name: editingChannel.name.trim(),
            config: editingChannel.config,
            enabled: editingChannel.enabled,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
        
        if (error) throw error
        
        if (data && data[0]) {
          setChannels([...channels, data[0]])
          setSuccessMessage('Channel created successfully')
        }
      } else {
        const { error } = await supabase
          .from('notification_channels')
          .update({
            type: editingChannel.type,
            name: editingChannel.name.trim(),
            config: editingChannel.config,
            enabled: editingChannel.enabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingChannel.id)
        
        if (error) throw error
        
        setChannels(channels.map(c => 
          c.id === editingChannel.id ? editingChannel : c
        ))
        setSuccessMessage('Channel updated successfully')
      }
      
      setShowChannelModal(false)
      setEditingChannel(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save channel'
      setError(message)
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleChannel = async (id: string, currentEnabled: boolean, name: string) => {
    try {
      const { error } = await supabase
        .from('notification_channels')
        .update({ 
          enabled: !currentEnabled, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
      
      if (error) throw error
      
      setChannels(channels.map(c => 
        c.id === id ? { ...c, enabled: !currentEnabled } : c
      ))
      
      setSuccessMessage(`"${name}" ${!currentEnabled ? 'enabled' : 'disabled'}`)
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update channel'
      setError(message)
      console.error('Toggle error:', err)
    }
  }

  const handleDeleteChannel = async (id: string, name: string) => {
    // Check if channel is used by any alert rules
    const { data: rules, error: rulesError } = await supabase
      .from('alert_rules')
      .select('name, notification_channels')
      .contains('notification_channels', JSON.stringify([name]))
    
    if (rulesError) {
      console.error('Check error:', rulesError)
    }
    
    if (rules && rules.length > 0) {
      setError(`Cannot delete "${name}" because it's used by: ${rules.map(r => r.name).join(', ')}. Remove it from alert rules first.`)
      setTimeout(() => setError(null), 5000)
      return
    }
    
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return
    
    try {
      const { error } = await supabase
        .from('notification_channels')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setChannels(channels.filter(c => c.id !== id))
      setSuccessMessage(`"${name}" deleted successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete channel'
      setError(message)
      console.error('Delete error:', err)
    }
  }

  const getChannelIcon = (type: string) => {
    const channelType = CHANNEL_TYPES.find(t => t.value === type)
    const Icon = channelType?.icon || Bell
    return { Icon, color: channelType?.color || 'text-slate-600', bg: channelType?.bg || 'bg-slate-50' }
  }

  const renderConfigFields = (channel: NotificationChannel) => {
    switch (channel.type) {
      case 'email':
        return (
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Email Addresses</label>
            <input
              type="text"
              value={channel.config.emails?.join(', ') || ''}
              onChange={(e) => setEditingChannel({
                ...channel,
                config: { ...channel.config, emails: e.target.value.split(',').map(e => e.trim()).filter(e => e) }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="admin@example.com, support@example.com"
            />
            <p className="text-xs text-navy-500 mt-1">Separate multiple emails with commas</p>
          </div>
        )
      
      case 'slack':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Webhook URL</label>
              <input
                type="url"
                value={channel.config.webhook_url || ''}
                onChange={(e) => setEditingChannel({
                  ...channel,
                  config: { ...channel.config, webhook_url: e.target.value }
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Channel (optional)</label>
              <input
                type="text"
                value={channel.config.channel || ''}
                onChange={(e) => setEditingChannel({
                  ...channel,
                  config: { ...channel.config, channel: e.target.value }
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="#alerts"
              />
            </div>
          </>
        )
      
      case 'webhook':
        return (
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Webhook URL</label>
            <input
              type="url"
              value={channel.config.webhook_url || ''}
              onChange={(e) => setEditingChannel({
                ...channel,
                config: { ...channel.config, webhook_url: e.target.value }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="https://your-service.com/webhook"
            />
            <p className="text-xs text-navy-500 mt-1">POST requests will be sent with alert data as JSON</p>
          </div>
        )
      
      case 'sms':
        return (
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Phone Numbers</label>
            <input
              type="text"
              value={channel.config.phone_numbers?.join(', ') || ''}
              onChange={(e) => setEditingChannel({
                ...channel,
                config: { ...channel.config, phone_numbers: e.target.value.split(',').map(p => p.trim()).filter(p => p) }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              placeholder="+1234567890, +1987654321"
            />
            <p className="text-xs text-navy-500 mt-1">Include country code. Separate multiple numbers with commas</p>
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading notification channels...</p>
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
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Notification Channels</h1>
          <p className="text-navy-600">Configure where alerts are sent (Email, Slack, Webhook, SMS)</p>
        </div>
        <button
          onClick={() => {
            setEditingChannel({
              id: 'new',
              type: 'email',
              name: '',
              config: {},
              enabled: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            setShowChannelModal(true)
          }}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Channel
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-navy-900">{channels.length}</div>
          <div className="text-sm text-navy-500">Total Channels</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">{channels.filter(c => c.enabled).length}</div>
          <div className="text-sm text-navy-500">Active</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{channels.filter(c => c.type === 'email').length}</div>
          <div className="text-sm text-navy-500">Email</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-purple-600">{channels.filter(c => c.type === 'slack').length + channels.filter(c => c.type === 'webhook').length}</div>
          <div className="text-sm text-navy-500">Other Integrations</div>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => {
          const { Icon, color, bg } = getChannelIcon(channel.type)
          
          return (
            <div
              key={channel.id}
              className={`bg-white rounded-xl border p-6 transition-all ${
                channel.enabled ? 'border-slate-200 shadow-sm' : 'border-slate-200 bg-slate-50 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{channel.name}</h3>
                    <p className="text-xs text-navy-500 capitalize">{channel.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleChannel(channel.id, channel.enabled, channel.name)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    channel.enabled 
                      ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                  aria-label={channel.enabled ? 'Disable channel' : 'Enable channel'}
                >
                  {channel.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Channel Configuration Preview */}
              <div className="space-y-2 mb-4">
                {channel.type === 'email' && channel.config.emails && (
                  <div className="text-xs text-navy-600">
                    <span className="font-medium">Emails:</span> {channel.config.emails.join(', ')}
                  </div>
                )}
                {channel.type === 'slack' && channel.config.webhook_url && (
                  <div className="text-xs text-navy-600 truncate">
                    <span className="font-medium">Webhook:</span> {channel.config.webhook_url}
                  </div>
                )}
                {channel.type === 'webhook' && channel.config.webhook_url && (
                  <div className="text-xs text-navy-600 truncate">
                    <span className="font-medium">URL:</span> {channel.config.webhook_url}
                  </div>
                )}
                {channel.type === 'sms' && channel.config.phone_numbers && (
                  <div className="text-xs text-navy-600">
                    <span className="font-medium">Numbers:</span> {channel.config.phone_numbers.join(', ')}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setEditingChannel(channel)
                    setShowChannelModal(true)
                  }}
                  className="flex-1 px-3 py-1.5 text-sm text-gold-600 hover:bg-gold-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteChannel(channel.id, channel.name)}
                  className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          )
        })}
        
        {/* Add Channel Card */}
        <button
          onClick={() => {
            setEditingChannel({
              id: 'new',
              type: 'email',
              name: '',
              config: {},
              enabled: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            setShowChannelModal(true)
          }}
          className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-6 hover:border-gold-400 hover:bg-gold-50/30 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="p-3 rounded-full bg-slate-100 group-hover:bg-gold-100 transition-colors">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-gold-600" />
          </div>
          <span className="text-sm font-medium text-navy-600">Add New Channel</span>
          <span className="text-xs text-navy-400">Email, Slack, Webhook, SMS</span>
        </button>
      </div>

      {/* Channel Modal */}
      {showChannelModal && editingChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-navy-900">
                  {editingChannel.id === 'new' ? 'Add Notification Channel' : 'Edit Channel'}
                </h3>
                <button
                  onClick={() => setShowChannelModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Channel Type</label>
                  <select
                    value={editingChannel.type}
                    onChange={(e) => setEditingChannel({ 
                      ...editingChannel, 
                      type: e.target.value as any,
                      config: {}
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {CHANNEL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Channel Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingChannel.name}
                    onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., Engineering Slack, Support Email"
                    autoFocus
                  />
                  <p className="text-xs text-navy-500 mt-1">This name will be used when configuring alert rules</p>
                </div>
                
                {renderConfigFields(editingChannel)}
                
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingChannel.enabled}
                      onChange={(e) => setEditingChannel({ ...editingChannel, enabled: e.target.checked })}
                      className="rounded border-slate-300 focus:ring-gold-500"
                    />
                    <span className="text-sm text-navy-700">Enable this channel</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={handleSaveChannel}
                  disabled={saving || !editingChannel.name.trim()}
                  className="flex-1 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  {editingChannel.id === 'new' ? 'Create Channel' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowChannelModal(false)}
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
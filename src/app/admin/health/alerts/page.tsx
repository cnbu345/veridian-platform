// src/app/admin/health/alerts/page.tsx
'use client'

import { useState } from 'react'
import { Bell, Mail, MessageSquare, Webhook, Plus, Save, Trash2 } from 'lucide-react'

interface AlertRule {
  id: string
  name: string
  service: string
  metric: 'latency' | 'errorRate' | 'cpu' | 'memory' | 'uptime'
  threshold: number
  operator: '>' | '<' | '>=' | '<=' | '=='
  severity: 'critical' | 'warning' | 'info'
  cooldown: number // minutes
  enabled: boolean
  notificationChannels: string[]
}

interface NotificationChannel {
  id: string
  type: 'email' | 'slack' | 'webhook' | 'sms'
  name: string
  config: any
  enabled: boolean
}

export default function AlertConfiguration() {
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'High API Latency',
      service: 'api',
      metric: 'latency',
      threshold: 1000,
      operator: '>',
      severity: 'warning',
      cooldown: 15,
      enabled: true,
      notificationChannels: ['email', 'slack']
    },
    {
      id: '2',
      name: 'Elevated Error Rate',
      service: 'database',
      metric: 'errorRate',
      threshold: 5,
      operator: '>',
      severity: 'critical',
      cooldown: 5,
      enabled: true,
      notificationChannels: ['email', 'slack', 'sms']
    }
  ])
  
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email',
      type: 'email',
      name: 'Admin Email',
      config: { emails: ['admin@veridiangroup.com'] },
      enabled: true
    },
    {
      id: 'slack',
      type: 'slack',
      name: 'Engineering Slack',
      config: { webhook: 'https://hooks.slack.com/services/...' },
      enabled: true
    }
  ])
  
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Alert Configuration</h1>
        <button
          onClick={() => setEditingRule({
            id: Date.now().toString(),
            name: '',
            service: 'api',
            metric: 'latency',
            threshold: 0,
            operator: '>',
            severity: 'warning',
            cooldown: 15,
            enabled: true,
            notificationChannels: []
          })}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          New Alert Rule
        </button>
      </div>
      
      {/* Notification Channels */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Notification Channels</h2>
        <div className="space-y-4">
          {channels.map((channel) => (
            <div key={channel.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                {channel.type === 'email' && <Mail className="w-5 h-5 text-navy-500" />}
                {channel.type === 'slack' && <MessageSquare className="w-5 h-5 text-navy-500" />}
                {channel.type === 'webhook' && <Webhook className="w-5 h-5 text-navy-500" />}
                {channel.type === 'sms' && <Bell className="w-5 h-5 text-navy-500" />}
                <div>
                  <h3 className="font-medium">{channel.name}</h3>
                  <p className="text-xs text-navy-500 capitalize">{channel.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channel.enabled}
                    onChange={() => {}}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-gold-600"></div>
                </label>
                <button className="p-1 hover:bg-slate-200 rounded">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
          
          <button className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-navy-500 hover:border-gold-500 hover:text-gold-600 transition-colors">
            + Add Notification Channel
          </button>
        </div>
      </div>
      
      {/* Alert Rules */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Alert Rules</h2>
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{rule.name}</h3>
                  <p className="text-sm text-navy-600">
                    When {rule.service} {rule.metric} {rule.operator} {rule.threshold}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${rule.severity === 'critical' ? 'bg-red-100 text-red-800' : ''}
                    ${rule.severity === 'warning' ? 'bg-amber-100 text-amber-800' : ''}
                    ${rule.severity === 'info' ? 'bg-blue-100 text-blue-800' : ''}
                  `}>
                    {rule.severity}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-gold-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <span className="text-navy-500">Cooldown: {rule.cooldown} minutes</span>
                <span className="text-navy-500">Channels: {rule.notificationChannels.join(', ')}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <button className="text-xs text-gold-600 hover:text-gold-700">Edit</button>
                <button className="text-xs text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
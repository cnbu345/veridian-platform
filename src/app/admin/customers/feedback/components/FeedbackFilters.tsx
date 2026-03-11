// src/app/admin/customers/feedback/components/FeedbackFilters.tsx
'use client'

import { Search, Filter, X } from 'lucide-react'
import { useState } from 'react'

interface FeedbackFiltersProps {
  status: string
  onStatusChange: (status: string) => void
  type: string
  onTypeChange: (type: string) => void
  priority: string
  onPriorityChange: (priority: string) => void
  search: string
  onSearchChange: (search: string) => void
}

export default function FeedbackFilters({
  status,
  onStatusChange,
  type,
  onTypeChange,
  priority,
  onPriorityChange,
  search,
  onSearchChange
}: FeedbackFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'navy' },
    { value: 'new', label: 'New', color: 'blue' },
    { value: 'reviewed', label: 'Reviewed', color: 'amber' },
    { value: 'in_progress', label: 'In Progress', color: 'purple' },
    { value: 'actioned', label: 'Actioned', color: 'green' },
    { value: 'archived', label: 'Archived', color: 'slate' }
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'nps', label: 'NPS' },
    { value: 'csat', label: 'CSAT' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'bug_report', label: 'Bug Report' },
    { value: 'support', label: 'Support' },
    { value: 'general', label: 'General' }
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical', color: 'red' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'medium', label: 'Medium', color: 'amber' },
    { value: 'low', label: 'Low', color: 'green' }
  ]

  const getStatusColor = (value: string) => {
    switch(value) {
      case 'new': return 'bg-blue-600 text-white'
      case 'reviewed': return 'bg-amber-600 text-white'
      case 'in_progress': return 'bg-purple-600 text-white'
      case 'actioned': return 'bg-green-600 text-white'
      case 'archived': return 'bg-slate-600 text-white'
      default: return 'bg-navy-900 text-white'
    }
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input
          type="text"
          placeholder="Search feedback, companies, or categories..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-navy-600"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </span>
          <span className="text-navy-400">{showMobileFilters ? '▲' : '▼'}</span>
        </button>

        {showMobileFilters && (
          <div className="mt-3 space-y-4">
            {/* Status Filters */}
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      onStatusChange(s.value)
                      setShowMobileFilters(false)
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      status === s.value
                        ? getStatusColor(s.value)
                        : 'bg-white text-navy-600 border border-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filters */}
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {typeOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      onTypeChange(t.value)
                      setShowMobileFilters(false)
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      type === t.value
                        ? 'bg-navy-900 text-white'
                        : 'bg-white text-navy-600 border border-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filters */}
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-2">Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      onPriorityChange(p.value)
                      setShowMobileFilters(false)
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      priority === p.value
                        ? p.value === 'critical' ? 'bg-red-600 text-white'
                        : p.value === 'high' ? 'bg-orange-600 text-white'
                        : p.value === 'medium' ? 'bg-amber-600 text-white'
                        : p.value === 'low' ? 'bg-green-600 text-white'
                        : 'bg-navy-900 text-white'
                        : 'bg-white text-navy-600 border border-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-navy-500">Status:</span>
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => onStatusChange(s.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                status === s.value
                  ? getStatusColor(s.value)
                  : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-navy-500">Type:</span>
          {typeOptions.slice(0, 5).map((t) => (
            <button
              key={t.value}
              onClick={() => onTypeChange(t.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                type === t.value
                  ? 'bg-navy-900 text-white'
                  : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-navy-500">Priority:</span>
          {priorityOptions.map((p) => (
            <button
              key={p.value}
              onClick={() => onPriorityChange(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                priority === p.value
                  ? p.value === 'critical' ? 'bg-red-600 text-white'
                  : p.value === 'high' ? 'bg-orange-600 text-white'
                  : p.value === 'medium' ? 'bg-amber-600 text-white'
                  : p.value === 'low' ? 'bg-green-600 text-white'
                  : 'bg-navy-900 text-white'
                  : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
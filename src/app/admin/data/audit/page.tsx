// src/app/admin/data/audit/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import {
  FileText, RefreshCw, Search, Filter, Download, Calendar,
  ChevronLeft, ChevronRight, Eye, EyeOff, X, AlertCircle,
  CheckCircle, Clock, User, Table, Database as DatabaseIcon,
  ArrowUpDown, FilterX
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_data: any | null
  new_data: any | null
  changed_by: string | null
  changed_by_email: string | null
  changed_at: string
  reason: string | null
  ip_address: string | null
  state_code?: string | null
}

const tableOptions = [
  { value: 'all', label: 'All Tables' },
  { value: 'technology_vendors', label: 'Technology Vendors' },
  { value: 'budget_templates', label: 'Budget Templates' },
  { value: 'market_metrics', label: 'Market Metrics' },
  { value: 'talent_metrics', label: 'Talent Metrics' },
  { value: 'risk_factors', label: 'Risk Factors' },
  { value: 'risk_state_overrides', label: 'Risk State Overrides' },
  { value: 'compliance_phases', label: 'Compliance Phases' },
  { value: 'action_items', label: 'Action Items' },
  { value: 'next_steps_templates', label: 'Next Steps Templates' },
  { value: 'compliance_calendar_templates', label: 'Compliance Calendar' },
  { value: 'compliance_calendar_tasks', label: 'Calendar Tasks' },
  { value: 'licensing_requirements', label: 'Licensing Requirements' },
  { value: 'state_audit_tracker', label: 'State Audit Tracker' }
]

const actionOptions = [
  { value: 'all', label: 'All Actions' },
  { value: 'INSERT', label: 'Insert', color: 'bg-green-100 text-green-800' },
  { value: 'UPDATE', label: 'Update', color: 'bg-blue-100 text-blue-800' },
  { value: 'DELETE', label: 'Delete', color: 'bg-red-100 text-red-800' }
]

export default function AuditLogPage() {
  const supabase = createClient()
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tableFilter, setTableFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [showDiffModal, setShowDiffModal] = useState<AuditLogEntry | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  // Refs for sync scrolling
  const tableHeaderRef = useRef<HTMLDivElement>(null)
  const tableBodyRef = useRef<HTMLDivElement>(null)

  // Sync horizontal scroll between header and body
  const handleBodyScroll = () => {
    if (tableHeaderRef.current && tableBodyRef.current) {
      tableHeaderRef.current.scrollLeft = tableBodyRef.current.scrollLeft
    }
  }

  const handleHeaderScroll = () => {
    if (tableHeaderRef.current && tableBodyRef.current) {
      tableBodyRef.current.scrollLeft = tableHeaderRef.current.scrollLeft
    }
  }

  const pageSize = 50

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('regulatory_audit_log')
        .select('*', { count: 'exact' })
        .order('changed_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter)
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter)
      }

      if (dateRange.start) {
        query = query.gte('changed_at', dateRange.start)
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999)
        query = query.lte('changed_at', endDate.toISOString())
      }

      const { data, error, count } = await query

      if (error) throw error

      let filteredData = data || []
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filteredData = filteredData.filter(log => 
          log.table_name?.toLowerCase().includes(term) ||
          log.record_id?.toLowerCase().includes(term) ||
          log.changed_by_email?.toLowerCase().includes(term) ||
          log.action?.toLowerCase().includes(term) ||
          log.reason?.toLowerCase().includes(term)
        )
      }

      setAuditLogs(filteredData)
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / pageSize))
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      setNotification({ type: 'error', message: 'Failed to load audit logs' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [page, tableFilter, actionFilter, dateRange.start, dateRange.end])

  const exportToCSV = () => {
    const headers = ['Date', 'Table', 'Action', 'Record ID', 'Changed By', 'IP Address', 'Reason']
    const rows = auditLogs.map(log => [
      new Date(log.changed_at).toLocaleString(),
      log.table_name,
      log.action,
      log.record_id,
      log.changed_by_email || 'System',
      log.ip_address || '—',
      log.reason || '—'
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    setNotification({ type: 'success', message: 'Exported to CSV' })
    setTimeout(() => setNotification(null), 3000)
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">INSERT</span>
      case 'UPDATE':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">UPDATE</span>
      case 'DELETE':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">DELETE</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{action}</span>
    }
  }

  const formatTableName = (tableName: string) => {
    return tableName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const DiffModal = () => {
    if (!showDiffModal) return null
    
    const { old_data, new_data, action, table_name, record_id } = showDiffModal
    
    const getDiffRows = () => {
      if (action === 'INSERT') {
        return Object.entries(new_data || {}).map(([key, value]) => ({
          field: key,
          old: '—',
          new: typeof value === 'object' ? JSON.stringify(value) : String(value || '—')
        }))
      }
      
      if (action === 'DELETE') {
        return Object.entries(old_data || {}).map(([key, value]) => ({
          field: key,
          old: typeof value === 'object' ? JSON.stringify(value) : String(value || '—'),
          new: '—'
        }))
      }
      
      // UPDATE - show only changed fields
      const changedFields: string[] = []
      const allKeys = new Set([...Object.keys(old_data || {}), ...Object.keys(new_data || {})])
      
      for (const key of allKeys) {
        const oldVal = old_data?.[key]
        const newVal = new_data?.[key]
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changedFields.push(key)
        }
      }
      
      return changedFields.map(field => ({
        field,
        old: old_data?.[field] !== undefined && old_data?.[field] !== null
          ? (typeof old_data[field] === 'object' ? JSON.stringify(old_data[field]) : String(old_data[field]))
          : '—',
        new: new_data?.[field] !== undefined && new_data?.[field] !== null
          ? (typeof new_data[field] === 'object' ? JSON.stringify(new_data[field]) : String(new_data[field]))
          : '—'
      }))
    }
    
    const diffRows = getDiffRows()
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              Change Details - {formatTableName(table_name)} #{record_id.slice(0, 8)}
            </h3>
            <button onClick={() => setShowDiffModal(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {getActionBadge(action)}
              <span className="text-sm text-gray-500">
                {new Date(showDiffModal.changed_at).toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">
                by {showDiffModal.changed_by_email || 'System'}
              </span>
            </div>
            
            {showDiffModal.reason && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">Reason:</p>
                <p className="text-sm text-gray-600">{showDiffModal.reason}</p>
              </div>
            )}
            
            {/* Diff Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Old Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {diffRows.map((row, idx) => (
                      <tr key={idx} className={row.old !== row.new ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 whitespace-nowrap">{row.field}</td>
                        <td className="px-4 py-3 text-sm font-mono text-red-600 max-w-md break-words">
                          <pre className="whitespace-pre-wrap text-xs">{row.old.length > 200 ? row.old.substring(0, 200) + '...' : row.old}</pre>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-green-600 max-w-md break-words">
                          <pre className="whitespace-pre-wrap text-xs">{row.new.length > 200 ? row.new.substring(0, 200) + '...' : row.new}</pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {diffRows.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No field differences found</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end p-4 border-t">
            <button onClick={() => setShowDiffModal(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (notification) {
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Audit Log</h1>
            <p className="text-navy-600">Track all changes to regulatory and report data</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            disabled={auditLogs.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <select
            value={tableFilter}
            onChange={(e) => { setTableFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500 text-sm"
          >
            {tableOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500 text-sm"
          >
            {actionOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <input
              type="date"
              placeholder="Start"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="date"
              placeholder="End"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <button
            onClick={() => {
              setSearchTerm('')
              setTableFilter('all')
              setActionFilter('all')
              setDateRange({ start: '', end: '' })
              setPage(1)
              fetchAuditLogs()
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            <FilterX className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
      
      {/* Stats and Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <p className="text-sm text-gray-500">
          Showing {auditLogs.length} of {totalCount} entries
        </p>
        <button
          onClick={fetchAuditLogs}
          className="flex items-center gap-2 text-sm text-gold-600 hover:text-gold-500"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      {/* Audit Log Table - Fixed scrolling without header scrollbar */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gold-600" />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No audit logs found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* TABLE HEADER - Separate scrollable container */}
            <div 
              ref={tableHeaderRef}
              onScroll={handleHeaderScroll}
              className="overflow-x-auto overflow-y-hidden border-b border-gray-200"
              style={{ scrollbarWidth: 'thin' }}
            >
              <table className="min-w-[1000px] w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[180px]">Date & Time</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[150px]">Table</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Action</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">Record ID</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[150px]">Changed By</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[200px]">Reason</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-[100px]">Actions</th>
                  </tr>
                </thead>
              </table>
            </div>
            
            {/* TABLE BODY - Scrollable container that syncs with header */}
            <div 
              ref={tableBodyRef}
              onScroll={handleBodyScroll}
              className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]"
              style={{ scrollbarWidth: 'thin' }}
            >
              <table className="min-w-[1000px] w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-[180px]">
                        {new Date(log.changed_at).toLocaleString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap w-[150px]">
                        <div className="flex items-center gap-2">
                          <DatabaseIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{formatTableName(log.table_name)}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap w-[100px]">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 w-[120px]">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                          {log.record_id.slice(0, 8)}...
                        </code>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap w-[150px]">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{log.changed_by_email || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 w-[200px]">
                        <p className="text-sm text-gray-500 truncate max-w-[180px]" title={log.reason || ''}>
                          {log.reason || '—'}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right w-[100px]">
                        <div className="flex items-center justify-end gap-2">
                          {(log.action === 'UPDATE' || log.action === 'INSERT' || log.action === 'DELETE') && (
                            <button
                              onClick={() => setShowDiffModal(log)}
                              className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
                            >
                              View Diff
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedEntry(expandedEntry === log.id ? null : log.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedEntry === log.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Expanded Row for details - shown outside scrollable area */}
            {expandedEntry && (
              <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
                {(() => {
                  const log = auditLogs.find(l => l.id === expandedEntry)
                  if (!log) return null
                  return (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Full Details:</p>
                      <div className="overflow-x-auto">
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                          {JSON.stringify(log, (key, value) => {
                            if (key === 'old_data' || key === 'new_data') {
                              return value ? JSON.stringify(value, null, 2).substring(0, 500) + (JSON.stringify(value, null, 2).length > 500 ? '...' : '') : value
                            }
                            return value
                          }, 2)}
                        </pre>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <DiffModal />
    </div>
  )
}
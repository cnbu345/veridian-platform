// src/app/admin/regulatory/audit/page.tsx
// Audit Log - Complete change history with human-readable format

'use client'

import { useEffect, useState } from 'react'
import {
  History,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  RefreshCw,
  User,
  Calendar,
  FileText,
  Database,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react'

// Types
interface AuditEntry {
  id: string
  table_name: string
  record_id: string
  action: string
  old_data: any
  new_data: any
  changed_by: string | null
  changed_by_name: string | null
  changed_by_role: string | null
  reason: string | null
  ip_address: string | null
  user_agent: string | null
  changed_at: string
}

const TABLE_OPTIONS = [
  { value: 'regulatory_facts', label: 'Regulatory Facts' },
  { value: 'regulatory_updates', label: 'Regulatory Updates' },
  { value: 'legislation_tracker', label: 'Legislation Tracker' },
  { value: 'enforcement_actions', label: 'Enforcement Actions' },
  { value: 'regulatory_notes', label: 'Regulatory Notes' },
  { value: 'regulatory_review_queue', label: 'Review Queue' },
  { value: 'external_sync', label: 'External Sync' },
  { value: 'system', label: 'System' }
]

const ACTION_OPTIONS = [
  { value: 'CREATE', label: 'Create', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'UPDATE', label: 'Update', color: 'bg-blue-100 text-blue-800', icon: Edit },
  { value: 'DELETE', label: 'Delete', color: 'bg-red-100 text-red-800', icon: Trash2 },
  { value: 'APPROVE', label: 'Approve', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'REJECT', label: 'Reject', color: 'bg-red-100 text-red-800', icon: XCircle },
  { value: 'VERIFY', label: 'Verify', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  { value: 'SYNC', label: 'Sync', color: 'bg-gray-100 text-gray-800', icon: RefreshCw }
]

// Helper function to get human-readable field names
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    'claim': 'Regulatory Claim',
    'state_code': 'State',
    'category': 'Category',
    'source_name': 'Source Name',
    'source_url': 'Source URL',
    'source_date': 'Source Date',
    'verification_status': 'Verification Status',
    'review_required': 'Review Required',
    'review_reason': 'Review Reason',
    'confidence_score': 'Confidence Score',
    'last_reviewed_at': 'Last Reviewed',
    'verified_by': 'Verified By',
    'notes': 'Internal Notes',
    'numeric_value': 'Numeric Value',
    'numeric_unit': 'Unit',
    'expires_at': 'Expires At',
    'title': 'Title',
    'description': 'Description',
    'bill_number': 'Bill Number',
    'status': 'Status',
    'introduced_date': 'Introduced Date',
    'effective_date': 'Effective Date',
    'priority': 'Priority',
    'current_value': 'Current Value',
    'proposed_value': 'Proposed Value',
    'agency_name': 'Agency',
    'defendant': 'Defendant',
    'action_type': 'Action Type',
    'penalty_amount': 'Penalty Amount',
    'action_date': 'Action Date',
    'resolution_date': 'Resolution Date'
  }
  return labels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Helper to format values for display
function formatValue(value: any, field: string): string {
  if (value === null || value === undefined) return '—'
  if (field === 'confidence_score') return `${Math.round(value * 100)}%`
  if (field === 'review_required') return value ? 'Yes' : 'No'
  if (field === 'created_at' || field === 'updated_at' || field === 'last_reviewed_at' || field === 'expires_at') {
    return new Date(value).toLocaleString()
  }
  if (field === 'source_date' || field === 'introduced_date' || field === 'effective_date' || field === 'action_date' || field === 'resolution_date') {
    return new Date(value).toLocaleDateString()
  }
  if (typeof value === 'boolean') return value ? '✅ Yes' : '❌ No'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

// Helper to get category display name
function getCategoryDisplay(category: string): string {
  const categories: Record<string, string> = {
    'license_requirement': 'License Requirement',
    'timeline': 'Processing Timeline',
    'fee_amount': 'Fee Amount',
    'bonding_amount': 'Bonding Requirement',
    'tax_treatment': 'Tax Treatment',
    'pending_legislation': 'Pending Legislation',
    'enforcement_action': 'Enforcement Action',
    'regulator_contact': 'Regulator Contact',
    'reporting_requirement': 'Reporting Requirement',
    'capital_requirement': 'Capital Requirement'
  }
  return categories[category] || category
}

// Helper to get status display
function getStatusDisplay(status: string): { label: string; color: string } {
  const statuses: Record<string, { label: string; color: string }> = {
    'verified': { label: 'Verified', color: 'text-green-600 bg-green-50' },
    'needs_update': { label: 'Needs Update', color: 'text-yellow-600 bg-yellow-50' },
    'deprecated': { label: 'Deprecated', color: 'text-red-600 bg-red-50' },
    'pending_review': { label: 'Pending Review', color: 'text-yellow-600 bg-yellow-50' },
    'approved': { label: 'Approved', color: 'text-green-600 bg-green-50' },
    'rejected': { label: 'Rejected', color: 'text-red-600 bg-red-50' }
  }
  return statuses[status] || { label: status, color: 'text-gray-600 bg-gray-50' }
}

// Helper to get priority display
function getPriorityDisplay(priority: string): { label: string; color: string } {
  const priorities: Record<string, { label: string; color: string }> = {
    'critical': { label: 'Critical', color: 'text-red-600 bg-red-50' },
    'high': { label: 'High', color: 'text-orange-600 bg-orange-50' },
    'medium': { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
    'low': { label: 'Low', color: 'text-gray-600 bg-gray-50' }
  }
  return priorities[priority] || { label: priority, color: 'text-gray-600 bg-gray-50' }
}

// Helper to extract changed fields
function getChangedFields(oldData: any, newData: any): Array<{ field: string; oldValue: any; newValue: any }> {
  if (!oldData || !newData) return []
  
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = []
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])
  
  for (const key of allKeys) {
    const oldVal = oldData[key]
    const newVal = newData[key]
    
    // Skip internal fields that aren't user-facing
    if (['id', 'created_at', 'updated_at', 'embedding', 'review_frequency_days'].includes(key)) continue
    
    // Check if value changed
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, oldValue: oldVal, newValue: newVal })
    }
  }
  
  return changes
}

// Component to display a single change in human-readable format
function ChangeRow({ field, oldValue, newValue }: { field: string; oldValue: any; newValue: any }) {
  const fieldLabel = getFieldLabel(field)
  
  // Special formatting for certain fields
  if (field === 'category') {
    return (
      <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm font-medium text-gray-600 w-1/3">{fieldLabel}</span>
        <div className="flex items-center gap-2 w-2/3">
          <span className="text-sm text-gray-500">{getCategoryDisplay(oldValue)}</span>
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <span className="text-sm font-medium text-blue-600">{getCategoryDisplay(newValue)}</span>
        </div>
      </div>
    )
  }
  
  if (field === 'verification_status') {
    const oldStatus = getStatusDisplay(oldValue)
    const newStatus = getStatusDisplay(newValue)
    return (
      <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm font-medium text-gray-600 w-1/3">{fieldLabel}</span>
        <div className="flex items-center gap-2 w-2/3">
          <span className={`px-2 py-0.5 rounded-full text-xs ${oldStatus.color}`}>{oldStatus.label}</span>
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <span className={`px-2 py-0.5 rounded-full text-xs ${newStatus.color}`}>{newStatus.label}</span>
        </div>
      </div>
    )
  }
  
  if (field === 'priority') {
    const oldPriority = getPriorityDisplay(oldValue)
    const newPriority = getPriorityDisplay(newValue)
    return (
      <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm font-medium text-gray-600 w-1/3">{fieldLabel}</span>
        <div className="flex items-center gap-2 w-2/3">
          <span className={`px-2 py-0.5 rounded-full text-xs ${oldPriority.color}`}>{oldPriority.label}</span>
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <span className={`px-2 py-0.5 rounded-full text-xs ${newPriority.color}`}>{newPriority.label}</span>
        </div>
      </div>
    )
  }
  
  if (field === 'source_url') {
    return (
      <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm font-medium text-gray-600 w-1/3">{fieldLabel}</span>
        <div className="flex flex-col gap-1 w-2/3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Old:</span>
            <a href={oldValue} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gold-600 truncate max-w-[300px]">
              {oldValue || '—'}
            </a>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">New:</span>
            <a href={newValue} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 truncate max-w-[300px]">
              {newValue || '—'}
            </a>
          </div>
        </div>
      </div>
    )
  }
  
  if (field === 'confidence_score') {
    return (
      <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm font-medium text-gray-600 w-1/3">{fieldLabel}</span>
        <div className="flex items-center gap-2 w-2/3">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${oldValue * 100}%` }}></div>
          </div>
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${newValue * 100}%` }}></div>
          </div>
          <span className="text-xs text-gray-500 ml-1">{Math.round(newValue * 100)}%</span>
        </div>
      </div>
    )
  }
  
  // Default display for other fields
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-600 w-1/3">{fieldLabel}</span>
      <div className="flex items-center gap-2 w-2/3">
        <span className="text-sm text-gray-500 line-through decoration-gray-300">{formatValue(oldValue, field)}</span>
        <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <span className="text-sm font-medium text-blue-600">{formatValue(newValue, field)}</span>
      </div>
    </div>
  )
}

// Component for Create action (show what was added)
function CreateDetails({ data }: { data: any }) {
  const importantFields = ['state_code', 'claim', 'category', 'source_name', 'source_url']
  
  return (
    <div className="space-y-3">
      <p className="text-sm text-green-600 font-medium">New record created:</p>
      <div className="bg-green-50 rounded-lg p-3 space-y-2">
        {importantFields.map(field => {
          if (data[field]) {
            const value = formatValue(data[field], field)
            if (field === 'category') {
              return (
                <div key={field} className="flex justify-between">
                  <span className="text-sm text-gray-600">{getFieldLabel(field)}:</span>
                  <span className="text-sm font-medium">{getCategoryDisplay(data[field])}</span>
                </div>
              )
            }
            if (field === 'source_url') {
              return (
                <div key={field} className="flex justify-between">
                  <span className="text-sm text-gray-600">{getFieldLabel(field)}:</span>
                  <a href={data[field]} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 truncate max-w-[300px]">
                    {data[field]}
                  </a>
                </div>
              )
            }
            return (
              <div key={field} className="flex justify-between">
                <span className="text-sm text-gray-600">{getFieldLabel(field)}:</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

// Component for Delete action (show what was removed)
function DeleteDetails({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-red-600 font-medium">Record deleted:</p>
      <div className="bg-red-50 rounded-lg p-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">State:</span>
          <span className="text-sm font-medium">{data.state_code || data.state || '—'}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-sm text-gray-600">Title/Claim:</span>
          <span className="text-sm font-medium">{data.title || data.claim || '—'}</span>
        </div>
      </div>
    </div>
  )
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filters, setFilters] = useState({
    table: '',
    action: ''
  })
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch audit log
  const fetchAuditLog = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.table) params.append('table', filters.table)
      if (filters.action) params.append('action', filters.action)
      params.append('limit', pagination.limit.toString())
      params.append('offset', pagination.offset.toString())

      const res = await fetch(`/api/admin/regulatory/audit?${params}`)
      const data = await res.json()
      setEntries(data.data || [])
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }))
    } catch (error) {
      console.error('Error fetching audit log:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLog()
  }, [filters, pagination.offset])

  // Action badge component
  const ActionBadge = ({ action }: { action: string }) => {
    const option = ACTION_OPTIONS.find(a => a.value === action)
    const Icon = option?.icon || Edit
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${option?.color || 'bg-gray-100'}`}>
        <Icon className="w-3 h-3" />
        {option?.label || action}
      </span>
    )
  }

  // Table name badge
  const TableBadge = ({ table }: { table: string }) => {
    const option = TABLE_OPTIONS.find(t => t.value === table)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        {option?.label || table}
      </span>
    )
  }

  // Filtered entries
  const filteredEntries = entries.filter(entry =>
    entry.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.changed_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Audit Log</h1>
          <p className="text-gray-500 mt-1">Complete change history with human-readable format</p>
        </div>
        <button
          onClick={fetchAuditLog}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Changes</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <History className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Updates</p>
              <p className="text-2xl font-bold text-blue-600">
                {entries.filter(e => e.action === 'UPDATE').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Creates</p>
              <p className="text-2xl font-bold text-green-600">
                {entries.filter(e => e.action === 'CREATE').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Deletes</p>
              <p className="text-2xl font-bold text-red-600">
                {entries.filter(e => e.action === 'DELETE').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by table, action, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
          <select
            value={filters.table}
            onChange={(e) => setFilters({ ...filters, table: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Tables</option>
            {TABLE_OPTIONS.map(table => (
              <option key={table.value} value={table.value}>{table.label}</option>
            ))}
          </select>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">All Actions</option>
            {ACTION_OPTIONS.map(action => (
              <option key={action.value} value={action.value}>{action.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFilters({ table: '', action: '' })}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading audit log...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No audit entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEntries.map((entry) => {
                  const changes = getChangedFields(entry.old_data, entry.new_data)
                  const summary = changes.length > 0 
                    ? changes.map(c => getFieldLabel(c.field)).join(', ')
                    : entry.reason || 'No details'
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(entry.changed_at).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {entry.changed_by_name || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <TableBadge table={entry.table_name} />
                      </td>
                      <td className="px-6 py-4">
                        <ActionBadge action={entry.action} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500 max-w-md truncate">
                          {summary}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedEntry(entry)
                            setShowDetailModal(true)
                          }}
                          className="p-1 text-gray-400 hover:text-gold-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredEntries.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                disabled={pagination.offset === 0}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal - Human Readable Version */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5" />
                Audit Entry Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b mb-4">
              <div>
                <p className="text-xs text-gray-500">Timestamp</p>
                <p className="text-sm font-medium">{new Date(selectedEntry.changed_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">User</p>
                <p className="text-sm font-medium">{selectedEntry.changed_by_name || 'System'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Table</p>
                <TableBadge table={selectedEntry.table_name} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Action</p>
                <ActionBadge action={selectedEntry.action} />
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Record ID</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono block overflow-x-auto">
                  {selectedEntry.record_id}
                </code>
              </div>
              {selectedEntry.reason && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Reason</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">{selectedEntry.reason}</p>
                </div>
              )}
            </div>

            {/* Changes - Human Readable */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-400" />
                Changes Made
              </p>
              
              {selectedEntry.action === 'CREATE' && selectedEntry.new_data && (
                <CreateDetails data={selectedEntry.new_data} />
              )}
              
              {selectedEntry.action === 'DELETE' && selectedEntry.old_data && (
                <DeleteDetails data={selectedEntry.old_data} />
              )}
              
              {selectedEntry.action === 'UPDATE' && selectedEntry.old_data && selectedEntry.new_data && (() => {
                const changes = getChangedFields(selectedEntry.old_data, selectedEntry.new_data)
                if (changes.length === 0) {
                  return <p className="text-sm text-gray-500">No significant changes detected</p>
                }
                return (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {changes.map(change => (
                      <ChangeRow 
                        key={change.field}
                        field={change.field}
                        oldValue={change.oldValue}
                        newValue={change.newValue}
                      />
                    ))}
                  </div>
                )
              })()}
              
              {selectedEntry.action !== 'CREATE' && selectedEntry.action !== 'DELETE' && selectedEntry.action !== 'UPDATE' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{selectedEntry.reason || 'Action recorded'}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 bg-gold-600 text-white py-2 rounded-lg hover:bg-gold-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
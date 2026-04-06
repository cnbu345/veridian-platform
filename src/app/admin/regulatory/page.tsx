// src/app/admin/regulatory/page.tsx
// Main Regulatory Dashboard - Attorney Home Page

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  FileText,
  PlusCircle,
  TrendingUp,
  Building2,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Bell,
  Calendar,
  XCircle
} from 'lucide-react'

// Types
interface DashboardStats {
  stats: {
    pendingUpdates: number
    pendingReviews: number
    totalLegislation: number
    enactedLegislation: number
    totalEnforcement: number
    recentEnforcement: number
    statesWithChanges: number
  }
  priorityBreakdown: {
    critical: number
    high: number
    medium: number
    low: number
  }
  recentNotes: Array<{
    id: string
    title: string
    content: string
    state_code: string
    created_by_user: { full_name: string }
    created_at: string
  }>
}

interface PendingUpdate {
  id: string
  state_code: string
  title: string
  description: string
  category: string
  priority: string
  source_name: string
  source_url: string
  effective_date: string
  created_at: string
}

interface RecentBill {
  id: string
  state_code: string
  bill_number: string
  title: string
  status: string
  introduced_date: string
  effective_date: string
}

export default function RegulatoryDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([])
  const [recentBills, setRecentBills] = useState<RecentBill[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', state_code: '' })
  const [submittingNote, setSubmittingNote] = useState(false)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/regulatory/stats')
      const statsData = await statsRes.json()
      setStats(statsData)

      // Fetch pending updates
      const updatesRes = await fetch('/api/admin/regulatory/updates?status=pending_review&limit=5')
      const updatesData = await updatesRes.json()
      setPendingUpdates(updatesData.data || [])

      // Fetch recent legislation
      const billsRes = await fetch('/api/admin/regulatory/legislation?limit=5')
      const billsData = await billsRes.json()
      setRecentBills(billsData.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle approve/reject
  const handleUpdateAction = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const res = await fetch(`/api/admin/regulatory/updates/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })

      if (res.ok) {
        // Refresh dashboard
        fetchDashboardData()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating:', error)
      alert('Failed to process update')
    }
  }

  // Handle add note
  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content) {
      alert('Please fill in title and content')
      return
    }

    setSubmittingNote(true)
    try {
      const res = await fetch('/api/admin/regulatory/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      })

      if (res.ok) {
        setShowAddNote(false)
        setNewNote({ title: '', content: '', state_code: '' })
        fetchDashboardData()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Failed to add note')
    } finally {
      setSubmittingNote(false)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-gray-100 text-gray-600 border-gray-200'
    }
    const label = {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[priority as keyof typeof colors] || colors.medium}`}>
        {label[priority as keyof typeof label] || priority}
      </span>
    )
  }

  // Status badge for legislation
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      introduced: 'bg-blue-100 text-blue-800',
      in_committee: 'bg-yellow-100 text-yellow-800',
      passed_house: 'bg-purple-100 text-purple-800',
      passed_senate: 'bg-purple-100 text-purple-800',
      enacted: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      vetoed: 'bg-gray-100 text-gray-800'
    }
    const labels: Record<string, string> = {
      introduced: 'Introduced',
      in_committee: 'In Committee',
      passed_house: 'Passed House',
      passed_senate: 'Passed Senate',
      enacted: 'Enacted',
      failed: 'Failed',
      vetoed: 'Vetoed'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading regulatory dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Regulatory Management Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage state regulations, track legislation, and review pending updates</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/regulatory/content" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Reviews</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.stats.pendingReviews || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {stats?.priorityBreakdown.critical > 0 && (
              <span className="text-xs text-red-600">🔴 {stats.priorityBreakdown.critical} critical</span>
            )}
            {stats?.priorityBreakdown.high > 0 && (
              <span className="text-xs text-orange-600">🟠 {stats.priorityBreakdown.high} high</span>
            )}
          </div>
        </Link>

        <Link href="/admin/regulatory/updates" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Updates</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.stats.pendingUpdates || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Scale className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats?.stats.statesWithChanges || 0} states have pending changes</p>
        </Link>

        <Link href="/admin/regulatory/legislation" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Bills Tracked</p>
              <p className="text-3xl font-bold text-green-600">{stats?.stats.totalLegislation || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats?.stats.enactedLegislation || 0} enacted</p>
        </Link>

        <Link href="/admin/regulatory/enforcement" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Enforcement Actions</p>
              <p className="text-3xl font-bold text-red-600">{stats?.stats.totalEnforcement || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <Gavel className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats?.stats.recentEnforcement || 0} in last 90 days</p>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pending Updates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Updates Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                <h2 className="font-semibold text-gray-800">Pending Regulatory Updates</h2>
              </div>
              <Link href="/admin/regulatory/updates" className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingUpdates.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p>No pending updates</p>
                  <p className="text-sm">All regulatory data is up to date</p>
                </div>
              ) : (
                pendingUpdates.map((update) => (
                  <div key={update.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-0.5 rounded">
                          {update.state_code}
                        </span>
                        <PriorityBadge priority={update.priority} />
                        <span className="text-xs text-gray-400 capitalize">{update.category}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateAction(update.id, 'approve')}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:')
                            if (reason) handleUpdateAction(update.id, 'reject', reason)
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1">{update.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{update.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Source: {update.source_name}</span>
                      {update.source_url && (
                        <a
                          href={update.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gold-600 hover:text-gold-700"
                        >
                          View Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {update.effective_date && (
                        <span>Effective: {new Date(update.effective_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Legislation Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-800">Recent Legislation</h2>
              </div>
              <Link href="/admin/regulatory/legislation" className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1">
                Add Bill <PlusCircle className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentBills.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>No legislation tracked yet</p>
                  <button
                    onClick={() => router.push('/admin/regulatory/legislation')}
                    className="mt-2 text-gold-600 hover:text-gold-700 text-sm"
                  >
                    Add your first bill →
                  </button>
                </div>
              ) : (
                recentBills.map((bill) => (
                  <div key={bill.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">
                            {bill.state_code}
                          </span>
                          <span className="font-mono text-sm font-medium">{bill.bill_number}</span>
                          <StatusBadge status={bill.status} />
                        </div>
                        <h3 className="font-medium text-gray-800 text-sm">{bill.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Introduced: {new Date(bill.introduced_date).toLocaleDateString()}</span>
                          {bill.effective_date && (
                            <span>Effective: {new Date(bill.effective_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/admin/regulatory/legislation?edit=${bill.id}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Notes & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl shadow-sm p-5 text-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Compliance Health
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Verified Facts</span>
                  <span>35/35</span>
                </div>
                <div className="w-full bg-navy-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>States with Coverage</span>
                  <span>50/50</span>
                </div>
                <div className="w-full bg-navy-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pending Review</span>
                  <span>{stats?.priorityBreakdown.critical || 0} critical</span>
                </div>
                <div className="w-full bg-navy-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(((stats?.priorityBreakdown.critical || 0) / 35) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-gold-600" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/regulatory/legislation"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm">Add New Legislation</span>
                <PlusCircle className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/regulatory/enforcement"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm">Log Enforcement Action</span>
                <Gavel className="w-4 h-4 text-gray-400" />
              </Link>
              <button
                onClick={() => setShowAddNote(true)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-sm">Add Internal Note</span>
                <FileText className="w-4 h-4 text-gray-400" />
              </button>
              <Link
                href="/admin/regulatory/content"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm">Review Content Library</span>
                <Building2 className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Recent Internal Notes
              </h3>
              <Link
                href="/admin/regulatory/notes-manager"
                className='text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1'
              >
              View all <ChevronRight className='w-3 h-3'/>
              </Link>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {stats?.recentNotes?.length === 0 ? (
                <div className="p-5 text-center text-gray-400 text-sm">
                  <p>No notes yet</p>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="mt-2 text-gold-600 hover:text-gold-700"
                  >
                    Add your first note →
                  </button>
                </div>
              ) : (
                stats?.recentNotes?.map((note) => (
                  <div key={note.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {note.state_code && (
                            <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{note.state_code}</span>
                          )}
                          <span className="text-xs text-gray-400">
                            {note.created_by_user?.full_name || 'System'}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm text-gray-800">{note.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{note.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Internal Note</h3>
              <button
                onClick={() => setShowAddNote(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Note title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State (optional)</label>
                <input
                  type="text"
                  value={newNote.state_code}
                  onChange={(e) => setNewNote({ ...newNote, state_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="NY, CA, TX..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  placeholder="Add your notes here..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddNote}
                  disabled={submittingNote}
                  className="flex-1 bg-gold-600 text-white py-2 rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50"
                >
                  {submittingNote ? 'Saving...' : 'Save Note'}
                </button>
                <button
                  onClick={() => setShowAddNote(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
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
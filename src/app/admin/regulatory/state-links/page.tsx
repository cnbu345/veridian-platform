// src/app/admin/regulatory/state-links/page.tsx
// Regulator Links Manager - Update state regulator URLs

'use client'

import { useEffect, useState } from 'react'
import {
  Building2,
  Search,
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Edit,
  Globe,
  FileText,
  Gavel,
  AlertCircle
} from 'lucide-react'

// Types
interface StateRegulatorLink {
  state_code: string
  state_name: string
  regulator_name: string
  website_url: string
  license_page_url: string | null
  enforcement_page_url: string | null
  created_at: string
  updated_at: string
}

// State options
const STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
]

export default function RegulatorLinksManagerPage() {
  const [links, setLinks] = useState<StateRegulatorLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    state_code: '',
    state_name: '',
    regulator_name: '',
    website_url: '',
    license_page_url: '',
    enforcement_page_url: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null)

  // Fetch regulator links
  const fetchLinks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/regulatory/state-links')
      const data = await res.json()
      setLinks(data)
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update a single link
  const handleUpdate = async () => {
    if (!editForm.state_code) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/regulatory/state-links/${editForm.state_code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regulator_name: editForm.regulator_name,
          website_url: editForm.website_url,
          license_page_url: editForm.license_page_url || null,
          enforcement_page_url: editForm.enforcement_page_url || null
        })
      })

      if (res.ok) {
        setSyncStatus({ success: true, message: `Updated ${editForm.state_name} successfully` })
        setEditingId(null)
        fetchLinks()
      } else {
        const error = await res.json()
        setSyncStatus({ success: false, message: error.error || 'Update failed' })
      }
    } catch (error) {
      console.error('Error updating link:', error)
      setSyncStatus({ success: false, message: 'Failed to update' })
    } finally {
      setSaving(false)
      setTimeout(() => setSyncStatus(null), 3000)
    }
  }

  // Sync all facts with updated regulator links
  const handleSyncFacts = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/regulatory/state-links/sync', {
        method: 'POST'
      })

      const data = await res.json()
      setSyncStatus({ success: true, message: data.message || `Updated ${data.updatedCount} facts` })
      setTimeout(() => setSyncStatus(null), 3000)
    } catch (error) {
      console.error('Error syncing facts:', error)
      setSyncStatus({ success: false, message: 'Failed to sync facts' })
    } finally {
      setSaving(false)
    }
  }

  // Start editing a link
  const startEdit = (link: StateRegulatorLink) => {
    setEditingId(link.state_code)
    setEditForm({
      state_code: link.state_code,
      state_name: link.state_name,
      regulator_name: link.regulator_name,
      website_url: link.website_url,
      license_page_url: link.license_page_url || '',
      enforcement_page_url: link.enforcement_page_url || ''
    })
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  // Filter links by search
  const filteredLinks = links.filter(link =>
    link.state_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.state_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.regulator_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Test URL function
  const testUrl = (url: string) => {
    if (!url) return
    window.open(url, '_blank')
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Regulator Links Manager</h1>
          <p className="text-gray-500 mt-1">Update state regulator website URLs - changes will appear in all regulatory pages</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSyncFacts}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            Sync All Facts
          </button>
          <button
            onClick={fetchLinks}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Message */}
      {syncStatus && (
        <div className={`mb-4 p-4 rounded-lg ${syncStatus.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            {syncStatus.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {syncStatus.message}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">How This Works</h3>
            <p className="text-sm text-blue-700 mt-1">
              Updating a state's regulator links here will automatically update the <strong>Actions column</strong> in the Content Library.
              Use the <strong>Sync All Facts</strong> button to also update the <strong>Source column</strong> for all facts in that state.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by state name, code, or regulator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading regulator links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No regulator links found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regulator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Page</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enforcement</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLinks.map((link) => (
                  <tr key={link.state_code} className="hover:bg-gray-50 transition-colors">
                    {editingId === link.state_code ? (
                      // Edit Mode
                      <>
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-medium">{link.state_code}</div>
                          <div className="text-xs text-gray-500">{link.state_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.regulator_name}
                            onChange={(e) => setEditForm({ ...editForm, regulator_name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="url"
                            value={editForm.website_url}
                            onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="url"
                            value={editForm.license_page_url}
                            onChange={(e) => setEditForm({ ...editForm, license_page_url: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="url"
                            value={editForm.enforcement_page_url}
                            onChange={(e) => setEditForm({ ...editForm, enforcement_page_url: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={handleUpdate}
                              disabled={saving}
                              className="p-1 text-green-600 hover:text-green-700 transition-colors"
                              title="Save"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Cancel"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-medium">{link.state_code}</div>
                          <div className="text-xs text-gray-500">{link.state_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{link.regulator_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          {link.website_url && (
                            <button
                              onClick={() => testUrl(link.website_url)}
                              className="text-gold-600 hover:text-gold-700 text-sm flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" />
                              Visit
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {link.license_page_url ? (
                            <button
                              onClick={() => testUrl(link.license_page_url!)}
                              className="text-gold-600 hover:text-gold-700 text-sm flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              License Page
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {link.enforcement_page_url ? (
                            <button
                              onClick={() => testUrl(link.enforcement_page_url!)}
                              className="text-gold-600 hover:text-gold-700 text-sm flex items-center gap-1"
                            >
                              <Gavel className="w-3 h-3" />
                              Enforcement
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => startEdit(link)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <h3 className="font-medium text-gray-700 mb-2">Quick Tips</h3>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Click <strong>Edit</strong> to update a state's regulator URLs</li>
          <li>• After updating, the <strong>Actions column</strong> in Content Library will automatically show the new links</li>
          <li>• Click <strong>Sync All Facts</strong> to also update the <strong>Source column</strong> for all facts in updated states</li>
          <li>• You can test any link by clicking the "Visit", "License Page", or "Enforcement" buttons</li>
        </ul>
      </div>
    </div>
  )
}
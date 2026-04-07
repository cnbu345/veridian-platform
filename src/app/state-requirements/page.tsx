// src/app/state-requirements/page.tsx
// Free Public State Licensing Requirements Dashboard

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  MapPin,
  Search,
  Filter,
  ExternalLink,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Building2,
  DollarSign,
  Scale,
  ChevronDown,
  ChevronUp,
  Loader2,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'

// Dynamically import the map to avoid SSR issues
const USMap = dynamic(() => import('@/components/ui/USMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] bg-gray-100 rounded-xl flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-gold-600 animate-spin" />
      <span className="ml-2 text-gray-500">Loading map...</span>
    </div>
  )
})

// Types
interface StateRegulation {
  state_code: string
  state_name: string
  crypto_regulations: string
  tax_treatment: string
  regulatory_climate: 'friendly' | 'moderate' | 'strict' | 'unknown'
  license_required: 'none' | 'mtl' | 'bitlicense' | 'dfpi' | 'varies'
  license_description: string
  enforcement_history: string
  pending_legislation: string
  regulator_name: string
  regulator_phone: string | null
  regulator_email: string | null
  regulator_website: string | null
  notes: string
}

export default function StateRequirementsPage() {
  const [states, setStates] = useState<StateRegulation[]>([])
  const [statesMap, setStatesMap] = useState<Map<string, any>>(new Map())
  const [selectedState, setSelectedState] = useState<StateRegulation | null>(null)
  const [hoveredState, setHoveredState] = useState<StateRegulation | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    climate: '',
    license: ''
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')
  const [leadSubmitted, setLeadSubmitted] = useState(false)

  // Fetch states data
  useEffect(() => {
    fetchStates()
  }, [])

  const fetchStates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/public/states')
      const data = await res.json()
      setStates(data.states || [])
      
      // Build map for quick lookup
      const map = new Map()
      data.states?.forEach((state: StateRegulation) => {
        map.set(state.state_code, {
          climate: state.regulatory_climate,
          license_required: state.license_required,
          state_name: state.state_name
        })
      })
      setStatesMap(map)
    } catch (error) {
      console.error('Error fetching states:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter states for list view
  const filteredStates = states.filter(state => {
    const matchesSearch = state.state_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.state_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClimate = !filters.climate || state.regulatory_climate === filters.climate
    const matchesLicense = !filters.license || state.license_required === filters.license
    return matchesSearch && matchesClimate && matchesLicense
  })

  // Climate badge component
  const ClimateBadge = ({ climate }: { climate: string }) => {
    const config = {
      friendly: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Friendly' },
      moderate: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Moderate' },
      strict: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Strict' },
      unknown: { icon: AlertTriangle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Unknown' }
    }
    const c = config[climate as keyof typeof config] || config.unknown
    const Icon = c.icon
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", c.bg, c.color)}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    )
  }

  // License badge
  const LicenseBadge = ({ license }: { license: string }) => {
    const config: Record<string, { label: string; color: string }> = {
      none: { label: 'No License Required', color: 'text-green-600 bg-green-50' },
      mtl: { label: 'Money Transmitter License', color: 'text-blue-600 bg-blue-50' },
      bitlicense: { label: 'BitLicense', color: 'text-purple-600 bg-purple-50' },
      dfpi: { label: 'DFPI License', color: 'text-indigo-600 bg-indigo-50' },
      varies: { label: 'Varies by Activity', color: 'text-orange-600 bg-orange-50' }
    }
    const c = config[license] || { label: license, color: 'text-gray-600 bg-gray-50' }
    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", c.color)}>
        {c.label}
      </span>
    )
  }

  // Handle map hover
  const handleMapHover = (stateCode: string | null, stateData: any) => {
    if (stateCode && stateData) {
      const fullState = states.find(s => s.state_code === stateCode)
      setHoveredState(fullState || null)
    } else {
      setHoveredState(null)
    }
  }

  // Handle map click
  const handleMapClick = (stateCode: string | null, stateData: any) => {
    if (stateCode && stateData) {
      const fullState = states.find(s => s.state_code === stateCode)
      setSelectedState(fullState || null)
      // Scroll to details on mobile
      if (window.innerWidth < 768) {
        setTimeout(() => {
          document.getElementById('state-details')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }

  // Handle lead capture
  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/public/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail,
          source: 'state_dashboard',
          interested_state: selectedState?.state_code,
          timestamp: new Date().toISOString()
        })
      })
      
      if (res.ok) {
        setLeadSubmitted(true)
        setTimeout(() => {
          setShowLeadModal(false)
          setLeadSubmitted(false)
          setLeadEmail('')
        }, 2000)
      }
    } catch (error) {
      console.error('Error capturing lead:', error)
    }
  }

  // State detail card component
  const StateDetailCard = ({ state, isHover = false, compact = false }: { state: StateRegulation; isHover?: boolean; compact?: boolean }) => (
    <div className={cn(
      "bg-white rounded-xl border p-4 transition-all",
      isHover ? "border-gold-300 shadow-md" : "border-gray-100 shadow-sm"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-navy-900">{state.state_code}</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 text-sm">{state.state_name}</span>
        </div>
        <ClimateBadge climate={state.regulatory_climate} />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <Scale className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-gray-500">License:</span>{' '}
            <LicenseBadge license={state.license_required} />
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <span className="text-gray-600">{state.tax_treatment}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <span className="text-gray-600 text-sm">{state.regulator_name}</span>
        </div>
      </div>

      {/* Expanded details - only for non-hover, non-compact */}
      {!isHover && !compact && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Regulations:</span> {state.crypto_regulations}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">License Details:</span> {state.license_description}
          </p>
          {state.pending_legislation && (
            <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              <span className="font-medium">⚠️ Pending:</span> {state.pending_legislation}
            </p>
          )}
          {state.regulator_website && (
            <a
              href={state.regulator_website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700"
            >
              Visit Regulator Website <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => {
              setSelectedState(state)
              setShowLeadModal(true)
            }}
            className="w-full mt-2 px-3 py-1.5 bg-gold-600 text-white text-sm rounded-lg hover:bg-gold-700 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Get Full Report →
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" suppressHydrationWarning>
      {/* Hero Section */}
      <div className="mt-12 bg-navy-900 text-white py-8 sm:py-12">
        <div className="pt-10 container-custom max-w-7xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            State Licensing Requirements
          </h1>
          <p className="text-sm sm:text-base text-navy-200 max-w-2xl">
            Interactive map showing regulatory climate across all 50 states. 
            Click any state for detailed licensing requirements.
          </p>
        </div>
      </div>

      <div className="container-custom max-w-7xl mx-auto px-4 py-6 sm:py-8">

        {/* Interactive Map Section - Responsive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-navy-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold-600" />
            Regulatory Map
            </h2>
            <div className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
            Hover or click any state
            </div>
        </div>
        
        {/* Remove the max-w-2xl constraint to allow full width on mobile */}
        <div className="w-full overflow-x-auto">
            <USMap
            statesData={statesMap}
            onStateHover={handleMapHover}
            onStateClick={handleMapClick}
            selectedState={selectedState?.state_code || null}
            />
        </div>
        
        {/* Hover Preview Card - responsive */}
        {hoveredState && !selectedState && (
            <div className="mt-3 w-full">
            <StateDetailCard state={hoveredState} isHover compact />
            </div>
        )}
        </div>

        {/* Selected State Details */}
        {selectedState && (
          <div id="state-details" className="mb-6 scroll-mt-16">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-navy-900">Selected State</h2>
              <button
                onClick={() => setSelectedState(null)}
                className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            </div>
            <div className="max-w-2xl mx-auto">
              <StateDetailCard state={selectedState} />
            </div>
          </div>
        )}

        {/* Search and Filters - Responsive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between sm:hidden mb-3"
          >
            <span className="text-sm font-medium text-gray-700">Filters</span>
            <Filter className="w-4 h-4 text-gray-400" />
          </button>
          
          <div className={cn(mobileMenuOpen ? 'flex' : 'hidden', 'sm:flex flex-wrap gap-3')}>
            <div className="flex-1 min-w-[180px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
            <select
              value={filters.climate}
              onChange={(e) => setFilters({ ...filters, climate: e.target.value })}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">All Climates</option>
              <option value="friendly">Friendly</option>
              <option value="moderate">Moderate</option>
              <option value="strict">Strict</option>
            </select>
            <select
              value={filters.license}
              onChange={(e) => setFilters({ ...filters, license: e.target.value })}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">All License Types</option>
              <option value="none">No License Required</option>
              <option value="mtl">Money Transmitter License</option>
              <option value="bitlicense">BitLicense</option>
              <option value="dfpi">DFPI License</option>
              <option value="varies">Varies by Activity</option>
            </select>
            <button
              onClick={() => setFilters({ climate: '', license: '' })}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* All States Quick Reference Table - Responsive */}
        {/* All States Quick Reference Table - Fully Responsive with Horizontal Scroll */}
        <div className="mt-6">
            <h2 className="text-base sm:text-lg font-semibold text-navy-900 mb-3">All States Reference</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Horizontal scroll wrapper for mobile - allows scrolling to see all columns */}
                <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[650px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">State</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Climate</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">License</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Tax</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Regulator</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                            Loading...
                        </td>
                        </tr>
                    ) : (
                        filteredStates.map((state) => (
                        <tr
                            key={state.state_code}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedState(state)}
                        >
                            <td className="px-3 py-2 whitespace-nowrap">
                            <span className="font-mono font-medium text-sm">{state.state_code}</span>
                            <span className="text-gray-400 ml-1 text-xs hidden sm:inline">{state.state_name}</span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                            <ClimateBadge climate={state.regulatory_climate} />
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                            <LicenseBadge license={state.license_required} />
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                            {state.tax_treatment}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                            {state.regulator_name}
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            
            {/* Mobile hint - shows on small screens */}
            <div className="block md:hidden text-center text-xs text-gray-400 py-2 border-t border-gray-100 bg-gray-50">
            ← Scroll sideways to see all columns →
            </div>
        </div>
        {filteredStates.length > 50 && (
            <p className="text-center text-xs text-gray-400 mt-2">
            Showing first 50 states. Use search to find specific states.
            </p>
        )}
        </div>

        {/* Call to Action Banner - Responsive */}
        <div className="mt-8 bg-gradient-to-r from-navy-800 to-navy-900 rounded-xl p-5 text-center text-white">
          <h3 className="text-base sm:text-lg font-bold mb-1">Need a Complete Compliance Report?</h3>
          <p className="text-navy-200 text-sm mb-3 max-w-2xl mx-auto">
            Get a comprehensive 5-page location-intelligent compliance report with actionable recommendations.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/pricing"
              className="px-4 py-1.5 bg-gold-600 text-white text-sm rounded-lg font-semibold hover:bg-gold-700 transition-colors"
            >
              View Pricing
            </Link>
            <Link
              href="/contact"
              className="px-4 py-1.5 bg-white/10 text-white text-sm rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Schedule Consultation
            </Link>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal - Responsive */}
      {showLeadModal && selectedState && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 mx-4">
            <div className="text-center mb-5">
              <FileText className="w-10 h-10 text-gold-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-navy-900">Get Your Report</h3>
              <p className="text-sm text-gray-600 mt-1">
                Full compliance report for {selectedState.state_name}
              </p>
            </div>
            
            {leadSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-700">Thanks! We'll send your report shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleLeadCapture} className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-gold-600 text-white text-sm rounded-lg hover:bg-gold-700 transition-colors"
                >
                  Send Report
                </button>
                <p className="text-xs text-gray-400 text-center">
                  We'll send occasional updates. Unsubscribe anytime.
                </p>
              </form>
            )}
            
            <button
              onClick={() => {
                setShowLeadModal(false)
                setLeadSubmitted(false)
              }}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
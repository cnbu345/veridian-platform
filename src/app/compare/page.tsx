// src/app/compare/page.tsx
// State Comparison Tool - Compare up to 3 states side-by-side
// With stylish grouped filters

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Scale,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Building2,
  DollarSign,
  ExternalLink,
  FileText,
  Download,
  Plus,
  X,
  Loader2,
  TrendingUp,
  Award,
  ArrowRight,
  Zap,
  Shield,
  Leaf,
  Flame
} from 'lucide-react'

// Types
interface StateOption {
  code: string
  name: string
  climate: string
  tax_treatment?: string
  license_required?: string
}

interface ComparisonState {
  state_code: string
  state_name: string
  climate: string
  license_required: string
  license_description: string
  tax_treatment: string
  regulator_name: string
  regulator_link: {
    website_url: string
    license_page_url: string | null
  } | null
  crypto_regulations: string
  enforcement_history: string
  pending_legislation: string
  notes: string
}

// All states list with additional data for filtering
const ALL_STATES: StateOption[] = [
  { code: 'AL', name: 'Alabama', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'AK', name: 'Alaska', climate: 'friendly', tax_treatment: 'No state income tax', license_required: 'mtl' },
  { code: 'AZ', name: 'Arizona', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'AR', name: 'Arkansas', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'CA', name: 'California', climate: 'strict', tax_treatment: 'Income tax applies', license_required: 'dfpi' },
  { code: 'CO', name: 'Colorado', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'CT', name: 'Connecticut', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'DE', name: 'Delaware', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'FL', name: 'Florida', climate: 'friendly', tax_treatment: 'No state income tax', license_required: 'none' },
  { code: 'GA', name: 'Georgia', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'HI', name: 'Hawaii', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'ID', name: 'Idaho', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'IL', name: 'Illinois', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'IN', name: 'Indiana', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'IA', name: 'Iowa', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'KS', name: 'Kansas', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'KY', name: 'Kentucky', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'LA', name: 'Louisiana', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'ME', name: 'Maine', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'MD', name: 'Maryland', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'MA', name: 'Massachusetts', climate: 'strict', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'MI', name: 'Michigan', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'MN', name: 'Minnesota', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'MS', name: 'Mississippi', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'MO', name: 'Missouri', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'MT', name: 'Montana', climate: 'friendly', tax_treatment: 'No sales tax', license_required: 'mtl' },
  { code: 'NE', name: 'Nebraska', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'NV', name: 'Nevada', climate: 'friendly', tax_treatment: 'No state income tax', license_required: 'none' },
  { code: 'NH', name: 'New Hampshire', climate: 'friendly', tax_treatment: 'No state income tax', license_required: 'mtl' },
  { code: 'NJ', name: 'New Jersey', climate: 'strict', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'NM', name: 'New Mexico', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'NY', name: 'New York', climate: 'strict', tax_treatment: 'Income tax applies', license_required: 'bitlicense' },
  { code: 'NC', name: 'North Carolina', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'ND', name: 'North Dakota', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'OH', name: 'Ohio', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'OK', name: 'Oklahoma', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'OR', name: 'Oregon', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'PA', name: 'Pennsylvania', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'RI', name: 'Rhode Island', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'SC', name: 'South Carolina', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'SD', name: 'South Dakota', climate: 'friendly', tax_treatment: 'No state income tax', license_required: 'none' },
  { code: 'TN', name: 'Tennessee', climate: 'friendly', tax_treatment: 'No state income tax', license_required: 'mtl' },
  { code: 'TX', name: 'Texas', climate: 'friendly', tax_treatment: 'No state income tax', license_required: 'none' },
  { code: 'UT', name: 'Utah', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'VT', name: 'Vermont', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'VA', name: 'Virginia', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'WA', name: 'Washington', climate: 'strict', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'WV', name: 'West Virginia', climate: 'moderate', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'WI', name: 'Wisconsin', climate: 'friendly', tax_treatment: 'Income tax applies', license_required: 'mtl' },
  { code: 'WY', name: 'Wyoming', climate: 'friendly', tax_treatment: 'No state income tax', license_required: 'none' }
]

const MAX_STATES = 3

// Filter preset definitions
const FILTER_PRESETS = [
  {
    id: 'friendly',
    name: 'Most Friendly',
    icon: Leaf,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    filter: (states: StateOption[]) => states.filter(s => s.climate === 'friendly')
  },
  {
    id: 'strict',
    name: 'Most Strict',
    icon: Flame,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    filter: (states: StateOption[]) => states.filter(s => s.climate === 'strict')
  },
  {
    id: 'no-tax',
    name: 'No Income Tax',
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    filter: (states: StateOption[]) => states.filter(s => s.tax_treatment?.includes('No state income tax'))
  },
  {
    id: 'no-license',
    name: 'No License Required',
    icon: Shield,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    filter: (states: StateOption[]) => states.filter(s => s.license_required === 'none')
  }
]

// Climate badge component
const ClimateBadge = ({ climate }: { climate: string }) => {
  const config = {
    friendly: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Friendly' },
    moderate: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Moderate' },
    strict: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Strict' }
  }
  const c = config[climate as keyof typeof config] || config.moderate
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.color}`}>
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
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>
      {c.label}
    </span>
  )
}

export default function ComparePage() {
  const [selectedStates, setSelectedStates] = useState<string[]>(['TX', 'FL', 'WY'])
  const [comparisonData, setComparisonData] = useState<ComparisonState[]>([])
  const [loading, setLoading] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')
  const [leadName, setLeadName] = useState('')
  const [leadCompany, setLeadCompany] = useState('')
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [recommendation, setRecommendation] = useState<string>('')

  // Apply filter preset
  const applyFilter = (presetId: string) => {
    const preset = FILTER_PRESETS.find(p => p.id === presetId)
    if (!preset) return
    
    const filteredStates = preset.filter(ALL_STATES)
    const topStates = filteredStates.slice(0, MAX_STATES).map(s => s.code)
    if (topStates.length >= 2) {
      setSelectedStates(topStates)
    }
  }

  // Add state to comparison
  const addState = (stateCode: string) => {
    if (selectedStates.length >= MAX_STATES) {
      alert(`You can compare up to ${MAX_STATES} states at once. Remove one to add another.`)
      return
    }
    if (!selectedStates.includes(stateCode)) {
      setSelectedStates([...selectedStates, stateCode])
    }
  }

  // Remove state from comparison
  const removeState = (stateCode: string) => {
    setSelectedStates(selectedStates.filter(s => s !== stateCode))
  }

  // Fetch comparison data
  const fetchComparison = async () => {
    if (selectedStates.length < 2) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/public/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stateCodes: selectedStates })
      })
      const data = await res.json()
      setComparisonData(data.states || [])
      
      // Generate recommendation
      generateRecommendation(data.states || [])
    } catch (error) {
      console.error('Error fetching comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate recommendation based on comparison
  const generateRecommendation = (states: ComparisonState[]) => {
    if (!states.length) return
    
    const friendlyStates = states.filter(s => s.climate === 'friendly')
    const noTaxStates = states.filter(s => s.tax_treatment.includes('No state income tax'))
    const noLicenseStates = states.filter(s => s.license_required === 'none')
    
    if (friendlyStates.length > 0) {
      const best = friendlyStates[0]
      setRecommendation(`${best.state_name} offers the most favorable regulatory environment with a ${best.climate} climate. ${best.tax_treatment} and ${best.license_required === 'none' ? 'no specific license requirement' : 'clear licensing framework'} make it an attractive option for digital asset businesses.`)
    } else if (noTaxStates.length > 0) {
      const best = noTaxStates[0]
      setRecommendation(`${best.state_name} stands out with ${best.tax_treatment.toLowerCase()}, which can significantly reduce operational costs.`)
    } else {
      setRecommendation(`Based on your selection, consider starting with states that have moderate regulatory requirements before expanding to stricter jurisdictions.`)
    }
  }

  useEffect(() => {
    fetchComparison()
  }, [selectedStates])

  // Handle lead capture
  const handleGetReport = () => {
    setShowLeadModal(true)
  }

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!leadEmail) {
        alert('Please enter your email address')
        return
    }
    
    setLeadSubmitted(true)
    
    try {
        console.log('📤 Submitting lead:', { email: leadEmail, name: leadName, company: leadCompany })
        
        const response = await fetch('/api/public/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: leadEmail,
            name: leadName,
            company_name: leadCompany,
            source: 'comparison_tool',
            interested_state: selectedStates.join(',')
        })
        })
        
        const data = await response.json()
        console.log('📥 Response:', data)
        
        if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
        }
        
        // Wait 2 seconds then redirect to pricing
        setTimeout(() => {
        window.location.href = '/pricing?utm_source=comparison&utm_medium=lead'
        }, 2000)
        
    } catch (error) {
        console.error('❌ Error submitting lead:', error)
        setLeadSubmitted(false)
        alert('Something went wrong. Please try again or contact us directly.')
    }
    }

  const availableStates = ALL_STATES.filter(s => !selectedStates.includes(s.code))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-navy-900 text-white py-12">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            State Comparison Tool
          </h1>
          <p className="text-lg text-navy-200 max-w-2xl">
            Compare licensing requirements, tax treatment, and regulatory climate across up to 3 states.
            Make informed decisions about where to operate.
          </p>
        </div>
      </div>

      <div className="container-custom max-w-7xl mx-auto px-4 py-8">
        {/* Stylish Filter Presets */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3 text-center">Quick select by category:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {FILTER_PRESETS.map((preset) => {
              const Icon = preset.icon
              return (
                <button
                  key={preset.id}
                  onClick={() => applyFilter(preset.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:shadow-md ${preset.bg} ${preset.border} ${preset.color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{preset.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* State Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-gold-600" />
            Select States to Compare (2-3 states)
          </h2>
          
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedStates.map(stateCode => {
              const state = ALL_STATES.find(s => s.code === stateCode)
              return (
                <div
                  key={stateCode}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-navy-50 rounded-lg"
                >
                  <span className="font-mono font-medium">{stateCode}</span>
                  <span className="text-sm text-gray-600">{state?.name}</span>
                  <button
                    onClick={() => removeState(stateCode)}
                    className="p-0.5 hover:bg-navy-100 rounded"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              )
            })}
            
            {selectedStates.length < MAX_STATES && (
              <div className="relative">
                <select
                  onChange={(e) => addState(e.target.value)}
                  value=""
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">+ Add state</option>
                  {availableStates.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.code} - {state.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <button
            onClick={fetchComparison}
            className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
          >
            Update Comparison
          </button>
        </div>

        {/* Comparison Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Loader2 className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading comparison data...</p>
          </div>
        ) : comparisonData.length >= 2 ? (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-36">Category</th>
                      {comparisonData.map(state => (
                        <th key={state.state_code} className="px-4 py-3 text-left text-sm font-semibold text-navy-900">
                          {state.state_code} - {state.state_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Regulatory Climate</td>
                      {comparisonData.map(state => (
                        <td key={state.state_code} className="px-4 py-3">
                          <ClimateBadge climate={state.climate} />
                        </td>
                      ))}
                    </tr>
                    
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">License Required</td>
                      {comparisonData.map(state => (
                        <td key={state.state_code} className="px-4 py-3">
                          <LicenseBadge license={state.license_required} />
                        </td>
                      ))}
                    </tr>
                    
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Tax Treatment</td>
                      {comparisonData.map(state => (
                        <td key={state.state_code} className="px-4 py-3">
                          <span className={`text-sm ${state.tax_treatment.includes('No state') ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                            {state.tax_treatment}
                          </span>
                        </td>
                      ))}
                    </tr>
                    
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Regulator</td>
                      {comparisonData.map(state => (
                        <td key={state.state_code} className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            {state.regulator_name}
                            {state.regulator_link?.website_url && (
                              <a
                                href={state.regulator_link.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gold-600 hover:text-gold-700"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    {comparisonData.some(s => s.pending_legislation) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">Pending Legislation</td>
                        {comparisonData.map(state => (
                          <td key={state.state_code} className="px-4 py-3 text-sm text-gray-600">
                            {state.pending_legislation || 'None pending'}
                          </td>
                        ))}
                      </tr>
                    )}
                    
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Enforcement History</td>
                      {comparisonData.map(state => (
                        <td key={state.state_code} className="px-4 py-3 text-sm text-gray-600">
                          {state.enforcement_history || 'Limited enforcement'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendation Section */}
            <div className="bg-gradient-to-r from-navy-50 to-white rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-gold-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">Our Recommendation</h3>
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleGetReport}
                className="px-6 py-3 bg-gold-600 text-white rounded-lg font-semibold hover:bg-gold-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Get Full Compliance Report
              </button>
              <Link
                href="/pricing"
                className="px-6 py-3 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View Pricing
              </Link>
            </div>
          </>
        ) : selectedStates.length >= 2 ? (
          <div className="text-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p>Loading comparison...</p>
          </div>
        ) : null}

        {/* Call to Action Banner */}
        <div className="mt-8 bg-gradient-to-r from-navy-800 to-navy-900 rounded-xl p-6 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Need a Multi-State Compliance Strategy?</h3>
          <p className="text-navy-200 mb-4 max-w-2xl mx-auto">
            Our compliance experts can help you develop a multi-state licensing strategy
            tailored to your business model and growth plans.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2 bg-gold-600 text-white rounded-lg font-semibold hover:bg-gold-700 transition-colors"
          >
            Schedule Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-gold-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-navy-900">Get Your Compliance Report</h3>
              <p className="text-gray-600 mt-2">
                Enter your details to receive a comprehensive report comparing {selectedStates.join(', ')}.
              </p>
            </div>
            
            {leadSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Thanks! Redirecting to pricing...</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Work email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Company name"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gold-600 text-white rounded-lg font-semibold hover:bg-gold-700 transition-colors"
                >
                  Send Report & See Pricing
                </button>
                <p className="text-xs text-gray-400 text-center">
                  We'll email you the report. No spam, unsubscribe anytime.
                </p>
              </form>
            )}
            
            <button
              onClick={() => setShowLeadModal(false)}
              className="mt-4 w-full px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              No thanks, I'll continue browsing
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
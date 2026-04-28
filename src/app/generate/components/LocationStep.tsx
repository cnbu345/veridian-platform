// src/app/generate/components/LocationStep.tsx
// Location Form with integrated State Selection (Single + Multi-State)

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { locationSchema, LocationFormData } from '@/lib/reports/validation'
import { analyzeLocationClient, LocationAnalysisClient } from '@/lib/location/analyzer-client'
import { getSimplifiedLicensingClient } from '@/lib/location/licensing-client'
import { MapPin, Building2, Users, Shield, TrendingUp, Loader2, Plus, X, ChevronDown } from 'lucide-react'
import LocationPreview from './LocationPreview'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

// State data for multi-state selection
const ALL_STATES_DATA = [
  { code: 'AL', name: 'Alabama', climate: 'moderate', licenseType: 'MTL' },
  { code: 'AK', name: 'Alaska', climate: 'friendly', licenseType: 'MTL' },
  { code: 'AZ', name: 'Arizona', climate: 'friendly', licenseType: 'MTL' },
  { code: 'AR', name: 'Arkansas', climate: 'moderate', licenseType: 'MTL' },
  { code: 'CA', name: 'California', climate: 'strict', licenseType: 'DFPI' },
  { code: 'CO', name: 'Colorado', climate: 'friendly', licenseType: 'MTL' },
  { code: 'CT', name: 'Connecticut', climate: 'moderate', licenseType: 'MTL' },
  { code: 'DE', name: 'Delaware', climate: 'friendly', licenseType: 'MTL' },
  { code: 'FL', name: 'Florida', climate: 'friendly', licenseType: 'None' },
  { code: 'GA', name: 'Georgia', climate: 'moderate', licenseType: 'MTL' },
  { code: 'HI', name: 'Hawaii', climate: 'moderate', licenseType: 'MTL' },
  { code: 'ID', name: 'Idaho', climate: 'friendly', licenseType: 'MTL' },
  { code: 'IL', name: 'Illinois', climate: 'moderate', licenseType: 'MTL' },
  { code: 'IN', name: 'Indiana', climate: 'friendly', licenseType: 'MTL' },
  { code: 'IA', name: 'Iowa', climate: 'moderate', licenseType: 'MTL' },
  { code: 'KS', name: 'Kansas', climate: 'moderate', licenseType: 'MTL' },
  { code: 'KY', name: 'Kentucky', climate: 'friendly', licenseType: 'MTL' },
  { code: 'LA', name: 'Louisiana', climate: 'moderate', licenseType: 'MTL' },
  { code: 'ME', name: 'Maine', climate: 'moderate', licenseType: 'MTL' },
  { code: 'MD', name: 'Maryland', climate: 'moderate', licenseType: 'MTL' },
  { code: 'MA', name: 'Massachusetts', climate: 'strict', licenseType: 'MTL' },
  { code: 'MI', name: 'Michigan', climate: 'friendly', licenseType: 'MTL' },
  { code: 'MN', name: 'Minnesota', climate: 'moderate', licenseType: 'MTL' },
  { code: 'MS', name: 'Mississippi', climate: 'friendly', licenseType: 'MTL' },
  { code: 'MO', name: 'Missouri', climate: 'friendly', licenseType: 'MTL' },
  { code: 'MT', name: 'Montana', climate: 'friendly', licenseType: 'MTL' },
  { code: 'NE', name: 'Nebraska', climate: 'friendly', licenseType: 'MTL' },
  { code: 'NV', name: 'Nevada', climate: 'friendly', licenseType: 'None' },
  { code: 'NH', name: 'New Hampshire', climate: 'friendly', licenseType: 'MTL' },
  { code: 'NJ', name: 'New Jersey', climate: 'strict', licenseType: 'MTL' },
  { code: 'NM', name: 'New Mexico', climate: 'friendly', licenseType: 'MTL' },
  { code: 'NY', name: 'New York', climate: 'strict', licenseType: 'BitLicense' },
  { code: 'NC', name: 'North Carolina', climate: 'moderate', licenseType: 'MTL' },
  { code: 'ND', name: 'North Dakota', climate: 'moderate', licenseType: 'MTL' },
  { code: 'OH', name: 'Ohio', climate: 'friendly', licenseType: 'MTL' },
  { code: 'OK', name: 'Oklahoma', climate: 'friendly', licenseType: 'MTL' },
  { code: 'OR', name: 'Oregon', climate: 'moderate', licenseType: 'MTL' },
  { code: 'PA', name: 'Pennsylvania', climate: 'moderate', licenseType: 'MTL' },
  { code: 'RI', name: 'Rhode Island', climate: 'moderate', licenseType: 'MTL' },
  { code: 'SC', name: 'South Carolina', climate: 'moderate', licenseType: 'MTL' },
  { code: 'SD', name: 'South Dakota', climate: 'friendly', licenseType: 'None' },
  { code: 'TN', name: 'Tennessee', climate: 'friendly', licenseType: 'MTL' },
  { code: 'TX', name: 'Texas', climate: 'friendly', licenseType: 'None' },
  { code: 'UT', name: 'Utah', climate: 'friendly', licenseType: 'MTL' },
  { code: 'VT', name: 'Vermont', climate: 'moderate', licenseType: 'MTL' },
  { code: 'VA', name: 'Virginia', climate: 'friendly', licenseType: 'MTL' },
  { code: 'WA', name: 'Washington', climate: 'strict', licenseType: 'MTL' },
  { code: 'WV', name: 'West Virginia', climate: 'moderate', licenseType: 'MTL' },
  { code: 'WI', name: 'Wisconsin', climate: 'friendly', licenseType: 'MTL' },
  { code: 'WY', name: 'Wyoming', climate: 'friendly', licenseType: 'None' }
]

interface LocationStepProps {
  data: LocationFormData & {
    secondaryStates?: string[]
  }
  userTier?: 'free' | 'single' | 'quarterly' | 'monthly' | 'enterprise'
  onUpdate: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export default function LocationStep({ data, userTier = 'single', onUpdate, onNext, onBack }: LocationStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<LocationAnalysisClient | null>(null)
  const [regulation, setRegulation] = useState<any>(null)
  const [secondaryStates, setSecondaryStates] = useState<string[]>(data.secondaryStates || [])
  const [isMultiState, setIsMultiState] = useState(userTier === 'enterprise' && (data.secondaryStates?.length || 0) > 0)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)

  const isEnterprise = userTier === 'enterprise'
  const maxSecondaryStates = 4

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue
  } = useForm({
    defaultValues: {
      city: data.city || '',
      state: data.state || 'TX',
      locationTier: data.locationTier || '',
      nearestRegulatoryHub: data.nearestRegulatoryHub || ''
    },
    mode: 'onChange'
  })

  const city = watch('city')
  const state = watch('state')

  const primaryStateData = ALL_STATES_DATA.find(s => s.code === state)
  const availableStates = ALL_STATES_DATA.filter(s => 
    s.code !== state && !secondaryStates.includes(s.code)
  )

  // Analyze location when city/state changes
  useEffect(() => {
    if (city && state && city.length >= 2) {
      const analyze = async () => {
        setIsAnalyzing(true)
        try {
          const result = await analyzeLocationClient(city, state)
          setAnalysis(result)
          
          const licensing = await getSimplifiedLicensingClient(state)
          setRegulation({
            cryptoFriendly: licensing.cryptoFriendly,
            license_required: licensing.licenseRequired,
            license_description: licensing.moneyTransmitter,
            tax_treatment: licensing.taxTreatment,
            regulator_name: 'State Regulator',
            application_fee_formatted: licensing.applicationFeeFormatted,
            bond_requirement: licensing.bondRequirement,
            processing_time: licensing.processingTime
          })
        } catch (error) {
          console.error('Location analysis failed:', error)
        } finally {
          setIsAnalyzing(false)
        }
      }
      
      const timeout = setTimeout(analyze, 500)
      return () => clearTimeout(timeout)
    }
  }, [city, state])

  const addSecondaryState = (code: string) => {
    if (secondaryStates.length >= maxSecondaryStates) return
    const newSecondary = [...secondaryStates, code]
    setSecondaryStates(newSecondary)
    onUpdate({ secondaryStates: newSecondary })
    setIsMobileDropdownOpen(false)
  }
  
  const removeSecondaryState = (code: string) => {
    const newSecondary = secondaryStates.filter(s => s !== code)
    setSecondaryStates(newSecondary)
    onUpdate({ secondaryStates: newSecondary })
  }
  
  const toggleMultiState = () => {
    if (!isEnterprise) return
    const newValue = !isMultiState
    setIsMultiState(newValue)
    if (!newValue) {
      setSecondaryStates([])
      onUpdate({ secondaryStates: [] })
    }
  }

  const onSubmit = (formData: any) => {
    onUpdate({
      city: formData.city,
      state: formData.state,
      locationTier: analysis?.tier || 'rural',
      nearestRegulatoryHub: analysis?.nearestRegulatoryHub,
      regulatoryClimate: analysis?.regulatoryClimate,
      licenseRequired: analysis?.licenseRequired,
      secondaryStates: secondaryStates
    })
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Multi-State Toggle (Enterprise only) */}
      {isEnterprise && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-medium text-navy-900 text-sm">Report Type</h3>
              <p className="text-xs text-gray-500">Choose between single-state or multi-state analysis</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleMultiState}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !isMultiState 
                    ? 'bg-gold-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Single State
              </button>
              <button
                type="button"
                onClick={toggleMultiState}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isMultiState 
                    ? 'bg-gold-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Multi-State
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Input Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* City */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-navy-900">
            City <span className="text-gold-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-navy-400" />
            </div>
            <input
              type="text"
              {...register('city')}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                       rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent
                       transition-all duration-200"
              placeholder="e.g., Denver"
            />
          </div>
          {errors.city && (
            <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* Primary State */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-navy-900">
            {isMultiState ? 'Primary State *' : 'State *'}
          </label>
          
          {/* Mobile Dropdown */}
          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="font-mono">{state}</span>
                <span className="text-gray-600">- {primaryStateData?.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMobileDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {ALL_STATES_DATA.map(s => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      setValue('state', s.code)
                      setIsMobileDropdownOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-medium">{s.code}</span>
                      <span className="text-gray-500 ml-2 text-sm">{s.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop Select */}
          <div className="hidden sm:block relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              {...register('state')}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                       rounded-xl focus:ring-2 focus:ring-gold-500 appearance-none"
            >
              <option value="">Select state</option>
              {US_STATES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          
          {errors.state && (
            <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
          )}
          
          {primaryStateData && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <p className="text-xs text-gray-500">
                Climate: {primaryStateData.climate === 'friendly' ? '🟢 Friendly' : primaryStateData.climate === 'strict' ? '🔴 Strict' : '🟡 Moderate'}
              </p>
              {primaryStateData.licenseType && primaryStateData.licenseType !== 'None' && (
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                  License: {primaryStateData.licenseType}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Secondary States (Multi-state only) */}
      {isMultiState && (
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            Secondary States (Optional - up to {maxSecondaryStates})
          </label>
          
          {/* Selected secondary states */}
          {secondaryStates.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {secondaryStates.map(code => {
                const stateData = ALL_STATES_DATA.find(s => s.code === code)
                return (
                  <div
                    key={code}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 rounded-lg"
                  >
                    <span className="font-mono text-sm">{code}</span>
                    <span className="text-xs text-gray-500 hidden sm:inline">{stateData?.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSecondaryState(code)}
                      className="p-0.5 hover:bg-navy-100 rounded"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Add secondary state */}
          {secondaryStates.length < maxSecondaryStates && (
            <div className="relative">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value=""
                onChange={(e) => addSecondaryState(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-500 appearance-none"
              >
                <option value="">Add secondary state...</option>
                {availableStates.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name} ({s.climate})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <p className="text-xs text-gray-400 mt-2">
            Multi-state reports include comparative analysis across all selected states.
            {secondaryStates.length === 0 && ' Add at least one secondary state for comparison.'}
          </p>
        </div>
      )}

      {/* Location Preview / Analysis */}
      {(isAnalyzing || analysis) && (
        <div className="mt-8">
          <LocationPreview 
            analysis={analysis} 
            regulation={regulation}
            isLoading={isAnalyzing} 
          />
        </div>
      )}

      {/* Summary Card (when multi-state with selections) */}
      {isMultiState && secondaryStates.length > 0 && (
        <div className="bg-navy-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-navy-900 mb-2">Report Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Primary State:</span>
              <span className="font-medium text-navy-900">{state} - {primaryStateData?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Secondary States:</span>
              <span className="font-medium text-navy-900">{secondaryStates.join(', ')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-navy-100">
              <span className="text-gray-600">Report Type:</span>
              <span className="font-medium text-navy-900">Multi-State Analysis</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">States to Compare:</span>
              <span className="font-medium text-navy-900">{1 + secondaryStates.length} states</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-navy-600 font-semibold hover:text-navy-900 transition-colors"
        >
          ← Back
        </button>
        
        <button
          type="submit"
          disabled={!isValid || !analysis}
          className="px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-500 
                   text-white font-semibold rounded-xl
                   hover:from-gold-500 hover:to-gold-400 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-300 hover:scale-105
                   shadow-lg shadow-gold-500/25"
        >
          Continue to Strategy Focus
        </button>
      </div>
    </form>
  )
}
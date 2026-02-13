'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { locationSchema, LocationFormData } from '@/lib/reports/validation'
import { analyzeLocation, LocationAnalysis } from '@/lib/location/analyzer'
import { getStateRegulation } from '@/lib/location/regulations'
import { MapPin, Building2, Users, Shield, TrendingUp, Loader2 } from 'lucide-react'
import LocationPreview from './LocationPreview'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

interface LocationStepProps {
  data: LocationFormData
  onUpdate: (data: LocationFormData) => void
  onNext: () => void
  onBack: () => void
}

export default function LocationStep({ data, onUpdate, onNext, onBack }: LocationStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null)
  const [regulation, setRegulation] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: data,
    mode: 'onChange'
  })

  const city = watch('city')
  const state = watch('state')

  // Analyze location when city/state changes
  useEffect(() => {
    if (city && state && city.length >= 2) {
      const analyze = async () => {
        setIsAnalyzing(true)
        try {
          const result = await analyzeLocation(city, state)
          setAnalysis(result)
          
          const reg = getStateRegulation(state)
          setRegulation(reg)
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

  const onSubmit = (formData: LocationFormData) => {
    onUpdate(formData)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
              placeholder="e.g., Austin"
            />
          </div>
          {errors.city && (
            <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-navy-900">
            State <span className="text-gold-600">*</span>
          </label>
          <select
            {...register('state')}
            className="w-full px-4 py-3 bg-white border border-slate-300 
                     rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value="">Select state</option>
            {US_STATES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          {errors.state && (
            <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
          )}
        </div>
      </div>

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

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-navy-600 font-semibold hover:text-navy-900 
                   transition-colors"
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
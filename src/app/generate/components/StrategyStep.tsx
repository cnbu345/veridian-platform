// src/app/generate/components/StrategyStep.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { strategySchema, StrategyFormData } from '@/lib/reports/validation'
import { 
  Target, 
  Shield, 
  Users, 
  TrendingUp, 
  Lightbulb, 
  Handshake,
  Clock,
  AlertCircle,
  CheckCircle,
  Scale,
  Gavel,
  Landmark,
  FileCheck
} from 'lucide-react'

interface StrategyStepProps {
  data: StrategyFormData
  onUpdate: (data: StrategyFormData) => void
  onNext: () => void
  onBack: () => void
}

const PRIMARY_FOCUS_OPTIONS = [
  { value: 'compliance', label: 'Regulatory Compliance', icon: Scale, 
    description: 'Navigate state-specific digital asset regulations and licensing' },
  { value: 'licensing', label: 'Multi-State Licensing', icon: Gavel,
    description: 'Identify required licenses across all operating jurisdictions' },
  { value: 'risk', label: 'Risk Assessment', icon: AlertCircle,
    description: 'Evaluate regulatory exposure and enforcement risk by state' },
  { value: 'monitoring', label: 'Compliance Monitoring', icon: FileCheck,
    description: 'Track regulatory changes and maintain ongoing compliance' },
  { value: 'talent', label: 'Compliance Talent', icon: Users,
    description: 'Build your compliance team and find regulatory expertise' },
  { value: 'strategy', label: 'Market Entry', icon: Landmark,
    description: 'Determine where to operate based on regulatory climate' }
]

const SECONDARY_FOCUS_OPTIONS = [
  { value: 'compliance', label: 'Regulatory Compliance' },
  { value: 'licensing', label: 'Licensing' },
  { value: 'risk', label: 'Risk Assessment' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'talent', label: 'Talent Acquisition' },
  { value: 'strategy', label: 'Market Strategy' },
  { value: 'reporting', label: 'Regulatory Reporting' },
  { value: 'audit', label: 'Compliance Audits' },
  { value: 'policy', label: 'Policy Development' },
  { value: 'training', label: 'Staff Training' }
]

const TIMELINE_OPTIONS = [
  { value: '3-months', label: '3 Months (Immediate)', 
    description: 'Urgent compliance needs or pending enforcement' },
  { value: '6-months', label: '6 Months (Standard)', 
    description: 'Balanced approach for most institutions' },
  { value: '12-months', label: '12 Months (Strategic)', 
    description: 'Comprehensive compliance program build-out' }
]

export default function StrategyStep({ data, onUpdate, onNext, onBack }: StrategyStepProps) {
  const [selectedSecondary, setSelectedSecondary] = useState<string[]>(data.secondary || [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<StrategyFormData>({
    resolver: zodResolver(strategySchema),
    defaultValues: data,
    mode: 'onChange'
  })

  const primaryFocus = watch('primary')
  const concerns = watch('concerns')
  const goals = watch('goals')

  const handleSecondaryToggle = (value: string) => {
    const newSelection = selectedSecondary.includes(value)
      ? selectedSecondary.filter(v => v !== value)
      : [...selectedSecondary, value]
    
    setSelectedSecondary(newSelection)
    setValue('secondary', newSelection, { shouldValidate: true })
  }

  const onSubmit = (formData: StrategyFormData) => {
    onUpdate(formData)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Primary Focus */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-navy-900">
          Primary Compliance Focus <span className="text-gold-600">*</span>
        </label>
        <p className="text-sm text-navy-600 mb-4">
          What's your main regulatory priority?
        </p>

        <div className="grid gap-4">
          {PRIMARY_FOCUS_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = primaryFocus === option.value

            return (
              <label
                key={option.value}
                className={`relative flex items-start gap-4 p-5 rounded-xl border-2 
                          cursor-pointer transition-all duration-200
                          ${isSelected 
                            ? 'border-gold-500 bg-gold-50/50 shadow-md' 
                            : 'border-slate-200 hover:border-gold-200 hover:bg-slate-50'
                          }`}
              >
                <input
                  type="radio"
                  {...register('primary')}
                  value={option.value}
                  className="sr-only"
                />
                
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                              ${isSelected 
                                ? 'bg-gold-500 text-white' 
                                : 'bg-navy-100 text-navy-600'
                              }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-navy-900">
                      {option.label}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-gold-600" />
                    )}
                  </div>
                  <p className="text-sm text-navy-600">
                    {option.description}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
        {errors.primary && (
          <p className="text-sm text-red-600 mt-1">{errors.primary.message}</p>
        )}
      </div>

      {/* Secondary Focus Areas */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-navy-900">
          Secondary Focus Areas <span className="text-gold-600">*</span>
          <span className="text-xs text-navy-400 ml-2">(select at least one)</span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SECONDARY_FOCUS_OPTIONS.map((option) => {
            const isSelected = selectedSecondary.includes(option.value)

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSecondaryToggle(option.value)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium
                          transition-all duration-200
                          ${isSelected
                            ? 'border-gold-500 bg-gold-50 text-navy-900'
                            : 'border-slate-200 hover:border-gold-200 text-navy-600 hover:bg-slate-50'
                          }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        {errors.secondary && (
          <p className="text-sm text-red-600 mt-1">{errors.secondary.message}</p>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-navy-900">
          Compliance Timeline <span className="text-gold-600">*</span>
        </label>

        <div className="grid md:grid-cols-3 gap-4">
          {TIMELINE_OPTIONS.map((option) => {
            const isSelected = watch('timeline') === option.value

            return (
              <label
                key={option.value}
                className={`relative p-5 rounded-xl border-2 cursor-pointer
                          transition-all duration-200 text-center
                          ${isSelected
                            ? 'border-gold-500 bg-gold-50/50 shadow-md'
                            : 'border-slate-200 hover:border-gold-200 hover:bg-slate-50'
                          }`}
              >
                <input
                  type="radio"
                  {...register('timeline')}
                  value={option.value}
                  className="sr-only"
                />
                <Clock className={`w-6 h-6 mx-auto mb-2
                  ${isSelected ? 'text-gold-600' : 'text-navy-400'}`} />
                <div className="font-semibold text-navy-900 mb-1">
                  {option.label}
                </div>
                <p className="text-xs text-navy-600">
                  {option.description}
                </p>
              </label>
            )
          })}
        </div>
        {errors.timeline && (
          <p className="text-sm text-red-600 mt-1">{errors.timeline.message}</p>
        )}
      </div>

      {/* Concerns */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-navy-900">
          Compliance Concerns <span className="text-gold-600">*</span>
        </label>
        <p className="text-sm text-navy-600 mb-2">
          What regulatory challenges keep you up at night? Enforcement actions? Licensing gaps?
        </p>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <AlertCircle className="h-5 w-5 text-navy-400" />
          </div>
          <textarea
            {...register('concerns')}
            rows={4}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                     rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            placeholder="e.g., We're worried about state enforcement actions, need clarity on licensing requirements in 12 states, and want to ensure we're compliant before regulators review us..."
          />
        </div>
        {errors.concerns && (
          <p className="text-sm text-red-600 mt-1">{errors.concerns.message}</p>
        )}
        <p className="text-xs text-navy-400 text-right">
          {concerns?.length || 0}/1000 characters
        </p>
      </div>

      {/* Goals */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-navy-900">
          Compliance Goals <span className="text-gold-600">*</span>
        </label>
        <p className="text-sm text-navy-600 mb-2">
          What does compliance success look like in 6-12 months?
        </p>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <Target className="h-5 w-5 text-navy-400" />
          </div>
          <textarea
            {...register('goals')}
            rows={4}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                     rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            placeholder="e.g., Obtain licenses in all operating states, implement compliance monitoring system, pass regulatory examination with no findings..."
          />
        </div>
        {errors.goals && (
          <p className="text-sm text-red-600 mt-1">{errors.goals.message}</p>
        )}
        <p className="text-xs text-navy-400 text-right">
          {goals?.length || 0}/1000 characters
        </p>
      </div>

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
          disabled={!isValid}
          className="px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-500 
                   text-white font-semibold rounded-xl
                   hover:from-gold-500 hover:to-gold-400 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-300 hover:scale-105
                   shadow-lg shadow-gold-500/25"
        >
          Continue to Review
        </button>
      </div>
    </form>
  )
}
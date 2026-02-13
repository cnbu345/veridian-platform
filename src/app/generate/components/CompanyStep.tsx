'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { companySchema, CompanyFormData } from '@/lib/reports/validation'
import { Building2, Users, DollarSign, Globe, Calendar, FileText } from 'lucide-react'

interface CompanyStepProps {
  data: CompanyFormData
  onUpdate: (data: CompanyFormData) => void
  onNext: () => void
}

const INDUSTRIES = [
  'Technology / Software',
  'Financial Services',
  'Healthcare / Biotech',
  'Real Estate',
  'Retail / E-commerce',
  'Manufacturing',
  'Energy / Utilities',
  'Education',
  'Media / Entertainment',
  'Professional Services',
  'Nonprofit',
  'Other'
]

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' }
]

const BUDGET_RANGES = [
  { value: 'under-10k', label: 'Under $10,000' },
  { value: '10k-50k', label: '$10,000 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-250k', label: '$100,000 - $250,000' },
  { value: '250k-plus', label: '$250,000+' }
]

export default function CompanyStep({ data, onUpdate, onNext }: CompanyStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: data,
    mode: 'onChange'
  })

  const formData = watch()

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      {/* Company Name */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-navy-900">
          Company Name <span className="text-gold-600">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building2 className="h-5 w-5 text-navy-400" />
          </div>
          <input
            type="text"
            {...register('name')}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                     rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent
                     transition-all duration-200"
            placeholder="e.g., Acme Corporation"
          />
        </div>
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Website (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-navy-900">
          Company Website <span className="text-navy-400 text-xs">(optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-navy-400" />
          </div>
          <input
            type="url"
            {...register('website')}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                     rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            placeholder="https://www.example.com"
          />
        </div>
        {errors.website && (
          <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
        )}
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-navy-900">
          Industry <span className="text-gold-600">*</span>
        </label>
        <select
          {...register('industry')}
          className="w-full px-4 py-3 bg-white border border-slate-300 
                   rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
        >
          <option value="">Select industry</option>
          {INDUSTRIES.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
        {errors.industry && (
          <p className="text-sm text-red-600 mt-1">{errors.industry.message}</p>
        )}
      </div>

      {/* Company Size & Budget - Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Size */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-navy-900">
            Company Size <span className="text-gold-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-navy-400" />
            </div>
            <select
              {...register('size')}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                       rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="">Select size</option>
              {COMPANY_SIZES.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>
          {errors.size && (
            <p className="text-sm text-red-600 mt-1">{errors.size.message}</p>
          )}
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-navy-900">
            Web3 Budget <span className="text-gold-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-navy-400" />
            </div>
            <select
              {...register('budget')}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                       rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            >
              <option value="">Select budget</option>
              {BUDGET_RANGES.map(budget => (
                <option key={budget.value} value={budget.value}>{budget.label}</option>
              ))}
            </select>
          </div>
          {errors.budget && (
            <p className="text-sm text-red-600 mt-1">{errors.budget.message}</p>
          )}
        </div>
      </div>

      {/* Year Founded (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-navy-900">
          Year Founded <span className="text-navy-400 text-xs">(optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-navy-400" />
          </div>
          <input
            type="text"
            {...register('founded')}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                     rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            placeholder="e.g., 2018"
          />
        </div>
      </div>

      {/* Company Description (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-navy-900">
          Company Description <span className="text-navy-400 text-xs">(optional)</span>
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileText className="h-5 w-5 text-navy-400" />
          </div>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 
                     rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            placeholder="Briefly describe what your company does..."
          />
        </div>
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
        <p className="text-xs text-navy-400 text-right">
          {formData.description?.length || 0}/500 characters
        </p>
      </div>

      {/* Form Progress & Next Button */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div>
          {Object.keys(errors).length > 0 && (
            <p className="text-sm text-red-600">
              Please fix the errors above to continue
            </p>
          )}
        </div>
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
          Continue to Location Analysis
        </button>
      </div>
    </form>
  )
}
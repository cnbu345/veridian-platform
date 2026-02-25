// src/app/generate/GenerateClient.tsx // Main client component with form steps
'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Shield, Scale } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import ProgressSteps from './components/ProgressSteps'
import CompanyStep from './components/CompanyStep'
import LocationStep from './components/LocationStep'
import StrategyStep from './components/StrategyStep'
import ReviewStep from './components/ReviewStep'
import { CompanyFormData, LocationFormData, StrategyFormData } from '@/lib/reports/validation'

interface GenerateClientProps {
  user: User
}

const STEPS = [
  { id: 1, name: 'Institution', description: 'Business details' },
  { id: 2, name: 'Jurisdiction', description: 'State analysis' },
  { id: 3, name: 'Compliance', description: 'Focus areas' },
  { id: 4, name: 'Review', description: 'Confirm & purchase' }
]

export default function GenerateClient({ user }: GenerateClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form data state
  const [companyData, setCompanyData] = useState<CompanyFormData>({
    name: '',
    website: '',
    industry: '',
    size: '1-10',
    budget: 'under-50k',
    founded: '',
    description: ''
  })

  const [locationData, setLocationData] = useState<LocationFormData>({
    city: '',
    state: ''
  })

  const [strategyData, setStrategyData] = useState<StrategyFormData>({
    primary: 'compliance',
    secondary: [],
    timeline: '6-months',
    concerns: '',
    goals: ''
  })

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleComplete = async () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-32">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="heading-2 text-navy-900 mb-4">
            Generate Your Regulatory Intelligence Report
          </h1>
          <p className="text-lg text-navy-600">
            Complete the 4-step process to get your state-by-state compliance analysis
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <ProgressSteps currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
          {currentStep === 1 && (
            <CompanyStep
              data={companyData}
              onUpdate={setCompanyData}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <LocationStep
              data={locationData}
              onUpdate={setLocationData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <StrategyStep
              data={strategyData}
              onUpdate={setStrategyData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep
              user={user}
              companyData={companyData}
              locationData={locationData}
              strategyData={strategyData}
              onBack={handleBack}
              onComplete={handleComplete}
            />
          )}
        </div>

        {/* Trust Badge - Using cn() */}
        <div className="mt-8 text-center">
          <div className={cn(
            "inline-flex items-center gap-2 bg-white px-6 py-3",
            "rounded-full border border-slate-200 shadow-soft"
          )}>
            <Scale className="w-4 h-4 text-gold-600" />
            <span className="text-sm text-navy-600">
              Enterprise-grade encryption • SOC2 Type II compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
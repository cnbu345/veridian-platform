// src/app/generate/components/ProgressSteps.tsx
'use client'

import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface Step {
  id: number
  name: string
  description: string
}

interface ProgressStepsProps {
  currentStep: number
  steps: Step[]
}

export default function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="relative">
      {/* Background line connector */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 hidden md:block" />
      
      <div className="relative flex justify-between items-start">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isActive = currentStep === step.id
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className={cn(
                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                isCompleted && "bg-green-600 text-white shadow-lg shadow-green-500/25",
                isActive && "bg-gold-600 text-white ring-4 ring-gold-500/30 shadow-lg shadow-gold-500/25",
                !isCompleted && !isActive && "bg-white border-2 border-slate-300 text-slate-400"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-3 text-center">
                <p className={cn(
                  "text-sm font-semibold transition-colors",
                  isActive && "text-gold-600",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-navy-500"
                )}>
                  {step.name}
                </p>
                <p className="text-xs text-navy-400 hidden md:block">
                  {step.description}
                </p>
              </div>
              
              {/* Mobile-only connector line */}
              {index < steps.length - 1 && (
                <div className="md:hidden absolute top-5 left-1/2 w-full h-0.5 bg-slate-200 -z-0" 
                     style={{ left: '50%', width: 'calc(100% - 40px)' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
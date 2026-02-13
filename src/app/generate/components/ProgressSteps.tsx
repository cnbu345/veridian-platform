'use client'

import { Check } from 'lucide-react'

interface ProgressStepsProps {
  currentStep: number
  steps: {
    id: number
    name: string
    description: string
  }[]
}

export default function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="relative">
      {/* Progress Bar Background */}
      <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 rounded-full" />
      
      {/* Active Progress Bar */}
      <div 
        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-gold-600 to-gold-500 
                   rounded-full transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep

          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted 
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-white' 
                    : isActive
                      ? 'bg-white border-2 border-gold-500 text-gold-600'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  } transition-all duration-300`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{stepNumber}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <span className={`text-sm font-semibold
                  ${isCompleted || isActive 
                    ? 'text-navy-900' 
                    : 'text-slate-500'
                  }`}
                >
                  {step.name}
                </span>
                <p className="text-xs text-slate-500 mt-1 max-w-[120px]">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
// src/components/PricingCard.tsx
import Link from 'next/link'
import { Check } from 'lucide-react'

interface PricingCardProps {
  title: string
  price: string
  period: string
  description: string
  features: string[]
  buttonText: string
  buttonLink: string
  featured?: boolean
  badge?: string
  savings?: string
}

export default function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonLink,
  featured = false,
  badge,
  savings
}: PricingCardProps) {
  return (
    <div className={`relative rounded-xl sm:rounded-2xl border ${featured ? 'border-navy-300 bg-gradient-to-b from-navy-50 to-white shadow-lg' : 'border-slate-200 bg-white'} p-6 sm:p-8 hover:shadow-premium transition-all duration-300 h-full flex flex-col`}>
      {badge && (
        <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gold-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
            {badge}
          </span>
        </div>
      )}
      
      <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2">{title}</h3>
      <div className="mb-2">
        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy-900">{price}</span>
        <span className="text-sm sm:text-base text-navy-500">/{period}</span>
      </div>
      {savings && (
        <p className="text-xs sm:text-sm text-green-600 font-semibold mb-3 sm:mb-4">{savings}</p>
      )}
      <p className="text-sm sm:text-base text-navy-600 mb-6 sm:mb-8">{description}</p>
      
      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 sm:gap-3">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-navy-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link
        href={buttonLink}
        className={`block w-full text-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 ${
          featured 
            ? 'bg-navy-900 text-white hover:bg-navy-800' 
            : 'bg-white border-2 border-navy-200 text-navy-900 hover:border-gold-500 hover:bg-gold-50'
        }`}
      >
        {buttonText}
      </Link>
      
      <p className="text-[10px] sm:text-xs text-center text-navy-400 mt-3 sm:mt-4">
        Secure enterprise payment • 30-day guarantee
      </p>
    </div>
  )
}
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
    <div className={`relative rounded-2xl border ${featured ? 'border-navy-300 bg-gradient-to-b from-navy-50 to-white shadow-lg' : 'border-slate-200 bg-white'} p-8 hover:shadow-premium transition-all duration-300`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gold-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            {badge}
          </span>
        </div>
      )}
      
      <h3 className="text-2xl font-bold text-navy-900 mb-2">{title}</h3>
      <div className="mb-2">
        <span className="text-4xl font-bold text-navy-900">{price}</span>
        <span className="text-navy-500">/{period}</span>
      </div>
      {savings && (
        <p className="text-sm text-green-600 font-semibold mb-4">{savings}</p>
      )}
      <p className="text-navy-600 mb-8">{description}</p>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <span className="text-sm text-navy-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link
        href={buttonLink}
        className={`block w-full text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
          featured 
            ? 'bg-navy-900 text-white hover:bg-navy-800' 
            : 'bg-white border-2 border-navy-200 text-navy-900 hover:border-gold-500 hover:bg-gold-50'
        }`}
      >
        {buttonText}
      </Link>
      
      <p className="text-xs text-center text-navy-400 mt-4">
        Secure enterprise payment • 30-day guarantee
      </p>
    </div>
  )
}
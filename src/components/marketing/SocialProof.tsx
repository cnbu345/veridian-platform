// src/components/marketing/SocialProof.tsx
'use client'

import { motion } from 'framer-motion'
import { Star, Landmark } from 'lucide-react'
import Link from 'next/link'

const companies = [
  { name: 'JPMorgan Chase', category: 'Banking' },
  { name: 'Wells Fargo', category: 'Banking' },
  { name: 'Deloitte', category: 'Consulting' },
  { name: 'PwC', category: 'Advisory' },
  { name: 'KPMG', category: 'Audit' },
]

const testimonials = [
  {
    quote: "We saved 340 hours of regulatory research across 12 states. The compliance roadmap gave our board the confidence to move forward.",
    author: "Sarah Mitchell",
    title: "Chief Compliance Officer",
    company: "Midwest Regional Bank",
    rating: 5,
    savings: "$127,000"
  },
  {
    quote: "This replaced a $15,000 consultant engagement. The state-by-state licensing analysis alone was worth 10x the investment.",
    author: "James Chen",
    title: "Partner",
    company: "Chen & Associates Law",
    rating: 5,
    savings: "$15,000"
  },
  {
    quote: "As an insurance underwriter, understanding state crypto exposure was impossible before. Now it's our standard risk assessment tool.",
    author: "Patricia O'Brien",
    title: "VP, Emerging Risks",
    company: "Hartford Insurance",
    rating: 5,
    savings: "$250,000"
  }
]

export default function SocialProof() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted By */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 sm:mb-6">
            Trusted by compliance teams at
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8">
            {companies.map((company, idx) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="grayscale hover:grayscale-0 transition-all duration-300 text-center w-full max-w-[120px] sm:max-w-[140px] mx-auto"
              >
                <div className="h-6 sm:h-8 w-full bg-slate-200 rounded animate-pulse mx-auto" />
                <span className="text-xs sm:text-sm text-slate-400 mt-1 block truncate">{company.name}</span>
                <span className="text-xs text-slate-300 truncate block">(compliance client)</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rating Summary */}
        <div className="flex flex-col items-center mb-8 sm:mb-12 md:mb-16">
          <div className="flex items-center gap-1 sm:gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm sm:text-base md:text-lg text-slate-700 text-center">
            <span className="font-bold">4.9/5</span> from 87 verified compliance officers
          </p>
          <p className="text-xs sm:text-sm text-green-600 font-semibold mt-2">
            Average client savings: $84,000
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 hover:border-navy-200 transition-all duration-300 hover:shadow-xl group w-full"
            >
              <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-sm sm:text-base text-slate-700 mb-4 sm:mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-navy-500 to-gold-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">{testimonial.author}</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>
              
              <div className="pt-3 sm:pt-4 border-t border-slate-200">
                <span className="text-xs sm:text-sm font-semibold text-green-600">
                  Saved {testimonial.savings}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Case Study Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 bg-gradient-to-r from-navy-700 to-navy-800 rounded-2xl p-6 sm:p-8 text-white"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center lg:text-left">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-navy-200">
                Featured Case Study
              </span>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-2 mb-2 sm:mb-3">
                How a regional bank achieved multi-state compliance in 47 days
              </h3>
              <p className="text-sm sm:text-base text-navy-200 max-w-2xl">
                Using Veridian's regulatory intelligence, they identified 3 required licenses, 
                avoided $2.8M in potential fines, and launched their digital asset pilot 
                73% faster.
              </p>
            </div>
            <Link 
              href="/case-studies" 
              className="w-full lg:w-auto bg-white text-navy-800 px-6 py-3 rounded-lg font-semibold hover:bg-navy-50 transition-colors text-center text-sm sm:text-base whitespace-nowrap"
            >
              Read Case Study →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
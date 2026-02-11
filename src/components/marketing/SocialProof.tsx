'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const companies = [
  { name: 'Microsoft', logo: '/logos/microsoft.svg', category: 'Technology' },
  { name: 'Google', logo: '/logos/google.svg', category: 'Cloud' },
  { name: 'JPMorgan', logo: '/logos/jpmorgan.svg', category: 'Finance' },
  { name: 'Deloitte', logo: '/logos/deloitte.svg', category: 'Consulting' },
  { name: 'PwC', logo: '/logos/pwc.svg', category: 'Advisory' },
]

const testimonials = [
  {
    quote: "We raised $2M after implementing their recommendations. The Austin-specific talent analysis alone was worth 10x the investment.",
    author: "Sarah Chen",
    title: "CTO",
    company: "Fintech Startup",
    image: "/testimonials/sarah.jpg",
    rating: 5
  },
  {
    quote: "The state regulatory guide saved us 340 hours of legal research. This isn't just a report - it's a compliance framework.",
    author: "Michael Rodriguez",
    title: "General Counsel",
    company: "Healthcare Systems",
    image: "/testimonials/michael.jpg",
    rating: 5
  },
  {
    quote: "They understood our Nashville market better than local consultants who charge triple. Our Web3 pilot launched in 47 days.",
    author: "David Kim",
    title: "CEO",
    company: "Retail Chain",
    image: "/testimonials/david.jpg",
    rating: 5
  }
]

export default function SocialProof() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted By */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
            Trusted by leaders from
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {companies.map((company, idx) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="grayscale hover:grayscale-0 transition-all duration-300"
              >
                <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                {/* Replace with actual logos later */}
                <span className="text-slate-400 text-sm">{company.name}</span>
                <span className="text-xs text-slate-300 block">(past client)</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rating Summary */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-lg text-slate-700">
            <span className="font-bold">4.9/5</span> from 342 verified reviews
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-200 transition-all duration-300 hover:shadow-xl group"
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-slate-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-amber-500" />
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-600">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Case Study Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Featured Case Study
              </span>
              <h3 className="text-2xl font-bold mt-2 mb-3">
                How a Texas energy company saved 340 hours on compliance
              </h3>
              <p className="text-blue-100 max-w-2xl">
                Using Veridian's state-specific regulatory mapping, they launched their 
                Web3 pilot in 47 days - 73% faster than industry average.
              </p>
            </div>
            <button className="mt-4 md:mt-0 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Read Case Study →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
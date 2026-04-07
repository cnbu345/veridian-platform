// src/components/about/page.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Scale, 
  Shield, 
  Users, 
  Target, 
  Heart, 
  Lightbulb, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  FileCheck,
  Award
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-navy-50 rounded-full px-3 py-1 text-sm text-navy-700 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Our Story</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy-900 mb-6">
            Regulatory Intelligence
            <span className="text-gold-600 block">for the Digital Asset Era</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            We started Veridian Group because compliance officers deserve better than 
            expensive consultants and unreliable AI. Our platform delivers institution-grade 
            regulatory intelligence that's accurate, affordable, and actionable.
          </p>
        </motion.div>

        {/* The Problem Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 md:p-12 mb-16"
        >
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-100 rounded-full px-3 py-1 text-sm text-red-700 mb-4">
              <span>The Problem</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-4">
              Compliance shouldn't be a guessing game
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              Every day, compliance officers at banks, law firms, and financial institutions 
              face the same impossible question: <span className="font-semibold">"What are the rules in each state?"</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">79%</div>
                <div className="text-sm text-gray-600">of compliance officers say unclear state laws block crypto initiatives</div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">$47K</div>
                <div className="text-sm text-gray-600">average annual spend on consultants who don't understand state requirements</div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">$2.8M</div>
                <div className="text-sm text-gray-600">average fine for multi-state compliance failures</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* The Solution Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 rounded-full px-3 py-1 text-sm text-green-700 mb-4">
            <Lightbulb className="w-4 h-4" />
            <span>Our Solution</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-4">
            Intelligence, not guesswork
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We built a platform that combines AI efficiency with human regulatory expertise. 
            Every report is attorney-verified, source-cited, and actionable.
          </p>
        </motion.div>

        {/* How We're Different */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8"
          >
            <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center mb-4">
              <Scale className="w-6 h-6 text-navy-700" />
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-3">Attorney-Verified Accuracy</h3>
            <p className="text-gray-600 mb-4">
              Our AI doesn't guess. Every regulatory fact is pulled from our source-of-truth 
              database, reviewed by compliance professionals, and cited with official sources.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Zero hallucinations guaranteed</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8"
          >
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-gold-700" />
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-3">24-Hour Delivery</h3>
            <p className="text-gray-600 mb-4">
              Most compliance projects take weeks or months. We deliver comprehensive 
              reports within 24 hours, with quarterly updates to keep you current.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Same-week turnaround guaranteed</span>
            </div>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-50 rounded-full px-3 py-1 text-sm text-purple-700 mb-4">
              <Heart className="w-4 h-4" />
              <span>What We Believe</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-navy-900 mb-1">Radical Transparency</h4>
              <p className="text-sm text-gray-500">Every claim has a source. Every source is cited.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-navy-900 mb-1">Institutional Rigor</h4>
              <p className="text-sm text-gray-500">Built for banks, trusted by compliance officers.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-gold-600" />
              </div>
              <h4 className="font-semibold text-navy-900 mb-1">Client-First</h4>
              <p className="text-sm text-gray-500">Your compliance success is our only metric.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-semibold text-navy-900 mb-1">Continuous Innovation</h4>
              <p className="text-sm text-gray-500">Regulations change. So do we. Daily updates.</p>
            </div>
          </div>
        </motion.div>

        {/* Who We Serve */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-navy-50 rounded-2xl p-8 md:p-12 mb-16"
        >
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-navy-100 rounded-full px-3 py-1 text-sm text-navy-700 mb-4">
              <Users className="w-4 h-4" />
              <span>Who We Serve</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-4">
              Built for compliance professionals, by compliance professionals
            </h2>
            <p className="text-gray-700 mb-8">
              Whether you're a regional bank launching digital asset services, a law firm 
              advising crypto clients, or a financial institution managing multi-state exposure - 
              our platform adapts to your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-navy-700 shadow-sm">Regional Banks</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-navy-700 shadow-sm">Law Firms</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-navy-700 shadow-sm">Credit Unions</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-navy-700 shadow-sm">Investment Funds</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-navy-700 shadow-sm">FinTech Companies</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-navy-700 shadow-sm">Insurance Carriers</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 text-center"
        >
          <div>
            <div className="text-3xl md:text-4xl font-bold text-gold-600 mb-1">50</div>
            <div className="text-sm text-gray-500">States Mapped</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-gold-600 mb-1">340+</div>
            <div className="text-sm text-gray-500">Regulations Tracked</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-gold-600 mb-1">87+</div>
            <div className="text-sm text-gray-500">Compliance Officers Served</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-gold-600 mb-1">24h</div>
            <div className="text-sm text-gray-500">Average Delivery Time</div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to stop guessing and start complying?
          </h2>
          <p className="text-navy-200 mb-6 max-w-2xl mx-auto">
            Join the institutions that trust Veridian Group for their regulatory intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/state-requirements"
              className="px-6 py-3 bg-white text-navy-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Free Tools
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 bg-gold-600 text-white rounded-lg font-semibold hover:bg-gold-700 transition-colors"
            >
              Get Your Compliance Report
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
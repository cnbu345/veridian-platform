// src/app/contact/page.tsx
// Contact page - Professional, responsive, mobile-friendly

'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Linkedin, Twitter } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission - replace with your actual API endpoint
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormData({ name: '', email: '', company: '', message: '' })
    
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our regulatory intelligence platform? Our team is here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-navy-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gold-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-navy-900">Email</p>
                    <a href="mailto:info@veridiangroup.com" className="text-gray-600 hover:text-gold-600 transition-colors">
                      info@veridiangroup.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gold-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-navy-900">Phone</p>
                    <a href="tel:+18885551234" className="text-gray-600 hover:text-gold-600 transition-colors">
                      +1 (888) 555-1234
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-navy-900">Office</p>
                    <p className="text-gray-600">
                      123 Compliance Way<br />
                      Suite 400<br />
                      Austin, TX 78701
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-navy-900">Hours</p>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM CT</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">Follow us</p>
                <div className="flex gap-3">
                  <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gold-100 transition-colors">
                    <Linkedin className="w-4 h-4 text-navy-600" />
                  </a>
                  <a href="#" className="p-2 bg-gray-100 rounded-lg hover:bg-gold-100 transition-colors">
                    <Twitter className="w-4 h-4 text-navy-600" />
                  </a>
                </div>
              </div>
            </div>

            {/* Emergency Support */}
            <div className="bg-navy-900 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Emergency Support?</h3>
              <p className="text-navy-200 text-sm mb-4">
                For urgent compliance matters, our emergency support team is available 24/7.
              </p>
              <a
                href="tel:+18885551234"
                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors"
              >
                <Phone className="w-4 h-4" />
                +1 (888) 555-1234
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-navy-900 mb-6">Send us a Message</h2>
              
              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-green-600">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="Your Company"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-gold-600 text-white rounded-lg font-semibold hover:bg-gold-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-navy-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-navy-900 mb-2">How quickly can I get a report?</h3>
              <p className="text-gray-600 text-sm">Most reports are delivered within 24 hours of order confirmation.</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-navy-900 mb-2">Do you offer custom enterprise solutions?</h3>
              <p className="text-gray-600 text-sm">Yes, we work with large institutions to build tailored compliance solutions.</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-navy-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600 text-sm">Yes, we use enterprise-grade encryption and security measures.</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-navy-900 mb-2">Can I get a sample report?</h3>
              <p className="text-gray-600 text-sm">Contact our sales team to request a sample compliance report.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
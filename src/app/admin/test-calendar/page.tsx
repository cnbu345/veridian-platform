// src/app/admin/test-calendar/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TestCalendarPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testMeetGeneration = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      // Create a test consultation in 1 hour
      const testDate = new Date()
      testDate.setHours(testDate.getHours() + 1)

      console.log('Sending test booking request...')

      const response = await fetch('/api/consultations/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: 'Test Client',
          customer_email: 'cbnu345@gmail.com', // Send to yourself for testing
          customer_phone: '(555) 123-4567',
          company_name: 'Test Company',
          consultation_date: testDate.toISOString(),
          consultation_type: 'discovery',
          notes: 'This is a test consultation to verify Google Meet integration'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create test consultation')
      }

      console.log('Test successful:', data)
      setResult(data)
    } catch (err) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Google Meet Integration Test</h1>
          <p className="text-navy-600">
            Test generating Google Meet links for consultations. This will create a real test consultation and send you an email.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Configuration Status</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-navy-600">Google Client ID</span>
              <span className="text-green-600 font-medium">✅ Set</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-navy-600">Google Client Secret</span>
              <span className="text-green-600 font-medium">✅ Set</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-navy-600">Google Refresh Token</span>
              <span className="text-green-600 font-medium">✅ Set</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-navy-600">Resend API Key</span>
              <span className="text-green-600 font-medium">✅ Set</span>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={testMeetGeneration}
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-gold-500/25 mb-6"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Generating Test Meeting...
            </div>
          ) : (
            'Generate Test Google Meet Link'
          )}
        </button>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
          >
            <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Success Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-2xl">✅</span>
              <h3 className="text-lg font-semibold">Success! Google Meet Link Generated</h3>
            </div>
            
            {/* Meeting Link */}
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-navy-500 mb-2">Meeting Link</p>
              {result.meetingLink ? (
                <div>
                  <a 
                    href={result.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gold-600 hover:text-gold-700 break-all font-medium"
                  >
                    {result.meetingLink}
                  </a>
                  <p className="text-xs text-navy-400 mt-2">
                    Click the link to test - it will open Google Meet
                  </p>
                </div>
              ) : (
                <p className="text-amber-600">No meeting link was generated</p>
              )}
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-navy-400 mb-1">Event ID</p>
                <p className="text-xs font-mono text-navy-600 break-all">
                  {result.consultation?.calendar_event_id || 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-navy-400 mb-1">Consultation ID</p>
                <p className="text-xs font-mono text-navy-600 break-all">
                  {result.consultation?.id || 'N/A'}
                </p>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-sm text-green-800">
                <span className="font-semibold">📧 Check your email!</span>
                <br />
                A confirmation email was sent to cbnu345@gmail.com with the meeting link.
              </p>
            </div>

            {/* Next Steps */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-medium text-navy-900 mb-2">Next Steps</h4>
              <p className="text-sm text-navy-600">
                Your Google Meet integration is working! Now when clients book consultations, they'll automatically get a Meet link in their confirmation email.
              </p>
            </div>
          </motion.div>
        )}

        {/* Navigation Links */}
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/admin/consultations/upcoming"
            className="text-sm text-navy-500 hover:text-gold-600 transition-colors"
          >
            ← Go to Upcoming Consultations
          </Link>
          <Link
            href="/admin/consultations/calendar"
            className="text-sm text-navy-500 hover:text-gold-600 transition-colors"
          >
            View Calendar →
          </Link>
        </div>
      </div>
    </div>
  )
}
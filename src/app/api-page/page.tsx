// src/app/api-page/page.tsx
// API page - Professional, responsive, mobile-friendly
'use client'

import { Code, Key, Zap, Shield, ArrowRight, Copy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const codeExample = `const response = await fetch('https://api.veridiangroup.com/v1/states/NY', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.licensing_requirements);`

export default function APIPage() {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            API Documentation
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Integrate regulatory data directly into your applications.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-navy-900 mb-3">Endpoints</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gold-600">GET /states</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gold-600">GET /states/{'{code}'}</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gold-600">POST /compare</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gold-600">GET /enforcement</a></li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-navy-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Key className="w-3 h-3 text-gold-600" /> API Key Auth</li>
                <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-gold-600" /> Rate Limits: 1000/hr</li>
                <li className="flex items-center gap-2"><Shield className="w-3 h-3 text-gold-600" /> HTTPS Only</li>
              </ul>
            </div>
          </div>

          {/* Code Example */}
          <div className="lg:col-span-2">
            <div className="bg-navy-900 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-navy-800 border-b border-navy-700 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <button onClick={copyCode} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-sm text-green-400 font-mono overflow-x-auto">
                <code>{codeExample}</code>
              </pre>
            </div>

            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-navy-900 mb-3">Response Example</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "state_code": "NY",
  "license_required": "bitlicense",
  "application_fee": 5000,
  "bond_requirement": "$250,000 - $500,000",
  "processing_time": "12-18 months"
}`}
              </pre>
            </div>

            <div className="mt-6 text-center">
              <Link href="/contact" className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700">
                Request API Access <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
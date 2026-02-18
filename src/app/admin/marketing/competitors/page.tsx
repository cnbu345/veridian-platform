// src/app/admin/marketing/competitors/page.tsx // Competitor Intelligence Dashboard
'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  Calendar,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'

interface Competitor {
  id: string
  name: string
  website: string
  founded: string
  funding: string
  marketShare: number
  pricing: {
    single: number
    monthly: number
    enterprise: number
  }
  features: string[]
  strengths: string[]
  weaknesses: string[]
  recentActivity: Activity[]
  swot: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
}

interface Activity {
  date: string
  type: 'pricing' | 'feature' | 'funding' | 'partnership' | 'acquisition'
  description: string
  impact: 'high' | 'medium' | 'low'
}

export default function CompetitorIntelligence() {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: '1',
      name: 'Chainalysis',
      website: 'chainalysis.com',
      founded: '2014',
      funding: '$366M',
      marketShare: 35,
      pricing: {
        single: 0,
        monthly: 50000,
        enterprise: 100000
      },
      features: ['Compliance', 'Investigation', 'Risk Management'],
      strengths: ['Market leader', 'Strong brand', 'Enterprise relationships'],
      weaknesses: ['Expensive', 'Complex implementation', 'Not state-specific'],
      recentActivity: [
        {
          date: '2026-02-01',
          type: 'feature',
          description: 'Launched new regulatory reporting module',
          impact: 'high'
        }
      ],
      swot: {
        strengths: ['Brand recognition', 'Existing enterprise customers', 'Global presence'],
        weaknesses: ['High price point', 'Complex UI', 'Slow support'],
        opportunities: ['State-specific regulation gap', 'Mid-market underserved'],
        threats: ['New entrants with better pricing', 'State-by-state specialists']
      }
    },
    {
      id: '2',
      name: 'Elliptic',
      website: 'elliptic.co',
      founded: '2013',
      funding: '$80M',
      marketShare: 25,
      pricing: {
        single: 0,
        monthly: 40000,
        enterprise: 80000
      },
      features: ['Screening', 'Monitoring', 'Investigations'],
      strengths: ['Strong in Europe', 'Good analytics', 'API-first'],
      weaknesses: ['Limited state coverage', 'US presence weak'],
      recentActivity: [
        {
          date: '2026-01-15',
          type: 'partnership',
          description: 'Partnered with major European bank',
          impact: 'medium'
        }
      ],
      swot: {
        strengths: ['European market leadership', 'Strong API', 'Good UX'],
        weaknesses: ['Limited US state coverage', 'Smaller sales team'],
        opportunities: ['US expansion', 'State regulation opportunity'],
        threats: ['Chainalysis dominance', 'Regional specialists']
      }
    }
  ])
  
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('1')
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Competitor Intelligence</h1>
        <button className="px-4 py-2 bg-navy-900 text-white rounded-lg">
          Add Competitor
        </button>
      </div>
      
      {/* Market Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Total Addressable Market</span>
            <Target className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">$2.4B</div>
          <div className="text-sm text-green-600 mt-1">↑ 15% YoY</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Our Market Share</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">8%</div>
          <div className="text-sm text-green-600 mt-1">↑ 2% this quarter</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Top Competitor Share</span>
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">35%</div>
          <div className="text-sm text-amber-600 mt-1">Chainalysis</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Price Advantage</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">-60%</div>
          <div className="text-sm text-green-600 mt-1">vs. market leader</div>
        </div>
      </div>
      
      {/* Competitor Selector */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {competitors.map((comp) => (
          <button
            key={comp.id}
            onClick={() => setSelectedCompetitor(comp.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedCompetitor === comp.id
                ? 'bg-navy-900 text-white'
                : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {comp.name}
          </button>
        ))}
      </div>
      
      {/* Competitor Detail */}
      {competitors.map((competitor) => (
        competitor.id === selectedCompetitor && (
          <div key={competitor.id} className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-1">{competitor.name}</h2>
                  <a href={`https://${competitor.website}`} target="_blank" className="text-sm text-gold-600 flex items-center gap-1">
                    {competitor.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-navy-500">Market Share</div>
                    <div className="text-2xl font-bold text-navy-900">{competitor.marketShare}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-navy-500">Founded</div>
                    <div className="text-lg font-semibold">{competitor.founded}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-navy-500">Total Funding</div>
                    <div className="text-lg font-semibold">{competitor.funding}</div>
                  </div>
                </div>
              </div>
              
              {/* Pricing Comparison */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-navy-500 mb-1">Enterprise</div>
                  <div className="text-xl font-bold text-navy-900">${competitor.pricing.enterprise.toLocaleString()}/yr</div>
                  <div className="text-xs text-green-600 mt-1">vs. ${(competitor.pricing.enterprise * 0.6).toLocaleString()} (us)</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-navy-500 mb-1">Monthly</div>
                  <div className="text-xl font-bold text-navy-900">${competitor.pricing.monthly.toLocaleString()}/yr</div>
                  <div className="text-xs text-green-600 mt-1">vs. ${(competitor.pricing.monthly * 0.6).toLocaleString()} (us)</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-navy-500 mb-1">Single Report</div>
                  <div className="text-xl font-bold text-navy-900">${competitor.pricing.single || 'N/A'}</div>
                  <div className="text-xs text-green-600 mt-1">vs. $2,497 (us)</div>
                </div>
              </div>
              
              {/* Feature Comparison */}
              <div>
                <h3 className="font-semibold text-navy-900 mb-2">Key Features</h3>
                <div className="flex flex-wrap gap-2">
                  {competitor.features.map((feature) => (
                    <span key={feature} className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* SWOT Analysis */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {competitor.swot.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Weaknesses
                </h3>
                <ul className="space-y-2">
                  {competitor.swot.weaknesses.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Opportunities
                </h3>
                <ul className="space-y-2">
                  {competitor.swot.opportunities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Threats
                </h3>
                <ul className="space-y-2">
                  {competitor.swot.threats.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-navy-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {competitor.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium
                      ${activity.impact === 'high' ? 'bg-red-100 text-red-800' : ''}
                      ${activity.impact === 'medium' ? 'bg-amber-100 text-amber-800' : ''}
                      ${activity.impact === 'low' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {activity.impact} impact
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-xs text-navy-500 mt-1">{activity.type} • {activity.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  )
}
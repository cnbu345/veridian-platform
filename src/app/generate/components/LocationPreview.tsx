// src/app/generate/components/LocationPreview.tsx
'use client'

import { LocationAnalysis } from '@/lib/location/analyzer'
import { 
  MapPin, 
  Building2, 
  Shield, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Scale,
  Gavel,
  Landmark
} from 'lucide-react'

interface LocationPreviewProps {
  analysis: LocationAnalysis | null
  regulation: any
  isLoading: boolean
}

export default function LocationPreview({ analysis, regulation, isLoading }: LocationPreviewProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
          <span className="ml-3 text-navy-600 font-medium">
            Analyzing regulatory data...
          </span>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'major': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'suburban': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'rural': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getRegulatoryColor = (climate: string) => {
    switch (climate) {
      case 'friendly': return 'text-green-600 bg-green-50'
      case 'moderate': return 'text-amber-600 bg-amber-50'
      case 'strict': return 'text-red-600 bg-red-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  return (
    <div className="bg-gradient-to-br from-navy-50 to-white rounded-2xl 
                    border border-navy-200 overflow-hidden">
      {/* Header */}
      <div className="bg-navy-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-semibold">
              Regulatory Intelligence Preview
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(analysis.tier)}`}>
            {analysis.tier === 'major' ? 'Major Market' : 
             analysis.tier === 'suburban' ? 'Suburban Market' : 'Rural Market'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Location Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-navy-500">Jurisdiction</p>
            <p className="text-2xl font-bold text-navy-900">
              {analysis.city}, {analysis.state}
            </p>
          </div>
          {analysis.msaName && (
            <div className="text-right">
              <p className="text-sm text-navy-500">Metro Area</p>
              <p className="text-sm font-semibold text-navy-900">
                {analysis.msaName}
              </p>
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Regulatory Climate */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Gavel className="w-4 h-4 text-navy-500" />
              <span className="text-xs font-medium text-navy-500">Regulatory</span>
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getRegulatoryColor(analysis.regulatoryClimate)}`}>
              {analysis.regulatoryClimate.charAt(0).toUpperCase() + analysis.regulatoryClimate.slice(1)}
            </div>
            {regulation && (
              <p className="text-xs text-navy-600 mt-2 line-clamp-2">
                {regulation.notes}
              </p>
            )}
          </div>

          {/* License Requirements */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Landmark className="w-4 h-4 text-navy-500" />
              <span className="text-xs font-medium text-navy-500">Licensing</span>
            </div>
            {regulation?.moneyTransmitter && (
              <>
                <p className="text-sm font-bold text-navy-900">
                  {regulation.moneyTransmitter.includes('required') ? 'Required' : 
                   regulation.moneyTransmitter.includes('specific') ? 'No License' : 'Unknown'}
                </p>
                <p className="text-xs text-navy-500 mt-1">
                  {regulation.moneyTransmitter}
                </p>
              </>
            )}
          </div>

          {/* Tax Treatment */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-navy-500" />
              <span className="text-xs font-medium text-navy-500">Tax</span>
            </div>
            {regulation?.taxTreatment && (
              <>
                <p className="text-sm font-bold text-navy-900">
                  {regulation.taxTreatment}
                </p>
                {analysis.state === 'TX' || analysis.state === 'FL' || 
                 analysis.state === 'NV' || analysis.state === 'WY' ? (
                  <p className="text-xs text-green-600 mt-1">No state income tax</p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1">State income tax applies</p>
                )}
              </>
            )}
          </div>

          {/* Market Opportunity */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-navy-500" />
              <span className="text-xs font-medium text-navy-500">Opportunity</span>
            </div>
            <p className={`text-lg font-bold ${
              analysis.marketOpportunity === 'excellent' ? 'text-green-600' :
              analysis.marketOpportunity === 'good' ? 'text-blue-600' :
              analysis.marketOpportunity === 'fair' ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {analysis.marketOpportunity.charAt(0).toUpperCase() + analysis.marketOpportunity.slice(1)}
            </p>
          </div>
        </div>

        {/* Regulatory Insights */}
        <div className="bg-navy-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-navy-900 mb-3">
            Regulatory Insights
          </h4>
          <ul className="space-y-2">
            {analysis.regulatoryClimate === 'friendly' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Business-friendly regulatory environment - lower compliance burden</span>
              </li>
            )}
            {analysis.regulatoryClimate === 'strict' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Strict regulatory oversight - enhanced compliance planning required</span>
              </li>
            )}
            {analysis.state === 'NY' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>BitLicense required for digital asset activities</span>
              </li>
            )}
            {analysis.state === 'CA' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>DFPI licensing required for money transmission</span>
              </li>
            )}
            {analysis.state === 'TX' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>No specific money transmitter license - business friendly</span>
              </li>
            )}
            {analysis.state === 'WY' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Most crypto-friendly state - DAO LLC structure available</span>
              </li>
            )}
            {regulation?.lastUpdated && (
              <li className="flex items-start gap-2 text-sm text-navy-500 mt-2">
                <span className="text-xs">Last updated: {regulation.lastUpdated}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Talent/Web3 Hub Info (secondary) */}
        {analysis.nearestWeb3Hub && (
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-navy-500" />
              <span className="text-xs font-medium text-navy-500">Compliance Resources</span>
            </div>
            <p className="text-sm text-navy-700">
              <span className="font-medium">Nearest legal/regulatory hub:</span> {analysis.nearestWeb3Hub}
              {analysis.web3HubType === 'primary' && ' (Major compliance center)'}
            </p>
            {analysis.distanceToMajor && (
              <p className="text-xs text-navy-500 mt-1">
                ~{analysis.distanceToMajor} miles • Access to specialized compliance counsel
              </p>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-navy-400 italic">
          *Regulatory analysis based on current state laws. Requirements may change. 
          Consult with qualified legal counsel in {analysis.state} before making compliance decisions.
        </p>
      </div>
    </div>
  )
}
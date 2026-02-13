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
  Loader2
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
            Analyzing location data...
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
            <MapPin className="w-5 h-5 text-gold-500" />
            <h3 className="text-white font-semibold">
              Location Intelligence Report
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(analysis.tier)}`}>
            {analysis.tier.charAt(0).toUpperCase() + analysis.tier.slice(1)} Market
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Location Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-navy-500">Location</p>
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
              <Shield className="w-4 h-4 text-navy-500" />
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

          {/* Web3 Hub Access */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-navy-500" />
              <span className="text-xs font-medium text-navy-500">Web3 Hub</span>
            </div>
            {analysis.nearestWeb3Hub ? (
              <>
                <p className="text-lg font-bold text-navy-900">
                  {analysis.nearestWeb3Hub}
                </p>
                {analysis.web3HubType && (
                  <span className="text-xs text-navy-600">
                    {analysis.web3HubType === 'primary' ? 'Primary Hub' : 'Secondary Hub'}
                  </span>
                )}
                {analysis.distanceToMajor && (
                  <p className="text-xs text-navy-500 mt-1">
                    {analysis.distanceToMajor} miles away
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-navy-600">No nearby hub</p>
            )}
          </div>

          {/* Talent Density */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-navy-500" />
              <span className="text-xs font-medium text-navy-500">Talent</span>
            </div>
            <p className={`text-lg font-bold ${
              analysis.talentDensity === 'high' ? 'text-green-600' :
              analysis.talentDensity === 'medium' ? 'text-amber-600' :
              'text-slate-600'
            }`}>
              {analysis.talentDensity.charAt(0).toUpperCase() + analysis.talentDensity.slice(1)}
            </p>
            {analysis.web3HubScore && (
              <p className="text-xs text-navy-500 mt-1">
                Hub Score: {analysis.web3HubScore}/100
              </p>
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

        {/* Key Insights */}
        <div className="bg-navy-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-navy-900 mb-3">
            Location Insights
          </h4>
          <ul className="space-y-2">
            {analysis.tier === 'major' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Major metropolitan area with strong Web3 infrastructure and talent pool</span>
              </li>
            )}
            {analysis.tier === 'suburban' && analysis.nearestMajorCity && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Suburban location with access to {analysis.nearestMajorCity} ecosystem</span>
              </li>
            )}
            {analysis.tier === 'rural' && analysis.nearestMajorCity && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Rural location - recommend remote-first strategy with hub access in {analysis.nearestMajorCity}</span>
              </li>
            )}
            {analysis.regulatoryClimate === 'friendly' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Crypto-friendly regulations - lower compliance barriers</span>
              </li>
            )}
            {analysis.regulatoryClimate === 'strict' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Strict regulatory environment - enhanced compliance planning needed</span>
              </li>
            )}
            {analysis.web3HubType === 'primary' && (
              <li className="flex items-start gap-2 text-sm text-navy-700">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>Located in a primary Web3 hub - access to talent, capital, and community</span>
              </li>
            )}
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-navy-400 italic">
          *Analysis based on current Web3 ecosystem data. Talent density and regulatory 
          classifications are estimates and should be verified independently.
        </p>
      </div>
    </div>
  )
}
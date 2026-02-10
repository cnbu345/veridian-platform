'use client'

import { useState } from 'react'
import { classifyLocation, LocationData } from '@/lib/locationService'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

export default function LocationForm() {
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [locationInfo, setLocationInfo] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!city || !state) {
      alert('Please enter both city and state')
      return
    }

    setLoading(true)
    try {
      const classified = await classifyLocation(city, state)
      setLocationInfo(classified)
    } catch (error) {
      console.error('Location analysis error:', error)
      alert('Error analyzing location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'major': return 'bg-green-100 text-green-800'
      case 'suburban': return 'bg-yellow-100 text-yellow-800'
      case 'rural': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'major': return 'Major Metropolitan Area'
      case 'suburban': return 'Suburban/Metro Adjacent'
      case 'rural': return 'Rural Area'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="text-lg font-semibold mb-4">Enter Your Business Location</h3>
        <p className="text-sm text-gray-600 mb-4">
          We'll analyze your location for Web3 opportunities and regulations
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Austin"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State
        </label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select State</option>
          {US_STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !city || !state}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Analyze Location'}
      </button>

      {locationInfo && (
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Location Analysis Results</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">Location</span>
              <p className="text-lg font-semibold">
                {locationInfo.city}, {locationInfo.state}
              </p>
            </div>

            <div>
              <span className="text-sm text-gray-600">Market Tier</span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(locationInfo.tier)}`}>
                  {locationInfo.tier.toUpperCase()}
                </span>
                <span className="text-gray-700">{getTierDescription(locationInfo.tier)}</span>
              </div>
            </div>

            {locationInfo.nearestWeb3Hub && (
              <div>
                <span className="text-sm text-gray-600">Nearest Web3 Hub</span>
                <p className="text-lg font-semibold">
                  {locationInfo.nearestWeb3Hub}, {locationInfo.state}
                  {locationInfo.web3HubType && (
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      ({locationInfo.web3HubType === 'primary' ? 'Primary Hub' : 'Secondary Hub'})
                    </span>
                  )}
                </p>
              </div>
            )}

            {locationInfo.distanceToMajor && (
              <div>
                <span className="text-sm text-gray-600">Distance to Major City</span>
                <p className="text-lg font-semibold">
                  ≈ {locationInfo.distanceToMajor} miles
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Next Step:</strong> Based on this analysis, your AI-generated Web3 strategy report will include location-specific recommendations, regulatory guidance for {locationInfo.state}, and connections to resources in {locationInfo.nearestWeb3Hub || 'nearby major cities'}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
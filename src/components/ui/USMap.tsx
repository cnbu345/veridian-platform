// src/components/ui/USMap.tsx
// Centered US Map - No horizontal scroll

'use client'

import { useState, useEffect } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps'
import { cn } from '@/lib/utils/utils'

// US GeoJSON data (TopoJSON format)
const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

// Climate color mapping
const CLIMATE_COLORS = {
  friendly: '#22c55e',
  moderate: '#eab308',
  strict: '#ef4444',
  unknown: '#94a3b8'
}

// State name to code mapping
const STATE_NAME_TO_CODE: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY'
}

interface USMapProps {
  statesData: Map<string, {
    climate: string
    license_required: string
    state_name: string
  }>
  onStateHover: (stateCode: string | null, stateData: any) => void
  onStateClick: (stateCode: string | null, stateData: any) => void
  selectedState: string | null
  className?: string
}

export default function USMap({ statesData, onStateHover, onStateClick, selectedState, className }: USMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(1024)

  useEffect(() => {
    setMounted(true)
    
    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Responsive map settings - centered, no horizontal scroll
  const getMapSettings = () => {
    if (viewportWidth < 640) { // Mobile
      return { scale: 1120, translate: [300, 150], maxHeight: '280px' }
    } else if (viewportWidth < 768) { // Tablet
      return { scale: 1150, translate: [300, 150], maxHeight: '320px' }
    } else if (viewportWidth < 1024) { // Small desktop
      return { scale: 1250, translate: [300, 150], maxHeight: '360px' }
    } else { // Large desktop
      return { scale: 1300, translate: [300, 150], maxHeight: '380px' }
    }
  }

  const mapSettings = getMapSettings()

  const getStateColor = (geography: any): string => {
    const stateName = geography.properties.name
    const stateCode = STATE_NAME_TO_CODE[stateName]
    if (!stateCode) return CLIMATE_COLORS.unknown
    
    const stateInfo = statesData.get(stateCode)
    if (!stateInfo) return CLIMATE_COLORS.unknown
    
    const climate = stateInfo.climate
    return CLIMATE_COLORS[climate as keyof typeof CLIMATE_COLORS] || CLIMATE_COLORS.unknown
  }

  const handleMouseEnter = (geography: any) => {
    const stateName = geography.properties.name
    const stateCode = STATE_NAME_TO_CODE[stateName]
    if (stateCode) {
      setHoveredState(stateCode)
      const stateInfo = statesData.get(stateCode)
      onStateHover(stateCode, stateInfo)
    }
  }

  const handleMouseLeave = () => {
    setHoveredState(null)
    onStateHover(null, null)
  }

  const handleClick = (geography: any) => {
    const stateName = geography.properties.name
    const stateCode = STATE_NAME_TO_CODE[stateName]
    if (stateCode) {
      const stateInfo = statesData.get(stateCode)
      onStateClick(stateCode, stateInfo)
    }
  }

  // Show loading placeholder on server
  if (!mounted) {
    return (
      <div className={cn("w-full bg-gray-50 rounded-xl p-2 flex items-center justify-center", className)} style={{ minHeight: '280px' }}>
        <div className="animate-pulse text-gray-400">Loading map...</div>
      </div>
    )
  }

  return (
    <div className={cn("w-full bg-gray-50 rounded-xl p-2 flex justify-center", className)} suppressHydrationWarning>
      <div className="w-full max-w-full overflow-visible">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: mapSettings.scale,
            translate: [300, 150]
          }}
          className="w-full h-auto"
          style={{ 
            maxHeight: mapSettings.maxHeight,
            margin: '0 auto',
            display: 'block'
          }}
        >
          <ZoomableGroup center={[0, 0]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name
                  const stateCode = STATE_NAME_TO_CODE[stateName]
                  const isSelected = selectedState === stateCode
                  const isHovered = hoveredState === stateCode
                  const fillColor = getStateColor(geo)
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => handleMouseEnter(geo)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(geo)}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: '#ffffff',
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        hover: {
                          fill: fillColor,
                          stroke: isHovered ? '#1e293b' : '#ffffff',
                          strokeWidth: 1,
                          outline: 'none',
                          cursor: 'pointer',
                          filter: 'brightness(0.92)'
                        },
                        pressed: {
                          fill: fillColor,
                          stroke: '#1e293b',
                          strokeWidth: 1.5,
                          outline: 'none'
                        }
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  )
}
// src/app/admin/components/FounderCircleTracker.tsx // Founder Circle Tracker
'use client'

import { AdminDashboardStats } from '@/types/admin'
import { Users, TrendingUp, Award } from 'lucide-react'

interface FounderCircleTrackerProps {
  stats: AdminDashboardStats
}

export default function FounderCircleTracker({ stats }: FounderCircleTrackerProps) {
  const totalSpots = 50
  const usedSpots = totalSpots - stats.founderCircle.spotsRemaining
  const percentageUsed = (usedSpots / totalSpots) * 100

  return (
    <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Founder's Circle</h2>
            <p className="text-navy-300 text-sm">Exclusive pricing for first 50 customers</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-gold-500">{stats.founderCircle.spotsRemaining}</div>
          <div className="text-navy-300 text-sm">spots remaining</div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-4 bg-navy-700 rounded-full overflow-hidden mb-4">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-500"
          style={{ width: `${percentageUsed}%` }}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-sm text-navy-300 mb-1">Total Spots</div>
          <div className="text-2xl font-bold">{totalSpots}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-sm text-navy-300 mb-1">Used</div>
          <div className="text-2xl font-bold">{usedSpots}</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <div className="text-sm text-navy-300 mb-1">Revenue Impact</div>
          <div className="text-2xl font-bold text-gold-500">
            ${(usedSpots * 1500).toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Urgency indicator */}
      {stats.founderCircle.spotsRemaining < 10 && (
        <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <p className="text-sm text-red-200">
            Only {stats.founderCircle.spotsRemaining} spots left! Consider extending the offer.
          </p>
        </div>
      )}
    </div>
  )
}
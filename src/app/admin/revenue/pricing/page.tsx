// src/app/admin/revenue/pricing/page.tsx // Admin Price Management
'use client'

import { useState } from 'react'
import { Save, DollarSign, Users, Building2 } from 'lucide-react'

interface PricingTier {
  id: string
  name: string
  price: number
  founderPrice?: number
  founderSpots: number
  founderSpotsRemaining: number
  period: 'one-time' | 'monthly' | 'yearly'
  features: string[]
  stripePriceId: string
  active: boolean
}

export default function PricingManagement() {
  const [tiers, setTiers] = useState<PricingTier[]>([
    {
      id: 'single',
      name: 'Single Report',
      price: 2497,
      founderPrice: 997,
      founderSpots: 50,
      founderSpotsRemaining: 38,
      period: 'one-time',
      stripePriceId: 'price_single_regular',
      active: true,
      features: [
        'Complete location-intelligent report',
        'State-specific regulatory analysis',
        'License requirement matrix',
        '90-day compliance action plan',
        '30-minute consultation call'
      ]
    },
    {
      id: 'quarterly',
      name: 'Quarterly Intelligence',
      price: 5997,
      period: 'yearly',
      stripePriceId: 'price_quarterly',
      active: true,
      features: [
        '4 reports per year (quarterly updates)',
        'Email alerts when state laws change (real-time)',
        'Priority support',
        'Access to new features'
      ]
    },
    {
      id: 'monthly',
      name: 'Enterprise Suite',
      price: 14997,
      period: 'yearly',
      stripePriceId: 'price_enterprise_suite',
      active: true,
      features: [
        '12 reports per year',
        'Multi-state analysis capability (compare up to 3 states per report)',
        'Team access (up to 10 users)',
        'API access (coming soon)',
        'Quarterly strategy calls (60 min each)',
        'White-label option for client reports'
      ]
    },
    {
      id: 'custom',
      name: 'Custom Enterprise',
      price: 25000,
      period: 'yearly',
      stripePriceId: 'price_custom_enterprise',
      active: true,
      features: [
        'Unlimited reports',
        'Custom industry deep-dives',
        'Direct consultation as needed',
        'Dedicated account manager',
        'SLA guarantees'
      ]
    }
  ])
  
  const [founderCircleEnabled, setFounderCircleEnabled] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const handlePriceChange = (tierId: string, newPrice: number) => {
    setTiers(tiers.map(tier => 
      tier.id === tierId ? { ...tier, price: newPrice } : tier
    ))
  }
  
  const handleFounderPriceChange = (tierId: string, newPrice: number) => {
    setTiers(tiers.map(tier => 
      tier.id === tierId ? { ...tier, founderPrice: newPrice } : tier
    ))
  }
  
  const handleSpotsChange = (tierId: string, newSpots: number) => {
    setTiers(tiers.map(tier => 
      tier.id === tierId ? { ...tier, founderSpotsRemaining: newSpots } : tier
    ))
  }
  
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save founder circle setting
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'founder_circle_enabled',
          value: String(founderCircleEnabled)
        })
      })
      
      // Save each pricing tier
      for (const tier of tiers) {
        await fetch('/api/admin/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tier.id,
            name: tier.name,
            price: tier.price,
            founderPrice: tier.founderPrice,
            founderSpots: tier.founderSpots,
            founderSpotsRemaining: tier.founderSpotsRemaining,
            period: tier.period,
            stripePriceId: tier.stripePriceId,
            active: tier.active,
            features: tier.features
          })
        })
      }
      
      alert('Pricing updated successfully!')
    } catch (error) {
      console.error('Failed to update pricing:', error)
      alert('Failed to update pricing. Check console for details.')
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Pricing Management</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      {/* Founder's Circle Control */}
      <div className="bg-gradient-to-r from-gold-600 to-gold-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Founder's Circle</h2>
            <p className="text-gold-100">Special pricing for first 50 customers</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={founderCircleEnabled}
              onChange={(e) => setFounderCircleEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-white peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-sm text-gold-200 mb-1">Total Spots</div>
            <div className="text-2xl font-bold">50</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-sm text-gold-200 mb-1">Remaining</div>
            <div className="text-2xl font-bold">38</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-sm text-gold-200 mb-1">Used</div>
            <div className="text-2xl font-bold">12</div>
          </div>
        </div>
      </div>
      
      {/* Pricing Tiers */}
      {tiers.map((tier) => (
        <div key={tier.id} className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-navy-900">{tier.name}</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              {tier.period}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm text-navy-500 mb-1">Regular Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="number"
                  value={tier.price}
                  onChange={(e) => handlePriceChange(tier.id, Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            
            {tier.id === 'single' && founderCircleEnabled && (
              <>
                <div>
                  <label className="block text-sm text-navy-500 mb-1">Founder's Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      type="number"
                      value={tier.founderPrice}
                      onChange={(e) => handleFounderPriceChange(tier.id, Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-navy-500 mb-1">Spots Remaining</label>
                  <input
                    type="number"
                    value={tier.founderSpotsRemaining}
                    onChange={(e) => handleSpotsChange(tier.id, Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    max={tier.founderSpots}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-navy-700 mb-2">Features</h4>
            <ul className="space-y-1">
              {tier.features.map((feature, index) => (
                <li key={index} className="text-xs text-navy-600 flex items-start gap-2">
                  <span className="text-gold-600">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-xs text-navy-400 mt-4">
            Stripe Price ID: <code className="bg-slate-100 px-2 py-1 rounded">{tier.stripePriceId}</code>
          </div>
        </div>
      ))}
    </div>
  )
}
// src/app/admin/customers/components/CustomerFilters.tsx
'use client'

import { Search, Filter, X } from 'lucide-react'
import { useState } from 'react'

interface CustomerFiltersProps {
  filter: string
  onFilterChange: (filter: string) => void
  search: string
  onSearchChange: (search: string) => void
}

export default function CustomerFilters({ 
  filter, 
  onFilterChange, 
  search, 
  onSearchChange 
}: CustomerFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  const filters = [
    { value: 'all', label: 'All Customers', color: 'navy' },
    { value: 'healthy', label: 'Healthy', color: 'green' },
    { value: 'moderate', label: 'Moderate', color: 'amber' },
    { value: 'at_risk', label: 'At Risk', color: 'red' }
  ]
  
  return (
    <div className="space-y-3">
      {/* Search Bar - Always Visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-navy-600"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by Risk Level
          </span>
          <span className="text-navy-400">{showMobileFilters ? '▲' : '▼'}</span>
        </button>
        
        {showMobileFilters && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  onFilterChange(f.value)
                  setShowMobileFilters(false)
                }}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.value
                    ? f.value === 'all' ? 'bg-navy-900 text-white'
                    : f.value === 'healthy' ? 'bg-green-600 text-white'
                    : f.value === 'moderate' ? 'bg-amber-600 text-white'
                    : 'bg-red-600 text-white'
                    : 'bg-white text-navy-600 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Desktop Filters */}
      <div className="hidden lg:flex items-center gap-3">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? f.value === 'all' ? 'bg-navy-900 text-white'
                : f.value === 'healthy' ? 'bg-green-600 text-white'
                : f.value === 'moderate' ? 'bg-amber-600 text-white'
                : 'bg-red-600 text-white'
                : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
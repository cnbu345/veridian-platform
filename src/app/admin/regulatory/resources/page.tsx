// src/app/admin/regulatory/resources/page.tsx
// Regulatory Resources - Curated list of helpful links for attorneys

'use client'

import { useState } from 'react'
import {
  ExternalLink,
  Search,
  BookOpen,
  FileText,
  Database,
  Globe,
  Link as LinkIcon,
  Star,
  ChevronRight
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: 'federal' | 'state' | 'industry' | 'tools' | 'legal'
  icon: React.ReactNode
  featured?: boolean
}

const RESOURCES: Resource[] = [
  // Federal Resources
  {
    id: 'sec',
    title: 'SEC - Crypto Assets',
    description: 'SEC guidance on digital assets, enforcement actions, and regulatory framework.',
    url: 'https://www.sec.gov/crypto',
    category: 'federal',
    icon: <FileText className="w-5 h-5" />,
    featured: true
  },
  {
    id: 'finCEN',
    title: 'FinCEN - Virtual Currency',
    description: 'Financial Crimes Enforcement Network guidance on cryptocurrency and money transmission.',
    url: 'https://www.fincen.gov/virtual-currency',
    category: 'federal',
    icon: <Database className="w-5 h-5" />
  },
  {
    id: 'cfpb',
    title: 'CFPB - Digital Payments',
    description: 'Consumer Financial Protection Bureau resources on digital payments and consumer protection.',
    url: 'https://www.consumerfinance.gov/digital-payments',
    category: 'federal',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'federal-reserve',
    title: 'Federal Reserve - Digital Assets',
    description: 'Federal Reserve research and guidance on digital assets and stablecoins.',
    url: 'https://www.federalreserve.gov/digital-assets.htm',
    category: 'federal',
    icon: <Database className="w-5 h-5" />
  },

  // State Resources
  {
    id: 'nmls',
    title: 'NMLS Consumer Access',
    description: 'Search money transmitter licenses by state. Official registry of licensed entities.',
    url: 'https://www.nmlsconsumeraccess.org',
    category: 'state',
    icon: <Globe className="w-5 h-5" />,
    featured: true
  },
  {
    id: 'csbs',
    title: 'CSBS - Money Services Business',
    description: 'Conference of State Bank Supervisors MSB resources and licensing information.',
    url: 'https://www.csbs.org/money-services-businesses',
    category: 'state',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'multistate',
    title: 'Multi-State Licensing Compact',
    description: 'Information about the MSB licensing compact for streamlined multi-state licensing.',
    url: 'https://www.csbs.org/msb-licensing-compact',
    category: 'state',
    icon: <LinkIcon className="w-5 h-5" />
  },

  // Industry Resources
  {
    id: 'blockchain-association',
    title: 'Blockchain Association',
    description: 'Industry advocacy group with regulatory resources and policy updates.',
    url: 'https://theblockchainassociation.org',
    category: 'industry',
    icon: <BookOpen className="w-5 h-5" />,
    featured: true
  },
  {
    id: 'crypto-council',
    title: 'Crypto Council for Innovation',
    description: 'Global alliance advancing crypto regulation and policy.',
    url: 'https://cryptocouncil.org',
    category: 'industry',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: 'digital-chamber',
    title: 'Digital Chamber of Commerce',
    description: 'Policy resources, regulatory updates, and industry reports.',
    url: 'https://digitalchamber.org',
    category: 'industry',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: 'acams',
    title: 'ACAMS - Crypto Compliance',
    description: 'Association of Certified Anti-Money Laundering Specialists crypto resources.',
    url: 'https://www.acams.org/en/topics/cryptocurrency',
    category: 'industry',
    icon: <Database className="w-5 h-5" />
  },

  // Tools & Databases
  {
    id: 'legiscan',
    title: 'LegiScan - Legislation Tracker',
    description: 'Free API to track legislation across all 50 states.',
    url: 'https://legiscan.com',
    category: 'tools',
    icon: <Database className="w-5 h-5" />,
    featured: true
  },
  {
    id: 'congress-gov',
    title: 'Congress.gov - Federal Legislation',
    description: 'Official source for federal bill text and status.',
    url: 'https://www.congress.gov',
    category: 'tools',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'nclc',
    title: 'NCLC - Consumer Law',
    description: 'National Consumer Law Center resources on digital assets and consumer protection.',
    url: 'https://www.nclc.org',
    category: 'legal',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: 'law360',
    title: 'Law360 - FinTech',
    description: 'Legal news and analysis on FinTech and crypto regulation.',
    url: 'https://www.law360.com/fintech',
    category: 'legal',
    icon: <FileText className="w-5 h-5" />
  },

  // Legal Research
  {
    id: 'cornell-law',
    title: 'Cornell LII - Digital Assets',
    description: 'Legal Information Institute resources on cryptocurrency law.',
    url: 'https://www.law.cornell.edu/wex/cryptocurrency',
    category: 'legal',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: 'harvard-legal',
    title: 'Harvard Law - Blockchain',
    description: 'Harvard Law School research on blockchain and digital assets.',
    url: 'https://hls.harvard.edu/blockchain',
    category: 'legal',
    icon: <BookOpen className="w-5 h-5" />
  }
]

const CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: <Database className="w-4 h-4" /> },
  { id: 'federal', label: 'Federal', icon: <FileText className="w-4 h-4" /> },
  { id: 'state', label: 'State', icon: <Globe className="w-4 h-4" /> },
  { id: 'industry', label: 'Industry', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'tools', label: 'Tools', icon: <Database className="w-4 h-4" /> },
  { id: 'legal', label: 'Legal Research', icon: <BookOpen className="w-4 h-4" /> }
]

export default function RegulatoryResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResources = RESOURCES.filter(resource => {
    if (selectedCategory !== 'all' && resource.category !== selectedCategory) return false
    if (searchTerm && !resource.title.toLowerCase().includes(searchTerm.toLowerCase()) && !resource.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const featuredResources = RESOURCES.filter(r => r.featured)

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Regulatory Resources</h1>
        <p className="text-gray-500 mt-1">Curated resources for regulatory research and compliance</p>
      </div>

      {/* Featured Resources */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          Featured Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredResources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gold-50 rounded-lg flex items-center justify-center text-gold-600 group-hover:bg-gold-100 transition-colors">
                  {resource.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 group-hover:text-gold-600 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gold-600">
                    Visit Resource <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gold-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* All Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
                {resource.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 group-hover:text-gold-600 transition-colors">
                    {resource.title}
                  </h3>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gold-500" />
                </div>
                <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                <div className="mt-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {CATEGORIES.find(c => c.id === resource.category)?.label || resource.category}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No resources found matching your criteria</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('all') }}
            className="mt-2 text-gold-600 hover:text-gold-700"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-500 text-center">
          Resources are curated for regulatory research. Links open in new tabs. 
          Always verify information with official state sources.
        </p>
      </div>
    </div>
  )
}
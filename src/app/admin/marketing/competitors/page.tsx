// src/app/admin/marketing/competitors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Award,
  Zap,
  Activity,
  Building2,
  X,
  Edit2,
  Trash2,
  Star,
  Tag,
  Lightbulb,
  Rocket,
  Gauge,
  BarChart3,
  Eye,
  Clock,
  Handshake,
} from 'lucide-react';
import { marketingClient } from '@/lib/marketing';

interface Competitor {
  id: string;
  name: string;
  website: string;
  founded: string;
  funding: string;
  market_share: number;
  market_position: 'leader' | 'challenger' | 'niche' | 'emerging';
  category?: 'direct' | 'indirect' | 'potential' | 'partner';
  tags?: string[];
  notes?: string;
  pricing: {
    single: number;
    monthly: number;
    enterprise: number;
  };
  features: string[];
  strengths: string[];
  weaknesses: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  metrics: {
    webTraffic: number;
    socialFollowers: number;
    employeeCount: number;
    customerCount: number;
    annualRevenue: number;
  };
  recent_activity: Array<{
    date: string;
    type: string;
    description: string;
    impact: string;
  }>;
}

interface CompetitorComparison {
  id: string;
  name: string;
  market_share: number;
  market_position: string;
  competitive_score: number;
  feature_count: number;
  customer_count: string;
}

export default function CompetitorIntelligence() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [comparison, setComparison] = useState<CompetitorComparison[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterMarketPosition, setFilterMarketPosition] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    founded: '',
    funding: '',
    market_share: 0,
    market_position: 'challenger' as const,
    category: 'direct' as const,
    tags: '',
    notes: '',
    enterprise_price: 0,
    monthly_price: 0,
    single_price: 0,
    features: '',
    strengths: '',
    weaknesses: '',
    swot_strengths: '',
    swot_weaknesses: '',
    swot_opportunities: '',
    swot_threats: '',
    web_traffic: 0,
    social_followers: 0,
    employee_count: 0,
    customer_count: 0,
    annual_revenue: 0,
  });

  useEffect(() => {
    fetchCompetitors();
  }, []);

  // Generate strategic recommendations when selected competitor changes
  useEffect(() => {
    if (selectedCompetitor && competitors.length > 0) {
      generateRecommendations();
    }
  }, [selectedCompetitor, competitors]);

  const fetchCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await marketingClient.getCompetitors();
      setCompetitors(data);
      if (data.length > 0 && !selectedCompetitor) {
        setSelectedCompetitor(data[0].id);
      }
      
      try {
        const compData = await marketingClient.getCompetitorComparison();
        setComparison(compData);
      } catch (err) {
        console.log('Comparison view not available yet');
      }
    } catch (err) {
      console.error('Error fetching competitors:', err);
      setError('Failed to load competitors. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = () => {
    const selected = competitors.find(c => c.id === selectedCompetitor);
    if (!selected) return;

    const recs: string[] = [];
    const ourPrice = 40000;
    const ourFeatures = ['State-Specific Regulation', 'Real-Time Updates', 'Custom Reports', 'API Access'];
    
    // Pricing opportunity
    const priceAdvantage = ((selected.pricing.enterprise - ourPrice) / selected.pricing.enterprise) * 100;
    if (priceAdvantage > 0) {
      recs.push(`Leverage ${Math.round(priceAdvantage)}% price advantage in enterprise deals against ${selected.name}`);
    }
    
    // Feature gap analysis
    const missingFeatures = selected.features.filter(f => 
      !ourFeatures.some(our => f.toLowerCase().includes(our.toLowerCase()))
    );
    if (missingFeatures.length > 0) {
      recs.push(`Feature gap: ${missingFeatures[0]} is a key competitor feature - consider roadmap prioritization`);
    }
    
    // Market position strategy
    if (selected.market_position === 'leader') {
      recs.push(`Differentiation opportunity: Focus on state-specific regulatory expertise that ${selected.name} lacks`);
    } else if (selected.market_position === 'challenger') {
      recs.push(`Market expansion: Target regions where ${selected.name} has weak presence, particularly in state-level compliance`);
    }
    
    // Growth analysis
    if (selected.metrics.annualRevenue > 30000000) {
      recs.push(`${selected.name} is growing rapidly - consider aggressive marketing in their strong segments`);
    }
    
    // Strength-based recommendations
    if (selected.swot.strengths.some(s => s.toLowerCase().includes('api'))) {
      recs.push(`${selected.name} has strong API capabilities - consider enhancing your API documentation and developer experience`);
    }
    
    // Weakness-based opportunities
    if (selected.swot.weaknesses.some(w => w.toLowerCase().includes('state'))) {
      recs.push(`${selected.name} lacks state-specific coverage - double down on your state regulatory expertise`);
    }
    
    setRecommendations(recs.slice(0, 4));
  };

  const handleAddCompetitor = async () => {
    if (!formData.name.trim()) {
      alert('Please enter competitor name');
      return;
    }

    setSaving(true);
    try {
      const newCompetitor = {
        name: formData.name,
        website: formData.website,
        founded: formData.founded,
        funding: formData.funding,
        market_share: formData.market_share,
        market_position: formData.market_position,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        notes: formData.notes,
        pricing: {
          single: formData.single_price,
          monthly: formData.monthly_price,
          enterprise: formData.enterprise_price,
        },
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        strengths: formData.strengths.split(',').map(s => s.trim()).filter(s => s),
        weaknesses: formData.weaknesses.split(',').map(w => w.trim()).filter(w => w),
        swot: {
          strengths: formData.swot_strengths.split(',').map(s => s.trim()).filter(s => s),
          weaknesses: formData.swot_weaknesses.split(',').map(w => w.trim()).filter(w => w),
          opportunities: formData.swot_opportunities.split(',').map(o => o.trim()).filter(o => o),
          threats: formData.swot_threats.split(',').map(t => t.trim()).filter(t => t),
        },
        metrics: {
          webTraffic: formData.web_traffic,
          socialFollowers: formData.social_followers,
          employeeCount: formData.employee_count,
          customerCount: formData.customer_count,
          annualRevenue: formData.annual_revenue,
        },
        recent_activity: [{
          date: new Date().toISOString().split('T')[0],
          type: 'feature',
          description: `${formData.name} added to competitor tracking`,
          impact: 'medium',
        }],
      };

      await marketingClient.createCompetitor(newCompetitor);
      await fetchCompetitors();
      resetForm();
      setShowAddModal(false);
      alert(`${formData.name} has been added successfully!`);
    } catch (err) {
      console.error('Error adding competitor:', err);
      alert('Failed to add competitor. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompetitor = async (id: string) => {
    try {
      await marketingClient.deleteCompetitor(id);
      await fetchCompetitors();
      setShowDeleteConfirm(null);
      if (selectedCompetitor === id && competitors.length > 1) {
        setSelectedCompetitor(competitors[0]?.id || null);
      }
    } catch (err) {
      console.error('Error deleting competitor:', err);
      alert('Failed to delete competitor. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      website: '',
      founded: '',
      funding: '',
      market_share: 0,
      market_position: 'challenger',
      category: 'direct',
      tags: '',
      notes: '',
      enterprise_price: 0,
      monthly_price: 0,
      single_price: 0,
      features: '',
      strengths: '',
      weaknesses: '',
      swot_strengths: '',
      swot_weaknesses: '',
      swot_opportunities: '',
      swot_threats: '',
      web_traffic: 0,
      social_followers: 0,
      employee_count: 0,
      customer_count: 0,
      annual_revenue: 0,
    });
  };

  const filteredCompetitors = competitors.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterMarketPosition === 'all' || comp.market_position === filterMarketPosition;
    const matchesCategory = filterCategory === 'all' || comp.category === filterCategory;
    return matchesSearch && matchesPosition && matchesCategory;
  });

  const selectedComp = competitors.find(c => c.id === selectedCompetitor);
  const selectedComparison = comparison.find(c => c.id === selectedCompetitor);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Eye className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <DollarSign className="w-4 h-4" />;
      case 'feature': return <Zap className="w-4 h-4" />;
      case 'funding': return <TrendingUp className="w-4 h-4" />;
      case 'partnership': return <Handshake className="w-4 h-4" />;
      case 'acquisition': return <Building2 className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPositionColor = (position?: string) => {
    switch (position) {
      case 'leader': return 'bg-green-100 text-green-800';
      case 'challenger': return 'bg-amber-100 text-amber-800';
      case 'niche': return 'bg-blue-100 text-blue-800';
      case 'emerging': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'direct': return 'bg-red-100 text-red-800';
      case 'indirect': return 'bg-orange-100 text-orange-800';
      case 'potential': return 'bg-yellow-100 text-yellow-800';
      case 'partner': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const avgPrice = competitors.reduce((sum, c) => sum + c.pricing.enterprise, 0) / (competitors.length || 1);
  const ourPrice = 40000;

  // Empty state when no competitors exist
  if (!loading && competitors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">Competitor Intelligence</h1>
            <p className="text-navy-500 mt-1">Track market positioning, feature gaps, and competitive threats</p>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-navy-900 text-white rounded-lg flex items-center gap-2 hover:bg-navy-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Competitor
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-navy-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No Competitors Added Yet</h3>
            <p className="text-navy-500 mb-6">
              Start tracking your competition by adding your first competitor. This will help you identify market opportunities and stay ahead.
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-6 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
            >
              Add Your First Competitor
            </button>
          </div>
        </div>

        {/* Add Competitor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-navy-900">Add New Competitor</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-navy-500" />
                </button>
              </div>
              <p className="text-navy-500 text-sm mb-6">
                Enter competitor details to start tracking their market activity.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="TRM Labs"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="trmlabs.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Founded Year</label>
                    <input
                      type="text"
                      value={formData.founded}
                      onChange={(e) => setFormData({...formData, founded: e.target.value})}
                      placeholder="2018"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Funding</label>
                    <input
                      type="text"
                      value={formData.funding}
                      onChange={(e) => setFormData({...formData, funding: e.target.value})}
                      placeholder="$220M"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Market Share (%)</label>
                    <input
                      type="number"
                      value={formData.market_share}
                      onChange={(e) => setFormData({...formData, market_share: parseInt(e.target.value) || 0})}
                      placeholder="18"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Market Position</label>
                    <select
                      value={formData.market_position}
                      onChange={(e) => setFormData({...formData, market_position: e.target.value as any})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="leader">Market Leader</option>
                      <option value="challenger">Challenger</option>
                      <option value="niche">Niche Player</option>
                      <option value="emerging">Emerging</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="direct">Direct Competitor</option>
                      <option value="indirect">Indirect Competitor</option>
                      <option value="potential">Potential Entrant</option>
                      <option value="partner">Partner</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Enterprise Price ($/yr)</label>
                    <input
                      type="number"
                      value={formData.enterprise_price}
                      onChange={(e) => setFormData({...formData, enterprise_price: parseInt(e.target.value) || 0})}
                      placeholder="75000"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Monthly Price ($/yr)</label>
                    <input
                      type="number"
                      value={formData.monthly_price}
                      onChange={(e) => setFormData({...formData, monthly_price: parseInt(e.target.value) || 0})}
                      placeholder="35000"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="DeFi, Enterprise, US-focused"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Key Features (comma-separated)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    placeholder="AI Investigation Tools, Blockchain Intelligence, Cross-Chain Coverage"
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Strengths (comma-separated)</label>
                    <textarea
                      value={formData.strengths}
                      onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                      placeholder="150% revenue growth, AI-focused tools, Major clients"
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Weaknesses (comma-separated)</label>
                    <textarea
                      value={formData.weaknesses}
                      onChange={(e) => setFormData({...formData, weaknesses: e.target.value})}
                      placeholder="Later entrant, Smaller government portfolio"
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional insights about this competitor..."
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                  <strong>💡 Quick Tip:</strong> Add detailed information for better strategic insights. All fields can be edited later.
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCompetitor}
                    disabled={saving}
                    className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors flex items-center gap-2"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {saving ? 'Adding...' : 'Add Competitor'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading competitor intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchCompetitors}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">Competitor Intelligence</h1>
          <p className="text-navy-500 mt-1">Track market positioning, feature gaps, and competitive threats</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search competitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 w-64"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border rounded-lg hover:bg-slate-50 ${showFilters ? 'border-gold-500 bg-gold-50' : 'border-slate-300'}`}
          >
            <Filter className="w-5 h-5 text-navy-600" />
          </button>
          
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-navy-900 text-white rounded-lg flex items-center gap-2 hover:bg-navy-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Competitor
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-navy-900">Filters</h3>
            <button 
              onClick={() => {
                setFilterMarketPosition('all');
                setFilterCategory('all');
              }} 
              className="text-sm text-gold-600 hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs text-navy-500 mb-1">Market Position</label>
              <select
                value={filterMarketPosition}
                onChange={(e) => setFilterMarketPosition(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">All Positions</option>
                <option value="leader">Market Leaders</option>
                <option value="challenger">Challengers</option>
                <option value="niche">Niche Players</option>
                <option value="emerging">Emerging</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-navy-500 mb-1">Competitor Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">All Categories</option>
                <option value="direct">Direct Competitors</option>
                <option value="indirect">Indirect Competitors</option>
                <option value="potential">Potential Entrants</option>
                <option value="partner">Partners</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Market Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Total Addressable Market</span>
            <Target className="w-5 h-5 text-gold-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">$2.4B</div>
          <div className="text-sm text-green-600 mt-1">↑ 15% YoY</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Our Market Share</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">8%</div>
          <div className="text-sm text-green-600 mt-1">↑ 2% this quarter</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Top Competitor Share</span>
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">
            {competitors.sort((a, b) => b.market_share - a.market_share)[0]?.market_share || 0}%
          </div>
          <div className="text-sm text-amber-600 mt-1">
            {competitors.sort((a, b) => b.market_share - a.market_share)[0]?.name}
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-navy-600">Price Advantage</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-navy-900">-{Math.round(((avgPrice - ourPrice) / avgPrice) * 100)}%</div>
          <div className="text-sm text-green-600 mt-1">vs. competitors</div>
        </div>
      </div>

      {/* Competitive Score Summary */}
      {comparison.length > 0 && (
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-gold-400" />
            Competitive Landscape Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comparison.slice(0, 4).map((comp) => (
              <div key={comp.id} className="bg-white/10 rounded-lg p-3">
                <div className="text-sm opacity-80">{comp.name}</div>
                <div className="text-xl font-bold">{comp.competitive_score || 0}</div>
                <div className="text-xs opacity-70">Competitive Score</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Competitor Selector */}
      <div className="flex flex-wrap items-center gap-3">
        {filteredCompetitors.map((comp) => (
          <button
            key={comp.id}
            onClick={() => setSelectedCompetitor(comp.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCompetitor === comp.id
                ? 'bg-navy-900 text-white shadow-lg'
                : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${getPositionColor(comp.market_position)}`}>
              {comp.market_position?.charAt(0).toUpperCase()}
            </span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${getCategoryColor(comp.category)}`}>
              {comp.category?.charAt(0).toUpperCase()}
            </span>
            {comp.name}
          </button>
        ))}
        {filteredCompetitors.length === 0 && (
          <p className="text-navy-500 text-sm">No competitors found matching your filters</p>
        )}
      </div>
      
      {/* Competitor Detail - Only show if there are competitors */}
      {selectedComp && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-navy-900">{selectedComp.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(selectedComp.market_position)}`}>
                    {selectedComp.market_position?.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedComp.category)}`}>
                    {selectedComp.category?.toUpperCase()}
                  </span>
                  {selectedComparison?.competitive_score && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800">
                      Score: {selectedComparison.competitive_score}
                    </span>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(selectedComp.id)}
                    className="p-1 hover:bg-red-100 rounded-lg text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <a href={`https://${selectedComp.website}`} target="_blank" className="text-gold-600 hover:underline flex items-center gap-1 text-sm">
                  {selectedComp.website}
                  <ExternalLink className="w-3 h-3" />
                </a>
                {selectedComp.tags && selectedComp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedComp.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-navy-500 rounded-full text-xs flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {selectedComp.notes && (
                  <p className="text-sm text-navy-600 mt-2 italic">{selectedComp.notes}</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-right">
                  <div className="text-xs text-navy-500 mb-1">Market Share</div>
                  <div className="text-xl font-bold text-navy-900">{selectedComp.market_share}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-navy-500 mb-1">Founded</div>
                  <div className="text-lg font-semibold">{selectedComp.founded}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-navy-500 mb-1">Total Funding</div>
                  <div className="text-lg font-semibold">{selectedComp.funding}</div>
                </div>
              </div>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-navy-500 mb-1">Web Traffic</div>
                <div className="font-semibold text-navy-900">{formatNumber(selectedComp.metrics.webTraffic || 0)}/mo</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-navy-500 mb-1">Social Followers</div>
                <div className="font-semibold text-navy-900">{formatNumber(selectedComp.metrics.socialFollowers || 0)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-navy-500 mb-1">Employees</div>
                <div className="font-semibold text-navy-900">{formatNumber(selectedComp.metrics.employeeCount || 0)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-navy-500 mb-1">Customers</div>
                <div className="font-semibold text-navy-900">{formatNumber(selectedComp.metrics.customerCount || 0)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-navy-500 mb-1">Annual Revenue</div>
                <div className="font-semibold text-navy-900">{formatCurrency(selectedComp.metrics.annualRevenue || 0)}</div>
              </div>
            </div>
            
            {/* Pricing Comparison */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-navy-50 to-slate-100 p-4 rounded-lg">
                <div className="text-sm text-navy-500 mb-1">Enterprise</div>
                <div className="text-xl font-bold text-navy-900">{formatCurrency(selectedComp.pricing.enterprise)}/yr</div>
                <div className="text-xs text-green-600 mt-1">vs. {formatCurrency(selectedComp.pricing.enterprise * 0.6)} (us)</div>
              </div>
              <div className="bg-gradient-to-br from-navy-50 to-slate-100 p-4 rounded-lg">
                <div className="text-sm text-navy-500 mb-1">Monthly</div>
                <div className="text-xl font-bold text-navy-900">{formatCurrency(selectedComp.pricing.monthly)}/yr</div>
                <div className="text-xs text-green-600 mt-1">vs. {formatCurrency(selectedComp.pricing.monthly * 0.6)} (us)</div>
              </div>
              <div className="bg-gradient-to-br from-navy-50 to-slate-100 p-4 rounded-lg">
                <div className="text-sm text-navy-500 mb-1">Single Report</div>
                <div className="text-xl font-bold text-navy-900">{selectedComp.pricing.single ? formatCurrency(selectedComp.pricing.single) : 'N/A'}</div>
                <div className="text-xs text-green-600 mt-1">vs. $2,497 (us)</div>
              </div>
            </div>
            
            {/* Key Features */}
            <div>
              <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold-600" />
                Key Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedComp.features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* SWOT Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {selectedComp.swot.strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-navy-700">{item}</span>
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
                {selectedComp.swot.weaknesses.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="text-navy-700">{item}</span>
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
                {selectedComp.swot.opportunities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-navy-700">{item}</span>
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
                {selectedComp.swot.threats.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-navy-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gold-600" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {selectedComp.recent_activity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className={`p-2 rounded-full ${getImpactColor(activity.impact)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-navy-900">{activity.description}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getImpactColor(activity.impact)}`}>
                        {getImpactIcon(activity.impact)}
                        {activity.impact} impact
                      </span>
                      <span className="text-xs text-navy-500 capitalize flex items-center gap-1">
                        {getActivityIcon(activity.type)}
                        {activity.type}
                      </span>
                      <span className="text-xs text-navy-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {activity.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-gold-50 to-amber-50 rounded-xl p-6 border border-gold-200">
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-gold-600" />
                Strategic Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                    <p className="text-navy-700 flex items-start gap-2">
                      <Rocket className="w-4 h-4 text-gold-600 mt-0.5 shrink-0" />
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-navy-900">Add New Competitor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-navy-500" />
              </button>
            </div>
            <p className="text-navy-500 text-sm mb-6">
              Enter competitor details to start tracking their market activity.
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="TRM Labs"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="trmlabs.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Founded Year</label>
                  <input
                    type="text"
                    value={formData.founded}
                    onChange={(e) => setFormData({...formData, founded: e.target.value})}
                    placeholder="2018"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Funding</label>
                  <input
                    type="text"
                    value={formData.funding}
                    onChange={(e) => setFormData({...formData, funding: e.target.value})}
                    placeholder="$220M"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Market Share (%)</label>
                  <input
                    type="number"
                    value={formData.market_share}
                    onChange={(e) => setFormData({...formData, market_share: parseInt(e.target.value) || 0})}
                    placeholder="18"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Market Position</label>
                  <select
                    value={formData.market_position}
                    onChange={(e) => setFormData({...formData, market_position: e.target.value as any})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="leader">Market Leader</option>
                    <option value="challenger">Challenger</option>
                    <option value="niche">Niche Player</option>
                    <option value="emerging">Emerging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="direct">Direct Competitor</option>
                    <option value="indirect">Indirect Competitor</option>
                    <option value="potential">Potential Entrant</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Enterprise Price ($/yr)</label>
                  <input
                    type="number"
                    value={formData.enterprise_price}
                    onChange={(e) => setFormData({...formData, enterprise_price: parseInt(e.target.value) || 0})}
                    placeholder="75000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Monthly Price ($/yr)</label>
                  <input
                    type="number"
                    value={formData.monthly_price}
                    onChange={(e) => setFormData({...formData, monthly_price: parseInt(e.target.value) || 0})}
                    placeholder="35000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="DeFi, Enterprise, US-focused"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Key Features (comma-separated)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="AI Investigation Tools, Blockchain Intelligence, Cross-Chain Coverage"
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Strengths (comma-separated)</label>
                  <textarea
                    value={formData.strengths}
                    onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                    placeholder="150% revenue growth, AI-focused tools, Major clients"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Weaknesses (comma-separated)</label>
                  <textarea
                    value={formData.weaknesses}
                    onChange={(e) => setFormData({...formData, weaknesses: e.target.value})}
                    placeholder="Later entrant, Smaller government portfolio"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional insights about this competitor..."
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                <strong>💡 Quick Tip:</strong> Add detailed information for better strategic insights. All fields can be edited later.
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCompetitor}
                  disabled={saving}
                  className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Adding...' : 'Add Competitor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-navy-900">Delete Competitor</h3>
            </div>
            <p className="text-navy-600 mb-6">
              Are you sure you want to delete this competitor? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCompetitor(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Competitor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
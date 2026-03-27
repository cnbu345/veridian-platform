// src/lib/marketing/client.ts
import { createClient } from '@/lib/supabase/client';
import type { 
  Campaign, 
  Analytics, 
  Channel, 
  Segment, 
  Asset,
  CampaignFormData,
  MarketingMetrics,
  ChannelPerformance,
  CampaignROI,
  ForecastData
} from '@/types/marketing';

export class MarketingClient {
  private supabase = createClient();
  // ============= COMPETITORS =============
  async getCompetitors() {
    const { data, error } = await this.supabase
        .from('competitors')
        .select('*')
        .order('market_share', { ascending: false });

    if (error) throw error;
    return data as Competitor[];
}

async getCompetitorComparison() {
  const { data, error } = await this.supabase
    .from('competitor_comparison')
    .select('*')
    .order('competitive_score', { ascending: false });

  if (error) throw error;
  return data as CompetitorComparison[];
}

async getCompetitorsByCategory(category: string) {
  const { data, error } = await this.supabase
    .from('competitors')
    .select('*')
    .eq('category', category)
    .order('market_share', { ascending: false });

  if (error) throw error;
  return data as Competitor[];
}

async getCompetitorById(id: string) {
  const { data, error } = await this.supabase
    .from('competitors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Competitor;
}

async createCompetitor(data: CompetitorFormData) {
  const { data: competitor, error } = await this.supabase
    .from('competitors')
    .insert([{
      name: data.name,
      website: data.website,
      founded: data.founded,
      funding: data.funding,
      market_share: data.market_share,
      market_position: data.market_position,
      category: data.category || 'direct',
      tags: data.tags || [],
      notes: data.notes,
      pricing: data.pricing,
      features: data.features,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      swot: data.swot,
      metrics: data.metrics,
      recent_activity: data.recent_activity,
    }])
    .select()
    .single();

  if (error) throw error;
  return competitor;
}

async updateCompetitor(id: string, data: Partial<CompetitorFormData>) {
  const { data: competitor, error } = await this.supabase
    .from('competitors')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return competitor;
}

async deleteCompetitor(id: string) {
  const { error } = await this.supabase
    .from('competitors')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

async addCompetitorActivity(id: string, activity: {
  date: string;
  type: string;
  description: string;
  impact: string;
}) {
  // First get current competitor
  const competitor = await this.getCompetitorById(id);
  const currentActivities = competitor.recent_activity || [];
  
  const { error } = await this.supabase
    .from('competitors')
    .update({
      recent_activity: [activity, ...currentActivities]
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Enhanced strategic recommendations using competitive scores
async getStrategicRecommendations() {
  const comparison = await this.getCompetitorComparison();
  const topCompetitor = comparison[0];
  const ourScore = 65; // Veridian's calculated competitive score
  
  const recommendations = [];
  
  // Score gap analysis
  const scoreGap = topCompetitor?.competitive_score - ourScore;
  if (scoreGap > 20) {
    recommendations.push({
      priority: 'high',
      title: 'Critical Competitive Gap',
      description: `${topCompetitor.name} leads by ${scoreGap} points. Focus on ${topCompetitor.feature_count > 15 ? 'feature parity' : 'pricing advantage'} to close the gap.`,
      action: `Prioritize roadmap items that address ${topCompetitor.name}'s key differentiators.`
    });
  }
  
  // Feature analysis
  const avgFeatures = comparison.reduce((sum, c) => sum + (c.feature_count || 0), 0) / comparison.length;
  const ourFeatures = 12; // Veridian's current feature count
  if (ourFeatures < avgFeatures) {
    recommendations.push({
      priority: 'medium',
      title: 'Feature Gap Opportunity',
      description: `You have ${Math.round(avgFeatures - ourFeatures)} fewer features than the market average.`,
      action: 'Consider adding AI investigation tools and cross-chain coverage to match competitors.'
    });
  }
  
  // Market position insights
  const marketLeaders = comparison.filter(c => c.market_position === 'leader');
  if (marketLeaders.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Market Leader Strategy',
      description: `${marketLeaders[0].name} dominates with ${marketLeaders[0].market_share}% market share.`,
      action: 'Differentiate through state-specific expertise and superior customer support.'
    });
  }
  
  // Growth opportunity analysis
  const fastestGrowing = comparison.sort((a, b) => 
    parseInt(b.annual_revenue_millions || '0') - parseInt(a.annual_revenue_millions || '0')
  )[0];
  
  if (fastestGrowing && fastestGrowing.name !== 'Veridian') {
    recommendations.push({
      priority: 'medium',
      title: 'Growth Opportunity',
      description: `${fastestGrowing.name} is showing strong revenue growth.`,
      action: 'Analyze their go-to-market strategy and customer acquisition channels.'
    });
  }
  
  return recommendations;
}

// Generate strategic recommendations based on competitor data (keep existing method)
generateStrategicRecommendations(competitor: Competitor, allCompetitors: Competitor[]): string[] {
  const recommendations: string[] = [];
  
  // Pricing opportunity
  const avgPrice = allCompetitors.reduce((sum, c) => sum + c.pricing.enterprise, 0) / allCompetitors.length;
  const ourPrice = 40000;
  const priceAdvantage = ((avgPrice - ourPrice) / avgPrice) * 100;
  
  if (priceAdvantage > 30) {
    recommendations.push(`Leverage ${Math.round(priceAdvantage)}% price advantage in enterprise deals against ${competitor.name}`);
  }
  
  // Feature gap analysis
  const ourKeyFeatures = ['State-Specific Regulation', 'Real-Time Updates', 'Custom Reports'];
  const missingFeatures = competitor.features.filter(f => 
    !ourKeyFeatures.some(our => f.toLowerCase().includes(our.toLowerCase()))
  );
  
  if (missingFeatures.length > 0) {
    recommendations.push(`Feature gap: ${missingFeatures[0]} is a key competitor feature - consider roadmap prioritization`);
  }
  
  // Market position strategy
  if (competitor.market_position === 'leader') {
    recommendations.push(`Differentiation opportunity: Focus on state-specific regulatory expertise that ${competitor.name} lacks`);
  } else if (competitor.market_position === 'challenger') {
    recommendations.push(`Market expansion: Target regions where ${competitor.name} has weak presence, particularly in state-level compliance`);
  }
  
  // Growth opportunity
  const growthRate = competitor.metrics.annualRevenue / 1000000;
  if (growthRate > 30) {
    recommendations.push(`${competitor.name} is growing rapidly - consider aggressive marketing in their strong segments`);
  }
  
  return recommendations;
}

  // ============= CAMPAIGNS =============
  async getCampaigns(params?: {
    status?: string;
    channel?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
  }) {
    let query = this.supabase
      .from('marketing_campaigns')
      .select(`
        *,
        campaign_roi(*)
      `);

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    if (params?.channel && params.channel !== 'all') {
      query = query.eq('channel', params.channel);
    }
    if (params?.from_date) {
      query = query.gte('start_date', params.from_date);
    }
    if (params?.to_date) {
      query = query.lte('end_date', params.to_date);
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as Campaign[];
  }

  async getCampaignById(id: string) {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .select(`
        *,
        campaign_roi(*),
        marketing_assets(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Campaign;
  }

  async createCampaign(data: CampaignFormData) {
    const { data: campaign, error } = await this.supabase
      .from('marketing_campaigns')
      .insert([{
        name: data.name,
        channel: data.channel,
        budget: data.budget,
        start_date: data.start_date,
        end_date: data.end_date,
        target_audience: data.target_audience,
        content: data.content,
        status: data.status,
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Create initial ROI record
    if (campaign) {
      await this.updateCampaignROI(campaign.id, {
        leads_generated: 0,
        revenue_generated: 0,
        total_spent: 0,
        conversions: 0,
      });
    }
    
    return campaign;
  }

  async updateCampaign(id: string, data: Partial<CampaignFormData>) {
    const { data: campaign, error } = await this.supabase
      .from('marketing_campaigns')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return campaign;
  }

  async deleteCampaign(id: string) {
    const { error } = await this.supabase
      .from('marketing_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async duplicateCampaign(id: string) {
    const original = await this.getCampaignById(id);
    const { data: newCampaign, error } = await this.supabase
      .from('marketing_campaigns')
      .insert([{
        name: `${original.name} (Copy)`,
        channel: original.channel,
        budget: original.budget,
        start_date: original.start_date,
        end_date: original.end_date,
        target_audience: original.target_audience,
        content: original.content,
        status: 'draft',
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Copy ROI data if it exists
    if (original.roi_data && newCampaign) {
      await this.updateCampaignROI(newCampaign.id, {
        leads_generated: 0,
        revenue_generated: 0,
        total_spent: 0,
        conversions: 0,
      });
    }
    
    return newCampaign;
  }

  async updateCampaignROI(campaignId: string, data: {
    leads_generated?: number;
    revenue_generated?: number;
    total_spent?: number;
    conversions?: number;
  }) {
    const { data: roi, error } = await this.supabase
      .from('campaign_roi')
      .upsert({
        campaign_id: campaignId,
        leads_generated: data.leads_generated || 0,
        revenue_generated: data.revenue_generated || 0,
        total_spent: data.total_spent || 0,
        conversions: data.conversions || 0,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'campaign_id'
      })
      .select()
      .single();

    if (error) throw error;
    return roi as CampaignROI;
  }

  // ============= ANALYTICS =============
  async getAnalytics(params?: {
    from_date?: string;
    to_date?: string;
    channel?: string;
  }) {
    let query = this.supabase
      .from('marketing_analytics')
      .select('*');

    if (params?.from_date) {
      query = query.gte('date', params.from_date);
    }
    if (params?.to_date) {
      query = query.lte('date', params.to_date);
    }
    if (params?.channel && params.channel !== 'all') {
      query = query.eq('channel', params.channel);
    }

    const { data, error } = await query.order('date', { ascending: true });
    if (error) throw error;
    return data as Analytics[];
  }

  async getMarketingMetrics(params?: {
    from_date?: string;
    to_date?: string;
  }): Promise<MarketingMetrics> {
    const analytics = await this.getAnalytics(params);
    
    const total_spend = analytics.reduce((sum, a) => sum + (a.spend || 0), 0);
    const total_revenue = analytics.reduce((sum, a) => sum + (a.revenue || 0), 0);
    const total_leads = analytics.reduce((sum, a) => sum + (a.leads || 0), 0);
    const total_conversions = analytics.reduce((sum, a) => sum + (a.conversions || 0), 0);
    
    return {
      total_spend,
      total_revenue,
      total_leads,
      total_conversions,
      overall_roi: total_spend > 0 ? ((total_revenue - total_spend) / total_spend) * 100 : 0,
      cost_per_lead: total_leads > 0 ? total_spend / total_leads : 0,
      cost_per_conversion: total_conversions > 0 ? total_spend / total_conversions : 0,
      conversion_rate: total_leads > 0 ? (total_conversions / total_leads) * 100 : 0,
    };
  }

  async getChannelPerformance(params?: {
    from_date?: string;
    to_date?: string;
  }): Promise<ChannelPerformance[]> {
    const analytics = await this.getAnalytics(params);
    const channels = await this.getChannels();
    
    const channelMap = new Map<string, {
      spend: number;
      revenue: number;
      leads: number;
      conversions: number;
    }>();

    analytics.forEach(a => {
      const existing = channelMap.get(a.channel) || { spend: 0, revenue: 0, leads: 0, conversions: 0 };
      existing.spend += a.spend || 0;
      existing.revenue += a.revenue || 0;
      existing.leads += a.leads || 0;
      existing.conversions += a.conversions || 0;
      channelMap.set(a.channel, existing);
    });

    return Array.from(channelMap.entries()).map(([channel, metrics]) => ({
      channel,
      spend: metrics.spend,
      revenue: metrics.revenue,
      leads: metrics.leads,
      conversions: metrics.conversions,
      roi: metrics.spend > 0 ? ((metrics.revenue - metrics.spend) / metrics.spend) * 100 : 0,
      cpl: metrics.leads > 0 ? metrics.spend / metrics.leads : 0,
      cpc: metrics.conversions > 0 ? metrics.spend / metrics.conversions : 0,
      trend: 'stable',
    }));
  }

  // ============= CHANNELS =============
  async getChannels() {
    const { data, error } = await this.supabase
      .from('marketing_channels')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Channel[];
  }

  // ============= SEGMENTS =============
  async getSegments() {
    const { data, error } = await this.supabase
      .from('marketing_segments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Segment[];
  }

  async createSegment(data: Omit<Segment, 'id' | 'created_at' | 'updated_at'>) {
    const { data: segment, error } = await this.supabase
      .from('marketing_segments')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return segment;
  }

  async getSegmentSize(criteria: Segment['criteria']): Promise<number> {
    let query = this.supabase.from('users').select('id', { count: 'exact', head: true });
    
    if (criteria.industries && criteria.industries.length) {
      query = query.in('industry', criteria.industries);
    }
    if (criteria.company_sizes && criteria.company_sizes.length) {
      query = query.in('company_size', criteria.company_sizes);
    }
    if (criteria.subscription_tiers && criteria.subscription_tiers.length) {
      query = query.in('subscription_tier', criteria.subscription_tiers);
    }
    
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  // ============= ASSETS =============
  async getAssets(campaignId?: string) {
    let query = this.supabase
      .from('marketing_assets')
      .select('*');

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as Asset[];
  }

  async createAsset(data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) {
    const { data: asset, error } = await this.supabase
      .from('marketing_assets')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return asset;
  }

  // ============= FORECASTING =============
  async getForecast(months: number = 3): Promise<ForecastData[]> {
    const historical = await this.getAnalytics({
      from_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const monthlyData = this.aggregateByMonth(historical);
    const forecast = this.calculateForecast(monthlyData, months);
    
    return forecast;
  }

  private aggregateByMonth(analytics: Analytics[]) {
    const monthly = new Map<string, { spend: number; revenue: number; leads: number }>();
    
    analytics.forEach(a => {
      const month = a.date.substring(0, 7);
      const existing = monthly.get(month) || { spend: 0, revenue: 0, leads: 0 };
      existing.spend += a.spend || 0;
      existing.revenue += a.revenue || 0;
      existing.leads += a.leads || 0;
      monthly.set(month, existing);
    });
    
    return Array.from(monthly.entries()).map(([month, data]) => ({
      month,
      ...data,
      roi: data.spend > 0 ? ((data.revenue - data.spend) / data.spend) * 100 : 0,
    }));
  }

  private calculateForecast(historical: any[], months: number): ForecastData[] {
    if (historical.length === 0) return [];
    
    const last3Months = historical.slice(-3);
    const avgSpend = last3Months.reduce((sum, m) => sum + m.spend, 0) / Math.max(1, last3Months.length);
    const avgRevenue = last3Months.reduce((sum, m) => sum + m.revenue, 0) / Math.max(1, last3Months.length);
    const avgLeads = last3Months.reduce((sum, m) => sum + m.leads, 0) / Math.max(1, last3Months.length);
    
    const forecast: ForecastData[] = [];
    const lastDate = historical[historical.length - 1]?.month ? new Date(historical[historical.length - 1].month + '-01') : new Date();
    
    for (let i = 1; i <= months; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setMonth(lastDate.getMonth() + i);
      forecast.push({
        month: nextDate.toISOString().substring(0, 7),
        spend: avgSpend,
        revenue: avgRevenue,
        leads: avgLeads,
        roi: avgSpend > 0 ? ((avgRevenue - avgSpend) / avgSpend) * 100 : 0,
        is_forecast: true,
      });
    }
    
    return [...historical.slice(-6), ...forecast];
  }
}

export const marketingClient = new MarketingClient();
// src/app/api/marketing/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { marketingClient } from '@/lib/marketing';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'metrics';
    const from_date = searchParams.get('from_date') || undefined;
    const to_date = searchParams.get('to_date') || undefined;
    const channel = searchParams.get('channel') || undefined;

    if (type === 'metrics') {
      const metrics = await marketingClient.getMarketingMetrics({ from_date, to_date });
      return NextResponse.json(metrics);
    }
    
    if (type === 'channels') {
      const performance = await marketingClient.getChannelPerformance({ from_date, to_date });
      return NextResponse.json(performance);
    }
    
    if (type === 'forecast') {
      const months = parseInt(searchParams.get('months') || '3');
      const forecast = await marketingClient.getForecast(months);
      return NextResponse.json(forecast);
    }
    
    const analytics = await marketingClient.getAnalytics({ from_date, to_date, channel });
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
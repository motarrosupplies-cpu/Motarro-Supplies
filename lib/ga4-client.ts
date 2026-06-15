import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { createClient } from '@supabase/supabase-js';

// Types
export interface GA4Config {
  propertyId: string;
  credentials?: {
    client_email: string;
    private_key: string;
  };
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsCache {
  cache_key: string;
  data: any;
  expires_at: string;
}

// Initialize GA4 client
export function getGA4Client(): BetaAnalyticsDataClient | null {
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credsJson) {
    return null;
  }

  try {
    const credentials = JSON.parse(credsJson);
    return new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key.replace(/\\n/g, '\n'),
      },
    });
  } catch (error) {
    console.error('Failed to initialize GA4 client:', error);
    return null;
  }
}

// Get Supabase admin client for cache operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Cache helper functions
export async function getCachedData(cacheKey: string): Promise<any | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('analytics_cache')
      .select('data, expires_at')
      .eq('cache_key', cacheKey)
      .single();

    if (error || !data) return null;

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      // Clean up expired entry
      await supabase
        .from('analytics_cache')
        .delete()
        .eq('cache_key', cacheKey);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching cache:', error);
    return null;
  }
}

export async function setCachedData(
  cacheKey: string,
  data: any,
  ttlHours: number = 1
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    await supabase
      .from('analytics_cache')
      .upsert({
        cache_key: cacheKey,
        data,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

// Generate cache key
export function generateCacheKey(
  reportType: string,
  dateRange: DateRange,
  additionalParams?: Record<string, any>
): string {
  const params = JSON.stringify({ dateRange, ...additionalParams });
  return `${reportType}:${Buffer.from(params).toString('base64')}`;
}

// Get property ID from env or use default
export function getPropertyId(): string {
  return process.env.GA4_PROPERTY_ID || '492312743';
}

// Real-time active users
export async function getRealTimeUsers(): Promise<number> {
  const client = getGA4Client();
  const propertyId = getPropertyId();

  if (!client) {
    // Return mock data in dev
    if (process.env.NODE_ENV === 'development') {
      return Math.floor(Math.random() * 50) + 10;
    }
    return 0;
  }

  try {
    const cacheKey = 'realtime:activeUsers';
    const cached = await getCachedData(cacheKey);
    if (cached !== null) return cached;

    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });

    const activeUsers = Number(response.rows?.[0]?.metricValues?.[0]?.value || 0);
    
    // Cache for 5 minutes (real-time data)
    await setCachedData(cacheKey, activeUsers, 5 / 60);
    
    return activeUsers;
  } catch (error) {
    console.error('Error fetching real-time users:', error);
    return 0;
  }
}

// Top pages report
export interface TopPage {
  pagePath: string;
  views: number;
}

export async function getTopPages(
  days: number = 7,
  limit: number = 10
): Promise<TopPage[]> {
  const client = getGA4Client();
  const propertyId = getPropertyId();

  if (!client) {
    // Return mock data in dev
    if (process.env.NODE_ENV === 'development') {
      return [
        { pagePath: '/', views: 1250 },
        { pagePath: '/products', views: 890 },
        { pagePath: '/products/custom-t-shirt', views: 450 },
        { pagePath: '/custom-printing', views: 320 },
        { pagePath: '/about', views: 210 },
      ].slice(0, limit);
    }
    return [];
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange: DateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    const cacheKey = generateCacheKey('topPages', dateRange, { limit });
    const cached = await getCachedData(cacheKey);
    if (cached !== null) return cached;

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true,
        },
      ],
      limit,
    });

    const pages: TopPage[] =
      response.rows?.map((row) => ({
        pagePath: row.dimensionValues?.[0]?.value || '',
        views: Number(row.metricValues?.[0]?.value || 0),
      })) || [];

    // Cache for 1 hour
    await setCachedData(cacheKey, pages, 1);

    return pages;
  } catch (error) {
    console.error('Error fetching top pages:', error);
    return [];
  }
}

// Traffic sources report
export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
}

export async function getTrafficSources(days: number = 30): Promise<TrafficSource[]> {
  const client = getGA4Client();
  const propertyId = getPropertyId();

  if (!client) {
    // Return mock data in dev
    if (process.env.NODE_ENV === 'development') {
      return [
        { source: 'google', medium: 'organic', sessions: 4500 },
        { source: '(direct)', medium: '(none)', sessions: 2100 },
        { source: 'google', medium: 'cpc', sessions: 1800 },
        { source: 'facebook', medium: 'social', sessions: 950 },
        { source: 'instagram', medium: 'social', sessions: 650 },
      ];
    }
    return [];
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange: DateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    const cacheKey = generateCacheKey('trafficSources', dateRange);
    const cached = await getCachedData(cacheKey);
    if (cached !== null) return cached;

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
      ],
      metrics: [{ name: 'sessions' }],
      orderBys: [
        {
          metric: { metricName: 'sessions' },
          desc: true,
        },
      ],
      limit: 20,
    });

    const sources: TrafficSource[] =
      response.rows?.map((row) => ({
        source: row.dimensionValues?.[0]?.value || '',
        medium: row.dimensionValues?.[1]?.value || '',
        sessions: Number(row.metricValues?.[0]?.value || 0),
      })) || [];

    // Cache for 1 hour
    await setCachedData(cacheKey, sources, 1);

    return sources;
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    return [];
  }
}

// Session duration
export interface SessionDurationData {
  average: number;
  trend: Array<{ date: string; duration: number }>;
}

export async function getSessionDuration(days: number = 30): Promise<SessionDurationData> {
  const client = getGA4Client();
  const propertyId = getPropertyId();

  if (!client) {
    // Return mock data in dev
    if (process.env.NODE_ENV === 'development') {
      const trend = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toISOString().split('T')[0],
          duration: Math.floor(Math.random() * 60) + 120,
        };
      });
      return {
        average: 145,
        trend,
      };
    }
    return { average: 0, trend: [] };
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange: DateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    const cacheKey = generateCacheKey('sessionDuration', dateRange);
    const cached = await getCachedData(cacheKey);
    if (cached !== null) return cached;

    // Get average
    const [avgResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      metrics: [{ name: 'averageSessionDuration' }],
    });

    const average = Number(
      avgResponse.rows?.[0]?.metricValues?.[0]?.value || 0
    );

    // Get daily trend
    const [trendResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'averageSessionDuration' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });

    const trend =
      trendResponse.rows?.map((row) => ({
        date: row.dimensionValues?.[0]?.value || '',
        duration: Number(row.metricValues?.[0]?.value || 0),
      })) || [];

    const result = { average, trend };

    // Cache for 1 hour
    await setCachedData(cacheKey, result, 1);

    return result;
  } catch (error) {
    console.error('Error fetching session duration:', error);
    return { average: 0, trend: [] };
  }
}

// Bounce rate
export interface BounceRateData {
  rate: number;
  average: number;
}

export async function getBounceRate(days: number = 30): Promise<BounceRateData> {
  const client = getGA4Client();
  const propertyId = getPropertyId();

  if (!client) {
    // Return mock data in dev
    if (process.env.NODE_ENV === 'development') {
      return {
        rate: 42.5,
        average: 45.0,
      };
    }
    return { rate: 0, average: 0 };
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange: DateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    const cacheKey = generateCacheKey('bounceRate', dateRange);
    const cached = await getCachedData(cacheKey);
    if (cached !== null) return cached;

    // Get current period
    const [currentResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      metrics: [{ name: 'bounceRate' }],
    });

    const rate = Number(
      currentResponse.rows?.[0]?.metricValues?.[0]?.value || 0
    );

    // Get previous period for comparison
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    const prevDateRange: DateRange = {
      startDate: prevStartDate.toISOString().split('T')[0],
      endDate: prevEndDate.toISOString().split('T')[0],
    };

    const [prevResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [prevDateRange],
      metrics: [{ name: 'bounceRate' }],
    });

    const average = Number(
      prevResponse.rows?.[0]?.metricValues?.[0]?.value || rate
    );

    const result = { rate, average };

    // Cache for 1 hour
    await setCachedData(cacheKey, result, 1);

    return result;
  } catch (error) {
    console.error('Error fetching bounce rate:', error);
    return { rate: 0, average: 0 };
  }
}

// Top products viewed (e-commerce events)
export interface TopProduct {
  productName: string;
  views: number;
}

export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
  const client = getGA4Client();
  const propertyId = getPropertyId();

  if (!client) {
    // Return mock data in dev
    if (process.env.NODE_ENV === 'development') {
      return [
        { productName: 'Custom T-Shirt', views: 1250 },
        { productName: 'Hoodie', views: 890 },
        { productName: 'Polo Shirt', views: 650 },
        { productName: 'Cap', views: 420 },
        { productName: 'Tote Bag', views: 310 },
      ].slice(0, limit);
    }
    return [];
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const dateRange: DateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    const cacheKey = generateCacheKey('topProducts', dateRange, { limit });
    const cached = await getCachedData(cacheKey);
    if (cached !== null) return cached;

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'itemName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: {
            matchType: 'EXACT',
            value: 'view_item',
          },
        },
      },
      orderBys: [
        {
          metric: { metricName: 'eventCount' },
          desc: true,
        },
      ],
      limit,
    });

    const products: TopProduct[] =
      response.rows?.map((row) => ({
        productName: row.dimensionValues?.[0]?.value || 'Unknown',
        views: Number(row.metricValues?.[0]?.value || 0),
      })) || [];

    // Cache for 1 hour
    await setCachedData(cacheKey, products, 1);

    return products;
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
}

// Conversions/Orders
export interface ConversionData {
  orders: number;
  revenue: number;
  funnel: Array<{ stage: string; count: number }>;
}

export async function getConversions(days: number = 30): Promise<ConversionData> {
  const client = getGA4Client();
  const propertyId = getPropertyId();

  if (!client) {
    // Return mock data in dev
    if (process.env.NODE_ENV === 'development') {
      return {
        orders: 125,
        revenue: 45250.75,
        funnel: [
          { stage: 'View Item', count: 5000 },
          { stage: 'Add to Cart', count: 850 },
          { stage: 'Begin Checkout', count: 320 },
          { stage: 'Purchase', count: 125 },
        ],
      };
    }
    return { orders: 0, revenue: 0, funnel: [] };
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange: DateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    const cacheKey = generateCacheKey('conversions', dateRange);
    const cached = await getCachedData(cacheKey);
    if (cached !== null) return cached;

    // Get purchase events
    const [purchaseResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      metrics: [
        { name: 'eventCount' },
        { name: 'totalRevenue' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: {
            matchType: 'EXACT',
            value: 'purchase',
          },
        },
      },
    });

    const orders = Number(
      purchaseResponse.rows?.[0]?.metricValues?.[0]?.value || 0
    );
    const revenue = Number(
      purchaseResponse.rows?.[0]?.metricValues?.[1]?.value || 0
    );

    // Get funnel data
    const funnelStages = [
      { event: 'view_item', stage: 'View Item' },
      { event: 'add_to_cart', stage: 'Add to Cart' },
      { event: 'begin_checkout', stage: 'Begin Checkout' },
      { event: 'purchase', stage: 'Purchase' },
    ];

    const funnel = await Promise.all(
      funnelStages.map(async ({ event, stage }) => {
        const [response] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [dateRange],
          metrics: [{ name: 'eventCount' }],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              stringFilter: {
                matchType: 'EXACT',
                value: event,
              },
            },
          },
        });

        return {
          stage,
          count: Number(response.rows?.[0]?.metricValues?.[0]?.value || 0),
        };
      })
    );

    const result = { orders, revenue, funnel };

    // Cache for 1 hour
    await setCachedData(cacheKey, result, 1);

    return result;
  } catch (error) {
    console.error('Error fetching conversions:', error);
    return { orders: 0, revenue: 0, funnel: [] };
  }
}


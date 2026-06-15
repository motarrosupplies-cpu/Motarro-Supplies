// Trivial comment for redeploy test
import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const propertyId = '492312743';

export async function GET() {
  try {
    const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credsJson) {
      // Environment not configured for GA4; return empty results instead of failing build/runtime
      return NextResponse.json({ results: [] });
    }

    const credentials = JSON.parse(credsJson);

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });

    // Fetch activeUsers and screenPageViews by city, country, and deviceCategory
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' }
      ],
      dimensions: [
        { name: 'city' },
        { name: 'country' },
        { name: 'deviceCategory' }
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    });

    // Parse the response
    const results = (response.rows || []).map(row => ({
      city: row.dimensionValues?.[0]?.value || '-',
      country: row.dimensionValues?.[1]?.value || '-',
      deviceCategory: row.dimensionValues?.[2]?.value || '-',
      activeUsers: Number(row.metricValues?.[0]?.value || 0),
      screenPageViews: Number(row.metricValues?.[1]?.value || 0),
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    // Log the error to the serverless function logs
    console.error('Analytics API Error:', {
      message: error.message,
      stack: error.stack,
      fullError: error,
    });
    return NextResponse.json({
      error: error.message || 'Failed to fetch analytics overview',
      stack: error.stack,
      fullError: error
    }, { status: 500 });
  }
} 
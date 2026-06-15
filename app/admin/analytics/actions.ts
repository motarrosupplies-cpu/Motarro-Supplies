'use server';

import {
  getRealTimeUsers,
  getTopPages,
  getTrafficSources,
  getSessionDuration,
  getBounceRate,
  getTopProducts,
  getConversions,
} from '@/lib/ga4-client';

export async function fetchAnalyticsData(days: number = 7) {
  try {
    const [
      realTimeUsers,
      topPages,
      trafficSources,
      sessionDuration,
      bounceRate,
      topProducts,
      conversions,
    ] = await Promise.all([
      getRealTimeUsers(),
      getTopPages(days, 10),
      getTrafficSources(days),
      getSessionDuration(days),
      getBounceRate(days),
      getTopProducts(5),
      getConversions(days),
    ]);

    return {
      realTimeUsers,
      topPages,
      trafficSources,
      sessionDuration,
      bounceRate,
      topProducts,
      conversions,
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}


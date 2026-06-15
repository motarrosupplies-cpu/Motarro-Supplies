'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { TopPagesChart } from '@/components/analytics/TopPagesChart';
import { TrafficSourcesChart } from '@/components/analytics/TrafficSourcesChart';
import { SessionDurationChart } from '@/components/analytics/SessionDurationChart';
import { ConversionsChart } from '@/components/analytics/ConversionsChart';
import { TopProductsTable } from '@/components/analytics/TopProductsTable';
import { fetchAnalyticsData } from './actions';
import {
  Users,
  Eye,
  Clock,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
  realTimeUsers: number;
  topPages: Array<{ pagePath: string; views: number }>;
  trafficSources: Array<{ source: string; medium: string; sessions: number }>;
  sessionDuration: { average: number; trend: Array<{ date: string; duration: number }> };
  bounceRate: { rate: number; average: number };
  topProducts: Array<{ productName: string; views: number }>;
  conversions: {
    orders: number;
    revenue: number;
    funnel: Array<{ stage: string; count: number }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [isPending, startTransition] = useTransition();

  const loadData = async (selectedDays: number = days) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAnalyticsData(selectedDays);
      setData(result);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    startTransition(() => {
      loadData(days);
    });
  };

  const handleDaysChange = (value: string) => {
    const newDays = parseInt(value);
    setDays(newDays);
    startTransition(() => {
      loadData(newDays);
    });
  };

  // Generate sparkline data for real-time users (mock trend)
  const generateSparkline = (current: number) => {
    return Array.from({ length: 12 }, (_, i) => {
      const variation = Math.random() * 0.3 - 0.15; // ±15% variation
      return Math.max(0, Math.round(current * (1 + variation)));
    });
  };

  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100">Analytics</h1>
        </div>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error loading analytics</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time and historical Google Analytics 4 data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={days.toString()} onValueChange={handleDaysChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            disabled={isPending || loading}
          >
            <RefreshCw className={`h-4 w-4 ${isPending || loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Real-Time Visitors Card */}
      <AnalyticsCard
        title="Real-Time Visitors"
        value={data?.realTimeUsers ?? 0}
        subtitle="Active users right now"
        icon={<Users className="h-4 w-4" />}
        sparkline={data?.realTimeUsers ? generateSparkline(data.realTimeUsers) : undefined}
        loading={loading}
      />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnalyticsCard
          title="Total Page Views"
          value={
            data?.topPages
              ? data.topPages.reduce((sum, page) => sum + page.views, 0).toLocaleString()
              : 0
          }
          subtitle={`Last ${days} days`}
          icon={<Eye className="h-4 w-4" />}
          loading={loading}
        />

        <AnalyticsCard
          title="Avg. Session Duration"
          value={
            data?.sessionDuration
              ? `${Math.floor(data.sessionDuration.average / 60)}:${Math.floor(
                  data.sessionDuration.average % 60
                )
                  .toString()
                  .padStart(2, '0')}`
              : '0:00'
          }
          subtitle={`Last ${days} days`}
          icon={<Clock className="h-4 w-4" />}
          loading={loading}
        />

        <AnalyticsCard
          title="Bounce Rate"
          value={`${data?.bounceRate?.rate.toFixed(1) ?? 0}%`}
          subtitle={
            data?.bounceRate
              ? `Avg: ${data.bounceRate.average.toFixed(1)}%`
              : 'No comparison data'
          }
          icon={<TrendingDown className="h-4 w-4" />}
          trend={
            data?.bounceRate
              ? {
                  value: Math.abs(data.bounceRate.rate - data.bounceRate.average),
                  label: 'vs average',
                  isPositive: data.bounceRate.rate < data.bounceRate.average,
                }
              : undefined
          }
          loading={loading}
        />
      </div>

      {/* Bounce Rate Progress Card */}
      {data?.bounceRate && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bounce Rate</span>
                <span className="font-medium">{data.bounceRate.rate.toFixed(1)}%</span>
              </div>
              <Progress value={data.bounceRate.rate} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Current: {data.bounceRate.rate.toFixed(1)}%</span>
                <span>Average: {data.bounceRate.average.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopPagesChart data={data?.topPages ?? []} loading={loading} days={days} />
        <TrafficSourcesChart
          data={data?.trafficSources ?? []}
          loading={loading}
          days={days}
        />
      </div>

      {/* Session Duration Chart */}
      {data?.sessionDuration && (
        <SessionDurationChart
          average={data.sessionDuration.average}
          trend={data.sessionDuration.trend}
          loading={loading}
          days={days}
        />
      )}

      {/* Conversions and Products Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <ConversionsChart
          orders={data?.conversions?.orders ?? 0}
          revenue={data?.conversions?.revenue ?? 0}
          funnel={data?.conversions?.funnel ?? []}
          loading={loading}
          days={days}
        />
        <TopProductsTable data={data?.topProducts ?? []} loading={loading} />
      </div>

      {/* Revenue Card */}
      {data?.conversions && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  R{data.conversions.revenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.conversions.orders} orders in last {days} days
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !data && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No analytics data available</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

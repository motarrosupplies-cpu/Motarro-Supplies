'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendPoint {
  date: string;
  duration: number;
}

interface SessionDurationChartProps {
  average: number;
  trend: TrendPoint[];
  loading?: boolean;
  days?: number;
}

export function SessionDurationChart({
  average,
  trend,
  loading = false,
  days = 30,
}: SessionDurationChartProps) {
  if (loading) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Session Duration</CardTitle>
          <CardDescription>Last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trend || trend.length === 0) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Session Duration</CardTitle>
          <CardDescription>Last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No session duration data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to parse GA4 date format (YYYYMMDD)
  const parseGA4Date = (dateStr: string): Date => {
    // GA4 returns dates in YYYYMMDD format (e.g., "20250111")
    if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed
      const day = parseInt(dateStr.substring(6, 8), 10);
      return new Date(year, month, day);
    }
    // Fallback to standard date parsing
    return new Date(dateStr);
  };

  // Format dates for display
  const chartData = trend.map((point) => {
    const date = parseGA4Date(point.date);
    return {
      ...point,
      displayDate: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      durationSeconds: Math.round(point.duration),
    };
  });

  // Format duration in seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle>Session Duration</CardTitle>
        <CardDescription>
          Last {days} days - Average: {formatDuration(Math.round(average))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayDate"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatDuration(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatDuration(value), 'Duration']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="durationSeconds"
              stroke="#A855F7"
              strokeWidth={2}
              dot={{ fill: '#A855F7', r: 3 }}
              activeDot={{ r: 5 }}
              name="Duration"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


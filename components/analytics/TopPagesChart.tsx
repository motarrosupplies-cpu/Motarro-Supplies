'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface TopPage {
  pagePath: string;
  views: number;
}

interface TopPagesChartProps {
  data: TopPage[];
  loading?: boolean;
  days?: number;
}

export function TopPagesChart({ data, loading = false, days = 7 }: TopPagesChartProps) {
  if (loading) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Top Page Views</CardTitle>
          <CardDescription>Last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Top Page Views</CardTitle>
          <CardDescription>Last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No page view data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format page paths for display
  const chartData = data.map((page) => ({
    ...page,
    displayPath: page.pagePath.length > 30 
      ? page.pagePath.substring(0, 30) + '...' 
      : page.pagePath,
  }));

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle>Top Page Views</CardTitle>
        <CardDescription>Last {days} days - Top {data.length} pages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis 
              type="category" 
              dataKey="displayPath" 
              width={150}
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Views']}
              labelFormatter={(label) => `Page: ${label}`}
            />
            <Bar 
              dataKey="views" 
              fill="#A855F7" 
              radius={[0, 4, 4, 0]}
              name="Page Views"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


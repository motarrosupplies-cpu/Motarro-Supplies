'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
}

interface TrafficSourcesChartProps {
  data: TrafficSource[];
  loading?: boolean;
  days?: number;
}

const COLORS = [
  '#A855F7', // Purple
  '#9333EA', // Purple darker
  '#7C3AED', // Purple darkest
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#EF4444', // Red
];

// Group and categorize traffic sources
function processTrafficData(data: TrafficSource[]) {
  const grouped: Record<string, number> = {};

  data.forEach((item) => {
    let category = 'Other';
    const source = item.source.toLowerCase();
    const medium = item.medium.toLowerCase();

    if (medium === 'organic' || source.includes('google')) {
      category = 'Organic Search';
    } else if (medium === '(none)' || source === '(direct)') {
      category = 'Direct';
    } else if (medium === 'cpc' || medium === 'paid') {
      category = 'Google Ads';
    } else if (medium === 'social' || source.includes('facebook') || source.includes('instagram') || source.includes('twitter')) {
      category = 'Social Media';
    } else if (source.includes('email') || medium === 'email') {
      category = 'Email';
    } else if (source.includes('referral')) {
      category = 'Referral';
    }

    grouped[category] = (grouped[category] || 0) + item.sessions;
  });

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function TrafficSourcesChart({ data, loading = false, days = 30 }: TrafficSourcesChartProps) {
  if (loading) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
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
          <CardTitle>Traffic Sources</CardTitle>
          <CardDescription>Last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No traffic source data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = processTrafficData(data);
  const totalSessions = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <CardDescription>
          Last {days} days - {totalSessions.toLocaleString()} total sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} sessions (${((value / totalSessions) * 100).toFixed(1)}%)`,
                'Sessions',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => value}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface FunnelStage {
  stage: string;
  count: number;
}

interface ConversionsChartProps {
  orders: number;
  revenue: number;
  funnel: FunnelStage[];
  loading?: boolean;
  days?: number;
}

export function ConversionsChart({
  orders,
  revenue,
  funnel,
  loading = false,
  days = 30,
}: ConversionsChartProps) {
  if (loading) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Conversions & Orders</CardTitle>
          <CardDescription>Last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!funnel || funnel.length === 0) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Conversions & Orders</CardTitle>
          <CardDescription>Last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No conversion data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate conversion rates
  const chartData = funnel.map((stage, index) => {
    const prevCount = index > 0 ? funnel[index - 1].count : stage.count;
    const conversionRate = prevCount > 0 ? (stage.count / prevCount) * 100 : 0;
    return {
      ...stage,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  });

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle>Conversions & Orders</CardTitle>
        <CardDescription>
          Last {days} days - {orders} orders • R{revenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="stage"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'count') {
                  return [value.toLocaleString(), 'Users'];
                }
                return [value, name];
              }}
            />
            <Bar
              dataKey="count"
              fill="#A855F7"
              radius={[4, 4, 0, 0]}
              name="Users"
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-4">
            {chartData.map((stage, index) => (
              <div key={stage.stage} className="flex justify-between">
                <span>{stage.stage}:</span>
                <span className="font-medium">
                  {stage.count.toLocaleString()}
                  {index > 0 && (
                    <span className="text-purple-600 dark:text-purple-400 ml-1">
                      ({stage.conversionRate}%)
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


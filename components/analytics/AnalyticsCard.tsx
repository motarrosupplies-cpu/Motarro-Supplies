'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  sparkline?: number[];
  className?: string;
  loading?: boolean;
}

export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  sparkline,
  className,
  loading = false,
}: AnalyticsCardProps) {
  if (loading) {
    return (
      <Card className={cn('border-purple-200 dark:border-purple-800', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          {subtitle && <Skeleton className="h-4 w-32" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-purple-200 dark:border-purple-800', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && (
          <div className="h-4 w-4 text-purple-600 dark:text-purple-400">{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center text-xs">
            <span
              className={cn(
                'font-medium',
                trend.isPositive !== false
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.isPositive !== false ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground ml-1">{trend.label}</span>
          </div>
        )}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-3 h-[40px] flex items-end gap-0.5">
            {sparkline.map((point, idx) => {
              const max = Math.max(...sparkline);
              const height = max > 0 ? (point / max) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-purple-500/30 dark:bg-purple-400/30 rounded-t"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


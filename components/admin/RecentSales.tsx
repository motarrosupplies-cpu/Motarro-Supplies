'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import React from 'react';

export interface RecentSale {
  name: string;
  email: string;
  amount: number;
  avatar?: string;
  fallback: string;
}

export function RecentSales({ sales }: { sales: RecentSale[] }) {
  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.email} className="flex items-center">
          <Avatar className="h-9 w-9">
            {sale.avatar && <AvatarImage src={sale.avatar} alt={sale.name} />}
            <AvatarFallback>{sale.fallback}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">{formatCurrency(sale.amount)}</div>
        </div>
      ))}
    </div>
  );
} 
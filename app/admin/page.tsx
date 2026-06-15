'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Overview, OverviewDataPoint } from '@/components/admin/Overview';
import { RecentSales, RecentSale } from '@/components/admin/RecentSales';
import { StockManagement } from '@/components/admin/StockManagement';
import { DollarSign, Users, CreditCard, Activity, TrendingUp, FileText } from 'lucide-react';
import AdminRecoveryHandler from './AdminRecoveryHandler';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { dashboardService, DashboardStats, RevenueData, RecentActivity } from '@/lib/services/dashboardService';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeNow, setActiveNow] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          router.replace('/admin/login');
          return;
        }

        setUser(user);
      } catch (err) {
        console.error('Unexpected error checking session:', err);
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    void getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/admin/login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    async function fetchActiveNow() {
      try {
        const res = await fetch('/api/analytics/active-users');
        if (!res.ok) throw new Error('Failed to fetch active users');
        const data = await res.json();
        // Sum all activeUsers from the results array
        const totalActive = Array.isArray(data.results)
          ? data.results.reduce((sum: number, row: any) => sum + (row.activeUsers || 0), 0)
          : 0;
        setActiveNow(totalActive);
      } catch (err) {
        setActiveNow(null);
      }
    }
    fetchActiveNow();
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsData, revenueData, activityData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRevenueData(),
          dashboardService.getRecentActivity(10),
        ]);

        setStats(statsData);
        setRevenueData(revenueData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-500">Not authenticated. Redirecting...</div>
      </div>
    );
  }

  // Transform recent activity to RecentSale format for the component
  const recentSales: RecentSale[] = recentActivity
    .filter(activity => activity.type === 'invoice' || activity.type === 'order')
    .slice(0, 5)
    .map((activity) => ({
      name: activity.customer,
      email: activity.customer, // We'll use customer name as email for now
      amount: activity.amount || 0,
      fallback: activity.customer.split(' ').map(n => n[0]).join('').toUpperCase(),
    }));

  // Transform revenue data for the Overview component
  const overviewData: OverviewDataPoint[] = revenueData.map(data => ({
    name: new Date(data.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
    total: data.revenue,
  }));

  const statsCards = [
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : 'R0.00',
      description: stats && stats.monthlyGrowth !== 0 
        ? `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}% from last month`
        : '',
      icon: DollarSign,
    },
    {
      title: 'Total Sales',
      value: stats ? `${stats.totalSales}` : '0',
      description: `Combined orders and invoices`,
      icon: CreditCard,
    },
    {
      title: 'Paid Invoices',
      value: stats ? `${stats.paidInvoices}` : '0',
      description: `${stats ? formatCurrency(stats.totalRevenue) : '0.00'} in revenue`,
      icon: FileText,
    },
    {
      title: 'Active Customers',
      value: stats ? `${stats.activeCustomers}` : '0',
      description: `${stats ? stats.totalCustomers : 0} total customers`,
      icon: Users,
    },
    {
      title: 'Active Now',
      value: activeNow !== null ? `+${activeNow}` : '-',
      description: 'Users currently on site',
      icon: Activity,
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-1 sm:pl-2">
            <Suspense fallback={<div className="text-sm">Loading chart...</div>}>
              <Overview data={overviewData} />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-sm">Loading recent sales...</div>}>
              <RecentSales sales={recentSales} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      
      {/* Stock Management Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Stock Management</h3>
        <StockManagement />
      </div>
      
      <AdminRecoveryHandler />
    </div>
  );
} 
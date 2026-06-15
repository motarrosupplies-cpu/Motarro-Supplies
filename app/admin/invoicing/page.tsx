'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Receipt, 
  UserCheck, 
  Users, 
  Plus, 
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { invoiceService } from '@/lib/services/invoiceService';
import { Invoice, Quotation, CreditNote, Customer } from '@/types/invoice';

export default function InvoicingDashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalQuotations: 0,
    totalCreditNotes: 0,
    totalCustomers: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    pendingQuotations: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [invoices, quotations, creditNotes, customers] = await Promise.all([
        invoiceService.getInvoices(),
        invoiceService.getQuotations(),
        invoiceService.getCreditNotes(),
        invoiceService.getCustomers(),
      ]);

      const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length;
      const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE').length;
      const pendingQuotations = quotations.filter(q => q.status === 'SENT').length;

      setStats({
        totalInvoices: invoices.length,
        totalQuotations: quotations.length,
        totalCreditNotes: creditNotes.length,
        totalCustomers: customers.length,
        paidInvoices,
        overdueInvoices,
        pendingQuotations,
      });

      setRecentInvoices(invoices.slice(0, 5));
      setRecentQuotations(quotations.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'ACCEPTED':
      case 'APPLIED':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading invoicing dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoicing Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your invoices, quotations, and credit notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/quotations/new">
              <Receipt className="mr-2 h-4 w-4" />
              New Quotation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidInvoices} paid, {stats.overdueInvoices} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuotations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingQuotations} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Notes</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCreditNotes}</div>
            <p className="text-xs text-muted-foreground">
              Total credit notes issued
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Total customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoices
            </CardTitle>
            <CardDescription>
              Create and manage customer invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/invoices">
                View All Invoices
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Quotations
            </CardTitle>
            <CardDescription>
              Create and manage customer quotations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/quotations">
                View All Quotations
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/quotations/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Quotation
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Credit Notes
            </CardTitle>
            <CardDescription>
              Create and manage credit notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/credit-notes">
                View All Credit Notes
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/credit-notes/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Credit Note
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
              Latest invoices created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices yet</p>
              ) : (
                recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.customer.firstName} {invoice.customer.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R {invoice.total.toFixed(2)}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
              {recentInvoices.length > 0 && (
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admin/invoices">View All Invoices</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
            <CardDescription>
              Latest quotations created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentQuotations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No quotations yet</p>
              ) : (
                recentQuotations.map((quotation) => (
                  <div key={quotation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{quotation.quotationNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {quotation.customer.firstName} {quotation.customer.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R {quotation.total.toFixed(2)}</p>
                      <Badge className={getStatusColor(quotation.status)}>
                        {quotation.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
              {recentQuotations.length > 0 && (
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admin/quotations">View All Quotations</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
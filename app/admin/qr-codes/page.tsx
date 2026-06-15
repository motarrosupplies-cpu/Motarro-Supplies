'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QRCodeList } from '@/components/admin/qr-codes/QRCodeList';
import { QRCode, QRCodeStatus, QRCodeType } from '@/types/qr-code';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function QRCodesPage() {
  const router = useRouter();
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all' as QRCodeStatus | 'all',
    type: 'all' as QRCodeType | 'all',
    search: '',
  });
  const { toast } = useToast();

  // Load QR codes when filters change
  useEffect(() => {
    loadQRCodes();
  }, [filters]);

  // Refresh data when page becomes visible (e.g., when navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadQRCodes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh on focus (when user switches back to tab)
    const handleFocus = () => {
      loadQRCodes();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      
      // Add cache-busting timestamp to ensure fresh data
      params.append('_t', Date.now().toString());

      const response = await fetch(`/api/qr-codes?${params.toString()}`, {
        cache: 'no-store', // Prevent caching
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch QR codes');
      
      const data = await response.json();
      setQRCodes(data);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load QR codes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting QR code:', id);
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Delete API error:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to delete QR code');
      }

      const result = await response.json();
      console.log('Delete response:', result);

      toast({
        title: 'Success',
        description: 'QR code deleted successfully',
      });

      // Immediately reload the list with cache-busting
      await loadQRCodes();
    } catch (error: any) {
      console.error('Error deleting QR code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete QR code',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'deactivated' }),
      });

      if (!response.ok) throw new Error('Failed to deactivate QR code');

      toast({
        title: 'Success',
        description: 'QR code deactivated successfully',
      });

      loadQRCodes();
    } catch (error) {
      console.error('Error deactivating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate QR code',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
          <p className="text-muted-foreground">
            Create and manage QR codes for URLs and discount codes
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/qr-codes/new">
            <Plus className="mr-2 h-4 w-4" />
            Create QR Code
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or URL..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value as QRCodeStatus | 'all' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value as QRCodeType | 'all' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="vcard">V-card</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="wifi">WiFi</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="barcode">Barcode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Loading QR codes...</div>
          </CardContent>
        </Card>
      ) : (
        <QRCodeList
          qrCodes={qrCodes}
          onDelete={handleDelete}
          onDeactivate={handleDeactivate}
        />
      )}
    </div>
  );
}


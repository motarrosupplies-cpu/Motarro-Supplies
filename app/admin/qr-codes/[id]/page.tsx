'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Download, Trash2, Archive, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { QRCode } from '@/types/qr-code';
import { QRCodePreview } from '@/components/admin/qr-codes/QRCodePreview';
import { format } from 'date-fns';
// Client-side URL helper - doesn't need qrcode library
function getQRCodeUrl(shortUrl: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/qr/${shortUrl}`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za';
  return `${baseUrl}/qr/${shortUrl}`;
}

export default function QRCodeDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [qrCodeId, setQrCodeId] = useState<string>('');

  // Resolve params if it's a Promise (Next.js 15)
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = params instanceof Promise ? await params : params;
      setQrCodeId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (qrCodeId) {
      loadQRCode();
    }
  }, [qrCodeId]);

  const loadQRCode = async () => {
    if (!qrCodeId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/qr-codes/${qrCodeId}`);
      if (!response.ok) throw new Error('Failed to load QR code');
      
      const data = await response.json();
      setQRCode(data);
    } catch (error) {
      console.error('Error loading QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to load QR code',
        variant: 'destructive',
      });
      router.push('/admin/qr-codes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!qrCodeId) return;
    
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/qr-codes/${qrCodeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to delete QR code');
      }

      toast({
        title: 'Success',
        description: 'QR code deleted successfully',
      });

      router.push('/admin/qr-codes');
    } catch (error: any) {
      console.error('Error deleting QR code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete QR code',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async () => {
    try {
      const response = await fetch(`/api/qr-codes/${qrCodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'deactivated' }),
      });

      if (!response.ok) throw new Error('Failed to deactivate QR code');

      toast({
        title: 'Success',
        description: 'QR code deactivated successfully',
      });

      loadQRCode();
    } catch (error) {
      console.error('Error deactivating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate QR code',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'deactivated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'url':
        return 'bg-blue-100 text-blue-800';
      case 'discount':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading QR code...</div>
      </div>
    );
  }

  if (!qrCode) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/qr-codes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{qrCode.title}</h1>
            <div className="flex gap-2 mt-2">
              <Badge className={getStatusColor(qrCode.status)}>
                {qrCode.status}
              </Badge>
              <Badge className={getTypeColor(qrCode.type)}>
                {qrCode.type}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/qr-codes/${qrCodeId}/analytics`}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/qr-codes/${qrCodeId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const url = `/api/qr-codes/${qrCodeId}/generate?format=png&size=1000`;
              window.open(url, '_blank');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {qrCode.status === 'active' && (
            <Button variant="outline" onClick={handleDeactivate}>
              <Archive className="mr-2 h-4 w-4" />
              Deactivate
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - QR Code Preview */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <QRCodePreview
              shortUrl={qrCode.short_url}
              design={qrCode.design_config || {}}
              type={qrCode.type}
              content={qrCode.content}
              qrCodeId={qrCode.id}
            />
          </CardContent>
        </Card>

        {/* Right Column - Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-sm mt-1">{qrCode.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-sm mt-1 capitalize">{qrCode.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Short URL</label>
                <p className="text-sm mt-1 font-mono break-all">
                  {getQRCodeUrl(qrCode.short_url)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {qrCode.type === 'url' ? 'Destination URL' : 'Discount Code'}
                </label>
                <p className="text-sm mt-1 break-all">{qrCode.content}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Scans</label>
                <p className="text-sm mt-1 font-bold text-lg">{qrCode.scan_count}</p>
              </div>
              {qrCode.expires_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expires At</label>
                  <p className="text-sm mt-1">
                    {format(new Date(qrCode.expires_at), 'PPp')}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm mt-1">
                  {format(new Date(qrCode.created_at), 'PPp')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm mt-1">
                  {format(new Date(qrCode.updated_at), 'PPp')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


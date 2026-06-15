'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeAnalytics as QRCodeAnalyticsType } from '@/types/qr-code';
import { QRCodeAnalytics } from '@/components/admin/qr-codes/QRCodeAnalytics';

export default function QRCodeAnalyticsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<QRCodeAnalyticsType | null>(null);
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
      loadAnalytics();
    }
  }, [qrCodeId]);

  const loadAnalytics = async () => {
    if (!qrCodeId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/qr-codes/${qrCodeId}/analytics`);
      if (!response.ok) throw new Error('Failed to load analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive',
      });
      router.push(`/admin/qr-codes/${qrCodeId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/qr-codes/${qrCodeId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Code Analytics</h1>
          <p className="text-muted-foreground">
            View scan statistics and analytics for this QR code
          </p>
        </div>
      </div>

      <QRCodeAnalytics analytics={analytics} />
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Copy, Check } from 'lucide-react';
// Client-side URL helper
function getQRCodeUrl(shortUrl: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/qr/${shortUrl}`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za';
  return `${baseUrl}/qr/${shortUrl}`;
}
import { QRCodeDesign, QRCodeType } from '@/types/qr-code';
import { useToast } from '@/components/ui/use-toast';

interface QRCodePreviewProps {
  shortUrl: string;
  design: QRCodeDesign;
  type: QRCodeType;
  content: string;
  qrCodeId?: string;
}

export function QRCodePreview({ shortUrl, design, type, content, qrCodeId }: QRCodePreviewProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const generatePreview = async () => {
      setLoading(true);
      try {
        if (qrCodeId) {
          // Use the generate endpoint directly - no blob conversion needed
          // The API endpoint returns the image directly, so we can use it as img src
          const imageUrl = `/api/qr-codes/${qrCodeId}/generate?format=png&size=300&t=${Date.now()}`;
          
          // Verify the image loads by creating a test image
          const testImg = new Image();
          testImg.onload = () => {
            setQrCodeDataUrl(imageUrl);
            setLoading(false);
          };
          testImg.onerror = async () => {
            // If image fails to load, try to get error details
            try {
              const response = await fetch(imageUrl);
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('QR code generation failed:', errorData);
                toast({
                  title: 'Error',
                  description: errorData.message || 'Failed to generate QR code image',
                  variant: 'destructive',
                });
              }
            } catch (fetchError) {
              console.error('Error fetching QR code:', fetchError);
              toast({
                title: 'Error',
                description: 'Failed to load QR code image',
                variant: 'destructive',
              });
            }
            setQrCodeDataUrl('');
            setLoading(false);
          };
          testImg.src = imageUrl;
        } else {
          // For preview during creation, use the preview endpoint
          const response = await fetch('/api/qr-codes/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shortUrl, design, type, content }),
          });

          if (response.ok) {
            // Convert to blob URL for preview (CSP allows blob: now)
            const blob = await response.blob();
            const dataUrl = URL.createObjectURL(blob);
            setQrCodeDataUrl(dataUrl);
            setLoading(false);
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Preview API error:', errorData);
            setQrCodeDataUrl('');
            setLoading(false);
            toast({
              title: 'Error',
              description: errorData.message || 'Failed to generate QR code preview',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Error generating QR code preview:', error);
        setQrCodeDataUrl('');
        setLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to generate QR code preview',
          variant: 'destructive',
        });
      }
    };

    generatePreview();
    
    // Cleanup blob URLs on unmount to prevent memory leaks
    return () => {
      if (qrCodeDataUrl && qrCodeDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(qrCodeDataUrl);
      }
    };
  }, [design, shortUrl, qrCodeId, toast, type, content]); // Added type and content to dependencies

  const handleDownload = async (format: 'png' | 'svg') => {
    try {
      if (!qrCodeId) {
        toast({
          title: 'Error',
          description: 'QR code must be saved before downloading',
          variant: 'destructive',
        });
        return;
      }

      const url = `/api/qr-codes/${qrCodeId}/generate?format=${format}&size=1000`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `qr-code-${shortUrl}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: 'Success',
        description: `QR code downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive',
      });
    }
  };

  const handleCopyUrl = () => {
    const qrUrl = getQRCodeUrl(shortUrl);
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'QR code URL copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyImage = async () => {
    try {
      if (!qrCodeDataUrl) return;
      
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast({
        title: 'Copied!',
        description: 'QR code image copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying image:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy image to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <CardContent className="flex items-center justify-center">
          <div className="text-muted-foreground">Generating preview...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-center p-4 bg-white rounded-lg border-2 border-dashed min-h-[300px]">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="QR Code Preview"
              className="w-full max-w-[300px] h-auto"
            />
          ) : (
            <div className="text-muted-foreground text-center">
              {qrCodeId ? 'Loading preview...' : 'Save QR code to see preview'}
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Short URL:</span>{' '}
            <code className="text-xs bg-muted px-2 py-1 rounded">{getQRCodeUrl(shortUrl)}</code>
          </div>
          <div>
            <span className="font-medium">Type:</span> {type}
          </div>
          <div>
            <span className="font-medium">Destination:</span>{' '}
            <span className="text-xs text-muted-foreground break-all">{content}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {qrCodeId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('png')}
              >
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('svg')}
              >
                <Download className="h-4 w-4 mr-2" />
                SVG
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyImage}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Image
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


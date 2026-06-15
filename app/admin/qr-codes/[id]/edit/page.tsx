'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { QRCodeDesigner } from '@/components/admin/qr-codes/QRCodeDesigner';
import { QRCodePreview } from '@/components/admin/qr-codes/QRCodePreview';
import { QRCode, UpdateQRCodeData, QRCodeDesign, QRCodeType } from '@/types/qr-code';

export default function EditQRCodePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrCode, setQRCode] = useState<QRCode | null>(null);
  const [formData, setFormData] = useState<UpdateQRCodeData>({
    title: '',
    type: 'url',
    content: '',
    design_config: {},
    expires_at: undefined,
  });

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
      setFormData({
        title: data.title,
        type: data.type,
        content: data.content,
        design_config: data.design_config || {},
        expires_at: data.expires_at,
      });
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

  const handleInputChange = (field: keyof UpdateQRCodeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDesignChange = (design: QRCodeDesign) => {
    setFormData(prev => ({ ...prev, design_config: design }));
  };

  const validateStep1 = () => {
    if (!formData.title?.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.content?.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter content',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.type === 'url' && formData.content) {
      try {
        new URL(formData.content);
      } catch {
        toast({
          title: 'Error',
          description: 'Please enter a valid URL',
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/qr-codes/${qrCodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update QR code');
      }

      toast({
        title: 'Success',
        description: 'QR code updated successfully',
      });

      router.push(`/admin/qr-codes/${qrCodeId}`);
    } catch (error: any) {
      console.error('Error updating QR code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update QR code',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/qr-codes/${qrCodeId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit QR Code</h1>
          <p className="text-muted-foreground">
            Step {step} of 3: {step === 1 ? 'Complete the content' : step === 2 ? 'Design your QR Code' : 'Download QR Code'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <CardTitle>Complete the content</CardTitle>
                </div>
                <CardDescription>
                  Enter the details for your QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="My QR Code"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">QR Code Type</Label>
                  <Select
                    value={formData.type || 'url'}
                    onValueChange={(value) => handleInputChange('type', value as QRCodeType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">Website URL</SelectItem>
                      <SelectItem value="discount">Discount Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'url' && (
                  <div className="space-y-2">
                    <Label htmlFor="url">Destination URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.content || ''}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                {formData.type === 'discount' && (
                  <div className="space-y-2">
                    <Label htmlFor="discount-code">Discount Code</Label>
                    <Input
                      id="discount-code"
                      placeholder="SAVE20"
                      value={formData.content || ''}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="expires-at">Expiration Date (Optional)</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={formData.expires_at ? (() => {
                      // Convert UTC ISO string to local datetime-local format
                      const date = new Date(formData.expires_at);
                      // Get local date/time components
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(2, '0');
                      return `${year}-${month}-${day}T${hours}:${minutes}`;
                    })() : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        // datetime-local gives us local time string (e.g., "2025-12-24T22:00")
                        // Create a Date object treating it as local time
                        const localDateString = e.target.value;
                        // Parse as local time and convert to ISO (UTC) for storage
                        const localDate = new Date(localDateString);
                        // Store as ISO string (UTC)
                        handleInputChange('expires_at', localDate.toISOString());
                      } else {
                        handleInputChange('expires_at', undefined);
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <CardTitle>Design your QR Code</CardTitle>
                </div>
                <CardDescription>
                  Customize the appearance of your QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QRCodeDesigner
                  design={formData.design_config || {}}
                  onDesignChange={handleDesignChange}
                />
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <CardTitle>Download QR Code</CardTitle>
                </div>
                <CardDescription>
                  Save your changes and download the QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Click &quot;Save Changes&quot; to update your QR code. 
                    You&apos;ll be able to download it in different formats after saving.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <QRCodePreview
                shortUrl={qrCode.short_url}
                design={formData.design_config || qrCode.design_config || {}}
                type={formData.type || qrCode.type}
                content={formData.content || qrCode.content}
                qrCodeId={qrCodeId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { CreateQRCodeData, QRCodeDesign, QRCodeType } from '@/types/qr-code';
import { generateShortUrl } from '@/lib/services/qrCodeService';

export default function NewQRCodePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [formData, setFormData] = useState<CreateQRCodeData>({
    title: '',
    type: 'url',
    content: '',
    design_config: {},
    expires_at: undefined,
  });

  // Generate short URL on mount
  useEffect(() => {
    // We'll generate a temporary short URL for preview
    // The actual one will be generated on save
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let slug = '';
    for (let i = 0; i < 6; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setShortUrl(slug);
  }, []);

  const handleInputChange = (field: keyof CreateQRCodeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDesignChange = (design: QRCodeDesign) => {
    setFormData(prev => ({ ...prev, design_config: design }));
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter content',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.type === 'url') {
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

    // Ensure content is preserved - log for debugging
    console.log('Saving QR code with formData:', {
      title: formData.title,
      type: formData.type,
      content: formData.content,
      hasContent: !!formData.content,
      contentLength: formData.content?.length || 0,
    });

    // Validate that content exists
    if (!formData.content || formData.content.trim() === '') {
      toast({
        title: 'Error',
        description: 'Content is required. Please go back to step 1 and enter content.',
        variant: 'destructive',
      });
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      // Create the payload explicitly to ensure content is included
      const payload = {
        title: formData.title,
        type: formData.type,
        content: formData.content, // Explicitly include content
        design_config: formData.design_config || {},
        expires_at: formData.expires_at || undefined,
      };

      console.log('Sending payload to API:', payload);

      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create QR code');
      }

      const qrCode = await response.json();
      
      toast({
        title: 'Success',
        description: 'QR code created successfully',
      });

      router.push(`/admin/qr-codes/${qrCode.id}`);
    } catch (error: any) {
      console.error('Error creating QR code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create QR code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/qr-codes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create QR Code</h1>
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
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">QR Code Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value as QRCodeType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">Link</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="vcard">V-card</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="wifi">WI-FI</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                      <SelectItem value="images">Images</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="barcode">2D Barcode</SelectItem>
                      <SelectItem value="discount">Discount Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'url' && (
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                {formData.type === 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="text">Text Content</Label>
                    <Textarea
                      id="text"
                      placeholder="Enter your text here..."
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                {formData.type === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={typeof formData.content === 'string' && formData.content.includes('@') ? formData.content : ''}
                      onChange={(e) => {
                        const emailData = { email: e.target.value };
                        handleInputChange('content', JSON.stringify(emailData));
                      }}
                    />
                  </div>
                )}

                {formData.type === 'call' && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                {formData.type === 'sms' && (
                  <div className="space-y-2">
                    <Label htmlFor="sms-phone">Phone Number</Label>
                    <Input
                      id="sms-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                {formData.type === 'whatsapp' && (
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-phone">Phone Number</Label>
                    <Input
                      id="whatsapp-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                {formData.type === 'wifi' && (
                  <div className="space-y-2">
                    <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                    <Input
                      id="wifi-ssid"
                      placeholder="MyWiFi"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                {formData.type === 'vcard' && (
                  <div className="space-y-2">
                    <Label htmlFor="vcard-name">Contact Name</Label>
                    <Input
                      id="vcard-name"
                      placeholder="John Doe"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                {['pdf', 'app', 'images', 'video', 'social'].includes(formData.type) && (
                  <div className="space-y-2">
                    <Label htmlFor="content-url">URL</Label>
                    <Input
                      id="content-url"
                      type="url"
                      placeholder="https://example.com/file.pdf"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                {formData.type === 'event' && (
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      placeholder="My Event"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                    />
                  </div>
                )}

                {formData.type === 'barcode' && (
                  <div className="space-y-2">
                    <Label htmlFor="barcode-data">Barcode Data</Label>
                    <Input
                      id="barcode-data"
                      placeholder="1234567890"
                      value={formData.content}
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
                      value={formData.content}
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
                  Save your QR code and download it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Click &quot;Save QR Code&quot; to create and save your QR code. 
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
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save QR Code'}
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
              {shortUrl && (
                <QRCodePreview
                  shortUrl={shortUrl}
                  design={formData.design_config || {}}
                  type={formData.type}
                  content={formData.content}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


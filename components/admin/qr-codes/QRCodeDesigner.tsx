'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { QRCodeDesign } from '@/types/qr-code';
import { Upload, X } from 'lucide-react';

interface QRCodeDesignerProps {
  design: QRCodeDesign;
  onDesignChange: (design: QRCodeDesign) => void;
}

// Frame options - expanded to match QR.io style
const FRAME_OPTIONS = [
  { id: 'none', label: 'None', icon: '✕', preview: 'none' },
  { id: 'rounded', label: 'Rounded', icon: '▢', preview: 'rounded' },
  { id: 'circular', label: 'Circular', icon: '○', preview: 'circular' },
  { id: 'scan-me', label: 'Scan Me', icon: '📱', preview: 'scan-me-button' },
  { id: 'scan-me-simple', label: 'Scan Me Simple', icon: '📱', preview: 'scan-me-simple' },
  { id: 'scan-me-qr', label: 'Scan Me QR', icon: '📱', preview: 'scan-me-qr' },
  { id: 'scan-me-menu', label: 'Scan Me Menu', icon: '📱', preview: 'scan-me-menu' },
];

// Shape options - expanded to 8 styles
const SHAPE_OPTIONS = [
  { id: 'standard', label: 'Standard', preview: 'standard' },
  { id: 'rounded', label: 'Rounded', preview: 'rounded' },
  { id: 'dots', label: 'Dots', preview: 'dots' },
  { id: 'horizontal', label: 'Horizontal', preview: 'horizontal' },
  { id: 'classy', label: 'Classy', preview: 'classy' },
  { id: 'classy-rounded', label: 'Classy Rounded', preview: 'classy-rounded' },
  { id: 'extra-rounded', label: 'Extra Rounded', preview: 'extra-rounded' },
  { id: 'square', label: 'Square', preview: 'square' },
];

// Preset logo icons - expanded list
const LOGO_ICONS = [
  { id: 'none', icon: '✕', label: 'None' },
  { id: 'link', icon: '🔗', label: 'Link' },
  { id: 'location', icon: '📍', label: 'Location' },
  { id: 'email', icon: '✉️', label: 'Email' },
  { id: 'whatsapp', icon: '💬', label: 'WhatsApp' },
  { id: 'wifi', icon: '📶', label: 'WiFi' },
  { id: 'vcard', icon: '👤', label: 'Contact' },
  { id: 'paypal', icon: '💳', label: 'PayPal' },
  { id: 'bitcoin', icon: '₿', label: 'Bitcoin' },
  { id: 'scan-me', icon: '📱', label: 'Scan Me' },
  { id: 'scan-me-text', icon: '📱', label: 'Scan Me Text' },
  { id: 'scan-me-icon', icon: '📱', label: 'Scan Me Icon' },
  { id: 'scan-me-menu', icon: '📱', label: 'Scan Me Menu' },
  { id: 'qr-code', icon: '▦', label: 'QR Code' },
];

export function QRCodeDesigner({ design, onDesignChange }: QRCodeDesignerProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const updateDesign = (updates: Partial<QRCodeDesign>) => {
    onDesignChange({ ...design, ...updates });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you'd upload this to Supabase storage
      // For now, we'll create a data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        updateDesign({ logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
      setLogoFile(file);
    }
  };

  const removeLogo = () => {
    updateDesign({ logo_url: undefined });
    setLogoFile(null);
  };

  const selectPresetLogo = (iconId: string) => {
    // For preset icons, you could use emoji or SVG icons
    // This is a simplified version
    updateDesign({ logo_url: `preset:${iconId}` });
  };

  return (
    <Tabs defaultValue="frame" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="frame">Frame</TabsTrigger>
        <TabsTrigger value="shape">Shape</TabsTrigger>
        <TabsTrigger value="logo">Logo</TabsTrigger>
      </TabsList>

      <TabsContent value="frame" className="space-y-4">
        <div>
          <Label className="mb-2 block">Frame Style</Label>
          <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
            {FRAME_OPTIONS.map((frame) => (
              <button
                key={frame.id}
                onClick={() => updateDesign({ frame: frame.id })}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  design.frame === frame.id
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-1">{frame.icon}</div>
                <div className="text-xs">{frame.label}</div>
              </button>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="shape" className="space-y-4">
        <div>
          <Label className="mb-2 block">Shape Style</Label>
          <div className="grid grid-cols-4 gap-2">
            {SHAPE_OPTIONS.map((shape) => (
              <button
                key={shape.id}
                onClick={() => updateDesign({ shape: shape.id })}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  design.shape === shape.id
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="text-xs font-medium">{shape.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="background-color"
                type="color"
                value={design.background_color || '#FFFFFF'}
                onChange={(e) => updateDesign({ background_color: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={design.background_color || '#FFFFFF'}
                onChange={(e) => updateDesign({ background_color: e.target.value })}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="transparent-bg"
                checked={design.transparent_background || false}
                onCheckedChange={(checked) => updateDesign({ transparent_background: checked })}
              />
              <Label htmlFor="transparent-bg" className="cursor-pointer">
                Transparent background
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foreground-color">Shape Color</Label>
            <div className="flex gap-2">
              <Input
                id="foreground-color"
                type="color"
                value={design.foreground_color || '#000000'}
                onChange={(e) => updateDesign({ foreground_color: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={design.foreground_color || '#000000'}
                onChange={(e) => updateDesign({ foreground_color: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="gradient"
                checked={design.gradient || false}
                onCheckedChange={(checked) => updateDesign({ gradient: checked })}
              />
              <Label htmlFor="gradient" className="cursor-pointer">
                Gradient
              </Label>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="logo" className="space-y-4">
        <div>
          <Label className="mb-2 block">Upload Logo</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="flex-1"
            />
            {design.logo_url && (
              <Button variant="outline" size="icon" onClick={removeLogo}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Or choose from here</Label>
          <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
            {LOGO_ICONS.map((logo) => {
              if (logo.id === 'none') {
                return (
                  <button
                    key={logo.id}
                    onClick={removeLogo}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      !design.logo_url
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{logo.icon}</div>
                    <div className="text-xs">{logo.label}</div>
                  </button>
                );
              }
              return (
                <button
                  key={logo.id}
                  onClick={() => selectPresetLogo(logo.id)}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    design.logo_url === `preset:${logo.id}`
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{logo.icon}</div>
                  <div className="text-xs">{logo.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {design.logo_url && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <Label className="mb-2 block">Current Logo</Label>
              {design.logo_url.startsWith('preset:') ? (
                <div className="text-4xl">
                  {LOGO_ICONS.find(l => `preset:${l.id}` === design.logo_url)?.icon}
                </div>
              ) : (
                <img
                  src={design.logo_url}
                  alt="Logo preview"
                  className="max-w-[100px] max-h-[100px] object-contain"
                />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="remove-logo-bg"
                checked={design.logo_remove_bg || false}
                onCheckedChange={(checked) => updateDesign({ logo_remove_bg: checked })}
              />
              <Label htmlFor="remove-logo-bg" className="cursor-pointer">
                Remove background behind Logo
              </Label>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}


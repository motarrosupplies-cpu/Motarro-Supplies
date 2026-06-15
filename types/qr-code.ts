// QR Code TypeScript Types and Interfaces

export type QRCodeType = 
  | 'url' 
  | 'text' 
  | 'email' 
  | 'call' 
  | 'sms' 
  | 'vcard' 
  | 'whatsapp' 
  | 'wifi' 
  | 'pdf' 
  | 'app' 
  | 'images' 
  | 'video' 
  | 'social' 
  | 'event' 
  | 'barcode' 
  | 'discount';
export type QRCodeStatus = 'active' | 'archived' | 'deactivated';
export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

export interface QRCodeDesign {
  frame?: string; // Frame style identifier
  shape?: string; // QR code shape style
  foreground_color?: string; // Hex color for QR code
  background_color?: string; // Hex color for background
  transparent_background?: boolean;
  gradient?: boolean;
  logo_url?: string; // URL to logo image
  logo_remove_bg?: boolean; // Remove background behind logo
}

export interface QRCode {
  id: string;
  title: string;
  type: QRCodeType;
  content: string; // URL or discount code data
  short_url: string;
  status: QRCodeStatus;
  design_config: QRCodeDesign;
  scan_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface QRCodeScan {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  ip_address?: string;
  user_agent?: string;
  device_type: DeviceType;
  country?: string;
  city?: string;
}

export interface CreateQRCodeData {
  title: string;
  type: QRCodeType;
  content: string;
  design_config?: QRCodeDesign;
  expires_at?: string;
}

export interface UpdateQRCodeData {
  title?: string;
  type?: QRCodeType;
  content?: string;
  status?: QRCodeStatus;
  design_config?: QRCodeDesign;
  expires_at?: string;
}

export interface QRCodeAnalytics {
  total_scans: number;
  scans_by_date: Array<{ date: string; count: number }>;
  scans_by_device: Array<{ device_type: DeviceType; count: number }>;
  scans_by_location: Array<{ country?: string; city?: string; count: number }>;
  recent_scans: QRCodeScan[];
}

export interface QRCodeListFilters {
  status?: QRCodeStatus;
  type?: QRCodeType;
  search?: string;
  start_date?: string;
  end_date?: string;
}


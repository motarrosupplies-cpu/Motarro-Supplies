import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Helper to get admin client directly (bypasses proxy issues)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
import {
  QRCode,
  QRCodeScan,
  CreateQRCodeData,
  UpdateQRCodeData,
  QRCodeAnalytics,
  QRCodeListFilters,
  DeviceType,
} from '@/types/qr-code';

export class QRCodeService {
  // Generate a unique short URL slug
  private async generateShortUrl(): Promise<string> {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Generate random 6-character slug
      let slug = '';
      for (let i = 0; i < 6; i++) {
        slug += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if slug exists
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('short_url', slug)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found - slug is available
        return slug;
      }

      attempts++;
    }

    // Fallback: use timestamp-based slug
    return `qr${Date.now().toString(36)}`;
  }

  // Map database row to QRCode type
  private mapDbToQRCode(row: any): QRCode {
    return {
      id: row.id,
      title: row.title,
      type: row.type,
      content: row.content,
      short_url: row.short_url,
      status: row.status || 'active',
      design_config: row.design_config || {},
      scan_count: row.scan_count || 0,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      expires_at: row.expires_at,
    };
  }

  // Map database row to QRCodeScan type
  private mapDbToQRCodeScan(row: any): QRCodeScan {
    return {
      id: row.id,
      qr_code_id: row.qr_code_id,
      scanned_at: row.scanned_at,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      device_type: row.device_type || 'unknown',
      country: row.country,
      city: row.city,
    };
  }

  // Detect device type from user agent
  private detectDeviceType(userAgent?: string): DeviceType {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
      return 'mobile';
    }
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Create new QR code
  async createQRCode(data: CreateQRCodeData, userId?: string): Promise<QRCode> {
    const shortUrl = await this.generateShortUrl();
    const now = new Date().toISOString();

    // Use admin client to bypass RLS
    const client = supabaseAdmin || supabase;

    // Validate content is present and not empty
    if (!data.content || data.content.trim() === '') {
      throw new Error('Content is required and cannot be empty');
    }

    // Log what we're about to save
    console.log('Creating QR code in database:', {
      title: data.title,
      type: data.type,
      content: data.content.substring(0, 100), // Log first 100 chars
      contentLength: data.content.length,
      shortUrl,
    });

    const { data: qrCode, error } = await client
      .from('qr_codes')
      .insert([{
        title: data.title,
        type: data.type,
        content: data.content.trim(), // Trim but preserve content
        short_url: shortUrl,
        status: 'active',
        design_config: data.design_config || {},
        scan_count: 0,
        created_by: userId,
        created_at: now,
        updated_at: now,
        expires_at: data.expires_at,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating QR code:', error);
      throw error;
    }

    // Verify the saved content matches what we sent
    const savedQRCode = this.mapDbToQRCode(qrCode);
    console.log('QR code created, verifying saved content:', {
      savedContent: savedQRCode.content?.substring(0, 100),
      savedContentLength: savedQRCode.content?.length,
      matches: savedQRCode.content === data.content.trim(),
    });

    return savedQRCode;
  }

  // Get single QR code by ID
  async getQRCode(id: string): Promise<QRCode | null> {
    // Use admin client to bypass RLS
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching QR code:', error);
      throw error;
    }
    return this.mapDbToQRCode(data);
  }

  // Get QR code by short URL (for public redirect)
  async getQRCodeByShortUrl(shortUrl: string): Promise<QRCode | null> {
    // Use regular client for public access (RLS allows active QR codes to be read)
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_url', shortUrl)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching QR code by short URL:', error);
      throw error;
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    return this.mapDbToQRCode(data);
  }

  // List QR codes with filters
  async getQRCodes(filters?: QRCodeListFilters): Promise<QRCode[]> {
    // Use admin client to bypass RLS if needed
    const client = supabaseAdmin || supabase;
    
    let query = client
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,short_url.ilike.%${filters.search}%`);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching QR codes from database:', error);
      throw error;
    }
    
    return (data || []).map(row => this.mapDbToQRCode(row));
  }

  // Update QR code
  async updateQRCode(id: string, data: UpdateQRCodeData): Promise<QRCode> {
    // Use admin client to bypass RLS
    const client = supabaseAdmin || supabase;
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.type !== undefined) updateData.type = data.type;
    // Ensure content is never overridden to empty or default values
    if (data.content !== undefined) {
      if (data.content.trim() === '') {
        throw new Error('Content cannot be empty');
      }
      updateData.content = data.content.trim(); // Trim but preserve
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.design_config !== undefined) updateData.design_config = data.design_config;
    if (data.expires_at !== undefined) updateData.expires_at = data.expires_at;

    // Log update for debugging
    if (data.content !== undefined) {
      console.log('Updating QR code content:', {
        id,
        newContent: data.content.substring(0, 100),
        contentLength: data.content.length,
      });
    }

    const { data: qrCode, error } = await client
      .from('qr_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating QR code:', error);
      throw error;
    }

    // Verify the updated content
    const updatedQRCode = this.mapDbToQRCode(qrCode);
    if (data.content !== undefined) {
      console.log('QR code updated, verifying content:', {
        savedContent: updatedQRCode.content?.substring(0, 100),
        savedContentLength: updatedQRCode.content?.length,
        matches: updatedQRCode.content === data.content.trim(),
      });
    }

    return updatedQRCode;
  }

  // Delete/Archive QR code
  async deleteQRCode(id: string): Promise<void> {
    console.log('Attempting to delete QR code:', id);
    
    // Get admin client directly to bypass proxy issues
    const adminClient = getAdminClient();
    
    if (!adminClient) {
      console.error('Admin client is not available - SUPABASE_SERVICE_ROLE_KEY may be missing');
      throw new Error('Admin client not available. Please check SUPABASE_SERVICE_ROLE_KEY environment variable.');
    }

    try {
      const { data, error } = await adminClient
        .from('qr_codes')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase delete error:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(`Failed to delete QR code: ${error.message}${error.hint ? ` (${error.hint})` : ''}`);
      }

      if (!data || data.length === 0) {
        console.warn('Delete operation returned no data - QR code may not exist:', id);
        // Don't throw error - deletion might have succeeded but returned no data
      }

      console.log('QR code deleted successfully:', data);
    } catch (err: any) {
      // If it's already an Error with message, re-throw it
      if (err instanceof Error && err.message.includes('Failed to delete')) {
        throw err;
      }
      // Otherwise wrap it
      console.error('Unexpected error during delete:', err);
      throw new Error(`Failed to delete QR code: ${err.message || 'Unknown error'}`);
    }
  }

  // Track scan event
  async trackScan(
    qrCodeId: string,
    scanData: {
      ip_address?: string;
      user_agent?: string;
      country?: string;
      city?: string;
    }
  ): Promise<void> {
    const deviceType = this.detectDeviceType(scanData.user_agent);

    // Insert scan record
    await supabase
      .from('qr_code_scans')
      .insert([{
        qr_code_id: qrCodeId,
        scanned_at: new Date().toISOString(),
        ip_address: scanData.ip_address,
        user_agent: scanData.user_agent,
        device_type: deviceType,
        country: scanData.country,
        city: scanData.city,
      }]);

    // Increment scan count
    const { data: qrCode } = await supabase
      .from('qr_codes')
      .select('scan_count')
      .eq('id', qrCodeId)
      .single();

    if (qrCode) {
      await supabase
        .from('qr_codes')
        .update({ scan_count: (qrCode.scan_count || 0) + 1 })
        .eq('id', qrCodeId);
    }
  }

  // Get analytics for a QR code
  async getAnalytics(qrCodeId: string): Promise<QRCodeAnalytics> {
    // Get all scans for this QR code
    const { data: scans, error } = await supabase
      .from('qr_code_scans')
      .select('*')
      .eq('qr_code_id', qrCodeId)
      .order('scanned_at', { ascending: false });

    if (error) throw error;

    const scanList = (scans || []).map(row => this.mapDbToQRCodeScan(row));

    // Calculate scans by date
    const scansByDate = new Map<string, number>();
    scanList.forEach(scan => {
      const date = new Date(scan.scanned_at).toISOString().split('T')[0];
      scansByDate.set(date, (scansByDate.get(date) || 0) + 1);
    });

    // Calculate scans by device
    const scansByDevice = new Map<DeviceType, number>();
    scanList.forEach(scan => {
      const device = scan.device_type;
      scansByDevice.set(device, (scansByDevice.get(device) || 0) + 1);
    });

    // Calculate scans by location
    const scansByLocation = new Map<string, number>();
    scanList.forEach(scan => {
      const location = `${scan.country || 'Unknown'}, ${scan.city || 'Unknown'}`;
      scansByLocation.set(location, (scansByLocation.get(location) || 0) + 1);
    });

    return {
      total_scans: scanList.length,
      scans_by_date: Array.from(scansByDate.entries()).map(([date, count]) => ({ date, count })),
      scans_by_device: Array.from(scansByDevice.entries()).map(([device_type, count]) => ({ device_type, count })),
      scans_by_location: Array.from(scansByLocation.entries()).map(([location, count]) => {
        const [country, city] = location.split(', ');
        return { country: country !== 'Unknown' ? country : undefined, city: city !== 'Unknown' ? city : undefined, count };
      }),
      recent_scans: scanList.slice(0, 50), // Last 50 scans
    };
  }
}

export const qrCodeService = new QRCodeService();


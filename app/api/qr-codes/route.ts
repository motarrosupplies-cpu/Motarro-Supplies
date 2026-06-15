import { NextRequest, NextResponse } from 'next/server';
import { qrCodeService } from '@/lib/services/qrCodeService';
import { CreateQRCodeData, QRCodeListFilters } from '@/types/qr-code';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching for this route

// GET /api/qr-codes - List QR codes with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    
    const filters: QRCodeListFilters = {
      status: statusParam && statusParam !== 'all' ? (statusParam as any) : undefined,
      type: typeParam && typeParam !== 'all' ? (typeParam as any) : undefined, // Skip filter when 'all' is selected
      search: searchParams.get('search') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    };
    
    console.log('QR codes API filters:', { statusParam, typeParam, filters }); // Debug log

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof QRCodeListFilters] === undefined) {
        delete filters[key as keyof QRCodeListFilters];
      }
    });

    const qrCodes = await qrCodeService.getQRCodes(filters);
    return NextResponse.json(qrCodes);
  } catch (error: any) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR codes', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/qr-codes - Create new QR code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, content, design_config, expires_at } = body;

    // Validate required fields
    if (!title || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, content' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = [
      'url', 'text', 'email', 'call', 'sms', 'vcard', 'whatsapp', 
      'wifi', 'pdf', 'app', 'images', 'video', 'social', 'event', 
      'barcode', 'discount'
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate content based on type
    if (type === 'url') {
      try {
        new URL(content);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    } else if (type === 'email') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      try {
        const emailData = typeof content === 'string' ? JSON.parse(content) : content;
        if (emailData.email && !emailRegex.test(emailData.email)) {
          return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400 }
          );
        }
      } catch {
        // If not JSON, check if it's a plain email
        if (!emailRegex.test(content)) {
          return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400 }
          );
        }
      }
    }

    // Validate content is present and not empty
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Log the content being saved for debugging
    console.log('Creating QR code with content:', {
      title,
      type,
      content: content.substring(0, 100), // Log first 100 chars
      contentLength: content.length,
    });

    const createData: CreateQRCodeData = {
      title,
      type,
      content: content.trim(), // Ensure content is trimmed but preserved
      design_config: design_config || {},
      expires_at: expires_at || undefined,
    };

    // Get user ID from auth (if available)
    // For now, we'll pass undefined and let the service handle it
    const qrCode = await qrCodeService.createQRCode(createData);
    
    // Verify the saved QR code has the correct content
    console.log('QR code created, verifying content:', {
      savedContent: qrCode.content?.substring(0, 100),
      savedContentLength: qrCode.content?.length,
      matches: qrCode.content === content.trim(),
    });
    
    return NextResponse.json(qrCode, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Error creating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to create QR code', message: error.message },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { qrCodeService } from '@/lib/services/qrCodeService';
import { generateQRCodeImage, getQRCodeRedirectUrl } from '@/lib/utils/qrCodeGenerator';

export const dynamic = 'force-dynamic';

// GET /api/qr-codes/[id]/generate - Generate QR code image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const { searchParams } = new URL(request.url);
    
    const size = parseInt(searchParams.get('size') || '300', 10);
    const format = (searchParams.get('format') || 'png') as 'png' | 'svg';

    if (!id) {
      return NextResponse.json(
        { error: 'QR code ID is required' },
        { status: 400 }
      );
    }

    const qrCode = await qrCodeService.getQRCode(id);
    
    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Encode the actual data based on QR code type
    // For URL types, we use redirect for tracking. For others, encode directly.
    let qrData: string;
    if (qrCode.type === 'url' || qrCode.type === 'discount') {
      // Use redirect URL for tracking analytics
      qrData = getQRCodeRedirectUrl(qrCode.short_url);
    } else {
      // Encode the actual content directly for other types
      const { encodeQRCodeData } = await import('@/lib/utils/qrCodeEncoder');
      qrData = encodeQRCodeData(qrCode.type, qrCode.content);
    }

    // Generate QR code image
    try {
      console.log('Generating QR code image:', {
        id,
        qrData,
        type: qrCode.type,
        size,
        format,
        designConfig: qrCode.design_config,
      });

      const image = await generateQRCodeImage({
        data: qrData,
        design: qrCode.design_config || {},
        size,
        format,
      });

      console.log('QR code image generated successfully:', {
        type: typeof image,
        isBuffer: Buffer.isBuffer(image),
        length: Buffer.isBuffer(image) ? image.length : (typeof image === 'string' ? image.length : 'unknown'),
      });

      // Set appropriate content type
      const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
      
      // Ensure we return a Buffer for PNG or string for SVG
      const responseBody = format === 'svg' 
        ? (typeof image === 'string' ? image : String(image))
        : (Buffer.isBuffer(image) ? image : Buffer.from(image as any));

      return new NextResponse(responseBody, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (genError: any) {
      console.error('Error generating QR code image:', {
        error: genError.message,
        stack: genError.stack,
        id,
        qrData,
        type: qrCode.type,
        content: qrCode.content?.substring(0, 100),
      });
      return NextResponse.json(
        { 
          error: 'Failed to generate QR code image', 
          message: genError.message, 
          stack: process.env.NODE_ENV === 'development' ? genError.stack : undefined 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating QR code image:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code', message: error.message },
      { status: 500 }
    );
  }
}


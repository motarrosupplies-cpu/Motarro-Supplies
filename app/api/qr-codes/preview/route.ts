import { NextRequest, NextResponse } from 'next/server';
import { generateQRCodeImage, getQRCodeRedirectUrl } from '@/lib/utils/qrCodeGenerator';
import { encodeQRCodeData } from '@/lib/utils/qrCodeEncoder';
import { QRCodeDesign } from '@/types/qr-code';

export const dynamic = 'force-dynamic';

// POST /api/qr-codes/preview - Generate preview QR code image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shortUrl, design = {}, type = 'url', content = '' } = body;

    if (!shortUrl) {
      return NextResponse.json(
        { error: 'Short URL is required' },
        { status: 400 }
      );
    }

    // Encode data based on type
    // For preview, always use the actual content (not the redirect URL)
    // The redirect URL will be used when the QR code is saved and scanned (for analytics)
    let qrData: string;
    if (!content || content.trim() === '') {
      // If no content provided, fallback to redirect URL
      qrData = getQRCodeRedirectUrl(shortUrl);
    } else {
      // Encode the actual content - this is what the QR code should point to in preview
      qrData = encodeQRCodeData(type, content);
    }
    
    console.log('Preview QR code data:', { type, content, qrData, shortUrl });

    // Generate QR code image
    const image = await generateQRCodeImage({
      data: qrData,
      design: design as QRCodeDesign,
      size: 300,
      format: 'png',
    });

    return new NextResponse(image as Buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating QR code preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code preview', message: error.message },
      { status: 500 }
    );
  }
}


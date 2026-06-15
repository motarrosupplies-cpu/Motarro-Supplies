import { NextRequest, NextResponse } from 'next/server';
import { qrCodeService } from '@/lib/services/qrCodeService';

export const dynamic = 'force-dynamic';

// GET /api/qr-codes/redirect/[shortUrl] - Public redirect endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortUrl: string }> | { shortUrl: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { shortUrl } = resolvedParams;

    if (!shortUrl) {
      return NextResponse.json(
        { error: 'Short URL is required' },
        { status: 400 }
      );
    }

    // Get QR code by short URL
    const qrCode = await qrCodeService.getQRCodeByShortUrl(shortUrl);

    if (!qrCode) {
      // Return 404 page or redirect to home
      return NextResponse.redirect(new URL('/', request.url), 404);
    }

    // Track the scan
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Try to get location from headers (if using a service like Cloudflare)
    const country = request.headers.get('cf-ipcountry') || undefined;
    const city = request.headers.get('cf-ipcity') || undefined;

    await qrCodeService.trackScan(qrCode.id, {
      ip_address: ipAddress.split(',')[0].trim(), // Get first IP if multiple
      user_agent: userAgent,
      country,
      city,
    });

    // Determine redirect URL based on QR code type
    let redirectUrl: string;

    if (qrCode.type === 'url') {
      redirectUrl = qrCode.content;
    } else if (qrCode.type === 'discount') {
      // For discount codes, redirect to a page that shows the discount
      redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za'}/discount/${qrCode.short_url}`;
    } else {
      // For other types, encode the data and redirect to a handler page
      // Or for native actions (email, phone, SMS), we could redirect to the encoded data
      // For now, redirect to content (which should be the encoded data)
      redirectUrl = qrCode.content;
    }

    // Perform 301 permanent redirect
    return NextResponse.redirect(redirectUrl, 301);
  } catch (error: any) {
    console.error('Error processing QR code redirect:', error);
    // On error, redirect to home page
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
}


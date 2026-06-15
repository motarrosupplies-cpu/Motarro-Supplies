import { redirect } from 'next/navigation';
import { qrCodeService } from '@/lib/services/qrCodeService';

export const dynamic = 'force-dynamic';

export default async function QRRedirectPage({ params }: { params: Promise<{ shortUrl: string }> | { shortUrl: string } }) {
  // Handle both Promise and direct params (Next.js 15 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  const { shortUrl } = resolvedParams;

  try {
    // Get QR code by short URL
    const qrCode = await qrCodeService.getQRCodeByShortUrl(shortUrl);

    if (!qrCode) {
      // Redirect to home if QR code not found
      redirect('/');
    }

    // Track the scan (we'll do this in the API route instead)
    // For now, just redirect
    const redirectUrl = qrCode.type === 'url' 
      ? qrCode.content 
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za'}/discount/${shortUrl}`;

    redirect(redirectUrl);
  } catch (error) {
    console.error('Error processing QR code redirect:', error);
    redirect('/');
  }
}


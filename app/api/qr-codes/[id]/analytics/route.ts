import { NextRequest, NextResponse } from 'next/server';
import { qrCodeService } from '@/lib/services/qrCodeService';

export const dynamic = 'force-dynamic';

// GET /api/qr-codes/[id]/analytics - Get analytics for a QR code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'QR code ID is required' },
        { status: 400 }
      );
    }

    const analytics = await qrCodeService.getAnalytics(id);
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error fetching QR code analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', message: error.message },
      { status: 500 }
    );
  }
}


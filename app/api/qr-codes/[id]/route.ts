import { NextRequest, NextResponse } from 'next/server';
import { qrCodeService } from '@/lib/services/qrCodeService';
import { UpdateQRCodeData } from '@/types/qr-code';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching for this route

// GET /api/qr-codes/[id] - Get single QR code
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

    const qrCode = await qrCodeService.getQRCode(id);
    
    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(qrCode);
  } catch (error: any) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR code', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/qr-codes/[id] - Update QR code
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'QR code ID is required' },
        { status: 400 }
      );
    }

    // Validate content if provided
    if (body.content !== undefined) {
      if (!body.content || body.content.trim() === '') {
        return NextResponse.json(
          { error: 'Content cannot be empty' },
          { status: 400 }
        );
      }
    }

    const updateData: UpdateQRCodeData = {
      title: body.title,
      type: body.type,
      content: body.content !== undefined ? body.content.trim() : undefined, // Trim but preserve
      status: body.status,
      design_config: body.design_config,
      expires_at: body.expires_at,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateQRCodeData] === undefined) {
        delete updateData[key as keyof UpdateQRCodeData];
      }
    });

    // Validate URL if type is url
    if (updateData.type === 'url' && updateData.content) {
      try {
        new URL(updateData.content);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    // Log update for debugging
    console.log('Updating QR code:', {
      id,
      updateData: {
        ...updateData,
        content: updateData.content?.substring(0, 100), // Log first 100 chars
      },
    });

    const qrCode = await qrCodeService.updateQRCode(id, updateData);
    
    return NextResponse.json(qrCode, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Error updating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to update QR code', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/qr-codes/[id] - Delete/Archive QR code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 15 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    console.log('DELETE request received for QR code:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'QR code ID is required' },
        { status: 400 }
      );
    }

    // Verify QR code exists before deleting
    const existingQRCode = await qrCodeService.getQRCode(id);
    if (!existingQRCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    console.log('QR code found, proceeding with delete:', existingQRCode.title);

    await qrCodeService.deleteQRCode(id);
    
    console.log('QR code deleted successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'QR code deleted successfully' 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Error deleting QR code:', {
      error,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: 'Failed to delete QR code', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


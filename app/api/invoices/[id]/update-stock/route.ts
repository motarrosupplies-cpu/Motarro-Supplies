import { NextRequest, NextResponse } from 'next/server';
import { dashboardService } from '@/lib/services/dashboardService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    // Update stock from the paid invoice
    const stockUpdates = await dashboardService.updateStockFromPaidInvoice(invoiceId);
    
    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      stockUpdates,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update stock',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
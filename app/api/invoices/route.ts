import { NextRequest, NextResponse } from 'next/server';
import { invoiceService } from '@/lib/services/invoiceService';
import { CreateInvoiceData } from '@/types/invoice';

export async function GET() {
  try {
    const invoices = await invoiceService.getInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const invoiceData: CreateInvoiceData = {
      customerId: body.customerId,
      dueDate: new Date(body.dueDate),
      items: body.items.map((item: any) => ({
        description: item.description,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
      })),
      notes: body.notes,
      terms: body.terms,
    };

    const invoice = await invoiceService.createInvoice(invoiceData);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 
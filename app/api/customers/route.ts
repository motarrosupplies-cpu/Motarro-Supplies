import { NextRequest, NextResponse } from 'next/server';
import { invoiceService } from '@/lib/services/invoiceService';
import { CreateCustomerData } from '@/types/invoice';

export async function GET() {
  try {
    const customers = await invoiceService.getCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerData: CreateCustomerData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      company: body.company,
      address: body.address ? {
        street: body.address.street,
        city: body.address.city,
        state: body.address.state,
        zipCode: body.address.zipCode,
        country: body.address.country || 'South Africa',
      } : undefined,
    };

    const customer = await invoiceService.createCustomer(customerData);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 
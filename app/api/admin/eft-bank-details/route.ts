import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET: List all EFT bank details
export async function GET() {
  const { data, error } = await supabase
    .from('eft_bank_details')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: Create new EFT bank detail
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('eft_bank_details')
      .insert([
        {
          account_holder: body.account_holder,
          bank_name: body.bank_name,
          account_number: body.account_number,
          branch_code: body.branch_code,
          account_type: body.account_type,
          customer_id: body.customer_id ?? null,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT: Update EFT bank detail by id
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    updateFields.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('eft_bank_details')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE: Delete EFT bank detail by id
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const { error } = await supabase
      .from('eft_bank_details')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 
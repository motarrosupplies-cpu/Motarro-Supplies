import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Discount code is required' },
        { status: 400 }
      );
    }

    // Use service-role on the server to bypass RLS. Public clients cannot SELECT this table.
    if (!supabaseAdmin) {
      return NextResponse.json(
        { valid: false, error: "Server misconfigured" },
        { status: 503 }
      );
    }

    const normalizedCode = String(code).toUpperCase().trim();

    const { data: subscriber, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('discount_code', normalizedCode)
      .eq('is_active', true)
      .single();

    if (error || !subscriber) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid discount code' 
      });
    }

    // Check if code is expired
    if (subscriber.code_expires_at && new Date(subscriber.code_expires_at) < new Date()) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Discount code has expired' 
      });
    }

    // Check if code already used
    if (subscriber.code_used) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Discount code has already been used' 
      });
    }

    // Optional: Verify email matches (for security)
    if (email && subscriber.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Discount code is linked to a different email' 
      });
    }

    return NextResponse.json({
      valid: true,
      discountPercent: subscriber.discount_percent,
      code: subscriber.discount_code
    });
  } catch (error: any) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { valid: false, error: 'Error validating code' }, 
      { status: 500 }
    );
  }
}


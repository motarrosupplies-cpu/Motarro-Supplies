import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isMissingRelationError(message?: string): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  return (
    lower.includes('does not exist') ||
    lower.includes('could not find the table') ||
    lower.includes('schema cache')
  )
}

// GET active flash sale
export async function GET() {
  try {
    const client = supabaseAdmin || supabase;
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const now = new Date().toISOString();

    const { data, error } = await client
      .from('flash_sales')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error.message)) {
        return NextResponse.json(null);
      }
      console.error('Error fetching flash sale:', error);
      return NextResponse.json({ error: 'Failed to fetch flash sale' }, { status: 500 });
    }

    return NextResponse.json(data || null);
  } catch (error) {
    console.error('Error in flash sale API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


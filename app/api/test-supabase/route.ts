import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== SUPABASE CONNECTION TEST ===');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: testError,
        message: testError.message,
        hint: testError.hint,
        code: testError.code
      }, { status: 500 });
    }
    
    console.log('Supabase connection test passed');
    
    // Test admin connection
    let adminTest = null;
    if (supabaseAdmin) {
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('products')
        .select('id, name')
        .limit(1);
      
      adminTest = {
        success: !adminError,
        error: adminError
      };
    } else {
      adminTest = {
        success: false,
        error: 'supabaseAdmin is null - no service key configured'
      };
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection test passed',
      basicConnection: {
        success: true,
        data: testData
      },
      adminConnection: adminTest,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseAdminAvailable: !!supabaseAdmin
      }
    });
    
  } catch (error) {
    console.error('Supabase test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Supabase test failed',
      details: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

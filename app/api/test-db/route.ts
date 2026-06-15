import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== DATABASE CONNECTION TEST ===');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (testError) {
      console.error('Basic connection error:', testError);
      return NextResponse.json({
        success: false,
        error: 'Basic connection failed',
        details: testError
      }, { status: 500 });
    }
    
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
    
    // Test table structure
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'products' })
      .catch(() => {
        // Fallback if RPC doesn't exist
        return { data: null, error: 'RPC not available' };
      });
    
    return NextResponse.json({
      success: true,
      basicConnection: {
        success: true,
        data: testData
      },
      adminConnection: adminTest,
      tableStructure: {
        columns: columns,
        error: columnsError
      },
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseAdminAvailable: !!supabaseAdmin
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: String(error)
    }, { status: 500 });
  }
}

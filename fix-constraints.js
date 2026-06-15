const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon) in your environment');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixConstraints() {
  try {
    console.log('Dropping existing constraints...');
    
    // Drop the existing constraints
    const { error: dropStatusError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE school_event_orders DROP CONSTRAINT IF EXISTS school_event_orders_status_check;'
    });
    
    const { error: dropPaymentError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE school_event_orders DROP CONSTRAINT IF EXISTS school_event_orders_payment_status_check;'
    });
    
    console.log('Creating new constraints...');
    
    // Add the correct status constraint
    const { error: statusError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE school_event_orders ADD CONSTRAINT school_event_orders_status_check CHECK (status IN ('PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'));"
    });
    
    // Add the correct payment status constraint
    const { error: paymentError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE school_event_orders ADD CONSTRAINT school_event_orders_payment_status_check CHECK (paymentStatus IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'));"
    });
    
    if (statusError) console.error('Status constraint error:', statusError);
    if (paymentError) console.error('Payment constraint error:', paymentError);
    
    console.log('Constraints updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixConstraints();

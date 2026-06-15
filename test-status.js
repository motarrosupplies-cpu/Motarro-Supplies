const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment');
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStatusUpdate() {
  // Get the first order ID
  const { data: orders, error: fetchError } = await supabase
    .from('school_event_orders')
    .select('id')
    .limit(1);
  
  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }
  
  if (orders.length === 0) {
    console.log('No orders found');
    return;
  }
  
  const orderId = orders[0].id;
  console.log('Testing with order ID:', orderId);
  
  // Try different status values
  const statuses = ['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'];
  
  for (const status of statuses) {
    console.log(`Testing status: ${status}`);
    const { data, error } = await supabase
      .from('school_event_orders')
      .update({ status })
      .eq('id', orderId)
      .select();
    
    if (error) {
      console.log(`  ❌ ${status}: ${error.message}`);
    } else {
      console.log(`  ✅ ${status}: Success`);
    }
  }
}

testStatusUpdate();

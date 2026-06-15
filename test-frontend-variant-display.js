// Test script to verify frontend variant display
// This will help us see what data the frontend is actually receiving

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testFrontendVariantDisplay() {
  console.log('🧪 Testing Frontend Variant Display...\n');

  try {
    // Test the specific product from your console logs
    const productId = 'b2a91109-c4bf-4223-b059-dd35a7158bce';
    
    console.log('1. Testing API endpoint directly...');
    const apiResponse = await fetch(`http://localhost:3000/api/products/optimized/${productId}`);
    
    if (!apiResponse.ok) {
      console.error('❌ API request failed:', apiResponse.status);
      return;
    }
    
    const apiData = await apiResponse.json();
    console.log('✅ API Response received');
    console.log('Product name:', apiData.name);
    console.log('Has variants:', apiData.variants?.length || 0);
    
    if (apiData.variants && apiData.variants.length > 0) {
      console.log('\n📊 Variant Details:');
      apiData.variants.forEach((variant, index) => {
        console.log(`Variant ${index + 1}:`);
        console.log(`  - Color: ${variant.colorName} (${variant.colorValue})`);
        console.log(`  - Size: ${variant.size}`);
        console.log(`  - Stock Available: ${variant.stockAvailable}`);
        console.log(`  - Stock Incoming: ${variant.stockIncoming}`);
        console.log(`  - Stock Reserved: ${variant.stockReserved}`);
        console.log(`  - Price Override: ${variant.priceOverride}`);
        console.log(`  - Is Active: ${variant.isActive}`);
        console.log('');
      });
      
      // Calculate total stock
      const totalStock = apiData.variants.reduce((sum, v) => sum + (v.stockAvailable || 0), 0);
      console.log(`📈 Total Stock Available: ${totalStock}`);
      
      // Check for price overrides
      const variantsWithPriceOverride = apiData.variants.filter(v => v.priceOverride && v.priceOverride > 0);
      console.log(`💰 Variants with Price Override: ${variantsWithPriceOverride.length}`);
      
      if (variantsWithPriceOverride.length > 0) {
        console.log('Price Override Details:');
        variantsWithPriceOverride.forEach(v => {
          console.log(`  - ${v.colorName} ${v.size}: R${v.priceOverride}`);
        });
      }
    }
    
    console.log('\n2. Testing direct database query...');
    
    // Query database directly to compare
    const { data: dbProduct, error: dbError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (dbError) {
      console.error('❌ Database query failed:', dbError);
      return;
    }
    
    console.log('✅ Database Product:', dbProduct.name);
    console.log('Stock in products table:', dbProduct.stock);
    
    // Query variants directly
    const { data: dbVariants, error: variantError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true);
    
    if (variantError) {
      console.error('❌ Variants query failed:', variantError);
      return;
    }
    
    console.log(`✅ Database Variants: ${dbVariants.length} found`);
    
    if (dbVariants.length > 0) {
      console.log('\n📊 Database Variant Details:');
      dbVariants.forEach((variant, index) => {
        console.log(`DB Variant ${index + 1}:`);
        console.log(`  - Color: ${variant.color_name} (${variant.color_value})`);
        console.log(`  - Size: ${variant.size}`);
        console.log(`  - Stock Available: ${variant.stock_available}`);
        console.log(`  - Price Override: ${variant.price_override}`);
        console.log('');
      });
      
      // Calculate total stock from database
      const dbTotalStock = dbVariants.reduce((sum, v) => sum + (v.stock_available || 0), 0);
      console.log(`📈 Database Total Stock: ${dbTotalStock}`);
    }
    
    console.log('\n3. Comparison Results:');
    console.log('API vs Database match:', JSON.stringify(apiData.variants) === JSON.stringify(dbVariants.map(v => ({
      id: v.id,
      productId: v.product_id,
      colorName: v.color_name,
      colorValue: v.color_value,
      size: v.size,
      stockAvailable: v.stock_available,
      stockIncoming: v.stock_incoming,
      stockReserved: v.stock_reserved,
      priceOverride: v.price_override,
      isActive: v.is_active
    }))));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFrontendVariantDisplay();

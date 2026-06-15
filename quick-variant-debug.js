// QUICK VARIANT DEBUGGING SCRIPT
// Run this in your browser console when editing a product

console.log('🔍 QUICK VARIANT DEBUGGING');
console.log('==========================');

async function quickVariantDebug() {
  try {
    // Get the current product ID from the URL or admin panel
    const productId = prompt('Enter the product ID to debug (or leave empty to use first product):');
    
    let testProductId = productId;
    
    if (!testProductId) {
      // Get first product if no ID provided
      const response = await fetch('/api/products/optimized?limit=1');
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        testProductId = data.products[0].id;
        console.log('📦 Using first product:', data.products[0].name);
      } else {
        console.error('❌ No products found');
        return;
      }
    }
    
    console.log('🔍 Testing product ID:', testProductId);
    
    // Test 1: Check current product state
    console.log('\n📊 TEST 1: Current Product State');
    const getResponse = await fetch(`/api/products/optimized/${testProductId}`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ Product fetched successfully');
      console.log('📋 Product details:', {
        name: getData.name,
        hasColorOptions: getData.hasColorOptions,
        hasSizeOptions: getData.hasSizeOptions,
        colors: getData.colors,
        sizes: getData.sizes,
        variantsCount: getData.variants?.length || 0,
        variants: getData.variants
      });
    } else {
      console.error('❌ Failed to fetch product:', getData);
      return;
    }
    
    // Test 2: Update product with test variants
    console.log('\n🎯 TEST 2: Update with Test Variants');
    const testUpdateData = {
      ...getData,
      hasColorOptions: true,
      hasSizeOptions: true,
      colors: [
        { name: 'Black', value: '#000000' }
      ],
      sizes: ['LAR', 'XL'],
      variants: [
        {
          colorName: 'Black',
          colorValue: '#000000',
          size: 'LAR',
          stockAvailable: 15,
          stockIncoming: 5,
          stockReserved: 2,
          priceOverride: null,
          isActive: true
        },
        {
          colorName: 'Black',
          colorValue: '#000000',
          size: 'XL',
          stockAvailable: 20,
          stockIncoming: 3,
          stockReserved: 1,
          priceOverride: null,
          isActive: true
        }
      ]
    };
    
    console.log('🔄 Updating product with test variants...');
    const updateResponse = await fetch(`/api/products/optimized/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUpdateData),
    });
    
    const updateResult = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('✅ Product updated successfully!');
      console.log('📊 Update result:', updateResult);
      
      // Test 3: Verify the update
      console.log('\n🔍 TEST 3: Verify Update');
      const verifyResponse = await fetch(`/api/products/optimized/${testProductId}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok) {
        console.log('✅ Verification successful');
        console.log('📋 Updated product:', {
          hasColorOptions: verifyData.hasColorOptions,
          hasSizeOptions: verifyData.hasSizeOptions,
          colors: verifyData.colors,
          sizes: verifyData.sizes,
          variantsCount: verifyData.variants?.length || 0,
          variants: verifyData.variants
        });
        
        // Check if variants have stock
        const variantsWithStock = verifyData.variants?.filter(v => v.stockAvailable > 0) || [];
        console.log('📦 Variants with stock:', variantsWithStock.length);
        
        if (variantsWithStock.length > 0) {
          console.log('✅ Variants are properly saved!');
          console.log('🌐 Check the frontend product page:');
          console.log(`🔗 ${window.location.origin}/products/${testProductId}`);
        } else {
          console.log('❌ No variants with stock found - this is the problem!');
        }
        
      } else {
        console.error('❌ Verification failed:', verifyData);
      }
      
    } else {
      console.error('❌ Update failed:', updateResult);
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

// Run the debug test
quickVariantDebug();

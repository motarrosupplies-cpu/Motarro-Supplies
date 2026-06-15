// Quick test to verify imageAltTexts fix
console.log('🧪 Testing imageAltTexts fix...');

async function testImageAltTextsFix() {
  try {
    // Get a product to test with
    const response = await fetch('/api/products/optimized?limit=1');
    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      console.error('❌ No products found');
      return;
    }
    
    const product = data.products[0];
    console.log('📦 Testing with product:', product.name);
    
    // Test with null imageAltTexts
    const testData = {
      ...product,
      imageAltTexts: [null, null, null] // This should now work
    };
    
    console.log('🔄 Testing null imageAltTexts...');
    const updateResponse = await fetch(`/api/products/optimized/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const updateResult = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('✅ imageAltTexts fix successful!');
      console.log('📊 Result:', updateResult);
    } else {
      console.error('❌ imageAltTexts fix failed:', updateResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testImageAltTextsFix();

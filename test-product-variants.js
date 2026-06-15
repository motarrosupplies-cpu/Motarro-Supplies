// SIMPLE API TEST SCRIPT
// This tests the product update API with different scenarios

const testScenarios = [
  {
    name: 'SIMPLE_PRODUCT',
    description: 'Test simple product stock update',
    data: {
      name: 'Test Simple Product',
      description: 'A simple test product',
      price: 50,
      category: 'men',
      stock: 25,
      hasColorOptions: false,
      hasSizeOptions: false,
      images: ['https://via.placeholder.com/400x400'],
      variants: []
    }
  },
  {
    name: 'COLOR_ONLY_PRODUCT',
    description: 'Test color-only product stock update',
    data: {
      name: 'Test Color Only Product',
      description: 'A test product with color variants',
      price: 75,
      category: 'women',
      stock: 30,
      hasColorOptions: true,
      hasSizeOptions: false,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#FFFFFF' }
      ],
      sizes: null,
      images: ['https://via.placeholder.com/400x400'],
      variants: [
        { colorName: 'Black', colorValue: '#000000', size: null, stockAvailable: 15, stockIncoming: 0, stockReserved: 0, isActive: true },
        { colorName: 'White', colorValue: '#FFFFFF', size: null, stockAvailable: 15, stockIncoming: 0, stockReserved: 0, isActive: true }
      ]
    }
  },
  {
    name: 'SIZE_ONLY_PRODUCT',
    description: 'Test size-only product stock update',
    data: {
      name: 'Test Size Only Product',
      description: 'A test product with size variants',
      price: 60,
      category: 'accessories',
      stock: 20,
      hasColorOptions: false,
      hasSizeOptions: true,
      colors: null,
      sizes: ['SML', 'MED', 'LAR', 'XL'],
      images: ['https://via.placeholder.com/400x400'],
      variants: [
        { colorName: null, colorValue: null, size: 'SML', stockAvailable: 5, stockIncoming: 0, stockReserved: 0, isActive: true },
        { colorName: null, colorValue: null, size: 'MED', stockAvailable: 5, stockIncoming: 0, stockReserved: 0, isActive: true },
        { colorName: null, colorValue: null, size: 'LAR', stockAvailable: 5, stockIncoming: 0, stockReserved: 0, isActive: true },
        { colorName: null, colorValue: null, size: 'XL', stockAvailable: 5, stockIncoming: 0, stockReserved: 0, isActive: true }
      ]
    }
  },
  {
    name: 'FULL_VARIANT_PRODUCT',
    description: 'Test full variant product stock update',
    data: {
      name: 'Test Full Variant Product',
      description: 'A test product with both color and size variants',
      price: 100,
      category: 'men',
      stock: 24,
      hasColorOptions: true,
      hasSizeOptions: true,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'Blue', value: '#0000FF' }
      ],
      sizes: ['SML', 'MED', 'LAR'],
      images: ['https://via.placeholder.com/400x400'],
      variants: [
        { colorName: 'Black', colorValue: '#000000', size: 'SML', stockAvailable: 4, stockIncoming: 0, stockReserved: 0, isActive: true },
        { colorName: 'Black', colorValue: '#000000', size: 'MED', stockAvailable: 4, stockIncoming: 0, stockReserved: 0, isActive: true },
        { colorName: 'Black', colorValue: '#000000', size: 'LAR', stockAvailable: 4, stockIncoming: 0, stockReserved: 0, isActive: true },
        { colorName: 'Blue', colorValue: '#0000FF', size: 'SML', stockAvailable: 4, stockIncoming: 0, stockReserved: 0, isActive: true },
        { colorName: 'Blue', colorValue: '#0000FF', size: 'MED', stockAvailable: 4, stockIncoming: 0, stockReserved: 0, isActive: true },
        { colorName: 'Blue', colorValue: '#0000FF', size: 'LAR', stockAvailable: 4, stockIncoming: 0, stockReserved: 0, isActive: true }
      ]
    }
  }
];

async function testAPIEndpoint(productId, scenario) {
  console.log(`\n🧪 Testing ${scenario.name}: ${scenario.description}`);
  console.log('Request data:', JSON.stringify(scenario.data, null, 2));
  
  try {
    const response = await fetch(`/api/products/optimized/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenario.data),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error(`❌ FAILED: ${scenario.name}`);
      console.error('Status:', response.status);
      console.error('Response:', responseData);
      return { success: false, error: responseData };
    }

    console.log(`✅ SUCCESS: ${scenario.name}`);
    console.log('Response:', responseData);
    return { success: true, data: responseData };

  } catch (error) {
    console.error(`❌ ERROR: ${scenario.name}`);
    console.error('Error:', error);
    return { success: false, error };
  }
}

// Test function that can be called from browser console
window.testProductVariants = async function(productId) {
  console.log('🚀 Starting comprehensive product variant testing...');
  console.log(`Testing product ID: ${productId}`);
  
  const results = [];
  
  for (const scenario of testScenarios) {
    const result = await testAPIEndpoint(productId, scenario);
    results.push({
      scenario: scenario.name,
      success: result.success,
      error: result.error
    });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`- ${result.scenario}:`, result.error);
    });
  }
  
  return results;
};

console.log('🧪 Product variant testing script loaded!');
console.log('Usage: testProductVariants("your-product-id")');
console.log('Available test scenarios:', testScenarios.map(s => s.name));

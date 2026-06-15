// COMPREHENSIVE API TESTING SCRIPT
// This script tests all product variant scenarios through the API

import { supabaseAdmin } from '@/lib/supabaseClient';

// Test data for different scenarios
const testScenarios = [
  {
    name: 'SIMPLE_PRODUCT_TEST',
    description: 'Test simple product (no variants) stock update',
    productType: 'simple',
    hasColorOptions: false,
    hasSizeOptions: false,
    stock: 50,
    expectedBehavior: 'Should update stock directly in products table'
  },
  {
    name: 'COLOR_ONLY_PRODUCT_TEST', 
    description: 'Test color-only product stock update',
    productType: 'color_only',
    hasColorOptions: true,
    hasSizeOptions: false,
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' }
    ],
    stock: 40,
    expectedBehavior: 'Should update color variants and total stock'
  },
  {
    name: 'SIZE_ONLY_PRODUCT_TEST',
    description: 'Test size-only product stock update', 
    productType: 'size_only',
    hasColorOptions: false,
    hasSizeOptions: true,
    sizes: ['SML', 'MED', 'LAR', 'XL'],
    stock: 32,
    expectedBehavior: 'Should update size variants and total stock'
  },
  {
    name: 'FULL_VARIANT_PRODUCT_TEST',
    description: 'Test full variant product (color + size) stock update',
    productType: 'full_variant', 
    hasColorOptions: true,
    hasSizeOptions: true,
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Blue', value: '#0000FF' }
    ],
    sizes: ['SML', 'MED', 'LAR'],
    stock: 36,
    expectedBehavior: 'Should update full variants and total stock'
  }
];

async function testProductUpdate(productId: string, testData: any) {
  console.log(`\n=== TESTING ${testData.name} ===`);
  console.log(`Description: ${testData.description}`);
  console.log(`Expected: ${testData.expectedBehavior}`);
  
  try {
    // Test data for API request
    const requestData = {
      name: `Updated ${testData.name}`,
      description: `Updated description for ${testData.name}`,
      price: 99.99,
      originalPrice: 119.99,
      category: 'men',
      stock: testData.stock,
      isNew: true,
      onSale: true,
      status: 'active',
      hasColorOptions: testData.hasColorOptions,
      hasSizeOptions: testData.hasSizeOptions,
      images: ['https://via.placeholder.com/400x400'],
      imageAltTexts: ['Updated test product'],
      colors: testData.colors || null,
      sizes: testData.sizes || null,
      variants: testData.variants || [],
      seoTitle: `Updated ${testData.name}`,
      seoDescription: `Updated SEO description for ${testData.name}`,
      seoKeywords: 'test, updated, api',
      seoSlug: `updated-${testData.name.toLowerCase()}`
    };

    console.log('Request data:', JSON.stringify(requestData, null, 2));

    // Make API request
    const response = await fetch(`/api/products/optimized/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error(`❌ FAILED: ${testData.name}`);
      console.error('Response:', responseData);
      return { success: false, error: responseData };
    }

    console.log(`✅ SUCCESS: ${testData.name}`);
    console.log('Response:', responseData);
    return { success: true, data: responseData };

  } catch (error) {
    console.error(`❌ ERROR: ${testData.name}`);
    console.error('Error:', error);
    return { success: false, error };
  }
}

async function runComprehensiveTests() {
  console.log('🚀 STARTING COMPREHENSIVE PRODUCT VARIANT TESTING');
  
  // Get test products
  const { data: testProducts, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .like('name', 'TEST_%')
    .order('name');

  if (error) {
    console.error('Failed to fetch test products:', error);
    return;
  }

  console.log(`Found ${testProducts.length} test products`);

  const results = [];

  // Test each product type
  for (const product of testProducts) {
    let testScenario;
    
    if (product.name === 'TEST_SIMPLE_PRODUCT') {
      testScenario = testScenarios[0];
    } else if (product.name === 'TEST_COLOR_ONLY_PRODUCT') {
      testScenario = testScenarios[1];
    } else if (product.name === 'TEST_SIZE_ONLY_PRODUCT') {
      testScenario = testScenarios[2];
    } else if (product.name === 'TEST_FULL_VARIANT_PRODUCT') {
      testScenario = testScenarios[3];
    } else {
      continue;
    }

    const result = await testProductUpdate(product.id, testScenario);
    results.push({
      productName: product.name,
      testName: testScenario.name,
      success: result.success,
      error: result.error
    });
  }

  // Summary
  console.log('\n=== TEST RESULTS SUMMARY ===');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n=== FAILED TESTS ===');
    results.filter(r => !r.success).forEach(result => {
      console.log(`${result.productName}: ${result.testName}`);
      console.log('Error:', result.error);
    });
  }

  return results;
}

// Export for use in testing
export { runComprehensiveTests, testProductUpdate, testScenarios };

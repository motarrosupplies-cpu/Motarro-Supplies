// COMPREHENSIVE PRODUCT CRUD TESTING SCRIPT
// This script will test every single field in the product edit modal

console.log('🧪 STARTING COMPREHENSIVE PRODUCT CRUD TESTING');
console.log('================================================');

// Test configuration
const TEST_CONFIG = {
  baseUrl: window.location.origin,
  testProductId: null, // Will be set dynamically
  testResults: {
    passed: 0,
    failed: 0,
    errors: []
  }
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(endpoint, options);
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message
    };
  }
}

// Test result tracking
function recordTest(testName, success, error = null) {
  if (success) {
    TEST_CONFIG.testResults.passed++;
    console.log(`✅ ${testName}: PASSED`);
  } else {
    TEST_CONFIG.testResults.failed++;
    TEST_CONFIG.testResults.errors.push({ test: testName, error });
    console.log(`❌ ${testName}: FAILED - ${error}`);
  }
}

// Get a test product
async function getTestProduct() {
  console.log('📦 Getting test product...');
  const result = await apiCall('/api/products/optimized?limit=1');
  
  if (result.success && result.data.products && result.data.products.length > 0) {
    TEST_CONFIG.testProductId = result.data.products[0].id;
    console.log(`✅ Using test product: ${result.data.products[0].name} (ID: ${TEST_CONFIG.testProductId})`);
    return result.data.products[0];
  } else {
    throw new Error('No products found for testing');
  }
}

// Test 1: Basic Product Fields
async function testBasicFields(originalProduct) {
  console.log('\n🔍 TESTING BASIC PRODUCT FIELDS');
  console.log('================================');
  
  const testData = {
    ...originalProduct,
    name: 'TEST: Updated Product Name',
    price: 299.99,
    originalPrice: 399.99,
    category: 'men',
    description: 'TEST: Updated product description for testing purposes',
    stock: 50,
    isNew: true,
    onSale: true,
    status: 'active'
  };
  
  const result = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', testData);
  recordTest('Basic Fields Update', result.success, result.error || result.data.error);
  
  return result.success;
}

// Test 2: Image Alt Texts (the current failing field)
async function testImageAltTexts(originalProduct) {
  console.log('\n🖼️ TESTING IMAGE ALT TEXTS');
  console.log('===========================');
  
  const testCases = [
    { name: 'Empty Array', value: [] },
    { name: 'Null Array', value: null },
    { name: 'Array with Nulls', value: [null, null] },
    { name: 'Mixed Array', value: ['Alt text 1', null, 'Alt text 3'] },
    { name: 'Valid Array', value: ['Valid alt text 1', 'Valid alt text 2'] }
  ];
  
  for (const testCase of testCases) {
    const testData = {
      ...originalProduct,
      imageAltTexts: testCase.value
    };
    
    const result = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', testData);
    recordTest(`Image Alt Texts - ${testCase.name}`, result.success, result.error || result.data.error);
  }
}

// Test 3: Product Details (Material, Fit, Care, Origin)
async function testProductDetails(originalProduct) {
  console.log('\n📋 TESTING PRODUCT DETAILS');
  console.log('==========================');
  
  const testData = {
    ...originalProduct,
    details: {
      material: '100% Cotton',
      fit: 'Regular Fit',
      care: 'Machine Cold Wash, Low Tumble Dry',
      origin: 'Made In South Africa'
    }
  };
  
  const result = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', testData);
  recordTest('Product Details Update', result.success, result.error || result.data.error);
  
  // Test individual detail fields
  const individualTests = [
    { field: 'material', value: 'Premium Cotton Blend' },
    { field: 'fit', value: 'Slim Fit' },
    { field: 'care', value: 'Hand Wash Only' },
    { field: 'origin', value: 'Made In China' }
  ];
  
  for (const test of individualTests) {
    const testData = {
      ...originalProduct,
      details: {
        ...originalProduct.details,
        [test.field]: test.value
      }
    };
    
    const result = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', testData);
    recordTest(`Product Detail - ${test.field}`, result.success, result.error || result.data.error);
  }
}

// Test 4: SEO Fields
async function testSEOFields(originalProduct) {
  console.log('\n🔍 TESTING SEO FIELDS');
  console.log('====================');
  
  const testData = {
    ...originalProduct,
    seoTitle: 'TEST: SEO Title for Product',
    seoDescription: 'TEST: SEO Description for product testing',
    seoKeywords: 'test, product, seo, keywords',
    seoSlug: 'test-product-seo-slug'
  };
  
  const result = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', testData);
  recordTest('SEO Fields Update', result.success, result.error || result.data.error);
  
  // Test null SEO fields
  const nullTestData = {
    ...originalProduct,
    seoTitle: null,
    seoDescription: null,
    seoKeywords: null,
    seoSlug: null
  };
  
  const nullResult = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', nullTestData);
  recordTest('SEO Fields - Null Values', nullResult.success, nullResult.error || nullResult.data.error);
}

// Test 5: Color Options Toggle
async function testColorOptions(originalProduct) {
  console.log('\n🎨 TESTING COLOR OPTIONS');
  console.log('========================');
  
  // Test enabling color options
  const enableColorData = {
    ...originalProduct,
    hasColorOptions: true,
    colors: [
      { name: 'Red', value: '#ff0000' },
      { name: 'Blue', value: '#0000ff' },
      { name: 'Green', value: '#00ff00' }
    ]
  };
  
  const enableResult = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', enableColorData);
  recordTest('Enable Color Options', enableResult.success, enableResult.error || enableResult.data.error);
  
  // Test disabling color options
  const disableColorData = {
    ...originalProduct,
    hasColorOptions: false,
    colors: null
  };
  
  const disableResult = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', disableColorData);
  recordTest('Disable Color Options', disableResult.success, disableResult.error || disableResult.data.error);
}

// Test 6: Size Options Toggle
async function testSizeOptions(originalProduct) {
  console.log('\n📏 TESTING SIZE OPTIONS');
  console.log('=======================');
  
  // Test enabling size options
  const enableSizeData = {
    ...originalProduct,
    hasSizeOptions: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  };
  
  const enableResult = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', enableSizeData);
  recordTest('Enable Size Options', enableResult.success, enableResult.error || enableResult.data.error);
  
  // Test disabling size options
  const disableSizeData = {
    ...originalProduct,
    hasSizeOptions: false,
    sizes: null
  };
  
  const disableResult = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', disableSizeData);
  recordTest('Disable Size Options', disableResult.success, disableResult.error || disableResult.data.error);
}

// Test 7: Full Variant (Both Color and Size)
async function testFullVariants(originalProduct) {
  console.log('\n🎯 TESTING FULL VARIANTS');
  console.log('========================');
  
  const fullVariantData = {
    ...originalProduct,
    hasColorOptions: true,
    hasSizeOptions: true,
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#ffffff' }
    ],
    sizes: ['S', 'M', 'L'],
    variants: [
      { colorName: 'Black', colorValue: '#000000', size: 'S', stockAvailable: 10, stockIncoming: 5, stockReserved: 2, priceOverride: null, isActive: true },
      { colorName: 'Black', colorValue: '#000000', size: 'M', stockAvailable: 15, stockIncoming: 3, stockReserved: 1, priceOverride: null, isActive: true },
      { colorName: 'White', colorValue: '#ffffff', size: 'S', stockAvailable: 8, stockIncoming: 4, stockReserved: 0, priceOverride: null, isActive: true },
      { colorName: 'White', colorValue: '#ffffff', size: 'M', stockAvailable: 12, stockIncoming: 2, stockReserved: 1, priceOverride: null, isActive: true }
    ]
  };
  
  const result = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', fullVariantData);
  recordTest('Full Variants Update', result.success, result.error || result.data.error);
}

// Test 8: Edge Cases and Boundary Values
async function testEdgeCases(originalProduct) {
  console.log('\n⚠️ TESTING EDGE CASES');
  console.log('=====================');
  
  const edgeCases = [
    { name: 'Zero Price', data: { ...originalProduct, price: 0 } },
    { name: 'Zero Stock', data: { ...originalProduct, stock: 0 } },
    { name: 'Empty Name', data: { ...originalProduct, name: '' } },
    { name: 'Empty Description', data: { ...originalProduct, description: '' } },
    { name: 'Empty Category', data: { ...originalProduct, category: '' } },
    { name: 'Negative Price', data: { ...originalProduct, price: -10 } },
    { name: 'Negative Stock', data: { ...originalProduct, stock: -5 } }
  ];
  
  for (const testCase of edgeCases) {
    const result = await apiCall(`/api/products/optimized/${TEST_CONFIG.testProductId}`, 'PUT', testCase.data);
    
    // Some edge cases should fail (negative values, empty required fields)
    const shouldPass = !['Empty Name', 'Empty Description', 'Empty Category', 'Negative Price', 'Negative Stock'].includes(testCase.name);
    
    if (shouldPass) {
      recordTest(`Edge Case - ${testCase.name}`, result.success, result.error || result.data.error);
    } else {
      recordTest(`Edge Case - ${testCase.name} (Should Fail)`, !result.success, result.success ? 'Should have failed but passed' : null);
    }
  }
}

// Main test runner
async function runComprehensiveTests() {
  try {
    console.log('🚀 Starting comprehensive product CRUD testing...');
    
    // Get test product
    const originalProduct = await getTestProduct();
    
    // Run all tests
    await testBasicFields(originalProduct);
    await testImageAltTexts(originalProduct);
    await testProductDetails(originalProduct);
    await testSEOFields(originalProduct);
    await testColorOptions(originalProduct);
    await testSizeOptions(originalProduct);
    await testFullVariants(originalProduct);
    await testEdgeCases(originalProduct);
    
    // Print final results
    console.log('\n📊 FINAL TEST RESULTS');
    console.log('=====================');
    console.log(`✅ Passed: ${TEST_CONFIG.testResults.passed}`);
    console.log(`❌ Failed: ${TEST_CONFIG.testResults.failed}`);
    console.log(`📈 Success Rate: ${((TEST_CONFIG.testResults.passed / (TEST_CONFIG.testResults.passed + TEST_CONFIG.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (TEST_CONFIG.testResults.errors.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      TEST_CONFIG.testResults.errors.forEach(error => {
        console.log(`  - ${error.test}: ${error.error}`);
      });
    }
    
    console.log('\n🎉 Comprehensive testing completed!');
    
  } catch (error) {
    console.error('💥 Test runner failed:', error);
  }
}

// Start the tests
runComprehensiveTests();

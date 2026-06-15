// Test script to verify product update fixes
// Run this in your browser console to test the API

async function testProductUpdate() {
  console.log('🧪 Testing Product Update API...');
  
  // Test data that should work
  const testData = {
    name: "Test Product Update",
    price: 99.99,
    originalPrice: null,
    category: "men",
    images: ["https://via.placeholder.com/400x400"],
    imageAltTexts: null,
    description: "Test product for validation",
    stock: 10,
    isNew: true,
    onSale: false,
    status: "active",
    hasColorOptions: false,
    hasSizeOptions: false,
    colors: null,
    sizes: null,
    variants: null,
    details: null,
    seoTitle: null,
    seoDescription: null,
    seoKeywords: null,
    seoSlug: null,
  };
  
  try {
    // Replace with an actual product ID from your database
    const productId = "YOUR_PRODUCT_ID_HERE";
    
    const response = await fetch(`/api/products/optimized/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Product update successful:', result);
    } else {
      console.error('❌ Product update failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test validation with invalid data
async function testValidationError() {
  console.log('🧪 Testing Validation Error Handling...');
  
  const invalidData = {
    name: "", // Invalid: empty name
    price: -10, // Invalid: negative price
    sizes: null, // This should now be accepted
    // Missing required fields
  };
  
  try {
    const productId = "YOUR_PRODUCT_ID_HERE";
    
    const response = await fetch(`/api/products/optimized/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log('✅ Validation error properly caught:', result);
    } else {
      console.error('❌ Validation should have failed but didn\'t');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
console.log('🚀 Starting Product Update Tests...');
console.log('1. Replace "YOUR_PRODUCT_ID_HERE" with an actual product ID');
console.log('2. Run: testProductUpdate()');
console.log('3. Run: testValidationError()');

// Test script to verify product update functionality
const testProductUpdate = async () => {
  console.log('🧪 Testing Product Update API...');
  
  try {
    // First, get a product to test with
    const getResponse = await fetch('/api/products/optimized');
    const getData = await getResponse.json();
    
    if (!getData.products || getData.products.length === 0) {
      console.error('❌ No products found to test with');
      return;
    }
    
    const testProduct = getData.products[0];
    console.log('📦 Testing with product:', testProduct.name);
    console.log('📦 Current stock:', testProduct.stock);
    
    // Test updating the product
    const updateData = {
      name: testProduct.name,
      price: testProduct.price,
      originalPrice: testProduct.originalPrice,
      category: testProduct.category,
      images: testProduct.images,
      imageAltTexts: testProduct.imageAltTexts,
      description: testProduct.description,
      stock: testProduct.stock, // Keep same stock
      isNew: testProduct.isNew,
      onSale: testProduct.onSale,
      status: testProduct.status,
      hasColorOptions: testProduct.hasColorOptions,
      hasSizeOptions: testProduct.hasSizeOptions,
      colors: testProduct.colors,
      sizes: testProduct.sizes,
      variants: testProduct.variants || [],
      details: testProduct.details,
      seoTitle: testProduct.seoTitle,
      seoDescription: testProduct.seoDescription,
      seoKeywords: testProduct.seoKeywords,
      seoSlug: testProduct.seoSlug,
    };
    
    console.log('🔄 Sending update request...');
    const updateResponse = await fetch(`/api/products/optimized/${testProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    const updateResult = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('✅ Product update successful!');
      console.log('📊 Update result:', updateResult);
    } else {
      console.error('❌ Product update failed:', updateResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testProductUpdate();

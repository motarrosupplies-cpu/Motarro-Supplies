// VARIANT DIAGNOSTIC TEST SCRIPT
// This script will help diagnose why variants aren't showing on the frontend

console.log('🔍 VARIANT DIAGNOSTIC TEST');
console.log('==========================');

async function diagnoseVariantIssue() {
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
    console.log('📊 Current product state:', {
      hasColorOptions: product.hasColorOptions,
      hasSizeOptions: product.hasSizeOptions,
      colors: product.colors,
      sizes: product.sizes,
      variants: product.variants
    });
    
    // Test 1: Enable color and size options
    console.log('\n🎨 TEST 1: Enabling Color and Size Options');
    const enableVariantsData = {
      ...product,
      hasColorOptions: true,
      hasSizeOptions: true,
      colors: [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#ffffff' }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      variants: [
        // Black variants
        { colorName: 'Black', colorValue: '#000000', size: 'XS', stockAvailable: 10, stockIncoming: 5, stockReserved: 2, priceOverride: null, isActive: true },
        { colorName: 'Black', colorValue: '#000000', size: 'S', stockAvailable: 15, stockIncoming: 3, stockReserved: 1, priceOverride: null, isActive: true },
        { colorName: 'Black', colorValue: '#000000', size: 'M', stockAvailable: 20, stockIncoming: 2, stockReserved: 0, priceOverride: null, isActive: true },
        { colorName: 'Black', colorValue: '#000000', size: 'L', stockAvailable: 12, stockIncoming: 4, stockReserved: 1, priceOverride: null, isActive: true },
        { colorName: 'Black', colorValue: '#000000', size: 'XL', stockAvailable: 8, stockIncoming: 3, stockReserved: 0, priceOverride: null, isActive: true },
        // White variants
        { colorName: 'White', colorValue: '#ffffff', size: 'XS', stockAvailable: 5, stockIncoming: 2, stockReserved: 1, priceOverride: null, isActive: true },
        { colorName: 'White', colorValue: '#ffffff', size: 'S', stockAvailable: 18, stockIncoming: 1, stockReserved: 0, priceOverride: null, isActive: true },
        { colorName: 'White', colorValue: '#ffffff', size: 'M', stockAvailable: 25, stockIncoming: 3, stockReserved: 2, priceOverride: null, isActive: true },
        { colorName: 'White', colorValue: '#ffffff', size: 'L', stockAvailable: 14, stockIncoming: 2, stockReserved: 1, priceOverride: null, isActive: true },
        { colorName: 'White', colorValue: '#ffffff', size: 'XL', stockAvailable: 6, stockIncoming: 4, stockReserved: 0, priceOverride: null, isActive: true }
      ]
    };
    
    console.log('🔄 Updating product with variants...');
    const updateResponse = await fetch(`/api/products/optimized/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enableVariantsData),
    });
    
    const updateResult = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('✅ Product updated successfully!');
      console.log('📊 Update result:', updateResult);
      
      // Test 2: Fetch the updated product to verify variants were saved
      console.log('\n🔍 TEST 2: Fetching Updated Product');
      const fetchResponse = await fetch(`/api/products/optimized/${product.id}`);
      const fetchResult = await fetchResponse.json();
      
      if (fetchResponse.ok) {
        console.log('✅ Product fetched successfully!');
        console.log('📊 Fetched product data:', {
          hasColorOptions: fetchResult.hasColorOptions,
          hasSizeOptions: fetchResult.hasSizeOptions,
          colorsCount: fetchResult.colors?.length || 0,
          sizesCount: fetchResult.sizes?.length || 0,
          variantsCount: fetchResult.variants?.length || 0,
          variants: fetchResult.variants
        });
        
        // Test 3: Check if frontend would display variants
        console.log('\n🎯 TEST 3: Frontend Display Check');
        const hasVariants = fetchResult.variants && fetchResult.variants.length > 0;
        const hasColors = fetchResult.hasColorOptions && fetchResult.colors && fetchResult.colors.length > 0;
        const hasSizes = fetchResult.hasSizeOptions && fetchResult.sizes && fetchResult.sizes.length > 0;
        
        console.log('Frontend should display:', {
          colorSwatches: hasColors,
          sizeDropdown: hasSizes,
          variantMatrix: hasVariants,
          totalStock: fetchResult.variants?.reduce((sum, v) => sum + (v.stockAvailable || 0), 0) || 0
        });
        
        if (hasVariants) {
          console.log('✅ Variants are properly configured!');
          console.log('🌐 Check the frontend product page to see if variants display correctly');
          console.log(`🔗 Product URL: ${window.location.origin}/products/${product.id}`);
        } else {
          console.log('❌ No variants found - this is the problem!');
        }
        
      } else {
        console.error('❌ Failed to fetch updated product:', fetchResult);
      }
      
    } else {
      console.error('❌ Product update failed:', updateResult);
    }
    
  } catch (error) {
    console.error('❌ Diagnostic test failed:', error);
  }
}

// Run the diagnostic
diagnoseVariantIssue();

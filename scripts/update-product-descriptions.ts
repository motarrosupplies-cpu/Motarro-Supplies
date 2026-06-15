/**
 * Update Product Descriptions Script
 * Reads product descriptions from JSON and updates via API (no env vars needed)
 */

import * as fs from 'fs';
import * as path from 'path';

// Use the live API endpoint - no environment variables needed!
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za';

interface FAQ {
  question: string;
  answer: string;
}

interface ProductDescription {
  slug: string;
  title: string;
  description: string;
  faqs: FAQ[];
}

async function updateProductDescriptions() {
  console.log('Loading product descriptions from JSON...');
  
  // Read the JSON file
  const jsonPath = path.join(process.cwd(), 'product-descriptions-seo-complete.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File not found: ${jsonPath}`);
    console.error('Please run the generator script first to create the JSON file.');
    process.exit(1);
  }
  
  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  
  // Try to extract JSON from the file (in case there are console logs)
  let jsonContent = fileContent;
  const jsonMatch = fileContent.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonContent = jsonMatch[0];
  }
  
  let descriptions: ProductDescription[];
  try {
    descriptions = JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    console.error('File content preview:', fileContent.substring(0, 500));
    process.exit(1);
  }
  
  console.log(`Found ${descriptions.length} product descriptions to update\n`);
  console.log(`Using API: ${API_BASE_URL}\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ slug: string; error: string }> = [];
  
  // First, fetch all products to get their IDs
  console.log('Fetching all products from API...');
  const productsResponse = await fetch(`${API_BASE_URL}/api/products`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  
  if (!productsResponse.ok) {
    throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
  }
  
  const productsData = await productsResponse.json();
  const allProducts = productsData.products || productsData;
  
  console.log(`Found ${allProducts.length} products in database\n`);
  
  // Create a map of slug -> product for quick lookup
  const productMap = new Map<string, any>();
  allProducts.forEach((p: any) => {
    const slug = p.slug || p.seoSlug || p.id;
    productMap.set(slug, p);
  });
  
  // Update each product
  for (const desc of descriptions) {
    try {
      console.log(`Updating: ${desc.title} (${desc.slug})...`);
      
      // Find the product by slug
      const product = productMap.get(desc.slug);
      
      if (!product) {
        throw new Error(`Product not found with slug: ${desc.slug}`);
      }
      
      // Fetch full product data to preserve all fields
      const productResponse = await fetch(`${API_BASE_URL}/api/products/optimized/${product.id}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      if (!productResponse.ok) {
        throw new Error(`Failed to fetch product details: ${productResponse.statusText}`);
      }
      
      const fullProduct = await productResponse.json();
      
      // Update only the description, preserving all other fields
      const updateData = {
        ...fullProduct,
        description: desc.description,
      };
      
      // Send update via API
      const updateResponse = await fetch(`${API_BASE_URL}/api/products/optimized/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({ error: updateResponse.statusText }));
        throw new Error(`Update failed: ${errorData.error || updateResponse.statusText}`);
      }
      
      console.log(`✓ Successfully updated: ${desc.title}`);
      successCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to update ${desc.title}: ${errorMessage}`);
      errors.push({ slug: desc.slug, error: errorMessage });
      errorCount++;
    }
  }
  
  console.log('\n=== UPDATE SUMMARY ===');
  console.log(`Total products: ${descriptions.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n=== ERRORS ===');
    errors.forEach(({ slug, error }) => {
      console.log(`${slug}: ${error}`);
    });
  }
  
  // Also save FAQs to a separate file for later implementation
  const faqsPath = path.join(process.cwd(), 'product-faqs.json');
  const faqsData = descriptions.map(desc => ({
    slug: desc.slug,
    title: desc.title,
    faqs: desc.faqs,
  }));
  
  fs.writeFileSync(faqsPath, JSON.stringify(faqsData, null, 2), 'utf-8');
  console.log(`\n✓ FAQs saved to: ${faqsPath}`);
  console.log('You can use this file later to implement FAQPage schema markup.');
}

// Run the script
if (require.main === module) {
  updateProductDescriptions()
    .then(() => {
      console.log('\n✓ Update process completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { updateProductDescriptions };


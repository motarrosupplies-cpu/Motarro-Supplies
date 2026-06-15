/**
 * Product Description Generator Script
 * Generates SEO-optimized descriptions for products using templates
 * 
 * Usage: Run this script to generate descriptions, then update products via admin panel
 */

import { generateProductDescription } from '@/lib/product-description-templates';

interface ProductData {
  id: string;
  name: string;
  category: string;
  price: number;
  colors?: string[];
  sizes?: string[];
  material?: string;
  hasColorOptions?: boolean;
  hasSizeOptions?: boolean;
}

/**
 * Generate description for a single product
 */
export function generateDescriptionForProduct(product: ProductData): string {
  // Parse colors if they're in JSON format
  let colors: string[] = [];
  if (product.colors) {
    if (Array.isArray(product.colors)) {
      colors = product.colors.map((c: any) => 
        typeof c === 'string' ? c : c.name || c.colorName || ''
      ).filter(Boolean);
    }
  }

  // Parse sizes if they're in JSON format
  let sizes: string[] = [];
  if (product.sizes) {
    if (Array.isArray(product.sizes)) {
      sizes = product.sizes.filter(Boolean);
    }
  }

  return generateProductDescription({
    productName: product.name,
    category: product.category,
    price: product.price,
    colors: colors.length > 0 ? colors : undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
    material: product.material,
    location: 'Johannesburg',
  });
}

/**
 * Example: Generate descriptions for multiple products
 * This would typically be called with product data from your database
 */
export function generateDescriptionsForProducts(products: ProductData[]): Array<{ id: string; description: string }> {
  return products.map(product => ({
    id: product.id,
    description: generateDescriptionForProduct(product),
  }));
}

// Example usage (uncomment to use):
/*
const exampleProducts: ProductData[] = [
  {
    id: 'product-1',
    name: 'Premium Cotton T-Shirt',
    category: 'men',
    price: 299.99,
    colors: ['White', 'Black', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL'],
    material: '100% premium cotton',
    hasColorOptions: true,
    hasSizeOptions: true,
  },
];

const descriptions = generateDescriptionsForProducts(exampleProducts);
console.log(descriptions);
*/


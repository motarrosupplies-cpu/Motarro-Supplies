/**
 * SQL Generator for Product Descriptions
 * This script helps generate SQL UPDATE statements for product descriptions
 * 
 * Run this in Node.js or copy the output SQL to Supabase
 */

import { generateProductDescription } from '@/lib/product-description-templates';

interface ProductForSQL {
  id: string;
  name: string;
  category: string;
  price: number;
  colors?: any; // JSONB or array
  sizes?: any; // JSONB or array
  material?: string;
  table_name: 'simple_products' | 'color_only_products' | 'size_only_products' | 'full_variant_products';
}

/**
 * Generate SQL UPDATE statement for a product description
 */
export function generateDescriptionUpdateSQL(product: ProductForSQL): string {
  // Parse colors
  let colors: string[] = [];
  if (product.colors) {
    try {
      const parsed = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
      if (Array.isArray(parsed)) {
        colors = parsed.map((c: any) => typeof c === 'string' ? c : c.name || c.colorName || '').filter(Boolean);
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Parse sizes
  let sizes: string[] = [];
  if (product.sizes) {
    try {
      const parsed = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
      if (Array.isArray(parsed)) {
        sizes = parsed.filter(Boolean);
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Generate description
  const description = generateProductDescription({
    productName: product.name,
    category: product.category,
    price: product.price,
    colors: colors.length > 0 ? colors : undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
    material: product.material,
    location: 'Johannesburg',
  });

  // Escape single quotes for SQL
  const escapedDescription = description.replace(/'/g, "''");

  // Generate SQL
  return `UPDATE public.${product.table_name}
SET description = '${escapedDescription}',
    updated_at = NOW()
WHERE id = '${product.id}';`;
}

/**
 * Generate SQL for multiple products
 */
export function generateBulkDescriptionUpdateSQL(products: ProductForSQL[]): string {
  const updates = products.map(product => generateDescriptionUpdateSQL(product));
  return updates.join('\n\n');
}


/**
 * Product Slug Generation Utilities
 * Generates SEO-friendly, keyword-rich slugs for products
 */

/**
 * Checks if a string is a UUID
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Generates a base slug from product name
 */
export function generateBaseSlug(name: string): string {
  if (!name) return '';

  let slug = name
    .toLowerCase()
    // Handle common Afrikaans/English characters
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    // Remove special characters, keep alphanumeric, spaces, and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Gets category keyword for slug enhancement
 */
export function getCategoryKeyword(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('men')) return 'mens';
  if (cat.includes('women') || cat.includes('ladies')) return 'ladies';
  if (cat.includes('accessor')) return 'accessories';
  if (cat.includes('custom') && cat.includes('print')) return 'custom-printing';
  return '';
}

/**
 * Generates a keyword-rich product slug
 * 
 * @param name - Product name
 * @param category - Product category
 * @param productId - Product UUID (for uniqueness fallback)
 * @param includeLocation - Whether to include location keyword
 * @returns SEO-friendly slug
 */
export function generateProductSlug(
  name: string,
  category: string = '',
  productId?: string,
  includeLocation: boolean = true
): string {
  if (!name) return '';

  // Generate base slug
  let slug = generateBaseSlug(name);

  // Count words (approximate)
  const words = slug.split('-').filter(w => w.length > 0);
  const wordCount = words.length;

  // Add category keyword if name is short (< 5 words)
  if (wordCount < 5) {
    const categoryKeyword = getCategoryKeyword(category);
    if (categoryKeyword && !slug.includes(categoryKeyword)) {
      slug = `${categoryKeyword}-${slug}`;
    }
  }

  // Add location keyword if name is short and location enabled
  if (includeLocation && wordCount < 6 && !slug.includes('johannesburg') && !slug.includes('south-africa')) {
    slug = `${slug}-johannesburg`;
  }

  // Limit to 200 characters (leaving room for uniqueness suffix)
  if (slug.length > 200) {
    slug = slug.substring(0, 200);
    slug = slug.replace(/-+$/, '');
  }

  // If productId provided and slug is still too generic, add first 8 chars of UUID
  if (productId && isUUID(productId) && wordCount < 3) {
    const uuidShort = productId.substring(0, 8);
    slug = `${slug}-${uuidShort}`;
  }

  return slug;
}

/**
 * Ensures slug uniqueness by appending a number if needed
 * Note: This is a client-side check. Server-side uniqueness is handled by database constraints.
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
    
    if (counter > 1000) {
      uniqueSlug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return uniqueSlug;
}

/**
 * Validates a slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0) return false;
  if (slug.length > 255) return false;
  
  // Must contain only lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Sanitizes user input to create a valid slug
 */
export function sanitizeSlug(input: string): string {
  return generateBaseSlug(input);
}


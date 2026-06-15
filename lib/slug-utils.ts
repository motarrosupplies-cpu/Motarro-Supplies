/**
 * SEO-Friendly Slug Generation Utilities
 * Generates URL-friendly slugs from product names and ensures uniqueness
 */

/**
 * Generates an SEO-friendly slug from a product name
 * @param name - Product name
 * @param includeLocation - Whether to include location keywords (e.g., "johannesburg")
 * @returns SEO-friendly slug
 */
export function generateSlug(name: string, includeLocation: boolean = false): string {
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

  // Add location if requested and not already present
  if (includeLocation && !slug.includes('johannesburg') && !slug.includes('south-africa')) {
    slug = slug + '-johannesburg';
  }

  // Limit to 200 characters (leaving room for uniqueness suffix)
  if (slug.length > 200) {
    slug = slug.substring(0, 200);
    slug = slug.replace(/-+$/, ''); // Remove trailing hyphens
  }

  return slug;
}

/**
 * Generates a keyword-rich slug for products
 * Includes category, product type, and location when relevant
 * @param name - Product name
 * @param category - Product category
 * @param hasColors - Whether product has color options
 * @param hasSizes - Whether product has size options
 * @param location - Location keyword (e.g., "johannesburg")
 * @returns Enhanced SEO slug
 */
export function generateProductSlug(
  name: string,
  category?: string,
  hasColors?: boolean,
  hasSizes?: boolean,
  location?: string
): string {
  let slug = generateSlug(name);

  // Add category prefix if it adds value
  if (category && category !== 'accessories') {
    const categoryMap: Record<string, string> = {
      'men': 'mens',
      'women': 'ladies',
      'custom printing': 'custom-printing'
    };
    const categorySlug = categoryMap[category] || category;
    if (!slug.startsWith(categorySlug)) {
      slug = `${categorySlug}-${slug}`;
    }
  }

  // Add product type indicators
  if (hasColors && hasSizes) {
    // Full variant - no need to add anything, slug is already descriptive
  } else if (hasColors) {
    if (!slug.includes('color') && !slug.includes('coloured')) {
      slug = `${slug}-colours`;
    }
  } else if (hasSizes) {
    if (!slug.includes('size') && !slug.includes('sizes')) {
      slug = `${slug}-sizes`;
    }
  }

  // Add location if provided and not already present
  if (location) {
    const locationSlug = generateSlug(location);
    if (!slug.includes(locationSlug)) {
      slug = `${slug}-${locationSlug}`;
    }
  }

  // Ensure length limit
  if (slug.length > 200) {
    slug = slug.substring(0, 200);
    slug = slug.replace(/-+$/, '');
  }

  return slug;
}

/**
 * Ensures slug uniqueness by appending a number if needed
 * @param baseSlug - Base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
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
    
    // Safety check
    if (counter > 1000) {
      uniqueSlug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return uniqueSlug;
}

/**
 * Validates a slug format
 * @param slug - Slug to validate
 * @returns True if valid
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
 * @param input - User input string
 * @returns Sanitized slug
 */
export function sanitizeSlug(input: string): string {
  return generateSlug(input);
}


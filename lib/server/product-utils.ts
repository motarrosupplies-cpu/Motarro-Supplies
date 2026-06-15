/**
 * Server-Side Product Utilities
 * Functions for fetching products by slug or ID
 */

import { createClient } from '@supabase/supabase-js';
import { isUUID } from '../product-slug-utils';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return null;
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Fetches a product by slug or ID
 * Tries slug first, then falls back to ID lookup
 * 
 * @param identifier - Product slug or UUID
 * @returns Product data or null
 */
export async function getProductBySlugOrId(identifier: string) {
  const client = getServiceClient();
  
  if (!client) {
    console.error('Supabase service client not available');
    return null;
  }

  // Determine if identifier is UUID or slug
  const isId = isUUID(identifier);

  // Try slug first (most common case)
  if (!isId) {
    const { data, error } = await client
      .from('all_products_unified')
      .select('*')
      .or(`slug.eq.${identifier},seo_slug.eq.${identifier}`)
      .eq('status', 'active')
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  }

  // Fallback to ID lookup
  const { data, error } = await client
    .from('all_products_unified')
    .select('*')
    .eq('id', identifier)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

/**
 * Gets product slug for a given product ID
 * Used for generating redirect URLs
 */
export async function getProductSlugById(productId: string): Promise<string | null> {
  const client = getServiceClient();
  
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('all_products_unified')
    .select('slug, seo_slug, id')
    .eq('id', productId)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.slug || data.seo_slug || null;
}

/**
 * Gets all active product slugs for static generation
 */
export async function getAllProductSlugs(): Promise<Array<{ slug: string; id: string }>> {
  const client = getServiceClient();
  
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from('all_products_unified')
    .select('slug, seo_slug, id')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching product slugs:', error);
    return [];
  }

  return (data || []).map(product => {
    // Only include products that have a slug (not UUID)
    const slug = product.slug || product.seo_slug;
    if (!slug || slug === product.id) {
      // Skip products without proper slugs (they'll still work via UUID, just not in static gen)
      return null;
    }
    return {
      slug: slug,
      id: product.id,
    };
  }).filter(Boolean) as Array<{ slug: string; id: string }>;
}


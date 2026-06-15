import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { searchSyncedKevroProducts } from '@/lib/kevro/repository';
import { isKevroConfigured } from '@/lib/kevro/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase();
    const subcategory = searchParams.get('subcategory')?.toLowerCase();

    if (!query) {
      return NextResponse.json([]);
    }

    let supabaseQuery = supabase
      .from('all_products_unified')
      .select('*')
      .eq('status', 'active');

    if (category) {
      supabaseQuery = supabaseQuery.ilike('category', category);
    }
    
    if (subcategory) {
      const normalizedSubcategory = subcategory.trim().replace(/\s+/g, '-');
      supabaseQuery = supabaseQuery.eq('subcategory', normalizedSubcategory);
    }

    // Search by name or description
    supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    const { data: products, error } = await supabaseQuery.limit(5);
    if (error) throw error;

    // Transform data for search result
    const filteredProducts = (products || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      slug: product.slug || product.seo_slug || null,
      seoSlug: product.seo_slug || product.slug || null,
      description: product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : ''
    }));

    let kevroResults: Array<Record<string, unknown>> = [];
    if (isKevroConfigured()) {
      try {
        kevroResults = await searchSyncedKevroProducts(query, 3);
      } catch {
        kevroResults = [];
      }
    }

    return NextResponse.json([...filteredProducts, ...kevroResults].slice(0, 8));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search products', details: String(error) },
      { status: 500 }
    );
  }
} 
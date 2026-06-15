import type { SupabaseClient } from '@supabase/supabase-js'

export type StoreProductQuery = {
  category?: string | null
  subcategory?: string | null
  filter?: string | null
  onSale?: string | null
  isNew?: string | null
  limit?: string | null
}

function applyStoreFilters<T extends { eq: Function; neq: Function; limit: Function }>(
  query: T,
  options: StoreProductQuery,
  useView: boolean
): T {
  let q = query

  if (options.category) {
    q = q.eq('category', options.category.toLowerCase().trim()) as T
  }

  if (options.subcategory) {
    const normalizedSubcategory = options.subcategory.toLowerCase().trim().replace(/\s+/g, '-')
    q = q.eq('subcategory', normalizedSubcategory) as T
  }

  if (options.filter === 'store') {
    q = q.neq('category', 'custom printing') as T
  } else if (options.filter === 'custom-printing') {
    q = q.eq('category', 'custom printing') as T
  }

  if (options.onSale === 'true') {
    q = q.eq(useView ? 'on_sale' : 'on_sale', true) as T
  }

  if (options.isNew === 'true') {
    q = q.eq(useView ? 'is_new' : 'is_new', true) as T
  }

  if (options.limit) {
    q = q.limit(parseInt(options.limit, 10)) as T
  }

  return q
}

function isMissingRelationError(message?: string): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  return (
    lower.includes('does not exist') ||
    lower.includes('could not find the table') ||
    lower.includes('schema cache')
  )
}

function mapSimpleProductRow(row: Record<string, unknown>) {
  return {
    ...row,
    original_price: row.original_price ?? null,
    total_stock: row.stock,
    product_type: 'simple',
    has_color_options: false,
    has_size_options: false,
    colors: null,
    sizes: null,
    seo_slug: row.seo_slug ?? row.slug,
    slug: row.slug ?? row.seo_slug,
  }
}

export async function fetchStoreProducts(
  client: SupabaseClient,
  options: StoreProductQuery
): Promise<{ products: Record<string, unknown>[]; source: 'view' | 'table' }> {
  let viewQuery = client
    .from('all_products_unified')
    .select('*')
    .order('created_at', { ascending: false })

  viewQuery = applyStoreFilters(viewQuery, options, true)

  const { data: viewData, error: viewError } = await viewQuery

  if (!viewError) {
    return { products: viewData ?? [], source: 'view' }
  }

  if (!isMissingRelationError(viewError.message)) {
    throw viewError
  }

  console.warn(
    '[products] all_products_unified unavailable, falling back to simple_products:',
    viewError.message
  )

  let tableQuery = client
    .from('simple_products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  tableQuery = applyStoreFilters(tableQuery, options, false)

  const { data: tableData, error: tableError } = await tableQuery

  if (tableError) {
    throw tableError
  }

  return {
    products: (tableData ?? []).map((row) => mapSimpleProductRow(row as Record<string, unknown>)),
    source: 'table',
  }
}

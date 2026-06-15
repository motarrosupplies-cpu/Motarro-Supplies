import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import type { SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_AUD_TO_ZAR_RATE } from '@/lib/brand'
import { mapProductTypeToCategory } from '@/lib/motarro/categories'
import bundledSeedCatalog from '@/data/motarro-catalog-seed.json'

export type MotarroShopifyProduct = {
  id: number
  title: string
  handle: string
  body_html?: string
  product_type?: string
  tags?: string[] | string
  images?: { src: string }[]
  variants?: {
    price?: string
    sku?: string
    available?: boolean
    inventory_quantity?: number
  }[]
}

const PRODUCT_TYPE_TO_CATEGORY: Record<string, string> = {
  Plastic: 'plastic',
  Metal: 'metal',
  Paper: 'paper',
  Wooden: 'wooden',
  Taxitiles: 'tiles',
  Acrylic: 'acrylic',
  'Glitter EVA Foam': 'foam-craft',
  'EVA Foam': 'foam-craft',
  felt: 'foam-craft',
  foam: 'foam-craft',
  Rubber: 'foam-craft',
  Crayon: 'art-supplies',
  Clay: 'art-supplies',
  clay: 'art-supplies',
  Watercolor: 'art-supplies',
  Chalk: 'art-supplies',
  'Washable paint': 'art-supplies',
  Plasticine: 'art-supplies',
  Pastel: 'art-supplies',
  Oil: 'art-supplies',
  Gouache: 'art-supplies',
  Carbon: 'paper',
  glass: 'acrylic',
  Glass: 'acrylic',
}

export function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function mapCategory(productType: string | undefined): string {
  if (!productType) return 'plastic'
  return PRODUCT_TYPE_TO_CATEGORY[productType] ?? mapProductTypeToCategory(productType)
}

function getProductName(product: MotarroShopifyProduct): string {
  const tag = Array.isArray(product.tags) ? product.tags[0] : product.tags
  if (tag && typeof tag === 'string' && tag.trim()) return tag.trim()
  return product.title
}

export function audToZar(aud: string | number, rate = DEFAULT_AUD_TO_ZAR_RATE): number {
  return Math.round(Number(aud) * rate * 100) / 100
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value
}

export function shopifyProductToRow(
  product: MotarroShopifyProduct,
  audToZarRate = DEFAULT_AUD_TO_ZAR_RATE
) {
  const variant = product.variants?.[0]
  const priceAud = variant?.price || '0'
  const priceZar = audToZar(priceAud, audToZarRate)
  const name = getProductName(product)
  const category = mapCategory(product.product_type)
  const image = product.images?.[0]?.src || ''
  const images = (product.images || []).map((img) => img.src)
  const inStock = variant?.available !== false
  const stock = inStock ? Math.max(1, Number(variant?.inventory_quantity) || 10) : 0
  const slug = truncate(slugify(`${name}-${product.handle}`), 255)

  return {
    name: truncate(name, 255),
    description:
      product.body_html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ||
      `${name} — MOTARRO stationery supply.`,
    price: priceZar,
    original_price: null as number | null,
    category: truncate(category, 50),
    subcategory: truncate(slugify(product.product_type || category), 100),
    stock,
    is_new: false,
    on_sale: false,
    status: 'active' as const,
    image: truncate(image, 500),
    images,
    image_alt_texts: [truncate(name, 255)],
    seo_title: truncate(`${name} | ${category} | MOTARRO Supplies`, 255),
    seo_description: truncate(
      `Buy ${name} from MOTARRO Supplies South Africa. ${product.product_type || 'Stationery'} — R${priceZar.toFixed(2)} with nationwide delivery.`,
      500
    ),
    seo_keywords: `motarro, ${category}, stationery south africa, ${name}`,
    seo_slug: slug,
    slug,
    availability: stock > 0 ? 'in_stock' : 'out_of_stock',
    condition: 'new',
    low_stock_threshold: 5,
    motarro_shopify_id: product.id,
    motarro_shopify_handle: product.handle,
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchMotarroAuPage(url: string, attempt = 0): Promise<Response> {
  const res = await fetch(url, { cache: 'no-store' })
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    const retryAfter = Number(res.headers.get('retry-after') || 0)
    const delay = retryAfter > 0 ? retryAfter * 1000 : Math.min(1500 * 2 ** attempt, 20000)
    await sleep(delay)
    return fetchMotarroAuPage(url, attempt + 1)
  }
  return res
}

export async function fetchMotarroAuCatalog(limit?: number): Promise<MotarroShopifyProduct[]> {
  const all: MotarroShopifyProduct[] = []
  let page = 1

  while (page <= 30) {
    const url = `https://www.motarro.com.au/products.json?limit=250&page=${page}`
    const res = await fetchMotarroAuPage(url)
    if (!res.ok) {
      throw new Error(
        `Motarro AU fetch failed: ${res.status}. The site is rate-limiting requests — use the bundled seed import instead.`
      )
    }
    const data = (await res.json()) as { products?: MotarroShopifyProduct[] }
    if (!data.products?.length) break
    all.push(...data.products)
    if (limit && all.length >= limit) return all.slice(0, limit)
    page++
    if (page <= 30) await sleep(600)
  }

  return limit ? all.slice(0, limit) : all
}

export function loadBundledSeedCatalog(): MotarroShopifyProduct[] {
  const raw = bundledSeedCatalog as { products?: MotarroShopifyProduct[] }
  if (!raw.products?.length) {
    throw new Error('Bundled seed file has no products')
  }
  return raw.products
}

export function loadMotarroSeedCatalog(rootDir: string): MotarroShopifyProduct[] {
  try {
    return loadBundledSeedCatalog()
  } catch {
    // CLI / local dev fallback when JSON import is unavailable
  }

  const candidates = [
    resolve(rootDir, 'data/motarro-catalog-seed.json'),
    resolve(process.cwd(), 'data/motarro-catalog-seed.json'),
  ]
  const seedPath = candidates.find((path) => existsSync(path))
  if (!seedPath) {
    throw new Error('Seed catalogue is not available in this deployment.')
  }
  const raw = JSON.parse(readFileSync(seedPath, 'utf8')) as {
    products?: MotarroShopifyProduct[]
  }
  if (!raw.products?.length) {
    throw new Error('Seed file has no products')
  }
  return raw.products
}

export async function resolveMotarroCatalogProducts(
  source: 'live' | 'seed',
  rootDir = process.cwd()
): Promise<{ products: MotarroShopifyProduct[]; source: 'live' | 'seed' }> {
  if (source === 'live') {
    return { products: await fetchMotarroAuCatalog(), source: 'live' }
  }

  return { products: loadMotarroSeedCatalog(rootDir), source: 'seed' }
}

export type ImportBatchResult = {
  ok: boolean
  total: number
  processed: number
  inserted: number
  updated: number
  errors: number
  nextOffset: number | null
  done: boolean
  errorMessages: string[]
  categoryBreakdown: Record<string, number>
}

export async function syncMotarroCatalogBatch(
  supabase: SupabaseClient,
  products: MotarroShopifyProduct[],
  options: {
    offset?: number
    batchSize?: number
    audToZarRate?: number
  } = {}
): Promise<ImportBatchResult> {
  const offset = options.offset ?? 0
  const batchSize = options.batchSize ?? 50
  const audToZarRate = options.audToZarRate ?? DEFAULT_AUD_TO_ZAR_RATE
  const slice = products.slice(offset, offset + batchSize)
  const total = products.length

  let inserted = 0
  let updated = 0
  let errors = 0
  const errorMessages: string[] = []

  for (const product of slice) {
    const row = shopifyProductToRow(product, audToZarRate)

    if (!row.image || row.price <= 0) {
      errors++
      errorMessages.push(`Skipped ${row.name}: missing image or invalid price`)
      continue
    }

    const { data: existing } = await supabase
      .from('simple_products')
      .select('id')
      .eq('motarro_shopify_id', product.id)
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase
        .from('simple_products')
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (error) {
        errors++
        errorMessages.push(`${row.name}: ${error.message}`)
      } else {
        updated++
      }
    } else {
      const { error } = await supabase.from('simple_products').insert([row])
      if (error) {
        if (error.message.includes('duplicate') || error.code === '23505') {
          const { error: upsertErr } = await supabase
            .from('simple_products')
            .update({ ...row, updated_at: new Date().toISOString() })
            .eq('seo_slug', row.seo_slug)
          if (upsertErr) {
            errors++
            errorMessages.push(`${row.name}: ${upsertErr.message}`)
          } else {
            updated++
          }
        } else {
          errors++
          errorMessages.push(`${row.name}: ${error.message}`)
        }
      } else {
        inserted++
      }
    }
  }

  const processed = offset + slice.length
  const categoryBreakdown = products.map((p) => shopifyProductToRow(p, audToZarRate).category).reduce(
    (acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return {
    ok: errors === 0 || inserted + updated > 0,
    total,
    processed,
    inserted,
    updated,
    errors,
    nextOffset: processed < total ? processed : null,
    done: processed >= total,
    errorMessages: errorMessages.slice(0, 10),
    categoryBreakdown,
  }
}

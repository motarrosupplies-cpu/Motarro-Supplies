/**
 * Import MOTARRO AU catalogue into Supabase simple_products.
 *
 * Usage (requires .env.local with Supabase keys):
 *   node scripts/import-motarro-catalog.mjs
 *   node scripts/import-motarro-catalog.mjs --dry-run
 *   node scripts/import-motarro-catalog.mjs --limit 50
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = resolve(root, file)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (!m) continue
      const key = m[1].trim()
      const val = m[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  }
}

loadEnv()

const AUD_TO_ZAR = Number(process.env.MOTARRO_AUD_TO_ZAR || 11.5)
const DRY_RUN = process.argv.includes('--dry-run')
const limitArg = process.argv.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : null

const PRODUCT_TYPE_TO_CATEGORY = {
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

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function mapCategory(productType) {
  return PRODUCT_TYPE_TO_CATEGORY[productType] || 'plastic'
}

function audToZar(aud) {
  return Math.round(Number(aud) * AUD_TO_ZAR * 100) / 100
}

function getProductName(product) {
  const tag = Array.isArray(product.tags) ? product.tags[0] : product.tags
  if (tag && typeof tag === 'string' && tag.trim()) return tag.trim()
  return product.title
}

async function fetchAllProducts() {
  const all = []
  let page = 1
  while (page <= 30) {
    const url = `https://www.motarro.com.au/products.json?limit=250&page=${page}`
    const res = await fetch(url)
    const data = await res.json()
    if (!data.products?.length) break
    all.push(...data.products)
    page++
  }
  return LIMIT ? all.slice(0, LIMIT) : all
}

function toDbRow(product) {
  const variant = product.variants?.[0]
  const priceAud = variant?.price || '0'
  const priceZar = audToZar(priceAud)
  const name = getProductName(product)
  const category = mapCategory(product.product_type)
  const image = product.images?.[0]?.src || ''
  const images = (product.images || []).map((img) => img.src)
  const inStock = variant?.available !== false
  const stock = inStock ? Math.max(1, Number(variant?.inventory_quantity) || 10) : 0
  const slug = slugify(`${name}-${product.handle}`)

  return {
    name,
    description: product.body_html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || `${name} — MOTARRO stationery supply.`,
    price: priceZar,
    original_price: null,
    category,
    subcategory: slugify(product.product_type || category),
    stock,
    is_new: false,
    on_sale: false,
    status: stock > 0 ? 'active' : 'active',
    image,
    images: JSON.stringify(images),
    image_alt_texts: JSON.stringify([name]),
    seo_title: `${name} | ${category} | MOTARRO Supplies South Africa`,
    seo_description: `Buy ${name} online from MOTARRO Supplies South Africa. ${product.product_type || 'Stationery'} — R${priceZar.toFixed(2)} with nationwide delivery.`,
    seo_keywords: `motarro, ${category}, stationery south africa, ${name}`,
    seo_slug: slug,
    availability: stock > 0 ? 'in_stock' : 'out_of_stock',
    condition: 'new',
    motarro_handle: product.handle,
    motarro_sku: variant?.sku || product.title,
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log(`Fetching Motarro AU catalogue (AUD→ZAR rate: ${AUD_TO_ZAR})...`)
  const products = await fetchAllProducts()
  console.log(`Fetched ${products.length} products`)

  const rows = products.map(toDbRow)
  if (DRY_RUN) {
    console.log('Dry run — sample rows:', rows.slice(0, 3))
    console.log('Category breakdown:', rows.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1
      return acc
    }, {}))
    return
  }

  const supabase = createClient(url, key)
  const BATCH = 50
  let inserted = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map(({ motarro_handle, motarro_sku, ...row }) => row)
    const { error } = await supabase.from('simple_products').insert(batch)
    if (error) {
      console.error(`Batch ${i / BATCH + 1} error:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      console.log(`Inserted ${inserted}/${rows.length}`)
    }
  }

  console.log(`Done. Inserted: ${inserted}, errors: ${errors}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

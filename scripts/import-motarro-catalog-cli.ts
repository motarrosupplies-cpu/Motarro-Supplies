/**
 * CLI import for MOTARRO AU catalogue.
 * Prefer Admin → Products → Import / Sync Catalogue after deploy.
 *
 * Usage (create .env.local with Supabase keys first):
 *   npx tsx scripts/import-motarro-catalog-cli.ts
 *   npx tsx scripts/import-motarro-catalog-cli.ts --dry-run
 *   npx tsx scripts/import-motarro-catalog-cli.ts --live
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  fetchMotarroAuCatalog,
  loadMotarroSeedCatalog,
  syncMotarroCatalogBatch,
} from '../lib/motarro/import-catalog'

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

const DRY_RUN = process.argv.includes('--dry-run')
const USE_LIVE = process.argv.includes('--live')
const BATCH_SIZE = 75

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const products = USE_LIVE
    ? await fetchMotarroAuCatalog()
    : loadMotarroSeedCatalog(root)

  console.log(`Catalog: ${products.length} products`)

  if (DRY_RUN) {
    const { shopifyProductToRow } = await import('../lib/motarro/import-catalog')
    console.log('Sample:', products.slice(0, 3).map(shopifyProductToRow))
    return
  }

  const supabase = createClient(url, key)
  let offset = 0
  let done = false
  let totalInserted = 0
  let totalUpdated = 0

  while (!done) {
    const result = await syncMotarroCatalogBatch(supabase, products, {
      offset,
      batchSize: BATCH_SIZE,
      audToZarRate: Number(process.env.MOTARRO_AUD_TO_ZAR || 11.5),
    })
    totalInserted += result.inserted
    totalUpdated += result.updated
    console.log(`Progress ${result.processed}/${result.total}`)
    done = result.done
    offset = result.nextOffset ?? offset
    if (!done && result.nextOffset == null) break
  }

  console.log(`Done. Inserted ${totalInserted}, updated ${totalUpdated}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

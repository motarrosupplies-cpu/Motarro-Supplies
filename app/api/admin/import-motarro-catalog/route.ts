import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/auth/verifyAdminApi'
import { supabaseAdmin } from '@/lib/supabaseClient'
import {
  loadBundledSeedCatalog,
  loadMotarroSeedCatalog,
  resolveMotarroCatalogProducts,
  syncMotarroCatalogBatch,
} from '@/lib/motarro/import-catalog'

export const maxDuration = 120

function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

export async function POST(request: Request) {
  const cronOk = isAuthorizedCron(request)
  if (!cronOk) {
    const auth = await verifyAdminRequest(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error:
          'SUPABASE_SERVICE_ROLE_KEY is not configured. Add it in Vercel environment variables.',
      },
      { status: 500 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const offset = Number(body.offset ?? 0)
    const batchSize = Math.min(Number(body.batchSize ?? 75), 100)
    const requestedSource = body.source === 'live' ? 'live' : 'seed'
    const audToZarRate = Number(process.env.MOTARRO_AUD_TO_ZAR || 11.5)

    const { products, source } = await resolveMotarroCatalogProducts(
      requestedSource,
      process.cwd()
    )

    const result = await syncMotarroCatalogBatch(supabaseAdmin, products, {
      offset,
      batchSize,
      audToZarRate,
    })

    const { count: dbCount } = await supabaseAdmin
      .from('simple_products')
      .select('*', { count: 'exact', head: true })

    const batchFailed = result.inserted === 0 && result.updated === 0 && result.errors > 0
    const status = batchFailed ? 500 : 200

    return NextResponse.json(
      {
        ...result,
        source,
        audToZarRate,
        dbProductCount: dbCount ?? 0,
        message: result.done
          ? `Import complete — ${result.processed}/${result.total} products synced.`
          : `Batch synced — ${result.processed}/${result.total}. Call again with offset ${result.nextOffset}.`,
      },
      { status }
    )
  } catch (error) {
    console.error('[import-motarro-catalog]', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const cronOk = isAuthorizedCron(request)
  if (!cronOk) {
    const auth = await verifyAdminRequest(request)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
  }

  try {
    const seed = loadBundledSeedCatalog()
    let dbProductCount = 0
    let activeProductCount = 0

    if (supabaseAdmin) {
      const { count: total } = await supabaseAdmin
        .from('simple_products')
        .select('*', { count: 'exact', head: true })
      dbProductCount = total ?? 0

      const { count: active } = await supabaseAdmin
        .from('simple_products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      activeProductCount = active ?? 0
    }

    return NextResponse.json({
      seedCount: seed.length,
      dbProductCount,
      activeProductCount,
      audToZarRate: Number(process.env.MOTARRO_AUD_TO_ZAR || 11.5),
      source: 'https://www.motarro.com.au/collections/all',
      note: 'all_products_unified is a view — it shows rows from simple_products where status = active.',
      instructions:
        'POST with { "offset": 0, "batchSize": 75, "source": "seed" } — repeat until done=true.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read seed' },
      { status: 500 }
    )
  }
}

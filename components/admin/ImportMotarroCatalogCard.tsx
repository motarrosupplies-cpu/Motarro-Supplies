'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { Download, Loader2 } from 'lucide-react'

export function ImportMotarroCatalogCard() {
  const { toast } = useToast()
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [dbCount, setDbCount] = useState<number | null>(null)

  useEffect(() => {
    async function loadCount() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.access_token) return

        const res = await fetch('/api/admin/import-motarro-catalog', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const data = await res.json()
        if (typeof data.dbProductCount === 'number') setDbCount(data.dbProductCount)
      } catch {
        // ignore
      }
    }
    loadCount()
  }, [])

  const runImport = async () => {
    setRunning(true)
    setProgress('Loading bundled MOTARRO catalogue snapshot…')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Sign in to admin before importing.')
      }

      let offset = 0
      let done = false
      let totalInserted = 0
      let totalUpdated = 0
      let totalErrors = 0
      let lastErrorMessages: string[] = []

      while (!done) {
        setProgress(`Syncing products ${offset + 1}…`)

        const res = await fetch('/api/admin/import-motarro-catalog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ offset, batchSize: 75, source: 'seed' }),
        })

        const data = await res.json()
        if (!res.ok) {
          const detail = data.errorMessages?.length
            ? `${data.errorMessages[0]}`
            : data.error
          throw new Error(detail || 'Import batch failed')
        }

        totalInserted += data.inserted ?? 0
        totalUpdated += data.updated ?? 0
        totalErrors += data.errors ?? 0
        if (Array.isArray(data.errorMessages) && data.errorMessages.length) {
          lastErrorMessages = data.errorMessages
        }
        done = Boolean(data.done)
        offset = data.nextOffset ?? offset

        setProgress(
          `Synced ${data.processed}/${data.total} — inserted ${totalInserted}, updated ${totalUpdated}${totalErrors ? `, errors ${totalErrors}` : ''}`
        )

        if (!done && data.nextOffset == null) break
      }

      if (totalInserted + totalUpdated === 0) {
        throw new Error(
          lastErrorMessages[0] ||
            `No products were saved to Supabase (${totalErrors} errors). Check SUPABASE_SERVICE_ROLE_KEY in Vercel — it must be the secret/service_role key for project dkxvsitqxxkxtielgpxd.`
        )
      }

      toast({
        title: 'MOTARRO catalogue import complete',
        description: `Inserted ${totalInserted}, updated ${totalUpdated}${totalErrors ? `, ${totalErrors} skipped/errors` : ''}. Refreshing product list…`,
      })
      setProgress(null)
      await new Promise((resolve) => setTimeout(resolve, 800))
      window.location.reload()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed'
      toast({ title: 'Import failed', description: message, variant: 'destructive' })
      setProgress(message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card className="mb-6 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5" />
          Import MOTARRO AU Catalogue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Sync all 1,127 products from{' '}
          <a
            href="https://www.motarro.com.au/collections/all"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            motarro.com.au
          </a>{' '}
          into Supabase from a bundled snapshot (1,127 products). Prices convert AUD → ZAR
          (rate 11.5). Run the SQL migration in Supabase first if this is a new database.
        </p>
        {typeof dbCount === 'number' ? (
          <p className="text-foreground">
            <strong>{dbCount}</strong> products currently in <code>simple_products</code>
            {dbCount === 0 ? ' — import has not saved any rows yet.' : '.'}
          </p>
        ) : null}
        <p className="text-xs">
          Note: <code>all_products_unified</code> in Supabase is a view — it only shows active rows
          from <code>simple_products</code>.
        </p>
        {progress ? <p className="text-foreground font-medium">{progress}</p> : null}
        <Button onClick={runImport} disabled={running}>
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing…
            </>
          ) : (
            'Import / Sync Catalogue'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

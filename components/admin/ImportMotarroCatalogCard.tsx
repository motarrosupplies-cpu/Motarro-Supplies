'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { Download, Loader2 } from 'lucide-react'

export function ImportMotarroCatalogCard() {
  const { toast } = useToast()
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)

  const runImport = async () => {
    setRunning(true)
    setProgress('Fetching catalogue from motarro.com.au…')

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

      while (!done) {
        setProgress(`Syncing products ${offset + 1}…`)

        const res = await fetch('/api/admin/import-motarro-catalog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ offset, batchSize: 75, source: 'live' }),
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Import batch failed')
        }

        totalInserted += data.inserted ?? 0
        totalUpdated += data.updated ?? 0
        totalErrors += data.errors ?? 0
        done = Boolean(data.done)
        offset = data.nextOffset ?? offset

        setProgress(
          `Synced ${data.processed}/${data.total} — inserted ${totalInserted}, updated ${totalUpdated}${totalErrors ? `, errors ${totalErrors}` : ''}`
        )

        if (!done && data.nextOffset == null) break
      }

      toast({
        title: 'MOTARRO catalogue import complete',
        description: `Inserted ${totalInserted}, updated ${totalUpdated}${totalErrors ? `, ${totalErrors} skipped/errors` : ''}.`,
      })
      setProgress(null)
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
          into Supabase. Prices convert AUD → ZAR (rate 11.5). Run the SQL migration in Supabase
          first if this is a new database.
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

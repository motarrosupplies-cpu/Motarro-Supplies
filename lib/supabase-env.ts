/**
 * Resolve Supabase env vars — supports legacy (anon/service_role) and
 * new Supabase API keys (publishable/secret).
 */

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
}

/** Client-side key: legacy anon OR new publishable key */
export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
}

/** Server-side admin key: legacy service_role OR new secret key */
export function getSupabaseServiceRoleKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY
  )
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

export const SUPABASE_ENV_ERROR =
  'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'

export function getSupabaseProjectRefFromUrl(url?: string): string | null {
  const value = url ?? getSupabaseUrl()
  if (!value) return null
  const match = value.match(/https?:\/\/([^.]+)\.supabase\.co/i)
  return match?.[1] ?? null
}

function decodeJwtPayload(key: string): Record<string, unknown> | null {
  const parts = key.trim().split('.')
  if (parts.length < 2) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as Record<string, unknown>
  } catch {
    return null
  }
}

/** Human-readable hint when Supabase returns Invalid API key on server routes. */
export function describeSupabaseAdminKeyError(apiMessage?: string): string {
  const url = getSupabaseUrl()
  const serviceKey = getSupabaseServiceRoleKey()
  const projectRef = getSupabaseProjectRefFromUrl(url)

  if (!url || !serviceKey) {
    return 'SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) is missing. Add the service role / secret key from the same Supabase project as NEXT_PUBLIC_SUPABASE_URL in Vercel, then redeploy.'
  }

  const payload = decodeJwtPayload(serviceKey)
  if (payload) {
    const keyRef = typeof payload.ref === 'string' ? payload.ref : null
    const role = typeof payload.role === 'string' ? payload.role : null

    if (role === 'anon') {
      return 'SUPABASE_SERVICE_ROLE_KEY looks like the anon/publishable key. In Supabase → Project Settings → API, copy the service_role key (legacy) or secret key (new) — not the anon/publishable key — then redeploy.'
    }

    if (keyRef && projectRef && keyRef !== projectRef) {
      return `Supabase key mismatch: NEXT_PUBLIC_SUPABASE_URL points to project "${projectRef}" but SUPABASE_SERVICE_ROLE_KEY belongs to "${keyRef}". Copy all keys from the same project and redeploy.`
    }
  }

  if (apiMessage?.toLowerCase().includes('invalid api key')) {
    return `Supabase rejected the service role key for project "${projectRef ?? 'unknown'}". Re-copy SUPABASE_SERVICE_ROLE_KEY from Supabase → Settings → API (service_role / secret key), ensure it matches NEXT_PUBLIC_SUPABASE_URL, and redeploy production.`
  }

  return apiMessage || 'Supabase admin connection failed.'
}

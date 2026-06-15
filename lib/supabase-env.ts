/**
 * Resolve Supabase env vars — supports legacy (anon/service_role) and
 * new Supabase API keys (publishable/secret).
 */

function sanitizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined
  let trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim()
  }
  return trimmed || undefined
}

export function getSupabaseUrl(): string | undefined {
  return sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/$/, '')
}

export type SupabaseKeyKind =
  | 'publishable'
  | 'secret'
  | 'legacy-anon'
  | 'legacy-service-role'
  | 'unknown'

export function classifySupabaseKey(key: string | undefined): SupabaseKeyKind {
  if (!key) return 'unknown'
  if (key.startsWith('sb_publishable_')) return 'publishable'
  if (key.startsWith('sb_secret_')) return 'secret'

  const payload = decodeJwtPayload(key)
  if (!payload) return 'unknown'
  const role = typeof payload.role === 'string' ? payload.role : null
  if (role === 'service_role') return 'legacy-service-role'
  if (role === 'anon') return 'legacy-anon'
  return 'unknown'
}

/** Client-side key: legacy anon OR new publishable key */
export function getSupabaseAnonKey(): string | undefined {
  const projectRef = getSupabaseProjectRefFromUrl()
  return pickClientKey(
    sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    projectRef
  )
}

/** Server-side admin key: legacy service_role OR new secret key */
export function getSupabaseServiceRoleKey(): string | undefined {
  const projectRef = getSupabaseProjectRefFromUrl()
  return pickAdminKey(
    sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
    sanitizeEnvValue(process.env.SUPABASE_SECRET_KEY),
    projectRef
  )
}

function pickClientKey(
  publishable: string | undefined,
  anon: string | undefined,
  projectRef: string | null
): string | undefined {
  const candidates = [publishable, anon].filter(Boolean) as string[]
  if (!candidates.length) return undefined

  const matching = candidates.find((key) => keyMatchesProject(key, projectRef))
  if (matching) return matching

  const publishableLike = candidates.find(
    (key) =>
      classifySupabaseKey(key) === 'publishable' ||
      classifySupabaseKey(key) === 'legacy-anon'
  )
  return publishableLike ?? candidates[0]
}

function pickAdminKey(
  serviceRole: string | undefined,
  secret: string | undefined,
  projectRef: string | null
): string | undefined {
  const candidates = [serviceRole, secret].filter(Boolean) as string[]
  if (!candidates.length) return undefined

  const adminCandidates = candidates.filter((key) => isAdminKeyKind(classifySupabaseKey(key)))
  const pool = adminCandidates.length ? adminCandidates : candidates

  const matching = pool.find((key) => keyMatchesProject(key, projectRef))
  if (matching) return matching

  const secretLike = pool.find(
    (key) =>
      classifySupabaseKey(key) === 'secret' ||
      classifySupabaseKey(key) === 'legacy-service-role'
  )
  return secretLike ?? pool[0]
}

function isAdminKeyKind(kind: SupabaseKeyKind): boolean {
  return kind === 'secret' || kind === 'legacy-service-role'
}

function keyMatchesProject(key: string, projectRef: string | null): boolean {
  if (!projectRef) return true
  const payload = decodeJwtPayload(key)
  const keyRef = payload && typeof payload.ref === 'string' ? payload.ref : null
  if (keyRef) return keyRef === projectRef
  // sb_secret / sb_publishable keys don't embed ref — accept if format is valid
  return classifySupabaseKey(key) === 'secret' || classifySupabaseKey(key) === 'publishable'
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

/** Canonical MOTARRO Supabase project — use when env URL is unset (local/docs). */
export const MOTARRO_SUPABASE_PROJECT_REF = 'dkxvsitqxxkxtielgpxd'

export function getSupabaseProjectRef(): string {
  return getSupabaseProjectRefFromUrl() ?? MOTARRO_SUPABASE_PROJECT_REF
}

export function getSupabaseStoragePublicUrl(objectPath: string): string {
  const base =
    getSupabaseUrl() ?? `https://${MOTARRO_SUPABASE_PROJECT_REF}.supabase.co`
  const path = objectPath.replace(/^\//, '')
  return `${base}/storage/v1/object/public/${path}`
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

function maskKey(key: string | undefined): string | null {
  if (!key) return null
  if (key.length <= 12) return `${key.slice(0, 4)}… (${key.length} chars)`
  return `${key.slice(0, 12)}… (${key.length} chars)`
}

export type SupabaseConfigDiagnostics = {
  url: string | null
  projectRef: string | null
  client: {
    sourceVar: string | null
    kind: SupabaseKeyKind
    masked: string | null
    jwtProjectRef: string | null
    matchesUrl: boolean | null
  }
  admin: {
    sourceVar: string | null
    kind: SupabaseKeyKind
    masked: string | null
    jwtProjectRef: string | null
    matchesUrl: boolean | null
  }
  envVarsPresent: Record<string, boolean>
  warnings: string[]
}

export function getSupabaseConfigDiagnostics(): SupabaseConfigDiagnostics {
  const url = getSupabaseUrl() ?? null
  const projectRef = getSupabaseProjectRefFromUrl(url ?? undefined)
  const warnings: string[] = []

  const publishable = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  const anon = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const serviceRole = sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY)
  const secret = sanitizeEnvValue(process.env.SUPABASE_SECRET_KEY)

  const clientKey = getSupabaseAnonKey()
  const adminKey = getSupabaseServiceRoleKey()

  const clientSourceVar = clientKey
    ? clientKey === publishable
      ? 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
      : clientKey === anon
        ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        : null
    : null

  const adminSourceVar = adminKey
    ? adminKey === secret
      ? 'SUPABASE_SECRET_KEY'
      : adminKey === serviceRole
        ? 'SUPABASE_SERVICE_ROLE_KEY'
        : null
    : null

  const clientKind = classifySupabaseKey(clientKey)
  const adminKind = classifySupabaseKey(adminKey)

  const clientJwtRef =
    clientKey && decodeJwtPayload(clientKey)?.ref
      ? String(decodeJwtPayload(clientKey)!.ref)
      : null
  const adminJwtRef =
    adminKey && decodeJwtPayload(adminKey)?.ref
      ? String(decodeJwtPayload(adminKey)!.ref)
      : null

  if (publishable && anon && publishable !== anon) {
    warnings.push(
      'Both NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY are set with different values. Remove the old one so only the new project key remains.'
    )
  }

  if (serviceRole && secret && serviceRole !== secret) {
    warnings.push(
      'Both SUPABASE_SERVICE_ROLE_KEY and SUPABASE_SECRET_KEY are set with different values. Delete the old project key from Vercel — the wrong one may have been picked before this fix.'
    )
  }

  if (adminKind === 'publishable' || adminKind === 'legacy-anon') {
    warnings.push(
      'The admin/server key looks like a publishable/anon key. Use the secret key (sb_secret_…) or service_role JWT from Supabase → Settings → API.'
    )
  }

  if (projectRef && adminJwtRef && adminJwtRef !== projectRef) {
    warnings.push(
      `Admin key belongs to project "${adminJwtRef}" but URL points to "${projectRef}". Remove stale keys from the old Apparely project.`
    )
  }

  if (projectRef && clientJwtRef && clientJwtRef !== projectRef) {
    warnings.push(
      `Client key belongs to project "${clientJwtRef}" but URL points to "${projectRef}".`
    )
  }

  if (!adminKey) {
    warnings.push('No admin key resolved. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY, then redeploy.')
  }

  return {
    url,
    projectRef,
    client: {
      sourceVar: clientSourceVar,
      kind: clientKind,
      masked: maskKey(clientKey),
      jwtProjectRef: clientJwtRef,
      matchesUrl: clientJwtRef && projectRef ? clientJwtRef === projectRef : null,
    },
    admin: {
      sourceVar: adminSourceVar,
      kind: adminKind,
      masked: maskKey(adminKey),
      jwtProjectRef: adminJwtRef,
      matchesUrl: adminJwtRef && projectRef ? adminJwtRef === projectRef : null,
    },
    envVarsPresent: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(url),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(publishable),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(anon),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceRole),
      SUPABASE_SECRET_KEY: Boolean(secret),
    },
    warnings,
  }
}

/** Human-readable hint when Supabase returns Invalid API key on server routes. */
export function describeSupabaseAdminKeyError(apiMessage?: string): string {
  const diagnostics = getSupabaseConfigDiagnostics()

  if (diagnostics.warnings.length) {
    return diagnostics.warnings.join(' ')
  }

  const projectRef = diagnostics.projectRef

  if (!diagnostics.admin.masked) {
    return 'SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) is missing. Add the secret / service_role key from the same Supabase project as NEXT_PUBLIC_SUPABASE_URL in Vercel, then redeploy.'
  }

  if (apiMessage?.toLowerCase().includes('invalid api key')) {
    return `Supabase rejected the admin key for project "${projectRef ?? 'unknown'}". In Vercel, delete any old SUPABASE_SERVICE_ROLE_KEY from the previous project, set only SUPABASE_SECRET_KEY (sb_secret_…) or a fresh service_role key from dkxvsitqxxkxtielgpxd, and redeploy production.`
  }

  return apiMessage || 'Supabase admin connection failed.'
}

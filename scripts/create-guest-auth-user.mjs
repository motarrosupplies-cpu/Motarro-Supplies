/**
 * Create or update the guest admin user in Supabase Auth (email pre-confirmed).
 *
 * Requires .env.local with Supabase keys plus:
 *   NEXT_PUBLIC_GUEST_AUTH_EMAIL=guest@email.com
 *   GUEST_AUTH_PASSWORD=your-password
 *
 * Usage:
 *   node scripts/create-guest-auth-user.mjs
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
      let val = m[2].trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
const email = (
  process.env.NEXT_PUBLIC_GUEST_AUTH_EMAIL || process.env.GUEST_AUTH_EMAIL
)?.trim()
const password = process.env.GUEST_AUTH_PASSWORD?.trim()

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!email || !password) {
  console.error(
    'Set NEXT_PUBLIC_GUEST_AUTH_EMAIL and GUEST_AUTH_PASSWORD in .env.local'
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: list, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
})

if (listError) {
  console.error('listUsers failed:', listError.message)
  process.exit(1)
}

const existing = list.users.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase()
)

if (existing) {
  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  })
  if (error) {
    console.error('updateUser failed:', error.message)
    process.exit(1)
  }
  console.log(`Updated guest user: ${data.user.email} (${data.user.id})`)
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    console.error('createUser failed:', error.message)
    process.exit(1)
  }
  console.log(`Created guest user: ${data.user.email} (${data.user.id})`)
}

console.log('Sign in at /admin/login with these credentials.')

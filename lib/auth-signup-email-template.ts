import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Supabase Auth "Confirm signup" template (Go template variables preserved). */
export function buildConfirmSignupEmailTemplate(): string {
  return readFileSync(
    join(process.cwd(), 'supabase/templates/confirm-signup.html'),
    'utf8',
  )
}

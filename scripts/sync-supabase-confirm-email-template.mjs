import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? 'dkxvsitqxxkxtielgpxd'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

async function main() {
  const content = readFileSync(join(__dirname, '../supabase/templates/confirm-signup.html'), 'utf8')

  if (!ACCESS_TOKEN) {
    console.error('Missing SUPABASE_ACCESS_TOKEN.')
    console.error('Create one at https://supabase.com/dashboard/account/tokens')
    console.error('Then run:')
    console.error('$env:SUPABASE_ACCESS_TOKEN="..." ; node scripts/sync-supabase-confirm-email-template.mjs')
    process.exit(1)
  }

  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mailer_subjects_confirmation: 'Confirm your MOTARRO Supplies account',
      mailer_templates_confirmation_content: content,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('Failed to update Supabase auth email template:', response.status, body)
    process.exit(1)
  }

  console.log('Supabase confirm-signup email template updated successfully.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

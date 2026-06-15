import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })
dotenv.config({ path: join(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'product-images'
const STORAGE_PATH = 'brand/MOTARRO Supplies.png'

async function main() {
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const filePath = join(__dirname, '../public/brand/MOTARRO Supplies.png')
  const bytes = readFileSync(filePath)

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await supabase.storage.from(BUCKET).upload(STORAGE_PATH, bytes, {
    contentType: 'image/png',
    cacheControl: '31536000',
    upsert: true,
  })

  if (error) {
    console.error('Upload failed:', error.message)
    process.exit(1)
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${STORAGE_PATH}`
  console.log('Uploaded successfully.')
  console.log('Public URL:', publicUrl)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseClient'
import {
  describeSupabaseAdminKeyError,
  getSupabaseConfigDiagnostics,
} from '@/lib/supabase-env'

export async function GET() {
  const diagnostics = getSupabaseConfigDiagnostics()
  const admin = getSupabaseAdminClient()

  if (!admin) {
    return NextResponse.json({
      ok: false,
      diagnostics,
      liveTest: {
        ok: false,
        error: 'Admin Supabase client could not be created — no valid secret/service_role key.',
      },
    })
  }

  const { error } = await admin.from('menu_items').select('id').limit(1)

  if (error) {
    return NextResponse.json({
      ok: false,
      diagnostics,
      liveTest: {
        ok: false,
        error: describeSupabaseAdminKeyError(error.message),
        supabaseMessage: error.message,
      },
    })
  }

  return NextResponse.json({
    ok: true,
    diagnostics,
    liveTest: { ok: true, message: 'Admin key can read menu_items.' },
  })
}

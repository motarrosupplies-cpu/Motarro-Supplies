import { getSupabaseAdminClient } from '@/lib/supabaseClient'
import { getGuestAuthEmail, getGuestAuthPassword } from '@/lib/guest-auth'

export const dynamic = 'force-dynamic'

/**
 * One-time bootstrap: create/update guest@email.com in Supabase Auth.
 * POST with header x-provision-secret matching GUEST_AUTH_PASSWORD.
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-provision-secret')?.trim()
  const password = getGuestAuthPassword()
  const email = getGuestAuthEmail()

  if (!email || !password) {
    return Response.json(
      { error: 'Set GUEST_AUTH_EMAIL (or NEXT_PUBLIC_GUEST_AUTH_EMAIL) and GUEST_AUTH_PASSWORD in Vercel.' },
      { status: 503 }
    )
  }

  if (!secret || secret !== password) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return Response.json({ error: 'Supabase service role not configured' }, { status: 503 })
  }

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    return Response.json({ error: listError.message }, { status: 500 })
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
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({
      ok: true,
      action: 'updated',
      email: data.user.email,
      id: data.user.id,
    })
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    ok: true,
    action: 'created',
    email: data.user.email,
    id: data.user.id,
  })
}

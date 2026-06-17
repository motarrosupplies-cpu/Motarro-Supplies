/**
 * Optional demo / shared admin login (fake email — no inbox).
 *
 * Vercel (set both to the same value, or only GUEST_AUTH_EMAIL — build copies it to public):
 * - GUEST_AUTH_EMAIL=guest@email.com
 * - NEXT_PUBLIC_GUEST_AUTH_EMAIL=guest@email.com
 * - GUEST_AUTH_PASSWORD=…                         (server only — provisioning)
 */

function sanitize(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim().toLowerCase()
  return trimmed.length ? trimmed : undefined
}

/** Guest login email from env (public so client admin checks work after sign-in). */
export function getGuestAuthEmail(): string | undefined {
  return (
    sanitize(process.env.NEXT_PUBLIC_GUEST_AUTH_EMAIL) ??
    sanitize(process.env.GUEST_AUTH_EMAIL)
  )
}

/** Server-only — used by scripts/create-guest-auth-user.mjs */
export function getGuestAuthPassword(): string | undefined {
  const pass = process.env.GUEST_AUTH_PASSWORD?.trim()
  return pass?.length ? pass : undefined
}

export function isGuestAuthEmail(email: string | null | undefined): boolean {
  const guest = getGuestAuthEmail()
  if (!guest || !email) return false
  return email.trim().toLowerCase() === guest
}

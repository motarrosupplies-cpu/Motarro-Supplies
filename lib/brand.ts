/**
 * MOTARRO Supplies — brand constants and admin configuration.
 * South African market (ZAR). Aligned with motarro.com.au product catalogue.
 */

export const MOTARRO_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.motarro.co.za'

/** Primary logo — Trading_Mark.avif in public/brand/ */
export const MOTARRO_LOGO_PATH = '/brand/Trading_Mark.avif'

export const MOTARRO_LOGO_URL = `${MOTARRO_SITE_URL}${MOTARRO_LOGO_PATH}`

export const MOTARRO_EMAIL_LOGO_URL = MOTARRO_LOGO_URL

export const MOTARRO_BRAND_NAME = 'MOTARRO Supplies'

export const MOTARRO_TAGLINE = 'Stationery Passion, Unleash Your Imagination'

export const MOTARRO_DESCRIPTION =
  'Premium stationery, craft supplies, and educational materials for South Africa. Shop plastic, paper, wooden, metal, acrylic, art supplies and more — delivered nationwide in Rands.'

/** AUD → ZAR conversion for catalogue import (override via MOTARRO_AUD_TO_ZAR env). */
export const DEFAULT_AUD_TO_ZAR_RATE = 11.5

export const DEFAULT_ADMIN_EMAILS = ['dartonstaker@gmail.com'] as const

/** Backward-compatible aliases */
export const APPARELY_SITE_URL = MOTARRO_SITE_URL
export const APPARELY_LOGO_STORAGE_URL = MOTARRO_LOGO_URL
export const APPARELY_LOGO_SITE_URL = MOTARRO_LOGO_URL
export const APPARELY_EMAIL_LOGO_URL = MOTARRO_EMAIL_LOGO_URL
export const ADMIN_EMAILS = DEFAULT_ADMIN_EMAILS

export function getAdminEmailAllowlist(): string[] {
  const extras =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean) ?? []

  const defaults = DEFAULT_ADMIN_EMAILS.map((email) => email.toLowerCase())
  return [...new Set([...defaults, ...extras])]
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return getAdminEmailAllowlist().includes(normalized)
}

export function isAdminEmailOnServer(email: string | null | undefined): boolean {
  if (!email) return false
  if (isAdminEmail(email)) return true

  const extras =
    process.env.ADMIN_EMAILS?.split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean) ?? []

  return extras.includes(email.trim().toLowerCase())
}

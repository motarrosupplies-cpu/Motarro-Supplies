import type { AuthError } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/brand'

export function getAuthCallbackUrl(nextPath?: string): string {
  const base =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.motarro.co.za'}/auth/callback`

  if (!nextPath || !nextPath.startsWith('/')) {
    return base
  }

  return `${base}?next=${encodeURIComponent(nextPath)}`
}

/** Where to send the user after a successful sign-in or email confirmation. */
export function getPostAuthRedirectPath(
  email: string | null | undefined,
  nextPath?: string | null
): string {
  if (isAdminEmail(email)) {
    return '/admin'
  }

  if (nextPath?.startsWith('/admin')) {
    return '/admin/login?error=not_admin'
  }

  if (nextPath?.startsWith('/')) {
    return nextPath
  }

  return '/customer'
}

export function isEmailNotConfirmedError(error: AuthError | Error | null | undefined): boolean {
  if (!error) return false
  const message = error.message.toLowerCase()
  const code = 'code' in error ? String((error as AuthError).code ?? '').toLowerCase() : ''
  return (
    code === 'email_not_confirmed' ||
    message.includes('email not confirmed') ||
    message.includes('email not verified')
  )
}

export function getAuthErrorMessage(error: AuthError | Error | null | undefined): string {
  if (!error) return 'Something went wrong. Please try again.'

  if (isEmailNotConfirmedError(error)) {
    return 'Your email address has not been verified yet. Check your inbox for the confirmation link, then try signing in again.'
  }

  const message = error.message.toLowerCase()
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Incorrect email or password. Please check your details and try again.'
  }

  return error.message || 'Something went wrong. Please try again.'
}

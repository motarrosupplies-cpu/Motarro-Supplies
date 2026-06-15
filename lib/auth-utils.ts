import type { AuthError } from '@supabase/supabase-js'

export function getAuthCallbackUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.motarro.co.za'}/auth/callback`
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

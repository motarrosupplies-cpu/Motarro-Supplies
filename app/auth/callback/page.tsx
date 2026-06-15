'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Confirming your account…')

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const errorDescription = url.searchParams.get('error_description')

      if (errorDescription) {
        setMessage('Verification link is invalid or has expired.')
        setTimeout(() => router.replace('/login?error=verification_failed'), 2500)
        return
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setMessage('Could not verify your email. Please sign in and resend the confirmation email.')
          setTimeout(() => router.replace('/login?error=verification_failed'), 2500)
          return
        }
        router.replace('/customer')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/customer')
        return
      }

      router.replace('/login')
    }

    void handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

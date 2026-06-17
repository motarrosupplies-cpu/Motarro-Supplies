'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { verifyAdminSession } from '@/lib/auth/verifyAdminClient'

type AuthState = 'checking' | 'authorized'

interface AdminAuthGuardProps {
  children: ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>('checking')

  useEffect(() => {
    let active = true

    const verifyAccess = async (accessToken: string | null | undefined) => {
      if (!accessToken) {
        router.replace('/admin/login')
        return
      }

      const isAdmin = await verifyAdminSession(accessToken)
      if (!active) return

      if (!isAdmin) {
        router.replace('/admin/login?error=not_admin')
        return
      }

      setAuthState('authorized')
    }

    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (!active) return
      if (error || !session) {
        router.replace('/admin/login')
        return
      }

      await verifyAccess(session.access_token)
    }

    void checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/admin/login')
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void verifyAccess(session.access_token)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router])

  if (authState !== 'authorized') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Checking admin access" />
      </div>
    )
  }

  return <>{children}</>
}

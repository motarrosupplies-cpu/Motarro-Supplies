'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { isAdminEmail } from '@/lib/brand'

type AuthState = 'checking' | 'authorized'

interface AdminAuthGuardProps {
  children: ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>('checking')

  useEffect(() => {
    let active = true

    const verifyAccess = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (!active) return

      if (error || !user) {
        router.replace('/admin/login')
        return
      }

      if (!isAdminEmail(user.email)) {
        router.replace('/customer')
        return
      }

      setAuthState('authorized')
    }

    void verifyAccess()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      if (event === 'SIGNED_OUT' || !session?.user) {
        router.replace('/admin/login')
        return
      }

      if (!isAdminEmail(session.user.email)) {
        router.replace('/customer')
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

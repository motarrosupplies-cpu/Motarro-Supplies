'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import { getAuthCallbackUrl } from '@/lib/auth-utils';
import { verifyAdminSession } from '@/lib/auth/verifyAdminClient';

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notAdmin = searchParams.get('error') === 'not_admin';

  useEffect(() => {
    const redirectIfAuthorized = async (accessToken: string | null | undefined) => {
      if (!accessToken) return;

      const isAdmin = await verifyAdminSession(accessToken);
      if (!isAdmin) {
        router.replace('/admin/login?error=not_admin');
        return;
      }

      router.replace('/admin');
    };

    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) return;
      await redirectIfAuthorized(session.access_token);
    };

    void checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        void redirectIfAuthorized(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-[350px]">
        {notAdmin ? (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            This account does not have admin access. Set{' '}
            <code className="text-xs">GUEST_AUTH_EMAIL</code> or{' '}
            <code className="text-xs">NEXT_PUBLIC_GUEST_AUTH_EMAIL</code> to{' '}
            <code className="text-xs">guest@email.com</code> in Vercel, then sign in again.
          </p>
        ) : null}
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="dark"
          redirectTo={getAuthCallbackUrl('/admin')}
          onlyThirdPartyProviders={false}
        />
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import { getAuthCallbackUrl, getPostAuthRedirectPath } from '@/lib/auth-utils';

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notAdmin = searchParams.get('error') === 'not_admin';

  useEffect(() => {
    const redirectIfAuthorized = (email: string | undefined) => {
      if (!email) return;
      router.replace(getPostAuthRedirectPath(email, '/admin'));
    };

    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) return;
      redirectIfAuthorized(user.email);
    };

    void checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        redirectIfAuthorized(session.user.email);
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
            This account does not have admin access. Ask the site owner to add your email to{' '}
            <code className="text-xs">NEXT_PUBLIC_ADMIN_EMAILS</code> in Vercel, then sign in again.
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

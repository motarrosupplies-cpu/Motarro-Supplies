'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import { getAuthCallbackUrl } from '@/lib/auth-utils';
import { isAdminEmail } from '@/lib/brand';

export default function AdminLogin() {
  const router = useRouter();

  useEffect(() => {
    const redirectIfAuthorized = (email: string | undefined) => {
      if (!email) return;
      if (isAdminEmail(email)) {
        router.replace('/admin');
      } else {
        router.replace('/customer');
      }
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
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="dark"
          redirectTo={getAuthCallbackUrl()}
          onlyThirdPartyProviders={false}
        />
      </div>
    </div>
  );
}

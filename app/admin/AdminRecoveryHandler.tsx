"use client";

import { useSearchParams } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import { usePasswordRecoveryDetect } from '@/lib/hooks/use-password-recovery-detect';

export default function AdminRecoveryHandler() {
  const searchParams = useSearchParams();
  const isRecovery = usePasswordRecoveryDetect(searchParams.get('type'));

  if (!isRecovery) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-[350px]">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="dark"
        />
      </div>
    </div>
  );
} 
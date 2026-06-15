'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function urlHasRecoveryInHash(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = window.location.hash || '';
  const h = raw.startsWith('#') ? raw.slice(1) : raw;
  return new URLSearchParams(h).get('type') === 'recovery';
}

/**
 * True when the user arrived from a Supabase password-reset email.
 * Recovery tokens are usually in the URL hash (#access_token=...&type=recovery),
 * which Next.js useSearchParams() does not expose — so we also listen for
 * PASSWORD_RECOVERY and parse the hash on the client.
 */
export function usePasswordRecoveryDetect(queryType: string | null) {
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (queryType === 'recovery') {
      setIsRecovery(true);
    }
    if (urlHasRecoveryInHash()) {
      setIsRecovery(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryType]);

  return isRecovery;
}

import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
  SUPABASE_ENV_ERROR,
} from '@/lib/supabase-env';

export { isSupabaseConfigured } from '@/lib/supabase-env';

let _supabase: ReturnType<typeof createClient> | undefined;
let _supabaseCacheKey: string | undefined;

let _supabaseAdmin: ReturnType<typeof createClient> | null | undefined;
let _supabaseAdminCacheKey: string | undefined;

function getSupabaseClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(SUPABASE_ENV_ERROR);
  }

  const cacheKey = `${supabaseUrl}:${supabaseAnonKey.slice(0, 16)}`;
  if (!_supabase || _supabaseCacheKey !== cacheKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    _supabaseCacheKey = cacheKey;
  }
  return _supabase;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

function getSupabaseAdmin() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseServiceKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  const cacheKey = `${supabaseUrl}:${supabaseServiceKey.slice(0, 16)}`;
  if (!_supabaseAdmin || _supabaseAdminCacheKey !== cacheKey) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    _supabaseAdminCacheKey = cacheKey;
  }
  return _supabaseAdmin;
}

export function getSupabaseAdminClient() {
  return getSupabaseAdmin();
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    if (!client) return null;
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

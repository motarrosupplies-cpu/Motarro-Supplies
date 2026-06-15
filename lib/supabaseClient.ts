import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
  SUPABASE_ENV_ERROR,
} from '@/lib/supabase-env';

export { isSupabaseConfigured } from '@/lib/supabase-env';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();
const supabaseServiceKey = getSupabaseServiceRoleKey();

let _supabase: ReturnType<typeof createClient> | undefined;
let _supabaseAdmin: ReturnType<typeof createClient> | null | undefined;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(SUPABASE_ENV_ERROR);
  }

  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
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
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
}

export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? new Proxy({} as ReturnType<typeof createClient>, {
        get(_target, prop) {
          const client = getSupabaseAdmin();
          if (!client) return null;
          const value = (client as any)[prop];
          return typeof value === 'function' ? value.bind(client) : value;
        },
      })
    : null;

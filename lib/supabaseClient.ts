import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize clients only if environment variables are available
// This allows the build to proceed even if env vars are not set during build time
// The clients will be properly initialized at runtime when env vars are available
let _supabase: ReturnType<typeof createClient> | undefined;
let _supabaseAdmin: ReturnType<typeof createClient> | null | undefined;

// Client for authenticated operations (uses anon key)
// Use a getter function to ensure proper initialization at runtime
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return _supabase;
}

// Export as a proxy to ensure it's initialized when accessed
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Service client for admin operations (bypasses RLS)
function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabaseAdmin;
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? new Proxy({} as ReturnType<typeof createClient>, {
      get(_target, prop) {
        const client = getSupabaseAdmin();
        if (!client) return null;
        const value = (client as any)[prop];
        return typeof value === 'function' ? value.bind(client) : value;
      }
    })
  : null;
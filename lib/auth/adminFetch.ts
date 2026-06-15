import { supabase } from "@/lib/supabaseClient";

/** Resolve a fresh Supabase access token for admin API calls. */
export async function getAdminAccessToken(): Promise<string | null> {
  const { data: refreshed, error: refreshError } =
    await supabase.auth.refreshSession();

  if (!refreshError && refreshed.session?.access_token) {
    return refreshed.session.access_token;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

/** Attach the current admin session token for protected API routes. */
export async function getAdminAuthHeaders(
  extra: Record<string, string> = {}
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };

  const accessToken = await getAdminAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

import { isAdminEmailOnServer } from "@/lib/brand";

type AdminAuthSuccess = { ok: true; userId: string; email: string };
type AdminAuthFailure = { ok: false; status: number; error: string; code: "auth" };

export async function verifyAdminAccessToken(
  token: string | null | undefined
): Promise<AdminAuthSuccess | AdminAuthFailure> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized",
      code: "auth",
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      status: 503,
      error: "Server misconfigured",
      code: "auth",
    };
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${trimmed}`,
      apikey: supabaseAnonKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      status: 401,
      error: "Session expired. Sign in to admin again.",
      code: "auth",
    };
  }

  const user = (await response.json()) as { id?: string; email?: string };
  if (!user?.id || !user?.email) {
    return {
      ok: false,
      status: 401,
      error: "Session expired. Sign in to admin again.",
      code: "auth",
    };
  }

  if (!isAdminEmailOnServer(user.email)) {
    return {
      ok: false,
      status: 403,
      error: "This account does not have admin access.",
      code: "auth",
    };
  }

  return { ok: true, userId: user.id, email: user.email };
}

export async function verifyAdminRequest(
  request: Request,
  bodyToken?: string | null
): Promise<AdminAuthSuccess | AdminAuthFailure> {
  const authHeader = request.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  return verifyAdminAccessToken(headerToken || bodyToken);
}

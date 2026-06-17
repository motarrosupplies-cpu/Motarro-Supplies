/** Client-side admin check via server (reads GUEST_AUTH_EMAIL, ADMIN_EMAILS, etc.). */
export async function verifyAdminSession(accessToken: string | null | undefined): Promise<boolean> {
  const token = accessToken?.trim()
  if (!token) return false

  try {
    const res = await fetch('/api/admin/session', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

import { verifyAdminAccessToken } from '@/lib/auth/verifyAdminApi'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null

  const result = await verifyAdminAccessToken(token)
  if (!result.ok) {
    return Response.json(
      { isAdmin: false, error: result.error },
      { status: result.status }
    )
  }

  return Response.json({ isAdmin: true, email: result.email })
}

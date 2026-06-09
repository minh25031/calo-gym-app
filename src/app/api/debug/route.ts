import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const results: any = {}

  // Check environment
  results.env = {
    hasAZURE: !!process.env.AZURE_SQL_URL,
    hasDATABASE: !!process.env.DATABASE_URL,
    authURL: process.env.AUTH_URL?.slice(0, 50),
    hasGoogleID: !!process.env.AUTH_GOOGLE_ID,
    hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
    googleID: process.env.AUTH_GOOGLE_ID?.slice(0, 30),
  }

  // Test database connection
  try {
    const start = Date.now()
    const user = await prisma.user.findFirst({ select: { id: true, email: true } })
    results.db = { ok: true, ms: Date.now() - start, user: user?.email }
  } catch (e: any) {
    results.db = { ok: false, error: e.message, code: e.code }
  }

  // Test auth session
  try {
    const session = await auth()
    results.auth = { ok: true, hasSession: !!session?.user }
  } catch (e: any) {
    results.auth = { ok: false, error: e.message }
  }

  return Response.json(results)
}

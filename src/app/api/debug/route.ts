import { prisma } from "@/lib/prisma"

export async function GET() {
  const results: any = {}

  // Check environment
  results.env = {
    hasAZURE: !!process.env.AZURE_SQL_URL,
    hasDATABASE: !!process.env.DATABASE_URL,
    authURL: process.env.AUTH_URL?.slice(0, 50),
    hasGoogleID: !!process.env.AUTH_GOOGLE_ID,
  }

  // Test database connection
  try {
    const start = Date.now()
    const user = await prisma.user.findFirst({ select: { id: true, email: true } })
    results.db = { ok: true, ms: Date.now() - start, user: user?.email }
  } catch (e: any) {
    results.db = { ok: false, error: e.message, code: e.code }
  }

  return Response.json(results)
}

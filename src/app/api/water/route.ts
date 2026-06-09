import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const waters = await prisma.waterEntry.findMany({
    where: { userId: session.user.id, createdAt: { gte: today } },
    orderBy: { createdAt: "desc" },
  })

  const total = waters.reduce((s, w) => s + w.amount, 0)
  return Response.json({ glasses: waters.length, totalMl: total })
}

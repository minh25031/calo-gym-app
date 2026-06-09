import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const templates = await prisma.workoutTemplate.findMany({
    where: { userId: session.user.id },
    include: { exercises: true },
    orderBy: { createdAt: "desc" },
  })

  const logs = await prisma.workoutLog.findMany({
    where: { userId: session.user.id },
    include: { template: true, exercises: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return Response.json({ templates, logs })
}

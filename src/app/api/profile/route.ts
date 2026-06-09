import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [user, foodCount, workoutCount, postCount, followersCount, followingCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, image: true, createdAt: true },
      }),
      prisma.foodEntry.count({ where: { userId: session.user.id } }),
      prisma.workoutLog.count({ where: { userId: session.user.id } }),
      prisma.post.count({ where: { userId: session.user.id } }),
      prisma.follow.count({ where: { followingId: session.user.id } }),
      prisma.follow.count({ where: { followerId: session.user.id } }),
    ])

  return Response.json({
    ...user,
    stats: { foodCount, workoutCount, postCount, followersCount, followingCount },
  })
}

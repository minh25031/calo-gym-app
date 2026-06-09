import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { groupId: true, role: true } })
  const userGroupId = currentUser?.groupId

  const users = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      ...(currentUser?.role !== "admin" && userGroupId ? { groupId: userGroupId } : {}),
    },
    select: {
      id: true, name: true, image: true,
      followers: { where: { followerId: session.user.id }, select: { id: true } },
      _count: { select: { followers: true, posts: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(
    users.map((u) => ({
      ...u,
      isFollowing: u.followers.length > 0,
      followers: undefined,
    }))
  )
}

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { groupId: true } })
  const userGroupId = currentUser?.groupId

  // Get IDs of followed users + self
  const follows = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  })
  const followingIds = follows.map((f) => f.followingId)
  const visibleUserIds = [...followingIds, session.user.id]

  // If user has a group, only show posts from that group
  const userFilter = userGroupId
    ? await prisma.user.findMany({ where: { groupId: userGroupId }, select: { id: true } })
    : null

  const groupUserIds = userFilter ? userFilter.map((u) => u.id) : null

  const posts = await prisma.post.findMany({
    where: {
      userId: {
        in: visibleUserIds.filter((id) => !groupUserIds || groupUserIds.includes(id)),
      },
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      food: true,
      workout: { include: { template: true, exercises: true } },
      likes: { select: { userId: true } },
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
        take: 5,
      },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  return Response.json(posts)
}

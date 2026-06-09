import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/mail"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (user?.role !== "admin") throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
  return session.user.id
}

export async function GET(req: Request) {
  await checkAdmin()
  const url = new URL(req.url)
  const resource = url.searchParams.get("resource")

  // System stats + groups + users
  if (!resource || resource === "all") {
    const [users, groups, stats] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, groupId: true, emailVerified: true, gender: true, weight: true, height: true, createdAt: true, _count: { select: { posts: true, foods: true, workouts: true, followers: true, following: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.group.findMany({ include: { _count: { select: { users: true } } } }),
      Promise.all([prisma.user.count(), prisma.foodEntry.count(), prisma.workoutLog.count(), prisma.post.count(), prisma.waterEntry.count(), prisma.progressPhoto.count(), prisma.workoutTemplate.count()]),
    ])
    return Response.json({ users, groups, stats: { users: stats[0], foods: stats[1], workouts: stats[2], posts: stats[3], waters: stats[4], photos: stats[5], templates: stats[6] } })
  }

  // All food entries
  if (resource === "foods") {
    const foods = await prisma.foodEntry.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    return Response.json(foods)
  }

  // All posts
  if (resource === "posts") {
    const posts = await prisma.post.findMany({
      include: { user: { select: { name: true, email: true } }, _count: { select: { likes: true, comments: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    return Response.json(posts)
  }

  // All workout templates
  if (resource === "templates") {
    const templates = await prisma.workoutTemplate.findMany({
      include: { user: { select: { name: true } }, exercises: true, _count: { select: { logs: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return Response.json(templates)
  }

  // All progress photos
  if (resource === "photos") {
    const photos = await prisma.progressPhoto.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    return Response.json(photos)
  }

  return Response.json({ error: "Unknown resource" }, { status: 400 })
}

export async function DELETE(req: Request) {
  await checkAdmin()
  const body = await req.json()
  const { userId, foodId, postId, templateId } = body

  if (userId) {
    const adminSession = await auth()
    if (userId === adminSession?.user?.id) return Response.json({ error: "Không thể xoá chính mình" }, { status: 400 })
    await prisma.user.delete({ where: { id: userId } })
    return Response.json({ success: true })
  }

  if (foodId) {
    await prisma.foodEntry.delete({ where: { id: foodId } })
    return Response.json({ success: true })
  }

  if (postId) {
    await prisma.post.delete({ where: { id: postId } })
    return Response.json({ success: true })
  }

  if (templateId) {
    await prisma.workoutTemplate.delete({ where: { id: templateId } })
    return Response.json({ success: true })
  }

  if (body.photoId) {
    await prisma.progressPhoto.delete({ where: { id: body.photoId } })
    return Response.json({ success: true })
  }

  return Response.json({ error: "Thiếu ID" }, { status: 400 })
}

export async function PATCH(req: Request) {
  await checkAdmin()
  const { userId, role, groupId } = await req.json()
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 })
  const data: any = {}
  if (role !== undefined) data.role = role
  if (groupId !== undefined) data.groupId = groupId || null
  await prisma.user.update({ where: { id: userId }, data })
  return Response.json({ success: true })
}

export async function POST(req: Request) {
  await checkAdmin()
  const body = await req.json()
  const { action, groupName, groupId } = body

  if (action === "create-group") {
    if (!groupName) return Response.json({ error: "Tên nhóm không được trống" }, { status: 400 })
    const group = await prisma.group.create({ data: { name: groupName } })
    return Response.json({ success: true, group })
  }

  if (action === "delete-group") {
    if (!groupId) return Response.json({ error: "Missing groupId" }, { status: 400 })
    await prisma.user.updateMany({ where: { groupId }, data: { groupId: null } })
    await prisma.group.delete({ where: { id: groupId } })
    return Response.json({ success: true })
  }

  if (action === "verify-user") {
    const userId = body.userId
    if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 })
    await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } })
    await prisma.verificationEmail.deleteMany({ where: { userId } })
    return Response.json({ success: true })
  }

  if (action === "resend-verification") {
    const userId = body.userId
    if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
    if (!user) return Response.json({ error: "User not found" }, { status: 400 })

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationEmail.deleteMany({ where: { userId } })
    await prisma.verificationEmail.create({ data: { userId, token, expires } })

    const mailResult = await sendVerificationEmail(user.email, token, user.name || "User")
    return Response.json(mailResult)
  }

  if (action === "cleanup-old-data") {
    const days = 60 // delete data older than 60 days
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days)
    const deleted = await Promise.all([
      prisma.waterEntry.deleteMany({ where: { createdAt: { lt: cutoff } } }),
      prisma.workoutLog.updateMany({ where: { createdAt: { lt: cutoff } }, data: { note: null } }),
    ])
    return Response.json({ success: true, deleted: deleted[0].count })
  }

  return Response.json({ error: "Unknown action" }, { status: 400 })
}

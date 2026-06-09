"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "./prisma"
import { auth, signIn, signOut } from "./auth"
import { sendVerificationEmail } from "./mail"

export async function register(state: { error?: string; success?: string; message?: string } | undefined, formData: FormData): Promise<{ error?: string; success?: string; message?: string } | undefined> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "Vui lòng điền đầy đủ thông tin" }
  }

  if (password.length < 6) {
    return { error: "Mật khẩu ít nhất 6 ký tự" }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "Email đã được sử dụng" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const token = crypto.randomBytes(32).toString("hex")

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  })

  await prisma.verificationEmail.create({
    data: { userId: user.id, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  })

  await sendVerificationEmail(email, token, name)
  await signOut({ redirect: false })

  return { message: "Tài khoản đã tạo! Vui lòng kiểm tra email để xác thực." }
}

export async function login(state: { error?: string } | undefined, formData: FormData): Promise<{ error?: string } | undefined> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Vui lòng nhập email và mật khẩu" }
  }

  // Check if email is verified
  const user = await prisma.user.findUnique({ where: { email } })
  if (user && !user.emailVerified) {
    return { error: "Email chưa được xác thực. Vui lòng kiểm tra hộp thư hoặc liên hệ admin." }
  }

  try {
    await signIn("credentials", { email, password, redirect: false })
  } catch {
    return { error: "Email hoặc mật khẩu không đúng" }
  }
  redirect("/dashboard")
}

export async function logout() {
  await signOut({ redirect: false })
  redirect("/login")
}

export async function addFoodEntry(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const calories = parseInt(formData.get("calories") as string)
  const protein = parseFloat(formData.get("protein") as string) || 0
  const carbs = parseFloat(formData.get("carbs") as string) || 0
  const fat = parseFloat(formData.get("fat") as string) || 0
  const imageUrl = formData.get("imageUrl") as string
  const note = formData.get("note") as string

  if (!name || isNaN(calories)) return { error: "Thiếu thông tin" }

  await prisma.foodEntry.create({
    data: {
      userId: session.user.id,
      name,
      calories,
      protein,
      carbs,
      fat,
      imageUrl: imageUrl || null,
      note: note || null,
    },
  })

  revalidatePath("/food")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteFoodEntry(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  const entry = await prisma.foodEntry.findUnique({ where: { id } })
  if (entry && entry.userId === session.user.id) {
    await prisma.foodEntry.delete({ where: { id } })
  }
  revalidatePath("/food")
  revalidatePath("/dashboard")
}

export async function deleteWorkoutTemplate(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  const template = await prisma.workoutTemplate.findUnique({ where: { id } })
  if (template && template.userId === session.user.id) {
    await prisma.workoutTemplate.delete({ where: { id } })
  }
  revalidatePath("/workout")
}

export async function deleteWorkoutLog(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  const log = await prisma.workoutLog.findUnique({ where: { id } })
  if (log && log.userId === session.user.id) {
    await prisma.workoutLog.delete({ where: { id } })
  }
  revalidatePath("/workout")
}

export async function addWorkoutTemplate(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const note = formData.get("note") as string
  const exercisesJson = formData.get("exercises") as string

  if (!name) return { error: "Thiếu tên bài tập" }

  const exercises = JSON.parse(exercisesJson || "[]")

  await prisma.workoutTemplate.create({
    data: {
      userId: session.user.id,
      name,
      note: note || null,
      exercises: {
        create: exercises.map((e: { name: string; sets: number; reps: number; weight?: number }) => ({
          name: e.name,
          sets: e.sets || 4,
          reps: e.reps || 10,
          weight: e.weight || null,
        })),
      },
    },
  })

  revalidatePath("/workout")
  return { success: true }
}

export async function logWorkout(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const templateId = formData.get("templateId") as string
  const note = formData.get("note") as string
  const exercisesJson = formData.get("exercises") as string

  const exercises = JSON.parse(exercisesJson || "[]")

  if (exercises.length === 0) return { error: "Chưa có bài tập nào" }

  await prisma.workoutLog.create({
    data: {
      userId: session.user.id,
      templateId: templateId || null,
      note: note || null,
      exercises: {
        create: exercises.map((e: { name: string; sets: number; reps: number; weight?: number }) => ({
          name: e.name,
          sets: e.sets || 0,
          reps: e.reps || 0,
          weight: e.weight || null,
        })),
      },
    },
  })

  revalidatePath("/workout")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function createPost(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const type = formData.get("type") as string
  const content = formData.get("content") as string
  const imageUrl = formData.get("imageUrl") as string
  const foodId = formData.get("foodId") as string
  const workoutId = formData.get("workoutId") as string

  await prisma.post.create({
    data: {
      userId: session.user.id,
      type: type || "food",
      content: content || null,
      imageUrl: imageUrl || null,
      foodId: foodId || null,
      workoutId: workoutId || null,
    },
  })

  revalidatePath("/feed")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function toggleLike(postId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  })

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
  } else {
    await prisma.like.create({
      data: { userId: session.user.id, postId },
    })
  }

  revalidatePath("/feed")
}

export async function addComment(postId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  if (!content.trim()) return { error: "Nội dung trống" }

  await prisma.comment.create({
    data: { userId: session.user.id, postId, content },
  })

  revalidatePath("/feed")
}

export async function followUser(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  })

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } })
  } else {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: targetUserId },
    })
  }

  revalidatePath("/friends")
  revalidatePath("/profile")
}

export async function deletePost(postId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post || post.userId !== session.user.id) return { error: "Unauthorized" }

  await prisma.post.delete({ where: { id: postId } })
  revalidatePath("/feed")
  revalidatePath("/dashboard")
}

export async function saveBodyMetrics(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const gender = formData.get("gender") as string
  const age = parseInt(formData.get("age") as string)
  const weight = parseFloat(formData.get("weight") as string)
  const height = parseFloat(formData.get("height") as string)
  const activityLevel = formData.get("activityLevel") as string
  const goal = formData.get("goal") as string

  if (!weight || !height) return { error: "Thiếu cân nặng hoặc chiều cao" }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { gender, age, weight, height, activityLevel, goal },
  })

  return { success: true }
}

export async function getBodyMetrics() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { gender: true, age: true, weight: true, height: true, activityLevel: true, goal: true },
  })

  return user
}

export async function addWater(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return

  const amount = parseInt(formData.get("amount") as string) || 200
  await prisma.waterEntry.create({
    data: { userId: session.user.id, amount },
  })
  revalidatePath("/dashboard")
}

export async function removeWater() {
  const session = await auth()
  if (!session?.user?.id) return

  const today = new Date(); today.setHours(0,0,0,0)
  const latest = await prisma.waterEntry.findFirst({
    where: { userId: session.user.id, createdAt: { gte: today } },
    orderBy: { createdAt: "desc" },
  })
  if (latest) await prisma.waterEntry.delete({ where: { id: latest.id } })
  revalidatePath("/dashboard")
}

export async function saveFavoriteFood(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const calories = parseInt(formData.get("calories") as string)
  const protein = parseFloat(formData.get("protein") as string) || 0
  const carbs = parseFloat(formData.get("carbs") as string) || 0
  const fat = parseFloat(formData.get("fat") as string) || 0
  const imageUrl = formData.get("imageUrl") as string

  await prisma.favoriteFood.upsert({
    where: { userId_name: { userId: session.user.id, name } },
    update: { calories, protein, carbs, fat, imageUrl: imageUrl || null },
    create: { userId: session.user.id, name, calories, protein, carbs, fat, imageUrl: imageUrl || null },
  })

  revalidatePath("/food")
  return { success: true }
}

export async function addProgressPhoto(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const imageUrl = formData.get("imageUrl") as string
  const note = formData.get("note") as string

  if (!imageUrl) return { error: "Thiếu ảnh" }

  await prisma.progressPhoto.create({
    data: { userId: session.user.id, imageUrl, note: note || null },
  })

  revalidatePath("/progress")
  return { success: true }
}

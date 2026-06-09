import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./client"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayFoods, todayWorkouts, todayWaters, userProfile] = await Promise.all([
    prisma.foodEntry.findMany({ where: { userId: session.user.id, createdAt: { gte: today } }, orderBy: { createdAt: "desc" } }),
    prisma.workoutLog.findMany({ where: { userId: session.user.id, createdAt: { gte: today } } }),
    prisma.waterEntry.findMany({ where: { userId: session.user.id, createdAt: { gte: today } } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { weight: true, height: true, gender: true, age: true, activityLevel: true, goal: true, role: true } }),
  ])

  const totalCal = todayFoods.reduce((s, f) => s + f.calories, 0)
  const totalProtein = todayFoods.reduce((s, f) => s + f.protein, 0)
  const totalCarbs = todayFoods.reduce((s, f) => s + f.carbs, 0)
  const totalFat = todayFoods.reduce((s, f) => s + f.fat, 0)
  const totalWater = todayWaters.reduce((s, w) => s + w.amount, 0)
  const needsBody = !userProfile?.weight

  let tdee = 2200
  let tgProtein = 120, tgCarbs = 250, tgFat = 60
  if (userProfile?.weight && userProfile?.height && userProfile?.gender) {
    const w = userProfile.weight, h = userProfile.height, a = userProfile.age || 25
    let bmr = userProfile.gender === "male" ? 88.362 + 13.397*w + 4.799*h - 5.677*a : 447.593 + 9.247*w + 3.098*h - 4.33*a
    const m: Record<string,number> = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 }
    tdee = Math.round(bmr * (m[userProfile.activityLevel||"moderate"]||1.55))
    if (userProfile.goal === "lose") tdee -= 400; else if (userProfile.goal === "gain") tdee += 400
    tgProtein = Math.round(w * 2)
    tgFat = Math.round(tdee * 0.25 / 9)
    tgCarbs = Math.round((tdee - tgProtein*4 - tgFat*9) / 4)
  }

  // Group foods by meal type
  const mealGroups: Record<string, typeof todayFoods> = { "Sáng": [], "Trưa": [], "Tối": [], "Phụ": [], "Khác": [] }
  todayFoods.forEach((f) => {
    const n = (f.note || "").toLowerCase()
    if (n.includes("sáng") || n.includes("breakfast")) mealGroups["Sáng"].push(f)
    else if (n.includes("trưa") || n.includes("lunch")) mealGroups["Trưa"].push(f)
    else if (n.includes("tối") || n.includes("dinner") || n.includes("chiều")) mealGroups["Tối"].push(f)
    else if (n.includes("phụ") || n.includes("snack") || n.includes("xế")) mealGroups["Phụ"].push(f)
    else mealGroups["Khác"].push(f)
  })

  return (
    <DashboardClient
      userName={session.user.name}
      totalCal={totalCal} totalProtein={totalProtein} totalCarbs={totalCarbs} totalFat={totalFat}
      totalWater={totalWater} tdee={tdee}
      tgProtein={tgProtein} tgCarbs={tgCarbs} tgFat={tgFat}
      foodsCount={todayFoods.length} workoutCount={todayWorkouts.length}
      needsBody={needsBody} userProfile={userProfile}
      isAdmin={userProfile?.role === "admin"}
      mealGroups={mealGroups}
    />
  )
}

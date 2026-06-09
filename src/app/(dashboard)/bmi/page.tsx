"use client"

import { useState, useEffect, useRef } from "react"
import { saveBodyMetrics } from "@/lib/actions"

type Gender = "male" | "female"
type Goal = "lose" | "maintain" | "gain"
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: "Ít vận động (ngồi nhiều)",
  light: "Nhẹ (1-3 ngày/tuần)",
  moderate: "Trung bình (3-5 ngày/tuần)",
  active: "Năng động (6-7 ngày/tuần)",
  very_active: "Rất năng động (2x/ngày)",
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

function calculateBMR(gender: Gender, weight: number, height: number, age: number) {
  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
  }
  return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
}

function calculateBMI(weight: number, height: number) {
  const h = height / 100
  return weight / (h * h)
}

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: "Thiếu cân", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" }
  if (bmi < 25) return { label: "Bình thường", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" }
  if (bmi < 30) return { label: "Thừa cân", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" }
  return { label: "Béo phì", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" }
}

function calculateMacro(totalCal: number, weight: number, goal: Goal) {
  let cal = totalCal
  if (goal === "lose") cal -= 400
  else if (goal === "gain") cal += 400

  const protein = Math.round(weight * 2)
  const fat = Math.round((cal * 0.25) / 9)
  const carbs = Math.round((cal - protein * 4 - fat * 9) / 4)

  return { calories: Math.round(cal), protein, fat, carbs }
}

export default function BMIPage() {
  const loadedRef = useRef(false)
  const [loading, setLoading] = useState(true)
  const [gender, setGender] = useState<Gender>("male")
  const [age, setAge] = useState("25")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [activity, setActivity] = useState<ActivityLevel>("moderate")
  const [goal, setGoal] = useState<Goal>("maintain")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (loadedRef.current) { setLoading(false); return }
    loadedRef.current = true
    fetch("/api/bmi")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.weight) {
          setGender(data.gender || "male")
          setAge(String(data.age || 25))
          setWeight(String(data.weight))
          setHeight(String(data.height))
          setActivity(data.activityLevel || "moderate")
          setGoal(data.goal || "maintain")
          setSaved(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    const form = new FormData()
    form.set("gender", gender)
    form.set("age", age)
    form.set("weight", weight)
    form.set("height", height)
    form.set("activityLevel", activity)
    form.set("goal", goal)
    await saveBodyMetrics(form)
    setSaved(true)
  }

  const w = parseFloat(weight)
  const h = parseFloat(height)
  const a = parseInt(age) || 25
  const canCalculate = w > 0 && h > 0

  let bmi: number | null = null
  let bmiCategory = null
  let bmr: number | null = null
  let tdee: number | null = null
  let macro = null

  if (canCalculate) {
    bmi = Math.round(calculateBMI(w, h) * 10) / 10
    bmiCategory = getBMICategory(bmi)
    bmr = Math.round(calculateBMR(gender, w, h, a))
    tdee = Math.round(bmr * activityMultipliers[activity])
    macro = calculateMacro(tdee, w, goal)
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tính BMI & Macro</h2>
          <p className="text-sm text-muted-foreground">
            {saved ? "Thông tin đã lưu. Có thể sửa bên dưới." : "Nhập thông tin lần đầu để lưu vào hệ thống"}
          </p>
        </div>
        {saved && (
          <span className="text-xs bg-green-500/15 text-green-400 px-2 py-1 rounded-full border border-green-500/20">✓ Đã lưu</span>
        )}
      </div>

      <form
        action={handleSave}
        className="rounded-xl border p-4 space-y-4"
      >
        {/* Gender */}
        <div>
          <label className="text-sm font-medium">Giới tính</label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setGender("male")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  gender === "male" ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--text-muted)]"
                }`}
            >
              ♂ Nam
            </button>
            <button
              type="button"
              onClick={() => setGender("female")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                gender === "female" ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              ♀ Nữ
            </button>
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="text-sm font-medium">Tuổi</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min={10}
            max={100}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm mt-1"
          />
        </div>

        {/* Weight & Height */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Cân nặng (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="VD: 65"
              step="0.1"
              required
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Chiều cao (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="VD: 170"
              step="0.1"
              required
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm mt-1"
            />
          </div>
        </div>

        {/* Activity */}
        <div>
          <label className="text-sm font-medium">Mức độ vận động</label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm mt-1"
          >
            {Object.entries(activityLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Goal */}
        <div>
          <label className="text-sm font-medium">Mục tiêu</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {([
              { key: "lose" as Goal, label: "Giảm cân", emoji: "⬇️" },
              { key: "maintain" as Goal, label: "Duy trì", emoji: "➡️" },
              { key: "gain" as Goal, label: "Tăng cơ", emoji: "⬆️" },
            ]).map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGoal(g.key)}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                  goal === g.key ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--text-muted)]"
                }`}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canCalculate}
          className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-medium disabled:opacity-50 transition-colors"
        >
          {saved ? "Cập nhật & Tính toán" : "Lưu & Tính toán"}
        </button>
      </form>

      {canCalculate && macro && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* BMI */}
          <div className={`rounded-xl border p-4 ${bmiCategory?.bg}`}>
            <h3 className="font-semibold mb-2">Chỉ số BMI</h3>
            <div className="text-3xl font-bold">{bmi}</div>
            <div className={`text-sm font-medium ${bmiCategory?.color}`}>
              {bmiCategory?.label}
            </div>

            <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-yellow-400 via-green-400 via-orange-400 to-red-500 relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-foreground shadow transition-all"
                style={{
                  left: `${Math.min(Math.max(((bmi || 20) - 13) / (35 - 13) * 100, 0), 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Thiếu cân</span>
              <span>B.thường</span>
              <span>Thừa cân</span>
              <span>Béo phì</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
            </div>
          </div>

          {/* Calo */}
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold mb-2">Nhu cầu calo</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary p-3">
                <div className="text-xs text-muted-foreground">BMR (chuyển hoá cơ bản)</div>
                <div className="text-lg font-bold">{bmr} kcal</div>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <div className="text-xs text-muted-foreground">TDEE (vận động)</div>
                <div className="text-lg font-bold">{macro.calories} kcal</div>
              </div>
            </div>
          </div>

          {/* Macro */}
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold mb-3">Macro khuyến nghị / ngày</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center">
                <div className="text-xs text-red-400 font-medium">Đạm (Protein)</div>
                <div className="text-xl font-bold text-red-400">{macro.protein}g</div>
                <div className="text-xs text-red-400/70">{Math.round(macro.protein * 4 / macro.calories * 100)}%</div>
              </div>
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-center">
                <div className="text-xs text-blue-400 font-medium">Bột (Carbs)</div>
                <div className="text-xl font-bold text-blue-400">{macro.carbs}g</div>
                <div className="text-xs text-blue-400/70">{Math.round(macro.carbs * 4 / macro.calories * 100)}%</div>
              </div>
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                <div className="text-xs text-amber-400 font-medium">Béo (Fat)</div>
                <div className="text-xl font-bold text-amber-400">{macro.fat}g</div>
                <div className="text-xs text-amber-400/70">{Math.round(macro.fat * 9 / macro.calories * 100)}%</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-4 text-sm">
            <h4 className="font-semibold mb-1">Gợi ý cho bạn</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Nạp khoảng <strong className="text-foreground">{macro.calories} kcal</strong> mỗi ngày để {goal === "lose" ? "giảm" : goal === "gain" ? "tăng" : "duy trì"} cân</li>
              <li>• Cần <strong className="text-foreground">{macro.protein}g</strong> protein (~{Math.round(macro.protein / w * 10) / 10}g/kg) để bảo vệ cơ bắp</li>
              {goal === "lose" && <li>• Kết hợp tập gym + cardio để đốt mỡ hiệu quả</li>}
              {goal === "gain" && <li>• Tập nặng + ngủ đủ 8h để tối ưu tăng cơ</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { addWater, removeWater } from "@/lib/actions"
import Link from "next/link"

function Ring({ value, max, size, strokeWidth, gradientId, color, label, sub }: {
  value: number; max: number; size: number; strokeWidth: number;
  gradientId?: string; color?: string; label: string; sub: string;
}) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circ * (1 - pct)
  const cx = size / 2, cy = size / 2

  return (
    <div className="flex flex-col items-center relative">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          {gradientId && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          )}
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          className="text-[var(--border)]" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={gradientId ? `url(#${gradientId})` : (color || "currentColor")}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ}
          style={{ strokeDashoffset: offset, transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-tight">{Math.round(value)}</span>
        <span className="text-[11px] text-[var(--text-dim)]">{sub}</span>
      </div>
      <span className="text-xs text-[var(--text-muted)] mt-1.5 font-medium">{label}</span>
    </div>
  )
}

function MacroBar({ label, value, target, unit, color }: {
  label: string; value: number; target: number; unit: string; color: string;
}) {
  const pct = target > 0 ? Math.min(value / target * 100, 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-[var(--text)]">{label}</span>
        <span className="text-[var(--text-muted)]">{Math.round(value)}{unit} / {target}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function DashboardClient({
  userName, totalCal, totalProtein, totalCarbs, totalFat,
  totalWater, tdee, tgProtein, tgCarbs, tgFat,
  foodsCount, workoutCount, needsBody, userProfile, mealGroups, isAdmin,
}: any) {
  const [waterGlasses, setWaterGlasses] = useState(Math.floor(totalWater / 200))
  const date = new Date()
  const dayName = date.toLocaleDateString("vi-VN", { weekday: "long" })
  const dayMonth = date.toLocaleDateString("vi-VN", { day: "numeric", month: "long" })

  const addGlass = async () => {
    const f = new FormData(); f.set("amount", "200"); await addWater(f)
    setWaterGlasses((g: number) => Math.min(g + 1, 8))
  }

  const removeGlass = async () => {
    if (waterGlasses <= 0) return
    await removeWater()
    setWaterGlasses((g: number) => Math.max(g - 1, 0))
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-medium">CaloGym</div>
          <h2 className="text-xl font-bold text-[var(--text)] mt-0.5">
            {dayName}, {dayMonth}
          </h2>
        </div>
        <Link href="/profile" className="w-10 h-10 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)] font-bold">
          {userName?.charAt(0)?.toUpperCase() || "U"}
        </Link>
      </div>

      {/* Body setup prompt */}
      {needsBody && (
        <Link href="/bmi" className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 hover:bg-[var(--primary)]/15 transition-colors">
          <span className="text-2xl">📐</span>
          <div className="flex-1">
            <div className="font-semibold text-sm text-[var(--text)]">Thiết lập thông tin cơ thể</div>
            <div className="text-xs text-[var(--text-muted)]">Nhập cân nặng, chiều cao để tính BMI và macro</div>
          </div>
          <span className="text-[var(--primary)] text-sm font-medium">Bắt đầu →</span>
        </Link>
      )}

      {/* Admin shortcut */}
      {isAdmin && (
        <Link href="/admin" className="flex items-center gap-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-colors">
          <span className="text-xl">🛡️</span>
          <div className="flex-1">
            <div className="font-semibold text-sm text-[var(--text)]">Admin Panel</div>
            <div className="text-xs text-[var(--text-muted)]">Quản lý users, nhóm, dữ liệu</div>
          </div>
          <span className="text-purple-400 text-sm font-medium">Vào →</span>
        </Link>
      )}

      {/* Calorie Ring */}
      <div className="flex justify-center py-2">
        <Ring value={totalCal} max={tdee} size={160} strokeWidth={12} gradientId="cal-grad"
          label={`Còn ${Math.max(tdee - totalCal, 0)} kcal`} sub={`/ ${tdee}`} />
      </div>

      {/* Macro rings row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col items-center">
          <Ring value={totalProtein} max={tgProtein} size={80} strokeWidth={6} color="var(--protein)" label="Đạm" sub={`/ ${tgProtein}g`} />
        </div>
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col items-center">
          <Ring value={totalCarbs} max={tgCarbs} size={80} strokeWidth={6} color="var(--carb)" label="Bột" sub={`/ ${tgCarbs}g`} />
        </div>
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col items-center">
          <Ring value={totalFat} max={tgFat} size={80} strokeWidth={6} color="var(--fat)" label="Béo" sub={`/ ${tgFat}g`} />
        </div>
      </div>

      {/* Water + Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--text-muted)]">💧 Nước hôm nay</span>
            <span className="text-xs font-bold text-[var(--water)]">{waterGlasses * 200}ml</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={removeGlass}
              disabled={waterGlasses <= 0}
              className="w-7 h-7 rounded-lg bg-[var(--surface-hover)] text-[var(--text-muted)] flex items-center justify-center text-sm font-bold disabled:opacity-30 hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] transition-colors"
            >−</button>
            <div className="flex gap-1.5 flex-1 justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <button
                  key={i}
                  onClick={addGlass}
                  className={`w-6 h-8 rounded-b-md border-2 border-t-0 transition-all relative hover:scale-110 ${
                    i < waterGlasses ? "bg-[var(--water)] border-[var(--water)] animate-water" : "bg-transparent border-[var(--border)]"
                  }`}
                >
                  <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1.5 rounded-t-full border-2 border-b-0 ${
                    i < waterGlasses ? "border-[var(--water)]" : "border-[var(--border)]"
                  }`} />
                </button>
              ))}
            </div>
            <button
              onClick={addGlass}
              disabled={waterGlasses >= 8}
              className="w-7 h-7 rounded-lg bg-[var(--surface-hover)] text-[var(--text-muted)] flex items-center justify-center text-sm font-bold disabled:opacity-30 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
            >+</button>
          </div>
        </div>
        <Link href="/workout" className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 hover:bg-[var(--surface-hover)] transition-colors">
          <div className="text-xs font-medium text-[var(--text-muted)] mb-1">🏋️ Tập luyện</div>
          <div className="text-3xl font-bold text-[var(--text)]">{workoutCount}</div>
          <div className="text-xs text-[var(--text-muted)]">buổi hôm nay</div>
        </Link>
      </div>

      {/* Meal sections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-[var(--text)]">Bữa ăn hôm nay</h3>
          <Link href="/food" className="text-xs text-[var(--primary)] font-medium hover:underline">+ Thêm</Link>
        </div>
        <div className="space-y-2">
          {(["Sáng", "Trưa", "Tối", "Phụ"] as const).map((meal) => {
            const foods = mealGroups[meal] || []
            const cal = foods.reduce((s: number, f: any) => s + f.calories, 0)
            return (
              <div key={meal} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[var(--text)]">
                    {{ "Sáng": "☀️ Bữa sáng", "Trưa": "🌤 Bữa trưa", "Tối": "🌙 Bữa tối", "Phụ": "🍎 Bữa phụ" }[meal]}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{cal} kcal</span>
                </div>
                {foods.length > 0 ? (
                  <div className="space-y-1.5">
                    {foods.slice(0, 3).map((f: any) => (
                      <div key={f.id} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        {f.imageUrl ? <img src={f.imageUrl} alt="" className="w-6 h-6 rounded object-cover" /> : <span>•</span>}
                        <span className="flex-1 truncate">{f.name}</span>
                        <span className="text-[var(--text)] font-medium">{f.calories} kcal</span>
                      </div>
                    ))}
                    {foods.length > 3 && <div className="text-xs text-[var(--text-dim)]">+{foods.length - 3} món nữa</div>}
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-dim)]">Chưa có món nào</div>
                )}
              </div>
            )
          })}
          {mealGroups["Khác"]?.length > 0 && (
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-3">
              <div className="text-sm font-semibold text-[var(--text)] mb-1">📌 Món khác</div>
              <span className="text-xs text-[var(--text-muted)]">{mealGroups["Khác"].reduce((s: number, f: any) => s + f.calories, 0)} kcal</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {[
          { href: "/food", emoji: "🍽️", label: "Thêm món" },
          { href: "/bmi", emoji: "📐", label: "BMI" },
          { href: "/feed", emoji: "💬", label: "Bảng tin" },
          { href: "/progress", emoji: "📸", label: "Ảnh" },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-2.5 text-center hover:bg-[var(--surface-hover)] transition-colors"
          >
            <div className="text-xl mb-0.5">{a.emoji}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{a.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

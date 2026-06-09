"use client"

import { useState } from "react"
import { addFoodEntry, createPost, saveFavoriteFood, deleteFoodEntry } from "@/lib/actions"
import { formatDate } from "@/lib/utils"
import ImageUpload from "@/components/ImageUpload"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const meals = { "Sáng": "☀️ Bữa sáng", "Trưa": "🌤 Bữa trưa", "Tối": "🌙 Bữa tối", "Phụ": "🍎 Bữa phụ" } as const

export default function FoodPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<string>("Trưa")
  const [imageUrl, setImageUrl] = useState("")
  const { data: foods, mutate } = useSWR("/api/food", fetcher)
  const { data: favorites } = useSWR("/api/favorites", fetcher)

  const foodsByMeal: Record<string, any[]> = { "Sáng": [], "Trưa": [], "Tối": [], "Phụ": [], "Khác": [] }
  foods?.forEach((f: any) => {
    const n = (f.note || "").toLowerCase()
    if (n.includes("sáng") || n.includes("breakfast")) foodsByMeal["Sáng"].push(f)
    else if (n.includes("trưa") || n.includes("lunch")) foodsByMeal["Trưa"].push(f)
    else if (n.includes("tối") || n.includes("dinner") || n.includes("chiều")) foodsByMeal["Tối"].push(f)
    else if (n.includes("phụ") || n.includes("snack") || n.includes("xế")) foodsByMeal["Phụ"].push(f)
    else foodsByMeal["Khác"].push(f)
  })

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Nhật ký ăn uống</h2>
          <p className="text-sm text-[var(--text-muted)]">{formatDate(new Date())}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (!showForm) setSelectedMeal("Trưa") }}
          className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          {showForm ? "Đóng" : "+ Thêm món"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 space-y-3">
          <div className="grid grid-cols-4 gap-1.5">
            {Object.entries(meals).map(([k, v]) => (
              <button key={k}
                onClick={() => setSelectedMeal(k)}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                  selectedMeal === k ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)] text-[var(--text-muted)]"
                }`}
              >{v.split(" ")[0]}</button>
            ))}
          </div>
          <form
            action={async (fd) => {
              if (!fd.get("calories")) return
              fd.set("note", selectedMeal)
              await addFoodEntry(fd)
              const pf = new FormData(); pf.set("type", "food"); pf.set("content", fd.get("note") as string); pf.set("imageUrl", fd.get("imageUrl") as string)
              await createPost(pf)
              setShowForm(false); mutate()
            }}
            className="space-y-3"
          >
            <input name="name" placeholder="Tên món..." required className="bg-[var(--surface)]" />
            <div className="grid grid-cols-4 gap-2">
              <div><label className="text-[10px] text-[var(--text-dim)]">kcal</label><input name="calories" type="number" required /></div>
              <div><label className="text-[10px] text-[var(--text-dim)]">Protein</label><input name="protein" type="number" step="0.1" placeholder="0" /></div>
              <div><label className="text-[10px] text-[var(--text-dim)]">Carbs</label><input name="carbs" type="number" step="0.1" placeholder="0" /></div>
              <div><label className="text-[10px] text-[var(--text-dim)]">Fat</label><input name="fat" type="number" step="0.1" placeholder="0" /></div>
            </div>
            <ImageUpload onUploaded={(url) => setImageUrl(url)} />
            <input type="hidden" name="imageUrl" value={imageUrl} />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium">
                Lưu & Đăng feed
              </button>
              <button type="button"
                onClick={async () => {
                  const f = document.querySelector("form")!; const fd = new FormData(f)
                  await saveFavoriteFood(fd)
                }}
                className="px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] text-sm"
              >⭐</button>
            </div>
          </form>
        </div>
      )}

      {/* Favorites quick-add */}
      {favorites && favorites.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Món yêu thích</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {favorites.map((f: any) => (
              <button key={f.id}
                onClick={async () => {
                  const fd = new FormData()
                  fd.set("name", f.name); fd.set("calories", String(f.calories)); fd.set("protein", String(f.protein)); fd.set("carbs", String(f.carbs)); fd.set("fat", String(f.fat)); fd.set("imageUrl", f.imageUrl || ""); fd.set("note", selectedMeal)
                  await addFoodEntry(fd)
                  mutate()
                }}
                className="shrink-0 rounded-xl bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                {f.imageUrl ? <img src={f.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover mb-1 mx-auto" /> : <div className="text-lg mb-0.5">🍴</div>}
                <div className="font-medium">{f.name}</div>
                <div className="text-[var(--text-dim)]">{f.calories} kcal</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meal log */}
      <div className="space-y-3">
        {Object.entries(foodsByMeal).map(([meal, items]) => {
          if (items.length === 0 && meal !== "Khác") return null
          const cal = items.reduce((s: number, f: any) => s + f.calories, 0)
          return (
            <div key={meal} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-[var(--text)]">
                  {meal === "Khác" ? "📌 Khác" : meals[meal as keyof typeof meals]}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{cal} kcal</span>
              </div>
              <div className="px-4 pb-3 space-y-1.5">
                {items.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 text-sm">
                    {f.imageUrl ? <img src={f.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center text-xs text-[var(--text-dim)] shrink-0">🍴</div>}
                    <div className="flex-1 min-w-0">
                      <div className="text-[var(--text)] font-medium truncate">{f.name}</div>
                      <div className="text-xs text-[var(--text-dim)]">P:{Math.round(f.protein)}g C:{Math.round(f.carbs)}g F:{Math.round(f.fat)}g</div>
                    </div>
                    <span className="text-[var(--text)] font-semibold text-sm shrink-0">{f.calories} kcal</span>
                    <button
                      onClick={async () => { await deleteFoodEntry(f.id); mutate() }}
                      className="shrink-0 w-5 h-5 rounded text-[var(--text-dim)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] flex items-center justify-center text-xs transition-colors"
                      title="Xoá"
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {(!foods || foods.length === 0) && (
          <div className="text-center py-12 text-[var(--text-muted)] text-sm">
            <div className="text-4xl mb-3">🍽️</div>
            <p>Hôm nay chưa có món nào</p>
            <p className="text-xs mt-1">Bấm "+ Thêm món" để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  )
}

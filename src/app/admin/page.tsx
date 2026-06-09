"use client"

import { useEffect, useState, useCallback } from "react"
import { formatDate } from "@/lib/utils"
import ThemeToggle from "@/components/ThemeToggle"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [foods, setFoods] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [tab, setTab] = useState<"overview" | "users" | "groups" | "foods" | "posts" | "templates" | "photos" | "tools">("overview")
  const [newGroupName, setNewGroupName] = useState("")
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin").then((r) => r.json())
    setData(res)
  }, [])

  const loadTab = useCallback(async (t: string) => {
    if (t === "foods" && foods.length === 0) {
      fetch("/api/admin?resource=foods").then((r) => r.json()).then(setFoods)
    }
    if (t === "posts" && posts.length === 0) {
      fetch("/api/admin?resource=posts").then((r) => r.json()).then(setPosts)
    }
    if (t === "templates" && templates.length === 0) {
      fetch("/api/admin?resource=templates").then((r) => r.json()).then(setTemplates)
    }
    if (t === "photos" && photos.length === 0) {
      fetch("/api/admin?resource=photos").then((r) => r.json()).then(setPhotos)
    }
  }, [foods, posts, templates])

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => { if (r.status === 403) router.push("/dashboard"); return r.json() })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { loadTab(tab) }, [tab])

  const handleDelete = async (body: any) => {
    await fetch("/api/admin", { method: "DELETE", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } })
    refresh()
    if (body.foodId) setFoods((f) => f.filter((x) => x.id !== body.foodId))
    if (body.postId) setPosts((p) => p.filter((x) => x.id !== body.postId))
    if (body.templateId) setTemplates((p) => p.filter((x) => x.id !== body.templateId))
    if (body.photoId) setPhotos((p) => p.filter((x) => x.id !== body.photoId))
  }

  const handleUpdateUser = async (userId: string, updates: any) => {
    await fetch("/api/admin", { method: "PATCH", body: JSON.stringify({ userId, ...updates }), headers: { "Content-Type": "application/json" } })
    refresh()
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    await fetch("/api/admin", { method: "POST", body: JSON.stringify({ action: "create-group", groupName: newGroupName.trim() }), headers: { "Content-Type": "application/json" } })
    setNewGroupName(""); refresh()
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Xoá nhóm này?")) return
    await fetch("/api/admin", { method: "POST", body: JSON.stringify({ action: "delete-group", groupId }), headers: { "Content-Type": "application/json" } })
    refresh()
  }

  const handleCleanup = async () => {
    if (!confirm("Xoá dữ liệu cũ (>60 ngày)?")) return
    const res = await fetch("/api/admin", { method: "POST", body: JSON.stringify({ action: "cleanup-old-data" }), headers: { "Content-Type": "application/json" } })
    const d = await res.json()
    alert(`Đã dọn ${d.deleted} records`)
    refresh()
  }

  if (loading) return <div className="p-8 text-center text-[var(--text-muted)]">Đang tải...</div>
  if (!data) return <div className="p-8 text-center text-[var(--destructive)]">Không có quyền</div>

  const s = data.stats
  const tabs = ["overview", "users", "groups", "foods", "posts", "templates", "photos", "tools"] as const
  const tabNames: Record<string, string> = { overview: "📊 Tổng quan", users: `👥 Users (${data.users.length})`, groups: `🏷️ Nhóm (${data.groups.length})`, foods: "🍽️ Món ăn", posts: "📝 Bài viết", templates: "📋 Templates", photos: "📸 Ảnh", tools: "🧰 Công cụ" }

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">🛡️ Admin Panel</h2>
          <p className="text-sm text-[var(--text-muted)]">Quản lý toàn bộ hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="p-2 rounded-xl text-[var(--text-muted)]" />
          <button onClick={() => router.push("/dashboard")} className="px-3 py-1.5 rounded-xl text-sm border border-[var(--border)] text-[var(--text)]">← Dashboard</button>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-xl text-xs font-medium ${tab === t ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] text-[var(--text-muted)]"}`}
          >{tabNames[t]}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ l: "Users", v: s.users, e: "👥" },{ l: "Món ăn", v: s.foods, e: "🍽️" },{ l: "Buổi tập", v: s.workouts, e: "🏋️" },{ l: "Bài viết", v: s.posts, e: "📝" },{ l: "Nước", v: s.waters, e: "💧" },{ l: "Ảnh", v: s.photos, e: "📸" },{ l: "Templates", v: s.templates, e: "📋" },{ l: "Nhóm", v: data.groups.length, e: "🏷️" }].map((i) => (
            <div key={i.l} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 text-center">
              <div className="text-2xl mb-1">{i.e}</div>
              <div className="text-2xl font-bold text-[var(--text)]">{i.v}</div>
              <div className="text-xs text-[var(--text-muted)]">{i.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* GROUPS */}
      {tab === "groups" && (
        <div className="space-y-4 max-w-md">
          <div className="flex gap-2">
            <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Tên nhóm mới..." className="flex-1" onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()} />
            <button onClick={handleCreateGroup} disabled={!newGroupName.trim()} className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium disabled:opacity-50">Tạo nhóm</button>
          </div>
          <div className="space-y-2">
            {data.groups.map((g: any) => (
              <div key={g.id} className="flex items-center justify-between rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4">
                <div>
                  <div className="font-semibold text-sm">{g.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{g._count.users} thành viên</div>
                </div>
                <button onClick={() => handleDeleteGroup(g.id)} className="px-3 py-1.5 rounded-xl text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 hover:bg-[var(--destructive)]/20">🗑 Xoá</button>
              </div>
            ))}
            {data.groups.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-4">Chưa có nhóm</p>}
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div className="space-y-2">
          {data.users.map((u: any) => (
            <div key={u.id} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm">{u.name || "Chưa đặt tên"}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${u.role === "admin" ? "bg-purple-500/15 text-purple-400" : "bg-[var(--surface-hover)] text-[var(--text-dim)]"}`}>{u.role}</span>
                    {u.groupId && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400">{data.groups.find((g: any) => g.id === u.groupId)?.name}</span>}
                  </div>
                  <div className="text-xs text-[var(--text-dim)] space-y-0.5">
                    <div>{u.email}</div>
                    <div className="flex gap-3">🍽️{u._count.foods} 🏋️{u._count.workouts} 📝{u._count.posts} 👥{u._count.followers}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <select value={u.groupId || "none"} onChange={(e) => handleUpdateUser(u.id, { groupId: e.target.value === "none" ? null : e.target.value })} className="text-xs px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                    <option value="none">Không nhóm</option>
                    {data.groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <select value={u.role} onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })} className="text-xs px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                    <option value="user">User</option><option value="admin">Admin</option>
                  </select>
                  <button onClick={() => { if (confirm(`Xoá "${u.name}"?`)) handleDelete({ userId: u.id }) }} className="px-2 py-1 rounded-lg text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 hover:bg-[var(--destructive)]/20">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOODS */}
      {tab === "foods" && (
        <div className="space-y-2">
          {foods.map((f: any) => (
            <div key={f.id} className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-3">
              {f.imageUrl ? <img src={f.imageUrl} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" /> : <div className="w-10 h-10 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center shrink-0 text-lg">🍴</div>}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{f.name}</div>
                <div className="text-xs text-[var(--text-dim)]">{f.user?.name || f.user?.email} · {f.calories} kcal · P:{f.protein} C:{f.carbs} F:{f.fat} · {formatDate(f.createdAt)}</div>
              </div>
              <button onClick={() => { if (confirm(`Xoá "${f.name}"?`)) handleDelete({ foodId: f.id }) }} className="shrink-0 px-2 py-1 text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 rounded-lg hover:bg-[var(--destructive)]/20">🗑</button>
            </div>
          ))}
          {foods.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-4">Không có món nào</p>}
        </div>
      )}

      {/* POSTS */}
      {tab === "posts" && (
        <div className="space-y-2">
          {posts.map((p: any) => (
            <div key={p.id} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{p.user?.name || p.user?.email}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-hover)] text-[var(--text-dim)]">{p.type}</span>
                    <span className="text-xs text-[var(--text-dim)]">{formatDate(p.createdAt)}</span>
                  </div>
                  {p.content && <p className="text-sm">{p.content}</p>}
                  {p.imageUrl && <img src={p.imageUrl} className="mt-2 rounded-xl max-h-40 object-cover" alt="" />}
                  <div className="text-xs text-[var(--text-dim)] mt-1">❤️ {p._count.likes} 💬 {p._count.comments}</div>
                </div>
                <button onClick={() => { if (confirm("Xoá bài viết?")) handleDelete({ postId: p.id }) }} className="shrink-0 px-2 py-1 text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 rounded-lg hover:bg-[var(--destructive)]/20">🗑</button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-4">Không có bài viết</p>}
        </div>
      )}

      {/* TEMPLATES */}
      {tab === "templates" && (
        <div className="grid grid-cols-2 gap-2">
          {templates.map((t: any) => (
            <div key={t.id} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-[var(--text-dim)]">{t.user?.name} · {t.exercises.length} bài · {t._count.logs} lần tập</div>
                </div>
                <button onClick={() => { if (confirm(`Xoá "${t.name}"?`)) handleDelete({ templateId: t.id }) }} className="shrink-0 px-2 py-1 text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 rounded-lg hover:bg-[var(--destructive)]/20">🗑</button>
              </div>
              <div className="text-xs text-[var(--text-dim)] mt-1 space-y-0.5">
                {t.exercises?.slice(0, 3).map((e: any, i: number) => (
                  <div key={i}>- {e.name}: {e.sets}x{e.reps}</div>
                ))}
              </div>
            </div>
          ))}
          {templates.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-4 col-span-2">Không có templates</p>}
        </div>
      )}

      {/* PHOTOS */}
      {tab === "photos" && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((p: any) => (
            <div key={p.id} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <img src={p.imageUrl} alt="" className="w-full aspect-square object-cover" />
              <div className="p-2 space-y-0.5">
                <div className="text-xs text-[var(--text-dim)]">{formatDate(p.createdAt)}</div>
                <div className="text-xs font-medium truncate">{p.user?.name || p.user?.email}</div>
                {p.note && <div className="text-xs text-[var(--text-dim)] truncate">{p.note}</div>}
                <button
                  onClick={() => { if (confirm("Xoá ảnh?")) handleDelete({ photoId: p.id }) }}
                  className="w-full mt-1 py-1 rounded-lg text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 hover:bg-[var(--destructive)]/20 transition-colors"
                >🗑 Xoá</button>
              </div>
            </div>
          ))}
          {photos.length === 0 && <p className="col-span-full text-sm text-[var(--text-muted)] text-center py-8">Không có ảnh</p>}
        </div>
      )}

      {/* TOOLS */}
      {tab === "tools" && (
        <div className="space-y-4 max-w-md">
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4">
            <h3 className="font-semibold text-sm mb-2">🧹 Dọn dữ liệu cũ</h3>
            <p className="text-xs text-[var(--text-muted)] mb-3">Xoá water logs cũ hơn 60 ngày</p>
            <button onClick={handleCleanup} className="w-full py-2 rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)] text-sm font-medium hover:bg-[var(--destructive)]/20 transition-colors">
              Dọn dữ liệu
            </button>
          </div>

          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 space-y-2">
            <h3 className="font-semibold text-sm">ℹ️ Thông tin hệ thống</h3>
            <div className="text-xs text-[var(--text-muted)] space-y-1">
              <div>Database: SQL Server</div>
              <div>Frontend: Next.js 16 + React 19</div>
              <div>ORM: Prisma 7</div>
              <div>Auth: NextAuth v5</div>
              <div>Tổng số bảng: 16</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import useSWR from "swr"
import { formatDate } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProfilePage() {
  const { data: profile } = useSWR("/api/profile", fetcher)

  if (!profile) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold">
          {profile.image ? (
            <img src={profile.image} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            profile.name?.charAt(0)?.toUpperCase() || "U"
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold">{profile.name || "Unknown"}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Món ăn", value: profile.stats?.foodCount || 0 },
          { label: "Buổi tập", value: profile.stats?.workoutCount || 0 },
          { label: "Bài viết", value: profile.stats?.postCount || 0 },
          { label: "Bạn bè", value: profile.stats?.followersCount || 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border p-3 text-center">
            <div className="text-xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4 space-y-2">
        <h3 className="font-semibold">Thông tin</h3>
        <div className="text-sm text-muted-foreground">
          Tham gia từ: {formatDate(profile.createdAt)}
        </div>
      </div>
    </div>
  )
}

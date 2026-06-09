"use client"

import useSWR from "swr"
import { followUser } from "@/lib/actions"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function FriendsPage() {
  const { data: users, mutate } = useSWR("/api/users", fetcher)

  const handleFollow = async (userId: string) => {
    await followUser(userId)
    mutate()
  }

  if (!users) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-lg font-semibold">Danh sách thành viên</h2>
      <p className="text-sm text-muted-foreground">
        Kết bạn để xem nhau ăn gì, tập gì trên bảng tin
      </p>

      <div className="space-y-2">
        {users.map((user: any) => (
          <div key={user.id} className="flex items-center gap-3 rounded-xl border p-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
              {user.image ? (
                <img src={user.image} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                user.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{user.name || "Unknown"}</div>
              <div className="text-xs text-muted-foreground">
                {user._count?.posts || 0} bài viết · {user._count?.followers || 0} người theo dõi
              </div>
            </div>
            <button
              onClick={() => handleFollow(user.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                user.isFollowing
                  ? "bg-secondary text-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {user.isFollowing ? "Đang follow" : "Follow"}
            </button>
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có thành viên nào khác
          </p>
        )}
      </div>
    </div>
  )
}

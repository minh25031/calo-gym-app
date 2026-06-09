"use client"

import { useState } from "react"
import { toggleLike, addComment, deletePost, createPost } from "@/lib/actions"
import { formatTimeAgo } from "@/lib/utils"
import useSWR from "swr"
import { useSession } from "next-auth/react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function FeedPage() {
  const { data: session } = useSession()
  const { data: posts, mutate } = useSWR("/api/feed", fetcher)
  const [showPostForm, setShowPostForm] = useState(false)
  const [postType, setPostType] = useState<"food" | "workout">("food")
  const [commentText, setCommentText] = useState<Record<string, string>>({})

  const handleLike = async (postId: string) => {
    await toggleLike(postId)
    mutate()
  }

  const handleComment = async (postId: string) => {
    const text = commentText[postId]
    if (!text?.trim()) return
    await addComment(postId, text)
    setCommentText({ ...commentText, [postId]: "" })
    mutate()
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Xoá bài viết này?")) return
    await deletePost(postId)
    mutate()
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bảng tin</h2>
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground"
        >
          {showPostForm ? "Huỷ" : "+ Đăng bài"}
        </button>
      </div>

      {showPostForm && (
        <form
          action={async (formData) => {
            await createPost(formData)
            setShowPostForm(false)
            mutate()
          }}
          className="rounded-xl border p-4 space-y-3"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPostType("food")}
              className={`px-3 py-1.5 rounded-lg text-sm ${postType === "food" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              🍽️ Hôm nay ăn gì
            </button>
            <button
              type="button"
              onClick={() => setPostType("workout")}
              className={`px-3 py-1.5 rounded-lg text-sm ${postType === "workout" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              🏋️ Hôm nay tập gì
            </button>
          </div>
          <input type="hidden" name="type" value={postType} />
          <textarea
            name="content"
            placeholder={postType === "food" ? "Hôm nay bạn ăn gì?" : "Hôm nay bạn tập gì?"}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none"
          />
          <input
            name="imageUrl"
            placeholder="Link ảnh (nếu có)"
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            Đăng bài
          </button>
        </form>
      )}

      <div className="space-y-4">
        {posts?.map((post: any) => (
          <div key={post.id} className="rounded-xl border overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {post.user?.image ? (
                  <img src={post.user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  post.user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{post.user?.name || "Unknown"}</div>
                <div className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</div>
              </div>
              {post.user?.id === session?.user?.id && (
                <button onClick={() => handleDelete(post.id)} className="text-xs text-muted-foreground hover:text-destructive">
                  Xoá
                </button>
              )}
            </div>

            {/* Food detail */}
            {post.food && (
              <div className="px-3 pb-2">
                <div className="rounded-lg bg-secondary p-3">
                  <div className="flex gap-3">
                    {post.food.imageUrl && (
                      <img src={post.food.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{post.food.name}</div>
                      <div className="text-xs text-muted-foreground">{post.food.calories} kcal</div>
                      <div className="text-xs text-muted-foreground">
                        P: {post.food.protein}g | C: {post.food.carbs}g | F: {post.food.fat}g
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Workout detail */}
            {post.workout && (
              <div className="px-3 pb-2">
                <div className="rounded-lg bg-secondary p-3">
                  <div className="font-medium text-sm">{post.workout.template?.name || "Tập tự do"}</div>
                  {post.workout.exercises?.map((e: any, i: number) => (
                    <div key={i} className="text-xs text-muted-foreground">
                      - {e.name}: {e.sets}x{e.reps}{e.weight ? ` (${e.weight}kg)` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {post.content && <p className="px-3 pb-2 text-sm">{post.content}</p>}
            {post.imageUrl && !post.food && (
              <div className="px-3 pb-2">
                <img src={post.imageUrl} alt="" className="w-full rounded-lg object-cover max-h-80" />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 px-3 pb-3">
              <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-sm">
                <span>{post.likes?.some((l: any) => l.userId === session?.user?.id) ? "❤️" : "🤍"}</span>
                <span className="text-muted-foreground">{post._count?.likes || 0}</span>
              </button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>💬</span>
                <span>{post._count?.comments || 0}</span>
              </div>
            </div>

            {/* Comments */}
            {post.comments?.length > 0 && (
              <div className="border-t px-3 py-2 space-y-2">
                {post.comments.map((c: any) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-medium">{c.user?.name || "Unknown"}: </span>
                    {c.content}
                  </div>
                ))}
              </div>
            )}

            {/* Comment input */}
            <div className="border-t flex gap-2 p-2">
              <input
                value={commentText[post.id] || ""}
                onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                placeholder="Viết bình luận..."
                className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleComment(post.id)
                  }
                }}
              />
              <button onClick={() => handleComment(post.id)} className="px-3 py-1.5 text-sm text-primary font-medium">
                Gửi
              </button>
            </div>
          </div>
        ))}

        {(!posts || posts.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có bài viết nào. Hãy kết bạn để xem bảng tin!
          </p>
        )}
      </div>
    </div>
  )
}

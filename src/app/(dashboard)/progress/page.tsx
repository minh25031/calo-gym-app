"use client"

import { useState } from "react"
import { addProgressPhoto } from "@/lib/actions"
import { formatDate } from "@/lib/utils"
import ImageUpload from "@/components/ImageUpload"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProgressPage() {
  const [showForm, setShowForm] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const { data: photos, mutate } = useSWR("/api/progress-photos", fetcher)

  const handleSubmit = async (fd: FormData) => {
    fd.set("imageUrl", imageUrl)
    await addProgressPhoto(fd)
    setImageUrl("")
    setShowForm(false)
    mutate()
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Ảnh tiến triển</h2>
          <p className="text-sm text-[var(--text-muted)]">So sánh trước - sau</p>
        </div>
        <button
          onClick={() => { setImageUrl(""); setShowForm(!showForm) }}
          className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium"
        >
          {showForm ? "Đóng" : "+ Thêm ảnh"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 space-y-3">
          <ImageUpload onUploaded={setImageUrl} existingUrl={imageUrl} />
          <form action={handleSubmit} className="space-y-3">
            <input name="note" placeholder="Ghi chú (VD: Sau 1 tháng)" />
            <button type="submit" disabled={!imageUrl}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium disabled:opacity-50">
              Lưu ảnh
            </button>
          </form>
        </div>
      )}

      {photos && photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((p: any) => (
            <div key={p.id} className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <img src={p.imageUrl} alt="" className="w-full aspect-square object-cover" />
              <div className="p-3">
                <div className="text-xs text-[var(--text-dim)]">{formatDate(p.createdAt)}</div>
                {p.note && <div className="text-xs text-[var(--text)] mt-0.5">{p.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {(!photos || photos.length === 0) && (
        <div className="text-center py-12 text-[var(--text-muted)] text-sm">
          <div className="text-4xl mb-3">📸</div>
          <p>Chưa có ảnh nào</p>
        </div>
      )}
    </div>
  )
}

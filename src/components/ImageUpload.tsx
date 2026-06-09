"use client"

import { useState, useRef } from "react"

export default function ImageUpload({ onUploaded, existingUrl }: {
  onUploaded: (url: string) => void; existingUrl?: string;
}) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("File quá lớn (max 10MB)")
      return
    }
    setUploading(true)
    setError("")

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); setPreview(null); return }
      onUploaded(data.url)
      setPreview(data.url)
    } catch {
      setError("Lỗi kết nối")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl border" />
          <button
            onClick={() => { setPreview(null); onUploaded("") }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
          >✕</button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="w-full h-32 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] flex flex-col items-center justify-center gap-2 cursor-pointer bg-[var(--surface)] transition-colors"
        >
          <div className="text-2xl">{uploading ? "⏳" : "📷"}</div>
          <span className="text-xs text-[var(--text-muted)]">
            {uploading ? "Đang upload..." : "Kéo thả ảnh vào hoặc click để chọn"}
          </span>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }}
      />
      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
    </div>
  )
}

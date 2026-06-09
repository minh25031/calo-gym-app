import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return Response.json({ error: "No file" }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: "File quá lớn (max 10MB)" }, { status: 400 })

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const allowed = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"]
  if (!allowed.includes(ext)) return Response.json({ error: "Định dạng không hỗ trợ" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const uploadsDir = path.join(process.cwd(), "public", "uploads")

  try {
    await mkdir(uploadsDir, { recursive: true })
    await writeFile(path.join(uploadsDir, filename), buffer)

    const url = `/uploads/${filename}`
    return Response.json({ url, filename })
  } catch (e) {
    return Response.json({ error: "Lỗi upload" }, { status: 500 })
  }
}

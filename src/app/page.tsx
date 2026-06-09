import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)]">
      <header className="flex items-center justify-between px-5 py-4">
        <img src="/logo.svg" alt="CaloGym" className="w-8 h-8" />
        <span className="font-bold text-lg text-[var(--text)]">CaloGym</span>
        <div className="flex items-center gap-2">
          <ThemeToggle className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface)]" />
          <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-xl text-[var(--text)] hover:bg-[var(--surface)]">Đăng nhập</Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]">Đăng ký</Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-8">
          <div>
            <img src="/logo.svg" alt="CaloGym" className="w-20 h-20 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-[var(--text)]">Theo dõi Calo & Tập luyện</h2>
            <p className="text-[var(--text-muted)] mt-3 leading-relaxed">
              Ghi lại calo và macro mỗi bữa ăn, lên lịch tập gym, và chia sẻ với bạn bè.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ e: "🍽️", t: "Tính Calo", d: "Ghi calo & macro" }, { e: "🏋️", t: "Tập luyện", d: "Lịch tập theo nhóm cơ" }, { e: "📸", t: "Ảnh đồ ăn", d: "Chụp ảnh & chia sẻ" }, { e: "👥", t: "Bạn bè", d: "Feed nhóm nội bộ" }].map((i) => (
              <div key={i.t} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 text-left">
                <div className="text-2xl mb-2">{i.e}</div>
                <div className="font-semibold text-sm text-[var(--text)]">{i.t}</div>
                <div className="text-xs text-[var(--text-muted)]">{i.d}</div>
              </div>
            ))}
          </div>
          <Link href="/register" className="inline-block w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors">
            Bắt đầu miễn phí
          </Link>
        </div>
      </main>
    </div>
  )
}

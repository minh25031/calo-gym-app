"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/actions"
import ThemeToggle from "./ThemeToggle"

const navItems = [
  { href: "/dashboard", label: "Trang chủ", emoji: "🏠" },
  { href: "/food", label: "Đồ ăn", emoji: "🍽️" },
  { href: "/workout", label: "Tập luyện", emoji: "🏋️" },
  { href: "/bmi", label: "BMI & Macro", emoji: "📐" },
  { href: "/progress", label: "Tiến triển", emoji: "📸" },
  { href: "/feed", label: "Bảng tin", emoji: "💬" },
  { href: "/friends", label: "Bạn bè", emoji: "👥" },
]

export default function Navbar({ userName, userImage, isAdmin }: { userName?: string | null; userImage?: string | null; isAdmin?: boolean }) {
  const pathname = usePathname()
  const initial = userName?.charAt(0)?.toUpperCase() || "U"

  return (
    <aside className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border)]">
        <img src="/logo.svg" alt="CaloGym" className="w-8 h-8 rounded-lg" />
        <span className="font-bold text-sm text-[var(--text)] tracking-tight">CaloGym</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border)] p-2 space-y-0.5">
        {isAdmin && (
          <Link href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              pathname.startsWith("/admin") ? "bg-purple-500/10 text-purple-400" : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            }`}
          >
            <span className="text-base">🛡️</span>
            <span>Admin</span>
          </Link>
        )}
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            pathname === "/profile"
              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
              : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-xs font-bold">
            {userImage ? (
              <img src={userImage} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <span className="flex-1 truncate">{userName || "Profile"}</span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] w-full" />
          
          <form action={logout} className="flex-1">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] w-full">
              <span className="text-base">🚪</span>
              <span>Thoát</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

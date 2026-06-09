"use client"

import { useSession } from "next-auth/react"
import Navbar from "@/components/Navbar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"

const bottomTabs = [
  { href: "/dashboard", label: "Home", emoji: "🏠" },
  { href: "/food", label: "Ăn", emoji: "🍽️" },
  { href: "/workout", label: "Tập", emoji: "🏋️" },
  { href: "/feed", label: "Feed", emoji: "💬" },
]

const pageTitles: Record<string, string> = {
  "/dashboard": "Trang chủ",
  "/food": "Nhật ký ăn uống",
  "/workout": "Tập luyện",
  "/feed": "Bảng tin",
  "/profile": "Cá nhân",
  "/friends": "Bạn bè",
  "/bmi": "BMI & Macro",
  "/progress": "Tiến triển",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = pageTitles[pathname] || "CaloGym"

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Navbar userName={session?.user?.name} userImage={session?.user?.image} isAdmin={(session?.user as any)?.role === "admin"} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 h-14 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl sticky top-0 z-30 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 -ml-1 text-[var(--text-muted)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-semibold text-[var(--text)]">{title}</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[var(--surface)]/80 backdrop-blur-xl border-t border-[var(--border)] flex items-center justify-around py-1 lg:hidden">
        {bottomTabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center py-1 px-3 text-xs font-medium transition-colors ${
                active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

"use client"

import { useActionState } from "react"
import { signIn } from "next-auth/react"
import { register } from "@/lib/actions"
import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined)

  if (state?.message) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4 bg-[var(--bg)]">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-4xl">📧</div>
          <h1 className="text-xl font-bold text-[var(--text)]">Kiểm tra email của bạn</h1>
          <p className="text-sm text-[var(--text-muted)]">Chúng tôi đã gửi link xác thực đến email của bạn. Vui lòng kiểm tra hộp thư (cả Spam) và click vào link để kích hoạt tài khoản.</p>
          <Link href="/login" className="inline-block w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium text-sm">Về trang đăng nhập</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 bg-[var(--bg)]">
      <ThemeToggle className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface)]" />
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src="/logo.svg" alt="CaloGym" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text)]">Tạo tài khoản</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Bắt đầu theo dõi calo & tập luyện</p>
        </div>

          <form action={action} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--text)]">Tên</label>
              <input name="name" type="text" required placeholder="Nguyễn Văn A" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text)]">Email</label>
              <input name="email" type="email" required placeholder="email@example.com" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text)]">Mật khẩu</label>
              <input name="password" type="password" required minLength={6} placeholder="Ít nhất 6 ký tự" className="mt-1.5" />
            </div>
            {state?.error && <p className="text-sm text-[var(--destructive)]">{state.error}</p>}
            <button type="submit" disabled={pending}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors">
              {pending ? "Đang đăng ký..." : "Tạo tài khoản"}
            </button>
          </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-[var(--bg)] px-3 text-[var(--text-muted)]">hoặc</span></div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-medium text-sm hover:bg-[var(--surface-hover)] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>

        <p className="text-center text-sm text-[var(--text-muted)]">
          Đã có tài khoản? <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

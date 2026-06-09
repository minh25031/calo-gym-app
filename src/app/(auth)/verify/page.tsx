import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4 bg-[var(--bg)]">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-4xl">📧</div>
          <h1 className="text-xl font-bold text-[var(--text)]">Kiểm tra email của bạn</h1>
          <p className="text-sm text-[var(--text-muted)]">Chúng tôi đã gửi link xác thực vào email của bạn. Vui lòng kiểm tra hộp thư (cả Spam).</p>
          <Link href="/login" className="inline-block px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium text-sm">Về đăng nhập</Link>
        </div>
      </div>
    )
  }

  const verification = await prisma.verificationEmail.findUnique({ where: { token } })

  if (!verification) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4 bg-[var(--bg)]">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-4xl">❌</div>
          <h1 className="text-xl font-bold text-[var(--destructive)]">Link không hợp lệ</h1>
          <p className="text-sm text-[var(--text-muted)]">Link xác thực đã hết hạn hoặc không tồn tại.</p>
          <Link href="/login" className="inline-block px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium text-sm">Về đăng nhập</Link>
        </div>
      </div>
    )
  }

  if (verification.expires < new Date()) {
    await prisma.verificationEmail.delete({ where: { id: verification.id } })
    return (
      <div className="flex min-h-dvh items-center justify-center p-4 bg-[var(--bg)]">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-4xl">⏰</div>
          <h1 className="text-xl font-bold text-[var(--text)]">Link đã hết hạn</h1>
          <p className="text-sm text-[var(--text-muted)]">Vui lòng liên hệ admin để được gửi lại link xác thực.</p>
          <Link href="/login" className="inline-block px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium text-sm">Về đăng nhập</Link>
        </div>
      </div>
    )
  }

  // Verify user
  await prisma.user.update({
    where: { id: verification.userId },
    data: { emailVerified: new Date() },
  })
  await prisma.verificationEmail.delete({ where: { id: verification.id } })

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 bg-[var(--bg)]">
      <div className="text-center max-w-sm space-y-4">
        <div className="text-4xl">✅</div>
        <h1 className="text-xl font-bold text-[var(--primary)]">Email đã được xác thực!</h1>
        <p className="text-sm text-[var(--text-muted)]">Tài khoản của bạn đã sẵn sàng. Hãy đăng nhập để bắt đầu.</p>
        <Link href="/login" className="inline-block px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium text-sm">Đăng nhập</Link>
      </div>
    </div>
  )
}

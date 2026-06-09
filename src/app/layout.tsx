import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "@/globals.css"
import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CaloGym - Theo dõi Calo & Tập luyện",
  description: "Web app theo dõi calo, macro và lịch tập gym",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-[var(--bg)] text-[var(--text)] antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } })
        if (!user || !user.password) return null
        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } })
        if (!existing) {
          await prisma.user.create({
            data: { email: user.email!, name: user.name || user.email?.split("@")[0], image: user.image, emailVerified: new Date() },
          })
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true, role: true } })
        if (dbUser) { token.id = dbUser.id; token.role = dbUser.role || "user" }
      }
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string }, select: { role: true } })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id as string; (session.user as any).role = token.role as string }
      return session
    },
  },
})

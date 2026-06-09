import { NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/food", "/workout", "/feed", "/friends", "/profile", "/bmi", "/progress", "/admin"]
const publicRoutes = ["/login", "/register", "/"]

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((r) => path.startsWith(r))
  const isPublicRoute = publicRoutes.some((r) => path === r)

  const sessionToken = req.cookies.get("next-auth.session-token")?.value
  const secureSessionToken = req.cookies.get("__Secure-next-auth.session-token")?.value
  const isAuthenticated = !!(sessionToken || secureSessionToken)

  // Check if this is a register redirect (user just registered, needs to verify)
  const isVerifyFlow = path === "/login" && req.nextUrl.searchParams.get("verified") === "pending"

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(loginUrl)
  }

  // Don't redirect to dashboard if user just registered and needs to verify email
  if (isPublicRoute && isAuthenticated && path !== "/" && !isVerifyFlow) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}

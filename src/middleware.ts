// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const method = req.method
    const role = req.nextauth.token?.role as "ADMIN" | "OPERATOR" | "CUSTOMER" | undefined

    if (pathname.startsWith("/dashboard")) {
      if (!role || (role !== "ADMIN" && role !== "OPERATOR")) {
        const url = new URL("/login", req.url)
        url.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(url)
      }
    }

    if (pathname === "/profile") {
      if (!role) {
        const url = new URL("/login", req.url)
        url.searchParams.set("callbackUrl", "/profile")
        return NextResponse.redirect(url)
      }
    }

    if (pathname.startsWith("/api/experiences") && method !== "GET") {
      if (!role || (role !== "ADMIN" && role !== "OPERATOR")) {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
      }
    }

    return NextResponse.next()
  },
  { callbacks: { authorized: ({ token }) => true } }
)

export const config = {
  matcher: ["/dashboard/:path*", "/profile", "/api/experiences/:path*"],
}

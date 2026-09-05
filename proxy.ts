import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isAppRole, ROLE_COOKIE } from "@/lib/role-cookie"

const publicPaths = ["/", "/sign-in", "/sign-up", "/artisan-apply", "/api/payments/webhook", "/auth/redirect", "/about", "/privacy", "/terms"]

const ROLE_PATHS: Array<{ prefix: string; role: string }> = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/artisan", role: "ARTISAN" },
  { prefix: "/customer", role: "CUSTOMER" },
]

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId, sessionClaims } = await auth()
  const path = request.nextUrl.pathname

  if (userId && (path === "/sign-in" || path === "/sign-up")) {
    const jwtRole = (sessionClaims?.metadata as { role?: string } | undefined)?.role
    const cookieRole = request.cookies.get(ROLE_COOKIE)?.value
    const role = isAppRole(jwtRole) ? jwtRole : isAppRole(cookieRole) ? cookieRole : undefined
    if (role) {
      return NextResponse.redirect(new URL(getDashboard(role), request.url))
    }
    return NextResponse.redirect(new URL("/auth/redirect", request.url))
  }

  if (publicPaths.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next()
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  const jwtRole = (sessionClaims?.metadata as { role?: string } | undefined)?.role
  const cookieRole = request.cookies.get(ROLE_COOKIE)?.value
  // JWT can lag behind Clerk publicMetadata after onboard; cookie bridges that gap.
  const role = isAppRole(jwtRole) ? jwtRole : isAppRole(cookieRole) ? cookieRole : undefined

  if (!role) {
    return NextResponse.redirect(new URL("/auth/redirect", request.url))
  }

  for (const { prefix, role: requiredRole } of ROLE_PATHS) {
    if (path.startsWith(prefix) && role !== requiredRole) {
      return NextResponse.redirect(new URL(getDashboard(role), request.url))
    }
  }

  return NextResponse.next()
})

function getDashboard(role?: string) {
  if (role === "ARTISAN") return "/artisan/dashboard"
  if (role === "ADMIN") return "/admin/dashboard"
  return "/customer/dashboard"
}

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
}

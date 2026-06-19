import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/", "/sign-in", "/sign-up", "/artisan-apply", "/api/webhooks"]

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId, sessionClaims } = await auth()
  const path = request.nextUrl.pathname

  if (publicPaths.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next()
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role

  // Only redirect when the role is KNOWN to be wrong — never when it's undefined.
  // An undefined role means the session token was issued before /auth/redirect ran
  // (e.g. first sign-in). Letting the request through avoids an infinite redirect loop.
  if (role && path.startsWith("/customer") && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL(getDashboard(role), request.url))
  }
  if (role && path.startsWith("/artisan") && role !== "ARTISAN") {
    return NextResponse.redirect(new URL(getDashboard(role), request.url))
  }
  if (role && path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(getDashboard(role), request.url))
  }

  return NextResponse.next()
})

function getDashboard(role?: string) {
  if (role === "ARTISAN") return "/artisan/dashboard"
  if (role === "ADMIN") return "/admin/dashboard"
  return "/customer/browse"
}

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
}

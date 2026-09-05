import { describe, it, expect } from "vitest"

function getDashboard(role?: string) {
  if (role === "ARTISAN") return "/artisan/dashboard"
  if (role === "ADMIN") return "/admin/dashboard"
  return "/customer/dashboard"
}

type RouteDecision =
  | { action: "next" }
  | { action: "redirect"; destination: string }

function resolveRoute(path: string, userId: string | null, jwtRole?: string, cookieRole?: string): RouteDecision {
  const publicPaths = ["/", "/sign-in", "/sign-up", "/artisan-apply", "/api/payments/webhook", "/auth/redirect", "/about", "/privacy", "/terms"]

  if (publicPaths.some((p) => path === p || path.startsWith(p + "/"))) {
    return { action: "next" }
  }

  if (!userId) {
    return { action: "redirect", destination: "/sign-in" }
  }

  const valid = (value?: string) =>
    value === "CUSTOMER" || value === "ARTISAN" || value === "ADMIN" ? value : undefined
  const role = valid(jwtRole) ?? valid(cookieRole)

  if (!role) {
    return { action: "redirect", destination: "/auth/redirect" }
  }

  const ROLE_PATHS = [
    { prefix: "/admin", role: "ADMIN" },
    { prefix: "/artisan", role: "ARTISAN" },
    { prefix: "/customer", role: "CUSTOMER" },
  ]

  for (const { prefix, role: requiredRole } of ROLE_PATHS) {
    if (path.startsWith(prefix) && role !== requiredRole) {
      return { action: "redirect", destination: getDashboard(role) }
    }
  }

  return { action: "next" }
}

describe("proxy role routing", () => {
  it("allows public paths without authentication", () => {
    expect(resolveRoute("/", null)).toEqual({ action: "next" })
    expect(resolveRoute("/sign-in", null)).toEqual({ action: "next" })
    expect(resolveRoute("/auth/redirect", null)).toEqual({ action: "next" })
  })

  it("redirects unauthenticated users to sign-in", () => {
    expect(resolveRoute("/admin/dashboard", null)).toEqual({
      action: "redirect",
      destination: "/sign-in",
    })
  })

  it("redirects authenticated users without a role to /auth/redirect", () => {
    expect(resolveRoute("/admin/dashboard", "user_1", undefined)).toEqual({
      action: "redirect",
      destination: "/auth/redirect",
    })
    expect(resolveRoute("/customer/browse", "user_1", undefined)).toEqual({
      action: "redirect",
      destination: "/auth/redirect",
    })
  })

  it("uses a cookie role when Clerk JWT metadata is still empty", () => {
    expect(resolveRoute("/customer/browse", "user_1", undefined, "CUSTOMER")).toEqual({ action: "next" })
  })

  it("blocks wrong-role access to protected sections", () => {
    expect(resolveRoute("/admin/dashboard", "user_1", "CUSTOMER")).toEqual({
      action: "redirect",
      destination: "/customer/dashboard",
    })
    expect(resolveRoute("/customer/browse", "user_1", "ARTISAN")).toEqual({
      action: "redirect",
      destination: "/artisan/dashboard",
    })
  })

  it("allows access when role matches the section", () => {
    expect(resolveRoute("/admin/dashboard", "admin_1", "ADMIN")).toEqual({ action: "next" })
    expect(resolveRoute("/customer/browse", "cust_1", "CUSTOMER")).toEqual({ action: "next" })
  })
})

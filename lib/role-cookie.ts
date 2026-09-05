export const ROLE_COOKIE = "sb_role"

const ROLES = ["CUSTOMER", "ARTISAN", "ADMIN"] as const
export type AppRole = (typeof ROLES)[number]

export function isAppRole(value?: string | null): value is AppRole {
  return value === "CUSTOMER" || value === "ARTISAN" || value === "ADMIN"
}

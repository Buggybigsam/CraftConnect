export const ADMIN_PAGE_SIZE = 25

export function parsePage(value?: string) {
  return Math.max(1, parseInt(value ?? "1", 10) || 1)
}

export function buildSearchQuery(
  params: Record<string, string | undefined>,
  page?: number
) {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (!value || key === "page") continue
    sp.set(key, value)
  }
  if (page && page > 1) sp.set("page", String(page))
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}

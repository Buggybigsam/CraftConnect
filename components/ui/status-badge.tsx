import { cn } from "@/lib/utils"

export function StatusBadge({
  value,
  styles,
  fallback = "bg-slate-50 text-slate-500 border-slate-100",
  className,
}: {
  value: string
  styles: Record<string, string>
  fallback?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[value] ?? fallback,
        className
      )}
    >
      {value}
    </span>
  )
}

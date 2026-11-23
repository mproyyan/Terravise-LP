import { cn } from "../../lib/utils"

interface PlateHeaderProps {
  number: string
  title: string
  metaRight?: string
  tone?: "light" | "dark"
  className?: string
}

export function PlateHeader({
  number,
  title,
  metaRight,
  tone = "light",
  className,
}: PlateHeaderProps) {
  const isDark = tone === "dark"

  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 border-b pb-3 mb-8 text-xs font-mono tracking-widest uppercase select-none",
        isDark ? "border-stone-800 text-stone-400" : "border-stone-200 text-stone-600",
        className
      )}
    >
      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            "font-semibold",
            isDark ? "text-amber-500" : "text-[#A0522D]"
          )}
        >
          {number}
        </span>
        <span className={cn(isDark ? "text-stone-200" : "text-stone-900 font-medium")}>
          {title}
        </span>
      </div>
      {metaRight && (
        <span className={cn("text-[11px]", isDark ? "text-stone-500" : "text-stone-400")}>
          {metaRight}
        </span>
      )}
    </div>
  )
}

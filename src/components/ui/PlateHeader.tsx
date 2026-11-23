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
        "flex items-baseline gap-4 border-b pb-3 mb-10 select-none font-mono text-[11px] tracking-[0.16em] uppercase",
        isDark
          ? "border-[#e8e5da]/15 text-[#e8e5da]/70"
          : "border-[#171814]/15 text-[#5c5f55]",
        className
      )}
    >
      <span
        className={cn(
          "font-bold shrink-0 tabular-nums",
          isDark ? "text-[#b78c75]" : "text-[#845942]"
        )}
      >
        {number}
      </span>
      <span
        className={cn(
          "font-semibold",
          isDark ? "text-[#e8e5da]" : "text-[#171814]"
        )}
      >
        {title}
      </span>
      {metaRight && (
        <span
          className={cn(
            "ml-auto text-right text-[10px] hidden sm:inline tabular-nums",
            isDark ? "text-[#e8e5da]/50" : "text-[#5c5f55]/70"
          )}
        >
          {metaRight}
        </span>
      )}
    </div>
  )
}

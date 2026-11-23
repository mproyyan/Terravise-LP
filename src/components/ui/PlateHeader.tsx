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
          ? "border-[#EFE7DE]/15 text-[#EFE7DE]/70"
          : "border-[#1C130D]/15 text-[#63554B]",
        className
      )}
    >
      <span
        className={cn(
          "font-bold shrink-0 tabular-nums",
          isDark ? "text-[#BD8564]" : "text-[#7A421D]"
        )}
      >
        {number}
      </span>
      <span
        className={cn(
          "font-semibold",
          isDark ? "text-[#EFE7DE]" : "text-[#1C130D]"
        )}
      >
        {title}
      </span>
      {metaRight && (
        <span
          className={cn(
            "ml-auto text-right text-[10px] hidden sm:inline tabular-nums",
            isDark ? "text-[#EFE7DE]/50" : "text-[#63554B]/70"
          )}
        >
          {metaRight}
        </span>
      )}
    </div>
  )
}

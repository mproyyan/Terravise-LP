import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "emerald" | "amber" | "clay" | "slate" | "outline" | "brand"
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.14em] uppercase rounded-none select-none"

  const variants = {
    default: "bg-[#E3D7C8]/70 text-[#1C130D] border border-[#1C130D]/20",
    emerald: "bg-[#FAD9BA]/45 text-[#381800] border border-[#5A3008]/40 font-semibold",
    brand: "bg-[#FAD9BA]/45 text-[#381800] border border-[#5A3008]/40 font-semibold",
    amber: "bg-[#D4A373]/30 text-[#5C2B06] border border-[#D4A373]/50 font-semibold",
    clay: "bg-[#9E623F]/20 text-[#5C2B06] border border-[#9E623F]/40 font-semibold",
    slate: "bg-[#1C130D]/10 text-[#1C130D] border border-[#1C130D]/25 font-semibold",
    outline: "bg-transparent text-[#63554B] border border-[#1C130D]/25",
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}

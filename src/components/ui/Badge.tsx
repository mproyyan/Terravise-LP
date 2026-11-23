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
    default: "bg-[#E3D7C8]/60 text-[#1C130D] border border-[#1C130D]/15",
    emerald: "bg-[#FAD9BA]/40 text-[#5A3008] border border-[#5A3008]/30",
    brand: "bg-[#FAD9BA]/40 text-[#5A3008] border border-[#5A3008]/30",
    amber: "bg-[#D4A373]/25 text-[#7A421D] border border-[#D4A373]/40",
    clay: "bg-[#9E623F]/15 text-[#7A421D] border border-[#9E623F]/30",
    slate: "bg-[#1C130D]/10 text-[#1C130D] border border-[#1C130D]/20",
    outline: "bg-transparent text-[#63554B] border border-[#1C130D]/20",
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}

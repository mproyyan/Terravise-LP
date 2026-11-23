import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "emerald" | "amber" | "clay" | "slate" | "outline"
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
    default: "bg-[#dedacd]/60 text-[#171814] border border-[#171814]/15",
    emerald: "bg-[#627056]/15 text-[#627056] border border-[#627056]/30",
    amber: "bg-[#d4a373]/20 text-[#845942] border border-[#d4a373]/40",
    clay: "bg-[#a0522d]/15 text-[#845942] border border-[#a0522d]/30",
    slate: "bg-[#171814]/10 text-[#171814] border border-[#171814]/20",
    outline: "bg-transparent text-[#5c5f55] border border-[#171814]/20",
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}

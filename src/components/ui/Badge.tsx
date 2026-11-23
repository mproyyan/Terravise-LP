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
    "inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] font-medium tracking-widest uppercase rounded-sm select-none"

  const variants = {
    default: "bg-stone-200/80 text-stone-700 border border-stone-300",
    emerald: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-700 border border-amber-500/30",
    clay: "bg-[#BC6C25]/10 text-[#845942] border border-[#BC6C25]/30",
    slate: "bg-[#1C3127]/10 text-[#1C3127] border border-[#1C3127]/25",
    outline: "bg-transparent text-stone-600 border border-stone-300",
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}

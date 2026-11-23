import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "emerald" | "ghost" | "dark"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-mono font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#845942]"

    const variants = {
      primary:
        "bg-[#171814] text-[#e8e5da] hover:bg-[#1f211b] active:bg-black shadow-xs border border-[#171814]",
      secondary:
        "bg-[#dedacd] text-[#171814] hover:bg-[#dedacd]/80 active:bg-[#dedacd]/60 border border-[#171814]/15",
      outline:
        "border border-[#171814]/20 bg-transparent text-[#171814] hover:bg-[#dedacd]/30 active:bg-[#dedacd]/50",
      emerald:
        "bg-[#627056] text-[#e8e5da] hover:bg-[#7c8c6c] active:bg-[#4a5541] shadow-xs border border-[#627056]",
      ghost:
        "bg-transparent text-[#171814] hover:bg-[#dedacd]/40 active:bg-[#dedacd]/60 border-none",
      dark:
        "bg-[#1f211b] text-[#e8e5da] hover:bg-[#2a2d25] border border-[#e8e5da]/20 active:bg-black",
    }

    const sizes = {
      sm: "text-xs px-3.5 py-2 min-h-[38px] gap-1.5",
      md: "text-xs px-5 py-2.5 min-h-[44px] gap-2",
      lg: "text-sm px-7 py-3.5 min-h-[48px] gap-2.5 tracking-widest",
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

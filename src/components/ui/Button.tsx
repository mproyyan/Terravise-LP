import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "emerald" | "ghost" | "dark" | "brand"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-mono font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A421D]"

    const variants = {
      primary:
        "bg-[#1C130D] text-[#EFE7DE] hover:bg-[#271C14] active:bg-[#120B07] shadow-xs border border-[#1C130D]",
      secondary:
        "bg-[#E3D7C8] text-[#1C130D] hover:bg-[#D7C8B6] active:bg-[#CBBBA7] border border-[#1C130D]/15",
      outline:
        "border border-[#1C130D]/20 bg-transparent text-[#1C130D] hover:bg-[#E3D7C8]/40 active:bg-[#E3D7C8]/60",
      emerald:
        "bg-[#5A3008] text-[#FAD9BA] hover:bg-[#452304] active:bg-[#301602] shadow-xs border border-[#5A3008]",
      brand:
        "bg-[#5A3008] text-[#FAD9BA] hover:bg-[#452304] active:bg-[#301602] shadow-xs border border-[#5A3008]",
      ghost:
        "bg-transparent text-[#1C130D] hover:bg-[#E3D7C8]/40 active:bg-[#E3D7C8]/60 border-none",
      dark:
        "bg-[#271C14] text-[#EFE7DE] hover:bg-[#36271D] border border-[#EFE7DE]/20 active:bg-[#1C130D]",
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

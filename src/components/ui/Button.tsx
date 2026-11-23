import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "emerald" | "ghost" | "dark"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-mono font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"

    const variants = {
      primary:
        "bg-stone-900 text-stone-100 hover:bg-stone-800 active:bg-stone-950 shadow-sm border border-stone-800",
      secondary:
        "bg-stone-100 text-stone-900 hover:bg-stone-200 active:bg-stone-300 border border-stone-300",
      outline:
        "border border-stone-300 bg-transparent text-stone-800 hover:bg-stone-100 active:bg-stone-200",
      emerald:
        "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm border border-emerald-700",
      ghost:
        "bg-transparent text-stone-700 hover:bg-stone-100 active:bg-stone-200 border-none",
      dark:
        "bg-[#121514] text-[#E8E5DA] hover:bg-[#1C211F] border border-stone-700 active:bg-black",
    }

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-xs px-4 py-2.5 gap-2",
      lg: "text-sm px-6 py-3.5 gap-2.5 tracking-widest",
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

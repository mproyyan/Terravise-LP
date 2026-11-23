import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "../../lib/utils"

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  valueDisplay?: string
  unit?: string
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, valueDisplay, unit, value, ...props }, ref) => (
  <div className="w-full space-y-2">
    {(label || valueDisplay) && (
      <div className="flex items-center justify-between text-xs font-mono">
        {label && <span className="text-[#5c5f55] uppercase tracking-wider">{label}</span>}
        {valueDisplay && (
          <span className="font-semibold text-[#171814] tabular-nums">
            {valueDisplay}
            {unit && <span className="text-[#5c5f55] font-normal ml-0.5">{unit}</span>}
          </span>
        )}
      </div>
    )}
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center cursor-pointer py-2 min-h-[36px]",
        className
      )}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-none bg-[#dedacd]">
        <SliderPrimitive.Range className="absolute h-full bg-[#171814]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-none border border-[#171814] bg-[#f4f2ec] ring-offset-[#f4f2ec] transition-colors focus-visible:outline-2 focus-visible:outline-[#845942] disabled:pointer-events-none disabled:opacity-50 hover:bg-white" />
    </SliderPrimitive.Root>
  </div>
))
Slider.displayName = SliderPrimitive.Root.displayName

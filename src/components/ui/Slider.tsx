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
  <div className="w-full space-y-1.5">
    {(label || valueDisplay) && (
      <div className="flex items-center justify-between text-xs font-mono">
        {label && <span className="text-stone-500 uppercase tracking-wider">{label}</span>}
        {valueDisplay && (
          <span className="font-semibold text-stone-900 tabular-nums">
            {valueDisplay}
            {unit && <span className="text-stone-400 font-normal ml-0.5">{unit}</span>}
          </span>
        )}
      </div>
    )}
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center cursor-pointer py-1",
        className
      )}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-stone-200">
        <SliderPrimitive.Range className="absolute h-full bg-stone-900" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-stone-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95" />
    </SliderPrimitive.Root>
  </div>
))
Slider.displayName = SliderPrimitive.Root.displayName

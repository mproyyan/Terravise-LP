import { useEffect, useRef } from "react"
import { useSubsurface3D, type MonolithStage } from "../../context/Subsurface3DContext"
import { SubsurfaceMonolithCanvas } from "./SubsurfaceMonolithCanvas"
import { Rotate3d } from "lucide-react"

interface Section3DAnchorDockProps {
  stage: MonolithStage
  tone?: "light" | "dark"
  title: string
  subtitle: string
  renderMobileCanvas?: boolean
  heightClass?: string
}

export function Section3DAnchorDock({
  stage,
  tone = "light",
  title,
  subtitle,
  renderMobileCanvas = true,
  heightClass = "h-[520px] xl:h-[580px]",
}: Section3DAnchorDockProps) {
  const { registerDock } = useSubsurface3D()
  const dockRef = useRef<HTMLDivElement>(null)
  const isDark = tone === "dark"

  useEffect(() => {
    registerDock(stage, dockRef.current)
    return () => registerDock(stage, null)
  }, [stage, registerDock])

  return (
    <div className="relative w-full">
      {/* Desktop Borderless Spatial Stage Slot (Open negative space with subtle corner hairlines) */}
      <div
        ref={dockRef}
        className={`hidden lg:flex flex-col justify-between w-full ${heightClass} relative select-none pointer-events-none`}
      >
        {/* Subtle Architectural Drafting Corner Marks (+) */}
        <div
          className={`flex items-center justify-between font-mono text-[10px] tracking-widest uppercase ${
            isDark ? "text-[#EFE7DE]/25" : "text-[#1C130D]/25"
          }`}
        >
          <span>+</span>
          <span className="text-[9px] tracking-[0.2em]">{title}</span>
          <span>+</span>
        </div>

        {/* Center Subtle Radial Glow so 3D object pops against light/dark canvas */}
        <div
          className="absolute inset-8 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(250,217,186,0.22) 0%, rgba(28,19,13,0) 70%)"
              : "radial-gradient(circle, rgba(212,163,115,0.28) 0%, rgba(251,247,242,0) 70%)",
          }}
        />

        <div
          className={`flex items-center justify-between font-mono text-[10px] tracking-widest uppercase ${
            isDark ? "text-[#EFE7DE]/25" : "text-[#1C130D]/25"
          }`}
        >
          <span>+</span>
          <span>+</span>
        </div>
      </div>

      {/* Mobile & Tablet Inline View (< 1024px) */}
      <div className="lg:hidden w-full space-y-2">
        {renderMobileCanvas && (
          <div className="w-full h-[360px] relative overflow-hidden">
            <SubsurfaceMonolithCanvas />
          </div>
        )}
        <div
          className={`flex items-center justify-between font-mono text-[10px] px-2 py-1 border-t ${
            isDark
              ? "border-[#EFE7DE]/15 text-[#EFE7DE]/70"
              : "border-[#1C130D]/15 text-[#63554B]"
          }`}
        >
          <span className="font-bold uppercase tracking-wider">{title}</span>
          <span className="flex items-center gap-1">
            <Rotate3d className="w-3 h-3" />
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  )
}

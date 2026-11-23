import React, { useEffect, useState } from "react"
import { DEPTH_STAGES } from "../../data/mockGeology"

export function DepthSidebarTracker() {
  const [activeDepth, setActiveDepth] = useState<string>("0.0 m")
  const [depthProgress, setDepthProgress] = useState<number>(0)
  const [currentSectionId, setCurrentSectionId] = useState<string>("hero")

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const rawProgress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0
      setDepthProgress(rawProgress)

      // Calculate corresponding depth from 0.0m to -25.0m
      const calculatedDepth = (rawProgress * -25.0).toFixed(1)
      setActiveDepth(`${calculatedDepth} m`)

      // Check section visibility for label sync
      const sections = DEPTH_STAGES.map((s) => ({
        id: s.sectionId,
        el: document.getElementById(s.sectionId),
        depth: s.depth,
      }))

      for (let i = sections.length - 1; i >= 0; i--) {
        const item = sections[i]
        if (item.el) {
          const rect = item.el.getBoundingClientRect()
          if (rect.top <= window.innerHeight * 0.45) {
            setCurrentSectionId(item.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <aside
      aria-label="Subsurface Depth Meter"
      className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end select-none pointer-events-none"
    >
      <div className="bg-[#121514]/90 backdrop-blur-md border border-stone-800 p-3 rounded-none shadow-xl pointer-events-auto flex flex-col items-end gap-3 text-right">
        {/* Current Active Depth Readout */}
        <div className="flex flex-col items-end border-b border-stone-800 pb-2 w-full">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Depth</span>
          </div>
          <span className="font-mono text-lg font-bold text-amber-400 tabular-nums tracking-tight">
            {activeDepth}
          </span>
        </div>

        {/* Vertical Depth Scale Rail */}
        <div className="relative flex items-stretch gap-3 pr-1 py-1">
          {/* Depth Stages Navigation List */}
          <div className="flex flex-col justify-between py-1 text-[11px] font-mono tracking-wider">
            {DEPTH_STAGES.map((stage) => {
              const isActive = currentSectionId === stage.sectionId
              return (
                <button
                  key={stage.depth}
                  onClick={() => scrollToSection(stage.sectionId)}
                  className={`text-right transition-colors cursor-pointer group flex items-center justify-end gap-2 ${
                    isActive
                      ? "text-stone-100 font-bold"
                      : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <span
                    className={`text-[9px] uppercase tracking-widest hidden xl:inline opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? "opacity-100 text-stone-400" : ""
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span
                    className={`tabular-nums ${
                      isActive ? "text-amber-400" : "text-stone-500"
                    }`}
                  >
                    {stage.depth}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Graphical Rail Track */}
          <div className="relative w-1.5 bg-stone-800 rounded-full overflow-hidden self-stretch my-1">
            <div
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-amber-500 via-emerald-500 to-rose-500 transition-all duration-75"
              style={{ height: `${depthProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Stratum Indicator Tag */}
        <div className="text-[9px] font-mono text-stone-500 uppercase tracking-widest text-right">
          <span>Stratum Horizon</span>
        </div>
      </div>
    </aside>
  )
}

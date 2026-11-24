import { useEffect, useState } from "react"
import { DEPTH_STAGES } from "../../data/mockGeology"
import { ChevronLeft, ChevronRight, EyeOff, Ruler } from "lucide-react"

export function DepthSidebarTracker() {
  const [activeDepth, setActiveDepth] = useState<string>("0.0 m")
  const [depthProgress, setDepthProgress] = useState<number>(0)
  const [currentSectionId, setCurrentSectionId] = useState<string>("hero")
  const [expanded, setExpanded] = useState<boolean>(false)
  const [minimized, setMinimized] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const rawProgress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0
      setDepthProgress(rawProgress)

      const calculatedDepth = (rawProgress * -25.0).toFixed(1)
      setActiveDepth(`${calculatedDepth} m`)

      const sections = DEPTH_STAGES.map((s) => ({
        id: s.sectionId,
        el: document.getElementById(s.sectionId),
        depth: s.depth,
      }))

      for (let i = sections.length - 1; i >= 0; i--) {
        const item = sections[i]
        if (item.el) {
          const rect = item.el.getBoundingClientRect()
          if (rect.top <= window.innerHeight * 0.48) {
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

  // Minimized Mode: Floating Depth Pill in Bottom-Right Corner
  if (minimized) {
    return (
      <aside
        aria-label="Subsurface depth meter minimized"
        className="flex fixed right-3 bottom-4 sm:right-4 sm:bottom-4 z-40 select-none"
      >
        <button
          type="button"
          onClick={() => setMinimized(false)}
          aria-label="Expand depth datum rail"
          className="bg-[#1C130D]/95 hover:bg-[#271C14] border border-[#EFE7DE]/25 px-2.5 py-1.5 shadow-xl flex items-center gap-2 font-mono text-[10px] text-[#EFE7DE] cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FAD9BA]"
        >
          <Ruler className="w-3.5 h-3.5 text-[#FAD9BA]" />
          <span className="font-bold text-[#FAD9BA] tabular-nums">{activeDepth}</span>
          <span className="text-[8px] text-[#BD8564] font-bold uppercase tracking-wider">Datum</span>
          <ChevronLeft className="w-3 h-3 text-[#EFE7DE]/60" />
        </button>
      </aside>
    )
  }

  return (
    <aside
      aria-label="Subsurface depth meter"
      onMouseLeave={() => setExpanded(false)}
      className="hidden lg:flex fixed right-2 top-1/2 -translate-y-1/2 z-40 flex-col items-end select-none pointer-events-none max-h-[calc(100vh-2rem)]"
    >
      <div
        className={`bg-[#1C130D]/92 backdrop-blur-md border border-[#EFE7DE]/20 shadow-xl pointer-events-auto flex flex-col items-end transition-all duration-200 overflow-x-hidden ${
          expanded ? "p-2.5 gap-2 w-auto min-w-[144px]" : "p-2 gap-1.5 w-[70px]"
        }`}
      >
        {/* Top Controls + Compact Depth Readout */}
        <div className="flex flex-col items-end border-b border-[#EFE7DE]/15 pb-1.5 w-full">
          <div className="flex items-center justify-between w-full gap-1">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse depth labels" : "Expand depth stages"}
              className="text-[#EFE7DE]/60 hover:text-[#FAD9BA] p-0.5 cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] flex items-center justify-center shrink-0"
            >
              {expanded ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>

            <span className="font-mono text-[8px] text-[#BD8564] uppercase tracking-wider font-bold">
              Datum
            </span>

            <button
              type="button"
              onClick={() => setMinimized(true)}
              aria-label="Minimize depth tracker"
              className="text-[#EFE7DE]/45 hover:text-[#EFE7DE] p-0.5 cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] flex items-center justify-center shrink-0"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          </div>

          <span className="font-mono text-[11px] font-bold text-[#FAD9BA] tabular-nums tracking-tight mt-1 text-center w-full block">
            {activeDepth}
          </span>
        </div>

        {/* Vertical Depth Rod & Compact Stage Ticks */}
        <div className="relative flex items-stretch gap-1.5 py-0.5 w-full justify-end">
          {/* Depth Stages Navigation List */}
          <div className="flex flex-col justify-between py-0.5 font-mono">
            {DEPTH_STAGES.map((stage) => {
              const isActive = currentSectionId === stage.sectionId
              const shortDepth = stage.depth.replace(" m", "m")
              return (
                <button
                  key={stage.depth}
                  type="button"
                  onClick={() => scrollToSection(stage.sectionId)}
                  aria-label={`Jump to ${stage.label} at depth ${stage.depth}`}
                  className={`text-right transition-colors cursor-pointer group flex items-center justify-end gap-1.5 py-0.5 min-h-[26px] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] ${
                    isActive
                      ? "text-[#EFE7DE] font-bold"
                      : "text-[#EFE7DE]/45 hover:text-[#EFE7DE]/85"
                  }`}
                >
                  {expanded && (
                    <span
                      className={`text-[9px] uppercase tracking-wider whitespace-nowrap ${
                        isActive ? "text-[#FAD9BA]" : "text-[#EFE7DE]/60"
                      }`}
                    >
                      {stage.label}
                    </span>
                  )}
                  <span
                    className={`tabular-nums text-[9px] px-1 py-0.5 border leading-none shrink-0 ${
                      isActive
                        ? "border-[#BD8564] bg-[#271C14] text-[#FAD9BA]"
                        : "border-transparent text-[#EFE7DE]/45"
                    }`}
                  >
                    {shortDepth}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Continuous Micro Depth Progress Bar */}
          <div className="w-1 bg-[#271C14] border border-[#EFE7DE]/15 relative overflow-hidden flex flex-col justify-end shrink-0">
            <div
              className="w-full bg-[#10B981] transition-all duration-150"
              style={{ height: `${Math.round(depthProgress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

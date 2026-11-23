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

  // Minimized Mode: Tiny Floating Depth Pill in Bottom-Right Corner
  if (minimized) {
    return (
      <aside
        aria-label="Subsurface depth meter minimized"
        className="hidden lg:flex fixed right-3 bottom-4 z-40 select-none"
      >
        <button
          type="button"
          onClick={() => setMinimized(false)}
          title="Show depth datum rail"
          className="bg-[#1C130D]/95 hover:bg-[#271C14] border border-[#EFE7DE]/25 px-2.5 py-1.5 shadow-lg flex items-center gap-2 font-mono text-[10px] text-[#EFE7DE] cursor-pointer transition-colors"
        >
          <Ruler className="w-3 h-3 text-[#FAD9BA]" />
          <span className="font-bold text-[#FAD9BA] tabular-nums">{activeDepth}</span>
          <ChevronLeft className="w-3 h-3 text-[#EFE7DE]/60" />
        </button>
      </aside>
    )
  }

  return (
    <aside
      aria-label="Subsurface depth meter"
      onMouseLeave={() => setExpanded(false)}
      className="hidden lg:flex fixed right-2 top-1/2 -translate-y-1/2 z-40 flex-col items-end select-none pointer-events-none"
    >
      <div
        className={`bg-[#1C130D]/92 backdrop-blur-md border border-[#EFE7DE]/20 shadow-xl pointer-events-auto flex flex-col items-end transition-all duration-200 ${
          expanded ? "p-2.5 gap-2 w-auto" : "p-1.5 gap-1.5 w-[52px]"
        }`}
      >
        {/* Top Controls + Compact Depth Readout */}
        <div className="flex flex-col items-end border-b border-[#EFE7DE]/15 pb-1.5 w-full">
          <div className="flex items-center justify-between w-full gap-1">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Collapse depth labels" : "Expand depth stages"}
              aria-label={expanded ? "Collapse depth labels" : "Expand depth stages"}
              className="text-[#EFE7DE]/60 hover:text-[#FAD9BA] p-0.5 cursor-pointer transition-colors"
            >
              {expanded ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronLeft className="w-3 h-3" />
              )}
            </button>

            {expanded && (
              <span className="font-mono text-[8px] text-[#EFE7DE]/50 uppercase tracking-widest">
                Datum
              </span>
            )}

            <button
              type="button"
              onClick={() => setMinimized(true)}
              title="Minimize depth tracker"
              aria-label="Minimize depth tracker"
              className="text-[#EFE7DE]/45 hover:text-[#EFE7DE] p-0.5 cursor-pointer transition-colors"
            >
              <EyeOff className="w-2.5 h-2.5" />
            </button>
          </div>

          <span className="font-mono text-[11px] font-bold text-[#FAD9BA] tabular-nums tracking-tight mt-0.5 self-center">
            {activeDepth}
          </span>
        </div>

        {/* Vertical Depth Rod & Compact Stage Ticks */}
        <div className="relative flex items-stretch gap-1.5 py-0.5">
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
                  title={`${stage.depth} — ${stage.label}`}
                  className={`text-right transition-colors cursor-pointer group flex items-center justify-end gap-1.5 py-0.5 min-h-[24px] ${
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
                    className={`tabular-nums text-[9px] px-1 py-0.5 border leading-none ${
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

          {/* Slim Surveyor's Brass Rod (4px wide) */}
          <div className="relative w-1 bg-[#271C14] border border-[#EFE7DE]/20 self-stretch my-0.5 overflow-hidden flex flex-col justify-between shrink-0">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-full h-px bg-[#EFE7DE]/20" />
            ))}
            <div
              className="absolute top-0 left-0 right-0 bg-[#BD8564] transition-all duration-75"
              style={{ height: `${depthProgress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

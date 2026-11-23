import { useEffect, useState } from "react"
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
      aria-label="Subsurface depth meter"
      className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end select-none pointer-events-none"
    >
      <div className="bg-[#171814]/95 backdrop-blur-sm border border-[#e8e5da]/15 p-3 rounded-none shadow-2xl pointer-events-auto flex flex-col items-end gap-3 text-right">
        {/* Readout */}
        <div className="flex flex-col items-end border-b border-[#e8e5da]/15 pb-2 w-full">
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#e8e5da]/60 uppercase tracking-[0.16em]">
            <span className="w-1.5 h-1.5 rounded-none bg-[#7c8c6c]" />
            <span>Depth datum</span>
          </div>
          <span className="font-mono text-xl font-bold text-[#e8e5da] tabular-nums tracking-tight">
            {activeDepth}
          </span>
        </div>

        {/* Vertical Depth Rod & Stages */}
        <div className="relative flex items-stretch gap-3 pr-1 py-1">
          {/* Depth Stages Navigation List */}
          <div className="flex flex-col justify-between py-1 text-[10px] font-mono tracking-wider">
            {DEPTH_STAGES.map((stage) => {
              const isActive = currentSectionId === stage.sectionId
              return (
                <button
                  key={stage.depth}
                  onClick={() => scrollToSection(stage.sectionId)}
                  className={`text-right transition-colors cursor-pointer group flex items-center justify-end gap-2 py-1 min-h-[36px] ${
                    isActive
                      ? "text-[#e8e5da] font-bold"
                      : "text-[#e8e5da]/40 hover:text-[#e8e5da]/80"
                  }`}
                >
                  <span
                    className={`text-[9px] uppercase tracking-widest hidden xl:inline transition-opacity ${
                      isActive ? "opacity-100 text-[#b78c75]" : "opacity-0 group-hover:opacity-60"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span
                    className={`tabular-nums px-1 py-0.5 border ${
                      isActive
                        ? "border-[#b78c75] bg-[#1f211b] text-[#e8e5da]"
                        : "border-transparent text-[#e8e5da]/40"
                    }`}
                  >
                    {stage.depth}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Surveyor's Brass Rod with Etched Millimeter Ticks */}
          <div className="relative w-2 bg-[#1f211b] border border-[#e8e5da]/20 self-stretch my-1 overflow-hidden flex flex-col justify-between">
            {/* Tick marks */}
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-full h-px bg-[#e8e5da]/20" />
            ))}
            {/* Active penetration indicator */}
            <div
              className="absolute top-0 left-0 right-0 bg-[#b78c75] transition-all duration-75"
              style={{ height: `${depthProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Footer Coordinate Tag */}
        <div className="text-[9px] font-mono text-[#e8e5da]/40 uppercase tracking-[0.16em] text-right">
          <span>UTM Zone 48S</span>
        </div>
      </div>
    </aside>
  )
}

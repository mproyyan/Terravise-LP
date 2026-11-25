import { useEffect, useRef } from "react"
import { PlateHeader } from "../ui/PlateHeader"
import { SITE_CONTENT } from "../../data/siteContent"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { STRATA_LAYER_SPECS } from "../three/geology3DUtils"
import { AlertCircle, Clock, Database } from "lucide-react"

export function ProblemSection() {
  const { problem } = SITE_CONTENT
  const {
    hoveredProblemZone,
    setHoveredProblemZone,
    hoveredLayerId,
    setHoveredLayerId,
    registerDock,
  } = useSubsurface3D()
  const problemDockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerDock("problem", problemDockRef.current)
    return () => registerDock("problem", null)
  }, [registerDock])

  const getCardIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Clock className="w-4 h-4 text-[#7A421D]" />
      case 1:
        return <AlertCircle className="w-4 h-4 text-[#E76F51]" />
      case 2:
      default:
        return <Database className="w-4 h-4 text-[#9A3412]" />
    }
  }

  const zoneTags = [
    "WEST ZONE · 5 REDUNDANT BOREHOLES",
    "CENTER CUTAWAY · UNDETECTED SOFT CLAY LENS",
    "EAST ZONE · PREMATURE BUDGET CUTOFF",
  ]

  return (
    <section
      id="problem"
      aria-label="Section 01: Investigation limits"
      className="min-h-screen min-h-[100dvh] flex flex-col justify-center py-24 lg:py-28 border-b border-[#1C130D]/15 scroll-mt-12 relative"
    >
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Architectural Plate Header */}
        <PlateHeader
          number="01"
          title="Below the surface"
          metaRight="Exploded L-cutaway strata & blind-grid failure dissection"
          tone="light"
        />

        {/* Top Editorial Row (Sits cleanly above the 3D cutaway stage, never blocked by 3D) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-6">
          <div className="lg:col-span-7 space-y-3">
            <h2 className="font-sans font-black text-3xl sm:text-5xl xl:text-[54px] text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.9] text-balance">
              {problem.heading}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-sans text-[#63554B] text-sm sm:text-base leading-relaxed bg-[#FBF7F2]/85 backdrop-blur-xs p-4 border-l-2 border-[#7A421D] text-pretty">
              {problem.subheading}
            </p>
          </div>
        </div>

        {/* Rapidkert Stage: Exploded 3D L-Cutaway Block + Horizontal Stratigraphic Callout Lines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-4">
          {/* Left 4 Columns: Stratigraphic Callout Pointers (01..04) */}
          <div className="lg:col-span-4 space-y-2.5 font-mono relative z-20">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[#7A421D] font-bold pb-1 border-b border-[#1C130D]/15 flex items-center justify-between">
              <span>Exploded Stratigraphic Horizons</span>
              <span className="text-[9px] text-[#63554B]">Hover or focus to highlight</span>
            </div>
            {STRATA_LAYER_SPECS.map((spec) => {
              const isHovered = hoveredLayerId === spec.id
              const isClayTrap = spec.id === "layer-3"
              return (
                <div
                  key={spec.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${spec.name}, depth ${spec.depthLabel}`}
                  onMouseEnter={() => setHoveredLayerId(spec.id)}
                  onMouseLeave={() => setHoveredLayerId(null)}
                  onFocus={() => setHoveredLayerId(spec.id)}
                  onBlur={() => setHoveredLayerId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setHoveredLayerId(isHovered ? null : spec.id)
                    }
                  }}
                  className={`p-3 border transition-all cursor-pointer flex items-center justify-between gap-3 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008] select-none ${
                    isHovered
                      ? "bg-white border-[#5A3008] translate-x-1 shadow-md"
                      : isClayTrap
                        ? "bg-[#FAF5EE]/95 border-[#E76F51]/60"
                        : "bg-[#FAF5EE]/90 border-[#1C130D]/15 hover:border-[#1C130D]/35"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-6 shrink-0"
                      style={{ backgroundColor: spec.colorHex }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1C130D] flex items-center gap-1.5">
                        <span className="text-[#7A421D]">{spec.code}</span>
                        <span className="truncate">{spec.name}</span>
                      </div>
                      <div className="text-[10px] text-[#63554B] tabular-nums">
                        Depth: {spec.depthLabel}
                      </div>
                    </div>
                  </div>
                  {/* Horizontal Leader Dash pointing right toward the 3D Exploded Layer */}
                  <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] uppercase tracking-wider text-[#7A421D]">
                      {isClayTrap ? "HAZARD TRAP" : "HORIZON"}
                    </span>
                    <span className="w-6 h-px bg-[#7A421D]/60 inline-block" />
                    <span className="w-1.5 h-1.5 bg-[#7A421D] inline-block" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right 8 Columns: Dedicated 3D Exploded L-Cutaway Dissection Stage */}
          <div className="lg:col-span-8 relative">
            <div
              ref={problemDockRef}
              className="w-full h-[320px] sm:h-[400px] lg:h-[430px] xl:h-[470px] relative select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Bottom 3-Card Technical Grid Breakdown (Interactive with 3D Ground Stage) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#1C130D]/15">
          {problem.cards.map((card, idx) => {
            const isFocused = hoveredProblemZone === idx
            return (
              <article
                key={card.number}
                role="button"
                tabIndex={0}
                aria-label={`${card.title}: ${card.impact}`}
                onMouseEnter={() => setHoveredProblemZone(idx)}
                onMouseLeave={() => setHoveredProblemZone(null)}
                onFocus={() => setHoveredProblemZone(idx)}
                onBlur={() => setHoveredProblemZone(null)}
                onClick={() => setHoveredProblemZone(hoveredProblemZone === idx ? null : idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setHoveredProblemZone(hoveredProblemZone === idx ? null : idx)
                  }
                }}
                className={`p-6 border flex flex-col justify-between space-y-4 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008] select-none ${
                  isFocused
                    ? "bg-white border-[#5A3008] -translate-y-1 shadow-lg"
                    : "bg-[#FAF5EE] border-[#1C130D]/15 hover:border-[#1C130D]/35"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#7A421D] tabular-nums">
                      {card.number}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-[#7A421D] hidden xl:inline">
                        {zoneTags[idx].split("·")[0].trim()}
                      </span>
                      {getCardIcon(idx)}
                    </div>
                  </div>
                  <h3 className="font-sans font-bold text-lg uppercase tracking-tight text-[#1C130D]">
                    {card.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed text-pretty">
                    {card.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1C130D]/10 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#63554B] uppercase tracking-wider">IMPACT</span>
                  <span className="font-bold text-[#1C130D] tabular-nums">{card.impact}</span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

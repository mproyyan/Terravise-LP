import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { Section3DAnchorDock } from "../three/Section3DAnchorDock"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { AlertCircle, Clock, Database } from "lucide-react"

export function ProblemSection() {
  const { problem } = SITE_CONTENT
  const { setHoveredLayerId } = useSubsurface3D()

  const getCardIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Clock className="w-4 h-4 text-[#7A421D]" />
      case 1:
        return <AlertCircle className="w-4 h-4 text-[#9E623F]" />
      case 2:
      default:
        return <Database className="w-4 h-4 text-[#63554B]" />
    }
  }

  const getMappedLayerId = (index: number) => {
    if (index === 0) return "layer-1"
    if (index === 1) return "layer-3"
    return "layer-2"
  }

  return (
    <section
      id="problem"
      className="py-24 bg-[#FBF7F2] border-b border-[#1C130D]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Architectural Plate Header */}
        <PlateHeader
          number="01"
          title="Investigation limits"
          metaRight="Exploded strata fracture analysis"
          tone="light"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Narrative + 3 Comparison Cards */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92]">
                {problem.heading}
              </h2>
              <p className="font-sans text-[#63554B] text-base sm:text-lg leading-relaxed">
                {problem.subheading}
              </p>
            </div>

            {/* 3 Comparison Architectural Cards */}
            <div className="space-y-5">
              {problem.cards.map((card, idx) => (
                <div
                  key={card.number}
                  onMouseEnter={() => setHoveredLayerId(getMappedLayerId(idx))}
                  onMouseLeave={() => setHoveredLayerId(null)}
                  className="bg-[#FAF5EE] border border-[#1C130D]/15 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#1C130D] transition-colors shadow-xs group"
                >
                  <div className="space-y-2.5 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#7A421D]">
                        {card.number}
                      </span>
                      <div className="p-1.5 bg-[#E3D7C8]/40 border border-[#1C130D]/10">
                        {getCardIcon(idx)}
                      </div>
                      <h3 className="font-sans font-bold text-lg text-[#1C130D] tracking-tight">
                        {card.title}
                      </h3>
                      <Badge variant={idx === 0 ? "amber" : idx === 1 ? "clay" : "slate"}>
                        {card.badge}
                      </Badge>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-[#1C130D]/10 sm:pl-6 font-mono">
                    <span className="text-[10px] uppercase text-[#63554B] tracking-wider block">
                      Field consequence
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-[#1C130D]">
                      {card.impact}
                    </span>
                    <span className="block text-[9px] text-[#7A421D] mt-1">
                      {idx === 1
                        ? "→ See Layer 03 (-6.5m to -14m) in 3D"
                        : idx === 0
                          ? "→ See Layer 01 (-0.0m to -2.0m) in 3D"
                          : "→ See Layer 02 (-2.0m to -6.5m) in 3D"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Columns: Exploded 3D Monolith Stage Dock */}
          <div className="lg:col-span-5">
            <Section3DAnchorDock
              stage="problem"
              tone="light"
              title="Exploded Strata Dissection"
              subtitle="Layer 03 Soft Clay Anomaly Exposed"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

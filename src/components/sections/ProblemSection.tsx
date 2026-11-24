import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { Section3DAnchorDock } from "../three/Section3DAnchorDock"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { AlertCircle, Clock, Database, MoveHorizontal } from "lucide-react"

export function ProblemSection() {
  const { problem } = SITE_CONTENT
  const { hoveredProblemZone, setHoveredProblemZone } = useSubsurface3D()

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
    "WEST TRENCH ZONE · 5 REDUNDANT BOREHOLES",
    "CENTER TRENCH ZONE · HIDDEN SOFT CLAY LENS",
    "EAST TRENCH ZONE · PREMATURE BUDGET CUTOFF",
  ]

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
          metaRight="Panoramic 3-zone geological trench dissection"
          tone="light"
        />

        {/* Centered Editorial Headline + Zone Pan Indicator */}
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFE7DE] border border-[#1C130D]/15 font-mono text-[10px] uppercase tracking-widest text-[#7A421D]">
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Scroll or hover cards below to pan camera across the 3 failure zones</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-5xl xl:text-6xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.9]">
            {problem.heading}
          </h2>
          <p className="font-sans text-[#63554B] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {problem.subheading}
          </p>
        </div>

        {/* Full-Width 12-Column Panoramic 3D Trench Stage */}
        <div className="relative w-full mb-4">
          <Section3DAnchorDock
            stage="problem"
            tone="light"
            title="01 / Panoramic 3-Zone Subsurface Cross-Section Trench (-6.5m to -14.0m)"
            subtitle="West: Over-drilling · Center: Soft Clay Pocket · East: Budget Cutoff"
            renderMobileCanvas={false}
            heightClass="h-[380px] xl:h-[430px]"
          />
        </div>

        {/* 3-Column Horizontal Architectural Error Deck with Vertical Zone Leader Lines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-30">
          {problem.cards.map((card, idx) => {
            const isFocused = hoveredProblemZone === idx
            const isCenterClay = idx === 1

            return (
              <div
                key={card.number}
                onMouseEnter={() => setHoveredProblemZone(idx)}
                onMouseLeave={() => setHoveredProblemZone(null)}
                onClick={() =>
                  setHoveredProblemZone(hoveredProblemZone === idx ? null : idx)
                }
                className="flex flex-col cursor-pointer group"
              >
                {/* Vertical Architectural Leader Line pointing up into the 3D Trench Zone */}
                <div className="hidden lg:flex flex-col items-center pb-2 select-none">
                  <span
                    className={`w-2.5 h-2.5 transition-transform duration-200 ${
                      isFocused
                        ? "bg-[#E76F51] scale-125"
                        : isCenterClay
                          ? "bg-[#E76F51]"
                          : "bg-[#7A421D]"
                    }`}
                  />
                  <div
                    className={`w-px h-7 border-l border-dashed transition-colors ${
                      isFocused ? "border-[#E76F51]" : "border-[#1C130D]/30"
                    }`}
                  />
                  <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 bg-[#EFE7DE] border border-[#1C130D]/15 text-[#7A421D]">
                    {zoneTags[idx]}
                  </span>
                </div>

                {/* Architectural Error Card */}
                <div
                  className={`flex-1 bg-[#FAF5EE] border p-6 flex flex-col justify-between transition-all shadow-xs ${
                    isFocused
                      ? "border-[#5A3008] bg-white -translate-y-1 shadow-xl"
                      : isCenterClay
                        ? "border-t-4 border-t-[#E76F51] border-[#1C130D]/20"
                        : "border-[#1C130D]/15 hover:border-[#1C130D]/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1C130D]/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#7A421D] bg-[#EFE7DE] px-1.5 py-0.5 border border-[#1C130D]/10">
                          {card.number}
                        </span>
                        <div className="p-1.5 bg-[#E3D7C8]/50 border border-[#1C130D]/10">
                          {getCardIcon(idx)}
                        </div>
                      </div>
                      <Badge variant={idx === 0 ? "amber" : idx === 1 ? "clay" : "slate"}>
                        {card.badge}
                      </Badge>
                    </div>

                    <h3 className="font-sans font-bold text-lg text-[#1C130D] tracking-tight">
                      {card.title}
                    </h3>

                    <p className="font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#1C130D]/10 flex items-center justify-between font-mono text-xs">
                    <span className="text-[10px] uppercase text-[#63554B] tracking-wider">
                      Field consequence
                    </span>
                    <span className="font-bold text-[#1C130D]">{card.impact}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

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
        return <AlertCircle className="w-4 h-4 text-[#E76F51]" />
      case 2:
      default:
        return <Database className="w-4 h-4 text-[#63554B]" />
    }
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
          metaRight="Isolated Layer 03 soft clay anomaly dissection"
          tone="light"
        />

        {/* 12-Column Editorial Split Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
          <div className="lg:col-span-7">
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92]">
              {problem.heading}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-sans text-[#63554B] text-sm sm:text-base leading-relaxed">
              {problem.subheading}
            </p>
          </div>
        </div>

        {/* Main 6:6 Split: Left 3 Architectural Error Ledgers | Right Isolated 3D Soft Clay Anomaly Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 6 Columns: 3 Stacked Architectural Cards */}
          <div className="lg:col-span-6 space-y-4">
            {problem.cards.map((card, idx) => {
              const isClayHazard = idx === 1
              return (
                <div
                  key={card.number}
                  onMouseEnter={() => setHoveredLayerId("layer-3")}
                  onMouseLeave={() => setHoveredLayerId(null)}
                  className={`bg-[#FAF5EE] border p-5 sm:p-6 transition-colors shadow-xs ${
                    isClayHazard
                      ? "border-l-4 border-l-[#E76F51] border-[#1C130D]/25"
                      : "border-[#1C130D]/15 hover:border-[#1C130D]/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C130D]/10 pb-2.5 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#7A421D]">
                        {card.number}
                      </span>
                      <div className="p-1 bg-[#E3D7C8]/50 border border-[#1C130D]/10">
                        {getCardIcon(idx)}
                      </div>
                      <h3 className="font-sans font-bold text-base sm:text-lg text-[#1C130D] tracking-tight">
                        {card.title}
                      </h3>
                    </div>
                    <Badge variant={idx === 0 ? "amber" : idx === 1 ? "clay" : "slate"}>
                      {card.badge}
                    </Badge>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed mb-3">
                    {card.description}
                  </p>

                  <div className="pt-2.5 border-t border-[#1C130D]/10 flex items-center justify-between font-mono text-xs">
                    <span className="text-[10px] uppercase text-[#63554B] tracking-wider">
                      Field consequence
                    </span>
                    <span className="font-bold text-[#1C130D]">{card.impact}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right 6 Columns: Open Borderless 3D Isolated Soft Clay Lens & 4 Blind Boreholes */}
          <div className="lg:col-span-6 space-y-3">
            <Section3DAnchorDock
              stage="problem"
              tone="light"
              title="01 / Isolated Soft Clay Lens (-6.5m to -14.0m)"
              subtitle="4 Corner Boreholes Miss Central Anomaly"
              renderMobileCanvas={false}
              heightClass="h-[460px] xl:h-[520px]"
            />

            {/* Minimalist 3-Column Legend under the 3D Dissection */}
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] pt-2 border-t border-[#1C130D]/15">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#E76F51] shrink-0" />
                <span className="text-[#1C130D] truncate">3D Soft Clay Pocket</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#1C130D] shrink-0" />
                <span className="text-[#63554B] truncate">4 Rigid 25m Boreholes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 border border-[#A0522D] bg-[#A0522D]/25 shrink-0" />
                <span className="text-[#63554B] truncate">Layer 03 X-Ray Shell</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { PlateHeader } from "../ui/PlateHeader"
import { Slider } from "../ui/Slider"
import { BearingComparisonTable } from "../interactive/BearingComparisonTable"
import { SITE_CONTENT } from "../../data/siteContent"
import { Section3DAnchorDock } from "../three/Section3DAnchorDock"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { SlidersHorizontal } from "lucide-react"

export function BearingStratumSection() {
  const { bearing } = SITE_CONTENT
  const { bearingCriteria, setBearingCriteria } = useSubsurface3D()
  const { minQc, maxIc, minThickness } = bearingCriteria

  return (
    <section
      id="stratum"
      className="py-24 bg-[#FBF7F2] border-b border-[#1C130D]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="04"
          title="Bearing layer verification"
          metaRight="3D structural pile cage & undulating bedrock terrain"
          tone="light"
        />

        {/* 12-Column Editorial Split Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-7">
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92]">
              {bearing.heading}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-sans text-[#63554B] text-sm sm:text-base leading-relaxed">
              {bearing.subheading}
            </p>
          </div>
        </div>

        {/* Main 6:6 Split: Left Criteria Sliders & Pile Schedule Table | Right 3D Structural Pile Cage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 6 Columns: Parametric Sliders + Foundation Comparison Table */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#FAF5EE] border border-[#1C130D]/15 p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs uppercase tracking-wider text-[#1C130D] font-bold border-b border-[#1C130D]/10 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#7A421D]" />
                  <span>Interactive 3D pile cutoff criteria</span>
                </div>
                <span className="text-[10px] text-[#7A421D] font-normal">
                  Moves 3D laser datum &amp; pile toes live
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Slider
                  label="Min tip qc"
                  value={[minQc]}
                  onValueChange={(val) =>
                    setBearingCriteria((prev) => ({ ...prev, minQc: val[0] }))
                  }
                  min={10.0}
                  max={25.0}
                  step={0.5}
                  valueDisplay={`${minQc.toFixed(1)}`}
                  unit="MPa"
                />

                <Slider
                  label="Max SBT Ic"
                  value={[maxIc]}
                  onValueChange={(val) =>
                    setBearingCriteria((prev) => ({ ...prev, maxIc: val[0] }))
                  }
                  min={1.2}
                  max={2.6}
                  step={0.05}
                  valueDisplay={`${maxIc.toFixed(2)}`}
                  unit="Z6-8"
                />

                <Slider
                  label="Min thickness"
                  value={[minThickness]}
                  onValueChange={(val) =>
                    setBearingCriteria((prev) => ({ ...prev, minThickness: val[0] }))
                  }
                  min={1.0}
                  max={5.0}
                  step={0.5}
                  valueDisplay={`${minThickness.toFixed(1)}`}
                  unit="m"
                />
              </div>
            </div>

            {/* Multi-point Foundation Comparison Table */}
            <BearingComparisonTable />
          </div>

          {/* Right 6 Columns: Open Borderless 3D Structural Pile Cage & Undulating Bearing Terrain */}
          <div className="lg:col-span-6 space-y-3">
            <Section3DAnchorDock
              stage="stratum"
              tone="light"
              title="04 / 3D Structural Pile Cage & Bearing Horizon"
              subtitle="8 Reinforced Concrete Piles Socketed into Layer 04"
              renderMobileCanvas={false}
              heightClass="h-[480px] xl:h-[540px]"
            />

            {/* Minimalist Foundation Legend Strip */}
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] pt-2 border-t border-[#1C130D]/15">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#EFE7DE] border border-[#5A3008] shrink-0" />
                <span className="text-[#1C130D] truncate">8 Driven Concrete Piles</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#10B981] shrink-0" />
                <span className="text-[#63554B] truncate">Laser Cutoff Datum Plane</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#E76F51] shrink-0" />
                <span className="text-[#63554B] truncate">3D Bearing Stratum Terrain</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

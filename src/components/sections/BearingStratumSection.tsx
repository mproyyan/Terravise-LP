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
          metaRight="3D pile foundation load transfer"
          tone="light"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Heading, Parametric Sliders, and Foundation Schedule Table */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92]">
                {bearing.heading}
              </h2>
              <p className="font-sans text-[#63554B] text-base sm:text-lg leading-relaxed">
                {bearing.subheading}
              </p>
            </div>

            {/* Parametric Criteria Bar (Directly drives 3D pile depth & Layer 04 glow) */}
            <div className="bg-[#FAF5EE] border border-[#1C130D]/15 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs uppercase tracking-wider text-[#1C130D] font-bold border-b border-[#1C130D]/10 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#7A421D]" />
                  <span>Interactive 3D bearing criteria</span>
                </div>
                <span className="text-[10px] text-[#7A421D] font-normal">
                  Adjusts 3D pile toe embedment live
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Slider
                  label="Min cone resistance (qc)"
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
                  label="Max SBT index (Ic)"
                  value={[maxIc]}
                  onValueChange={(val) =>
                    setBearingCriteria((prev) => ({ ...prev, maxIc: val[0] }))
                  }
                  min={1.2}
                  max={2.6}
                  step={0.05}
                  valueDisplay={`${maxIc.toFixed(2)}`}
                  unit="Zone 6-8"
                />

                <Slider
                  label="Min layer thickness"
                  value={[minThickness]}
                  onValueChange={(val) =>
                    setBearingCriteria((prev) => ({ ...prev, minThickness: val[0] }))
                  }
                  min={1.0}
                  max={5.0}
                  step={0.5}
                  valueDisplay={`${minThickness.toFixed(1)}`}
                  unit="meters"
                />
              </div>
            </div>

            {/* Multi-point Foundation Comparison Table */}
            <BearingComparisonTable />
          </div>

          {/* Right 5 Columns: 3D Foundation Pile Load Transfer Stage Dock */}
          <div className="lg:col-span-5">
            <Section3DAnchorDock
              stage="stratum"
              tone="light"
              title="3D Foundation Pile Socket"
              subtitle="8 Driven Piles into Layer 04"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

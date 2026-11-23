import { useState } from "react"
import { PlateHeader } from "../ui/PlateHeader"
import { Slider } from "../ui/Slider"
import { BearingComparisonTable } from "../interactive/BearingComparisonTable"
import { SITE_CONTENT } from "../../data/siteContent"
import { DEFAULT_BEARING_CRITERIA } from "../../data/mockGeology"
import { SlidersHorizontal } from "lucide-react"

export function BearingStratumSection() {
  const { bearing } = SITE_CONTENT
  const [minQc, setMinQc] = useState<number>(DEFAULT_BEARING_CRITERIA.minQc)
  const [maxIc, setMaxIc] = useState<number>(DEFAULT_BEARING_CRITERIA.maxIc)
  const [thickness, setThickness] = useState<number>(DEFAULT_BEARING_CRITERIA.minThickness)

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
          metaRight="Pile foundation criteria"
          tone="light"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-12 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92]">
            {bearing.heading}
          </h2>
          <p className="font-sans text-[#63554B] text-base sm:text-lg leading-relaxed">
            {bearing.subheading}
          </p>
        </div>

        {/* Parametric Criteria Bar */}
        <div className="bg-[#FAF5EE] border border-[#1C130D]/15 p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#1C130D] font-bold border-b border-[#1C130D]/10 pb-3 mb-6">
            <SlidersHorizontal className="w-4 h-4 text-[#7A421D]" />
            <span>Interactive bearing criteria</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Slider
              label="Minimum cone tip resistance (qc)"
              value={[minQc]}
              onValueChange={(val) => setMinQc(val[0])}
              min={10.0}
              max={25.0}
              step={0.5}
              valueDisplay={`${minQc.toFixed(1)}`}
              unit="MPa"
            />

            <Slider
              label="Maximum soil behavior type index (Ic)"
              value={[maxIc]}
              onValueChange={(val) => setMaxIc(val[0])}
              min={1.2}
              max={2.6}
              step={0.05}
              valueDisplay={`${maxIc.toFixed(2)}`}
              unit="Zone 6-8"
            />

            <Slider
              label="Minimum continuous layer thickness"
              value={[thickness]}
              onValueChange={(val) => setThickness(val[0])}
              min={1.0}
              max={5.0}
              step={0.5}
              valueDisplay={`${thickness.toFixed(1)}`}
              unit="meters"
            />
          </div>
        </div>

        {/* Multi-point Foundation Comparison Table */}
        <BearingComparisonTable />
      </div>
    </section>
  )
}

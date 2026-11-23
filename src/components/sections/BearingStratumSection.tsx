import { useState } from "react"
import { PlateHeader } from "../ui/PlateHeader"
import { Slider } from "../ui/Slider"
import { BearingComparisonTable } from "../interactive/BearingComparisonTable"
import { SITE_CONTENT } from "../../data/siteContent"
import { DEFAULT_BEARING_CRITERIA } from "../../data/mockGeology"
import { SlidersHorizontal, ShieldCheck } from "lucide-react"

export function BearingStratumSection() {
  const { bearing } = SITE_CONTENT
  const [minQc, setMinQc] = useState<number>(DEFAULT_BEARING_CRITERIA.minQc)
  const [maxIc, setMaxIc] = useState<number>(DEFAULT_BEARING_CRITERIA.maxIc)
  const [thickness, setThickness] = useState<number>(DEFAULT_BEARING_CRITERIA.minThickness)

  return (
    <section
      id="stratum"
      className="py-24 bg-[#F8F7F4] border-b border-stone-200 scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Plate Header */}
        <PlateHeader
          number="05"
          title="Bearing Stratum Analysis"
          metaRight="Pile Foundation Criteria"
          tone="light"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-12 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-stone-950 uppercase tracking-tight">
            {bearing.heading}
          </h2>
          <p className="font-sans text-stone-700 text-base sm:text-lg leading-relaxed">
            {bearing.subheading}
          </p>
        </div>

        {/* Parametric Criteria Bar */}
        <div className="bg-white border border-stone-300 p-6 mb-8 shadow-xs">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-stone-800 font-bold border-b border-stone-200 pb-3 mb-6">
            <SlidersHorizontal className="w-4 h-4 text-stone-600" />
            <span>Parametric Statutory Bearing Definition (Interactive)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Slider
              label="Minimum Cone Tip Resistance (qc)"
              value={[minQc]}
              onValueChange={(val) => setMinQc(val[0])}
              min={10.0}
              max={25.0}
              step={0.5}
              valueDisplay={`${minQc.toFixed(1)}`}
              unit="MPa"
            />

            <Slider
              label="Max Soil Behavior Type Index (Ic)"
              value={[maxIc]}
              onValueChange={(val) => setMaxIc(val[0])}
              min={1.2}
              max={2.4}
              step={0.05}
              valueDisplay={`${maxIc.toFixed(2)}`}
              unit="(Sand/Gravel)"
            />

            <Slider
              label="Contiguous Stratum Thickness"
              value={[thickness]}
              onValueChange={(val) => setThickness(val[0])}
              min={1.0}
              max={4.0}
              step={0.5}
              valueDisplay={`${thickness.toFixed(1)}`}
              unit="meters"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs font-mono text-stone-500">
            <span>
              Criterion matches SNI 8460:2017 & ASTM D5778 deep foundation specifications.
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              All 4 Points Met Current Criteria
            </span>
          </div>
        </div>

        {/* Multi-Point Comparison Table */}
        <BearingComparisonTable />
      </div>
    </section>
  )
}

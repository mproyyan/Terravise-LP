import { PlateHeader } from "../ui/PlateHeader"
import { Slider } from "../ui/Slider"
import { BearingComparisonTable } from "../interactive/BearingComparisonTable"
import { SITE_CONTENT } from "../../data/siteContent"
import { BearingHeatmapStage } from "../three/BearingHeatmapStage"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { SlidersHorizontal } from "lucide-react"

export function BearingStratumSection() {
  const { bearing } = SITE_CONTENT
  const { bearingCriteria, setBearingCriteria } = useSubsurface3D()
  const { minQc, maxIc, minThickness } = bearingCriteria

  return (
    <section
      id="stratum"
      aria-label="Section 04: Bearing layer verification"
      className="py-24 bg-[#FBF7F2] border-b border-[#1C130D]/15 scroll-mt-12 relative z-10"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="04"
          title="Bearing layer verification"
          metaRight="Interactive 3D top-of-bearing depth heatmap workbench"
          tone="light"
        />

        {/* Top Editorial Row */}
        <div className="max-w-3xl space-y-2 mb-8">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92] text-balance">
            {bearing.heading}
          </h2>
          <p className="font-sans text-[#63554B] text-sm sm:text-base leading-relaxed text-pretty">
            {bearing.subheading}
          </p>
        </div>

        {/* Top Row (5:7 Interactive Engineering Workbench): Left 5 Cols Parametric Sliders | Right 7 Cols Live 3D Bearing Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
          {/* Left 5 Columns: Parametric 3D Heatmap Criteria Controls */}
          <div className="lg:col-span-5 bg-[#FAF5EE] border border-[#1C130D]/15 p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-6">
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#1C130D] font-bold border-b border-[#1C130D]/10 pb-3">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#7A421D]" />
                  3D Heatmap Criteria
                </span>
                <span className="text-[10px] text-[#7A421D] font-normal">
                  Adjust sliders to morph 3D relief →
                </span>
              </div>

              <div className="space-y-5">
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
                  label="Min contiguous thickness"
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

            <div className="mt-6 pt-3 border-t border-[#1C130D]/10 font-mono text-[10px] text-[#63554B] flex items-center justify-between">
              <span>CLUSTERING ENGINE</span>
              <span className="font-bold text-[#1C130D]">6-NEIGHBOR 3D VOXEL</span>
            </div>
          </div>

          {/* Right 7 Columns: Live 3D Top-of-Bearing Depth Heatmap Stage + Colorbar Scale */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-2.5">
            <BearingHeatmapStage />

            {/* Continuous Depth Heatmap Colorbar Scale */}
            <div className="bg-[#FAF5EE] border border-[#1C130D]/15 px-4 py-2.5 font-mono text-[10px] flex flex-wrap items-center justify-between gap-3">
              <span className="font-bold text-[#1C130D] uppercase tracking-wider shrink-0">
                Bearing Top Depth (zb) Scale:
              </span>

              <div className="flex items-center gap-2.5 flex-1 min-w-[220px]">
                <span className="text-[#10B981] font-bold shrink-0 tabular-nums">-13.6m Shallow</span>
                <div
                  className="h-2.5 flex-1 border border-[#1C130D]/20"
                  style={{
                    background:
                      "linear-gradient(90deg, #10B981 0%, #EAB308 38%, #E76F51 72%, #9A3412 100%)",
                  }}
                />
                <span className="text-[#9A3412] font-bold shrink-0 tabular-nums">-16.5m Deep</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Pile Toe Schedule & Depth Comparison Table */}
        <BearingComparisonTable />
      </div>
    </section>
  )
}

import { PlateHeader } from "../ui/PlateHeader"
import { Slider } from "../ui/Slider"
import { BearingComparisonTable } from "../interactive/BearingComparisonTable"
import { SITE_CONTENT } from "../../data/siteContent"
import { Section3DAnchorDock } from "../three/Section3DAnchorDock"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { SlidersHorizontal, ShieldCheck } from "lucide-react"

export function BearingStratumSection() {
  const { bearing } = SITE_CONTENT
  const { bearingCriteria, setBearingCriteria } = useSubsurface3D()
  const { minQc, maxIc, minThickness } = bearingCriteria

  const qcFactor = Math.max(0, 100 - Math.max(0, minQc - 14.0) * 6.5)
  const icFactor = Math.max(0, 100 - Math.max(0, 1.85 - maxIc) * 45)
  const thickFactor = Math.max(0, 100 - Math.max(0, minThickness - 2.0) * 14)
  const verifiedFootprintPct = Math.round(
    Math.max(12, Math.min(98, (qcFactor + icFactor + thickFactor) / 3))
  )

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
          metaRight="Bento foundation workbench & 3D top-of-bearing depth heatmap"
          tone="light"
        />

        {/* Top Editorial Row + Live Footprint Sufficiency Readout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
          <div className="max-w-3xl space-y-2">
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92]">
              {bearing.heading}
            </h2>
            <p className="font-sans text-[#63554B] text-sm sm:text-base leading-relaxed">
              {bearing.subheading}
            </p>
          </div>

          {/* Live Footprint Sufficiency Counter Card */}
          <div className="bg-[#1C130D] text-[#EFE7DE] px-5 py-3 border border-[#1C130D] flex items-center gap-4 font-mono shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#10B981] shrink-0" />
            <div>
              <div className="text-[9px] uppercase tracking-widest text-[#FAD9BA]">
                Bearing footprint coverage
              </div>
              <div className="text-xl font-bold text-[#10B981] tabular-nums">
                {verifiedFootprintPct}% Verified Area
              </div>
            </div>
          </div>
        </div>

        {/* Top Panoramic 12-Column 3D Top-of-Bearing Depth Heatmap Stage */}
        <div className="relative w-full mb-4">
          <Section3DAnchorDock
            stage="stratum"
            tone="light"
            title="04 / Panoramic 3D Top-of-Bearing Depth Heatmap (zb) & 8 Structural Piles"
            subtitle="Curtain Peel-Off Reveals Competent Horizon Contours"
            renderMobileCanvas={false}
            heightClass="h-[380px] xl:h-[430px]"
          />

          {/* Floating Continuous Depth Heatmap Colorbar Scale Overlay */}
          <div className="mt-2 bg-[#FAF5EE] border border-[#1C130D]/15 px-4 py-2.5 font-mono text-[10px] flex flex-wrap items-center justify-between gap-4 relative z-30">
            <span className="font-bold text-[#1C130D] uppercase tracking-wider shrink-0">
              3D Bearing Top Depth (zb) Heatmap Scale:
            </span>

            <div className="flex items-center gap-3 flex-1 min-w-[260px] max-w-xl">
              <span className="text-[#10B981] font-bold shrink-0">-13.6m Shallow</span>
              <div
                className="h-2.5 flex-1 border border-[#1C130D]/20"
                style={{
                  background:
                    "linear-gradient(90deg, #10B981 0%, #EAB308 38%, #E76F51 72%, #9A3412 100%)",
                }}
              />
              <span className="text-[#9A3412] font-bold shrink-0">-18.5m+ Deep</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 bg-[#231710] inline-block border border-[#1C130D]/20" />
              <span className="text-[#63554B]">Unverified (&lt; {minQc.toFixed(1)} MPa)</span>
            </div>
          </div>
        </div>

        {/* Bottom Asymmetric 4:8 Bento Workbench: Left 4 Cols Parametric Sliders | Right 8 Cols Wide Pile Schedule Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-30 mt-6">
          {/* Left Bento (4 Columns): Parametric 3D Heatmap Criteria Controls */}
          <div className="lg:col-span-4 bg-[#FAF5EE] border border-[#1C130D]/15 p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-5">
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#1C130D] font-bold border-b border-[#1C130D]/10 pb-3">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#7A421D]" />
                  3D Heatmap Criteria
                </span>
                <span className="text-[10px] text-[#7A421D] font-normal">Live GPU morph</span>
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

          {/* Right Bento (8 Columns): Full-Width Foundation Comparison Table */}
          <div className="lg:col-span-8 flex flex-col">
            <BearingComparisonTable />
          </div>
        </div>
      </div>
    </section>
  )
}

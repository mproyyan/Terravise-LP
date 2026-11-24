import { MOCK_BEARING_POINTS } from "../../data/mockGeology"
import { Badge } from "../ui/Badge"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { CheckCircle2, AlertTriangle, ArrowDown } from "lucide-react"

function getHeatmapSwatchColor(depthM: number, meetsCriteria: boolean): string {
  if (!meetsCriteria) return "#231710"
  const absDepth = Math.abs(depthM)
  if (absDepth < 15.0) return "#10B981" // Shallow Emerald
  if (absDepth < 15.6) return "#EAB308" // Moderate Amber
  return "#E76F51" // Deep Coral
}

export function BearingComparisonTable() {
  const { bearingCriteria, hoveredBearingPointId, setHoveredBearingPointId } = useSubsurface3D()
  const { minQc, maxIc, minThickness } = bearingCriteria

  // Adjust displayed bearing depth slightly based on strictness of sliders
  const depthPenalty =
    Math.max(0, (minQc - 15.0) * 0.22) +
    Math.max(0, (1.80 - maxIc) * 1.5) +
    Math.max(0, (minThickness - 2.0) * 0.35)

  return (
    <div className="w-full bg-[#FAF5EE] border border-[#1C130D]/15 overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-[#1C130D]/10 flex flex-wrap items-center justify-between gap-3 bg-[#E3D7C8]/25">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#1C130D]">
            Bearing layer heatmap schedule
          </span>
          <Badge variant="emerald" className="text-[10px] tabular-nums">
            Target: qc ≥ {minQc.toFixed(1)} MPa
          </Badge>
        </div>
        <span className="font-mono text-[10px] text-[#7A421D]">
          <span className="hidden sm:inline">Hover or focus row to locate on 3D heatmap</span>
          <span className="sm:hidden">Tap row to locate · Swipe table →</span>
        </span>
      </div>

      <div className="overflow-x-auto overscroll-x-contain">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1C130D]/10 bg-[#E3D7C8]/35 text-[#63554B] uppercase text-[10px] tracking-wider">
              <th scope="col" className="py-2.5 px-3.5">Sounding ID</th>
              <th scope="col" className="py-2.5 px-3.5">Top Depth (zb)</th>
              <th scope="col" className="py-2.5 px-3.5">Cone qc</th>
              <th scope="col" className="py-2.5 px-3.5">Soil Ic</th>
              <th scope="col" className="py-2.5 px-3.5">Pile toe schedule</th>
              <th scope="col" className="py-2.5 px-3.5 text-right">Heatmap status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C130D]/5 text-[#1C130D]">
            {MOCK_BEARING_POINTS.map((pt) => {
              const isSelected = hoveredBearingPointId === pt.id
              const meetsCriteria =
                pt.qcMpa >= minQc && pt.icValue <= maxIc && minThickness <= 4.0
              const adjustedDepth = (pt.depthM - depthPenalty).toFixed(1)
              const swatchColor = getHeatmapSwatchColor(Number(adjustedDepth), meetsCriteria)

              return (
                <tr
                  key={pt.id}
                  tabIndex={0}
                  aria-label={`${pt.pointName}: top depth ${adjustedDepth}m, qc ${pt.qcMpa} MPa, ${meetsCriteria ? "Verified" : "Deepen"}`}
                  onMouseEnter={() => setHoveredBearingPointId(pt.id)}
                  onMouseLeave={() => setHoveredBearingPointId(null)}
                  onFocus={() => setHoveredBearingPointId(pt.id)}
                  onBlur={() => setHoveredBearingPointId(null)}
                  onClick={() => setHoveredBearingPointId(pt.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setHoveredBearingPointId(isSelected ? null : pt.id)
                    }
                  }}
                  className={`transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:bg-[#FAD9BA]/50 ${
                    isSelected
                      ? "bg-[#FAD9BA]/45 font-semibold"
                      : "hover:bg-[#E3D7C8]/25"
                  }`}
                >
                  <td className="py-3 px-3.5 font-bold flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 shrink-0 border border-[#1C130D]/20"
                      style={{ backgroundColor: swatchColor }}
                      title="3D Heatmap depth zone color"
                    />
                    <span>{pt.pointName}</span>
                  </td>
                  <td className="py-3 px-3.5 font-bold text-[#7A421D] tabular-nums">
                    {adjustedDepth} m
                  </td>
                  <td className="py-3 px-3.5 tabular-nums">
                    <span className="text-[#5A3008] font-bold">{pt.qcMpa}</span>{" "}
                    <span className="text-[10px] text-[#63554B]">MPa</span>
                  </td>
                  <td className="py-3 px-3.5 text-[#63554B] tabular-nums">
                    {pt.icValue}
                  </td>
                  <td className="py-3 px-3.5 text-[#1C130D] flex items-center gap-1.5">
                    <ArrowDown className="w-3.5 h-3.5 text-[#63554B] shrink-0" />
                    <span className="truncate max-w-[180px]">{pt.pileRecommendation}</span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {meetsCriteria ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#10B981] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#D97706] font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Deepen
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-[#E3D7C8]/25 border-t border-[#1C130D]/10 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-[#63554B]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#7A421D]" />
          <span className="tabular-nums">6-neighbor 3D connected component thickness ≥ {minThickness.toFixed(1)}m</span>
        </div>
        <div>Export: CSV, LandXML, Bentley gINT</div>
      </div>
    </div>
  )
}

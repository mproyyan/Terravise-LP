import { MOCK_BEARING_POINTS } from "../../data/mockGeology"
import { Badge } from "../ui/Badge"
import { CheckCircle2, ArrowDown } from "lucide-react"

export function BearingComparisonTable() {
  return (
    <div className="w-full bg-[#f8f7f4] border border-[#171814]/15 overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-[#171814]/10 flex flex-wrap items-center justify-between gap-3 bg-[#dedacd]/25">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#171814]">
            Bearing layer foundation verification
          </span>
          <Badge variant="emerald" className="text-[10px]">
            Target met: qc &gt;= 15 MPa
          </Badge>
        </div>
        <span className="font-mono text-[11px] text-[#5c5f55]">
          Cutoff datum: El. +18.40 m
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#171814]/10 bg-[#dedacd]/35 text-[#5c5f55] uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Sounding ID</th>
              <th className="py-3 px-4">Northing</th>
              <th className="py-3 px-4">Easting</th>
              <th className="py-3 px-4">Bearing depth</th>
              <th className="py-3 px-4">Cone qc</th>
              <th className="py-3 px-4">Soil Ic</th>
              <th className="py-3 px-4">Pile toe schedule</th>
              <th className="py-3 px-4 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#171814]/5 text-[#171814]">
            {MOCK_BEARING_POINTS.map((pt) => {
              const isRecommended = pt.id === "spot-2-rec"
              return (
                <tr
                  key={pt.id}
                  className={`transition-colors ${
                    isRecommended
                      ? "bg-[#627056]/10 font-semibold"
                      : "hover:bg-[#dedacd]/20"
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    {isRecommended && (
                      <span className="w-1.5 h-1.5 bg-[#627056] shrink-0" />
                    )}
                    <span>{pt.pointName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#5c5f55]">{pt.northing}</td>
                  <td className="py-3.5 px-4 text-[#5c5f55]">{pt.easting}</td>
                  <td className="py-3.5 px-4 font-bold text-[#845942] tabular-nums">
                    {pt.depthM} m
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span className="text-[#627056] font-bold">{pt.qcMpa}</span>{" "}
                    <span className="text-[10px] text-[#5c5f55]">MPa</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#5c5f55] tabular-nums">
                    {pt.icValue}
                  </td>
                  <td className="py-3.5 px-4 text-[#171814] flex items-center gap-1.5">
                    <ArrowDown className="w-3.5 h-3.5 text-[#5c5f55] shrink-0" />
                    <span>{pt.pileRecommendation}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#627056] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirmed
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-[#dedacd]/25 border-t border-[#171814]/10 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-[#5c5f55]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#845942]" />
          <span>Minimum continuous thickness confirmed: greater than 2.0 meters</span>
        </div>
        <div>
          Formats available: CSV, LandXML, Bentley gINT
        </div>
      </div>
    </div>
  )
}

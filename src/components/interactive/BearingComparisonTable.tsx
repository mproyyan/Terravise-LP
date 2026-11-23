import { MOCK_BEARING_POINTS } from "../../data/mockGeology"
import { Badge } from "../ui/Badge"
import { CheckCircle2, ArrowDown } from "lucide-react"

export function BearingComparisonTable() {
  return (
    <div className="w-full bg-white border border-stone-200 overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/70">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-stone-800">
            Bearing Strata Foundation Verification
          </span>
          <Badge variant="emerald" className="text-[10px]">
            Target Met: qc ≥ 15 MPa
          </Badge>
        </div>
        <span className="font-mono text-[11px] text-stone-500">
          Pile Cutoff Datum: El. +18.40 m
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100/60 text-stone-600 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Sounding ID</th>
              <th className="py-3 px-4">Northing</th>
              <th className="py-3 px-4">Easting</th>
              <th className="py-3 px-4">Bearing Top ($z_b$)</th>
              <th className="py-3 px-4">Cone qc</th>
              <th className="py-3 px-4">Soil Ic</th>
              <th className="py-3 px-4">Pile Toe Directive</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-800">
            {MOCK_BEARING_POINTS.map((pt) => {
              const isRecommended = pt.id === "spot-2-rec"
              return (
                <tr
                  key={pt.id}
                  className={`transition-colors ${
                    isRecommended
                      ? "bg-emerald-50/60 font-semibold"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    {isRecommended && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    )}
                    <span>{pt.pointName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">{pt.northing}</td>
                  <td className="py-3.5 px-4 text-stone-600">{pt.easting}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-700 tabular-nums">
                    {pt.depthM} m
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span className="text-emerald-700 font-bold">{pt.qcMpa}</span>{" "}
                    <span className="text-[10px] text-stone-400">MPa</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 tabular-nums">
                    {pt.icValue}
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 flex items-center gap-1.5">
                    <ArrowDown className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{pt.pileRecommendation}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Defensible
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-stone-600">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          <span>Minimum contiguous embedment verified: &gt; 2.0 meters</span>
        </div>
        <div className="text-stone-500">
          Export available: CSV / LandXML / Bentley gINT
        </div>
      </div>
    </div>
  )
}

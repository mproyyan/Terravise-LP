import { motion } from "framer-motion"
import {
  Compass,
  FileSpreadsheet,
  CheckCircle2,
  Share2,
  Crosshair,
  Layers,
} from "lucide-react"

interface WorkflowStepVisualProps {
  stepIndex: number
  isActive: boolean
}

export function WorkflowStepVisual({ stepIndex, isActive }: WorkflowStepVisualProps) {
  if (stepIndex === 0) {
    // Step 01: Site Footprint & Boundary Definition on Satellite Map
    return (
      <div className="relative w-full h-full min-h-[220px] sm:min-h-[250px] bg-[#120B07] border border-[#EFE7DE]/15 p-4 flex flex-col justify-between overflow-hidden">
        {/* Subtle satellite topography grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #FAD9BA 1px, transparent 1px), linear-gradient(to bottom, #FAD9BA 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2 text-[10px] font-mono">
          <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#BD8564]" />
            MAPKIT SATELLITE FOOTPRINT
          </span>
          <span className="text-[#EFE7DE]/60">UTM 48S · WGS84</span>
        </div>

        {/* Dynamic Boundary Polygon Vector */}
        <div className="relative z-10 my-auto py-2">
          <svg className="w-full h-32 sm:h-36" viewBox="0 0 320 150">
            {/* Background Grid Lines */}
            <g stroke="#EFE7DE" strokeOpacity="0.08" strokeWidth="1">
              <line x1="0" y1="35" x2="320" y2="35" />
              <line x1="0" y1="75" x2="320" y2="75" />
              <line x1="0" y1="115" x2="320" y2="115" />
              <line x1="80" y1="0" x2="80" y2="150" />
              <line x1="160" y1="0" x2="160" y2="150" />
              <line x1="240" y1="0" x2="240" y2="150" />
            </g>

            {/* Polygon Area Fill */}
            <motion.polygon
              points="55,30 255,22 278,118 72,128"
              fill="#FAD9BA"
              initial={{ fillOpacity: 0.06 }}
              animate={{ fillOpacity: isActive ? 0.18 : 0.08 }}
              transition={{ duration: 0.6 }}
            />

            {/* Polygon Perimeter Stroke */}
            <motion.path
              d="M 55 30 L 255 22 L 278 118 L 72 128 Z"
              fill="none"
              stroke="#FAD9BA"
              strokeWidth={isActive ? "2.2" : "1.5"}
              strokeDasharray="6 3"
              initial={{ pathLength: 0.3 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* 4 Boundary Corner Pins */}
            {[
              { x: 55, y: 30, id: "V1", coord: "704,080E" },
              { x: 255, y: 22, id: "V2", coord: "704,200E" },
              { x: 278, y: 118, id: "V3", coord: "704,212E" },
              { x: 72, y: 128, id: "V4", coord: "704,092E" },
            ].map((v) => (
              <g key={v.id}>
                <circle cx={v.x} cy={v.y} r="4" fill="#1C130D" stroke="#FAD9BA" strokeWidth="2" />
                <text x={v.x + 6} y={v.y - 4} fill="#EFE7DE" fontSize="8" fontFamily="monospace">
                  {v.id}
                </text>
              </g>
            ))}

            {/* Center Area Pill */}
            <g transform="translate(108, 60)">
              <rect
                width="104"
                height="26"
                fill="#1C130D"
                stroke={isActive ? "#FAD9BA" : "#BD8564"}
                strokeWidth="1"
                rx="2"
              />
              <text x="52" y="12" textAnchor="middle" fill="#FAD9BA" fontSize="8" fontWeight="bold">
                AREA: 9,600 m²
              </text>
              <text x="52" y="21" textAnchor="middle" fill="#EFE7DE" fillOpacity="0.65" fontSize="7">
                4 VERTICES LOCKED
              </text>
            </g>
          </svg>
        </div>

        <div className="relative z-10 pt-2 border-t border-[#EFE7DE]/15 flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#EFE7DE]/70">Tap-to-add with Apple Pencil</span>
          <span className="text-[#10B981] font-bold">● GPS LOCKED</span>
        </div>
      </div>
    )
  }

  if (stepIndex === 1) {
    // Step 02: Ingest CPT Sounding Files (.xlsx or .csv) & Header Auto-Mapping
    return (
      <div className="relative w-full h-full min-h-[220px] sm:min-h-[250px] bg-[#120B07] border border-[#EFE7DE]/15 p-4 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2 text-[10px] font-mono">
          <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
            CPT SPREADSHEET INGESTION
          </span>
          <span className="text-[#10B981] font-bold">.XLSX / .CSV AUTO-MAPPED</span>
        </div>

        <div className="my-auto py-2 space-y-2.5">
          {/* Imported File Info Chip */}
          <div className="bg-[#1C130D] border border-[#10B981]/40 p-2 flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-[#10B981]/15 text-[#10B981] rounded-xs">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="font-bold text-[#EFE7DE]">CPT_Sounding_01.xlsx</span>
                <span className="text-[9px] text-[#EFE7DE]/50 block">48.6 KB · Electrical CPT</span>
              </div>
            </div>
            <span className="text-[9px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 font-bold uppercase">
              Parsed &lt; 15 ms
            </span>
          </div>

          {/* Auto-Mapped Column Headers Strip */}
          <div className="grid grid-cols-3 gap-1.5 text-[8px] font-mono">
            <div className="bg-[#271C14] border border-[#EFE7DE]/10 p-1.5">
              <span className="text-[#EFE7DE]/40 block">COL 1</span>
              <span className="text-[#FAD9BA] font-bold">depth_(m)</span>
            </div>
            <div className="bg-[#271C14] border border-[#EFE7DE]/10 p-1.5">
              <span className="text-[#EFE7DE]/40 block">COL 2</span>
              <span className="text-[#FAD9BA] font-bold">qc_(MPa)</span>
            </div>
            <div className="bg-[#271C14] border border-[#EFE7DE]/10 p-1.5">
              <span className="text-[#EFE7DE]/40 block">COL 3</span>
              <span className="text-[#FAD9BA] font-bold">fs_(kPa)</span>
            </div>
          </div>

          {/* Reconstructed Strata Log & Cone Resistance Curve Preview */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex flex-col justify-between h-14 text-[8px] font-mono text-[#EFE7DE]/50 border-r border-[#EFE7DE]/15 pr-1.5 tabular-nums">
              <span>0m</span>
              <span>-12m</span>
              <span className="text-[#FAD9BA] font-bold">-25m</span>
            </div>

            <div className="flex-1 relative h-14 bg-[#1C130D] border border-[#EFE7DE]/15 overflow-hidden flex flex-col justify-between p-1">
              {/* Strata Color Bands */}
              <div className="flex items-center gap-1 text-[8px] font-mono">
                <span className="px-1 bg-[#D4A373]/30 text-[#FAD9BA]">Sand</span>
                <span className="px-1 bg-[#588157]/30 text-[#A8D5BA]">Silt</span>
                <span className="px-1 bg-[#A0522D]/30 text-[#E8A598]">Clay</span>
                <span className="px-1 bg-[#E76F51]/30 text-[#FAD9BA] font-bold">Dense Bearing</span>
              </div>

              {/* Dynamic Resistance Curve SVG */}
              <svg className="w-full h-6" preserveAspectRatio="none" viewBox="0 0 200 40">
                <motion.path
                  d="M 10 35 L 35 30 L 60 22 L 95 32 L 130 18 L 165 8 L 195 2"
                  fill="none"
                  stroke="#FAD9BA"
                  strokeWidth="2"
                  initial={{ pathLength: 0.3 }}
                  animate={{ pathLength: isActive ? 1 : 0.6 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#EFE7DE]/15 flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#EFE7DE]/70">Electrical CPT · CPTm Bicone · CPTu</span>
          <span className="text-[#10B981] font-bold">Robertson 9-Zone</span>
        </div>
      </div>
    )
  }

  if (stepIndex === 2) {
    // Step 03: Autonomous Rig Routing to High-Uncertainty Targets (Spot 2)
    return (
      <div className="relative w-full h-full min-h-[200px] sm:min-h-[220px] bg-[#120B07] border border-[#EFE7DE]/15 p-4 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2 text-[10px] font-mono">
          <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-[#10B981]" />
            RECOMMENDED TARGET NAVIGATION
          </span>
          <span className="text-[#10B981] font-bold">84% CONFIDENCE (RANK #1)</span>
        </div>

        <div className="my-auto py-2 space-y-2">
          {/* Mini Interactive Map Layer with Crosshairs over Spot 2 */}
          <div className="relative h-24 bg-[#1C130D] border border-[#EFE7DE]/15 overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 280 90">
              {/* Site Boundary Outline */}
              <polygon
                points="30,15 250,10 265,75 45,80"
                fill="#FAD9BA"
                fillOpacity="0.06"
                stroke="#FAD9BA"
                strokeWidth="1"
                strokeDasharray="4 2"
              />

              {/* Completed CPT Soundings (B-01, B-02, B-03) */}
              {[
                { x: 75, y: 35, id: "B-01" },
                { x: 195, y: 28, id: "B-02" },
                { x: 215, y: 62, id: "B-03" },
              ].map((cpt) => (
                <g key={cpt.id}>
                  <circle cx={cpt.x} cy={cpt.y} r="3" fill="#BD8564" />
                  <text x={cpt.x + 5} y={cpt.y + 3} fill="#EFE7DE" fillOpacity="0.5" fontSize="7" fontFamily="monospace">
                    {cpt.id}
                  </text>
                </g>
              ))}

              {/* Recommended Target Coordinate (Spot 2) with Animated Crosshair */}
              <g transform="translate(135, 48)">
                {/* Distance vector line from B-01 (16.2m) */}
                <line x1="-60" y1="-13" x2="0" y2="0" stroke="#FAD9BA" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.6" />
                <text x="-30" y="-10" fill="#FAD9BA" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
                  16.2m gap to B-01
                </text>

                {/* Pulsing Target Ring */}
                <circle cx="0" cy="0" r="11" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
                <circle cx="0" cy="0" r="5" fill="#1C130D" stroke="#10B981" strokeWidth="2" />
                <circle cx="0" cy="0" r="2" fill="#10B981" />

                {/* Crosshair Reticle Lines */}
                <line x1="-15" y1="0" x2="-6" y2="0" stroke="#10B981" strokeWidth="1.2" />
                <line x1="6" y1="0" x2="15" y2="0" stroke="#10B981" strokeWidth="1.2" />
                <line x1="0" y1="-15" x2="0" y2="-6" stroke="#10B981" strokeWidth="1.2" />
                <line x1="0" y1="6" x2="0" y2="15" stroke="#10B981" strokeWidth="1.2" />

                <text x="8" y="-6" fill="#10B981" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  Spot 2 Target
                </text>
              </g>
            </svg>
          </div>

          {/* Primary Recommendation Coordinates Card */}
          <div className="bg-[#1C130D] border border-[#FAD9BA]/40 p-2 flex items-center justify-between font-mono text-[9px]">
            <div>
              <span className="font-bold text-[#FAD9BA] text-[10px] block">
                Spot 2 · 48S 704,120m E, 9,309,850m N
              </span>
              <span className="text-[#EFE7DE]/60 text-[8px]">
                16.2m from nearest sounding (B-01) · Zero coverage within 4.0m
              </span>
            </div>
            <span className="text-[9px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 font-bold uppercase shrink-0">
              Priority #1
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#EFE7DE]/15 flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#EFE7DE]/70">Formation Characterization: Stable</span>
          <span className="text-[#10B981] font-bold">Rig Ready for Route</span>
        </div>
      </div>
    )
  }

  // Step 04: Practical STOP Verification & Foundation Pile Schedule Handoff
  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[250px] bg-[#120B07] border border-[#EFE7DE]/15 p-4 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2 text-[10px] font-mono">
        <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#BD8564]" />
          STOP VERIFICATION & HANDOFF
        </span>
        <span className="text-[#10B981] font-bold">84% COVERAGE (SUFFICIENT)</span>
      </div>

      <div className="my-auto py-2 space-y-2">
        {/* Verification Success Strip */}
        <div className="bg-[#10B981]/15 border border-[#10B981]/40 p-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-bold text-[#EFE7DE]">Practical STOP Condition Met</span>
          </div>
          <span className="text-[10px] text-[#10B981] font-bold">Drilling complete</span>
        </div>

        {/* Foundation Pile Toe mini-table */}
        <div className="bg-[#1C130D] border border-[#EFE7DE]/15 text-[9px] font-mono overflow-hidden">
          <div className="grid grid-cols-3 bg-[#271C14] px-2 py-1 text-[#EFE7DE]/50 uppercase tracking-wider font-bold">
            <span>Location</span>
            <span>Bearing Depth</span>
            <span>Pile Toe Level</span>
          </div>
          <div className="divide-y divide-[#EFE7DE]/10 text-[#EFE7DE]">
            <div className="grid grid-cols-3 px-2 py-1">
              <span className="text-[#FAD9BA]">CPT B-01</span>
              <span>-14.8 m</span>
              <span className="text-[#10B981] font-bold">-16.0 m</span>
            </div>
            <div className="grid grid-cols-3 px-2 py-1">
              <span className="text-[#FAD9BA]">CPT B-02</span>
              <span>-16.2 m</span>
              <span className="text-[#10B981] font-bold">-17.5 m</span>
            </div>
            <div className="grid grid-cols-3 px-2 py-1">
              <span className="text-[#FAD9BA]">Spot 2</span>
              <span>-15.0 m</span>
              <span className="text-[#10B981] font-bold">-16.4 m</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[#EFE7DE]/15 flex items-center justify-between text-[10px] font-mono">
        <span className="text-[#EFE7DE]/70 flex items-center gap-1">
          <Share2 className="w-3 h-3 text-[#BD8564]" />
          Direct structural handoff
        </span>
        <span className="text-[#10B981] font-bold">CSV · CAD · LandXML</span>
      </div>
    </div>
  )
}

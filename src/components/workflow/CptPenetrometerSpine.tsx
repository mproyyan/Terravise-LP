import { useRef } from "react"
import { motion, useTransform, useMotionValueEvent, MotionValue } from "framer-motion"
import { useState } from "react"

interface CptPenetrometerSpineProps {
  progress: MotionValue<number>
  activeStep: number
}

const STRATA_STOPS = [
  { depth: 0, label: "Ground Surface", color: "#D4A373" },
  { depth: 6.5, label: "Upper Sand & Silt", color: "#588157" },
  { depth: 14.0, label: "Sensitive Clay", color: "#A0522D" },
  { depth: 25.0, label: "Dense Bedrock", color: "#E76F51" },
]

export function CptPenetrometerSpine({ progress, activeStep }: CptPenetrometerSpineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentDepthM, setCurrentDepthM] = useState<number>(0)

  // Map progress (0 -> 1) to vertical cone penetration (0% -> 94%)
  const coneTopPct = useTransform(progress, [0, 1], ["2%", "94%"])
  const laserFillPct = useTransform(progress, [0, 1], ["0%", "95%"])

  useMotionValueEvent(progress, "change", (latest) => {
    const clamped = Math.max(0, Math.min(1, latest))
    const depth = clamped * 25.0
    setCurrentDepthM(depth)
  })

  // Get current strata color based on activeStep
  const activeStrata = STRATA_STOPS[activeStep] || STRATA_STOPS[0]

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none"
      aria-hidden="true"
    >
      {/* 1. Vertical Background Soil Strata Column Track */}
      <div className="absolute top-0 bottom-0 w-2.5 sm:w-3 bg-[#150E09] border-x border-[#EFE7DE]/15 shadow-inner">
        {/* Active Laser Thrust Beam (Fills downwards as the cone penetrates) */}
        <motion.div
          style={{ height: laserFillPct }}
          className="w-full bg-gradient-to-b from-[#FAD9BA]/60 via-[#BD8564]/80 to-[#FAD9BA]"
        />
      </div>

      {/* 2. Geotechnical Depth Measurement Notches & Calibration Lines */}
      <div className="absolute top-0 bottom-0 flex flex-col justify-between py-4 text-[9px] font-mono text-[#EFE7DE]/40 tabular-nums pointer-events-none left-1/2 -translate-x-1/2 w-28 sm:w-36">
        {[
          { depth: "0.0m", label: "Ground 0m", top: "2%" },
          { depth: "-5.0m", label: "Upper -5m", top: "22%" },
          { depth: "-10.0m", label: "Mid -10m", top: "42%" },
          { depth: "-15.0m", label: "Clay -15m", top: "62%" },
          { depth: "-20.0m", label: "Deep -20m", top: "80%" },
          { depth: "-25.0m", label: "Target -25m", top: "96%" },
        ].map((marker) => (
          <div
            key={marker.depth}
            className="absolute left-0 right-0 flex items-center justify-between"
            style={{ top: marker.top }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1px] bg-[#EFE7DE]/30" />
              <span className="hidden sm:inline text-[8px] text-[#BD8564]">{marker.depth}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-[8px] text-[#BD8564]">{marker.depth}</span>
              <span className="w-2.5 h-[1px] bg-[#EFE7DE]/30" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. The 60-Degree ASTM D5778 Conical Penetrometer Tip Assembly (Scroll-Driven) */}
      <motion.div
        style={{ top: coneTopPct }}
        className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
      >
        {/* Upper Steel Push Rod Extension */}
        <div className="w-1.5 sm:w-2 h-8 -mt-8 bg-gradient-to-r from-[#5A3008] via-[#FAD9BA] to-[#381800] border-x border-[#FAD9BA]/40" />

        {/* CPT Friction Sleeve Collar */}
        <div className="w-4 sm:w-5 h-4 bg-gradient-to-r from-[#271C14] via-[#BD8564] to-[#1C130D] border border-[#FAD9BA]/60 flex items-center justify-center">
          <div className="w-full h-[1px] bg-[#FAD9BA]/40" />
        </div>

        {/* 60-Degree ASTM Conical Tip SVG */}
        <svg
          className="w-5 sm:w-6 h-5 drop-shadow-[0_4px_12px_rgba(250,217,186,0.4)]"
          viewBox="0 0 24 20"
          fill="none"
        >
          {/* Main Cone Body */}
          <polygon
            points="2,2 22,2 12,19"
            fill="url(#cptConeGradient)"
            stroke="#FAD9BA"
            strokeWidth="1.2"
          />
          {/* Facet Light Reflection */}
          <polygon points="12,2 22,2 12,19" fill="#FFFFFF" fillOpacity="0.15" />
          {/* Pressure Transducer Apex Sensor Ring */}
          <circle cx="12" cy="18" r="1.5" fill="#10B981" />

          <defs>
            <linearGradient id="cptConeGradient" x1="2" y1="2" x2="22" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FAD9BA" />
              <stop offset="0.5" stopColor="#BD8564" />
              <stop offset="1" stopColor="#5A3008" />
            </linearGradient>
          </defs>
        </svg>

        {/* Dynamic Telemetry HUD Pill (Follows Cone Tip) */}
        <div className="mt-2 flex items-center gap-1.5 bg-[#150E09]/95 border border-[#FAD9BA]/70 px-2 py-1 shadow-2xl backdrop-blur-xs font-mono text-[9px] whitespace-nowrap">
          <span
            className="w-1.5 h-1.5 rounded-full animate-ping"
            style={{ backgroundColor: activeStrata.color }}
          />
          <span className="text-[#FAD9BA] font-bold tabular-nums">
            -{currentDepthM.toFixed(1)}m
          </span>
          <span className="text-[#EFE7DE]/50 hidden sm:inline">·</span>
          <span className="text-[#EFE7DE]/80 hidden sm:inline font-bold">
            {activeStrata.label}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

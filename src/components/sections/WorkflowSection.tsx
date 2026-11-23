import { useRef, useState } from "react"
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion"
import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import {
  Compass,
  FileSpreadsheet,
  Cpu,
  Boxes,
  CheckCircle2,
  Sparkles,
} from "lucide-react"

const willChangeTransform = { willChange: "transform" } as const
const willChangeAll = { willChange: "transform, opacity" } as const

function WorkflowStageSchematic({ stepIndex }: { stepIndex: number }) {
  if (stepIndex === 0) {
    // Step 01: BoundaryCreationView — MapKit Satellite Polygon & UTM 48S Vertices
    return (
      <div className="relative w-full h-full flex flex-col justify-between p-5 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2.5 text-[10px]">
          <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            MAPKIT SATELLITE FOOTPRINT
          </span>
          <span className="text-[#EFE7DE]/60">UTM ZONE 48S · DGN95</span>
        </div>

        <div className="relative my-3 flex-1 bg-[#120B07] border border-[#EFE7DE]/15 overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 200">
            {/* Coordinate Grid */}
            <g stroke="#EFE7DE" strokeOpacity="0.08" strokeWidth="1">
              <line x1="0" y1="40" x2="320" y2="40" />
              <line x1="0" y1="80" x2="320" y2="80" />
              <line x1="0" y1="120" x2="320" y2="120" />
              <line x1="0" y1="160" x2="320" y2="160" />
              <line x1="64" y1="0" x2="64" y2="200" />
              <line x1="128" y1="0" x2="128" y2="200" />
              <line x1="192" y1="0" x2="192" y2="200" />
              <line x1="256" y1="0" x2="256" y2="200" />
            </g>

            {/* Animated Site Polygon Fill */}
            <motion.polygon
              points="58,45 252,36 274,152 74,164"
              fill="#FAD9BA"
              initial={{ fillOpacity: 0 }}
              animate={{ fillOpacity: 0.14 }}
              transition={{ duration: 0.5 }}
            />

            {/* Animated Site Polygon Perimeter Path */}
            <motion.path
              d="M 58 45 L 252 36 L 274 152 L 74 164 Z"
              fill="none"
              stroke="#FAD9BA"
              strokeWidth="2"
              strokeDasharray="6 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            {/* 4 Corner Survey Vertices */}
            {[
              { x: 58, y: 45, id: "V1", coord: "704080E" },
              { x: 252, y: 36, id: "V2", coord: "704200E" },
              { x: 274, y: 152, id: "V3", coord: "704212E" },
              { x: 74, y: 164, id: "V4", coord: "704092E" },
            ].map((v, i) => (
              <motion.g
                key={v.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 * i, type: "spring", stiffness: 260, damping: 18 }}
              >
                <circle cx={v.x} cy={v.y} r="5" fill="#1C130D" stroke="#FAD9BA" strokeWidth="2" />
                <text
                  x={v.x + 8}
                  y={v.y - 6}
                  fill="#EFE7DE"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {v.id} ({v.coord})
                </text>
              </motion.g>
            ))}

            {/* Center Area Readout Stamp */}
            <g transform="translate(115, 88)">
              <rect width="96" height="28" fill="#1C130D" stroke="#BD8564" strokeWidth="1" />
              <text x="48" y="13" textAnchor="middle" fill="#FAD9BA" fontSize="8" fontWeight="bold">
                AREA: 9,600 m²
              </text>
              <text x="48" y="23" textAnchor="middle" fill="#EFE7DE" fillOpacity="0.6" fontSize="7">
                4 VERTICES LOCKED
              </text>
            </g>
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
            <span className="text-[#EFE7DE]/50 block">POLYGON AREA</span>
            <span className="text-[#FAD9BA] font-bold">0.96 Hectares</span>
          </div>
          <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
            <span className="text-[#EFE7DE]/50 block">PROJECTION</span>
            <span className="text-[#EFE7DE] font-bold">WGS84 / 48S</span>
          </div>
          <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
            <span className="text-[#EFE7DE]/50 block">GRID CANDIDATES</span>
            <span className="text-[#10B981] font-bold">144 Nodes</span>
          </div>
        </div>
      </div>
    )
  }

  if (stepIndex === 1) {
    // Step 02: CPTRecommendationView — Multi-Instrument Telemetry & Robertson SBT Curves
    return (
      <div className="relative w-full h-full flex flex-col justify-between p-5 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2.5 text-[10px]">
          <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            MULTI-INSTRUMENT PARSER
          </span>
          <span className="text-[#10B981]">AUTO-MAPPED: CPT / CPTu</span>
        </div>

        <div className="relative my-3 flex-1 bg-[#120B07] border border-[#EFE7DE]/15 overflow-hidden p-3 flex gap-3">
          {/* Depth Axis */}
          <div className="flex flex-col justify-between text-[8px] text-[#EFE7DE]/45 border-r border-[#EFE7DE]/15 pr-2 tabular-nums">
            <span>0.0m</span>
            <span>-5.0m</span>
            <span>-10.0m</span>
            <span>-15.0m</span>
            <span>-20.0m</span>
            <span className="text-[#FAD9BA] font-bold">-25.0m</span>
          </div>

          {/* Animated Dual Telemetry Curves (qc & Ic) */}
          <div className="flex-1 relative">
            <svg className="w-full h-full" viewBox="0 0 240 160" preserveAspectRatio="none">
              {/* Stratigraphy Background Bands */}
              <rect x="0" y="0" width="240" height="22" fill="#D4A373" fillOpacity="0.16" />
              <rect x="0" y="22" width="240" height="36" fill="#588157" fillOpacity="0.16" />
              <rect x="0" y="58" width="240" height="48" fill="#A0522D" fillOpacity="0.22" />
              <rect x="0" y="106" width="240" height="54" fill="#E76F51" fillOpacity="0.22" />

              {/* Cone Tip Resistance (qc MPa) Animated Curve */}
              <motion.path
                d="M 45 0 L 58 14 L 52 24 L 38 42 L 42 56 L 16 72 L 14 94 L 30 106 L 175 118 L 198 138 L 212 160"
                fill="none"
                stroke="#FAD9BA"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
              />

              {/* Sleeve Friction / Ic Index Secondary Curve */}
              <motion.path
                d="M 85 0 L 80 22 L 110 45 L 165 70 L 172 96 L 95 112 L 62 136 L 58 160"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.75"
                strokeDasharray="4 2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.15, ease: "easeInOut" }}
              />
            </svg>

            <div className="absolute top-2 right-2 bg-[#1C130D]/90 border border-[#EFE7DE]/20 px-2 py-1 text-[8px] space-y-0.5">
              <div className="flex items-center gap-1.5 text-[#FAD9BA]">
                <span className="w-2.5 h-0.5 bg-[#FAD9BA] inline-block" />
                <span>qc (MPa)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#10B981]">
                <span className="w-2.5 h-0.5 bg-[#10B981] inline-block" />
                <span>SBT Index Ic</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
            <span className="text-[#EFE7DE]/50 block">INSTRUMENTS</span>
            <span className="text-[#FAD9BA] font-bold">CPT · CPTm · CPTu</span>
          </div>
          <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
            <span className="text-[#EFE7DE]/50 block">CLASSIFICATION</span>
            <span className="text-[#EFE7DE] font-bold">Robertson 9-Zone</span>
          </div>
          <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
            <span className="text-[#EFE7DE]/50 block">PARSE SPEED</span>
            <span className="text-[#10B981] font-bold">&lt; 15 ms / file</span>
          </div>
        </div>
      </div>
    )
  }

  if (stepIndex === 2) {
    // Step 03: DQN Active Rig Routing — 29-Feature Candidate Evaluation
    return (
      <div className="relative w-full h-full flex flex-col justify-between p-5 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2.5 text-[10px]">
          <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            DQN V4.6-A CORE ML POLICY
          </span>
          <span className="text-[#10B981]">29 FEATURES EVALUATED</span>
        </div>

        <div className="relative my-3 flex-1 bg-[#120B07] border border-[#EFE7DE]/15 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#EFE7DE]/70">TOP CANDIDATE: SPOT 2</span>
            <span className="text-[#10B981] font-bold">Q-VALUE: 0.942 (RANK #1)</span>
          </div>

          {/* Animated Feature Weight Bars */}
          <div className="space-y-3 my-auto">
            {[
              { label: "Spatial Data Gap (16.2m to B-01)", pct: 92, color: "#FAD9BA" },
              { label: "SchemaGAN Strata Transition (-8.5m Clay)", pct: 86, color: "#E76F51" },
              { label: "Lateral Index Anomaly (delta Ic = 0.18)", pct: 79, color: "#10B981" },
            ].map((feat, i) => (
              <div key={feat.label} className="space-y-1">
                <div className="flex justify-between text-[9px]">
                  <span className="text-[#EFE7DE]/80">{feat.label}</span>
                  <span className="text-[#FAD9BA] font-bold">{feat.pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#271C14] overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: feat.color }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${feat.pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#EFE7DE]/15 flex items-center justify-between text-[9px] text-[#EFE7DE]/60">
            <span>TARGET UTM: 48S 704120m E, 9309850m N</span>
            <span className="text-[#FAD9BA]">CERTAINTY +14.2%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
            <span className="text-[#EFE7DE]/50 block">INFERENCE</span>
            <span className="text-[#FAD9BA] font-bold">82 ms Local ANE</span>
          </div>
          <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
            <span className="text-[#EFE7DE]/50 block">RATIONALE</span>
            <span className="text-[#EFE7DE] font-bold">3-Tab Sheet Card</span>
          </div>
          <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
            <span className="text-[#EFE7DE]/50 block">RIG ACTION</span>
            <span className="text-[#10B981] font-bold">Route to Spot 2</span>
          </div>
        </div>
      </div>
    )
  }

  // Step 04: ResultAnalysisView — 3D Voxel & Foundation Pile Handoff
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2.5 text-[10px]">
        <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
          <Boxes className="w-3.5 h-3.5" />
          REALITYKIT 3D &amp; PILE SCHEDULE
        </span>
        <span className="text-[#E76F51] font-bold">qc &gt;= 15.0 MPa VERIFIED</span>
      </div>

      <div className="relative my-3 flex-1 bg-[#120B07] border border-[#EFE7DE]/15 p-3 flex flex-col justify-between">
        <svg className="w-full h-28" viewBox="0 0 300 110">
          {/* Isometric Foundation Bearing Stratum Block */}
          <motion.polygon
            points="150,12 260,36 150,60 40,36"
            fill="#D4A373"
            fillOpacity="0.25"
            stroke="#FAD9BA"
            strokeWidth="1.2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.polygon
            points="150,44 260,68 150,92 40,68"
            fill="#E76F51"
            fillOpacity="0.45"
            stroke="#E76F51"
            strokeWidth="2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
          {/* Structural Piles Piercing into Bearing Horizon */}
          {[95, 130, 170, 205].map((xPos, idx) => (
            <motion.line
              key={xPos}
              x1={xPos}
              y1="22"
              x2={xPos}
              y2="76"
              stroke="#FAD9BA"
              strokeWidth="3.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.15 + idx * 0.1 }}
            />
          ))}
        </svg>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EFE7DE]/15 text-[9px]">
          <div className="bg-[#1C130D] px-2 py-1 border border-[#FAD9BA]/30 flex items-center justify-between">
            <span>.CSV TABLE</span>
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
          </div>
          <div className="bg-[#1C130D] px-2 py-1 border border-[#FAD9BA]/30 flex items-center justify-between">
            <span>LandXML</span>
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
          </div>
          <div className="bg-[#1C130D] px-2 py-1 border border-[#FAD9BA]/30 flex items-center justify-between">
            <span>Bentley gINT</span>
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
          <span className="text-[#EFE7DE]/50 block">PILE TOE DEPTH</span>
          <span className="text-[#FAD9BA] font-bold">-16.0m to -17.5m</span>
        </div>
        <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
          <span className="text-[#EFE7DE]/50 block">CLUSTERING</span>
          <span className="text-[#EFE7DE] font-bold">3D Connected Voxel</span>
        </div>
        <div className="bg-[#1C130D] border border-[#EFE7DE]/15 p-2">
          <span className="text-[#EFE7DE]/50 block">HANDOFF</span>
          <span className="text-[#10B981] font-bold">Instant CAD Ready</span>
        </div>
      </div>
    </div>
  )
}

export function WorkflowSection() {
  const { workflow } = SITE_CONTENT
  const sectionRef = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [activeStep, setActiveStep] = useState<number>(0)
  const [stepSubProgress, setStepSubProgress] = useState<number>(0)

  // Dedicated 300vh sticky scroll track: 0.0 -> 1.0 maps strictly across the 4 workflow steps
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  })

  const yWatermark = useTransform(
    smoothProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [60, -60]
  )
  const yViewportFloat = useTransform(
    smoothProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [18, -18]
  )

  // Purely scroll-driven step switching (0%–25% = 01, 25%–50% = 02, 50%–75% = 03, 75%–100% = 04)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const clamped = Math.max(0, Math.min(0.9999, latest))
    const rawStep = clamped * 4
    const nextIdx = Math.floor(rawStep)
    const subProg = rawStep - nextIdx

    if (nextIdx !== activeStep) {
      setActiveStep(nextIdx)
    }
    setStepSubProgress(subProg)
  })

  return (
    <section
      ref={sectionRef}
      id="workflow"
      className="relative h-[300vh] bg-[#1C130D] text-[#EFE7DE] border-b border-[#EFE7DE]/15 scroll-mt-12"
    >
      {/* Sticky Viewport Stage pinned during the 300vh scroll journey */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center py-16">
        {/* Parallax Architectural Blueprint Background Grid & Watermark */}
        <motion.div
          style={{ y: yWatermark, ...willChangeTransform }}
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #FAD9BA 1px, transparent 1px), linear-gradient(to bottom, #FAD9BA 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div className="hidden xl:block absolute -right-6 bottom-8 font-mono font-black text-[170px] leading-none text-[#EFE7DE]/[0.03] tracking-tighter">
            STAGE 0{activeStep + 1}
          </div>
        </motion.div>

        <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          {/* Plate Header */}
          <PlateHeader
            number="05"
            title="iPadOS application workflow"
            metaRight="Scroll-driven field telemetry sequence"
            tone="dark"
            className="mb-6"
          />

          {/* Top Compact Heading + Overall Scroll Progress Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-sans font-black text-2xl sm:text-4xl xl:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92]">
                Four integrated steps from site boundary to foundation handoff
              </h2>
              <p className="font-sans text-[#EFE7DE]/70 text-xs sm:text-sm leading-relaxed">
                Keep scrolling to advance automatically through each native iPadOS field stage.
              </p>
            </div>

            {/* Automatic Scroll Telemetry Rail */}
            <div className="w-full lg:w-80 bg-[#271C14] border border-[#EFE7DE]/15 p-3 font-mono text-xs shrink-0 select-none">
              <div className="flex items-center justify-between text-[10px] mb-2">
                <span className="text-[#FAD9BA] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Auto-scroll sequence
                </span>
                <span className="text-[#EFE7DE] font-bold tabular-nums">
                  STAGE 0{activeStep + 1} / 04
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#150E09] overflow-hidden relative">
                <motion.div
                  style={{
                    scaleX: smoothProgress,
                    transformOrigin: "0% 50%",
                    ...willChangeTransform,
                  }}
                  className="h-full w-full bg-[#FAD9BA]"
                />
              </div>
              <div className="flex justify-between text-[9px] text-[#EFE7DE]/45 mt-1.5">
                {workflow.map((s, idx) => (
                  <span
                    key={s.stepNumber}
                    className={`transition-colors ${
                      activeStep === idx
                        ? "text-[#FAD9BA] font-bold"
                        : idx < activeStep
                          ? "text-[#EFE7DE]/70"
                          : "text-[#EFE7DE]/30"
                    }`}
                  >
                    0{idx + 1}. {s.title.split(" ")[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Split Scrollytelling Stage: Left 7 Cols Scroll-Activated Card Deck | Right 5 Cols Live iPadOS Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 Columns: 2x2 Architectural Grid Driven Purely by Scroll */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workflow.map((step, idx) => {
                const isSelected = activeStep === idx
                const isPast = idx < activeStep

                return (
                  <motion.div
                    key={step.stepNumber}
                    animate={{
                      scale: isSelected ? 1.02 : 0.97,
                      opacity: isSelected ? 1 : isPast ? 0.58 : 0.42,
                      y: isSelected ? -4 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                    style={willChangeAll}
                    className={`relative p-5 flex flex-col justify-between select-none border transition-colors ${
                      isSelected
                        ? "bg-[#2E2016] border-[#FAD9BA] shadow-2xl z-20"
                        : "bg-[#271C14]/75 border-[#EFE7DE]/15 z-10"
                    }`}
                  >
                    {/* Shared LayoutId Active Architectural Highlight Frame */}
                    {isSelected && (
                      <motion.div
                        layoutId="workflow-active-frame"
                        transition={{ type: "spring", stiffness: 280, damping: 26 }}
                        className="absolute inset-0 border-2 border-[#FAD9BA] pointer-events-none"
                      />
                    )}

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2.5 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-xs tabular-nums px-1.5 py-0.5 ${
                              isSelected
                                ? "bg-[#FAD9BA] text-[#1C130D]"
                                : "bg-[#1C130D] text-[#FAD9BA]"
                            }`}
                          >
                            {step.stepNumber}
                          </span>
                          <span className="text-[9px] text-[#EFE7DE]/50 uppercase tracking-wider">
                            {isSelected ? "SCROLL ACTIVE" : isPast ? "COMPLETED" : "QUEUED"}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            isSelected
                              ? "text-[#FAD9BA] border-[#FAD9BA]/40"
                              : "text-[#EFE7DE]/50 border-[#EFE7DE]/15"
                          }`}
                        >
                          {step.badgeText}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-sans font-bold text-lg text-[#EFE7DE] tracking-tight">
                          {step.title}
                        </h3>
                        <div className="font-mono text-[10px] text-[#BD8564] uppercase tracking-wider mt-0.5">
                          {step.subtitle}
                        </div>
                      </div>

                      <p className="font-sans text-xs text-[#EFE7DE]/75 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EFE7DE]/15 space-y-2 relative z-10">
                      <div className="font-mono text-[10px] text-[#FAD9BA] flex items-center justify-between">
                        <span className="uppercase text-[#EFE7DE]/45">Deliverable</span>
                        <span className="font-bold text-right">{step.deliverable}</span>
                      </div>

                      {/* Per-Card Scroll Sub-Progress Indicator */}
                      <div className="w-full h-1 bg-[#150E09] overflow-hidden">
                        <div
                          className="h-full bg-[#FAD9BA] transition-all duration-75"
                          style={{
                            width: isSelected
                              ? `${Math.round(stepSubProgress * 100)}%`
                              : isPast
                                ? "100%"
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Right 5 Columns: Live Animated iPadOS Blueprint Viewport */}
            <motion.div
              style={{ y: yViewportFloat, ...willChangeTransform }}
              className="lg:col-span-5"
            >
              <div className="bg-[#271C14] border border-[#EFE7DE]/20 p-3 shadow-2xl">
                {/* iPadOS Chassis Top Bezel */}
                <div className="bg-[#150E09] border-b border-[#EFE7DE]/15 px-4 py-2.5 flex items-center justify-between font-mono text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#10B981] inline-block animate-pulse" />
                    <span className="font-bold text-[#EFE7DE] uppercase tracking-wider">
                      IPADOS VIEWPORT · {workflow[activeStep]?.badgeText}
                    </span>
                  </div>
                  <span className="text-[#FAD9BA] tabular-nums">
                    STAGE 0{activeStep + 1} / 04
                  </span>
                </div>

                {/* Animated Schematic Body */}
                <div className="h-[340px] sm:h-[360px] bg-[#170F0A] relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      style={willChangeAll}
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      className="w-full h-full"
                    >
                      <WorkflowStageSchematic stepIndex={activeStep} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Stage Status Strip (Read-Only Scroll Synced) */}
                <div className="grid grid-cols-4 gap-1.5 pt-2.5 bg-[#271C14] font-mono text-[10px] select-none">
                  {workflow.map((step, idx) => (
                    <div
                      key={step.stepNumber}
                      className={`py-1.5 px-2 text-center border transition-colors truncate ${
                        activeStep === idx
                          ? "bg-[#5A3008] text-[#FAD9BA] border-[#FAD9BA] font-bold"
                          : idx < activeStep
                            ? "bg-[#1C130D] text-[#EFE7DE]/80 border-[#EFE7DE]/20"
                            : "bg-[#1C130D]/60 text-[#EFE7DE]/40 border-[#EFE7DE]/10"
                      }`}
                    >
                      {step.stepNumber}. {step.title.split(" ")[0]}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

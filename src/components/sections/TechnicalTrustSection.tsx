import { useRef, useState } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion"
import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { Cpu, FileCheck2, Globe2, Lock } from "lucide-react"

const willChangeTransform = { willChange: "transform" } as const
const willChangeAll = { willChange: "transform, opacity" } as const

function PillarMicroSchematic({ index, isActive }: { index: number; isActive: boolean }) {
  if (index === 0) {
    // Pillar 01: Robertson 9-Zone SBT Histogram Schematic
    const zoneHeights = [28, 42, 54, 65, 78, 92, 84, 96, 70]
    const zoneColors = [
      "#A0522D",
      "#A0522D",
      "#845942",
      "#588157",
      "#588157",
      "#D4A373",
      "#D4A373",
      "#E76F51",
      "#E76F51",
    ]
    return (
      <div className="h-28 bg-[#1C130D] border border-[#1C130D] p-3 flex flex-col justify-between font-mono text-[9px] text-[#EFE7DE] overflow-hidden">
        <div className="flex items-center justify-between text-[#FAD9BA]">
          <span>SBTn ZONES 1 TO 9</span>
          <span className="tabular-nums">Ic ≤ 1.80</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-14 pt-2">
          {zoneHeights.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <motion.div
                className="w-full"
                style={{ backgroundColor: zoneColors[i] }}
                initial={{ height: "25%" }}
                animate={{
                  height: isActive ? `${h}%` : `${Math.max(25, h * 0.55)}%`,
                  opacity: isActive ? (i >= 5 ? 1 : 0.75) : 0.4,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 18, delay: i * 0.02 }}
              />
              <span className="text-[7px] text-[#EFE7DE]/50 tabular-nums">Z{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (index === 1) {
    // Pillar 02: UTM Coordinate Precision & Geodetic Compass
    return (
      <div className="h-28 bg-[#1C130D] border border-[#1C130D] p-3 flex items-center justify-between font-mono text-[9px] text-[#EFE7DE] overflow-hidden relative">
        <div className="space-y-1 z-10 tabular-nums">
          <div className="text-[#FAD9BA] font-bold">DATUM: WGS84 / DGN95</div>
          <div className="text-[#EFE7DE]/70">E: 704,120.00 m</div>
          <div className="text-[#EFE7DE]/70">N: 9,309,850.00 m</div>
          <div className="text-[#10B981] text-[8px]">ZONE 48S LOCKED</div>
        </div>

        <motion.svg
          width="68"
          height="68"
          viewBox="0 0 68 68"
          className="shrink-0"
          animate={{ rotate: isActive ? 45 : 0, scale: isActive ? 1.08 : 0.95 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
        >
          <circle
            cx="34"
            cy="34"
            r="28"
            fill="none"
            stroke="#EFE7DE"
            strokeOpacity="0.25"
            strokeDasharray="3 3"
          />
          <circle cx="34" cy="34" r="18" fill="none" stroke="#FAD9BA" strokeWidth="1.2" />
          <line x1="34" y1="2" x2="34" y2="66" stroke="#BD8564" strokeWidth="1" />
          <line x1="2" y1="34" x2="66" y2="34" stroke="#BD8564" strokeWidth="1" />
          <polygon points="34,12 38,34 34,29 30,34" fill="#E76F51" />
          <circle cx="34" cy="34" r="3" fill="#FAD9BA" />
        </motion.svg>
      </div>
    )
  }

  if (index === 2) {
    // Pillar 03: Offline Apple Silicon Neural Engine
    return (
      <div className="h-28 bg-[#1C130D] border border-[#1C130D] p-3 flex flex-col justify-between font-mono text-[9px] text-[#EFE7DE] overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[#FAD9BA] font-bold">APPLE SILICON ANE</span>
          <span className="px-1.5 py-0.5 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 text-[8px] tabular-nums">
            0 KB CLOUD I/O
          </span>
        </div>

        {/* 16-Core Neural Grid Matrix */}
        <div className="grid grid-cols-8 gap-1 my-1">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="h-3.5 border border-[#FAD9BA]/30"
              animate={{
                backgroundColor: isActive
                  ? i % 3 === 0
                    ? "#10B981"
                    : "#FAD9BA"
                  : i % 4 === 0
                    ? "#7A421D"
                    : "#271C14",
                opacity: isActive ? 0.95 : 0.45,
              }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[8px] text-[#EFE7DE]/60">
          <span>SchemaGAN + DQN Core ML</span>
          <span className="text-[#FAD9BA]">100% AIR-GAPPED</span>
        </div>
      </div>
    )
  }

  // Pillar 04: ASTM D5778 & SNI 8460:2017 Cone Penetrometer Blueprint
  return (
    <div className="h-28 bg-[#1C130D] border border-[#1C130D] p-3 flex flex-col justify-between font-mono text-[9px] text-[#EFE7DE] overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-[#FAD9BA] font-bold">ASTM D5778 / SNI 8460</span>
        <span className="text-[#E76F51] font-bold">60° CONE</span>
      </div>

      <svg className="w-full h-12" viewBox="0 0 220 44">
        {/* Friction Sleeve (fs) */}
        <rect
          x="12"
          y="12"
          width="90"
          height="20"
          fill="#271C14"
          stroke="#EFE7DE"
          strokeWidth="1.2"
        />
        <text x="57" y="25" textAnchor="middle" fill="#EFE7DE" fontSize="7">
          fs SLEEVE (150 cm²)
        </text>

        {/* Pore Pressure Filter Element (u2) */}
        <rect x="104" y="10" width="12" height="24" fill="#10B981" />
        <text x="110" y="8" textAnchor="middle" fill="#10B981" fontSize="6">
          u2
        </text>

        {/* 60-degree Conical Tip (qc) */}
        <motion.polygon
          points="118,12 168,22 118,32"
          fill="#FAD9BA"
          stroke="#FAD9BA"
          strokeWidth="1.2"
          animate={{ x: isActive ? 5 : 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 16 }}
        />
        <text x="188" y="25" fill="#FAD9BA" fontSize="7" fontWeight="bold">
          10 cm²
        </text>
      </svg>

      <div className="flex items-center justify-between text-[8px] text-[#EFE7DE]/60 tabular-nums">
        <span>RATE: 20 mm/s ± 5 mm/s</span>
        <span className="text-[#10B981]">VERIFIED</span>
      </div>
    </div>
  )
}

export function TechnicalTrustSection() {
  const { trust } = SITE_CONTENT
  const pillarsTrackRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [activePillar, setActivePillar] = useState<number>(0)
  const [pillarSubProgress, setPillarSubProgress] = useState<number>(0)

  // Dedicated 240vh sticky scroll track for the 4 Specification Plates
  const { scrollYProgress } = useScroll({
    target: pillarsTrackRef,
    offset: ["start start", "end end"],
  })

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.001,
  })

  // Differential Column Parallax for the 4 Specification Plates
  const yColA = useTransform(smoothScroll, [0, 1], shouldReduceMotion ? [0, 0] : [24, -24])
  const yColB = useTransform(smoothScroll, [0, 1], shouldReduceMotion ? [0, 0] : [-20, 20])
  const yBgBand = useTransform(smoothScroll, [0, 1], shouldReduceMotion ? [0, 0] : [-45, 45])

  // Purely scroll-driven specification plate spotlight
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const clamped = Math.max(0, Math.min(0.9999, latest))
    const rawIdx = clamped * 4
    const nextIdx = Math.floor(rawIdx)
    const subProg = rawIdx - nextIdx

    if (nextIdx !== activePillar) {
      setActivePillar(nextIdx)
    }
    setPillarSubProgress(subProg)
  })

  const getPillarIcon = (index: number) => {
    switch (index) {
      case 0:
        return <FileCheck2 className="w-4 h-4 text-[#7A421D]" />
      case 1:
        return <Globe2 className="w-4 h-4 text-[#7A421D]" />
      case 2:
        return <Cpu className="w-4 h-4 text-[#5A3008]" />
      case 3:
      default:
        return <Lock className="w-4 h-4 text-[#7A421D]" />
    }
  }

  return (
    <section
      id="trust"
      aria-label="Section 06: Standards and data privacy"
      className="relative bg-[#FBF7F2] border-b border-[#1C130D]/15 scroll-mt-12"
    >
      {/* Part A: 240vh Sticky Scroll-Driven Specification Plates Track */}
      <div ref={pillarsTrackRef} className="relative h-[240vh]">
        <div className="sticky top-0 h-screen min-h-[100dvh] w-full overflow-hidden flex flex-col justify-center py-6 sm:py-10 lg:py-16">
          {/* Parallax Drafting Table Architectural Background Lines */}
          <motion.div
            style={{ y: yBgBand, ...willChangeTransform }}
            className="absolute inset-0 pointer-events-none select-none overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #1C130D 1px, transparent 1px), linear-gradient(to bottom, #1C130D 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />
            <div className="hidden xl:block absolute left-8 top-20 font-mono text-[10px] tracking-[0.3em] text-[#1C130D]/25 uppercase">
              + STATUTORY COMPLIANCE // ASTM D5778 // SNI 8460:2017 // ROBERTSON 1990/2010 +
            </div>
          </motion.div>

          <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            {/* Plate Header */}
            <PlateHeader
              number="06"
              title="Standards and data privacy"
              metaRight="Scroll-driven specification inspection"
              tone="light"
              className="mb-4 sm:mb-6"
            />

            {/* Section Heading + Scroll Spotlight Progress */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-12">
              <div className="max-w-3xl space-y-1 sm:space-y-3">
                <h2 className="font-sans font-black text-2xl sm:text-4xl xl:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92] text-balance">
                  {trust.heading}
                </h2>
                <p className="font-sans text-[#63554B] text-xs sm:text-sm md:text-base leading-relaxed text-pretty">
                  {trust.subheading}
                </p>
              </div>

              {/* Scroll Indicator */}
              <div className="w-full lg:w-72 bg-[#EFE7DE] border border-[#1C130D]/15 p-2 shrink-0 select-none">
                <div className="w-full h-1.5 bg-[#E3D7C8] overflow-hidden">
                  <motion.div
                    style={{
                      scaleX: smoothScroll,
                      transformOrigin: "0% 50%",
                      ...willChangeTransform,
                    }}
                    className="h-full w-full bg-[#5A3008]"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Layout (lg+): 4 Scroll-Driven Parallax Specification Plates */}
            <div className="hidden lg:grid grid-cols-4 gap-6">
              {trust.badges.map((badge, idx) => {
                const isSelected = activePillar === idx
                const isPast = idx < activePillar
                const isOddCol = idx % 2 === 1

                return (
                  <motion.div
                    key={badge.title}
                    style={{
                      y: isOddCol ? yColB : yColA,
                      ...willChangeAll,
                    }}
                    animate={{
                      scale: isSelected ? 1.03 : 0.97,
                      opacity: isSelected ? 1 : isPast ? 0.62 : 0.48,
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                    className={`relative bg-[#FAF5EE] border p-5 flex flex-col justify-between transition-colors select-none ${
                      isSelected
                        ? "border-[#5A3008] bg-white shadow-2xl z-20"
                        : "border-[#1C130D]/15 shadow-xs z-10"
                    }`}
                  >
                    {/* Shared LayoutId Magnetic Architectural Frame */}
                    {isSelected && (
                      <motion.div
                        layoutId="trust-active-plate"
                        transition={{ type: "spring", stiffness: 280, damping: 26 }}
                        className="absolute inset-0 border-2 border-[#5A3008] pointer-events-none z-20"
                      />
                    )}

                    <div className="space-y-4">
                      {/* Top Plate Number & Code Tag */}
                      <div className="flex items-center justify-between font-mono text-[10px] border-b border-[#1C130D]/10 pb-2.5">
                        <span className="font-bold text-[#7A421D] flex items-center gap-1.5">
                          {getPillarIcon(idx)}
                          <span className="tabular-nums">SPEC 0{idx + 1}</span>
                        </span>
                        <Badge
                          variant={isSelected ? "emerald" : "default"}
                          className="text-[9px] py-0.5"
                        >
                          {idx === 0
                            ? "SBTn 9-ZONE"
                            : idx === 1
                              ? "UTM 48S"
                              : idx === 2
                                ? "CORE ML ANE"
                                : "ASTM / SNI"}
                        </Badge>
                      </div>

                      {/* Scroll-Activated Animated Micro-Schematic */}
                      <PillarMicroSchematic index={idx} isActive={isSelected} />

                      <div className="pt-1 space-y-2">
                        <h3 className="font-sans font-bold text-lg text-[#1C130D] tracking-tight">
                          {badge.title}
                        </h3>
                        <p className="font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed text-pretty">
                          {badge.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#1C130D]/10 space-y-2">
                      <div className="flex items-center justify-between font-mono text-[10px] text-[#7A421D]">
                        <span>{isSelected ? "ACTIVE IN SCROLL" : "STATUS"}</span>
                        <span className="font-bold text-[#1C130D]">FIELD VERIFIED</span>
                      </div>

                      {/* Per-Plate Scroll Sub-Progress Bar */}
                      <div className="w-full h-1 bg-[#E3D7C8] overflow-hidden">
                        <div
                          className="h-full bg-[#5A3008] transition-all duration-75"
                          style={{
                            width: isSelected
                              ? `${Math.round(pillarSubProgress * 100)}%`
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

            {/* Mobile & Tablet Layout (<lg): Stepper Indicator + Single Active Spec Plate */}
            <div className="lg:hidden flex flex-col space-y-3 font-mono">
              {/* Stepper Tabs Bar */}
              <div className="grid grid-cols-4 gap-1 text-[9px] sm:text-[10px]">
                {trust.badges.map((b, idx) => (
                  <div
                    key={b.title}
                    className={`py-1.5 px-1 text-center border truncate tabular-nums transition-colors ${
                      activePillar === idx
                        ? "bg-[#5A3008] text-[#FAD9BA] border-[#5A3008] font-bold shadow-xs"
                        : idx < activePillar
                          ? "bg-[#EFE7DE] text-[#7A421D] border-[#1C130D]/20"
                          : "bg-[#FAF5EE] text-[#63554B]/60 border-[#1C130D]/10"
                    }`}
                  >
                    SPEC 0{idx + 1}
                  </div>
                ))}
              </div>

              {/* Single Active Spec Card on Mobile */}
              <div className="bg-white border-2 border-[#5A3008] p-4 sm:p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C130D]/10 pb-2 text-[10px]">
                  <span className="font-bold text-[#7A421D] flex items-center gap-1.5">
                    {getPillarIcon(activePillar)}
                    <span className="tabular-nums">SPEC 0{activePillar + 1}</span>
                  </span>
                  <Badge variant="emerald" className="text-[9px] py-0.5">
                    {activePillar === 0
                      ? "SBTn 9-ZONE"
                      : activePillar === 1
                        ? "UTM 48S"
                        : activePillar === 2
                          ? "CORE ML ANE"
                          : "ASTM / SNI"}
                  </Badge>
                </div>

                <PillarMicroSchematic index={activePillar} isActive={true} />

                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-base sm:text-lg text-[#1C130D] tracking-tight">
                    {trust.badges[activePillar]?.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed line-clamp-3">
                    {trust.badges[activePillar]?.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1C130D]/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#7A421D]">
                    <span>SCROLL ACTIVE</span>
                    <span className="font-bold text-[#1C130D]">FIELD VERIFIED</span>
                  </div>
                  <div className="w-full h-1 bg-[#E3D7C8] overflow-hidden">
                    <div
                      className="h-full bg-[#5A3008] transition-all duration-75"
                      style={{ width: `${Math.round(pillarSubProgress * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

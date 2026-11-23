import { useRef, useState } from "react"
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion"
import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import {
  ChevronDown,
  Cpu,
  FileCheck2,
  Globe2,
  Lock,
  ShieldCheck,
  FileText,
} from "lucide-react"

const willChangeTransform = { willChange: "transform" } as const

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
          <span>SBTn ZONES 1–9</span>
          <span>Ic &lt;= 1.80</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-14 pt-2">
          {zoneHeights.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <motion.div
                className="w-full"
                style={{ backgroundColor: zoneColors[i] }}
                initial={{ height: "25%" }}
                animate={{
                  height: isActive ? `${h}%` : `${Math.max(25, h * 0.65)}%`,
                  opacity: i >= 5 ? 1 : 0.6,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 18, delay: i * 0.03 }}
              />
              <span className="text-[7px] text-[#EFE7DE]/50">Z{i + 1}</span>
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
        <div className="space-y-1 z-10">
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
          animate={{ rotate: isActive ? 45 : 0, scale: isActive ? 1.06 : 1 }}
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
          <span className="px-1.5 py-0.5 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 text-[8px]">
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
                opacity: isActive ? 0.9 : 0.65,
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
          animate={{ x: isActive ? 4 : 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 16 }}
        />
        <text x="188" y="25" fill="#FAD9BA" fontSize="7" fontWeight="bold">
          10 cm²
        </text>
      </svg>

      <div className="flex items-center justify-between text-[8px] text-[#EFE7DE]/60">
        <span>RATE: 20 mm/s ± 5 mm/s</span>
        <span className="text-[#10B981]">VERIFIED</span>
      </div>
    </div>
  )
}

export function TechnicalTrustSection() {
  const { trust, faq } = SITE_CONTENT
  const sectionRef = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activePillar, setActivePillar] = useState<number>(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    restDelta: 0.001,
  })

  // Differential Column Parallax for the 4 Specification Plates
  const yColA = useTransform(smoothScroll, [0, 1], shouldReduceMotion ? [0, 0] : [28, -28])
  const yColB = useTransform(smoothScroll, [0, 1], shouldReduceMotion ? [0, 0] : [-22, 22])
  const yBgBand = useTransform(smoothScroll, [0, 1], shouldReduceMotion ? [0, 0] : [-50, 50])

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

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
      ref={sectionRef}
      id="trust"
      className="relative py-28 bg-[#FBF7F2] border-b border-[#1C130D]/15 scroll-mt-12 overflow-hidden"
    >
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
        <div className="hidden xl:block absolute left-8 top-24 font-mono text-[10px] tracking-[0.3em] text-[#1C130D]/20 uppercase">
          + STATUTORY COMPLIANCE // ASTM D5778 // SNI 8460:2017 // ROBERTSON 1990/2010 +
        </div>
      </motion.div>

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Plate Header */}
        <PlateHeader
          number="06"
          title="Standards and data privacy"
          metaRight="Statutory compliance & engineering dossier"
          tone="light"
        />

        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-3xl space-y-4">
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92]">
              {trust.heading}
            </h2>
            <p className="font-sans text-[#63554B] text-base sm:text-lg leading-relaxed">
              {trust.subheading}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs bg-[#EFE7DE] border border-[#1C130D]/15 px-3.5 py-2 shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#5A3008]" />
            <span className="text-[#1C130D] font-bold uppercase tracking-wider">
              Verified Field Spec v4.6
            </span>
          </div>
        </div>

        {/* 4 Interactive Parallax Specification Plates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-28">
          {trust.badges.map((badge, idx) => {
            const isSelected = activePillar === idx
            const isOddCol = idx % 2 === 1

            return (
              <motion.div
                key={badge.title}
                style={{
                  y: isOddCol ? yColB : yColA,
                  ...willChangeTransform,
                }}
                onMouseEnter={() => setActivePillar(idx)}
                onClick={() => setActivePillar(idx)}
                className={`relative bg-[#FAF5EE] border p-5 flex flex-col justify-between transition-colors cursor-pointer select-none shadow-xs ${
                  isOddCol ? "lg:mt-6" : ""
                } ${
                  isSelected
                    ? "border-[#5A3008] bg-white shadow-xl"
                    : "border-[#1C130D]/15 hover:border-[#1C130D]/40"
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
                      <span>SPEC 0{idx + 1}</span>
                    </span>
                    <Badge variant={isSelected ? "emerald" : "default"} className="text-[9px] py-0.5">
                      {idx === 0
                        ? "SBTn 9-ZONE"
                        : idx === 1
                          ? "UTM 48S"
                          : idx === 2
                            ? "CORE ML ANE"
                            : "ASTM / SNI"}
                    </Badge>
                  </div>

                  {/* Interactive Animated Micro-Schematic */}
                  <PillarMicroSchematic index={idx} isActive={isSelected} />

                  <div className="pt-1 space-y-2">
                    <h3 className="font-sans font-bold text-lg text-[#1C130D] tracking-tight">
                      {badge.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed">
                      {badge.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1C130D]/10 flex items-center justify-between font-mono text-[10px] text-[#7A421D]">
                  <span>STATUS</span>
                  <span className="font-bold text-[#1C130D]">FIELD VERIFIED</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Spring-Physics Engineering Dossier FAQ */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#1C130D]/15 gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#7A421D] font-bold block">
                Technical engineering dossier
              </span>
              <h3 className="font-sans font-black text-2xl sm:text-3xl text-[#1C130D] uppercase tracking-tight mt-1">
                Common technical questions
              </h3>
            </div>
            <span className="font-mono text-[11px] text-[#63554B] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#7A421D]" />
              4 Reference specifications
            </span>
          </div>

          <div className="divide-y divide-[#1C130D]/15 border-b border-[#1C130D]/15 bg-[#FAF5EE] border-x border-t">
            {faq.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={item.q}
                  className={`relative transition-colors ${
                    isOpen ? "bg-white" : "hover:bg-[#EFE7DE]/40"
                  }`}
                >
                  {/* Shared LayoutId Active Dossier Indicator Bar */}
                  {isOpen && (
                    <motion.div
                      layoutId="faq-active-bar"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#5A3008]"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-mono text-xs sm:text-sm font-bold text-[#1C130D] hover:text-[#7A421D] transition-colors cursor-pointer px-6 py-5 min-h-[56px]"
                  >
                    <span className="flex items-center gap-3.5">
                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 tabular-nums border ${
                          isOpen
                            ? "bg-[#5A3008] text-[#FAD9BA] border-[#5A3008]"
                            : "bg-[#EFE7DE] text-[#7A421D] border-[#1C130D]/15"
                        }`}
                      >
                        DOC-0{idx + 1}
                      </span>
                      <span className="font-sans font-bold text-sm sm:text-base text-[#1C130D]">
                        {item.q}
                      </span>
                    </span>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="shrink-0 w-7 h-7 bg-[#EFE7DE] border border-[#1C130D]/15 flex items-center justify-center"
                    >
                      <ChevronDown className="w-4 h-4 text-[#1C130D]" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-1 pl-[5.5rem] pr-8 font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed border-t border-[#1C130D]/5">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FullWidthTopographicBackground } from "../motion/FullWidthTopographicBackground"
import { Compass } from "lucide-react"

interface StepContent {
  id: string
  code: string
  stepNumber: string
  titleLine1: string
  titleLine2: string
  category: string
  metricText: string
  description: string
}

const STEPS_DATA: StepContent[] = [
  {
    id: "gap",
    code: "01 / 03",
    stepNumber: "01",
    titleLine1: "SPATIAL",
    titleLine2: "DATA GAP",
    category: "DISTANCE VORONOI · UNEXPLORED CORE VOID",
    metricText: "16.2M VOID · 0 SOUNDINGS IN 4.0M RADIUS →",
    description:
      "Fills the largest spatial void under heavy structural core loads. Prior fixed grids left an uninvestigated 16.2 meter radius gap without soundings, risking differential foundation settlement.",
  },
  {
    id: "transition",
    code: "02 / 03",
    stepNumber: "02",
    titleLine1: "STRATIGRAPHIC",
    titleLine2: "SHIFT PREDICTION",
    category: "FORMATION BOUNDARY · SOFT SENSITIVE CLAY",
    metricText: "CLEAN SAND TO SOFT CLAY AT 8.5M DEPTH →",
    description:
      "SchemaGAN V4.2 flags a predicted formation boundary where dense load-bearing sand terminates abruptly into soft sensitive marine clay at 8.5 meters depth. Fixed grids fail to detect dipping strata interfaces.",
  },
  {
    id: "anomaly",
    code: "03 / 03",
    stepNumber: "03",
    titleLine1: "SOIL BEHAVIOR",
    titleLine2: "ANOMALY DETECTION",
    category: "DQN V4.6-A CORE ML · MAXIMUM INFORMATION GAIN",
    metricText: "LATERAL OFFSET ΔIC = 0.18 · HIGHEST Q-VALUE →",
    description:
      "The Deep Q-Network ranks candidate coordinates by maximum information gain, identifying Spot 2 with localized lateral variations (ΔIc = 0.18) against adjacent soundings B-01 and B-03.",
  },
]

export function DQNRecommendationSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    let rafId = 0

    const updateScroll = () => {
      const track = trackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const totalDist = rect.height - window.innerHeight
      if (totalDist <= 0) return

      // Normalized progress (0.0 to 1.0) through the 300vh track
      const rawProg = -rect.top / totalDist
      const prog = Math.max(0, Math.min(1, rawProg))
      setScrollProgress(prog)

      let step = 0
      if (prog >= 0.64) {
        step = 2
      } else if (prog >= 0.31) {
        step = 1
      }
      setActiveStep(step)
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateScroll)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    updateScroll()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const currentStep = STEPS_DATA[activeStep]

  return (
    <section
      id="dqn"
      ref={trackRef}
      aria-label="Section 02: Next sounding selection"
      className="relative bg-[#150E09] text-[#EFE7DE] border-b border-[#EFE7DE]/15 h-[300vh]"
    >
      {/* Pinned Sticky Viewport (100% Scroll-Driven ala Rapidkert Section 09) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-16 z-10 select-none">
        {/* Full-Width Dynamic Motion Graphic Background */}
        <FullWidthTopographicBackground
          scrollProgress={scrollProgress}
          activeStep={activeStep}
        />

        {/* Top Header Bar with Hairline Rule (Rapidkert style) */}
        <header className="relative z-10 w-full border-b border-[#EFE7DE]/15 pb-4">
          <div className="flex items-center justify-between font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#FAD9BA]">02</span>
              <h2 className="text-xs sm:text-sm uppercase tracking-[0.16em] text-[#EFE7DE]/85 font-sans font-bold">
                NEXT SOUNDING SELECTION.
              </h2>
            </div>

            {/* Scroll Indicator */}
            <div className="w-16 sm:w-24 h-1.5 bg-[#271C14] border border-[#EFE7DE]/20 overflow-hidden">
              <div
                className="h-full bg-[#10B981] transition-all duration-150"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
          </div>
        </header>

        {/* Main Editorial Content (Directly Overlaid on the Topographic Motion Graphic!) */}
        <div className="relative z-10 max-w-2xl sm:max-w-3xl space-y-6 my-auto pt-6 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Step Number Tag */}
              <div className="font-mono text-xs font-bold tracking-[0.2em] text-[#BD8564] flex items-center gap-2">
                <span className="tabular-nums">{currentStep.stepNumber}</span>
              </div>

              {/* Monumental Condensed Headline spanning boldly over the strata */}
              <h3 className="font-sans font-black text-5xl sm:text-7xl xl:text-[84px] uppercase tracking-[-0.04em] leading-[0.88] text-[#EFE7DE] text-balance">
                <span className="block">{currentStep.titleLine1}</span>
                <span className="block text-[#FAD9BA]">{currentStep.titleLine2}</span>
              </h3>

              {/* Category / Sub-specs hairline pill */}
              <div className="border-t border-[#EFE7DE]/20 pt-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#BD8564] block">
                  {currentStep.category}
                </span>
              </div>

              {/* Editorial Description Text */}
              <p className="font-sans text-[#EFE7DE]/80 text-sm sm:text-base leading-relaxed max-w-xl text-pretty">
                {currentStep.description}
              </p>

              {/* Technical Metric Pill Readout */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#FAD9BA] border-b border-[#FAD9BA]/40 pb-1 tabular-nums">
                  {currentStep.metricText}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Status Ticker: Scroll Instructions & Real-time Coordinates */}
        <footer className="relative z-10 w-full border-t border-[#EFE7DE]/15 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-[#EFE7DE]/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#FAD9BA]">
                <Compass className="w-3.5 h-3.5" />
                <span>ACTIVE POLICY ENGINE: CORE ML DEEP Q-NETWORK</span>
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">29 SPATIAL SOIL FEATURES</span>
            </div>

            <div className="flex items-center gap-2 text-[#EFE7DE]/70">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}

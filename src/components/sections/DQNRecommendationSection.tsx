import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FullWidthTopographicBackground } from "../motion/FullWidthTopographicBackground"
import { ArrowRight, Compass, Sparkles, AlertTriangle } from "lucide-react"

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
    titleLine2: "EXPLORATION VOID",
    category: "DISTANCE VORONOI · UNEXPLORED BLIND ZONE",
    metricText: "16.2M VOID · ZERO SOUNDINGS WITHIN 4.0M →",
    description:
      "Prior fixed-grid boreholes left an uninvestigated 16.2-meter radius void in the site center. Standard grids blindly assume uniform stratigraphy across this blind zone, risking major foundation settlement.",
  },
  {
    id: "transition",
    code: "02 / 03",
    stepNumber: "02",
    titleLine1: "FAULT",
    titleLine2: "BOUNDARY DIP",
    category: "SHEAR INTERFACE · SOFT CLAY BASIN TRAP",
    metricText: "PREDICTED BOUNDARY: CLEAN SAND → SOFT CLAY (-8.5M) →",
    description:
      "Subsurface kriging models a steep dipping shear boundary plunging from competent sand into an undetected soft clay trap at -8.5m. Linear spacing fails to capture sloping interfaces, leaving high-risk blind zones.",
  },
  {
    id: "anomaly",
    code: "03 / 03",
    stepNumber: "03",
    titleLine1: "SPOT 2",
    titleLine2: "RECOMMENDED",
    category: "DQN V4.6-A CORE ML · MAXIMUM ENTROPY REDUCTION",
    metricText: "COORDINATES: X=68.4M Y=44.1M · GAIN +14.2% →",
    description:
      "Deep Q-Network optimizes the Markov Decision Process, locking Spot 2 as the single optimal probe to eliminate maximum variance with zero redundant boreholes, saving up to $14,000 in drilling costs.",
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
      className="relative bg-[#150E09] text-[#EFE7DE] border-b border-[#EFE7DE]/15 h-[300vh]"
    >
      {/* Pinned Sticky Viewport (100% Scroll-Driven ala Rapidkert Section 09) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-16 z-10 select-none">
        {/* Full-Width Dynamic Motion Graphic Background (NOT split 50/50!) */}
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

            {/* Counter: 01 / 03 -> 02 / 03 -> 03 / 03 */}
            <div className="flex items-center gap-3">
              <div className="w-16 sm:w-24 h-1 bg-[#271C14] border border-[#EFE7DE]/20 overflow-hidden">
                <div
                  className="h-full bg-[#10B981] transition-all duration-150"
                  style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                />
              </div>
              <span className="font-bold tracking-widest text-[#FAD9BA] tabular-nums">
                {currentStep.code}
              </span>
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
                <span>{currentStep.stepNumber}</span>
              </div>

              {/* Monumental Condensed Headline spanning boldly over the strata */}
              <h3 className="font-sans font-black text-5xl sm:text-7xl xl:text-[84px] uppercase tracking-[-0.04em] leading-[0.88] text-[#EFE7DE]">
                <span className="block">{currentStep.titleLine1}</span>
                <span className="block text-[#FAD9BA]">{currentStep.titleLine2}</span>
              </h3>

              {/* Architectural Category Tag */}
              <div className="font-mono text-xs uppercase tracking-widest text-[#BD8564] pt-1">
                {currentStep.category}
              </div>

              {/* Concise Editorial Copy */}
              <p className="font-sans text-[#EFE7DE]/75 text-sm sm:text-base leading-relaxed max-w-xl">
                {currentStep.description}
              </p>

              {/* Action / Key Metric Badge Link */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#FAD9BA] border-b border-[#FAD9BA]/40 pb-1">
                  <span>{currentStep.metricText}</span>
                  {activeStep === 0 && <AlertTriangle className="w-3.5 h-3.5 text-[#E76F51]" />}
                  {activeStep === 1 && <Compass className="w-3.5 h-3.5 text-[#FAD9BA]" />}
                  {activeStep === 2 && <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Horizontal Timeline Stepper Indicator (Rapidkert style) */}
        <footer className="relative z-10 w-full pt-4 border-t border-[#EFE7DE]/15 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] sm:text-xs">
          <div className="flex items-center gap-6 sm:gap-10">
            {STEPS_DATA.map((step, idx) => {
              const isActive = activeStep === idx
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 transition-colors duration-200 ${
                    isActive ? "text-[#FAD9BA] font-bold" : "text-[#EFE7DE]/35"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 ${
                      isActive ? "bg-[#10B981]" : "bg-[#EFE7DE]/20"
                    }`}
                  />
                  <span>
                    {step.stepNumber} · {step.titleLine1} {step.titleLine2}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2 text-[#EFE7DE]/40 text-[10px]">
            <span>SCROLL TO ADVANCE</span>
            <ArrowRight className="w-3 h-3 text-[#10B981]" />
          </div>
        </footer>
      </div>
    </section>
  )
}

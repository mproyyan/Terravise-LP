import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TopographicStrataCanvas } from "../motion/TopographicStrataCanvas"
import { Compass, Sparkles, AlertTriangle, ArrowRight } from "lucide-react"

interface StepContent {
  id: string
  code: string
  stepNumber: string
  title: string
  category: string
  metricLabel: string
  metricValue: string
  description: string
  badgeTone: "amber" | "clay" | "emerald"
}

const STEPS_DATA: StepContent[] = [
  {
    id: "gap",
    code: "01 / 03",
    stepNumber: "01",
    title: "16.2M EXPLORATION VOID",
    category: "DISTANCE VORONOI · UNEXPLORED BLIND ZONE",
    metricLabel: "Nearest sounding distance",
    metricValue: "16.2m · ZERO WITHIN 4.0M",
    description:
      "Prior fixed-grid boreholes left an uninvestigated 16.2-meter radius void in the site center. Standard engineering layouts blindly assume uniform stratigraphy across this gap, risking catastrophic foundation differential settlement.",
    badgeTone: "amber",
  },
  {
    id: "transition",
    code: "02 / 03",
    stepNumber: "02",
    title: "FAULT BOUNDARY DIP",
    category: "SHEAR INTERFACE · SOFT CLAY BASIN TRAP",
    metricLabel: "Predicted layer boundary",
    metricValue: "CLEAN SAND → SOFT CLAY (-8.5M)",
    description:
      "Subsurface kriging models a steep dipping shear boundary plunging from competent sand into an undetected soft clay trap at -8.5m. Linear spacing fails to capture sloping interfaces, leaving high-risk blind zones undetected.",
    badgeTone: "clay",
  },
  {
    id: "anomaly",
    code: "03 / 03",
    stepNumber: "03",
    title: "SPOT 2 RECOMMENDED",
    category: "DQN V4.6-A CORE ML · MAXIMUM ENTROPY REDUCTION",
    metricLabel: "Optimal sounding telemetry",
    metricValue: "X=68.4M Y=44.1M · GAIN +14.2% · 94.2% CONF",
    description:
      "Deep Q-Network optimizes the Markov Decision Process, locking Spot 2 as the single highest-value sounding. It resolves maximum geological variance in a single probe, eliminating 4 redundant holes and saving up to $14,000 in field budget.",
    badgeTone: "emerald",
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

      // Normalized progress (0.0 to 1.0) through the 280vh track
      const rawProg = -rect.top / totalDist
      const prog = Math.max(0, Math.min(1, rawProg))
      setScrollProgress(prog)

      // 3 Discrete Steps: 0%..33%, 33%..66%, 66%..100%
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
      className="relative bg-[#150E09] text-[#EFE7DE] border-b border-[#EFE7DE]/15 h-[280vh]"
    >
      {/* Sticky Full-Viewport Stage (100% Scroll-Driven ala Rapidkert Section 09) */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden p-6 sm:p-10 lg:p-14 z-10 select-none">
        {/* Top Header Plate & Counter */}
        <div className="w-full border-b border-[#EFE7DE]/15 pb-4">
          <div className="flex items-center justify-between font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#FAD9BA]">02</span>
              <span className="uppercase tracking-[0.16em] text-[#EFE7DE]/80">
                NEXT SOUNDING SELECTION
              </span>
              <span className="hidden md:inline-block w-px h-3 bg-[#EFE7DE]/20" />
              <span className="hidden md:inline-block text-[10px] uppercase tracking-wider text-[#BD8564]">
                100% Scroll-Driven Geodetic Intelligence
              </span>
            </div>

            {/* Rapidkert-style Fractional Counter (01 / 03 -> 02 / 03 -> 03 / 03) */}
            <div className="flex items-center gap-3">
              <div className="w-20 sm:w-28 h-1 bg-[#271C14] border border-[#EFE7DE]/20 overflow-hidden">
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
        </div>

        {/* Main 5:7 Split: Left Monumental Editorial | Right Top-Down Topographic Motion Graphic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 my-4 min-h-0">
          {/* Left 5 Columns: Monumental Editorial Stage with Smooth Transition */}
          <div className="lg:col-span-5 flex flex-col justify-center min-h-[360px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Large Index Number */}
                <div className="font-mono text-xs sm:text-sm font-bold tracking-[0.2em] text-[#BD8564] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none bg-[#10B981] inline-block" />
                  <span>STEP {currentStep.stepNumber}</span>
                  <span className="text-[#EFE7DE]/30">/</span>
                  <span className="text-[#EFE7DE]/60 uppercase tracking-widest text-[10px]">
                    {currentStep.category}
                  </span>
                </div>

                {/* Monumental Headline */}
                <h2 className="font-sans font-black text-4xl sm:text-5xl xl:text-6xl text-[#EFE7DE] uppercase tracking-[-0.04em] leading-[0.9]">
                  {currentStep.title}
                </h2>

                {/* Technical Description */}
                <p className="font-sans text-[#EFE7DE]/75 text-sm sm:text-base leading-relaxed max-w-xl">
                  {currentStep.description}
                </p>

                {/* Metric Telemetry Card */}
                <div className="bg-[#271C14]/90 border border-[#EFE7DE]/15 p-4 font-mono text-xs space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-[#BD8564] flex items-center justify-between">
                    <span>{currentStep.metricLabel}</span>
                    {activeStep === 0 && <AlertTriangle className="w-3.5 h-3.5 text-[#E76F51]" />}
                    {activeStep === 1 && <Compass className="w-3.5 h-3.5 text-[#FAD9BA]" />}
                    {activeStep === 2 && <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />}
                  </div>
                  <div className="font-bold text-sm sm:text-base text-[#FAD9BA] tabular-nums">
                    {currentStep.metricValue}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right 7 Columns: Top-Down Topographic Motion Graphic (No 3D object, pure 2D architectural map) */}
          <div className="lg:col-span-7 h-[380px] sm:h-[440px] xl:h-[500px] border border-[#EFE7DE]/15 relative overflow-hidden bg-[#150E09] shadow-2xl">
            {/* Top-Right Drafting Tag */}
            <div className="absolute top-2.5 right-3.5 z-20 font-mono text-[9px] tracking-widest uppercase text-[#FAD9BA] bg-[#271C14]/90 px-2.5 py-1 border border-[#EFE7DE]/15 flex items-center gap-1.5 pointer-events-none">
              <span className="w-1.5 h-1.5 bg-[#10B981] inline-block animate-pulse" />
              <span>OVERHEAD TOPOGRAPHY &amp; SPOTLIGHT</span>
            </div>

            <TopographicStrataCanvas
              scrollProgress={scrollProgress}
              activeStep={activeStep}
            />
          </div>
        </div>

        {/* Bottom Horizontal Timeline Stepper Indicator */}
        <div className="w-full pt-4 border-t border-[#EFE7DE]/15 grid grid-cols-3 gap-4 font-mono text-[10px] sm:text-xs">
          {STEPS_DATA.map((step, idx) => {
            const isActive = activeStep === idx
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2.5 transition-colors duration-200 ${
                  isActive ? "text-[#FAD9BA] font-bold" : "text-[#EFE7DE]/40"
                }`}
              >
                <span
                  className={`w-2 h-2 ${
                    isActive ? "bg-[#10B981]" : "bg-[#EFE7DE]/20"
                  }`}
                />
                <span className="truncate">
                  {step.stepNumber} · {step.title}
                </span>
                {isActive && <ArrowRight className="w-3 h-3 text-[#10B981] shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

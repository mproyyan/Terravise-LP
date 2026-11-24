import { useRef, useState } from "react"
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion"
import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { CptPenetrometerSpine } from "../workflow/CptPenetrometerSpine"
import { WorkflowStepVisual } from "../workflow/WorkflowStepVisual"
import { ArrowDown, Activity } from "lucide-react"

export function WorkflowSection() {
  const { workflow } = SITE_CONTENT
  const sectionRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [liveDepthM, setLiveDepthM] = useState<number>(0)

  // Pure scroll-driven tracking through the CPT Sounding Descent timeline
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  })

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const clamped = Math.max(0, Math.min(1, latest))
    const rawStep = clamped * 4
    const nextIdx = Math.min(3, Math.floor(rawStep))
    if (nextIdx !== activeStep) {
      setActiveStep(nextIdx)
    }
    setLiveDepthM(clamped * 25.0)
  })

  return (
    <section
      ref={sectionRef}
      id="workflow"
      aria-label="Section 05: CPT Sounding Descent Workflow"
      className="relative py-20 sm:py-28 lg:py-36 bg-[#1C130D] text-[#EFE7DE] border-b border-[#EFE7DE]/15 scroll-mt-12 overflow-hidden z-10"
    >
      {/* Dynamic Geological Ambient Glow in Background (Subtly shifts with depth) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] select-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #FAD9BA 1px, transparent 1px), linear-gradient(to bottom, #FAD9BA 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: workflow[activeStep]?.stratumColor || "#D4A373", opacity: 0.08 }}
      />
      <div
        className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: workflow[activeStep]?.stratumColor || "#E76F51", opacity: 0.08 }}
      />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Plate Header */}
        <PlateHeader
          number="05"
          title="CPT sounding descent workflow"
          metaRight="Continuous scroll-driven penetration timeline"
          tone="dark"
          className="mb-6 sm:mb-8"
        />

        {/* Section Heading & Live Sounding Telemetry Meter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16 pb-6 border-b border-[#EFE7DE]/15">
          <div className="max-w-3xl space-y-2">
            <h2 className="font-sans font-black text-2xl sm:text-4xl xl:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92] text-balance">
              From surface boundary to foundation handoff
            </h2>
            <p className="font-sans text-[#EFE7DE]/70 text-xs sm:text-sm leading-relaxed text-pretty">
              As the CPT rig pushes the penetrometer cone into the earth, Terravise guides every decision from ground level down to bearing bedrock. Scroll to descend through all four stages.
            </p>
          </div>

          {/* Live Sounding Telemetry HUD Strip */}
          <div className="bg-[#271C14] border border-[#EFE7DE]/20 p-3 shrink-0 flex items-center gap-4 font-mono text-xs select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <div>
                <span className="text-[9px] text-[#EFE7DE]/50 block uppercase">PENETRATION DEPTH</span>
                <span className="text-sm font-bold text-[#FAD9BA] tabular-nums">
                  -{liveDepthM.toFixed(1)} m
                </span>
              </div>
            </div>

            <div className="h-7 w-[1px] bg-[#EFE7DE]/15" />

            <div>
              <span className="text-[9px] text-[#EFE7DE]/50 block uppercase">CURRENT STRATA</span>
              <span className="text-xs font-bold text-[#EFE7DE]">
                {workflow[activeStep]?.stratumName || "Ground Surface"}
              </span>
            </div>

            <div className="h-7 w-[1px] bg-[#EFE7DE]/15 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#BD8564]">
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              <span>SCROLL TO ADVANCE</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            DESKTOP LAYOUT (lg+): Alternating Sounding Descent Timeline
            Left Milestones | Center Steel Sounding Rod with Conical Tip | Right Milestones
           ========================================================================= */}
        <div className="hidden lg:grid grid-cols-12 gap-8 relative items-start">
          {/* Central Vertical Sounding Spine (Col 6..7 Anchor) */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-32 pointer-events-none z-20">
            <CptPenetrometerSpine progress={smoothProgress} activeStep={activeStep} />
          </div>

          {/* Timeline Milestones (Alternating Left & Right) */}
          <div className="col-span-12 space-y-24 xl:space-y-32 py-6">
            {workflow.map((step, idx) => {
              const isEven = idx % 2 === 0
              const isActive = activeStep === idx
              const isPast = activeStep > idx

              return (
                <div
                  key={step.stepNumber}
                  className="grid grid-cols-12 items-center relative"
                >
                  {/* Left Column Container (For Even Steps: 01, 03) */}
                  <div className={`col-span-5 ${isEven ? "block" : "invisible pointer-events-none"}`}>
                    {isEven && (
                      <MilestoneCard
                        step={step}
                        isActive={isActive}
                        isPast={isPast}
                        stepIndex={idx}
                        align="right"
                      />
                    )}
                  </div>

                  {/* Center Column Spacer (Pass-through for Central Sounding Rod) */}
                  <div className="col-span-2 flex justify-center items-center pointer-events-none">
                    {/* Architectural Datum Caliper Connector */}
                    <div className="w-full flex items-center justify-between px-2 font-mono text-[9px] text-[#BD8564]">
                      <span className={isEven ? "opacity-100" : "opacity-0"}>───►</span>
                      <span className="bg-[#1C130D] px-1.5 py-0.5 border border-[#EFE7DE]/20 text-[#FAD9BA] font-bold">
                        {step.depthDisplay}
                      </span>
                      <span className={!isEven ? "opacity-100" : "opacity-0"}>◄───</span>
                    </div>
                  </div>

                  {/* Right Column Container (For Odd Steps: 02, 04) */}
                  <div className={`col-span-5 ${!isEven ? "block" : "invisible pointer-events-none"}`}>
                    {!isEven && (
                      <MilestoneCard
                        step={step}
                        isActive={isActive}
                        isPast={isPast}
                        stepIndex={idx}
                        align="left"
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* =========================================================================
            MOBILE & TABLET LAYOUT (<lg): Sounding Rod on Left Edge, Cards on Right
           ========================================================================= */}
        <div className="lg:hidden relative pl-12 sm:pl-16 space-y-16">
          {/* Vertical Sounding Rod on Left Margin */}
          <div className="absolute top-0 bottom-0 left-2 sm:left-4 w-12 pointer-events-none z-20">
            <CptPenetrometerSpine progress={smoothProgress} activeStep={activeStep} />
          </div>

          {/* Stacked Milestone Cards */}
          {workflow.map((step, idx) => {
            const isActive = activeStep === idx
            const isPast = activeStep > idx

            return (
              <div key={step.stepNumber} className="relative">
                <MilestoneCard
                  step={step}
                  isActive={isActive}
                  isPast={isPast}
                  stepIndex={idx}
                  align="left"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

interface MilestoneCardProps {
  step: (typeof SITE_CONTENT.workflow)[number]
  isActive: boolean
  isPast: boolean
  stepIndex: number
  align: "left" | "right"
}

function MilestoneCard({
  step,
  isActive,
  isPast,
  stepIndex,
}: MilestoneCardProps) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.01 : 0.98,
        opacity: isActive ? 1 : isPast ? 0.72 : 0.45,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={`border transition-all duration-300 p-5 sm:p-6 space-y-4 select-none relative overflow-hidden ${
        isActive
          ? "bg-[#251A12] border-[#FAD9BA] shadow-[0_12px_44px_rgba(250,217,186,0.12)] z-10"
          : isPast
            ? "bg-[#1E140D]/90 border-[#EFE7DE]/25 z-0"
            : "bg-[#180E08]/60 border-[#EFE7DE]/10 z-0"
      }`}
    >
      {/* Top Header Row: Step Number, Depth Stamp, Status Badge */}
      <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`font-bold px-2 py-0.5 text-xs tabular-nums ${
              isActive
                ? "bg-[#FAD9BA] text-[#1C130D]"
                : isPast
                  ? "bg-[#10B981]/20 text-[#10B981]"
                  : "bg-[#1C130D] text-[#EFE7DE]/60"
            }`}
          >
            {step.stepNumber}
          </span>
        </div>

        <Badge
          variant="outline"
          className={`text-[9px] ${
            isActive
              ? "text-[#FAD9BA] border-[#FAD9BA]/40"
              : isPast
                ? "text-[#10B981] border-[#10B981]/30"
                : "text-[#EFE7DE]/40 border-[#EFE7DE]/10"
          }`}
        >
          {isPast ? "✓ COMPLETED DEPTH" : isActive ? "ACTIVE PENETRATION" : "QUEUED HORIZON"}
        </Badge>
      </div>

      {/* Main Copy Area */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono text-[#BD8564] uppercase tracking-wider">
          {step.subtitle}
        </div>
        <h3 className="font-sans font-bold text-lg sm:text-xl text-[#EFE7DE] tracking-tight leading-snug">
          {step.title}
        </h3>
        <p className="font-sans text-xs sm:text-sm text-[#EFE7DE]/75 leading-relaxed text-pretty">
          {step.description}
        </p>
      </div>

      {/* 3 Rationale Cards (For Step 03) or Standard 3 Metric Pills (For Steps 01, 02, 04) */}
      {step.rationales ? (
        <div className="space-y-2.5 pt-1 font-mono">
          <div className="text-[10px] text-[#BD8564] uppercase tracking-wider font-bold">
            Target Selection Criteria
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {step.rationales.map((rat) => (
              <div
                key={rat.title}
                className={`p-3 border transition-colors flex flex-col justify-between ${
                  isActive
                    ? "bg-[#FAD9BA]/[0.04] border-[#FAD9BA]/30 text-[#EFE7DE]"
                    : "bg-transparent border-[#EFE7DE]/15 text-[#EFE7DE]/70"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-bold text-[#FAD9BA] text-[10px] uppercase font-mono tracking-wide">
                      {rat.title}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 bg-[#FAD9BA]/10 text-[#FAD9BA] border border-[#FAD9BA]/20 font-mono">
                      {rat.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#EFE7DE]/80 leading-relaxed font-sans">
                    {rat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 font-mono text-[9px] pt-1">
          {step.metrics.map((metric) => (
            <div
              key={metric.label}
              className={`p-2.5 border transition-colors ${
                isActive
                  ? "bg-[#FAD9BA]/[0.04] border-[#FAD9BA]/30 text-[#EFE7DE]"
                  : "bg-transparent border-[#EFE7DE]/15 text-[#EFE7DE]/60"
              }`}
            >
              <span className="text-[#EFE7DE]/50 block text-[8px] uppercase font-mono">{metric.label}</span>
              <span className="text-[#FAD9BA] font-bold text-xs truncate block font-mono mt-0.5">{metric.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Clean Interactive Visual Snapshot (Steps 01, 02) */}
      {stepIndex < 2 && (
        <div className="pt-2">
          <WorkflowStepVisual stepIndex={stepIndex} isActive={isActive} />
        </div>
      )}

      {/* Deliverable Footer */}
      <div className="pt-3 border-t border-[#EFE7DE]/15 flex items-center justify-between font-mono text-[10px]">
        <span className="text-[#EFE7DE]/50 uppercase">Deliverable</span>
        <span className="text-[#FAD9BA] font-bold flex items-center gap-1 text-right">
          <Activity className="w-3 h-3 text-[#10B981]" />
          {step.deliverable}
        </span>
      </div>
    </motion.div>
  )
}

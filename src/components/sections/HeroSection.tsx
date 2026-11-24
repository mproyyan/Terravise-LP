import { useEffect, useRef } from "react"
import { Button } from "../ui/Button"
import { SITE_CONTENT } from "../../data/siteContent"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { HeroProblemGroundCanvas } from "../three/HeroProblemGroundStage"
import { ArrowRight, CheckCircle, Rotate3d } from "lucide-react"

interface HeroSectionProps {
  onOpenAppStore: () => void
}

export function HeroSection({ onOpenAppStore }: HeroSectionProps) {
  const { hero } = SITE_CONTENT
  const { registerDock } = useSubsurface3D()
  const heroDockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerDock("hero", heroDockRef.current)
    return () => registerDock("hero", null)
  }, [registerDock])

  return (
    <section
      id="hero"
      aria-label="Terravise hero introduction"
      className="relative pt-28 pb-16 md:pt-36 md:pb-20 border-b border-[#1C130D]/15"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Main 6:6 Split: Left Monumental Copy | Right Open Borderless 3D Monolith Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left 6 Columns: Headline, Value Proposition & App Store CTA */}
          <div className="lg:col-span-6 space-y-8">
            {/* Monumental Typography with Rapidkert-style asymmetrical indentation */}
            <h1 className="font-sans font-black text-4xl sm:text-6xl xl:text-[68px] uppercase tracking-[-0.04em] leading-[0.88] text-[#1C130D] text-balance">
              <span className="block">{hero.titleLine1}</span>
              <span className="block ln-in text-[#7A421D]">{hero.titleLine2}</span>
            </h1>

            <p className="text-[#63554B] text-base sm:text-lg max-w-xl font-sans leading-relaxed text-pretty">
              {hero.subtitle}
            </p>

            {/* App Store CTA Only */}
            <div className="pt-2">
              <Button
                variant="emerald"
                size="lg"
                onClick={onOpenAppStore}
                aria-label="Download Terravise on App Store"
                className="group flex items-center gap-2"
              >
                <span>{hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right 6 Columns: Open Borderless 3D Architectural Building & L-Cutaway Soil Monolith */}
          <div className="lg:col-span-6 relative">
            <div
              ref={heroDockRef}
              className="hidden lg:flex flex-col justify-between w-full h-[500px] xl:h-[560px] relative select-none pointer-events-none"
            >
              <div className="flex items-center justify-between font-mono text-[10px] tracking-widest uppercase text-[#1C130D]/30">
                <span>+</span>
                <span className="text-[9px] tracking-[0.2em]">
                  ARCHITECTURAL TOWER &amp; L-CUTAWAY SOIL MONOLITH
                </span>
                <span>+</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] tracking-widest uppercase text-[#1C130D]/30">
                <span>+</span>
                <span className="text-[9px] tracking-[0.16em] flex items-center gap-1.5 text-[#7A421D]">
                  <Rotate3d className="w-3 h-3" />
                  DRAG TO ROTATE
                </span>
                <span>+</span>
              </div>
            </div>

            {/* Mobile & Tablet Inline View */}
            <div className="lg:hidden w-full space-y-2">
              <div className="w-full h-[380px] relative overflow-hidden">
                <HeroProblemGroundCanvas isMobileInline={true} />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] px-2 py-1 border-t border-[#1C130D]/15 text-[#63554B]">
                <span className="font-bold uppercase tracking-wider">
                  Tower &amp; L-Cutaway Soil Monolith
                </span>
                <span className="flex items-center gap-1">
                  <Rotate3d className="w-3 h-3" />
                  4-Horizon Profile
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 12-Column Bottom Engineering Specifications Strip */}
        <div className="mt-12 pt-8 border-t border-[#1C130D]/15 grid grid-cols-2 sm:grid-cols-5 gap-6 items-center font-mono bg-[#FBF7F2]/85 backdrop-blur-xs">
          {hero.specPoints.map((spec) => (
            <div key={spec.label} className="space-y-1">
              <span className="text-[10px] text-[#63554B] uppercase tracking-[0.14em] block">
                {spec.label}
              </span>
              <span className="text-[#1C130D] font-bold text-sm sm:text-base tabular-nums">
                {spec.value}
              </span>
            </div>
          ))}

          <div className="col-span-2 sm:col-span-1 flex items-center sm:justify-end">
            <div className="inline-flex items-center gap-2 bg-[#EFE7DE]/70 border border-[#1C130D]/15 px-3 py-2 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-[#7A421D] shrink-0" />
              <span className="font-bold text-[#1C130D] whitespace-nowrap">ASTM D5778 &amp; SNI 8460</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

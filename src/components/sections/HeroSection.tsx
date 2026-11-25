import { useEffect, useRef } from "react"
import { Button } from "../ui/Button"
import { SITE_CONTENT } from "../../data/siteContent"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { ArrowRight, CheckCircle } from "lucide-react"

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
      className="relative min-h-screen min-h-[100dvh] flex flex-col justify-between pt-28 pb-12 md:pt-36 md:pb-16 border-b border-[#1C130D]/15"
    >
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex-1 flex flex-col justify-between">
        {/* Main 6:6 Split: Left Monumental Copy | Right Open Borderless 3D Monolith Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center my-auto py-4">
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
              className="w-full h-[320px] sm:h-[400px] lg:h-[500px] xl:h-[560px] relative select-none pointer-events-none"
            />
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

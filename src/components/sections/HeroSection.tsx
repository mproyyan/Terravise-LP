import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { Section3DAnchorDock } from "../three/Section3DAnchorDock"
import { ArrowRight, Download, CheckCircle, Layers } from "lucide-react"

interface HeroSectionProps {
  onOpenAppStore: () => void
  onDownloadTemplate: () => void
}

export function HeroSection({ onOpenAppStore, onDownloadTemplate }: HeroSectionProps) {
  const { hero } = SITE_CONTENT

  return (
    <section
      id="hero"
      className="relative pt-32 pb-24 md:pt-40 md:pb-28 overflow-hidden bg-[#FBF7F2] border-b border-[#1C130D]/15"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Monumental Architectural Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex flex-wrap items-center gap-2">
              <Badge variant="emerald" className="font-mono text-[10px] py-1 px-2.5">
                <span className="w-1.5 h-1.5 rounded-none bg-[#5A3008] inline-block mr-1.5" />
                {hero.badge}
              </Badge>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A421D] bg-[#E3D7C8]/50 px-2.5 py-1 border border-[#1C130D]/10 flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                Scroll to dissect 3D strata
              </span>
            </div>

            {/* Monumental Typography with Rapidkert-style asymmetrical indentation */}
            <h1 className="font-sans font-black text-4xl sm:text-6xl xl:text-7xl uppercase tracking-[-0.04em] leading-[0.88] text-[#1C130D]">
              <span className="block">{hero.titleLine1}</span>
              <span className="block ln-in text-[#7A421D]">
                {hero.titleLine2}
              </span>
            </h1>

            <p className="text-[#63554B] text-base sm:text-lg max-w-xl font-sans leading-relaxed">
              {hero.subtitle}
            </p>

            {/* Dual Actions with App Store CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="emerald"
                size="lg"
                onClick={onOpenAppStore}
                className="group flex items-center gap-2"
              >
                <span>{hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onDownloadTemplate}
                className="text-[#1C130D]"
              >
                <Download className="w-4 h-4 mr-2 text-[#7A421D]" />
                <span>{hero.secondaryCta}</span>
              </Button>
            </div>

            {/* Engineering Specifications Plate */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-[#1C130D]/15 font-mono">
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
            </div>
          </div>

          {/* Right Column: 3D Architectural Building & Subsurface Monolith Stage Dock */}
          <div className="lg:col-span-5 relative">
            <Section3DAnchorDock
              stage="hero"
              tone="light"
              title="3D Building & Subsurface Monolith"
              subtitle="0.0m surface to -25.0m bearing horizon"
              renderMobileCanvas={true}
            />

            {/* Floating Compliance Tag */}
            <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-4 sm:-left-4 flex items-center gap-2 bg-[#FBF7F2] border border-[#1C130D]/20 p-3 shadow-lg font-mono text-xs z-30">
              <CheckCircle className="w-4 h-4 text-[#7A421D]" />
              <span className="font-bold text-[#1C130D]">
                ASTM D5778 &amp; SNI 8460:2017 compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

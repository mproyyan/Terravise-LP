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
      className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden bg-[#FBF7F2] border-b border-[#1C130D]/15"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Main 6:6 Split: Left Monumental Copy | Right Open Borderless 3D Monolith Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left 6 Columns: Headline, Value Proposition & Dual CTAs */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex flex-wrap items-center gap-2">
              <Badge variant="emerald" className="font-mono text-[10px] py-1 px-2.5">
                <span className="w-1.5 h-1.5 rounded-none bg-[#5A3008] inline-block mr-1.5" />
                {hero.badge}
              </Badge>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A421D] bg-[#E3D7C8]/50 px-2.5 py-1 border border-[#1C130D]/10 flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                Scroll to transform 3D strata
              </span>
            </div>

            {/* Monumental Typography with Rapidkert-style asymmetrical indentation */}
            <h1 className="font-sans font-black text-4xl sm:text-6xl xl:text-[68px] uppercase tracking-[-0.04em] leading-[0.88] text-[#1C130D]">
              <span className="block">{hero.titleLine1}</span>
              <span className="block ln-in text-[#7A421D]">{hero.titleLine2}</span>
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
          </div>

          {/* Right 6 Columns: Open Borderless 3D Architectural Building & Subsurface Monolith */}
          <div className="lg:col-span-6 relative">
            <Section3DAnchorDock
              stage="hero"
              tone="light"
              title="00 / Architectural Tower & 25m Soil Monolith"
              subtitle="Intact 4-Horizon Profile"
              renderMobileCanvas={true}
              heightClass="h-[500px] xl:h-[560px]"
            />
          </div>
        </div>

        {/* Full-Width 12-Column Bottom Engineering Specifications Strip */}
        <div className="mt-12 pt-8 border-t border-[#1C130D]/15 grid grid-cols-2 sm:grid-cols-5 gap-6 items-center font-mono">
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
              <span className="font-bold text-[#1C130D]">ASTM D5778 &amp; SNI 8460</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

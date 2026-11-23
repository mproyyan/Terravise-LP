import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { ArrowRight, Download, Cpu, CheckCircle } from "lucide-react"

interface HeroSectionProps {
  onOpenAppStore: () => void
  onDownloadTemplate: () => void
}

export function HeroSection({ onOpenAppStore, onDownloadTemplate }: HeroSectionProps) {
  const { hero } = SITE_CONTENT

  return (
    <section
      id="hero"
      className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden bg-[#FBF7F2] border-b border-[#1C130D]/15"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Monumental Architectural Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2">
              <Badge variant="emerald" className="font-mono text-[10px] py-1 px-2.5">
                <span className="w-1.5 h-1.5 rounded-none bg-[#5A3008] inline-block mr-1.5" />
                {hero.badge}
              </Badge>
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

          {/* Right Column: iPad Chassis running CPT telemetry in field */}
          <div className="lg:col-span-5 relative">
            <div className="w-full max-w-md mx-auto bg-[#1C130D] p-3 shadow-2xl border border-[#1C130D]/60">
              {/* Screen Bezel */}
              <div className="bg-[#120B07] overflow-hidden border border-[#36271D] text-[#EFE7DE] flex flex-col h-[500px]">
                {/* iPad Status Bar */}
                <div className="px-4 py-2 border-b border-[#36271D] flex items-center justify-between text-[10px] font-mono text-stone-400 select-none bg-black/40">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#EFE7DE]">TERRAVISE IPADOS</span>
                    <span>•</span>
                    <span className="text-[#FAD9BA] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-none bg-[#FAD9BA] animate-pulse" />
                      20 mm/s penetration
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>M4 82 FPS</span>
                    <Cpu className="w-3 h-3 text-stone-500" />
                  </div>
                </div>

                {/* Main Telemetry Screen Body */}
                <div className="p-4 flex-1 flex flex-col justify-between font-mono">
                  {/* Top Header Card */}
                  <div className="bg-[#271C14] border border-[#36271D] p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-stone-400">
                        Active sounding
                      </div>
                      <div className="text-xs font-bold text-[#EFE7DE]">
                        CPT B-02. In progress
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-wider text-stone-400">
                        Current depth
                      </div>
                      <div className="text-sm font-bold text-[#FAD9BA] tabular-nums">
                        -14.8 m
                      </div>
                    </div>
                  </div>

                  {/* Real Geotechnical CPT Profile Curve */}
                  <div className="relative my-3 flex-1 bg-[#170E08] border border-[#36271D] p-2 overflow-hidden flex">
                    {/* Depth scale axis */}
                    <div className="w-8 flex flex-col justify-between text-[9px] text-stone-400 border-r border-[#36271D] pr-1 tabular-nums">
                      <span>0.0m</span>
                      <span>-5.0m</span>
                      <span>-10.0m</span>
                      <span>-15.0m</span>
                      <span className="text-[#FAD9BA] font-bold">-20.0m</span>
                    </div>

                    {/* Curves Area */}
                    <div className="flex-1 relative ml-2">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none">
                        <div className="border-b border-stone-700 w-full" />
                        <div className="border-b border-stone-700 w-full" />
                        <div className="border-b border-stone-700 w-full" />
                        <div className="border-b border-stone-700 w-full" />
                      </div>

                      {/* Stratum zone bands */}
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 200 160"
                        preserveAspectRatio="none"
                      >
                        {/* Soft clay zone */}
                        <rect
                          x="0"
                          y="50"
                          width="200"
                          height="45"
                          fill="#A0522D"
                          fillOpacity="0.25"
                        />
                        {/* Target bearing zone */}
                        <rect
                          x="0"
                          y="95"
                          width="200"
                          height="65"
                          fill="#E76F51"
                          fillOpacity="0.3"
                        />

                        {/* Cone Resistance line (qc in MPa) */}
                        <path
                          d="M 40,0 L 45,15 L 30,30 L 40,50 L 15,65 L 12,85 L 30,95 L 140,110 L 165,130 L 175,160"
                          fill="none"
                          stroke="#FAD9BA"
                          strokeWidth="2.5"
                        />

                        {/* Current probe tip coordinate */}
                        <circle cx="165" cy="130" r="3.5" fill="#EFE7DE" />
                      </svg>

                      <div className="absolute right-2 bottom-3 bg-[#271C14] border border-[#FAD9BA]/40 px-2 py-1 text-[9px] text-[#EFE7DE] font-bold">
                        qc = 17.8 MPa. Bearing met
                      </div>
                    </div>
                  </div>

                  {/* Bottom Operational Readout */}
                  <div className="space-y-1.5 border-t border-[#36271D] pt-2 text-[10px]">
                    <div className="flex items-center justify-between text-stone-400">
                      <span>Robertson SBT class:</span>
                      <span className="font-bold text-[#EFE7DE]">Zone 8. Dense sand</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-400">
                      <span>DQN active policy:</span>
                      <span className="font-bold text-[#FAD9BA]">29 features evaluated</span>
                    </div>
                  </div>
                </div>

                {/* iPad Bottom Edge */}
                <div className="py-2 px-4 bg-black border-t border-[#36271D] flex items-center justify-center">
                  <div className="w-20 h-1 bg-stone-700 rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating Tag */}
            <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 bg-[#FBF7F2] border border-[#1C130D]/20 p-3 shadow-lg font-mono text-xs">
              <CheckCircle className="w-4 h-4 text-[#7A421D]" />
              <span className="font-bold text-[#1C130D]">ASTM D5778 compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

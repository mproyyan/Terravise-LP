import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { ArrowRight, Download, Cpu, CheckCircle } from "lucide-react"

interface HeroSectionProps {
  onRequestPilot: () => void
  onDownloadTemplate: () => void
}

export function HeroSection({ onRequestPilot, onDownloadTemplate }: HeroSectionProps) {
  const { hero } = SITE_CONTENT

  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#F8F7F4] border-b border-stone-200"
    >
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Architectural Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge variant="emerald" className="font-mono text-[11px] py-1 px-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {hero.badge}
              </Badge>
            </div>

            <h1 className="font-sans font-black tracking-tighter text-stone-950 text-4xl sm:text-5xl lg:text-6xl uppercase leading-[0.92]">
              <span className="block">{hero.titleLine1}</span>
              <span className="block text-[#1C3127] underline decoration-amber-500 decoration-wavy decoration-2">
                {hero.titleLine2}
              </span>
            </h1>

            <p className="text-stone-700 text-base sm:text-lg max-w-xl font-sans leading-relaxed">
              {hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={onRequestPilot}
                className="group"
              >
                <span>{hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={onDownloadTemplate}
                className="text-stone-800"
              >
                <Download className="w-4 h-4 mr-2 text-stone-600" />
                <span>{hero.secondaryCta}</span>
              </Button>
            </div>

            {/* Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-stone-300/80 font-mono">
              {hero.specPoints.map((spec) => (
                <div key={spec.label} className="space-y-1">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                    {spec.label}
                  </span>
                  <span className="text-stone-900 font-bold text-sm sm:text-base tabular-nums">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: iPad Device Mockup Running Terravise in Field */}
          <div className="lg:col-span-5 relative">
            {/* iPad Chassis Frame */}
            <div className="w-full max-w-md mx-auto bg-stone-900 rounded-[28px] p-3 shadow-2xl border-4 border-stone-800 ring-1 ring-black/40">
              {/* Screen Bezel */}
              <div className="bg-[#121514] rounded-[20px] overflow-hidden border border-stone-800 text-stone-100 flex flex-col h-[480px]">
                {/* iPad Status Bar */}
                <div className="px-4 py-2 border-b border-stone-800 flex items-center justify-between text-[10px] font-mono text-stone-400 select-none bg-stone-950/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-200">TERRAVISE OS</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      CPT Probe Live
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>M4 Neural 82 FPS</span>
                    <Cpu className="w-3 h-3 text-stone-400" />
                  </div>
                </div>

                {/* Main Telemetry Screen Body */}
                <div className="p-4 flex-1 flex flex-col justify-between font-mono">
                  {/* Top Header Card */}
                  <div className="bg-stone-900/90 border border-stone-700/80 p-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-stone-400">
                        Current Sounding
                      </div>
                      <div className="text-xs font-bold text-stone-100">
                        CPT B-02 (Penetration in Progress)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-wider text-stone-400">
                        Current Depth
                      </div>
                      <div className="text-sm font-bold text-amber-400 tabular-nums">
                        -14.8 m
                      </div>
                    </div>
                  </div>

                  {/* Simulated CPT Graph (qc curve vs depth) */}
                  <div className="relative my-3 flex-1 bg-stone-950/80 border border-stone-800 p-2 overflow-hidden flex">
                    {/* Depth scale axis */}
                    <div className="w-8 flex flex-col justify-between text-[9px] text-stone-500 border-r border-stone-800 pr-1">
                      <span>0m</span>
                      <span>-5m</span>
                      <span>-10m</span>
                      <span>-15m</span>
                      <span className="text-amber-500">-20m</span>
                    </div>

                    {/* Curves Area */}
                    <div className="flex-1 relative ml-2">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none">
                        <div className="border-b border-stone-600 w-full" />
                        <div className="border-b border-stone-600 w-full" />
                        <div className="border-b border-stone-600 w-full" />
                        <div className="border-b border-stone-600 w-full" />
                      </div>

                      {/* SVG CPT Cone Resistance curve */}
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 200 160"
                        preserveAspectRatio="none"
                      >
                        {/* Soft clay zone highlight */}
                        <rect
                          x="0"
                          y="50"
                          width="200"
                          height="45"
                          fill="#A0522D"
                          fillOpacity="0.2"
                        />
                        {/* Target bearing zone highlight */}
                        <rect
                          x="0"
                          y="95"
                          width="200"
                          height="65"
                          fill="#E76F51"
                          fillOpacity="0.25"
                        />

                        {/* Cone Resistance line (qc) */}
                        <path
                          d="M 40,0 L 45,15 L 30,30 L 40,50 L 15,65 L 12,85 L 30,95 L 140,110 L 165,130 L 175,160"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2.5"
                        />

                        {/* Current probe tip point */}
                        <circle cx="165" cy="130" r="4" fill="#F59E0B" className="animate-ping" />
                        <circle cx="165" cy="130" r="3" fill="#F59E0B" />
                      </svg>

                      {/* Stratum Tag in graph */}
                      <div className="absolute right-2 bottom-3 bg-emerald-950/90 border border-emerald-500 px-1.5 py-0.5 text-[9px] text-emerald-300 font-bold">
                        qc = 17.8 MPa (Bearing Met)
                      </div>
                    </div>
                  </div>

                  {/* Bottom Operational Readout */}
                  <div className="space-y-1.5 border-t border-stone-800 pt-2 text-[10px]">
                    <div className="flex items-center justify-between text-stone-400">
                      <span>Robertson SBT Class:</span>
                      <span className="font-bold text-stone-200">Zone 8: Dense Sand</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-400">
                      <span>Ground Certainty:</span>
                      <span className="font-bold text-emerald-400">84.2% [STOP READY]</span>
                    </div>
                  </div>
                </div>

                {/* iPad Bottom Bar */}
                <div className="py-2 px-4 bg-stone-950 border-t border-stone-800 flex items-center justify-center">
                  <div className="w-24 h-1 bg-stone-600 rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating Tag */}
            <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 bg-white border border-stone-300 p-2.5 shadow-lg font-mono text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-stone-900">Direct Rig Datalogger Streaming</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

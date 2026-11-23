import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { CheckCircle2, TrendingDown, DollarSign, ShieldAlert } from "lucide-react"

export function DynamicStopSection() {
  const { dynamicStop } = SITE_CONTENT

  return (
    <section
      id="stop"
      className="py-24 bg-[#f4f2ec] border-b border-[#171814]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="03"
          title="Stopping criteria"
          metaRight="Ground certainty metric"
          tone="light"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#171814] uppercase tracking-[-0.035em] leading-[0.92]">
            {dynamicStop.heading}
          </h2>
          <p className="font-sans text-[#5c5f55] text-base sm:text-lg leading-relaxed">
            {dynamicStop.subheading}
          </p>
        </div>

        {/* The Practical STOP Banner */}
        <div className="bg-[#171814] text-[#e8e5da] p-6 sm:p-10 border border-[#171814] mb-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Gauge Metric Display */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6 border-b lg:border-b-0 lg:border-r border-[#e8e5da]/15 pb-6 lg:pb-0 lg:pr-8">
              {/* Circular Gauge Graphic */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#2a2d25"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#7c8c6c"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * dynamicStop.certaintyValue) / 100}
                    strokeLinecap="square"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
                  <span className="text-2xl font-bold text-[#e8e5da] tabular-nums">
                    {dynamicStop.certaintyValue}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#7c8c6c]">
                    Certainty
                  </span>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="space-y-1 text-center sm:text-left font-mono">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant="emerald" className="bg-[#1f211b] text-[#7c8c6c] border-[#7c8c6c]/40 text-[10px]">
                    Target: {dynamicStop.threshold}% met
                  </Badge>
                </div>
                <div className="text-xs text-[#e8e5da]/80 pt-1">
                  Model entropy delta: &lt; 0.04
                </div>
                <div className="text-[11px] text-[#e8e5da]/60">
                  Building footprint: 100% covered
                </div>
              </div>
            </div>

            {/* Right: The Practical STOP Verdict */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 text-[#7c8c6c] font-mono text-xs uppercase tracking-wider font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#7c8c6c]" />
                <span>Statutory recommendation</span>
              </div>
              <h3 className="font-sans font-black text-2xl sm:text-3xl text-[#e8e5da] tracking-tight uppercase leading-snug">
                {dynamicStop.statusText}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#e8e5da]/70 leading-relaxed">
                {dynamicStop.explanation}
              </p>
            </div>
          </div>
        </div>

        {/* Economic & Rig Mobilization Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f8f7f4] border border-[#171814]/15 p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#171814]/10 pb-2">
              <span className="text-[#5c5f55] uppercase tracking-wider">Rig savings</span>
              <DollarSign className="w-4 h-4 text-[#627056]" />
            </div>
            <div className="font-sans font-black text-2xl text-[#171814]">
              $16,800 saved
            </div>
            <p className="font-sans text-xs text-[#5c5f55] leading-relaxed">
              Four redundant uniform soundings eliminated without loss of bearing layer certainty.
            </p>
          </div>

          <div className="bg-[#f8f7f4] border border-[#171814]/15 p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#171814]/10 pb-2">
              <span className="text-[#5c5f55] uppercase tracking-wider">Schedule reduction</span>
              <TrendingDown className="w-4 h-4 text-[#627056]" />
            </div>
            <div className="font-sans font-black text-2xl text-[#171814]">
              6 days saved
            </div>
            <p className="font-sans text-xs text-[#5c5f55] leading-relaxed">
              Eliminate arbitrary contract grid waiting periods and release rigs to subsequent projects.
            </p>
          </div>

          <div className="bg-[#f8f7f4] border border-[#171814]/15 p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#171814]/10 pb-2">
              <span className="text-[#5c5f55] uppercase tracking-wider">Audit records</span>
              <ShieldAlert className="w-4 h-4 text-[#627056]" />
            </div>
            <div className="font-sans font-black text-2xl text-[#171814]">
              100% defensible
            </div>
            <p className="font-sans text-xs text-[#5c5f55] leading-relaxed">
              Mathematical proof of site understanding ready for building permits and structural handoff.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

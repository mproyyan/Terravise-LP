import React from "react"
import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { CheckCircle2, TrendingDown, DollarSign, ShieldAlert } from "lucide-react"

export function DynamicStopSection() {
  const { dynamicStop } = SITE_CONTENT

  return (
    <section
      id="stop"
      className="py-24 bg-[#F8F7F4] border-b border-stone-200 scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Plate Header */}
        <PlateHeader
          number="03"
          title="Stopping Criteria"
          metaRight="Ground Certainty Metric"
          tone="light"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-stone-950 uppercase tracking-tight">
            {dynamicStop.heading}
          </h2>
          <p className="font-sans text-stone-700 text-base sm:text-lg leading-relaxed">
            {dynamicStop.subheading}
          </p>
        </div>

        {/* The Practical STOP Banner */}
        <div className="bg-emerald-900 text-white p-6 sm:p-10 border border-emerald-800 mb-12 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Gauge Metric Display */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6 border-b lg:border-b-0 lg:border-r border-emerald-800/80 pb-6 lg:pb-0 lg:pr-8">
              {/* Circular Gauge Graphic */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#064E3B"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * dynamicStop.certaintyValue) / 100}
                    strokeLinecap="square"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
                  <span className="text-2xl font-black text-white tabular-nums">
                    {dynamicStop.certaintyValue}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-300">
                    Certainty
                  </span>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="space-y-1 text-center sm:text-left font-mono">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant="emerald" className="bg-emerald-800 text-emerald-200 border-emerald-600 text-[10px]">
                    Target: {dynamicStop.threshold}% Met
                  </Badge>
                </div>
                <div className="text-xs text-emerald-200 pt-1">
                  Spatial Entropy Delta: &lt; 0.04
                </div>
                <div className="text-[11px] text-emerald-300">
                  Coverage: 100% Core Footprint
                </div>
              </div>
            </div>

            {/* Right: The Practical STOP Verdict */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 text-emerald-300 font-mono text-xs uppercase tracking-wider font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Statutory Recommendation</span>
              </div>
              <h3 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-snug">
                {dynamicStop.statusText}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {dynamicStop.explanation}
              </p>
            </div>
          </div>
        </div>

        {/* Economic & Rig Mobilization Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-stone-300 p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono border-b border-stone-200 pb-2">
              <span className="text-stone-500 uppercase tracking-wider">Rig Savings</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-sans font-black text-2xl text-stone-900">
              $16,800 Saved
            </div>
            <p className="font-sans text-xs text-stone-600 leading-relaxed">
              4 unnecessary uniform soundings eliminated without compromising bearing layer certainty.
            </p>
          </div>

          <div className="bg-white border border-stone-300 p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono border-b border-stone-200 pb-2">
              <span className="text-stone-500 uppercase tracking-wider">Schedule Compression</span>
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-sans font-black text-2xl text-stone-900">
              -6 Days Standby
            </div>
            <p className="font-sans text-xs text-stone-600 leading-relaxed">
              Eliminate arbitrary contract grid waiting times and release rig crews to the next project.
            </p>
          </div>

          <div className="bg-white border border-stone-300 p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono border-b border-stone-200 pb-2">
              <span className="text-stone-500 uppercase tracking-wider">Audit Trail</span>
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-sans font-black text-2xl text-stone-900">
              100% Defensible
            </div>
            <p className="font-sans text-xs text-stone-600 leading-relaxed">
              Mathematical proof of ground sufficiency ready for statutory building permits and insurers.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

import React, { useState } from "react"
import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_RECOMMENDED_POINT } from "../../data/mockGeology"
import { Crosshair, MapPin, Layers, AlertCircle, Compass, Zap } from "lucide-react"

export function DQNRecommendationSection() {
  const { dqn } = SITE_CONTENT
  const [activeTab, setActiveTab] = useState("gap")

  return (
    <section
      id="dqn"
      className="py-24 bg-[#121514] text-[#E8E5DA] border-b border-stone-800 scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Plate Header */}
        <PlateHeader
          number="02"
          title="AI Next-Point Policy"
          metaRight="SchemaGAN V4.2 & DQN Agent"
          tone="dark"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-stone-100 uppercase tracking-tight">
            {dqn.heading}
          </h2>
          <p className="font-sans text-stone-400 text-base sm:text-lg leading-relaxed">
            {dqn.subheading}
          </p>
        </div>

        {/* Interactive DQN Sandbox Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Satellite Boundary Map with Glowing Target Crosshair */}
          <div className="lg:col-span-7 bg-[#171A19] border border-stone-800 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-stone-200">
                  Exploration Footprint Map
                </span>
              </div>
              <span className="text-[10px] text-stone-500">
                WGS84 UTM 48S
              </span>
            </div>

            {/* Virtual Site Grid Viewport */}
            <div className="relative w-full h-[340px] bg-stone-950 border border-stone-800/80 overflow-hidden flex items-center justify-center p-6">
              {/* Coordinate Grid Lines */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Site Boundary Polygon */}
              <div className="absolute inset-8 border border-dashed border-stone-700 pointer-events-none">
                <span className="absolute top-2 left-2 font-mono text-[9px] text-stone-500 uppercase tracking-widest">
                  Structural Core Footprint (120m × 80m)
                </span>
              </div>

              {/* Existing Drilled Soundings */}
              {/* Point B-01 */}
              <div
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{ top: "30%", left: "28%" }}
              >
                <div className="w-3.5 h-3.5 bg-stone-700 border border-stone-400 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                  1
                </div>
                <span className="font-mono text-[9px] text-stone-400 mt-1 bg-stone-900/90 px-1 border border-stone-800">
                  CPT B-01 (19.5m)
                </span>
              </div>

              {/* Point B-02 */}
              <div
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{ bottom: "25%", left: "65%" }}
              >
                <div className="w-3.5 h-3.5 bg-stone-700 border border-stone-400 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                  2
                </div>
                <span className="font-mono text-[9px] text-stone-400 mt-1 bg-stone-900/90 px-1 border border-stone-800">
                  CPT B-02 (21.0m)
                </span>
              </div>

              {/* Point B-03 */}
              <div
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{ top: "25%", right: "20%" }}
              >
                <div className="w-3.5 h-3.5 bg-stone-700 border border-stone-400 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                  3
                </div>
                <span className="font-mono text-[9px] text-stone-400 mt-1 bg-stone-900/90 px-1 border border-stone-800">
                  CPT B-03 (18.8m)
                </span>
              </div>

              {/* ACTIVE RECOMMENDATION: SPOT 2 CROSSHAIR */}
              <div
                className="absolute flex flex-col items-center z-20"
                style={{ top: "52%", left: "44%" }}
              >
                {/* Radar Ripple Animation */}
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 animate-ping absolute" />
                  <div className="w-6 h-6 rounded-full bg-emerald-500/40 flex items-center justify-center border border-emerald-400">
                    <Crosshair className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                </div>

                <div className="mt-2 bg-emerald-950/95 border border-emerald-500 px-2 py-1 shadow-lg text-center whitespace-nowrap">
                  <div className="font-mono text-[10px] font-black text-emerald-300 flex items-center gap-1 justify-center">
                    <Zap className="w-3 h-3 text-amber-400" />
                    TARGET: SPOT 2
                  </div>
                  <div className="font-mono text-[8px] text-emerald-400">
                    Confidence: 84% • High Info Gain
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Coordinate Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-stone-400 pt-1">
              <div>
                Target UTM: <strong className="text-stone-200">{MOCK_RECOMMENDED_POINT.utm}</strong>
              </div>
              <div className="text-emerald-400">
                Action: Mobilize CPT Rig 01
              </div>
            </div>
          </div>

          {/* Right Column: "Why This Point?" Interactive Sheet Card */}
          <div className="lg:col-span-5 bg-[#171A19] border border-stone-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase text-emerald-400 tracking-wider block">
                    Reinforcement Learning Rationale
                  </span>
                  <h3 className="font-sans font-black text-lg text-stone-100 tracking-tight">
                    Why This Point? (Spot 2)
                  </h3>
                </div>
                <Badge variant="emerald" className="font-mono text-[10px]">
                  DQN Policy #1
                </Badge>
              </div>

              {/* Radix Tabs Component */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 border-b border-stone-800">
                  <TabsTrigger
                    value="gap"
                    className="text-stone-400 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-400 text-[10px]"
                  >
                    1. Data Gap
                  </TabsTrigger>
                  <TabsTrigger
                    value="transition"
                    className="text-stone-400 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-400 text-[10px]"
                  >
                    2. Strata Shift
                  </TabsTrigger>
                  <TabsTrigger
                    value="anomaly"
                    className="text-stone-400 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-400 text-[10px]"
                  >
                    3. Lateral Anomaly
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="gap" className="mt-4 space-y-3 font-mono">
                  <div className="p-3 bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Nearest Sounding:</span>
                      <span className="font-bold text-amber-400">16.2 meters</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Soundings within 4.0m:</span>
                      <span className="font-bold text-rose-400">0 (Blind Void)</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-stone-300 leading-relaxed">
                    {MOCK_RECOMMENDED_POINT.reasoning.gap.description}
                  </p>
                </TabsContent>

                <TabsContent value="transition" className="mt-4 space-y-3 font-mono">
                  <div className="p-3 bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Top Stratum:</span>
                      <span className="font-bold text-amber-300">Clean Sand</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Predicted Underlayer:</span>
                      <span className="font-bold text-rose-400">Soft Clay (-8.5m)</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-stone-300 leading-relaxed">
                    {MOCK_RECOMMENDED_POINT.reasoning.transition.description}
                  </p>
                </TabsContent>

                <TabsContent value="anomaly" className="mt-4 space-y-3 font-mono">
                  <div className="p-3 bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Index Variance:</span>
                      <span className="font-bold text-emerald-400">ΔIc = 0.18</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Cluster Divergence:</span>
                      <span className="font-bold text-stone-200">High Discontinuity</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-stone-300 leading-relaxed">
                    {MOCK_RECOMMENDED_POINT.reasoning.anomaly.description}
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
              <span className="text-stone-400">Expected Information Gain:</span>
              <span className="font-bold text-emerald-400">+14.2% Spatial Certainty</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

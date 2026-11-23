import { useState } from "react"
import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_RECOMMENDED_POINT } from "../../data/mockGeology"
import { Crosshair, Compass, Navigation } from "lucide-react"

export function DQNRecommendationSection() {
  const { dqn } = SITE_CONTENT
  const [activeTab, setActiveTab] = useState("gap")

  return (
    <section
      id="dqn"
      className="py-24 bg-[#171814] text-[#e8e5da] border-b border-[#e8e5da]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="02"
          title="Next sounding selection"
          metaRight="SchemaGAN V4.2 and DQN agent"
          tone="dark"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#e8e5da] uppercase tracking-[-0.035em] leading-[0.92]">
            {dqn.heading}
          </h2>
          <p className="font-sans text-[#e8e5da]/70 text-base sm:text-lg leading-relaxed">
            {dqn.subheading}
          </p>
        </div>

        {/* Interactive DQN Sandbox Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Satellite Boundary Map with Glowing Target Crosshair */}
          <div className="lg:col-span-7 bg-[#1f211b] border border-[#e8e5da]/15 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#e8e5da]/15 pb-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#7c8c6c]" />
                <span className="font-bold text-[#e8e5da]">
                  Exploration footprint
                </span>
              </div>
              <span className="text-[10px] text-[#e8e5da]/50 uppercase tracking-wider">
                WGS84 UTM 48S
              </span>
            </div>

            {/* Virtual Site Grid Viewport */}
            <div className="relative w-full h-[360px] bg-[#12130f] border border-[#e8e5da]/15 overflow-hidden flex items-center justify-center p-6">
              {/* Coordinate Grid Lines */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #666 1px, transparent 1px), linear-gradient(to bottom, #666 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Site Boundary Polygon */}
              <div className="absolute inset-8 border border-dashed border-[#e8e5da]/25 pointer-events-none">
                <span className="absolute top-2 left-2 font-mono text-[9px] text-[#e8e5da]/40 uppercase tracking-widest">
                  Building footprint. 120m by 80m
                </span>
              </div>

              {/* Point B-01 */}
              <div
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{ top: "30%", left: "28%" }}
              >
                <div className="w-4 h-4 bg-[#2a2d25] border border-[#e8e5da]/40 flex items-center justify-center text-[9px] font-bold text-[#e8e5da]">
                  1
                </div>
                <span className="font-mono text-[9px] text-[#e8e5da]/60 mt-1 bg-[#171814] px-1 border border-[#e8e5da]/15">
                  B-01 (19.5m)
                </span>
              </div>

              {/* Point B-02 */}
              <div
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{ bottom: "25%", left: "65%" }}
              >
                <div className="w-4 h-4 bg-[#2a2d25] border border-[#e8e5da]/40 flex items-center justify-center text-[9px] font-bold text-[#e8e5da]">
                  2
                </div>
                <span className="font-mono text-[9px] text-[#e8e5da]/60 mt-1 bg-[#171814] px-1 border border-[#e8e5da]/15">
                  B-02 (21.0m)
                </span>
              </div>

              {/* Point B-03 */}
              <div
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{ top: "25%", right: "20%" }}
              >
                <div className="w-4 h-4 bg-[#2a2d25] border border-[#e8e5da]/40 flex items-center justify-center text-[9px] font-bold text-[#e8e5da]">
                  3
                </div>
                <span className="font-mono text-[9px] text-[#e8e5da]/60 mt-1 bg-[#171814] px-1 border border-[#e8e5da]/15">
                  B-03 (18.8m)
                </span>
              </div>

              {/* ACTIVE RECOMMENDATION: SPOT 2 CROSSHAIR */}
              <div
                className="absolute flex flex-col items-center z-20"
                style={{ top: "52%", left: "44%" }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#10b981]/20 animate-ping absolute" />
                  <div className="w-7 h-7 bg-[#1f211b] flex items-center justify-center border border-[#7c8c6c]">
                    <Crosshair className="w-4 h-4 text-[#7c8c6c]" />
                  </div>
                </div>

                <div className="mt-2 bg-[#171814] border border-[#7c8c6c] px-2 py-1 shadow-lg text-center whitespace-nowrap font-mono">
                  <div className="text-[10px] font-bold text-[#e8e5da] flex items-center gap-1 justify-center">
                    <Navigation className="w-3 h-3 text-[#b78c75]" />
                    TARGET: SPOT 2
                  </div>
                  <div className="text-[8px] text-[#7c8c6c]">
                    Confidence: 84%. Max information gain
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Coordinate Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#e8e5da]/60 pt-1">
              <div>
                Target coordinate: <strong className="text-[#e8e5da]">{MOCK_RECOMMENDED_POINT.utm}</strong>
              </div>
              <div className="text-[#7c8c6c]">
                Action: Mobilize CPT rig 01
              </div>
            </div>
          </div>

          {/* Right Column: "Why this point?" Sheet Card */}
          <div className="lg:col-span-5 bg-[#1f211b] border border-[#e8e5da]/15 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#e8e5da]/15 pb-3 mb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#b78c75] tracking-wider block">
                    Reinforcement learning rationale
                  </span>
                  <h3 className="font-sans font-bold text-lg text-[#e8e5da] tracking-tight">
                    Why this point? (Spot 2)
                  </h3>
                </div>
                <Badge variant="emerald" className="font-mono text-[10px]">
                  DQN priority 1
                </Badge>
              </div>

              {/* Tabs Component */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 border-b border-[#e8e5da]/15">
                  <TabsTrigger
                    value="gap"
                    className="text-[#e8e5da]/50 data-[state=active]:text-[#e8e5da] data-[state=active]:border-[#b78c75] text-[10px]"
                  >
                    1. Data gap
                  </TabsTrigger>
                  <TabsTrigger
                    value="transition"
                    className="text-[#e8e5da]/50 data-[state=active]:text-[#e8e5da] data-[state=active]:border-[#b78c75] text-[10px]"
                  >
                    2. Strata shift
                  </TabsTrigger>
                  <TabsTrigger
                    value="anomaly"
                    className="text-[#e8e5da]/50 data-[state=active]:text-[#e8e5da] data-[state=active]:border-[#b78c75] text-[10px]"
                  >
                    3. Soil anomaly
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="gap" className="mt-4 space-y-3 font-mono">
                  <div className="p-3 bg-[#171814] border border-[#e8e5da]/15 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#e8e5da]/60">Nearest sounding:</span>
                      <span className="font-bold text-[#b78c75]">16.2 meters</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#e8e5da]/60">Soundings within 4.0m:</span>
                      <span className="font-bold text-[#dedacd]">0 (Uncertainty zone)</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[#e8e5da]/80 leading-relaxed">
                    {MOCK_RECOMMENDED_POINT.reasoning.gap.description}
                  </p>
                </TabsContent>

                <TabsContent value="transition" className="mt-4 space-y-3 font-mono">
                  <div className="p-3 bg-[#171814] border border-[#e8e5da]/15 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#e8e5da]/60">Top stratum:</span>
                      <span className="font-bold text-[#d4a373]">Clean sand</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#e8e5da]/60">Predicted underlayer:</span>
                      <span className="font-bold text-[#a0522d]">Soft clay (-8.5m)</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[#e8e5da]/80 leading-relaxed">
                    {MOCK_RECOMMENDED_POINT.reasoning.transition.description}
                  </p>
                </TabsContent>

                <TabsContent value="anomaly" className="mt-4 space-y-3 font-mono">
                  <div className="p-3 bg-[#171814] border border-[#e8e5da]/15 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#e8e5da]/60">Index offset:</span>
                      <span className="font-bold text-[#7c8c6c]">delta Ic = 0.18</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#e8e5da]/60">Cluster behavior:</span>
                      <span className="font-bold text-[#e8e5da]">Localized shear shift</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[#e8e5da]/80 leading-relaxed">
                    {MOCK_RECOMMENDED_POINT.reasoning.anomaly.description}
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e8e5da]/15 flex items-center justify-between text-xs font-mono">
              <span className="text-[#e8e5da]/50">Expected certainty gain:</span>
              <span className="font-bold text-[#7c8c6c]">+14.2%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

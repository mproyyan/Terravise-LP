import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_RECOMMENDED_POINT } from "../../data/mockGeology"
import { Section3DAnchorDock } from "../three/Section3DAnchorDock"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { Crosshair, Compass, Navigation } from "lucide-react"

export function DQNRecommendationSection() {
  const { dqn } = SITE_CONTENT
  const { activeDqnTab, setActiveDqnTab } = useSubsurface3D()

  return (
    <section
      id="dqn"
      className="py-24 bg-[#1C130D] text-[#EFE7DE] border-b border-[#EFE7DE]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="02"
          title="Next sounding selection"
          metaRight="3D 144-node geodetic radar & Spot 2 vector"
          tone="dark"
        />

        {/* 12-Column Editorial Split Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-7">
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92]">
              {dqn.heading}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-sans text-[#EFE7DE]/70 text-sm sm:text-base leading-relaxed">
              {dqn.subheading}
            </p>
          </div>
        </div>

        {/* Interactive DQN 6:6 Split: Left 3D Topographic Radar Grid | Right Rationale Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 6 Columns: Open Borderless 3D 144-Node Geodetic Candidate Radar */}
          <div className="lg:col-span-6 order-2 lg:order-1 space-y-3">
            <Section3DAnchorDock
              stage="dqn"
              tone="dark"
              title="02 / 144-Node Geodetic Candidate Matrix"
              subtitle="Spot 2 Emerald Laser Vector Lock"
              renderMobileCanvas={false}
              heightClass="h-[460px] xl:h-[520px]"
            />

            {/* Minimalist Radar Legend Strip */}
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] pt-2 border-t border-[#EFE7DE]/15">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#10B981] shrink-0" />
                <span className="text-[#EFE7DE] truncate">Spot 2 Laser Peak</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#FAD9BA] shrink-0" />
                <span className="text-[#EFE7DE]/70 truncate">High Info-Gain Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#7A421D] shrink-0" />
                <span className="text-[#EFE7DE]/50 truncate">144 Evaluated Nodes</span>
              </div>
            </div>
          </div>

          {/* Right 6 Columns: Target Coordinate Readout + Interactive 3-Tab Rationale Card */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            {/* Target Coordinate Summary Banner */}
            <div className="bg-[#271C14] border border-[#EFE7DE]/15 p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#150E09] border border-[#10B981] flex items-center justify-center">
                  <Crosshair className="w-4 h-4 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-[10px] text-[#FAD9BA] uppercase tracking-wider flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    Active 3D radar target lock
                  </div>
                  <div className="font-bold text-[#EFE7DE]">
                    {MOCK_RECOMMENDED_POINT.name} · {MOCK_RECOMMENDED_POINT.utm}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#10B981] bg-[#150E09] px-2.5 py-1 border border-[#10B981]/30">
                <Compass className="w-3.5 h-3.5" />
                <span>Confidence: {MOCK_RECOMMENDED_POINT.confidence}%</span>
              </div>
            </div>

            {/* "Why this point?" Sheet Card (Switching tabs transforms the 3D Radar Overlay) */}
            <div className="bg-[#271C14] border border-[#EFE7DE]/15 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-3 mb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#BD8564] tracking-wider block">
                      Reinforcement learning rationale (Updates 3D radar)
                    </span>
                    <h3 className="font-sans font-bold text-lg text-[#EFE7DE] tracking-tight">
                      Why this point? (Spot 2)
                    </h3>
                  </div>
                  <Badge variant="emerald" className="font-mono text-[10px]">
                    DQN priority 1
                  </Badge>
                </div>

                <Tabs value={activeDqnTab} onValueChange={setActiveDqnTab} className="w-full">
                  <TabsList className="grid grid-cols-3 border-b border-[#EFE7DE]/15">
                    <TabsTrigger
                      value="gap"
                      className="text-[#EFE7DE]/50 data-[state=active]:text-[#EFE7DE] data-[state=active]:border-[#FAD9BA] text-[10px]"
                    >
                      1. Data gap
                    </TabsTrigger>
                    <TabsTrigger
                      value="transition"
                      className="text-[#EFE7DE]/50 data-[state=active]:text-[#EFE7DE] data-[state=active]:border-[#FAD9BA] text-[10px]"
                    >
                      2. Strata shift
                    </TabsTrigger>
                    <TabsTrigger
                      value="anomaly"
                      className="text-[#EFE7DE]/50 data-[state=active]:text-[#EFE7DE] data-[state=active]:border-[#FAD9BA] text-[10px]"
                    >
                      3. Soil anomaly
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="gap" className="mt-4 space-y-3 font-mono">
                    <div className="p-3 bg-[#1C130D] border border-[#EFE7DE]/15 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#EFE7DE]/60">Nearest sounding:</span>
                        <span className="font-bold text-[#FAD9BA]">16.2 meters</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#EFE7DE]/60">3D radar overlay:</span>
                        <span className="font-bold text-[#10B981]">
                          16.2m emerald radius cylinder
                        </span>
                      </div>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-[#EFE7DE]/80 leading-relaxed">
                      {MOCK_RECOMMENDED_POINT.reasoning.gap.description}
                    </p>
                  </TabsContent>

                  <TabsContent value="transition" className="mt-4 space-y-3 font-mono">
                    <div className="p-3 bg-[#1C130D] border border-[#EFE7DE]/15 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#EFE7DE]/60">Top stratum:</span>
                        <span className="font-bold text-[#D4A373]">Clean sand</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#EFE7DE]/60">3D radar overlay:</span>
                        <span className="font-bold text-[#E76F51]">
                          Dipping -8.5m wireframe fault plane
                        </span>
                      </div>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-[#EFE7DE]/80 leading-relaxed">
                      {MOCK_RECOMMENDED_POINT.reasoning.transition.description}
                    </p>
                  </TabsContent>

                  <TabsContent value="anomaly" className="mt-4 space-y-3 font-mono">
                    <div className="p-3 bg-[#1C130D] border border-[#EFE7DE]/15 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#EFE7DE]/60">Index offset:</span>
                        <span className="font-bold text-[#FAD9BA]">delta Ic = 0.18</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#EFE7DE]/60">3D radar overlay:</span>
                        <span className="font-bold text-[#EFE7DE]">
                          Amplified Q-value spike cluster
                        </span>
                      </div>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-[#EFE7DE]/80 leading-relaxed">
                      {MOCK_RECOMMENDED_POINT.reasoning.anomaly.description}
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EFE7DE]/15 flex items-center justify-between text-xs font-mono">
                <span className="text-[#EFE7DE]/50">Expected certainty gain:</span>
                <span className="font-bold text-[#FAD9BA]">+14.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

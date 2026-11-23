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
  const { activeDqnTab, setActiveDqnTab, setHoveredLayerId } = useSubsurface3D()

  const handleTabChange = (val: string) => {
    setActiveDqnTab(val)
    if (val === "transition") {
      setHoveredLayerId("layer-3")
    } else if (val === "gap") {
      setHoveredLayerId("layer-1")
    } else {
      setHoveredLayerId("layer-2")
    }
  }

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
          metaRight="SchemaGAN V4.2 and DQN agent"
          tone="dark"
        />

        {/* Interactive DQN Split Stage: Left 6 Cols = 3D Monolith Dock, Right 6 Cols = Rationale & Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column (6 cols): 3D Monolith Stage Dock with Spot 2 CPT Vector Beam */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <Section3DAnchorDock
              stage="dqn"
              tone="dark"
              title="Spot 2 CPT Vector Intersection"
              subtitle="UTM 48S 704120m E, 9309850m N"
            />
          </div>

          {/* Right Column (6 cols): Section Heading + "Why this point?" Sheet Card */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92]">
                {dqn.heading}
              </h2>
              <p className="font-sans text-[#EFE7DE]/70 text-base sm:text-lg leading-relaxed">
                {dqn.subheading}
              </p>
            </div>

            {/* Target Coordinate Summary Banner */}
            <div className="bg-[#271C14] border border-[#EFE7DE]/15 p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#150E09] border border-[#10B981] flex items-center justify-center">
                  <Crosshair className="w-4 h-4 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-[10px] text-[#FAD9BA] uppercase tracking-wider flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    Active 3D cone penetrometer target
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

            {/* "Why this point?" Sheet Card */}
            <div className="bg-[#271C14] border border-[#EFE7DE]/15 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-3 mb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#BD8564] tracking-wider block">
                      Reinforcement learning rationale
                    </span>
                    <h3 className="font-sans font-bold text-lg text-[#EFE7DE] tracking-tight">
                      Why this point? (Spot 2)
                    </h3>
                  </div>
                  <Badge variant="emerald" className="font-mono text-[10px]">
                    DQN priority 1
                  </Badge>
                </div>

                {/* Tabs Component */}
                <Tabs value={activeDqnTab} onValueChange={handleTabChange} className="w-full">
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
                        <span className="text-[#EFE7DE]/60">Soundings within 4.0m:</span>
                        <span className="font-bold text-[#E3D7C8]">0 (Uncertainty zone)</span>
                      </div>
                    </div>
                    <p className="font-sans text-xs text-[#EFE7DE]/80 leading-relaxed">
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
                        <span className="text-[#EFE7DE]/60">Predicted underlayer:</span>
                        <span className="font-bold text-[#BD8564]">Soft clay (-8.5m)</span>
                      </div>
                    </div>
                    <p className="font-sans text-xs text-[#EFE7DE]/80 leading-relaxed">
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
                        <span className="text-[#EFE7DE]/60">Cluster behavior:</span>
                        <span className="font-bold text-[#EFE7DE]">Localized shear shift</span>
                      </div>
                    </div>
                    <p className="font-sans text-xs text-[#EFE7DE]/80 leading-relaxed">
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

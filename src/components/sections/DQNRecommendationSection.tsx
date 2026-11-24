import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_RECOMMENDED_POINT } from "../../data/mockGeology"
import { Section3DAnchorDock } from "../three/Section3DAnchorDock"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { Crosshair, Compass, Navigation, Cpu, Activity } from "lucide-react"

export function DQNRecommendationSection() {
  const { dqn } = SITE_CONTENT
  const { activeDqnTab, setActiveDqnTab } = useSubsurface3D()

  const consolePanels = [
    {
      id: "gap",
      code: "01 / SPATIAL DATA GAP",
      title: MOCK_RECOMMENDED_POINT.reasoning.gap.title,
      metricLabel: "Nearest sounding",
      metricVal: "16.2 meters (0 within 4.0m)",
      overlayTag: "3D Overlay: 16.2m Emerald Radius Cylinder",
      description: MOCK_RECOMMENDED_POINT.reasoning.gap.description,
      accent: "#10B981",
    },
    {
      id: "transition",
      code: "02 / STRATIGRAPHIC SHIFT",
      title: MOCK_RECOMMENDED_POINT.reasoning.transition.title,
      metricLabel: "Predicted boundary",
      metricVal: "Clean sand → Soft clay (-8.5m)",
      overlayTag: "3D Overlay: Dipping -8.5m Wireframe Fault Plane",
      description: MOCK_RECOMMENDED_POINT.reasoning.transition.description,
      accent: "#E76F51",
    },
    {
      id: "anomaly",
      code: "03 / LATERAL SOIL ANOMALY",
      title: MOCK_RECOMMENDED_POINT.reasoning.anomaly.title,
      metricLabel: "SBT Index offset",
      metricVal: "delta Ic = 0.18 vs. B-01/B-03",
      overlayTag: "3D Overlay: Amplified Q-Value Spike Cluster",
      description: MOCK_RECOMMENDED_POINT.reasoning.anomaly.description,
      accent: "#FAD9BA",
    },
  ]

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
          metaRight="Spatial mission control & 3D neural pathfinding"
          tone="dark"
        />

        {/* Top Cockpit Bar: Left Floating Target Telemetry | Center Heading | Right Neural Gain HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-6">
          {/* Left Floating HUD Pill (3 Cols) */}
          <div className="lg:col-span-3 bg-[#271C14]/90 border border-[#EFE7DE]/15 p-3.5 font-mono text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#10B981]">
              <span className="flex items-center gap-1.5 font-bold uppercase">
                <Crosshair className="w-3.5 h-3.5" />
                Target Locked
              </span>
              <Badge variant="emerald" className="text-[9px] py-0 px-1.5">
                RANK #1
              </Badge>
            </div>
            <div className="font-bold text-[#EFE7DE] text-sm">
              {MOCK_RECOMMENDED_POINT.name}
            </div>
            <div className="text-[10px] text-[#FAD9BA] flex items-center gap-1">
              <Navigation className="w-3 h-3 shrink-0" />
              <span className="truncate">{MOCK_RECOMMENDED_POINT.utm}</span>
            </div>
          </div>

          {/* Center Monumental Title (6 Cols) */}
          <div className="lg:col-span-6 text-center space-y-2.5 px-2">
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.9]">
              {dqn.heading}
            </h2>
            <p className="font-sans text-[#EFE7DE]/70 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              {dqn.subheading}
            </p>
          </div>

          {/* Right Floating HUD Pill (3 Cols) */}
          <div className="lg:col-span-3 bg-[#271C14]/90 border border-[#EFE7DE]/15 p-3.5 font-mono text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#FAD9BA]">
              <span className="flex items-center gap-1.5 font-bold uppercase">
                <Cpu className="w-3.5 h-3.5" />
                DQN V4.6-A Core ML
              </span>
              <span className="text-[#10B981] font-bold">+14.2% Gain</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-[#EFE7DE]/60">Model Confidence:</span>
              <span className="font-bold text-[#EFE7DE]">{MOCK_RECOMMENDED_POINT.confidence}%</span>
            </div>
            <div className="text-[10px] text-[#EFE7DE]/50 flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#BD8564]" />
              <span>144 nodes · 29 engineered features</span>
            </div>
          </div>
        </div>

        {/* Center Full-Width 3D Holographic Geodetic Radar & Parabolic Search Arcs Stage */}
        <div className="relative w-full my-2">
          <Section3DAnchorDock
            stage="dqn"
            tone="dark"
            title="02 / 3D Neural Search Arcs & 144-Node Geodetic Candidate Matrix"
            subtitle="Parabolic Trajectories Converging on Spot 2"
            renderMobileCanvas={false}
            heightClass="h-[390px] xl:h-[440px]"
          />
        </div>

        {/* Bottom 3-Column Horizontal Cockpit Rationale Console Dock ("Why this point? Spot 2") */}
        <div className="mt-4 relative z-30">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#BD8564] mb-3 px-1">
            <span className="flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-[#10B981]" />
              Why this point? (Spot 2) — Select any rationale module to transform 3D radar overlay
            </span>
            <span className="hidden sm:inline text-[#EFE7DE]/50">
              Active overlay: {activeDqnTab.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {consolePanels.map((panel) => {
              const isSelected = activeDqnTab === panel.id
              return (
                <button
                  key={panel.id}
                  type="button"
                  onMouseEnter={() => setActiveDqnTab(panel.id)}
                  onClick={() => setActiveDqnTab(panel.id)}
                  className={`text-left p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#2E2016] border-[#FAD9BA] -translate-y-1 shadow-2xl"
                      : "bg-[#271C14]/85 border-[#EFE7DE]/15 hover:border-[#EFE7DE]/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-2.5 font-mono text-[10px]">
                      <span className="font-bold text-[#FAD9BA] tracking-wider">
                        {panel.code}
                      </span>
                      <span
                        className="w-2 h-2"
                        style={{
                          backgroundColor: isSelected ? panel.accent : "rgba(239,231,222,0.25)",
                        }}
                      />
                    </div>

                    <div className="flex items-baseline justify-between gap-2 font-mono">
                      <span className="text-[10px] text-[#EFE7DE]/50 uppercase">
                        {panel.metricLabel}
                      </span>
                      <span className="text-xs font-bold text-[#FAD9BA]">
                        {panel.metricVal}
                      </span>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-[#EFE7DE]/80 leading-relaxed">
                      {panel.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#EFE7DE]/15 font-mono text-[10px] text-[#10B981] flex items-center justify-between">
                    <span>{panel.overlayTag}</span>
                    <span className="text-[#FAD9BA] font-bold">
                      {isSelected ? "● ACTIVE" : "INSPECT →"}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

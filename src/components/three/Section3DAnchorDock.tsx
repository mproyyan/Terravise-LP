import { useSubsurface3D, type MonolithStage } from "../../context/Subsurface3DContext"
import { SubsurfaceMonolithCanvas } from "./SubsurfaceMonolithCanvas"
import { MOCK_SOIL_LAYERS } from "../../data/mockGeology"
import { Layers, Rotate3d, CheckCircle2, AlertTriangle, Crosshair } from "lucide-react"

interface Section3DAnchorDockProps {
  stage: MonolithStage
  tone?: "light" | "dark"
  title: string
  subtitle: string
  renderMobileCanvas?: boolean
}

export function Section3DAnchorDock({
  stage,
  tone = "light",
  title,
  subtitle,
  renderMobileCanvas = false,
}: Section3DAnchorDockProps) {
  const { activeStage, hoveredLayerId, setHoveredLayerId } = useSubsurface3D()
  const isDark = tone === "dark"
  const isCurrentStage = activeStage === stage

  return (
    <div className="relative w-full">
      {/* Desktop Blueprint Docking Frame (behind the persistent 3D Monolith Stage) */}
      <div
        className={`hidden lg:flex flex-col justify-between w-full h-[560px] xl:h-[620px] p-5 border relative transition-all duration-300 select-none ${
          isDark
            ? "bg-[#150E09]/70 border-[#EFE7DE]/15 text-[#EFE7DE]"
            : "bg-[#EFE7DE]/45 border-[#1C130D]/15 text-[#1C130D]"
        } ${isCurrentStage ? "ring-1 ring-[#BD8564]/40" : "opacity-60"}`}
      >
        {/* Architectural Blueprint Grid Backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: isDark
              ? "linear-gradient(to right, #BD8564 1px, transparent 1px), linear-gradient(to bottom, #BD8564 1px, transparent 1px)"
              : "linear-gradient(to right, #5A3008 1px, transparent 1px), linear-gradient(to bottom, #5A3008 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Corner Survey Crosshairs */}
        <div className="flex items-center justify-between text-[10px] font-mono opacity-60 z-10">
          <span>+ N 9,309,850 m</span>
          <span>E 704,120 m +</span>
        </div>

        {/* Side Stratum Quick-Inspector Buttons (Clickable/Hoverable in each section) */}
        <div className="my-auto ml-auto flex flex-col gap-1.5 z-30 pointer-events-auto">
          {MOCK_SOIL_LAYERS.map((layer, index) => {
            const isHovered = hoveredLayerId === layer.id
            const isHighlighted =
              (stage === "problem" && layer.id === "layer-3") ||
              (stage === "stratum" && layer.id === "layer-4")

            return (
              <button
                key={layer.id}
                type="button"
                onMouseEnter={() => setHoveredLayerId(layer.id)}
                onMouseLeave={() => setHoveredLayerId(null)}
                onClick={() =>
                  setHoveredLayerId(hoveredLayerId === layer.id ? null : layer.id)
                }
                className={`px-2.5 py-1.5 text-left font-mono text-[9px] border transition-all cursor-pointer flex items-center gap-2 backdrop-blur-xs ${
                  isHovered || isHighlighted
                    ? "bg-[#1C130D] text-[#FAD9BA] border-[#FAD9BA] translate-x-[-4px] shadow-md"
                    : isDark
                      ? "bg-[#271C14]/85 text-[#EFE7DE]/75 border-[#EFE7DE]/15 hover:border-[#EFE7DE]/40"
                      : "bg-[#FBF7F2]/90 text-[#1C130D]/80 border-[#1C130D]/15 hover:border-[#1C130D]/40"
                }`}
              >
                <span
                  className="w-2 h-2 shrink-0"
                  style={{ backgroundColor: layer.colorHex }}
                />
                <div>
                  <div className="font-bold uppercase tracking-wider">
                    L0{index + 1} · -{layer.depthEndM.toFixed(1)}m
                  </div>
                  <div className="text-[8px] opacity-75">{layer.soilType}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Bottom Blueprint Frame Annotation */}
        <div className="flex items-center justify-between text-[10px] font-mono opacity-60 z-10">
          <span>{title}</span>
          <span>{subtitle}</span>
        </div>
      </div>

      {/* Mobile & Tablet Inline View (< 1024px) */}
      <div
        className={`lg:hidden w-full border p-4 space-y-3 ${
          isDark
            ? "bg-[#271C14] border-[#EFE7DE]/15 text-[#EFE7DE]"
            : "bg-[#FAF5EE] border-[#1C130D]/15 text-[#1C130D]"
        }`}
      >
        <div className="flex items-center justify-between border-b pb-2 border-current/10 font-mono text-[10px]">
          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#BD8564]" />
            {title}
          </span>
          <span className="opacity-70 flex items-center gap-1">
            <Rotate3d className="w-3 h-3" />
            {subtitle}
          </span>
        </div>

        {renderMobileCanvas ? (
          <div className="w-full h-[360px] bg-[#150E09] border border-[#EFE7DE]/15 relative overflow-hidden">
            <SubsurfaceMonolithCanvas />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
            {MOCK_SOIL_LAYERS.map((layer, idx) => {
              const isFocus =
                (stage === "problem" && layer.id === "layer-3") ||
                (stage === "stratum" && layer.id === "layer-4") ||
                (stage === "dqn" && (layer.id === "layer-1" || layer.id === "layer-3"))

              return (
                <div
                  key={layer.id}
                  className={`p-2.5 border ${
                    isFocus
                      ? "bg-[#1C130D] text-[#FAD9BA] border-[#BD8564]"
                      : isDark
                        ? "bg-[#1C130D]/60 border-[#EFE7DE]/10 text-[#EFE7DE]/70"
                        : "bg-[#FBF7F2] border-[#1C130D]/10 text-[#1C130D]/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 inline-block"
                        style={{ backgroundColor: layer.colorHex }}
                      />
                      Layer 0{idx + 1}
                    </span>
                    {layer.id === "layer-3" && stage === "problem" && (
                      <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
                    )}
                    {layer.id === "layer-4" && stage === "stratum" && (
                      <CheckCircle2 className="w-3 h-3 text-[#E76F51]" />
                    )}
                    {stage === "dqn" && layer.id === "layer-3" && (
                      <Crosshair className="w-3 h-3 text-[#10B981]" />
                    )}
                  </div>
                  <div className="font-sans font-bold text-xs">{layer.soilType}</div>
                  <div className="opacity-70 text-[9px] mt-0.5">
                    -{layer.depthStartM.toFixed(1)}m to -{layer.depthEndM.toFixed(1)}m · qc{" "}
                    {layer.qcMpaAvg} MPa
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

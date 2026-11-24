import { useState } from "react"
import { Slider } from "../ui/Slider"
import { Badge } from "../ui/Badge"
import { MOCK_SOIL_LAYERS } from "../../data/mockGeology"
import { RefreshCw } from "lucide-react"

export function SlicedVoxelViewport() {
  const [sliceX, setSliceX] = useState<number>(55) // Easting slice percentage
  const [sliceY, setSliceY] = useState<number>(45) // Northing slice percentage
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
  const [perspectiveView, setPerspectiveView] = useState<"iso" | "front">("iso")

  const handleReset = () => {
    setSliceX(55)
    setSliceY(45)
  }

  return (
    <div className="w-full bg-[#1C130D] border border-[#EFE7DE]/15 p-4 sm:p-6 text-[#EFE7DE] flex flex-col gap-6">
      {/* Viewport Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFE7DE]/15 pb-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Badge variant="emerald" className="text-[10px]">
            <span className="w-1.5 h-1.5 rounded-none bg-[#FAD9BA] inline-block mr-1.5" />
            Voxel model active
          </Badge>
          <span className="text-[#EFE7DE]/60 tabular-nums">
            Site volume: 120m × 80m × 25m depth
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#271C14] border border-[#EFE7DE]/20 p-0.5 text-[11px]">
            <button
              type="button"
              aria-pressed={perspectiveView === "iso"}
              onClick={() => setPerspectiveView("iso")}
              className={`px-3 py-1 cursor-pointer transition-colors min-h-[32px] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] ${
                perspectiveView === "iso"
                  ? "bg-[#36271D] text-[#EFE7DE] font-bold"
                  : "text-[#EFE7DE]/50 hover:text-[#EFE7DE]"
              }`}
            >
              Isometric cut
            </button>
            <button
              type="button"
              aria-pressed={perspectiveView === "front"}
              onClick={() => setPerspectiveView("front")}
              className={`px-3 py-1 cursor-pointer transition-colors min-h-[32px] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] ${
                perspectiveView === "front"
                  ? "bg-[#36271D] text-[#EFE7DE] font-bold"
                  : "text-[#EFE7DE]/50 hover:text-[#EFE7DE]"
              }`}
            >
              Profile cross-section
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            title="Reset cutters"
            aria-label="Reset slicing cutters to default position"
            className="p-2 bg-[#271C14] border border-[#EFE7DE]/20 text-[#EFE7DE]/60 hover:text-[#EFE7DE] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2.5D Sliced Voxel Cross-Section Canvas */}
      <div className="relative w-full h-[380px] sm:h-[460px] bg-[#150E09] border border-[#EFE7DE]/15 overflow-hidden flex items-center justify-center p-4">
        {/* Engineering Survey Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Depth Ruler on Left Margin */}
        <div className="absolute left-3 top-6 bottom-6 flex flex-col justify-between font-mono text-[10px] text-[#EFE7DE]/40 z-10 border-r border-[#EFE7DE]/15 pr-2 select-none tabular-nums">
          <span>0.0 m</span>
          <span>-2.0 m</span>
          <span>-6.5 m</span>
          <span>-14.0 m</span>
          <span className="text-[#FAD9BA] font-bold">-25.0 m</span>
        </div>

        {/* 2.5D Multi-Layer Soil Block with Geological Hatching */}
        <div
          className={`relative transition-all duration-300 w-full max-w-[580px] h-[320px] flex flex-col justify-stretch border border-[#EFE7DE]/25 shadow-2xl ${
            perspectiveView === "iso"
              ? "transform -rotate-x-6 rotate-y-12 skew-y-1"
              : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            perspective: 800,
          }}
        >
          {/* Top Horizon: Sand / Gravel Layer */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-1")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-1 bg-[#D4A373] bg-hatch-sand border-b border-[#1C130D]/20 cursor-pointer transition-opacity group"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
            <span className="absolute top-1 left-2 font-mono text-[9px] font-bold text-[#1C130D] bg-[#EFE7DE]/80 px-1 tabular-nums">
              0.0 – 2.0m Sand
            </span>
          </div>

          {/* Silt Layer */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-2")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-2 bg-[#588157] bg-hatch-silt border-b border-[#1C130D]/20 cursor-pointer transition-opacity group"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
            <span className="absolute top-1 left-2 font-mono text-[9px] font-bold text-white bg-black/40 px-1 tabular-nums">
              2.0 – 6.5m Silt
            </span>
          </div>

          {/* Soft Clay Horizon */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-3")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-3 bg-[#A0522D] bg-hatch-clay border-b border-[#1C130D]/20 cursor-pointer transition-opacity group"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
            <span className="absolute top-1 left-2 font-mono text-[9px] font-bold text-white bg-black/40 px-1 tabular-nums">
              6.5 – 14.0m Soft clay (Uncertainty pocket)
            </span>
          </div>

          {/* Target Bearing Dense Sand Layer */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-4")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-4 bg-[#E76F51] bg-hatch-bearing cursor-pointer transition-opacity group"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
            <span className="absolute top-1 left-2 font-mono text-[9px] font-bold text-white bg-[#1C130D]/80 px-1 tabular-nums">
              14.0 – 25.0m Dense sand (Bearing stratum qc ≥ 15 MPa)
            </span>
          </div>

          {/* Simulated Vertical Penetration Sounding Rod */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-[#FAD9BA] shadow-lg pointer-events-none transition-all duration-150"
            style={{ left: `${Math.min(sliceX - 2, 75)}%` }}
          >
            <span className="absolute -top-6 -translate-x-1/2 font-mono text-[9px] font-bold text-[#EFE7DE] bg-[#271C14] px-1.5 py-0.5 border border-[#BD8564] whitespace-nowrap">
              Spot 2 (DQN target)
            </span>
          </div>

          {/* Slicing Cut Plane Line */}
          <div
            className="absolute top-0 bottom-0 w-px border-r border-dashed border-[#EFE7DE] pointer-events-none"
            style={{ left: `${sliceX}%` }}
          />
        </div>

        {/* Hover Layer Data Readout */}
        {hoveredLayer && (
          <div className="absolute bottom-4 right-4 bg-[#271C14] border border-[#EFE7DE]/20 p-3 max-w-xs font-mono text-xs z-20 shadow-xl pointer-events-none">
            {MOCK_SOIL_LAYERS.filter((l) => l.id === hoveredLayer).map((layer) => (
              <div key={layer.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 inline-block"
                    style={{ backgroundColor: layer.colorHex }}
                  />
                  <span className="font-bold text-[#EFE7DE]">{layer.name}</span>
                </div>
                <div className="text-[11px] text-[#EFE7DE]/70">{layer.description}</div>
                <div className="flex justify-between text-[10px] text-[#EFE7DE]/50 pt-1 border-t border-[#EFE7DE]/15 tabular-nums">
                  <span>Avg qc: {layer.qcMpaAvg} MPa</span>
                  <span>Avg Ic: {layer.icAvg}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parametric Slicing Slider Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#EFE7DE]/15">
        <div>
          <Slider
            label="Easting cut (X axis)"
            value={[sliceX]}
            onValueChange={(val) => setSliceX(val[0])}
            min={10}
            max={100}
            step={1}
            valueDisplay={`${Math.round((sliceX / 100) * 120)} m`}
            unit={`(${sliceX}%)`}
          />
          <span className="text-[10px] font-mono text-[#EFE7DE]/40 mt-1 block">
            Reveals dipping strata along West to East core line.
          </span>
        </div>

        <div>
          <Slider
            label="Northing cut (Y axis)"
            value={[sliceY]}
            onValueChange={(val) => setSliceY(val[0])}
            min={10}
            max={100}
            step={1}
            valueDisplay={`${Math.round((sliceY / 100) * 80)} m`}
            unit={`(${sliceY}%)`}
          />
          <span className="text-[10px] font-mono text-[#EFE7DE]/40 mt-1 block">
            Inspects lateral shear planes across North to South boundary.
          </span>
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Slider } from "../ui/Slider"
import { Badge } from "../ui/Badge"
import { MOCK_SOIL_LAYERS } from "../../data/mockGeology"
import { RefreshCw } from "lucide-react"

// SWAP POINT: Replace with React Three Fiber canvas when WebGL model is ready
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
    <div className="w-full bg-[#171814] border border-[#e8e5da]/15 p-4 sm:p-6 text-[#e8e5da] flex flex-col gap-6">
      {/* Viewport Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e5da]/15 pb-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Badge variant="emerald" className="text-[10px]">
            <span className="w-1.5 h-1.5 rounded-none bg-[#7c8c6c] inline-block mr-1.5" />
            Voxel model active
          </Badge>
          <span className="text-[#e8e5da]/60">
            Site volume: 120m × 80m × 25m depth
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#1f211b] border border-[#e8e5da]/20 p-0.5 text-[11px]">
            <button
              onClick={() => setPerspectiveView("iso")}
              className={`px-3 py-1 cursor-pointer transition-colors min-h-[32px] ${
                perspectiveView === "iso"
                  ? "bg-[#2a2d25] text-[#e8e5da] font-bold"
                  : "text-[#e8e5da]/50 hover:text-[#e8e5da]"
              }`}
            >
              Isometric cut
            </button>
            <button
              onClick={() => setPerspectiveView("front")}
              className={`px-3 py-1 cursor-pointer transition-colors min-h-[32px] ${
                perspectiveView === "front"
                  ? "bg-[#2a2d25] text-[#e8e5da] font-bold"
                  : "text-[#e8e5da]/50 hover:text-[#e8e5da]"
              }`}
            >
              Profile cross-section
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Reset cutters"
            aria-label="Reset slicing cutters"
            className="p-2 bg-[#1f211b] border border-[#e8e5da]/20 text-[#e8e5da]/60 hover:text-[#e8e5da] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2.5D Sliced Voxel Cross-Section Canvas */}
      <div className="relative w-full h-[380px] sm:h-[460px] bg-[#12130f] border border-[#e8e5da]/15 overflow-hidden flex items-center justify-center p-4">
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
        <div className="absolute left-3 top-6 bottom-6 flex flex-col justify-between font-mono text-[10px] text-[#e8e5da]/40 z-10 border-r border-[#e8e5da]/15 pr-2 select-none tabular-nums">
          <span>0.0 m</span>
          <span>-2.0 m</span>
          <span>-6.5 m</span>
          <span>-14.0 m</span>
          <span className="text-[#b78c75] font-bold">-25.0 m</span>
        </div>

        {/* 2.5D Multi-Layer Soil Block with Geological Hatching */}
        <div
          className={`relative transition-all duration-300 w-full max-w-[580px] h-[320px] flex flex-col justify-stretch border border-[#e8e5da]/25 shadow-2xl ${
            perspectiveView === "iso"
              ? "transform -rotate-x-6 rotate-y-12 skew-y-1"
              : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            perspective: 800,
          }}
        >
          {/* Layer 1: Sand */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-1")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-1 bg-[#d4a373] bg-hatch-sand border-b border-[#171814]/60 cursor-pointer transition-all overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-[#171814]/10 hover:bg-transparent transition-colors flex items-center justify-between px-4 text-[#171814] font-mono text-xs font-bold">
              <span>0.0m to 2.0m Medium sand</span>
              <span className="text-[10px] font-normal opacity-75">qc avg 6.8 MPa</span>
            </div>
          </div>

          {/* Layer 2: Silty Sand / Silt */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-2")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-2 bg-[#588157] bg-hatch-silt border-b border-[#171814]/60 cursor-pointer transition-all overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-[#171814]/15 hover:bg-transparent transition-colors flex items-center justify-between px-4 text-white font-mono text-xs font-bold">
              <span>2.0m to 6.5m Silty sand</span>
              <span className="text-[10px] font-normal opacity-75">qc avg 4.2 MPa</span>
            </div>
          </div>

          {/* Layer 3: Soft Marine Clay (Hazard zone) */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-3")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-3 bg-[#a0522d] bg-hatch-clay border-b border-[#171814]/60 cursor-pointer transition-all overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-[#171814]/20 hover:bg-transparent transition-colors flex items-center justify-between px-4 text-[#dedacd] font-mono text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#dedacd]" />
                6.5m to 14.0m Soft sensitive clay
              </span>
              <span className="text-[10px] font-normal text-[#dedacd]">
                WEAK STRATUM (qc &lt; 1.5 MPa)
              </span>
            </div>
          </div>

          {/* Layer 4: Competent Hard Stratum (Target bearing) */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-4")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-4 bg-[#e76F51] bg-hatch-bearing cursor-pointer transition-all overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-[#171814]/20 hover:bg-transparent transition-colors flex items-center justify-between px-4 text-white font-mono text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white" />
                14.0m to 25.0m Dense bearing sand
              </span>
              <span className="text-[10px] font-semibold text-white">
                TARGET BEARING (qc &gt;= 15 MPa)
              </span>
            </div>
          </div>

          {/* Sondir Penetration Probes */}
          <div
            className="absolute top-0 bottom-0 w-px bg-[#7c8c6c] pointer-events-none"
            style={{ left: "20%" }}
          >
            <span className="absolute -top-5 -translate-x-1/2 font-mono text-[9px] text-[#e8e5da] bg-[#171814] px-1 border border-[#e8e5da]/20">
              B-01
            </span>
          </div>
          <div
            className="absolute top-0 bottom-0 w-px bg-[#7c8c6c] pointer-events-none"
            style={{ left: "45%" }}
          >
            <span className="absolute -top-5 -translate-x-1/2 font-mono text-[9px] text-[#e8e5da] bg-[#171814] px-1 border border-[#e8e5da]/20">
              B-02
            </span>
          </div>
          <div
            className="absolute top-0 bottom-0 w-px bg-[#b78c75] pointer-events-none"
            style={{ left: `${Math.min(sliceX - 2, 75)}%` }}
          >
            <span className="absolute -top-6 -translate-x-1/2 font-mono text-[9px] font-bold text-[#e8e5da] bg-[#1f211b] px-1.5 py-0.5 border border-[#b78c75] whitespace-nowrap">
              Spot 2 (DQN target)
            </span>
          </div>

          {/* Slicing Cut Plane Line */}
          <div
            className="absolute top-0 bottom-0 w-px border-r border-dashed border-[#e8e5da] pointer-events-none"
            style={{ left: `${sliceX}%` }}
          />
        </div>

        {/* Hover Layer Data Readout */}
        {hoveredLayer && (
          <div className="absolute bottom-4 right-4 bg-[#1f211b] border border-[#e8e5da]/20 p-3 max-w-xs font-mono text-xs z-20 shadow-xl pointer-events-none">
            {MOCK_SOIL_LAYERS.filter((l) => l.id === hoveredLayer).map((layer) => (
              <div key={layer.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 inline-block"
                    style={{ backgroundColor: layer.colorHex }}
                  />
                  <span className="font-bold text-[#e8e5da]">{layer.name}</span>
                </div>
                <div className="text-[11px] text-[#e8e5da]/70">{layer.description}</div>
                <div className="flex justify-between text-[10px] text-[#e8e5da]/50 pt-1 border-t border-[#e8e5da]/15">
                  <span>Avg qc: {layer.qcMpaAvg} MPa</span>
                  <span>Avg Ic: {layer.icAvg}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parametric Slicing Slider Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#e8e5da]/15">
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
          <span className="text-[10px] font-mono text-[#e8e5da]/40 mt-1 block">
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
          <span className="text-[10px] font-mono text-[#e8e5da]/40 mt-1 block">
            Inspects lateral shear planes across North to South boundary.
          </span>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from "react"
import { Slider } from "../ui/Slider"
import { Badge } from "../ui/Badge"
import { MOCK_SOIL_LAYERS } from "../../data/mockGeology"
import { Layers, Eye, RefreshCw, ZoomIn } from "lucide-react"

// SWAP POINT: Replace with React Three Fiber canvas when WebGL model is ready
export function SlicedVoxelViewport() {
  const [sliceX, setSliceX] = useState<number>(55) // Easting slice percentage
  const [sliceY, setSliceY] = useState<number>(45) // Northing slice percentage
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
  const [perspectiveView, setPerspectiveView] = useState<"iso" | "front" | "top">("iso")

  const handleReset = () => {
    setSliceX(55)
    setSliceY(45)
  }

  return (
    <div className="w-full bg-[#121514] border border-stone-800 p-4 sm:p-6 text-stone-100 flex flex-col gap-6">
      {/* Viewport Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Badge variant="emerald" className="text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
            Voxel Volume Active
          </Badge>
          <span className="text-stone-400">
            Grid: 120m × 80m × 25m Depth
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-stone-900 border border-stone-700 p-0.5 text-[11px]">
            <button
              onClick={() => setPerspectiveView("iso")}
              className={`px-2.5 py-1 cursor-pointer transition-colors ${
                perspectiveView === "iso"
                  ? "bg-stone-800 text-stone-100 font-bold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Isometric
            </button>
            <button
              onClick={() => setPerspectiveView("front")}
              className={`px-2.5 py-1 cursor-pointer transition-colors ${
                perspectiveView === "front"
                  ? "bg-stone-800 text-stone-100 font-bold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Profile Cut
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Reset Slicers"
            className="p-1.5 bg-stone-900 border border-stone-700 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2.5D Sliced Voxel Cross-Section Canvas */}
      <div className="relative w-full h-[360px] sm:h-[440px] bg-radial from-stone-900/60 to-black/90 border border-stone-800/90 overflow-hidden flex items-center justify-center p-4">
        {/* Subtle Engineering Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Depth Ruler (Left Edge) */}
        <div className="absolute left-3 top-6 bottom-6 flex flex-col justify-between font-mono text-[10px] text-stone-500 z-10 border-r border-stone-800 pr-2 select-none">
          <span>0.0 m</span>
          <span>-2.0 m</span>
          <span>-6.5 m</span>
          <span>-14.0 m</span>
          <span className="text-amber-500 font-semibold">-25.0 m</span>
        </div>

        {/* 2.5D Multi-Layer Soil Block Simulation */}
        <div
          className={`relative transition-all duration-300 w-full max-w-[560px] h-[300px] flex flex-col justify-stretch border border-stone-700/80 shadow-2xl ${
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
            className="relative flex-1 bg-gradient-to-r from-[#D4A373] via-[#E9C46A] to-[#C89666] border-b border-stone-900/50 cursor-pointer transition-all overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-stone-950/10 hover:bg-transparent transition-colors flex items-center justify-between px-4 text-stone-950 font-mono text-xs font-bold">
              <span>0.0m - 2.0m Medium Sand</span>
              <span className="text-[10px] font-normal opacity-75">qc ~ 6.8 MPa</span>
            </div>
          </div>

          {/* Layer 2: Silty Sand / Silt */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-2")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-2 bg-gradient-to-r from-[#588157] via-[#4F774E] to-[#3A5A40] border-b border-stone-900/50 cursor-pointer transition-all overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-stone-950/15 hover:bg-transparent transition-colors flex items-center justify-between px-4 text-white font-mono text-xs font-bold">
              <span>2.0m - 6.5m Silty Sand & Silt</span>
              <span className="text-[10px] font-normal opacity-75">qc ~ 4.2 MPa</span>
            </div>
          </div>

          {/* Layer 3: Soft Marine Clay (Hazard zone) */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-3")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-3 bg-gradient-to-r from-[#A0522D] via-[#8C4624] to-[#6E3418] border-b border-stone-900/50 cursor-pointer transition-all overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-stone-950/20 hover:bg-transparent transition-colors flex items-center justify-between px-4 text-amber-100 font-mono text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                6.5m - 14.0m Soft Sensitive Marine Clay
              </span>
              <span className="text-[10px] font-normal text-rose-300">
                CRITICAL WEAK STRATUM (qc &lt; 1.5 MPa)
              </span>
            </div>
          </div>

          {/* Layer 4: Competent Hard Stratum (Target bearing) */}
          <div
            onMouseEnter={() => setHoveredLayer("layer-4")}
            onMouseLeave={() => setHoveredLayer(null)}
            className="relative flex-4 bg-gradient-to-r from-[#E76F51] via-[#D35F43] to-[#B84E34] cursor-pointer transition-all overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${sliceX}% 0, ${sliceX}% 100%, 0 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-stone-950/20 hover:bg-transparent transition-colors flex items-center justify-between px-4 text-white font-mono text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                14.0m - 25.0m Dense Bearing Sand & Gravel
              </span>
              <span className="text-[10px] font-semibold text-emerald-300">
                BEARING STRATUM (qc ≥ 15 MPa)
              </span>
            </div>
          </div>

          {/* Virtual Sondir Penetration Probes (Pencil rods) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_cyan] pointer-events-none"
            style={{ left: "20%" }}
          >
            <span className="absolute -top-5 -translate-x-1/2 font-mono text-[9px] text-cyan-300 bg-stone-900/90 px-1 border border-cyan-800">
              B-01
            </span>
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_cyan] pointer-events-none"
            style={{ left: "45%" }}
          >
            <span className="absolute -top-5 -translate-x-1/2 font-mono text-[9px] text-cyan-300 bg-stone-900/90 px-1 border border-cyan-800">
              B-02
            </span>
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_10px_#10B981] pointer-events-none"
            style={{ left: `${Math.min(sliceX - 2, 75)}%` }}
          >
            <span className="absolute -top-6 -translate-x-1/2 font-mono text-[9px] font-bold text-emerald-300 bg-emerald-950/90 px-1.5 py-0.5 border border-emerald-500 whitespace-nowrap">
              Spot 2 (DQN Target)
            </span>
          </div>

          {/* Cut Cross-Section Line Overlay */}
          <div
            className="absolute top-0 bottom-0 w-0.5 border-r border-dashed border-amber-400 pointer-events-none"
            style={{ left: `${sliceX}%` }}
          />
        </div>

        {/* Hovered Layer Inspection Tooltip */}
        {hoveredLayer && (
          <div className="absolute bottom-4 right-4 bg-stone-900/95 border border-stone-700 p-3 max-w-xs font-mono text-xs z-20 shadow-xl pointer-events-none">
            {MOCK_SOIL_LAYERS.filter((l) => l.id === hoveredLayer).map((layer) => (
              <div key={layer.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 inline-block"
                    style={{ backgroundColor: layer.colorHex }}
                  />
                  <span className="font-bold text-stone-100">{layer.name}</span>
                </div>
                <div className="text-[11px] text-stone-400">{layer.description}</div>
                <div className="flex justify-between text-[10px] text-stone-300 pt-1 border-t border-stone-800">
                  <span>Avg qc: {layer.qcMpaAvg} MPa</span>
                  <span>Avg Ic: {layer.icAvg}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parametric Slicing Slider Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-stone-800">
        <div>
          <Slider
            label="Easting Cross-Section Cut (X-Axis)"
            value={[sliceX]}
            onValueChange={(val) => setSliceX(val[0])}
            min={10}
            max={100}
            step={1}
            valueDisplay={`${Math.round((sliceX / 100) * 120)} m`}
            unit={`(${sliceX}%)`}
          />
          <span className="text-[10px] font-mono text-stone-500 mt-1 block">
            Reveals dipping stratigraphy along West-to-East core line.
          </span>
        </div>

        <div>
          <Slider
            label="Northing Lateral Section Cut (Y-Axis)"
            value={[sliceY]}
            onValueChange={(val) => setSliceY(val[0])}
            min={10}
            max={100}
            step={1}
            valueDisplay={`${Math.round((sliceY / 100) * 80)} m`}
            unit={`(${sliceY}%)`}
          />
          <span className="text-[10px] font-mono text-stone-500 mt-1 block">
            Inspects lateral shear planes across North-to-South boundary.
          </span>
        </div>
      </div>
    </div>
  )
}

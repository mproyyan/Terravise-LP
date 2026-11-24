import { PlateHeader } from "../ui/PlateHeader"
import { Slider } from "../ui/Slider"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_SOIL_LAYERS, MOCK_CPT_TEST_PIPES } from "../../data/mockGeology"
import { VoxelBoundaryStage } from "../three/VoxelBoundaryStage"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { RefreshCw, Scissors, MapPin, Eye } from "lucide-react"

export function SubsurfaceVoxelSection() {
  const { voxel } = SITE_CONTENT
  const {
    sliceX,
    setSliceX,
    sliceY,
    setSliceY,
    cameraView,
    setCameraView,
    hoveredLayerId,
    setHoveredLayerId,
    selectedPipeId,
    setSelectedPipeId,
    resetSlicing,
  } = useSubsurface3D()

  return (
    <section
      id="voxel"
      className="py-24 bg-[#1C130D] text-[#EFE7DE] border-b border-[#EFE7DE]/15 scroll-mt-12 relative z-10"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="03"
          title="Subsurface volume"
          metaRight="Smooth 3D boundary extrusion & 5 intact CPT test standpipes"
          tone="dark"
        />

        {/* Top Editorial Row */}
        <div className="max-w-3xl space-y-2.5 mb-8">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92]">
            {voxel.heading}
          </h2>
          <p className="font-sans text-[#EFE7DE]/70 text-xs sm:text-sm leading-relaxed">
            {voxel.subheading}
          </p>
        </div>

        {/* Asymmetric 8:4 Spatial Theater & Cross-Section Slicer Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Columns: Dedicated Smooth 3D Boundary Volume Theater + Popover + 4-Layer Horizon Strip */}
          <div className="lg:col-span-8 space-y-4">
            <VoxelBoundaryStage />

            {/* 4-Column Horizontal Stratigraphic Horizon Legend Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 font-mono">
              {MOCK_SOIL_LAYERS.map((layer, idx) => {
                const isHovered = hoveredLayerId === layer.id
                return (
                  <div
                    key={layer.id}
                    onMouseEnter={() => setHoveredLayerId(layer.id)}
                    onMouseLeave={() => setHoveredLayerId(null)}
                    className={`p-3 border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isHovered
                        ? "bg-[#36271D] border-[#FAD9BA]"
                        : "bg-[#271C14]/90 border-[#EFE7DE]/15 hover:border-[#EFE7DE]/35"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-6 shrink-0"
                        style={{ backgroundColor: layer.colorHex }}
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#EFE7DE] truncate">
                          0{idx + 1}. {layer.soilType}
                        </div>
                        <div className="text-[9px] text-[#BD8564] tabular-nums">
                          -{layer.depthStartM.toFixed(1)}m to -{layer.depthEndM.toFixed(1)}m
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] py-0 px-1.5 text-[#FAD9BA] border-[#FAD9BA]/30 shrink-0"
                    >
                      qc {layer.qcMpaAvg}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right 4 Columns: Cross-Section Boundary Slicer & 5 CPT Standpipe Telemetry Dock */}
          <div className="lg:col-span-4 bg-[#271C14] border border-[#EFE7DE]/15 p-5 sm:p-6 space-y-6 font-mono">
            {/* Camera View & Reset Header */}
            <div className="space-y-3 border-b border-[#EFE7DE]/15 pb-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#FAD9BA]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Eye className="w-3.5 h-3.5 text-[#10B981]" />
                  Camera &amp; Slicer Controls
                </span>
                <button
                  type="button"
                  onClick={resetSlicing}
                  className="text-[#EFE7DE]/70 hover:text-[#FAD9BA] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Cut</span>
                </button>
              </div>

              <div className="grid grid-cols-2 bg-[#1C130D] border border-[#EFE7DE]/20 p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCameraView("iso")}
                  className={`py-2 cursor-pointer transition-colors ${
                    cameraView === "iso"
                      ? "bg-[#5A3008] text-[#FAD9BA] font-bold"
                      : "text-[#EFE7DE]/50 hover:text-[#EFE7DE]"
                  }`}
                >
                  Isometric 3D
                </button>
                <button
                  type="button"
                  onClick={() => setCameraView("front")}
                  className={`py-2 cursor-pointer transition-colors ${
                    cameraView === "front"
                      ? "bg-[#5A3008] text-[#FAD9BA] font-bold"
                      : "text-[#EFE7DE]/50 hover:text-[#EFE7DE]"
                  }`}
                >
                  Elevation Profile
                </button>
              </div>
            </div>

            {/* Easting & Northing Boundary Cut Sliders (Pipes Stay Intact!) */}
            <div className="space-y-5 border-b border-[#EFE7DE]/15 pb-5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#BD8564]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Scissors className="w-3.5 h-3.5" />
                  Smooth Boundary Slicing
                </span>
                <span className="text-[#10B981]">5 Pipes Stay Intact</span>
              </div>

              <Slider
                label="Easting boundary cut (X axis)"
                value={[sliceX]}
                onValueChange={(val) => setSliceX(val[0])}
                min={15}
                max={100}
                step={1}
                valueDisplay={`${Math.round((sliceX / 100) * 120)} m`}
                unit={`(${sliceX}%)`}
              />

              <Slider
                label="Northing boundary cut (Y axis)"
                value={[sliceY]}
                onValueChange={(val) => setSliceY(val[0])}
                min={15}
                max={100}
                step={1}
                valueDisplay={`${Math.round((sliceY / 100) * 80)} m`}
                unit={`(${sliceY}%)`}
              />
            </div>

            {/* 5 Installed CPT Test Standpipes Directory (Click to open Popover on 3D Pipe) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                  5 Installed CPT Test Pipes
                </span>
                <span className="text-[#EFE7DE]/50 text-[9px]">Click pipe or row</span>
              </div>

              <div className="space-y-1.5">
                {MOCK_CPT_TEST_PIPES.map((pipe) => {
                  const isSelected = selectedPipeId === pipe.id
                  return (
                    <button
                      key={pipe.id}
                      type="button"
                      onClick={() => setSelectedPipeId(isSelected ? null : pipe.id)}
                      className={`w-full px-3 py-2 border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#150E09] border-[#10B981] text-[#EFE7DE] shadow-md"
                          : "bg-[#1C130D]/90 border-[#EFE7DE]/15 text-[#EFE7DE]/75 hover:border-[#FAD9BA]/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 ${
                            isSelected ? "bg-[#10B981]" : "bg-[#BD8564]/50"
                          }`}
                        />
                        <div>
                          <div className="text-xs font-bold text-[#FAD9BA]">
                            {pipe.code} · {pipe.sector}
                          </div>
                          <div className="text-[9px] text-[#EFE7DE]/50">{pipe.utm}</div>
                        </div>
                      </div>
                      <div className="text-right text-[10px]">
                        <div className="text-[#10B981] font-bold">
                          zb {pipe.bearingDepthM}m
                        </div>
                        <div className="text-[9px] text-[#EFE7DE]/45">
                          {isSelected ? "POPOVER OPEN" : "INSPECT →"}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

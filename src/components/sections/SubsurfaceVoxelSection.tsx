import { PlateHeader } from "../ui/PlateHeader"
import { Slider } from "../ui/Slider"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_SOIL_LAYERS, MOCK_CPT_TEST_PIPES } from "../../data/mockGeology"
import { VoxelBoundaryStage } from "../three/VoxelBoundaryStage"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { RefreshCw, MapPin } from "lucide-react"

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
      aria-label="Section 03: Subsurface volume"
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
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92] text-balance">
            {voxel.heading}
          </h2>
          <p className="font-sans text-[#EFE7DE]/70 text-xs sm:text-sm leading-relaxed text-pretty">
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
                    role="button"
                    tabIndex={0}
                    aria-label={`Stratigraphic layer 0${idx + 1}: ${layer.soilType}`}
                    onMouseEnter={() => setHoveredLayerId(layer.id)}
                    onMouseLeave={() => setHoveredLayerId(null)}
                    onFocus={() => setHoveredLayerId(layer.id)}
                    onBlur={() => setHoveredLayerId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setHoveredLayerId(isHovered ? null : layer.id)
                      }
                    }}
                    className={`p-3 border transition-colors cursor-pointer flex items-center justify-between gap-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FAD9BA] select-none ${
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
                      className="text-[9px] py-0 px-1.5 text-[#FAD9BA] border-[#FAD9BA]/30 shrink-0 tabular-nums"
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
            {/* Perspective View & Reset Header */}
            <div className="space-y-3 border-b border-[#EFE7DE]/15 pb-4">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={resetSlicing}
                  aria-label="Reset slicing cutters to 100%"
                  className="text-[#EFE7DE]/70 hover:text-[#FAD9BA] flex items-center gap-1 cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] text-[10px] uppercase font-mono px-1 py-0.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Cut</span>
                </button>
              </div>

              <div className="grid grid-cols-2 bg-[#1C130D] border border-[#EFE7DE]/20 p-0.5 text-[10px]">
                <button
                  type="button"
                  aria-pressed={cameraView === "iso"}
                  onClick={() => setCameraView("iso")}
                  className={`py-2 cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] ${
                    cameraView === "iso"
                      ? "bg-[#5A3008] text-[#FAD9BA] font-bold"
                      : "text-[#EFE7DE]/50 hover:text-[#EFE7DE]"
                  }`}
                >
                  Isometric 3D
                </button>
                <button
                  type="button"
                  aria-pressed={cameraView === "front"}
                  onClick={() => setCameraView("front")}
                  className={`py-2 cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] ${
                    cameraView === "front"
                      ? "bg-[#5A3008] text-[#FAD9BA] font-bold"
                      : "text-[#EFE7DE]/50 hover:text-[#EFE7DE]"
                  }`}
                >
                  Elevation Profile
                </button>
              </div>
            </div>

            {/* Interactive Dual Parametric Slicers */}
            <div className="space-y-4 border-b border-[#EFE7DE]/15 pb-5">
              <Slider
                label="Easting Cutter (X Axis)"
                value={[sliceX]}
                onValueChange={(val) => setSliceX(val[0])}
                min={10}
                max={100}
                step={1}
                valueDisplay={`${Math.round((sliceX / 100) * 120)}m`}
                unit={`(${sliceX}%)`}
              />

              <Slider
                label="Northing Cutter (Y Axis)"
                value={[sliceY]}
                onValueChange={(val) => setSliceY(val[0])}
                min={10}
                max={100}
                step={1}
                valueDisplay={`${Math.round((sliceY / 100) * 80)}m`}
                unit={`(${sliceY}%)`}
              />
            </div>

            {/* 5 Field CPT Standpipe Soundings Telemetry Ingestion List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#BD8564]">
                <span className="flex items-center gap-1 font-bold">
                  <MapPin className="w-3 h-3" />
                  Intact CPT Standpipes
                </span>
                <span>5 Soundings</span>
              </div>

              <div className="space-y-1.5">
                {MOCK_CPT_TEST_PIPES.map((pipe) => {
                  const isSelected = selectedPipeId === pipe.id
                  const isCoreProbe = pipe.id === "cpt-03"
                  return (
                    <div
                      key={pipe.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`CPT sounding ${pipe.code}: 0.0m to ${pipe.terminationDepthM}m (${pipe.sector})`}
                      onClick={() => setSelectedPipeId(isSelected ? null : pipe.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedPipeId(isSelected ? null : pipe.id)
                        }
                      }}
                      className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] select-none ${
                        isSelected
                          ? "bg-[#5A3008] border-[#FAD9BA] text-[#FAD9BA]"
                          : "bg-[#1C130D] border-[#EFE7DE]/15 hover:border-[#EFE7DE]/30 text-[#EFE7DE]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: isCoreProbe ? "#10B981" : "#FAD9BA",
                          }}
                        />
                        <span className="font-bold">{pipe.code}</span>
                        {isCoreProbe && (
                          <span className="text-[9px] bg-[#10B981]/20 text-[#10B981] px-1 py-0.5 uppercase tracking-wider">
                            Core Probe
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#EFE7DE]/60 tabular-nums">
                        0.0m to {pipe.terminationDepthM}m
                      </span>
                    </div>
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

import { PlateHeader } from "../ui/PlateHeader"
import { Slider } from "../ui/Slider"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_SOIL_LAYERS, MOCK_CPT_TEST_PIPES } from "../../data/mockGeology"
import { Section3DAnchorDock } from "../three/Section3DAnchorDock"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { RefreshCw, Scissors, MapPin } from "lucide-react"

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
      className="py-24 bg-[#1C130D] text-[#EFE7DE] border-b border-[#EFE7DE]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="03"
          title="Subsurface volume"
          metaRight="Full-stage 3D boundary theater & 5 intact CPT test pipes"
          tone="dark"
        />

        {/* Top Editorial Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92]">
              {voxel.heading}
            </h2>
            <p className="font-sans text-[#EFE7DE]/70 text-xs sm:text-sm leading-relaxed">
              {voxel.subheading}
            </p>
          </div>

          {/* Camera Angle & Reset Switch */}
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <div className="flex bg-[#271C14] border border-[#EFE7DE]/20 p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setCameraView("iso")}
                className={`px-3 py-1.5 cursor-pointer transition-colors ${
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
                className={`px-3 py-1.5 cursor-pointer transition-colors ${
                  cameraView === "front"
                    ? "bg-[#5A3008] text-[#FAD9BA] font-bold"
                    : "text-[#EFE7DE]/50 hover:text-[#EFE7DE]"
                }`}
              >
                Elevation Profile
              </button>
            </div>

            <button
              type="button"
              onClick={resetSlicing}
              title="Reset 3D slicing planes"
              aria-label="Reset 3D slicing planes"
              className="px-2.5 py-1.5 bg-[#271C14] border border-[#EFE7DE]/20 text-[#EFE7DE]/70 hover:text-[#FAD9BA] transition-colors cursor-pointer flex items-center gap-1.5 text-[10px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Cut</span>
            </button>
          </div>
        </div>

        {/* 12-Column Horizontal Slicing & Pipe Selector Command Bar */}
        <div className="bg-[#271C14] border border-[#EFE7DE]/15 p-4 sm:p-5 mb-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-30">
          {/* Easting (X) Slicing Slider (4 Cols) */}
          <div className="lg:col-span-4">
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
          </div>

          {/* Northing (Y) Slicing Slider (4 Cols) */}
          <div className="lg:col-span-4">
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

          {/* 5 Installed CPT Test Pipe Selector Pills (4 Cols) */}
          <div className="lg:col-span-4 space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
              <span className="text-[#FAD9BA] font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#10B981]" />
                5 CPT Test Standpipes (Click pipe or pill)
              </span>
              <Scissors className="w-3 h-3 text-[#EFE7DE]/40" />
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {MOCK_CPT_TEST_PIPES.map((pipe) => {
                const isSelected = selectedPipeId === pipe.id
                return (
                  <button
                    key={pipe.id}
                    type="button"
                    onClick={() => setSelectedPipeId(isSelected ? null : pipe.id)}
                    className={`py-1.5 px-1 border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#150E09] border-[#10B981] text-[#10B981] font-bold shadow-md"
                        : "bg-[#1C130D] border-[#EFE7DE]/15 text-[#EFE7DE]/70 hover:text-[#FAD9BA]"
                    }`}
                  >
                    <div className="text-[10px]">{pipe.code}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Giant Center-Stage 12-Column 3D Boundary Volume & 5 Clickable CPT Pipes Theater */}
        <div className="relative w-full my-2">
          <Section3DAnchorDock
            stage="voxel"
            tone="dark"
            title="03 / Smooth 3D Geodetic Boundary Volume & 5 Intact CPT Standpipes"
            subtitle="Click any 3D Pipe to Open Soil Log Popover"
            renderMobileCanvas={true}
            heightClass="h-[460px] xl:h-[520px]"
          />
        </div>

        {/* Bottom 4-Column Horizontal Stratigraphic Horizon Legend Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#EFE7DE]/15 font-mono relative z-30">
          {MOCK_SOIL_LAYERS.map((layer, idx) => {
            const isHovered = hoveredLayerId === layer.id
            return (
              <div
                key={layer.id}
                onMouseEnter={() => setHoveredLayerId(layer.id)}
                onMouseLeave={() => setHoveredLayerId(null)}
                className={`p-3.5 border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                  isHovered
                    ? "bg-[#36271D] border-[#FAD9BA]"
                    : "bg-[#271C14]/90 border-[#EFE7DE]/15 hover:border-[#EFE7DE]/35"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-7 shrink-0"
                    style={{ backgroundColor: layer.colorHex }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#EFE7DE] truncate">
                      0{idx + 1}. {layer.soilType}
                    </div>
                    <div className="text-[10px] text-[#BD8564] tabular-nums">
                      -{layer.depthStartM.toFixed(1)}m to -{layer.depthEndM.toFixed(1)}m
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] py-0.5 px-1.5 text-[#FAD9BA] border-[#FAD9BA]/30 shrink-0"
                >
                  qc {layer.qcMpaAvg}
                </Badge>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

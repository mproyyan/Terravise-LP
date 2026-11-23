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
          metaRight="Smooth 3D boundary volume & 5 CPT test standpipes"
          tone="dark"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 5 Columns: Heading, Smooth Slicing Sliders, 5 Test Pipe Selector Pills, and 4 Horizon Legend Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92]">
                {voxel.heading}
              </h2>
              <p className="font-sans text-[#EFE7DE]/70 text-sm sm:text-base leading-relaxed">
                {voxel.subheading}
              </p>
            </div>

            {/* 5 Completed CPT Test Pipe Markers (Click pipe in 3D or select pill to open Popover) */}
            <div className="bg-[#271C14] border border-[#EFE7DE]/15 p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                <span className="text-[#FAD9BA] font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                  5 Installed CPT Test Pipes (Click 3D pipe for soil log)
                </span>
                <span className="text-[#EFE7DE]/50">Intact during slice</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {MOCK_CPT_TEST_PIPES.map((pipe) => {
                  const isSelected = selectedPipeId === pipe.id
                  return (
                    <button
                      key={pipe.id}
                      type="button"
                      onClick={() =>
                        setSelectedPipeId(isSelected ? null : pipe.id)
                      }
                      className={`py-2 px-1.5 border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#150E09] border-[#10B981] text-[#10B981] font-bold shadow-md"
                          : "bg-[#1C130D] border-[#EFE7DE]/15 text-[#EFE7DE]/70 hover:text-[#FAD9BA] hover:border-[#FAD9BA]/40"
                      }`}
                    >
                      <div className="text-[10px]">{pipe.code}</div>
                      <div className="text-[8px] opacity-65 tabular-nums">
                        {pipe.bearingDepthM}m
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Interactive 3D Smooth Boundary Slicing Deck */}
            <div className="bg-[#271C14] border border-[#EFE7DE]/15 p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE7DE]/15 pb-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5 text-[#FAD9BA]" />
                  <span className="font-bold uppercase tracking-wider text-[#EFE7DE]">
                    3D Boundary Slicing Cutters
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex bg-[#1C130D] border border-[#EFE7DE]/20 p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCameraView("iso")}
                      className={`px-2.5 py-1 cursor-pointer transition-colors ${
                        cameraView === "iso"
                          ? "bg-[#36271D] text-[#FAD9BA] font-bold"
                          : "text-[#EFE7DE]/50 hover:text-[#EFE7DE]"
                      }`}
                    >
                      Isometric
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraView("front")}
                      className={`px-2.5 py-1 cursor-pointer transition-colors ${
                        cameraView === "front"
                          ? "bg-[#36271D] text-[#FAD9BA] font-bold"
                          : "text-[#EFE7DE]/50 hover:text-[#EFE7DE]"
                      }`}
                    >
                      Elevation
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={resetSlicing}
                    title="Reset 3D slicing planes"
                    aria-label="Reset 3D slicing planes"
                    className="p-1.5 bg-[#1C130D] border border-[#EFE7DE]/20 text-[#EFE7DE]/60 hover:text-[#EFE7DE] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
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
                  <span className="text-[10px] font-mono text-[#EFE7DE]/45 mt-1 block">
                    Smoothly slices the 3D soil volume while keeping the 5 CPT pipes intact.
                  </span>
                </div>

                <div>
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
                  <span className="text-[10px] font-mono text-[#EFE7DE]/45 mt-1 block">
                    Exposes undulating internal horizons across the North-to-South profile.
                  </span>
                </div>
              </div>
            </div>

            {/* Compact 2x2 Stratigraphic Horizon Legend */}
            <div className="grid grid-cols-2 gap-2.5 font-mono">
              {MOCK_SOIL_LAYERS.map((layer) => {
                const isHovered = hoveredLayerId === layer.id
                return (
                  <div
                    key={layer.id}
                    onMouseEnter={() => setHoveredLayerId(layer.id)}
                    onMouseLeave={() => setHoveredLayerId(null)}
                    className={`p-3 border transition-colors cursor-pointer space-y-1 ${
                      isHovered
                        ? "bg-[#36271D] border-[#FAD9BA]"
                        : "bg-[#271C14] border-[#EFE7DE]/15 hover:border-[#EFE7DE]/35"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 shrink-0"
                          style={{ backgroundColor: layer.colorHex }}
                        />
                        <span className="text-[11px] font-bold text-[#EFE7DE] truncate">
                          {layer.soilType}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[8px] py-0 px-1 text-[#FAD9BA] border-[#FAD9BA]/30 shrink-0"
                      >
                        qc {layer.qcMpaAvg}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-[#BD8564] tabular-nums">
                      -{layer.depthStartM.toFixed(1)}m to -{layer.depthEndM.toFixed(1)}m
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right 7 Columns: Open Borderless Smooth 3D Boundary Volume & 5 CPT Pipes */}
          <div className="lg:col-span-7">
            <Section3DAnchorDock
              stage="voxel"
              tone="dark"
              title="03 / Smooth 3D Boundary Volume & 5 CPT Test Pipes"
              subtitle="Click any 3D Pipe to Inspect Soil Profile"
              renderMobileCanvas={true}
              heightClass="h-[520px] xl:h-[580px]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

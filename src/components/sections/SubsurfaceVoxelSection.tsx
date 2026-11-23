import { PlateHeader } from "../ui/PlateHeader"
import { SlicedVoxelViewport } from "../interactive/SlicedVoxelViewport"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_SOIL_LAYERS } from "../../data/mockGeology"

export function SubsurfaceVoxelSection() {
  const { voxel } = SITE_CONTENT

  return (
    <section
      id="voxel"
      className="py-24 bg-[#171814] text-[#e8e5da] border-b border-[#e8e5da]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="04"
          title="Subsurface volume"
          metaRight="Voxel cross-section viewport"
          tone="dark"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-12 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#e8e5da] uppercase tracking-[-0.035em] leading-[0.92]">
            {voxel.heading}
          </h2>
          <p className="font-sans text-[#e8e5da]/70 text-base sm:text-lg leading-relaxed">
            {voxel.subheading}
          </p>
        </div>

        {/* Swappable Voxel Viewport Container */}
        <div className="mb-10">
          <SlicedVoxelViewport />
        </div>

        {/* Stratigraphic Horizon Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#e8e5da]/15">
          {MOCK_SOIL_LAYERS.map((layer) => (
            <div
              key={layer.id}
              className="p-3 bg-[#1f211b] border border-[#e8e5da]/15 space-y-2 font-mono"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 shrink-0"
                  style={{ backgroundColor: layer.colorHex }}
                />
                <span className="text-xs font-bold text-[#e8e5da]">
                  {layer.name}
                </span>
              </div>
              <div className="text-[11px] text-[#b78c75] tabular-nums">
                Depth: {layer.depthStartM.toFixed(1)}m to {layer.depthEndM.toFixed(1)}m
              </div>
              <div className="text-[10px] text-[#e8e5da]/50 font-sans">
                {layer.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

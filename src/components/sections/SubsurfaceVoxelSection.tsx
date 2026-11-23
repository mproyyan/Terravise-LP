import { PlateHeader } from "../ui/PlateHeader"
import { SlicedVoxelViewport } from "../interactive/SlicedVoxelViewport"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_SOIL_LAYERS } from "../../data/mockGeology"

export function SubsurfaceVoxelSection() {
  const { voxel } = SITE_CONTENT

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
          metaRight="Voxel cross-section viewport"
          tone="dark"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-12 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92]">
            {voxel.heading}
          </h2>
          <p className="font-sans text-[#EFE7DE]/70 text-base sm:text-lg leading-relaxed">
            {voxel.subheading}
          </p>
        </div>

        {/* Swappable Voxel Viewport Container */}
        <div className="mb-10">
          <SlicedVoxelViewport />
        </div>

        {/* Stratigraphic Horizon Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#EFE7DE]/15">
          {MOCK_SOIL_LAYERS.map((layer) => (
            <div
              key={layer.id}
              className="p-3 bg-[#271C14] border border-[#EFE7DE]/15 space-y-2 font-mono"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 shrink-0"
                  style={{ backgroundColor: layer.colorHex }}
                />
                <span className="text-xs font-bold text-[#EFE7DE]">
                  {layer.name}
                </span>
              </div>
              <div className="text-[11px] text-[#BD8564] tabular-nums">
                Depth: {layer.depthStartM.toFixed(1)}m to {layer.depthEndM.toFixed(1)}m
              </div>
              <div className="text-[10px] text-[#EFE7DE]/50 font-sans">
                {layer.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { PlateHeader } from "../ui/PlateHeader"
import { SlicedVoxelViewport } from "../interactive/SlicedVoxelViewport"
import { SITE_CONTENT } from "../../data/siteContent"
import { MOCK_SOIL_LAYERS } from "../../data/mockGeology"

export function SubsurfaceVoxelSection() {
  const { voxel } = SITE_CONTENT

  return (
    <section
      id="voxel"
      className="py-24 bg-[#121514] text-[#E8E5DA] border-b border-stone-800 scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Plate Header */}
        <PlateHeader
          number="04"
          title="3D Strata Inspection"
          metaRight="Voxel Cross-Section Viewport"
          tone="dark"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-12 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-stone-100 uppercase tracking-tight">
            {voxel.heading}
          </h2>
          <p className="font-sans text-stone-400 text-base sm:text-lg leading-relaxed">
            {voxel.subheading}
          </p>
        </div>

        {/* Swappable Voxel Viewport Container */}
        <div className="mb-10">
          <SlicedVoxelViewport />
        </div>

        {/* Stratigraphic Horizon Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-stone-800">
          {MOCK_SOIL_LAYERS.map((layer) => (
            <div
              key={layer.id}
              className="p-3 bg-stone-900/60 border border-stone-800 space-y-2 font-mono"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-none shrink-0"
                  style={{ backgroundColor: layer.colorHex }}
                />
                <span className="text-xs font-bold text-stone-200">
                  {layer.name}
                </span>
              </div>
              <div className="text-[11px] text-stone-400">
                Depth: {layer.depthStartM.toFixed(1)}m – {layer.depthEndM.toFixed(1)}m
              </div>
              <div className="text-[10px] text-stone-500 font-sans">
                {layer.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

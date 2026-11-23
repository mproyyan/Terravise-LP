import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"

export function WorkflowSection() {
  const { workflow } = SITE_CONTENT

  return (
    <section
      id="workflow"
      className="py-24 bg-[#1C130D] text-[#EFE7DE] border-b border-[#EFE7DE]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="05"
          title="iPadOS application workflow"
          metaRight="Four native field stages"
          tone="dark"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92]">
            Four integrated steps from site boundary to foundation handoff
          </h2>
          <p className="font-sans text-[#EFE7DE]/70 text-base sm:text-lg leading-relaxed">
            How geotechnical engineers and CPT rig operators use Terravise directly on Apple silicon iPadOS in the field.
          </p>
        </div>

        {/* 4-Step Linear Sequence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflow.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-[#271C14] border border-[#EFE7DE]/15 p-6 flex flex-col justify-between hover:border-[#EFE7DE]/40 transition-colors group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#EFE7DE]/15 pb-3 font-mono text-xs">
                  <span className="font-bold text-[#FAD9BA] text-sm tabular-nums">
                    {step.stepNumber}
                  </span>
                  <Badge variant="outline" className="text-[9px] text-[#EFE7DE]/60 border-[#EFE7DE]/20">
                    {step.badgeText}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-xl text-[#EFE7DE] tracking-tight">
                    {step.title}
                  </h3>
                  <div className="font-mono text-[10px] text-[#EFE7DE]/50 uppercase tracking-wider mt-0.5">
                    {step.subtitle}
                  </div>
                </div>

                <p className="font-sans text-xs text-[#EFE7DE]/70 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#EFE7DE]/15 font-mono text-[11px] text-[#FAD9BA] flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#EFE7DE]/40">
                  Standard output
                </span>
                <span className="font-bold">{step.deliverable}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

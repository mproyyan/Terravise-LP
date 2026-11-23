import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"

export function WorkflowSection() {
  const { workflow } = SITE_CONTENT

  return (
    <section
      id="workflow"
      className="py-24 bg-[#171814] text-[#e8e5da] border-b border-[#e8e5da]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="06"
          title="Field rig sequence"
          metaRight="Linear operational protocol"
          tone="dark"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#e8e5da] uppercase tracking-[-0.035em] leading-[0.92]">
            Four stages from first probe to pile schedule
          </h2>
          <p className="font-sans text-[#e8e5da]/70 text-base sm:text-lg leading-relaxed">
            A cohesive field protocol deployed directly on iPadOS alongside the exploration crew.
          </p>
        </div>

        {/* 4-Step Linear Sequence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflow.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-[#1f211b] border border-[#e8e5da]/15 p-6 flex flex-col justify-between hover:border-[#e8e5da]/40 transition-colors group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e8e5da]/15 pb-3 font-mono text-xs">
                  <span className="font-bold text-[#b78c75] text-sm tabular-nums">
                    {step.stepNumber}
                  </span>
                  <Badge variant="outline" className="text-[9px] text-[#e8e5da]/60 border-[#e8e5da]/20">
                    {step.badgeText}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-xl text-[#e8e5da] tracking-tight">
                    {step.title}
                  </h3>
                  <div className="font-mono text-[10px] text-[#e8e5da]/50 uppercase tracking-wider mt-0.5">
                    {step.subtitle}
                  </div>
                </div>

                <p className="font-sans text-xs text-[#e8e5da]/70 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#e8e5da]/15 font-mono text-[11px] text-[#7c8c6c] flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#e8e5da]/40">
                  Deliverable
                </span>
                <span className="text-right font-medium">
                  {step.deliverable}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"

export function WorkflowSection() {
  const { workflow } = SITE_CONTENT

  return (
    <section
      id="workflow"
      className="py-24 bg-[#121514] text-[#E8E5DA] border-b border-stone-800 scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Plate Header */}
        <PlateHeader
          number="06"
          title="Field Rig Sequence"
          metaRight="End-to-End Campaign Flow"
          tone="dark"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-stone-100 uppercase tracking-tight">
            From First Probe to Foundation Handover.
          </h2>
          <p className="font-sans text-stone-400 text-base sm:text-lg leading-relaxed">
            A cohesive four-stage field protocol deployed directly on iPadOS alongside your CPT exploration crew.
          </p>
        </div>

        {/* 4-Step Linear Sequence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflow.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-[#171A19] border border-stone-800 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3 font-mono text-xs">
                  <span className="font-bold text-amber-500 text-sm">
                    {step.stepNumber}
                  </span>
                  <Badge variant="outline" className="text-[9px] text-stone-400 border-stone-700">
                    {step.badgeText}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-sans font-black text-xl text-stone-100 tracking-tight">
                    {step.title}
                  </h3>
                  <div className="font-mono text-[11px] text-stone-500 uppercase tracking-wider mt-0.5">
                    {step.subtitle}
                  </div>
                </div>

                <p className="font-sans text-xs text-stone-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-800/80 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                <span className="text-[10px] uppercase text-stone-500">
                  Deliverable:
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

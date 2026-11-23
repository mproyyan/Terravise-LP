import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { AlertCircle, Clock, Database } from "lucide-react"

export function ProblemSection() {
  const { problem } = SITE_CONTENT

  const getCardIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Clock className="w-4 h-4 text-[#845942]" />
      case 1:
        return <AlertCircle className="w-4 h-4 text-[#a0522d]" />
      case 2:
      default:
        return <Database className="w-4 h-4 text-[#5c5f55]" />
    }
  }

  return (
    <section
      id="problem"
      className="py-24 bg-[#f4f2ec] border-b border-[#171814]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Architectural Plate Header */}
        <PlateHeader
          number="01"
          title="Investigation limits"
          metaRight="Fixed grid spacing errors"
          tone="light"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#171814] uppercase tracking-[-0.035em] leading-[0.92]">
            {problem.heading}
          </h2>
          <p className="font-sans text-[#5c5f55] text-base sm:text-lg leading-relaxed">
            {problem.subheading}
          </p>
        </div>

        {/* 3 Comparison Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problem.cards.map((card, idx) => (
            <div
              key={card.number}
              className="bg-[#f8f7f4] border border-[#171814]/15 p-6 sm:p-8 flex flex-col justify-between hover:border-[#171814] transition-colors shadow-xs group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#171814]/10 pb-3">
                  <span className="font-mono text-xs font-bold text-[#845942]">
                    {card.number}
                  </span>
                  <Badge variant={idx === 0 ? "amber" : idx === 1 ? "clay" : "slate"}>
                    {card.badge}
                  </Badge>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#dedacd]/40 border border-[#171814]/10">
                    {getCardIcon(idx)}
                  </div>
                  <h3 className="font-sans font-bold text-lg text-[#171814] tracking-tight">
                    {card.title}
                  </h3>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#5c5f55] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#171814]/10 font-mono text-xs flex items-center justify-between text-[#171814]">
                <span className="text-[10px] uppercase text-[#5c5f55] tracking-wider">
                  Result
                </span>
                <span className="font-bold text-[#171814] text-right">
                  {card.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

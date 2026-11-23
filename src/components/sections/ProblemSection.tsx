import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { AlertCircle, Clock, Database } from "lucide-react"

export function ProblemSection() {
  const { problem } = SITE_CONTENT

  const getCardIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Clock className="w-4 h-4 text-[#7A421D]" />
      case 1:
        return <AlertCircle className="w-4 h-4 text-[#9E623F]" />
      case 2:
      default:
        return <Database className="w-4 h-4 text-[#63554B]" />
    }
  }

  return (
    <section
      id="problem"
      className="py-24 bg-[#FBF7F2] border-b border-[#1C130D]/15 scroll-mt-12"
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
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#1C130D] uppercase tracking-[-0.035em] leading-[0.92]">
            {problem.heading}
          </h2>
          <p className="font-sans text-[#63554B] text-base sm:text-lg leading-relaxed">
            {problem.subheading}
          </p>
        </div>

        {/* 3 Comparison Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problem.cards.map((card, idx) => (
            <div
              key={card.number}
              className="bg-[#FAF5EE] border border-[#1C130D]/15 p-6 sm:p-8 flex flex-col justify-between hover:border-[#1C130D] transition-colors shadow-xs group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1C130D]/10 pb-3">
                  <span className="font-mono text-xs font-bold text-[#7A421D]">
                    {card.number}
                  </span>
                  <Badge variant={idx === 0 ? "amber" : idx === 1 ? "clay" : "slate"}>
                    {card.badge}
                  </Badge>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#E3D7C8]/40 border border-[#1C130D]/10">
                    {getCardIcon(idx)}
                  </div>
                  <h3 className="font-sans font-bold text-lg text-[#1C130D] tracking-tight">
                    {card.title}
                  </h3>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#1C130D]/10 font-mono text-xs flex items-center justify-between text-[#1C130D]">
                <span className="text-[10px] uppercase text-[#63554B] tracking-wider">
                  Result
                </span>
                <span className="font-bold text-[#1C130D] text-right">
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

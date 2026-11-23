import React from "react"
import { PlateHeader } from "../ui/PlateHeader"
import { Badge } from "../ui/Badge"
import { SITE_CONTENT } from "../../data/siteContent"
import { Flame, AlertTriangle, Scale } from "lucide-react"

export function ProblemSection() {
  const { problem } = SITE_CONTENT

  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Flame className="w-5 h-5 text-amber-600" />
      case 1:
        return <AlertTriangle className="w-5 h-5 text-rose-600" />
      case 2:
      default:
        return <Scale className="w-5 h-5 text-stone-700" />
    }
  }

  return (
    <section
      id="problem"
      className="py-24 bg-[#F8F7F4] border-b border-stone-200 scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Architectural Plate Header */}
        <PlateHeader
          number="01"
          title="The Engineering Dilemma"
          metaRight="Blind Grid Paradox"
          tone="light"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-stone-950 uppercase tracking-tight">
            {problem.heading}
          </h2>
          <p className="font-sans text-stone-700 text-base sm:text-lg leading-relaxed">
            {problem.subheading}
          </p>
        </div>

        {/* 3 Comparison Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problem.cards.map((card, idx) => (
            <div
              key={card.number}
              className="bg-white border border-stone-300/90 p-6 sm:p-8 flex flex-col justify-between hover:border-stone-900 transition-colors shadow-xs group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <span className="font-mono text-xs font-bold text-stone-400 group-hover:text-stone-900 transition-colors">
                    {card.number}
                  </span>
                  <Badge
                    variant={idx === 0 ? "amber" : idx === 1 ? "clay" : "slate"}
                  >
                    {card.badge}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-stone-100 border border-stone-200">
                    {getIcon(idx)}
                  </div>
                  <h3 className="font-sans font-bold text-lg text-stone-950 tracking-tight">
                    {card.title}
                  </h3>
                </div>

                <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-100 font-mono text-xs flex items-center justify-between text-stone-800">
                <span className="text-[10px] uppercase text-stone-400 tracking-wider">
                  Direct Impact:
                </span>
                <span className="font-bold text-stone-900 text-right">
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

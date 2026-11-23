import { useState } from "react"
import { PlateHeader } from "../ui/PlateHeader"
import { SITE_CONTENT } from "../../data/siteContent"
import { ChevronDown, Cpu, FileCheck2, Globe2, Lock } from "lucide-react"

export function TechnicalTrustSection() {
  const { trust, faq } = SITE_CONTENT
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const getPillarIcon = (index: number) => {
    switch (index) {
      case 0:
        return <FileCheck2 className="w-5 h-5 text-[#171814]" />
      case 1:
        return <Globe2 className="w-5 h-5 text-[#171814]" />
      case 2:
        return <Cpu className="w-5 h-5 text-[#627056]" />
      case 3:
      default:
        return <Lock className="w-5 h-5 text-[#171814]" />
    }
  }

  return (
    <section
      id="trust"
      className="py-24 bg-[#f4f2ec] border-b border-[#171814]/15 scroll-mt-12"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Plate Header */}
        <PlateHeader
          number="06"
          title="Standards and data privacy"
          metaRight="Statutory compliance"
          tone="light"
        />

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#171814] uppercase tracking-[-0.035em] leading-[0.92]">
            {trust.heading}
          </h2>
          <p className="font-sans text-[#5c5f55] text-base sm:text-lg leading-relaxed">
            {trust.subheading}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {trust.badges.map((badge, idx) => (
            <div
              key={badge.title}
              className="bg-[#f8f7f4] border border-[#171814]/15 p-6 space-y-3 shadow-xs"
            >
              <div className="p-2.5 bg-[#dedacd]/40 border border-[#171814]/10 w-fit">
                {getPillarIcon(idx)}
              </div>
              <h3 className="font-sans font-bold text-base text-[#171814] tracking-tight">
                {badge.title}
              </h3>
              <p className="font-sans text-xs text-[#5c5f55] leading-relaxed">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Technical FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-8 space-y-1">
            <span className="font-mono text-xs uppercase tracking-widest text-[#5c5f55] font-bold">
              Frequently asked questions
            </span>
            <h3 className="font-sans font-black text-2xl text-[#171814] uppercase">
              Common technical questions
            </h3>
          </div>

          <div className="divide-y divide-[#171814]/15 border-y border-[#171814]/15">
            {faq.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={item.q} className="py-4">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-mono text-xs sm:text-sm font-bold text-[#171814] hover:text-[#845942] transition-colors cursor-pointer py-1 min-h-[44px]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[#845942] font-mono text-xs tabular-nums">
                        0{idx + 1}
                      </span>
                      <span>{item.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5c5f55] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#171814]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-3 pl-8 pr-4 font-sans text-xs sm:text-sm text-[#5c5f55] leading-relaxed animate-in fade-in-50 duration-150">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

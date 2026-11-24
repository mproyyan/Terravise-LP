import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SITE_CONTENT } from "../../data/siteContent"
import { ChevronDown, FileText } from "lucide-react"

export function TechnicalFaqSection() {
  const { faq } = SITE_CONTENT
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <section
      id="faq"
      aria-label="Technical engineering dossier FAQ"
      className="py-20 lg:py-28 bg-[#FBF7F2] text-[#1C130D] border-b border-[#1C130D]/15 relative overflow-hidden select-none"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#1C130D]/15 gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#7A421D] font-bold block">
                09 / Technical engineering dossier
              </span>
              <h3 className="font-sans font-black text-2xl sm:text-3xl text-[#1C130D] uppercase tracking-tight mt-1 text-balance">
                Common technical questions
              </h3>
            </div>
            <span className="font-mono text-[11px] text-[#63554B] flex items-center gap-1.5 tabular-nums">
              <FileText className="w-3.5 h-3.5 text-[#7A421D]" />
              4 Reference specifications
            </span>
          </div>

          {/* Accordion List */}
          <div className="divide-y divide-[#1C130D]/15 border-b border-[#1C130D]/15 bg-[#FAF5EE] border-x border-t shadow-sm">
            {faq.map((item, idx) => {
              const isOpen = openFaq === idx
              const contentId = `faq-item-content-${idx}`
              return (
                <div
                  key={item.q}
                  className={`relative transition-colors ${
                    isOpen ? "bg-white" : "hover:bg-[#EFE7DE]/40"
                  }`}
                >
                  {isOpen && (
                    <motion.div
                      layoutId="faq-active-bar"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#5A3008]"
                    />
                  )}

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-mono text-xs sm:text-sm font-bold text-[#1C130D] hover:text-[#7A421D] transition-colors cursor-pointer px-6 py-5 min-h-[56px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008] focus-visible:ring-inset"
                  >
                    <span className="flex items-center gap-3.5">
                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 tabular-nums border ${
                          isOpen
                            ? "bg-[#5A3008] text-[#FAD9BA] border-[#5A3008]"
                            : "bg-[#EFE7DE] text-[#7A421D] border-[#1C130D]/15"
                        }`}
                      >
                        DOC-0{idx + 1}
                      </span>
                      <span className="font-sans font-bold text-sm sm:text-base text-[#1C130D]">
                        {item.q}
                      </span>
                    </span>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="shrink-0 w-7 h-7 bg-[#EFE7DE] border border-[#1C130D]/15 flex items-center justify-center"
                    >
                      <ChevronDown className="w-4 h-4 text-[#1C130D]" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={contentId}
                        role="region"
                        aria-label={item.q}
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-1 pl-[5.5rem] pr-8 font-sans text-xs sm:text-sm text-[#63554B] leading-relaxed border-t border-[#1C130D]/5 text-pretty">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

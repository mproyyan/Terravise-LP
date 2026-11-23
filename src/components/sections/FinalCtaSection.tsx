import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { ArrowRight, CheckCircle, ShieldCheck, FileSpreadsheet } from "lucide-react"

interface FinalCtaSectionProps {
  onRequestPilot: () => void
  onDownloadTemplate: () => void
}

export function FinalCtaSection({
  onRequestPilot,
  onDownloadTemplate,
}: FinalCtaSectionProps) {
  return (
    <section className="py-24 bg-[#171814] text-[#e8e5da] border-b border-[#e8e5da]/15 relative overflow-hidden select-none">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="emerald" className="font-mono text-[10px] py-1 px-3">
            <span className="w-1.5 h-1.5 rounded-none bg-[#7c8c6c] inline-block mr-1.5" />
            Field system ready
          </Badge>

          <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-[-0.04em] text-[#e8e5da] leading-[0.92]">
            Select sounding coordinates with mathematical certainty
          </h2>

          <p className="font-sans text-[#e8e5da]/70 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Eliminate blind grid exploration. Equip active CPT rigs with
            reinforcement learning guidance and statutory ground certainty stopping criteria.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="emerald"
              size="lg"
              onClick={onRequestPilot}
              className="text-white group"
            >
              <span>Request pilot access</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="dark"
              size="lg"
              onClick={onDownloadTemplate}
              className="text-[#e8e5da] hover:text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-[#7c8c6c]" />
              <span>Download CPT template (.csv)</span>
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#e8e5da]/50 border-t border-[#e8e5da]/15 mt-10">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#7c8c6c]" />
              No hardware changes required
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7c8c6c]" />
              100% on-device neural processing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#7c8c6c]" />
              Standard ASTM D5778 compliance
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

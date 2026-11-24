import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { ArrowRight, CheckCircle, ShieldCheck, FileSpreadsheet } from "lucide-react"

interface FinalCtaSectionProps {
  onOpenAppStore: () => void
  onDownloadTemplate: () => void
}

export function FinalCtaSection({
  onOpenAppStore,
  onDownloadTemplate,
}: FinalCtaSectionProps) {
  return (
    <section
      aria-label="Call to action"
      className="py-24 bg-[#1C130D] text-[#EFE7DE] border-b border-[#EFE7DE]/15 relative overflow-hidden select-none"
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="emerald" className="font-mono text-[10px] py-1 px-3">
            <span className="w-1.5 h-1.5 rounded-none bg-[#FAD9BA] inline-block mr-1.5" />
            iPadOS field release
          </Badge>

          <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-[-0.04em] text-[#EFE7DE] leading-[0.92] text-balance">
            Select sounding coordinates with mathematical certainty
          </h2>

          <p className="font-sans text-[#EFE7DE]/70 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed text-pretty">
            Eliminate blind grid exploration. Equip active CPT rigs with
            reinforcement learning guidance and on-device foundation bearing layer analysis.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="emerald"
              size="lg"
              onClick={onOpenAppStore}
              aria-label="Download Terravise on the App Store"
              className="group flex items-center gap-2"
            >
              <span>Download on the App Store</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="dark"
              size="lg"
              onClick={onDownloadTemplate}
              aria-label="Download sample CPT CSV dataset"
              className="text-[#EFE7DE] hover:text-white flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#FAD9BA]" />
              <span>Download sample CPT file (.csv)</span>
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#EFE7DE]/50 border-t border-[#EFE7DE]/15 mt-10">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#FAD9BA]" />
              No hardware changes required
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FAD9BA]" />
              100% on-device neural processing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#FAD9BA]" />
              Compatible with standard CPT rigs
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

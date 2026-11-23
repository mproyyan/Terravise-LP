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
    <section className="py-24 bg-[#121514] text-[#E8E5DA] border-b border-stone-800 relative overflow-hidden select-none">
      {/* Background Architectural Grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="emerald" className="font-mono text-[11px] py-1 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1" />
            Active Field Deployment
          </Badge>

          <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-stone-100 leading-[0.94]">
            Your Next Sounding Starts With Mathematical Certainty.
          </h2>

          <p className="font-sans text-stone-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Eliminate blind grid drilling. Equip your CPT exploration rigs with
            real-time reinforcement learning and statutory Ground Certainty stopping criteria.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="emerald"
              size="lg"
              onClick={onRequestPilot}
              className="text-white group"
            >
              <span>Request Field Pilot Access</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="dark"
              size="lg"
              onClick={onDownloadTemplate}
              className="text-stone-300 hover:text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-400" />
              <span>Download CPT Field Template (.xlsx)</span>
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-stone-400 border-t border-stone-800/80 mt-10">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Zero Hardware Changes Required
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% On-Device Neural Processing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Compatible with Any Standard CPT Rig
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

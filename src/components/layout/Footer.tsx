import { Compass, HardHat, FileText, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#121514] text-[#E8E5DA] border-t border-stone-800 pt-16 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-stone-800/80">
          {/* Brand & Identity */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-stone-100 text-stone-900 flex items-center justify-center font-mono font-black text-sm">
                TV
              </div>
              <span className="font-sans font-black tracking-tight text-xl text-stone-100">
                TERRAVISE
              </span>
            </div>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed font-sans">
              Intelligent, on-device geotechnical site investigation copilot.
              Replacing blind uniform drilling schedules with reinforcement
              learning exploration and defensible stopping criteria.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-stone-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-500" />
                Datum: DGN95 / UTM 48S
              </span>
              <span>•</span>
              <span>Release V4.6.2</span>
            </div>
          </div>

          {/* Quick Technical Jump */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-stone-400 block font-semibold">
              Platform Architecture
            </span>
            <ul className="space-y-2 text-xs font-mono text-stone-400">
              <li>
                <a href="#problem" className="hover:text-amber-400 transition-colors">
                  01 // The Blind Grid Dilemma
                </a>
              </li>
              <li>
                <a href="#dqn" className="hover:text-amber-400 transition-colors">
                  02 // DQN Active Policy
                </a>
              </li>
              <li>
                <a href="#stop" className="hover:text-amber-400 transition-colors">
                  03 // Ground Certainty Metric
                </a>
              </li>
              <li>
                <a href="#voxel" className="hover:text-amber-400 transition-colors">
                  04 // 3D Voxel Strata Slicing
                </a>
              </li>
              <li>
                <a href="#stratum" className="hover:text-amber-400 transition-colors">
                  05 // Bearing Pile Verification
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-amber-400 transition-colors">
                  06 // Field Rig Workflow
                </a>
              </li>
            </ul>
          </div>

          {/* Statutory & Standards */}
          <div className="md:col-span-4 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-stone-400 block font-semibold">
              Standards & Integrity
            </span>
            <ul className="space-y-2.5 text-xs text-stone-400 font-sans">
              <li className="flex items-start gap-2">
                <HardHat className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <strong>ASTM D5778:</strong> Standard Test Method for Electronic
                  Friction Cone & Piezocone Penetration Testing of Soils.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <strong>SNI 8460:2017:</strong> Persyaratan perancangan geoteknik
                  Indonesia untuk fondasi tiang dan stabilitas tanah.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  <strong>Robertson SBT (1990/2010):</strong> Automated Soil
                  Behavior Type Index computation from normalized cone parameters.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-8 pt-6 border-t border-stone-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <p className="max-w-3xl leading-relaxed text-[11px]">
            <strong className="text-stone-400">ENGINEERING DISCLAIMER:</strong> Terravise is an advanced engineering
            decision-support tool designed to assist licensed geotechnical professionals.
            Recommendations, spatial uncertainty assessments, and stopping criteria supplement—but do not replace—professional
            engineering judgment, local statutory building codes, or mandatory geological investigation standards.
          </p>
          <div className="shrink-0 text-[11px] text-stone-500">
            © {new Date().getFullYear()} Terravise Technologies. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

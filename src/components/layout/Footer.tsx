import { Compass, HardHat, FileText, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#171814] text-[#e8e5da] border-t border-[#e8e5da]/15 pt-16 pb-12 select-none">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#e8e5da]/15">
          {/* Brand & Identity */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#e8e5da] text-[#171814] flex items-center justify-center font-mono font-black text-xs">
                TV
              </div>
              <span className="font-sans font-black tracking-tight text-xl text-[#e8e5da] uppercase">
                TERRAVISE
              </span>
            </div>
            <p className="text-[#e8e5da]/70 text-xs sm:text-sm max-w-sm leading-relaxed font-sans">
              Native iPadOS geotechnical investigation system. Directs CPT sounding
              locations using on-device reinforcement learning and verified foundation bearing layer analysis.
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-[#e8e5da]/40 pt-2">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#7c8c6c]" />
                Datum: DGN95, UTM 48S
              </span>
              <span>•</span>
              <span>Release 4.6.2</span>
            </div>
          </div>

          {/* Quick Technical Jump */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#b78c75] block font-bold">
              Investigation stages
            </span>
            <ul className="space-y-2 text-xs font-mono text-[#e8e5da]/60">
              <li>
                <a href="#problem" className="hover:text-[#e8e5da] transition-colors py-1 block">
                  01. Fixed grid limits
                </a>
              </li>
              <li>
                <a href="#dqn" className="hover:text-[#e8e5da] transition-colors py-1 block">
                  02. DQN coordinate selection
                </a>
              </li>
              <li>
                <a href="#voxel" className="hover:text-[#e8e5da] transition-colors py-1 block">
                  03. 3D soil volume inspection
                </a>
              </li>
              <li>
                <a href="#stratum" className="hover:text-[#e8e5da] transition-colors py-1 block">
                  04. Bearing stratum criteria
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-[#e8e5da] transition-colors py-1 block">
                  05. iPadOS app workflow
                </a>
              </li>
            </ul>
          </div>

          {/* Standards */}
          <div className="md:col-span-4 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#b78c75] block font-bold">
              Test standards and codes
            </span>
            <ul className="space-y-3 text-xs text-[#e8e5da]/70 font-sans">
              <li className="flex items-start gap-2">
                <HardHat className="w-4 h-4 text-[#dedacd] mt-0.5 shrink-0" />
                <span>
                  <strong>ASTM D5778.</strong> Standard test method for electronic
                  friction cone and piezocone penetration testing of soils.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#dedacd] mt-0.5 shrink-0" />
                <span>
                  <strong>SNI 8460:2017.</strong> Indonesian geotechnical design standard
                  for deep pile foundations and soil stability.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-[#7c8c6c] mt-0.5 shrink-0" />
                <span>
                  <strong>Robertson SBT (1990/2010).</strong> Automated soil
                  behavior type index calculation from normalized cone parameters.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-8 pt-6 border-t border-[#e8e5da]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono text-[#e8e5da]/50">
          <p className="max-w-3xl leading-relaxed text-[10px]">
            ENGINEERING NOTICE: Terravise supports licensed geotechnical engineers with computational analysis.
            Calculations, uncertainty ranges, and stopping metrics support but do not replace professional
            engineering judgment, local statutory building codes, or mandatory geological investigation standards.
          </p>
          <div className="shrink-0 text-[10px]">
            © {new Date().getFullYear()} Terravise Technologies. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

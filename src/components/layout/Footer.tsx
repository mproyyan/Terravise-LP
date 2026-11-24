import { Compass, HardHat, FileText, ExternalLink } from "lucide-react"
import logoImg from "../../assets/terravise-logo.png"

export function Footer() {
  return (
    <footer className="bg-[#1C130D] text-[#EFE7DE] border-t border-[#EFE7DE]/15 pt-16 pb-12 select-none">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#EFE7DE]/15">
          {/* Brand & Identity */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="Terravise logo"
                className="w-8 h-8 object-contain shrink-0 rounded-xs"
              />
              <span className="font-sans font-black tracking-tight text-xl text-[#EFE7DE] uppercase">
                TERRAVISE
              </span>
            </div>
            <p className="text-[#EFE7DE]/70 text-xs sm:text-sm max-w-sm leading-relaxed font-sans text-pretty">
              Native iPadOS geotechnical investigation system. Directs CPT sounding
              locations using on-device reinforcement learning and verified foundation bearing layer analysis.
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-[#EFE7DE]/40 pt-2">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#BD8564]" />
                Datum: DGN95, UTM 48S
              </span>
              <span>·</span>
              <span className="tabular-nums">Release 4.6.2</span>
            </div>
          </div>

          {/* Quick Technical Jump */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#BD8564] block font-bold">
              Investigation stages
            </span>
            <ul className="space-y-2 text-xs font-mono text-[#EFE7DE]/60">
              <li>
                <a
                  href="#problem"
                  className="hover:text-[#EFE7DE] transition-colors py-1 block focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA]"
                >
                  01. Fixed Grid Limits
                </a>
              </li>
              <li>
                <a
                  href="#dqn"
                  className="hover:text-[#EFE7DE] transition-colors py-1 block focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA]"
                >
                  02. DQN Coordinate Selection
                </a>
              </li>
              <li>
                <a
                  href="#voxel"
                  className="hover:text-[#EFE7DE] transition-colors py-1 block focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA]"
                >
                  03. 3D Soil Volume Inspection
                </a>
              </li>
              <li>
                <a
                  href="#stratum"
                  className="hover:text-[#EFE7DE] transition-colors py-1 block focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA]"
                >
                  04. Bearing Stratum Criteria
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="hover:text-[#EFE7DE] transition-colors py-1 block focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA]"
                >
                  05. iPadOS App Workflow
                </a>
              </li>
            </ul>
          </div>

          {/* Standards */}
          <div className="md:col-span-4 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#BD8564] block font-bold">
              Test standards and codes
            </span>
            <ul className="space-y-3 text-xs text-[#EFE7DE]/70 font-sans">
              <li className="flex items-start gap-2">
                <HardHat className="w-4 h-4 text-[#E3D7C8] mt-0.5 shrink-0" />
                <span>
                  <strong className="text-[#EFE7DE]">ASTM D5778.</strong> Standard test method for electronic
                  friction cone and piezocone penetration testing of soils.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#E3D7C8] mt-0.5 shrink-0" />
                <span>
                  <strong className="text-[#EFE7DE]">SNI 8460:2017.</strong> Indonesian geotechnical design standard
                  for deep pile foundations and soil stability.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-[#BD8564] mt-0.5 shrink-0" />
                <span>
                  <strong className="text-[#EFE7DE]">Robertson SBTn (1990/2010).</strong> Automated soil
                  behavior type index calculation from normalized cone parameters.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-8 pt-6 border-t border-[#EFE7DE]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono text-[#EFE7DE]/50">
          <p className="max-w-3xl leading-relaxed text-[10px] text-pretty">
            ENGINEERING NOTICE: Terravise supports licensed geotechnical engineers with computational analysis.
            Calculations, uncertainty distributions, and stopping criteria support but do not replace professional
            engineering judgment, local statutory building codes, or mandatory geological investigation standards.
          </p>
          <div className="shrink-0 text-[10px] tabular-nums">
            © {new Date().getFullYear()} Terravise Technologies. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

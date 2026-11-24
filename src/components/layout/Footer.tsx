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
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-8 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono text-[#EFE7DE]/50">
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

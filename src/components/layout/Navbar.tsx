import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Compass, ShieldCheck } from "lucide-react"

interface NavbarProps {
  onRequestPilot: () => void
}

export function Navbar({ onRequestPilot }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 select-none ${
        scrolled
          ? "bg-[#f4f2ec]/95 backdrop-blur-md border-b border-[#171814]/15 py-3 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
        {/* Brand & Coordinate Tag */}
        <div className="flex items-center gap-3">
          <a
            href="#hero"
            aria-label="Terravise home"
            className="flex items-center gap-3 group min-h-[44px] min-w-[44px]"
          >
            <div className="w-8 h-8 rounded-none bg-[#171814] text-[#e8e5da] flex items-center justify-center font-mono font-bold text-xs tracking-tight border border-[#171814] group-hover:bg-[#627056] transition-colors">
              TV
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-black tracking-tighter text-[#171814] text-base leading-none uppercase">
                TERRAVISE
              </span>
              <span className="font-mono text-[9px] text-[#5c5f55] tracking-[0.16em] uppercase mt-0.5">
                GEOTECHNICAL FIELD SYSTEM
              </span>
            </div>
          </a>

          <div className="hidden xl:flex items-center ml-4 pl-4 border-l border-[#171814]/15 gap-2 text-xs font-mono text-[#5c5f55]">
            <Compass className="w-3.5 h-3.5 text-[#627056]" />
            <span className="text-[10px] tracking-wider uppercase">
              UTM 48S. 704120m E, 9309850m N
            </span>
          </div>
        </div>

        {/* Navigation Anchors */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.14em] uppercase text-[#5c5f55]"
        >
          <a
            href="#problem"
            className="hover:text-[#171814] transition-colors py-2 min-h-[44px] flex items-center"
          >
            01. Limits
          </a>
          <a
            href="#dqn"
            className="hover:text-[#171814] transition-colors py-2 min-h-[44px] flex items-center"
          >
            02. DQN policy
          </a>
          <a
            href="#voxel"
            className="hover:text-[#171814] transition-colors py-2 min-h-[44px] flex items-center"
          >
            03. 3D volume
          </a>
          <a
            href="#stratum"
            className="hover:text-[#171814] transition-colors py-2 min-h-[44px] flex items-center"
          >
            04. Bearing layer
          </a>
          <a
            href="#workflow"
            className="hover:text-[#171814] transition-colors py-2 min-h-[44px] flex items-center"
          >
            05. Field sequence
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#dedacd]/50 border border-[#171814]/15 font-mono text-[10px] text-[#5c5f55]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#627056]" />
            <span>M4 Neural engine</span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={onRequestPilot}
            className="font-mono text-xs tracking-wider"
          >
            Request pilot access
          </Button>
        </div>
      </div>
    </header>
  )
}

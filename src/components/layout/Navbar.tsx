import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Compass, ShieldCheck, Download } from "lucide-react"
import { SITE_CONTENT } from "../../data/siteContent"
import logoImg from "../../assets/terravise-logo.png"

interface NavbarProps {
  onOpenAppStore?: () => void
}

export function Navbar({ onOpenAppStore }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleCtaClick = () => {
    if (onOpenAppStore) {
      onOpenAppStore()
    } else {
      window.open(SITE_CONTENT.hero.appStoreUrl, "_blank")
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 select-none ${
        scrolled
          ? "bg-[#FBF7F2]/95 backdrop-blur-md border-b border-[#1C130D]/15 py-3 shadow-xs"
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
            <img
              src={logoImg}
              alt="Terravise logo"
              className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-sans font-black tracking-tighter text-[#1C130D] text-base leading-none uppercase">
                TERRAVISE
              </span>
              <span className="font-mono text-[9px] text-[#63554B] tracking-[0.16em] uppercase mt-0.5">
                GEOTECHNICAL FIELD SYSTEM
              </span>
            </div>
          </a>

          <div className="hidden xl:flex items-center ml-4 pl-4 border-l border-[#1C130D]/15 gap-2 text-xs font-mono text-[#63554B]">
            <Compass className="w-3.5 h-3.5 text-[#7A421D]" />
            <span className="text-[10px] tracking-wider uppercase">
              UTM 48S. 704120m E, 9309850m N
            </span>
          </div>
        </div>

        {/* Navigation Anchors */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.14em] uppercase text-[#63554B]"
        >
          <a
            href="#problem"
            className="hover:text-[#1C130D] transition-colors py-2 min-h-[44px] flex items-center"
          >
            01. Limits
          </a>
          <a
            href="#dqn"
            className="hover:text-[#1C130D] transition-colors py-2 min-h-[44px] flex items-center"
          >
            02. DQN policy
          </a>
          <a
            href="#voxel"
            className="hover:text-[#1C130D] transition-colors py-2 min-h-[44px] flex items-center"
          >
            03. 3D volume
          </a>
          <a
            href="#stratum"
            className="hover:text-[#1C130D] transition-colors py-2 min-h-[44px] flex items-center"
          >
            04. Bearing layer
          </a>
          <a
            href="#workflow"
            className="hover:text-[#1C130D] transition-colors py-2 min-h-[44px] flex items-center"
          >
            05. App workflow
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#E3D7C8]/50 border border-[#1C130D]/15 font-mono text-[10px] text-[#63554B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7A421D]" />
            <span>iPadOS M-series</span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={handleCtaClick}
            className="font-mono text-xs tracking-wider flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>App Store</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

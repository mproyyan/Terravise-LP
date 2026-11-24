import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Download, MessageSquare } from "lucide-react"
import { SITE_CONTENT } from "../../data/siteContent"
import logoImg from "../../assets/terravise-logo.png"

interface NavbarProps {
  onOpenAppStore?: () => void
  onNavigateToFeedback?: () => void
}

export function Navbar({ onOpenAppStore, onNavigateToFeedback }: NavbarProps) {
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
      window.open(SITE_CONTENT.hero.appStoreUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <>
      {/* Skip to Main Content Link for Keyboard Accessibility (Web Interface Guidelines) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[#1C130D] text-[#FAD9BA] px-4 py-2 font-mono text-xs border border-[#FAD9BA] shadow-xl focus:outline-hidden focus:ring-2 focus:ring-[#FAD9BA]"
      >
        Skip to main content
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 select-none ${
          scrolled
            ? "bg-[#FBF7F2]/95 backdrop-blur-md border-b border-[#1C130D]/15 py-3 shadow-xs"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          {/* Brand */}
          <a
            href="#hero"
            aria-label="Terravise Geotechnical Field System Home"
            className="flex items-center gap-3 group min-h-[44px] min-w-[44px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5A3008]"
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
              <span className="font-mono text-[9px] text-[#63554B] tracking-[0.16em] uppercase mt-0.5 hidden sm:block">
                GEOTECHNICAL FIELD SYSTEM
              </span>
            </div>
          </a>

          {/* Actions: Feedback & App Store */}
          <div className="flex items-center gap-2.5">
            {onNavigateToFeedback && (
              <button
                type="button"
                onClick={onNavigateToFeedback}
                aria-label="Buka halaman formulir feedback"
                className="font-mono text-xs tracking-wider flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF5EE] border border-[#1C130D]/20 hover:border-[#7A421D] text-[#1C130D] transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#7A421D]" />
                <span className="hidden sm:inline">Feedback</span>
              </button>
            )}

            <Button
              size="sm"
              variant="primary"
              onClick={handleCtaClick}
              aria-label="Download Terravise on App Store"
              className="font-mono text-xs tracking-wider flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>App Store</span>
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}

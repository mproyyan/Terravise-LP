import React, { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Compass, ShieldCheck } from "lucide-react"

interface NavbarProps {
  onRequestPilot: () => void
}

export function Navbar({ onRequestPilot }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 select-none ${
        scrolled
          ? "bg-[#F8F7F4]/90 backdrop-blur-md border-b border-stone-200/80 py-3 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand & Coordinate Tag */}
        <div className="flex items-center gap-3">
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-none bg-stone-900 text-stone-100 flex items-center justify-center font-mono font-bold text-sm tracking-tighter border border-stone-800 group-hover:bg-[#1C3127] transition-colors">
              TV
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-black tracking-tight text-stone-950 text-base leading-none">
                TERRAVISE
              </span>
              <span className="font-mono text-[10px] text-stone-500 tracking-widest uppercase mt-0.5">
                GEOTECHNICAL COPILOT
              </span>
            </div>
          </a>

          <div className="hidden xl:flex items-center ml-4 pl-4 border-l border-stone-300 gap-2">
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-stone-500">
              <Compass className="w-2.5 h-2.5 mr-1 text-emerald-600" />
              UTM 48S
            </Badge>
            <span className="font-mono text-[10px] text-stone-400">
              E 704120 • N 9309850
            </span>
          </div>
        </div>

        {/* Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs tracking-wider uppercase text-stone-600">
          <a
            href="#problem"
            className="hover:text-stone-950 transition-colors py-1"
          >
            The Dilemma
          </a>
          <a
            href="#dqn"
            className="hover:text-stone-950 transition-colors py-1"
          >
            DQN Policy
          </a>
          <a
            href="#voxel"
            className="hover:text-stone-950 transition-colors py-1"
          >
            3D Voxel
          </a>
          <a
            href="#stratum"
            className="hover:text-stone-950 transition-colors py-1"
          >
            Bearing Strata
          </a>
          <a
            href="#workflow"
            className="hover:text-stone-950 transition-colors py-1"
          >
            Workflow
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-stone-200/50 border border-stone-300/60 font-mono text-[10px] text-stone-600">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>M4 Neural Ready</span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={onRequestPilot}
            className="font-mono"
          >
            Request Pilot Access
          </Button>
        </div>
      </div>
    </header>
  )
}

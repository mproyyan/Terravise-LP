import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { PlateHeader } from "../ui/PlateHeader"
import { SITE_CONTENT } from "../../data/siteContent"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Cpu,
  Radio,
  Layers,
  Crosshair,
} from "lucide-react"

export function AppDemoSection() {
  const { appDemo } = SITE_CONTENT
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0)
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0)
  const TOTAL_DURATION_SEC = 270 // 4 mins 30 secs
  const timerRef = useRef<number | null>(null)

  // Auto-advance simulated playback timer when isPlaying is true
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= TOTAL_DURATION_SEC) {
            setIsPlaying(false)
            return 0
          }
          const next = prev + 1
          // Sync active chapter index based on time
          for (let i = appDemo.chapters.length - 1; i >= 0; i--) {
            if (next >= appDemo.chapters[i].seconds) {
              setActiveChapterIndex(i)
              break
            }
          }
          return next
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, appDemo.chapters])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (seconds: number, index: number) => {
    setCurrentTimeSec(seconds)
    setActiveChapterIndex(index)
    setIsPlaying(true)
  }

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentChapter = appDemo.chapters[activeChapterIndex]
  const progressRatio = currentTimeSec / TOTAL_DURATION_SEC

  return (
    <section
      id="app-demo"
      aria-label="Application live demo walkthrough"
      className="py-20 lg:py-28 bg-[#160E08] text-[#EFE7DE] border-b border-[#EFE7DE]/15 relative overflow-hidden select-none"
    >
      {/* Background Geotechnical Grid and Ambient Warm Radial Halo */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #FAD9BA 1px, transparent 1px), linear-gradient(to bottom, #FAD9BA 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#BD8564]/10 rounded-full blur-[140px] pointer-events-none"
      />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 space-y-10 lg:space-y-12">
        {/* Full-Width Section Header (No 50:50 Split) */}
        <div>
          <PlateHeader
            number="07"
            title="Application live walkthrough"
            metaRight="Field execution video demo"
            tone="dark"
            className="mb-6 sm:mb-8"
          />
          <div className="max-w-4xl space-y-3">
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-[#EFE7DE] uppercase tracking-[-0.035em] leading-[0.92] text-balance">
              {appDemo.heading}
            </h2>
            <p className="font-sans text-[#EFE7DE]/70 text-sm sm:text-base max-w-3xl leading-relaxed text-pretty">
              {appDemo.subheading}
            </p>
          </div>
        </div>

        {/* =========================================================================
            CINEMATIC THEATER VIEWPORT: WIDE IPADOS FIELD RIG HARDWARE FRAME
           ========================================================================= */}
        <div className="max-w-5xl mx-auto border border-[#EFE7DE]/20 bg-[#120B07] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top Hardware Telemetry Bar */}
          <div className="bg-[#1C130D] border-b border-[#EFE7DE]/15 px-3 sm:px-5 py-2 flex items-center justify-between font-mono text-[10px] text-[#EFE7DE]/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#FAD9BA]">
                <Radio className={`w-3 h-3 ${isPlaying ? "text-[#10B981] animate-pulse" : "text-[#BD8564]"}`} />
                <span className="font-bold">LIVE RIG CONSOLE</span>
              </span>
              <span className="hidden sm:inline text-[#EFE7DE]/40">·</span>
              <span className="hidden sm:inline">UTM Zone 48S Locked</span>
            </div>

            <div className="text-center font-bold text-[#EFE7DE]/80 hidden md:block">
              TERRAVISE CPT3D-67 ON-DEVICE PIPELINE
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[#10B981]">
                <Cpu className="w-3 h-3 text-[#10B981]" />
                <span>100% Offline (Core ML)</span>
              </span>
              <span className="text-[9px] bg-[#271C14] border border-[#EFE7DE]/15 px-1.5 py-0.5 text-[#FAD9BA]">
                14 ms
              </span>
            </div>
          </div>

          {/* Interactive Cinematic Screen Area (16:9 / 16:10 Ratio) */}
          <div className="relative aspect-16/10 sm:aspect-16/9 bg-[#0E0704] overflow-hidden flex flex-col justify-between p-4 sm:p-6 group">
            {/* Ambient Screen Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#FAD9BA 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Top In-Video Telemetry HUD Overlays */}
            <div className="relative z-10 flex items-start justify-between gap-4 pointer-events-none">
              {/* Top-Left: Active Operational Step Badge */}
              <div className="bg-[#150E09]/90 border border-[#FAD9BA]/30 p-2 sm:p-2.5 backdrop-blur-md font-mono text-[9px] sm:text-[10px] space-y-0.5">
                <span className="text-[#BD8564] font-bold block uppercase tracking-wider">
                  ACTIVE CHAPTER
                </span>
                <span className="text-[#FAD9BA] font-bold block text-xs">
                  {currentChapter.title}
                </span>
                <span className="text-[#EFE7DE]/60 block text-[9px] font-sans">
                  {currentChapter.desc}
                </span>
              </div>

              {/* Top-Right: Sounding Metrics Badge */}
              <div className="bg-[#150E09]/90 border border-[#EFE7DE]/20 p-2 sm:p-2.5 backdrop-blur-md font-mono text-[9px] sm:text-[10px] text-right space-y-0.5">
                <span className="text-[#10B981] font-bold flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  PROBE ADVANCING
                </span>
                <span className="text-[#EFE7DE] block tabular-nums">
                  Depth: <strong className="text-[#FAD9BA]">-16.2 m</strong> · qc: <strong className="text-[#FAD9BA]">18.4 MPa</strong>
                </span>
                <span className="text-[#EFE7DE]/60 block text-[8.5px]">
                  Robertson SBT: Zone 7 (Dense Sand)
                </span>
              </div>
            </div>

            {/* Center Area: High-Fidelity Geological Interface Simulation & Play Trigger */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-4">
              {/* Background Mock Application UI Layers */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <svg className="w-full h-full max-w-xl" viewBox="0 0 400 200">
                  {/* Site Boundary Outline */}
                  <polygon
                    points="50,25 350,15 375,170 65,185"
                    fill="none"
                    stroke="#FAD9BA"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                  />
                  {/* CPT Sounding Points */}
                  <circle cx="110" cy="65" r="4" fill="#BD8564" />
                  <circle cx="280" cy="55" r="4" fill="#BD8564" />
                  <circle cx="310" cy="140" r="4" fill="#BD8564" />

                  {/* Spot 2 Target Reticle */}
                  <g transform="translate(195, 105)">
                    <circle cx="0" cy="0" r="14" fill="#10B981" fillOpacity="0.25" className="animate-ping" />
                    <circle cx="0" cy="0" r="6" stroke="#10B981" strokeWidth="2" fill="none" />
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="#10B981" strokeWidth="1.2" />
                    <line x1="0" y1="-18" x2="0" y2="18" stroke="#10B981" strokeWidth="1.2" />
                  </g>
                </svg>
              </div>

              {/* Architectural Center Play / Pause Action Button */}
              <motion.button
                type="button"
                onClick={togglePlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isPlaying ? "Pause application walkthrough video" : "Play application walkthrough video"}
                className="relative z-20 group cursor-pointer flex flex-col items-center gap-3 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FAD9BA]"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1C130D]/85 border-2 border-[#FAD9BA] text-[#FAD9BA] shadow-[0_0_35px_rgba(250,217,186,0.3)] flex items-center justify-center transition-all group-hover:bg-[#5A3008] group-hover:border-[#EFE7DE]">
                  {isPlaying ? (
                    <Pause className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />
                  )}
                </div>
                <div className="bg-[#150E09]/90 border border-[#EFE7DE]/20 px-3 py-1 font-mono text-[10px] sm:text-xs font-bold text-[#FAD9BA] tracking-wider uppercase backdrop-blur-md">
                  {isPlaying ? "PAUSE LIVE WALKTHROUGH" : "WATCH 4-MIN LIVE WALKTHROUGH"}
                </div>
              </motion.button>
            </div>

            {/* Bottom In-Video Control Strip */}
            <div className="relative z-10 bg-[#150E09]/95 border border-[#EFE7DE]/20 p-2 sm:p-2.5 backdrop-blur-md flex flex-col gap-2 font-mono text-[10px]">
              {/* Scrubbing Timeline Bar */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Video timeline scrubber"
                aria-valuemin={0}
                aria-valuemax={TOTAL_DURATION_SEC}
                aria-valuenow={currentTimeSec}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                  const targetSec = Math.round(pct * TOTAL_DURATION_SEC)
                  for (let i = appDemo.chapters.length - 1; i >= 0; i--) {
                    if (targetSec >= appDemo.chapters[i].seconds) {
                      handleSeek(targetSec, i)
                      break
                    }
                  }
                }}
                className="relative h-2 bg-[#271C14] border border-[#EFE7DE]/15 cursor-pointer overflow-hidden group/bar"
              >
                {/* Active Progress Bar */}
                <div
                  className="h-full bg-gradient-to-r from-[#BD8564] via-[#FAD9BA] to-[#10B981] transition-all duration-150"
                  style={{ width: `${Math.round(progressRatio * 100)}%` }}
                />
                {/* Chapter Tick Marks */}
                {appDemo.chapters.map((ch) => {
                  const tickPct = (ch.seconds / TOTAL_DURATION_SEC) * 100
                  return (
                    <div
                      key={ch.time}
                      style={{ left: `${tickPct}%` }}
                      className="absolute top-0 bottom-0 w-[1px] bg-[#EFE7DE]/40 pointer-events-none"
                    />
                  )
                })}
              </div>

              {/* Controls Toolbar: Play/Pause, Timecode, Chapters, Audio, Fullscreen */}
              <div className="flex items-center justify-between text-[#EFE7DE]/70">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                    className="hover:text-[#FAD9BA] cursor-pointer transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(0, 0)}
                    aria-label="Restart video from beginning"
                    className="hover:text-[#FAD9BA] cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>

                  <span className="tabular-nums font-bold text-[#EFE7DE]">
                    {formatTime(currentTimeSec)} <span className="text-[#EFE7DE]/40">/ {formatTime(TOTAL_DURATION_SEC)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[9px]">
                  <span className="hidden sm:flex items-center gap-1.5 text-[#FAD9BA]">
                    <Crosshair className="w-3 h-3 text-[#10B981]" />
                    <span>DQN Policy Routing</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    aria-label={isMuted ? "Unmute commentary" : "Mute commentary"}
                    className="hover:text-[#FAD9BA] cursor-pointer transition-colors p-1"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  <span className="px-1.5 py-0.5 bg-[#271C14] border border-[#EFE7DE]/15 text-[#EFE7DE]/60 text-[8px] uppercase">
                    4K HDR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL INTERACTIVE CHAPTER JUMP CARDS (Directly Below Video, NOT 50:50)
           ========================================================================= */}
        <div className="max-w-5xl mx-auto space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-[#BD8564] border-b border-[#EFE7DE]/15 pb-2">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Demo Chapters · Click to Jump
            </span>
            <span className="text-[#EFE7DE]/50 text-[10px]">5 Stages · 04:30 Total</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {appDemo.chapters.map((chapter, idx) => {
              const isActive = activeChapterIndex === idx
              return (
                <button
                  key={chapter.time}
                  type="button"
                  onClick={() => handleSeek(chapter.seconds, idx)}
                  aria-label={`Jump demo video to ${chapter.title} at ${chapter.time}`}
                  className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] ${
                    isActive
                      ? "bg-[#271C14] border-[#FAD9BA] text-[#EFE7DE] shadow-md"
                      : "bg-[#1A110B] border-[#EFE7DE]/15 text-[#EFE7DE]/60 hover:border-[#EFE7DE]/30 hover:text-[#EFE7DE]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 tabular-nums ${
                        isActive
                          ? "bg-[#FAD9BA] text-[#1C130D]"
                          : "bg-[#251810] text-[#BD8564]"
                      }`}
                    >
                      {chapter.time}
                    </span>
                    <span className="text-[8px] text-[#EFE7DE]/40">CH 0{idx + 1}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-[11px] text-[#FAD9BA] tracking-tight leading-tight line-clamp-1">
                      {chapter.title}
                    </h4>
                    <p className="font-sans text-[9px] text-[#EFE7DE]/70 leading-relaxed line-clamp-2 mt-1">
                      {chapter.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* =========================================================================
            BOTTOM TAKEAWAYS RIBBON
           ========================================================================= */}
        <div className="max-w-5xl mx-auto pt-6 border-t border-[#EFE7DE]/15">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono text-[#EFE7DE]/80">
            {appDemo.takeaways.map((item) => (
              <div
                key={item}
                className="bg-[#1C130D] border border-[#EFE7DE]/10 p-2.5 flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span className="text-[10px] leading-tight text-pretty">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

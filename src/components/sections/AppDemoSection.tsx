import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Sparkles,
  Quote,
} from "lucide-react"

export function AppDemoSection() {
  const { appDemo } = SITE_CONTENT
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0)
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0)
  const TOTAL_DURATION_SEC = 240 // 4 mins total duration
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
          // Sync active scene index based on timecode seconds
          for (let i = appDemo.scenes.length - 1; i >= 0; i--) {
            if (next >= appDemo.scenes[i].seconds) {
              setActiveSceneIndex(i)
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
  }, [isPlaying, appDemo.scenes])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (seconds: number, index: number) => {
    setCurrentTimeSec(seconds)
    setActiveSceneIndex(index)
    setIsPlaying(true)
  }

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentScene = appDemo.scenes[activeSceneIndex]
  const progressRatio = currentTimeSec / TOTAL_DURATION_SEC

  return (
    <section
      id="app-demo"
      aria-label="Application video walkthrough and narrative demo"
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
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[450px] bg-[#BD8564]/10 rounded-full blur-[140px] pointer-events-none"
      />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 space-y-10 lg:space-y-12">
        {/* Full-Width Section Header (No 50:50 Split) */}
        <div>
          <PlateHeader
            number="07"
            title="Product film & demo"
            metaRight="Narrative storyboard & live walkthrough"
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
            CINEMATIC THEATER VIEWPORT: WIDE IPADOS FIELD RIG CONSOLE FRAME
           ========================================================================= */}
        <div className="max-w-5xl mx-auto border border-[#EFE7DE]/20 bg-[#120B07] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Top Hardware Telemetry Bar */}
          <div className="bg-[#1C130D] border-b border-[#EFE7DE]/15 px-3 sm:px-5 py-2 flex items-center justify-between font-mono text-[10px] text-[#EFE7DE]/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#FAD9BA]">
                <Radio className={`w-3 h-3 ${isPlaying ? "text-[#10B981] animate-pulse" : "text-[#BD8564]"}`} />
                <span className="font-bold">LIVE RIG SCREEN</span>
              </span>
              <span className="hidden sm:inline text-[#EFE7DE]/40">·</span>
              <span className="hidden sm:inline text-[#EFE7DE]/80">SCENE 0{activeSceneIndex + 1} OF 05</span>
            </div>

            <div className="text-center font-bold text-[#FAD9BA] tracking-wider hidden md:block">
              TERRAVISE CPT3D-67 ON-DEVICE PIPELINE
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[#10B981]">
                <Cpu className="w-3 h-3 text-[#10B981]" />
                <span className="hidden sm:inline">100% Offline (Core ML)</span>
              </span>
              <span className="text-[9px] bg-[#271C14] border border-[#EFE7DE]/15 px-1.5 py-0.5 text-[#FAD9BA] font-bold">
                UTM 48S
              </span>
            </div>
          </div>

          {/* Interactive Cinematic Screen Area (Aspect 16:9 / 16:10) */}
          <div className="relative aspect-16/11 sm:aspect-16/9 bg-[#0E0704] overflow-hidden flex flex-col justify-between p-4 sm:p-6 group">
            {/* Ambient Screen Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#FAD9BA 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Top In-Video Telemetry HUD Overlays */}
            <div className="relative z-10 flex items-start justify-between gap-4 pointer-events-none">
              {/* Top-Left: Active Operational Scene Badge */}
              <div className="bg-[#150E09]/90 border border-[#FAD9BA]/30 p-2 sm:p-2.5 backdrop-blur-md font-mono text-[9px] sm:text-[10px] space-y-0.5">
                <span className="text-[#BD8564] font-bold block uppercase tracking-wider">
                  SCENE {currentScene.sceneNumber} · {currentScene.time}
                </span>
                <span className="text-[#FAD9BA] font-bold block text-xs">
                  {currentScene.title}
                </span>
                <span className="text-[#EFE7DE]/60 block text-[9px] font-sans">
                  {currentScene.desc}
                </span>
              </div>

              {/* Top-Right: Dynamic Context-Specific Telemetry */}
              <div className="bg-[#150E09]/90 border border-[#EFE7DE]/20 p-2 sm:p-2.5 backdrop-blur-md font-mono text-[9px] sm:text-[10px] text-right space-y-0.5">
                {activeSceneIndex === 0 && (
                  <>
                    <span className="text-[#BD8564] font-bold block">STRUCTURAL TARGET</span>
                    <span className="text-[#EFE7DE] block">High-Rise Footprint</span>
                    <span className="text-[#EFE7DE]/60 block text-[8.5px]">Subsurface Unknown</span>
                  </>
                )}
                {activeSceneIndex === 1 && (
                  <>
                    <span className="text-[#10B981] font-bold flex items-center justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                      CPT ADVANCING
                    </span>
                    <span className="text-[#EFE7DE] block tabular-nums">
                      Depth: <strong className="text-[#FAD9BA]">-14.2 m</strong> · qc: <strong className="text-[#FAD9BA]">16.5 MPa</strong>
                    </span>
                    <span className="text-[#EFE7DE]/60 block text-[8.5px]">Point Sounding Active</span>
                  </>
                )}
                {activeSceneIndex === 2 && (
                  <>
                    <span className="text-[#F59E0B] font-bold block">SITE-WIDE UNCERTAINTY</span>
                    <span className="text-[#EFE7DE] block tabular-nums">Coverage: 18% · Blind: 82%</span>
                    <span className="text-[#EFE7DE]/60 block text-[8.5px]">Deciding Next Coordinate</span>
                  </>
                )}
                {activeSceneIndex === 3 && (
                  <>
                    <span className="text-[#10B981] font-bold block">RECOMMENDED TARGET</span>
                    <span className="text-[#FAD9BA] block tabular-nums font-bold">Spot 2 (E: 704120, N: 9241850)</span>
                    <span className="text-[#EFE7DE]/60 block text-[8.5px]">Information Gain: +38%</span>
                  </>
                )}
                {activeSceneIndex === 4 && (
                  <>
                    <span className="text-[#10B981] font-bold block">CONTINUOUS 3D STRATA</span>
                    <span className="text-[#FAD9BA] block tabular-nums">Bearing Layer: -16.8 m</span>
                    <span className="text-[#EFE7DE]/60 block text-[8.5px]">qc ≥ 15 MPa Verified</span>
                  </>
                )}
              </div>
            </div>

            {/* =========================================================================
                CENTER DYNAMIC VISUAL STAGE (Transforms with each Story Scene)
               ========================================================================= */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-2 sm:py-4">
              {/* Scene 01: The Ground Beneath (Building vision vs subsurface mystery) */}
              {activeSceneIndex === 0 && (
                <div className="w-full max-w-lg h-36 sm:h-44 flex flex-col items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 420 180" fill="none">
                    {/* Superstructure Vision Outline (Above ground) */}
                    <path
                      d="M170,75 L170,25 L210,10 L250,25 L250,75 Z"
                      stroke="#FAD9BA"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      fill="#BD8564"
                      fillOpacity="0.1"
                    />
                    <line x1="190" y1="25" x2="190" y2="75" stroke="#FAD9BA" strokeWidth="0.8" opacity="0.6" />
                    <line x1="210" y1="12" x2="210" y2="75" stroke="#FAD9BA" strokeWidth="0.8" opacity="0.6" />
                    <line x1="230" y1="25" x2="230" y2="75" stroke="#FAD9BA" strokeWidth="0.8" opacity="0.6" />
                    <text x="210" y="50" textAnchor="middle" fill="#FAD9BA" fontSize="9" fontFamily="monospace">
                      VISION
                    </text>

                    {/* Ground Surface Line */}
                    <line x1="40" y1="75" x2="380" y2="75" stroke="#EFE7DE" strokeWidth="1.8" />
                    <text x="50" y="70" fill="#EFE7DE" fontSize="8" fontFamily="monospace" opacity="0.7">
                      GROUND SURFACE 0.0 m
                    </text>

                    {/* Subsurface Earth Strata with Depth Markers */}
                    <rect x="40" y="76" width="340" height="30" fill="#3D2A1D" fillOpacity="0.4" />
                    <line x1="40" y1="106" x2="380" y2="106" stroke="#BD8564" strokeWidth="0.8" strokeDasharray="3 3" />
                    <text x="50" y="100" fill="#BD8564" fontSize="8" fontFamily="monospace">
                      -5.0 m (Unknown Upper Strata)
                    </text>

                    <rect x="40" y="107" width="340" height="40" fill="#251810" fillOpacity="0.6" />
                    <line x1="40" y1="147" x2="380" y2="147" stroke="#BD8564" strokeWidth="0.8" strokeDasharray="3 3" />
                    <text x="50" y="138" fill="#BD8564" fontSize="8" fontFamily="monospace">
                      -15.0 m (Competent Bearing Target?)
                    </text>

                    <rect x="40" y="148" width="340" height="30" fill="#1A110B" fillOpacity="0.8" />
                    <text x="50" y="168" fill="#EFE7DE" fontSize="8" fontFamily="monospace" opacity="0.5">
                      -25.0 m (Bedrock Datum)
                    </text>

                    {/* Subsurface Hidden Mystery Question Callouts */}
                    <g transform="translate(210, 126)">
                      <circle cx="0" cy="0" r="16" fill="#BD8564" fillOpacity="0.2" stroke="#FAD9BA" strokeWidth="1" strokeDasharray="2 2" />
                      <text x="0" y="4" textAnchor="middle" fill="#FAD9BA" fontSize="12" fontWeight="bold" fontFamily="monospace">
                        ?
                      </text>
                    </g>
                  </svg>
                </div>
              )}

              {/* Scene 02: Cone Penetration Testing (Single CPT sounding advancing) */}
              {activeSceneIndex === 1 && (
                <div className="w-full max-w-lg h-36 sm:h-44 flex flex-col items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 420 180" fill="none">
                    {/* CPT Rig Silhouette on Surface */}
                    <rect x="135" y="45" width="50" height="25" rx="3" fill="#BD8564" fillOpacity="0.5" stroke="#FAD9BA" strokeWidth="1" />
                    <line x1="130" y1="70" x2="190" y2="70" stroke="#FAD9BA" strokeWidth="2" />
                    <text x="160" y="61" textAnchor="middle" fill="#EFE7DE" fontSize="8" fontFamily="monospace">
                      CPT RIG
                    </text>

                    {/* Ground Level */}
                    <line x1="30" y1="70" x2="390" y2="70" stroke="#EFE7DE" strokeWidth="1.5" />

                    {/* Penetrating Steel Rod */}
                    <line x1="160" y1="70" x2="160" y2="150" stroke="#10B981" strokeWidth="2" />
                    {/* Active Cone Tip */}
                    <polygon points="156,150 164,150 160,160" fill="#10B981" />
                    <circle cx="160" cy="155" r="8" fill="#10B981" fillOpacity="0.2" className="animate-ping" />

                    {/* Real-time Cone Resistance (qc) Graph on the right */}
                    <g transform="translate(250, 40)">
                      <rect x="0" y="0" width="130" height="120" fill="#1C130D" stroke="#EFE7DE" strokeWidth="0.8" strokeOpacity="0.2" />
                      <text x="10" y="16" fill="#FAD9BA" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        CPT-01 qc (MPa)
                      </text>
                      {/* Depth axis */}
                      <line x1="20" y1="25" x2="20" y2="110" stroke="#EFE7DE" strokeWidth="0.8" strokeOpacity="0.4" />
                      {/* qc curve */}
                      <path
                        d="M 22,28 Q 28,40 32,50 T 40,80 T 85,100 T 95,108"
                        stroke="#10B981"
                        strokeWidth="1.8"
                        fill="none"
                      />
                      <circle cx="95" cy="108" r="3" fill="#10B981" />
                      <text x="80" y="94" fill="#10B981" fontSize="8" fontFamily="monospace">
                        qc 16.5 MPa
                      </text>
                    </g>
                  </svg>
                </div>
              )}

              {/* Scene 03: The Site-Wide Dilemma (One spot tested, whole site blind) */}
              {activeSceneIndex === 2 && (
                <div className="w-full max-w-lg h-36 sm:h-44 flex flex-col items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 420 180" fill="none">
                    {/* Site Boundary Polygon */}
                    <polygon
                      points="60,30 360,20 380,150 70,165"
                      fill="#251810"
                      fillOpacity="0.4"
                      stroke="#FAD9BA"
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                    />

                    {/* Spot 1 Known Sounding Dot (Small safe radius) */}
                    <circle cx="110" cy="65" r="22" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="110" cy="65" r="4" fill="#10B981" />
                    <text x="110" y="55" textAnchor="middle" fill="#10B981" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      CPT-01 (Known)
                    </text>

                    {/* Uncharacterized Site Blind Spots with Question Marks */}
                    <g transform="translate(230, 70)">
                      <circle cx="0" cy="0" r="25" fill="#F59E0B" fillOpacity="0.08" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 3" />
                      <text x="0" y="4" textAnchor="middle" fill="#F59E0B" fontSize="14" fontFamily="monospace" fontWeight="bold">?</text>
                      <text x="0" y="18" textAnchor="middle" fill="#EFE7DE" fontSize="7" fontFamily="monospace" opacity="0.7">Blind Spot</text>
                    </g>

                    <g transform="translate(310, 115)">
                      <circle cx="0" cy="0" r="28" fill="#F59E0B" fillOpacity="0.08" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 3" />
                      <text x="0" y="4" textAnchor="middle" fill="#F59E0B" fontSize="14" fontFamily="monospace" fontWeight="bold">?</text>
                      <text x="0" y="18" textAnchor="middle" fill="#EFE7DE" fontSize="7" fontFamily="monospace" opacity="0.7">Blind Spot</text>
                    </g>

                    <g transform="translate(160, 125)">
                      <circle cx="0" cy="0" r="24" fill="#F59E0B" fillOpacity="0.08" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 3" />
                      <text x="0" y="4" textAnchor="middle" fill="#F59E0B" fontSize="14" fontFamily="monospace" fontWeight="bold">?</text>
                      <text x="0" y="18" textAnchor="middle" fill="#EFE7DE" fontSize="7" fontFamily="monospace" opacity="0.7">Blind Spot</text>
                    </g>

                    {/* Central Dilemma Callout */}
                    <rect x="135" y="15" width="150" height="20" fill="#150E09" stroke="#BD8564" strokeWidth="1" />
                    <text x="210" y="28" textAnchor="middle" fill="#FAD9BA" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      WHERE TO INVESTIGATE NEXT?
                    </text>
                  </svg>
                </div>
              )}

              {/* Scene 04: Informed Recommendation (Terravise DQN recommends Spot 2 with rationale) */}
              {activeSceneIndex === 3 && (
                <div className="w-full max-w-lg h-36 sm:h-44 flex flex-col items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 420 180" fill="none">
                    {/* Site Boundary */}
                    <polygon
                      points="60,25 360,20 380,155 70,165"
                      fill="#1E140C"
                      stroke="#FAD9BA"
                      strokeWidth="1.2"
                      strokeDasharray="4 2"
                    />

                    {/* Previous soundings */}
                    <circle cx="110" cy="65" r="3.5" fill="#BD8564" />
                    <text x="110" y="55" textAnchor="middle" fill="#EFE7DE" fontSize="7" fontFamily="monospace" opacity="0.6">CPT-01</text>
                    <circle cx="310" cy="60" r="3.5" fill="#BD8564" />
                    <text x="310" y="50" textAnchor="middle" fill="#EFE7DE" fontSize="7" fontFamily="monospace" opacity="0.6">CPT-02</text>

                    {/* Recommended Target: SPOT 2 with DQN Reticle */}
                    <g transform="translate(215, 105)">
                      <circle cx="0" cy="0" r="20" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
                      <circle cx="0" cy="0" r="10" stroke="#10B981" strokeWidth="1.5" fill="none" />
                      <line x1="-24" y1="0" x2="24" y2="0" stroke="#10B981" strokeWidth="1.2" />
                      <line x1="0" y1="-24" x2="0" y2="24" stroke="#10B981" strokeWidth="1.2" />
                      <circle cx="0" cy="0" r="3" fill="#10B981" />
                    </g>

                    {/* 3 Transparent Rationale Indicators */}
                    <g transform="translate(250, 75)">
                      <rect x="0" y="0" width="135" height="18" fill="#1C130D" stroke="#10B981" strokeWidth="0.8" rx="2" />
                      <text x="8" y="12" fill="#10B981" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        1. Information Gain: +38%
                      </text>
                    </g>
                    <g transform="translate(250, 98)">
                      <rect x="0" y="0" width="135" height="18" fill="#1C130D" stroke="#EFE7DE" strokeWidth="0.8" strokeOpacity="0.3" rx="2" />
                      <text x="8" y="12" fill="#FAD9BA" fontSize="8" fontFamily="monospace">
                        2. Heavy Column: 14.2 m
                      </text>
                    </g>
                    <g transform="translate(250, 121)">
                      <rect x="0" y="0" width="135" height="18" fill="#1C130D" stroke="#EFE7DE" strokeWidth="0.8" strokeOpacity="0.3" rx="2" />
                      <text x="8" y="12" fill="#FAD9BA" fontSize="8" fontFamily="monospace">
                        3. Strata Boundary Variance
                      </text>
                    </g>
                  </svg>
                </div>
              )}

              {/* Scene 05: 3D Strata & Hard Soil (Continuous 3D voxel & bearing layer depth) */}
              {activeSceneIndex === 4 && (
                <div className="w-full max-w-lg h-36 sm:h-44 flex flex-col items-center justify-center relative">
                  <svg className="w-full h-full" viewBox="0 0 420 180" fill="none">
                    {/* Isometric 3D Soil Volume Cutaway */}
                    {/* Top Surface Plane */}
                    <polygon points="120,50 260,25 340,55 200,80" fill="#3D2A1D" stroke="#FAD9BA" strokeWidth="1" />
                    {/* Left Facing Wall: Clay & Silt Layers */}
                    <polygon points="120,50 200,80 200,140 120,110" fill="#2E1F15" stroke="#BD8564" strokeWidth="0.8" />
                    {/* Right Facing Wall */}
                    <polygon points="200,80 340,55 340,115 200,140" fill="#251810" stroke="#BD8564" strokeWidth="0.8" />

                    {/* Highlighted Competent Bearing Hard Soil Layer (qc >= 15 MPa) */}
                    <polygon
                      points="120,95 200,125 340,100 260,70"
                      fill="#10B981"
                      fillOpacity="0.25"
                      stroke="#10B981"
                      strokeWidth="1.5"
                    />

                    {/* Coordinate Depth Comparison Pins */}
                    <line x1="170" y1="42" x2="170" y2="108" stroke="#FAD9BA" strokeWidth="1.5" strokeDasharray="3 2" />
                    <circle cx="170" cy="42" r="3" fill="#FAD9BA" />
                    <rect x="135" y="24" width="70" height="15" fill="#150E09" stroke="#FAD9BA" strokeWidth="0.8" />
                    <text x="170" y="34" textAnchor="middle" fill="#FAD9BA" fontSize="7" fontFamily="monospace">
                      Col A1: -16.8 m
                    </text>

                    <line x1="280" y1="48" x2="280" y2="92" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 2" />
                    <circle cx="280" cy="48" r="3" fill="#10B981" />
                    <rect x="250" y="30" width="70" height="15" fill="#150E09" stroke="#10B981" strokeWidth="0.8" />
                    <text x="285" y="40" textAnchor="middle" fill="#10B981" fontSize="7" fontFamily="monospace">
                      Col B4: -18.4 m
                    </text>

                    {/* Brand Slogan Ribbon at bottom of 3D visual */}
                    <g transform="translate(210, 162)">
                      <text x="0" y="0" textAnchor="middle" fill="#FAD9BA" fontSize="11" fontFamily="sans-serif" fontWeight="900" letterSpacing="0.08em">
                        SEE BENEATH. DECIDE BETTER.
                      </text>
                    </g>
                  </svg>
                </div>
              )}

              {/* Architectural Center Play / Pause Action Button */}
              <motion.button
                type="button"
                onClick={togglePlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isPlaying ? "Pause application demo walkthrough" : "Play application demo walkthrough"}
                className="relative z-20 group cursor-pointer flex flex-col items-center gap-2 mt-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FAD9BA]"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1C130D]/90 border-2 border-[#FAD9BA] text-[#FAD9BA] shadow-[0_0_30px_rgba(250,217,186,0.35)] flex items-center justify-center transition-all group-hover:bg-[#5A3008] group-hover:border-[#EFE7DE]">
                  {isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                  )}
                </div>
                <div className="bg-[#150E09]/90 border border-[#EFE7DE]/20 px-3 py-1 font-mono text-[9px] sm:text-[10px] font-bold text-[#FAD9BA] tracking-wider uppercase backdrop-blur-md">
                  {isPlaying ? "PAUSE NARRATION" : `PLAY SCENE 0${activeSceneIndex + 1} WALKTHROUGH`}
                </div>
              </motion.button>
            </div>

            {/* =========================================================================
                CINEMATIC NARRATION SUBTITLE BAR (Bottom of Video Viewport)
               ========================================================================= */}
            <div className="relative z-20 bg-[#150E09]/95 border border-[#FAD9BA]/30 p-3 sm:p-4 backdrop-blur-md shadow-lg space-y-2">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="flex items-center gap-1.5 text-[#BD8564] font-bold uppercase tracking-wider">
                  <Quote className="w-3 h-3 text-[#FAD9BA]" />
                  VOICEOVER NARRATION · SCENE {currentScene.sceneNumber}
                </span>
                <span className="text-[#EFE7DE]/50 hidden sm:inline">
                  {isPlaying ? "VOICEOVER PLAYING" : "CLICK PLAY OR ANY SCENE CARD TO JUMP"}
                </span>
              </div>

              {/* Active Voiceover Quote with Smooth Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScene.sceneNumber}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs sm:text-sm md:text-[15px] font-sans text-[#FAD9BA] italic leading-snug tracking-tight font-medium"
                >
                  “{currentScene.narration}”
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom In-Video Control Strip & Scrubber */}
            <div className="relative z-10 bg-[#150E09]/95 border-t border-[#EFE7DE]/15 pt-2 flex flex-col gap-2 font-mono text-[10px]">
              {/* Scrubbing Timeline Bar with Scene Demarcations */}
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
                  for (let i = appDemo.scenes.length - 1; i >= 0; i--) {
                    if (targetSec >= appDemo.scenes[i].seconds) {
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
                {/* Scene Tick Marks */}
                {appDemo.scenes.map((sc) => {
                  const tickPct = (sc.seconds / TOTAL_DURATION_SEC) * 100
                  return (
                    <div
                      key={sc.time}
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
                    <Sparkles className="w-3 h-3 text-[#10B981]" />
                    <span>Story Narration</span>
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
                    4K PRORES
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL INTERACTIVE SCENE JUMP CARDS (Directly Below Video, NOT 50:50)
           ========================================================================= */}
        <div className="max-w-5xl mx-auto space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-[#BD8564] border-b border-[#EFE7DE]/15 pb-2">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Story Scenes · Click to Jump
            </span>
            <span className="text-[#EFE7DE]/50 text-[10px]">5 Narrative Beats · 04:00 Total</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {appDemo.scenes.map((scene, idx) => {
              const isActive = activeSceneIndex === idx
              return (
                <button
                  key={scene.time}
                  type="button"
                  onClick={() => handleSeek(scene.seconds, idx)}
                  aria-label={`Jump demo video to Scene ${scene.sceneNumber}: ${scene.title} at ${scene.time}`}
                  className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#FAD9BA] ${
                    isActive
                      ? "bg-[#271C14] border-[#FAD9BA] text-[#EFE7DE] shadow-md ring-1 ring-[#FAD9BA]/40"
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
                      {scene.time}
                    </span>
                    <span className="text-[8px] text-[#EFE7DE]/40">SCENE {scene.sceneNumber}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-[11px] text-[#FAD9BA] tracking-tight leading-tight line-clamp-1">
                      {scene.title}
                    </h4>
                    <p className="font-sans text-[9px] text-[#EFE7DE]/70 leading-relaxed line-clamp-2 mt-1">
                      {scene.desc}
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

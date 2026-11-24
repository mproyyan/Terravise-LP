import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PlateHeader } from "../ui/PlateHeader"
import { SITE_CONTENT } from "../../data/siteContent"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Radio,
  Layers,
} from "lucide-react"

export function AppDemoSection() {
  const { appDemo } = SITE_CONTENT
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0)
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0)
  const [durationSec, setDurationSec] = useState<number>(74.3) // 74s based on 67-last.mp4

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Sync state with HTML5 video events
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const cur = videoRef.current.currentTime
    setCurrentTimeSec(cur)

    // Sync active scene index based on timecode seconds
    for (let i = appDemo.scenes.length - 1; i >= 0; i--) {
      if (cur >= appDemo.scenes[i].seconds) {
        setActiveSceneIndex(i)
        break
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDurationSec(videoRef.current.duration)
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => {})
    }
  }

  const handleSeek = (seconds: number, index: number) => {
    setActiveSceneIndex(index)
    setCurrentTimeSec(seconds)
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
      videoRef.current.play().catch(() => {})
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const nextMuted = !isMuted
    videoRef.current.muted = nextMuted
    setIsMuted(nextMuted)
  }

  const handleRestart = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    videoRef.current.play().catch(() => {})
    setActiveSceneIndex(0)
  }

  const handleFullscreen = () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      containerRef.current.requestFullscreen().catch(() => {})
    }
  }

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = Math.floor(totalSec % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentScene = appDemo.scenes[activeSceneIndex] || appDemo.scenes[0]
  const progressRatio = durationSec > 0 ? currentTimeSec / durationSec : 0

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
            metaRight="Official application video walkthrough"
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
        <div
          ref={containerRef}
          className="max-w-5xl mx-auto border border-[#EFE7DE]/20 bg-[#120B07] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Top Hardware Telemetry Bar */}
          <div className="bg-[#1C130D] border-b border-[#EFE7DE]/15 px-3 sm:px-5 py-2.5 flex items-center justify-between font-mono text-[10px] text-[#EFE7DE]/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#FAD9BA]">
                <Radio className={`w-3 h-3 ${isPlaying ? "text-[#10B981] animate-pulse" : "text-[#BD8564]"}`} />
                <span className="font-bold">TERRAVISE RIG DISPLAY</span>
              </span>
              <span className="hidden sm:inline text-[#EFE7DE]/40">·</span>
              <span className="hidden sm:inline text-[#EFE7DE]/80">SCENE 0{activeSceneIndex + 1} / 05</span>
            </div>

            <div className="text-center font-bold text-[#FAD9BA] tracking-wider hidden md:block">
              {currentScene.title.toUpperCase()}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-[#271C14] border border-[#EFE7DE]/15 px-2 py-0.5 text-[#FAD9BA] font-bold">
                1080P HD
              </span>
            </div>
          </div>

          {/* Video Player Display Area (16:9 Aspect Ratio) */}
          <div className="relative aspect-16/9 bg-[#0E0704] overflow-hidden flex flex-col justify-between group">
            <video
              ref={videoRef}
              src={appDemo.videoUrl || "/videos/terravise-demo.mp4"}
              playsInline
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false)
                setActiveSceneIndex(0)
              }}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Center Play Overlay (when paused or stopped) */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={togglePlay}
                  className="absolute inset-0 bg-[#0E0704]/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-10 p-4"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Play application walkthrough video"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1C130D]/95 border-2 border-[#FAD9BA] text-[#FAD9BA] shadow-[0_0_35px_rgba(250,217,186,0.35)] flex items-center justify-center transition-all group-hover:bg-[#5A3008] group-hover:border-[#EFE7DE]"
                  >
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1 text-[#FAD9BA]" />
                  </motion.button>
                  <div className="mt-3 bg-[#150E09]/90 border border-[#EFE7DE]/20 px-3.5 py-1 font-mono text-[10px] sm:text-xs font-bold text-[#FAD9BA] tracking-wider uppercase backdrop-blur-md">
                    WATCH TERRAVISE APPLICATION DEMO (01:14)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Custom Playback Scrubber & Controls Toolbar */}
            <div className="absolute bottom-0 inset-x-0 z-30 bg-[#150E09]/95 border-t border-[#EFE7DE]/15 p-2 sm:p-2.5 backdrop-blur-md flex flex-col gap-2 font-mono text-[10px]">
              {/* Scrubbing Timeline Bar with Scene Demarcations */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Video timeline scrubber"
                aria-valuemin={0}
                aria-valuemax={Math.round(durationSec)}
                aria-valuenow={Math.round(currentTimeSec)}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                  const targetSec = pct * durationSec
                  if (videoRef.current) {
                    videoRef.current.currentTime = targetSec
                  }
                  for (let i = appDemo.scenes.length - 1; i >= 0; i--) {
                    if (targetSec >= appDemo.scenes[i].seconds) {
                      setActiveSceneIndex(i)
                      break
                    }
                  }
                }}
                className="relative h-2 bg-[#271C14] border border-[#EFE7DE]/15 cursor-pointer overflow-hidden group/bar"
              >
                {/* Active Progress Bar */}
                <div
                  className="h-full bg-gradient-to-r from-[#BD8564] via-[#FAD9BA] to-[#10B981] transition-all duration-100"
                  style={{ width: `${Math.round(progressRatio * 100)}%` }}
                />
                {/* Scene Tick Marks */}
                {appDemo.scenes.map((sc) => {
                  const tickPct = (sc.seconds / durationSec) * 100
                  return (
                    <div
                      key={sc.time}
                      style={{ left: `${tickPct}%` }}
                      title={`Scene ${sc.sceneNumber}: ${sc.title}`}
                      className="absolute top-0 bottom-0 w-[1.5px] bg-[#EFE7DE]/50 pointer-events-none"
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
                    onClick={handleRestart}
                    aria-label="Restart video from beginning"
                    className="hover:text-[#FAD9BA] cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>

                  <span className="tabular-nums font-bold text-[#EFE7DE]">
                    {formatTime(currentTimeSec)} <span className="text-[#EFE7DE]/40">/ {formatTime(durationSec)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[9px]">
                  <span className="hidden sm:inline text-[#FAD9BA] font-bold">
                    {currentScene.title}
                  </span>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
                    className="hover:text-[#FAD9BA] cursor-pointer transition-colors p-1"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleFullscreen}
                    aria-label="Toggle theater fullscreen"
                    className="hover:text-[#FAD9BA] cursor-pointer transition-colors p-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  <span className="px-1.5 py-0.5 bg-[#271C14] border border-[#EFE7DE]/15 text-[#EFE7DE]/60 text-[8px] uppercase">
                    1080P FHD
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
              Story Scenes · Click to Seek Video
            </span>
            <span className="text-[#EFE7DE]/50 text-[10px]">5 Narrative Beats · {formatTime(durationSec)} Total</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {appDemo.scenes.map((scene, idx) => {
              const isActive = activeSceneIndex === idx
              return (
                <button
                  key={scene.time}
                  type="button"
                  onClick={() => handleSeek(scene.seconds, idx)}
                  aria-label={`Jump video to Scene ${scene.sceneNumber}: ${scene.title} at ${scene.time}`}
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
      </div>
    </section>
  )
}

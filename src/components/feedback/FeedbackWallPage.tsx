import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fetchFeedbacks, supabase, isSupabaseConfigured, cleanRoleText, type FeedbackDisplayItem } from "../../lib/supabase"

/**
 * Fallback showcase items used ONLY when no feedback entries exist yet
 * in Supabase or localStorage so the looping CPT rig display can be previewed immediately.
 */
const FALLBACK_FEEDBACKS: FeedbackDisplayItem[] = [
  {
    id: "sample-1",
    full_name: "Ir. Hendra Wijaya, M.T.",
    role: "Praktisi Geoteknik",
    feedback_notes:
      "Visualisasi 3D soil interpolation dan penentuan bearing layer sangat membantu tim lapangan mengambil keputusan cepat tanpa harus menunggu pengolahan data berhari-hari di kantor.",
  },
  {
    id: "sample-2",
    full_name: "Nadia Kusuma",
    role: "Product Designer",
    feedback_notes:
      "Alur interaksi di iPad terasa sangat intuitif. Penyajian data sondir yang biasanya penuh angka tabel berhasil diubah menjadi visual spasial yang mudah dipahami berbagai pihak.",
  },
  {
    id: "sample-3",
    full_name: "Dr. Eng. R. Prasetyo",
    role: "Akademisi & Peneliti",
    feedback_notes:
      "Pendekatan reinforcement learning untuk merekomendasikan titik sondir berikutnya sangat relevan untuk efisiensi investigasi tanah pada area dengan variasi stratigrafi yang kompleks.",
  },
]

interface DepthStationConfig {
  depthM: number
  topPct: number
  stratumLabel: string
  qcMpa: string
  side: "left" | "right"
}

const STATIONS_3: DepthStationConfig[] = [
  {
    depthM: 6.4,
    topPct: 22,
    stratumLabel: "Alluvial Silty Sand",
    qcMpa: "8.4 MPa",
    side: "left",
  },
  {
    depthM: 14.8,
    topPct: 52,
    stratumLabel: "Stiff Clayey Silt",
    qcMpa: "14.2 MPa",
    side: "right",
  },
  {
    depthM: 22.5,
    topPct: 81,
    stratumLabel: "Dense Bearing Stratum",
    qcMpa: "21.6 MPa",
    side: "left",
  },
]

const STATIONS_2: DepthStationConfig[] = [
  {
    depthM: 9.2,
    topPct: 34,
    stratumLabel: "Alluvial Silty Sand",
    qcMpa: "11.0 MPa",
    side: "left",
  },
  {
    depthM: 19.6,
    topPct: 72,
    stratumLabel: "Dense Bearing Stratum",
    qcMpa: "19.8 MPa",
    side: "right",
  },
]

const STATIONS_1: DepthStationConfig[] = [
  {
    depthM: 14.5,
    topPct: 52,
    stratumLabel: "Competent Bearing Stratum",
    qcMpa: "18.5 MPa",
    side: "right",
  },
]

export function FeedbackWallPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackDisplayItem[]>([])
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  // Cycle state: drives the looping CPT penetrometer descent
  const [cycleIndex, setCycleIndex] = useState<number>(0)
  const [coneProgress, setConeProgress] = useState<number>(0) // 0 to 100 (% of borehole depth)
  const [isRetracting, setIsRetracting] = useState<boolean>(false)

  // Initial load + periodic refresh + realtime subscription
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      const items = await fetchFeedbacks()
      if (isMounted) {
        setFeedbacks(items)
        setIsLoaded(true)
      }
    }

    loadData()

    const pollInterval = setInterval(loadData, 15000)

    // Subscribe to realtime inserts if Supabase is configured
    const channel =
      supabase && isSupabaseConfigured
        ? supabase
            .channel("public:feedback:wall")
            .on(
              "postgres_changes",
              { event: "INSERT", schema: "public", table: "feedback" },
              (payload) => {
                const newRow = payload.new as Record<string, unknown>
                if (newRow && typeof newRow.feedback_notes === "string" && newRow.feedback_notes.trim()) {
                  const addedItem: FeedbackDisplayItem = {
                    id: String(newRow.id || Date.now()),
                    full_name: newRow.full_name ? String(newRow.full_name).trim() : undefined,
                    role: cleanRoleText(
                      typeof newRow.role === "string" ? newRow.role : undefined,
                      typeof newRow.role_other === "string" ? newRow.role_other : undefined
                    ),
                    feedback_notes: String(newRow.feedback_notes).trim(),
                    created_at: typeof newRow.created_at === "string" ? newRow.created_at : undefined,
                  }
                  setFeedbacks((prev) => {
                    if (prev.some((item) => item.id === addedItem.id)) return prev
                    return [addedItem, ...prev]
                  })
                }
              }
            )
            .subscribe()
        : null

    return () => {
      isMounted = false
      clearInterval(pollInterval)
      if (channel && supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const activePool = feedbacks.length > 0 ? feedbacks : FALLBACK_FEEDBACKS

  // Select station layout based on available items
  const stations = useMemo(() => {
    if (activePool.length === 1) return STATIONS_1
    if (activePool.length === 2) return STATIONS_2
    return STATIONS_3
  }, [activePool.length])

  // Compute current batch of feedbacks for this sounding cycle
  const currentBatch = useMemo(() => {
    const count = stations.length
    const total = activePool.length
    const startIdx = (cycleIndex * count) % total

    return stations.map((station, idx) => {
      const item = activePool[(startIdx + idx) % total]
      // Alternate left/right on consecutive cycles so visual balance shifts dynamically
      const effectiveSide: "left" | "right" =
        cycleIndex % 2 === 0 ? station.side : station.side === "left" ? "right" : "left"
      return {
        ...station,
        side: effectiveSide,
        item,
      }
    })
  }, [activePool, cycleIndex, stations])

  // Continuous 60fps CPT drilling loop state machine
  useEffect(() => {
    if (!isLoaded) return

    // Timeline per cycle (in milliseconds):
    // 0 -> 7000ms: CPT cone drills from 0% down to 94% depth, unlocking feedback stations as it passes their topPct
    // 7000 -> 13000ms: CPT cone holds at target depth (94%) pulsing sonar while all uncovered cards remain readable
    // 13000 -> 14200ms: Retraction & reset to 0% for next sounding cycle
    const DRILL_DURATION_MS = 7000
    const HOLD_DURATION_MS = 6000
    const RETRACT_DURATION_MS = 1200
    const TOTAL_CYCLE_MS = DRILL_DURATION_MS + HOLD_DURATION_MS + RETRACT_DURATION_MS

    let startTime = performance.now()
    let rafId: number

    const tick = (now: number) => {
      const elapsed = now - startTime

      if (elapsed < DRILL_DURATION_MS) {
        // Smooth penetration curve
        const t = elapsed / DRILL_DURATION_MS
        // Slightly ease through soil layers
        const pct = t * 94
        setIsRetracting(false)
        setConeProgress(pct)
      } else if (elapsed < DRILL_DURATION_MS + HOLD_DURATION_MS) {
        // Hold at target bearing depth with subtle micro-oscillation
        const holdElapsed = elapsed - DRILL_DURATION_MS
        const microPulse = Math.sin(holdElapsed / 220) * 0.4
        setIsRetracting(false)
        setConeProgress(94 + microPulse)
      } else if (elapsed < TOTAL_CYCLE_MS) {
        // Retract penetrometer rod back to surface
        const retractT = (elapsed - DRILL_DURATION_MS - HOLD_DURATION_MS) / RETRACT_DURATION_MS
        const easeInOut = retractT < 0.5 ? 2 * retractT * retractT : 1 - Math.pow(-2 * retractT + 2, 2) / 2
        setIsRetracting(true)
        setConeProgress(94 * (1 - easeInOut))
      } else {
        // Advance to next cycle
        startTime = now
        setIsRetracting(false)
        setConeProgress(0)
        setCycleIndex((prev) => prev + 1)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isLoaded])

  const liveDepthM = ((coneProgress / 94) * 25.0).toFixed(1)

  // Determine which station was most recently unlocked
  const latestUnlockedIndex = useMemo(() => {
    if (isRetracting) return -1
    let idx = -1
    for (let i = 0; i < currentBatch.length; i++) {
      if (coneProgress >= currentBatch[i].topPct - 2) {
        idx = i
      }
    }
    return idx
  }, [coneProgress, currentBatch, isRetracting])

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#150E09] text-[#EFE7DE] font-sans select-none relative flex flex-col">
      {/* =====================================================================
          1. SUBSURFACE STRATIGRAPHY LAYERS & GEOLOGICAL TEXTURE BACKGROUND
         ===================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
        {/* Top Ground Horizon Strip */}
        <div className="h-16 sm:h-20 bg-[#1C130D] border-b-2 border-[#BD8564]/50 relative overflow-hidden shrink-0">
          {/* Diagonal Ground Hatching along surface line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-3 opacity-35"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, #FAD9BA 0px, #FAD9BA 1px, transparent 1px, transparent 8px)",
            }}
          />
        </div>

        {/* Underground Soil Strata Bands */}
        <div className="flex-1 relative flex flex-col">
          {/* Layer 1: Topsoil & Alluvial Sand (0m - 8m) */}
          <div className="h-[32%] bg-gradient-to-b from-[#251810] to-[#1F140E] border-b border-[#EFE7DE]/[0.06] relative">
            <span className="hidden sm:block absolute right-6 top-3 font-mono text-[10px] uppercase tracking-widest text-[#EFE7DE]/20">
              STRATUM I · ALLUVIAL SILTY SAND (0.0m - 8.0m)
            </span>
          </div>

          {/* Layer 2: Stiff Clayey Silt (8m - 17m) */}
          <div className="h-[36%] bg-gradient-to-b from-[#1F140E] to-[#19100B] border-b border-[#EFE7DE]/[0.06] relative">
            <span className="hidden sm:block absolute right-6 top-3 font-mono text-[10px] uppercase tracking-widest text-[#EFE7DE]/20">
              STRATUM II · STIFF CLAYEY SILT (8.0m - 17.0m)
            </span>
          </div>

          {/* Layer 3: Competent Bearing Stratum (17m - 25m) */}
          <div className="h-[32%] bg-gradient-to-b from-[#19100B] to-[#120B07] relative">
            <span className="hidden sm:block absolute right-6 top-3 font-mono text-[10px] uppercase tracking-widest text-[#EFE7DE]/20">
              STRATUM III · DENSE BEARING STRATUM (17.0m - 25.0m)
            </span>
          </div>

          {/* Subtle Blueprint Subsurface Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #FAD9BA 1px, transparent 1px), linear-gradient(to bottom, #FAD9BA 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
      </div>

      {/* =====================================================================
          2. TOP GEOTECHNICAL TELEMETRY HEADER BAR (NO NAVIGATION BUTTONS)
         ===================================================================== */}
      <header className="relative z-30 h-16 sm:h-20 px-4 sm:px-8 lg:px-12 flex items-center justify-between border-b border-[#BD8564]/40 bg-[#1C130D]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3.5">
          <img
            src="/terravise-logo.png"
            alt="Terravise"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-sm sm:text-base tracking-tight uppercase text-[#EFE7DE]">
                Terravise
              </span>
              <span className="text-[#BD8564] font-mono text-[10px] uppercase px-1.5 py-0.5 bg-[#271C14] border border-[#BD8564]/40">
                CPT Sounding Feedback Log
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#EFE7DE]/55 hidden sm:block">
              Continuous Subsurface Cone Penetration Test · Field Feedback Extraction
            </p>
          </div>
        </div>

        {/* Center Rig Head Datum Indicator (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 bg-[#150E09] border border-[#FAD9BA]/30 px-3.5 py-1.5 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[#EFE7DE]/60 uppercase">RIG STATUS:</span>
          <span className="text-[#FAD9BA] font-bold uppercase">
            {isRetracting ? "RETRACTING RODS" : coneProgress >= 93.5 ? "HOLDING TARGET DEPTH" : "PENETRATING SOIL"}
          </span>
        </div>

        {/* Right Telemetry Metrics */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
          <div>
            <span className="text-[9px] text-[#EFE7DE]/50 block uppercase">CONE DEPTH</span>
            <span className="text-sm sm:text-base font-bold text-[#FAD9BA] tabular-nums">
              -{liveDepthM} m
            </span>
          </div>
          <div className="h-7 w-[1px] bg-[#EFE7DE]/15" />
          <div>
            <span className="text-[9px] text-[#EFE7DE]/50 block uppercase">SOUNDING HOLE</span>
            <span className="text-sm sm:text-base font-bold text-[#EFE7DE] tabular-nums">
              CPT-{String((cycleIndex % Math.max(1, Math.ceil(activePool.length / stations.length))) + 1).padStart(2, "0")}
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================================
          3. MAIN SUBSURFACE BOREHOLE STAGE & FEEDBACK CARDS
         ===================================================================== */}
      <main className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto overflow-hidden">
        {/* -----------------------------------------------------------------
            BOREHOLE SHAFT & MOVING CPT CONE ASSEMBLY
            - Centered on Desktop (lg:left-1/2)
            - Left-aligned on Mobile/Tablet (left-10 sm:left-14)
           ----------------------------------------------------------------- */}
        <div className="absolute top-0 bottom-0 left-10 sm:left-14 lg:left-1/2 -translate-x-1/2 w-24 flex justify-center pointer-events-none z-20">
          {/* Surface Hydraulic Rig Guide Collar at 0.0m */}
          <div className="absolute top-0 w-10 h-3 bg-gradient-to-r from-[#381800] via-[#BD8564] to-[#381800] border-x border-b border-[#FAD9BA]/60 shadow-md z-30" />

          {/* Full Un-drilled Borehole Target Axis Guide Line */}
          <div className="absolute top-0 bottom-0 w-4 bg-[#0D0805]/90 border-x border-[#EFE7DE]/15 shadow-inner overflow-hidden">
            {/* Subtle vertical guide center line */}
            <div className="w-[1px] h-full mx-auto border-l border-dashed border-[#FAD9BA]/15" />
          </div>

          {/* Depth Ruler Notches Along Borehole Wall */}
          {[
            { label: "0.0m", pct: "2%" },
            { label: "-5.0m", pct: "20%" },
            { label: "-10.0m", pct: "38%" },
            { label: "-15.0m", pct: "56%" },
            { label: "-20.0m", pct: "74%" },
            { label: "-25.0m", pct: "92%" },
          ].map((tick) => (
            <div
              key={tick.label}
              className="absolute left-1/2 -translate-x-1/2 w-24 flex items-center justify-between font-mono text-[9px] text-[#BD8564]/70"
              style={{ top: tick.pct }}
            >
              <div className="flex items-center gap-1">
                <span className="text-[8px] hidden sm:inline">{tick.label}</span>
                <span className="w-2 h-[1px] bg-[#FAD9BA]/30" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-[1px] bg-[#FAD9BA]/30" />
                <span className="text-[8px]">{tick.label}</span>
              </div>
            </div>
          ))}

          {/* Active Steel Push Rod String (Extends from 0.0m down to the Cone Tip) */}
          <div
            className="absolute top-0 w-2 sm:w-2.5 bg-gradient-to-r from-[#5A3008] via-[#FAD9BA] to-[#381800] border-x border-[#FAD9BA]/50 shadow-[0_0_15px_rgba(250,217,186,0.25)] z-20"
            style={{
              height: `${Math.max(0, coneProgress)}%`,
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0px, transparent 54px, rgba(28,19,13,0.85) 54px, rgba(28,19,13,0.85) 56px), linear-gradient(to right, #5A3008, #FAD9BA, #381800)",
            }}
          />

          {/* Station Target Nodes on the Borehole Spine */}
          {currentBatch.map((station) => {
            const isReached = !isRetracting && coneProgress >= station.topPct - 2
            return (
              <div
                key={`node-${station.depthM}`}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ top: `${station.topPct}%` }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                    isReached
                      ? "bg-[#10B981] border-[#FAD9BA] shadow-[0_0_14px_#10B981] scale-110"
                      : "bg-[#1C130D] border-[#EFE7DE]/30 scale-90"
                  }`}
                />
              </div>
            )
          })}

          {/* THE ASTM D5778 60-DEGREE CPT CONE PENETROMETER TIP ASSEMBLY */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
            style={{ top: `${coneProgress}%` }}
          >
            {/* Friction Sleeve Collar (fs) */}
            <div className="w-4 sm:w-5 h-5 bg-gradient-to-r from-[#271C14] via-[#BD8564] to-[#1C130D] border border-[#FAD9BA]/80 flex flex-col items-center justify-between py-0.5 shadow-md">
              <div className="w-full h-[1px] bg-[#FAD9BA]/40" />
              {/* Piezocone u2 Pore Pressure Filter Element */}
              <div className="w-full h-1 bg-[#10B981]" />
            </div>

            {/* 60-Degree Conical Penetrometer Point (qc) */}
            <div className="relative flex flex-col items-center">
              <svg
                className="w-6 sm:w-7 h-6 drop-shadow-[0_6px_16px_rgba(250,217,186,0.55)]"
                viewBox="0 0 28 24"
                fill="none"
              >
                <polygon
                  points="2,1 26,1 14,22"
                  fill="url(#wallCptConeGrad)"
                  stroke="#FAD9BA"
                  strokeWidth="1.5"
                />
                <polygon points="14,1 26,1 14,22" fill="#FFFFFF" fillOpacity="0.18" />
                <circle cx="14" cy="20" r="1.8" fill="#10B981" />
                <defs>
                  <linearGradient
                    id="wallCptConeGrad"
                    x1="2"
                    y1="1"
                    x2="26"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FAD9BA" />
                    <stop offset="0.5" stopColor="#BD8564" />
                    <stop offset="1" stopColor="#5A3008" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Radial Seismic / Acoustic Pressure Waves Emitted while Drilling */}
              {!isRetracting && (
                <>
                  <span className="absolute top-3 w-8 h-8 rounded-full border border-[#FAD9BA]/50 animate-ping pointer-events-none" />
                  <span className="absolute top-2 w-14 h-14 rounded-full border border-[#10B981]/30 animate-pulse pointer-events-none" />
                </>
              )}
            </div>

            {/* Live Depth Tag Attached to Cone Tip */}
            <div className="mt-1 bg-[#150E09]/95 border border-[#FAD9BA]/80 px-2 py-0.5 shadow-xl font-mono text-[10px] whitespace-nowrap flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[#FAD9BA] font-bold tabular-nums">-{liveDepthM} m</span>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            DISCOVERED FEEDBACK CARDS (EMERGE AS CONE PENETRATES EACH DEPTH)
           ----------------------------------------------------------------- */}
        {currentBatch.map((station, idx) => {
          const isUnlocked = !isRetracting && coneProgress >= station.topPct - 2
          const isMostRecent = latestUnlockedIndex === idx
          const { item, side, topPct, depthM } = station

          return (
            <div
              key={`${cycleIndex}-${item.id}-${depthM}`}
              className="absolute left-0 right-0 -translate-y-1/2 px-4 sm:px-8 lg:px-14 pointer-events-none"
              style={{ top: `${topPct}%` }}
            >
              <AnimatePresence>
                {isUnlocked && (
                  <div
                    className={`w-full flex items-center ${
                      side === "left" ? "lg:justify-start" : "lg:justify-end"
                    }`}
                  >
                    {/* Desktop Connector Beam from Center Borehole to Card */}
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      style={{
                        originX: side === "left" ? 1 : 0,
                      }}
                      className={`hidden lg:block absolute top-1/2 -translate-y-1/2 h-[1px] w-[7%] bg-gradient-to-r ${
                        side === "left"
                          ? "right-1/2 mr-3 from-[#FAD9BA]/80 to-[#10B981]"
                          : "left-1/2 ml-3 from-[#10B981] to-[#FAD9BA]/80"
                      }`}
                    />

                    {/* Mobile/Tablet Connector Beam from Left Borehole to Card */}
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ originX: 0 }}
                      className="lg:hidden absolute left-10 sm:left-14 top-1/2 -translate-y-1/2 h-[1px] w-8 sm:w-10 bg-[#10B981]"
                    />

                    {/* Feedback Card */}
                    <motion.article
                      initial={{
                        opacity: 0,
                        x: side === "left" ? 28 : -28,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                        scale: 0.96,
                      }}
                      transition={{
                        duration: 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={`pointer-events-auto ml-14 sm:ml-20 lg:ml-0 w-full lg:w-[42%] bg-[#221710]/95 backdrop-blur-md border p-4 sm:p-6 shadow-2xl transition-colors duration-500 relative overflow-hidden ${
                        isMostRecent
                          ? "border-[#FAD9BA] shadow-[0_12px_36px_rgba(250,217,186,0.14)]"
                          : "border-[#EFE7DE]/20"
                      }`}
                    >
                      {/* Top Accent Progress Bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-500 ${
                          isMostRecent ? "bg-gradient-to-r from-[#10B981] via-[#FAD9BA] to-[#BD8564]" : "bg-[#BD8564]/40"
                        }`}
                      />

                      {/* Card Header: Name (if any) & Latar Belakang */}
                      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 mb-3 border-b border-[#EFE7DE]/12">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {item.full_name && (
                            <h2 className="font-sans font-bold text-base sm:text-lg text-[#FAD9BA] tracking-tight">
                              {item.full_name}
                            </h2>
                          )}
                          <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 bg-[#150E09] border border-[#BD8564]/50 text-[#EFE7DE]/90 font-semibold">
                            {item.role}
                          </span>
                        </div>

                        <span className="font-mono text-[10px] text-[#BD8564] tabular-nums">
                          -{depthM.toFixed(1)} m
                        </span>
                      </div>

                      {/* Card Body: Masukan */}
                      <p className="font-sans text-sm sm:text-base text-[#EFE7DE]/95 leading-relaxed line-clamp-4">
                        "{item.feedback_notes}"
                      </p>
                    </motion.article>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </main>
    </div>
  )
}

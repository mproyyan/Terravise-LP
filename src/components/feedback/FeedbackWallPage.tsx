import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  fetchFeedbacks,
  supabase,
  isSupabaseConfigured,
  type FeedbackDisplayItem,
} from "../../lib/supabase"

interface ActiveSpawnedCard {
  uid: string
  spawnDistancePx: number
  side: "left" | "right"
  offsetPct: number
  item: FeedbackDisplayItem
}

// Digging speed in pixels per second (earth moves upward at this speed)
const DIG_SPEED_PX_PER_SEC = 58
// Height of one seamless repeating geological soil strata tile (px)
const SOIL_TILE_HEIGHT_PX = 960
// Cone tip vertical anchor as a ratio of viewport height (66% from top — never hits the bottom)
const CONE_TIP_Y_RATIO = 0.66

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/**
 * Returns the vertical pixel gap to the next feedback card:
 * - 70% chance: between 1.5s (87px) and 4.0s (232px)
 * - 30% chance: above 4.0s (232px) up to ~6.55s (380px)
 */
function getWeightedSpawnGapPx(): number {
  if (Math.random() < 0.7) {
    return randomBetween(87, 232)
  }
  return randomBetween(232, 380)
}

export function FeedbackWallPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackDisplayItem[]>([])
  const [viewportH, setViewportH] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerHeight : 900
  )

  // Continuous drilling distance (px) and active cards on screen
  const [distanceDrilledPx, setDistanceDrilledPx] = useState<number>(420)
  const [spawnedCards, setSpawnedCards] = useState<ActiveSpawnedCard[]>([])
  const [pulseKey, setPulseKey] = useState<number>(0)

  // Refs for the 60fps animation loop to avoid stale closures
  const poolRef = useRef<FeedbackDisplayItem[]>([])
  const nextPoolIndexRef = useRef<number>(0)
  const nextSpawnDistanceRef = useRef<number>(420)
  const lastSideRef = useRef<"left" | "right">("right")
  const uidCounterRef = useRef<number>(1)
  const distanceRef = useRef<number>(420)
  const seededOnceRef = useRef<boolean>(false)

  // Track viewport resize
  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Load real feedbacks from Supabase + Realtime listener + Polling every 5s
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      const items = await fetchFeedbacks()
      if (isMounted) {
        setFeedbacks(items)
      }
    }

    loadData()
    const pollInterval = setInterval(loadData, 5000)

    const channel =
      supabase && isSupabaseConfigured
        ? supabase
            .channel("public:feedback:infinite-wall")
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "feedback" },
              () => {
                // Reload displayed feedbacks whenever admin toggles is_displayed or new row arrives
                loadData()
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

  // Helper to pull the next feedback item from the DB pool in an infinite circular loop
  const pullNextFeedbackItem = (): FeedbackDisplayItem | null => {
    const pool = poolRef.current
    if (pool.length === 0) return null
    const idx = nextPoolIndexRef.current % pool.length
    nextPoolIndexRef.current = (idx + 1) % pool.length
    return pool[idx]
  }

  // Sync poolRef and seed initial visible cards as soon as DB data arrives,
  // and immediately remove any card on screen that was un-flagged by admin
  useEffect(() => {
    poolRef.current = feedbacks
    const allowedIds = new Set(feedbacks.map((f) => f.id))

    setSpawnedCards((prev) => prev.filter((c) => allowedIds.has(c.item.id)))

    if (feedbacks.length === 0) {
      seededOnceRef.current = false
      return
    }

    if (!seededOnceRef.current) {
      seededOnceRef.current = true
      const currentDist = distanceRef.current
      const firstItem = pullNextFeedbackItem()
      if (firstItem) {
        const firstCard: ActiveSpawnedCard = {
          uid: `seed-${uidCounterRef.current++}`,
          spawnDistancePx: currentDist - 30,
          side: "left",
          offsetPct: 1.5,
          item: firstItem,
        }
        lastSideRef.current = "left"
        nextSpawnDistanceRef.current = currentDist + getWeightedSpawnGapPx()
        setSpawnedCards([firstCard])
        setPulseKey((k) => k + 1)
      }
    }
  }, [feedbacks])

  // Infinite 60fps CPT Drilling & Upward Earth Scroll Loop
  useEffect(() => {
    let lastTime = performance.now()
    let rafId: number

    const step = (now: number) => {
      const dtSec = Math.min(0.1, (now - lastTime) / 1000)
      lastTime = now

      const dist = distanceRef.current + dtSec * DIG_SPEED_PX_PER_SEC
      distanceRef.current = dist
      setDistanceDrilledPx(dist)

      // Only spawn cards when there is real data in poolRef
      if (poolRef.current.length > 0 && dist >= nextSpawnDistanceRef.current) {
        const spawnAt = nextSpawnDistanceRef.current
        const nextItem = pullNextFeedbackItem()

        if (nextItem) {
          const gapToNext = getWeightedSpawnGapPx()
          const nextSide: "left" | "right" =
            lastSideRef.current === "left" ? "right" : "left"
          lastSideRef.current = nextSide

          const newCard: ActiveSpawnedCard = {
            uid: `card-${uidCounterRef.current++}-${Date.now()}`,
            spawnDistancePx: spawnAt,
            side: nextSide,
            offsetPct: randomBetween(0, 3.5),
            item: nextItem,
          }

          nextSpawnDistanceRef.current = spawnAt + gapToNext
          setPulseKey((k) => k + 1)

          const maxRetentionDistance =
            window.innerHeight * CONE_TIP_Y_RATIO + 420
          setSpawnedCards((prev) => {
            const kept = prev.filter(
              (c) => dist - c.spawnDistancePx < maxRetentionDistance
            )
            return [...kept, newCard]
          })
        }
      }

      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const coneTipY = viewportH * CONE_TIP_Y_RATIO
  const tileOffsetY = -(distanceDrilledPx % SOIL_TILE_HEIGHT_PX)
  const parallaxGrainOffsetY = -((distanceDrilledPx * 1.15) % 480)
  const coneVibrationY = Math.sin(distanceDrilledPx * 0.18) * 1.8

  // Resolve dynamic base URL from environment variable (fallback to current origin)
  const rawBaseUrl =
    import.meta.env.VITE_APP_BASE_URL ||
    import.meta.env.VITE_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173")
  const cleanBaseUrl = String(rawBaseUrl).trim().replace(/\/+$/, "")
  const feedbackTargetUrl = `${cleanBaseUrl}/feedback`

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#140D08] text-[#EFE7DE] font-sans select-none relative">
      {/* =====================================================================
          0. TOP-RIGHT FLOATING QR INVITATION CARD
         ===================================================================== */}
      <aside
        aria-label="Scan QR Code untuk mengisi feedback"
        className="fixed top-4 right-4 sm:top-6 sm:right-8 z-40 max-w-[320px] sm:max-w-[360px] bg-[#1C130D]/95 backdrop-blur-md border border-[#FAD9BA]/55 shadow-[0_16px_48px_rgba(0,0,0,0.75)] p-4 sm:p-5"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#10B981] via-[#FAD9BA] to-[#BD8564]" />

        <div className="flex items-center gap-4">
          {/* Narrative Invitation Copy */}
          <div className="flex-1 space-y-1.5">
            <h2 className="font-sans font-black text-sm sm:text-base text-[#EFE7DE] uppercase tracking-tight leading-snug">
              Feedback untuk Terravise
            </h2>

            <p className="font-sans text-[11px] sm:text-xs text-[#EFE7DE]/80 leading-relaxed">
              Scan QR code di samping untuk menyampaikan pandangan, saran fitur, atau peluang kolaborasi bersama kami.
            </p>
          </div>

          {/* Dynamic QR Code Box pointing to ${VITE_APP_BASE_URL}/feedback */}
          <a
            href={feedbackTargetUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={feedbackTargetUrl}
            className="shrink-0 bg-[#FAF5EE] p-2.5 border-2 border-[#FAD9BA] shadow-md hover:scale-[1.03] transition-transform"
          >
            <QRCodeSVG
              value={feedbackTargetUrl}
              size={96}
              bgColor="#FAF5EE"
              fgColor="#1C130D"
              level="H"
              imageSettings={{
                src: "/terravise-logo.png",
                height: 22,
                width: 22,
                excavate: true,
              }}
            />
          </a>
        </div>
      </aside>
      {/* =====================================================================
          1. INFINITE UPWARD-MOVING SUBSURFACE SOIL STRATA BACKGROUND
         ===================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Two stacked seamless SVG geological strata tiles scrolling upward */}
        <div
          className="absolute left-0 right-0 w-full will-change-transform"
          style={{
            height: `${SOIL_TILE_HEIGHT_PX * 2}px`,
            transform: `translate3d(0, ${tileOffsetY}px, 0)`,
          }}
        >
          {[0, 1].map((tileIdx) => (
            <div
              key={tileIdx}
              className="w-full relative overflow-hidden"
              style={{ height: `${SOIL_TILE_HEIGHT_PX}px` }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 1440 960"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id={`soilBase-${tileIdx}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#1A110A" />
                    <stop offset="25%" stopColor="#23160E" />
                    <stop offset="50%" stopColor="#170F09" />
                    <stop offset="75%" stopColor="#21150D" />
                    <stop offset="100%" stopColor="#1A110A" />
                  </linearGradient>
                </defs>

                <rect
                  width="1440"
                  height="960"
                  fill={`url(#soilBase-${tileIdx})`}
                />

                <path
                  d="M0,120 C360,95 720,145 1080,115 C1260,100 1350,110 1440,120 L1440,290 C1080,315 720,265 360,295 C180,310 90,300 0,290 Z"
                  fill="#2B1B11"
                  fillOpacity="0.55"
                />

                <path
                  d="M0,430 C420,465 840,400 1220,440 C1330,450 1390,440 1440,430 L1440,610 C1020,580 620,640 240,605 C120,595 60,605 0,610 Z"
                  fill="#120B06"
                  fillOpacity="0.65"
                />

                <path
                  d="M0,740 C380,710 790,770 1160,735 C1300,722 1380,730 1440,740 L1440,890 C1060,920 680,860 310,895 C150,910 70,900 0,890 Z"
                  fill="#291A10"
                  fillOpacity="0.5"
                />

                <path
                  d="M0,120 C360,95 720,145 1080,115 C1260,100 1350,110 1440,120"
                  stroke="#BD8564"
                  strokeOpacity="0.14"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M0,290 C180,310 360,295 720,265 C1080,315 1260,295 1440,290"
                  stroke="#FAD9BA"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="6 6"
                />
                <path
                  d="M0,430 C420,465 840,400 1220,440 C1330,450 1390,440 1440,430"
                  stroke="#BD8564"
                  strokeOpacity="0.14"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M0,610 C120,595 240,605 620,640 C1020,580 1250,600 1440,610"
                  stroke="#FAD9BA"
                  strokeOpacity="0.09"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M0,740 C380,710 790,770 1160,735 C1300,722 1380,730 1440,740"
                  stroke="#BD8564"
                  strokeOpacity="0.13"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="10 8"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Parallax Soil Mineral Grains & Sediment Speckles Moving Upward */}
        <div
          className="absolute left-0 right-0 w-full opacity-25 will-change-transform"
          style={{
            height: "1440px",
            transform: `translate3d(0, ${parallaxGrainOffsetY}px, 0)`,
            backgroundImage:
              "radial-gradient(#FAD9BA 1px, transparent 1px), radial-gradient(#BD8564 1.5px, transparent 1.5px)",
            backgroundSize: "64px 64px, 96px 96px",
            backgroundPosition: "0 0, 32px 40px",
          }}
        />

        {/* Subtle radial vignette to frame the subterranean cavern */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 62%, transparent 25%, rgba(12, 7, 4, 0.55) 100%)",
          }}
        />
      </div>

      {/* =====================================================================
          2. EXCAVATED BOREHOLE CAVITY & INFINITE DRILLING CPT CONE
         ===================================================================== */}
      <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto">
        <div className="absolute top-0 bottom-0 left-10 sm:left-14 lg:left-1/2 -translate-x-1/2 w-24 flex justify-center pointer-events-none z-20">
          {/* A. Excavated Borehole Shaft Wall (From top of screen down to Cone Tip) */}
          <div
            className="absolute top-0 w-7 sm:w-8 bg-[#0B0604] border-x border-[#BD8564]/35 shadow-[inset_0_0_16px_rgba(0,0,0,0.95)] overflow-hidden"
            style={{ height: `${coneTipY}px` }}
          >
            <div
              className="w-full will-change-transform opacity-40"
              style={{
                height: `${SOIL_TILE_HEIGHT_PX * 2}px`,
                transform: `translate3d(0, ${tileOffsetY}px, 0)`,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 18px, rgba(189,133,100,0.35) 18px, rgba(189,133,100,0.35) 20px)",
              }}
            />
          </div>

          {/* B. Uncut Soil Target Projection Line Below Cone Tip */}
          <div
            className="absolute bottom-0 w-[1px] border-l border-dashed border-[#FAD9BA]/15"
            style={{ top: `${coneTipY + 24}px` }}
          />

          {/* C. Steel CPT Push Rod String (Extends from top of screen down to Cone Tip) */}
          <div
            className="absolute top-0 w-3 sm:w-3.5 border-x border-[#FAD9BA]/60 shadow-[0_0_20px_rgba(250,217,186,0.2)] z-20"
            style={{
              height: `${coneTipY + coneVibrationY}px`,
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0px, transparent 68px, rgba(20,13,8,0.9) 68px, rgba(20,13,8,0.9) 71px), linear-gradient(to right, #4A280A 0%, #BD8564 25%, #FAD9BA 50%, #8C583A 78%, #2E1805 100%)",
            }}
          />

          {/* D. THE ASTM D5778 60-DEGREE CPT CONE PENETROMETER TIP ASSEMBLY */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center will-change-transform"
            style={{
              top: `${coneTipY + coneVibrationY - 22}px`,
            }}
          >
            {/* Tapered Rod-to-Sleeve Coupling Ring */}
            <div className="w-4 sm:w-5 h-2 bg-gradient-to-r from-[#381800] via-[#FAD9BA] to-[#381800] border-x border-t border-[#FAD9BA]/80" />

            {/* Friction Sleeve Collar */}
            <div className="w-5 sm:w-6 h-7 bg-gradient-to-r from-[#271C14] via-[#D8A47F] to-[#1C130D] border border-[#FAD9BA]/85 flex flex-col items-center justify-between py-1 shadow-lg">
              <div className="w-full h-[1px] bg-[#FAD9BA]/50" />
              <div className="w-full h-[1px] bg-[#FAD9BA]/30" />
              <div className="w-full h-1.5 bg-[#10B981] shadow-[0_0_10px_#10B981]" />
            </div>

            {/* 60-Degree Conical Penetrometer Point */}
            <div className="relative flex flex-col items-center">
              <svg
                className="w-7 sm:w-8 h-7 drop-shadow-[0_8px_20px_rgba(250,217,186,0.65)]"
                viewBox="0 0 32 28"
                fill="none"
              >
                <polygon
                  points="2,1 30,1 16,26"
                  fill="url(#infiniteCptConeGrad)"
                  stroke="#FAD9BA"
                  strokeWidth="1.6"
                />
                <polygon
                  points="16,1 30,1 16,26"
                  fill="#FFFFFF"
                  fillOpacity="0.22"
                />
                <circle cx="16" cy="24" r="2" fill="#10B981" />
                <defs>
                  <linearGradient
                    id="infiniteCptConeGrad"
                    x1="2"
                    y1="1"
                    x2="30"
                    y2="26"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FAD9BA" />
                    <stop offset="0.5" stopColor="#BD8564" />
                    <stop offset="1" stopColor="#5A3008" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Continuous Drilling Pressure Waves at the Cone Tip */}
              <span className="absolute top-3 w-10 h-10 rounded-full border border-[#FAD9BA]/55 animate-ping pointer-events-none" />
              <span className="absolute top-1 w-16 h-16 rounded-full border border-[#10B981]/35 animate-pulse pointer-events-none" />

              {/* Displaced Soil Particles Flowing Upward Past the Cone Tip */}
              {[
                { left: "-14px", delay: "0s", size: "w-1.5 h-1.5" },
                { left: "16px", delay: "0.3s", size: "w-1 h-1" },
                { left: "-20px", delay: "0.55s", size: "w-1 h-1" },
                { left: "22px", delay: "0.15s", size: "w-1.5 h-1.5" },
              ].map((p, i) => (
                <span
                  key={i}
                  className={`absolute top-4 ${p.size} rounded-full bg-[#FAD9BA]/70 animate-bounce pointer-events-none`}
                  style={{
                    marginLeft: p.left,
                    animationDelay: p.delay,
                    animationDuration: "0.75s",
                  }}
                />
              ))}

              {/* Extra Sonar Burst when a Feedback Pocket is Struck */}
              {pulseKey > 0 && (
                <span
                  key={`burst-${pulseKey}`}
                  className="absolute -top-2 w-24 h-24 rounded-full border-2 border-[#10B981]/70 animate-ping pointer-events-none"
                  style={{
                    animationDuration: "0.9s",
                    animationIterationCount: 1,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* =====================================================================
            3. FEEDBACK CARDS MOVING UPWARD WITH THE EXCAVATED SOIL
           ===================================================================== */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {spawnedCards.map((card) => {
            const drilledPastPx = distanceDrilledPx - card.spawnDistancePx
            const cardY = coneTipY - drilledPastPx

            const entranceProgress = Math.max(
              0,
              Math.min(1, drilledPastPx / 55)
            )
            // Right-side cards fade out smoothly before reaching the top-right floating QR card
            const topFadeThreshold = card.side === "right" ? 210 : 60
            const exitProgress =
              cardY < topFadeThreshold
                ? Math.max(0, Math.min(1, (cardY + 80) / (topFadeThreshold + 80)))
                : 1
            const opacity = entranceProgress * exitProgress
            const scale = 0.92 + 0.08 * entranceProgress

            const isFreshlyStruck = drilledPastPx >= 0 && drilledPastPx < 190

            return (
              <div
                key={card.uid}
                className="absolute left-0 right-0 px-4 sm:px-8 lg:px-14 will-change-transform"
                style={{
                  transform: `translate3d(0, ${cardY}px, 0) translateY(-50%)`,
                  opacity,
                }}
              >
                <div
                  className={`w-full flex items-center relative pl-14 sm:pl-20 lg:pl-0 ${
                    card.side === "left" ? "lg:justify-start" : "lg:justify-end"
                  }`}
                >
                  {/* Node Pin on the Borehole Wall */}
                  <div
                    className={`absolute left-6 sm:left-6 lg:left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 transition-colors duration-300 ${
                      isFreshlyStruck
                        ? "bg-[#10B981] border-[#FAD9BA] shadow-[0_0_14px_#10B981]"
                        : "bg-[#271C14] border-[#BD8564]"
                    }`}
                  />

                  {/* Desktop Horizontal Connector Beam from Center Borehole to Card */}
                  <div
                    className={`hidden lg:block absolute top-1/2 -translate-y-1/2 h-[1px] w-[7.5%] bg-gradient-to-r ${
                      card.side === "left"
                        ? "right-1/2 mr-3 from-[#FAD9BA]/80 to-[#10B981]"
                        : "left-1/2 ml-3 from-[#10B981] to-[#FAD9BA]/80"
                    }`}
                  />

                  {/* Mobile/Tablet Connector Beam from Left Borehole to Card */}
                  <div className="lg:hidden absolute left-6 sm:left-6 top-1/2 -translate-y-1/2 h-[1px] w-8 sm:w-14 bg-[#10B981]/80" />

                  {/* Feedback Card (Only Nama if present, Latar Belakang, and Masukan) */}
                  <article
                    style={{
                      transform: `scale(${scale})`,
                    }}
                    className={`pointer-events-auto w-full lg:w-[41%] bg-[#21160F]/95 backdrop-blur-md border p-4 sm:p-6 shadow-2xl transition-colors duration-500 relative overflow-hidden ${
                      isFreshlyStruck
                        ? "border-[#FAD9BA] shadow-[0_12px_38px_rgba(250,217,186,0.16)]"
                        : "border-[#EFE7DE]/20"
                    }`}
                  >
                    {/* Top Highlight Strip */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-500 ${
                        isFreshlyStruck
                          ? "bg-gradient-to-r from-[#10B981] via-[#FAD9BA] to-[#BD8564]"
                          : "bg-[#BD8564]/35"
                      }`}
                    />

                    {/* Header: Nama (jika ada) & Latar Belakang */}
                    <div className="flex flex-wrap items-center gap-2.5 pb-3 mb-3 border-b border-[#EFE7DE]/12">
                      {card.item.full_name && (
                        <h2 className="font-sans font-bold text-base sm:text-lg text-[#FAD9BA] tracking-tight">
                          {card.item.full_name}
                        </h2>
                      )}
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 bg-[#140D08] border border-[#BD8564]/50 text-[#EFE7DE]/90 font-semibold">
                        {card.item.role}
                      </span>
                    </div>

                    {/* Body: Masukan */}
                    <p className="font-sans text-sm sm:text-base text-[#EFE7DE]/95 leading-relaxed">
                      "{card.item.feedback_notes}"
                    </p>
                  </article>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

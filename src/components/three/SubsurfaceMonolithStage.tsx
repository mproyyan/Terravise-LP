import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSubsurface3D, type MonolithStage } from "../../context/Subsurface3DContext"
import { SubsurfaceMonolithCanvas } from "./SubsurfaceMonolithCanvas"
import { MOCK_CPT_TEST_PIPES } from "../../data/mockGeology"
import { Rotate3d, X, MapPin, Layers, ArrowDownToLine } from "lucide-react"

interface StageCaptionMeta {
  code: string
  caption: string
  isDarkSection: boolean
}

const STAGE_CAPTION_MAP: Record<MonolithStage, StageCaptionMeta> = {
  hero: {
    code: "FIG 00",
    caption: "ARCHITECTURAL TOWER & 25.0M SUBSURFACE MONOLITH",
    isDarkSection: false,
  },
  problem: {
    code: "FIG 01",
    caption: "PANORAMIC 3-ZONE GEOLOGICAL TRENCH: OVER-DRILLING · SOFT CLAY LENS · BUDGET CUTOFF",
    isDarkSection: false,
  },
  dqn: {
    code: "FIG 02",
    caption: "3D NEURAL PATHFINDING ARCS & 144-NODE GEODETIC RADAR TABLE",
    isDarkSection: true,
  },
  voxel: {
    code: "FIG 03",
    caption: "SMOOTH 3D BOUNDARY VOLUME & 5 CPT TEST PIPES (CLICK ANY PIPE FOR SOIL LOG)",
    isDarkSection: true,
  },
  stratum: {
    code: "FIG 04",
    caption: "3D TOP-OF-BEARING DEPTH HEATMAP (zb) & 8 STRUCTURAL PILE PROBES",
    isDarkSection: false,
  },
  workflow: {
    code: "FIG 05",
    caption: "FIELD TELEMETRY HANDOFF",
    isDarkSection: true,
  },
}

const DOCKED_STAGES: MonolithStage[] = ["hero", "problem", "dqn", "voxel", "stratum"]

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

export function SubsurfaceMonolithStage() {
  const {
    activeStage,
    dockElementsRef,
    sceneStateRef,
    selectedPipeId,
    setSelectedPipeId,
    pipeScreenCoords,
  } = useSubsurface3D()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const hudBoxRef = useRef<HTMLDivElement>(null)

  const meta = STAGE_CAPTION_MAP[activeStage] || STAGE_CAPTION_MAP.hero
  const selectedPipe = MOCK_CPT_TEST_PIPES.find((p) => p.id === selectedPipeId) || null
  const showPipePopover = activeStage === "voxel" && selectedPipe !== null

  useEffect(() => {
    let rafId = 0

    const updatePosition = () => {
      const wrapper = wrapperRef.current
      const hudBox = hudBoxRef.current
      if (!wrapper || !hudBox) return

      const docks = DOCKED_STAGES.map((stage) => ({
        stage,
        el: dockElementsRef.current[stage],
      })).filter((d): d is { stage: MonolithStage; el: HTMLDivElement } => Boolean(d.el))

      if (docks.length === 0) return

      const rects = docks.map((d) => ({
        stage: d.stage,
        rect: d.el.getBoundingClientRect(),
      }))

      const vpCenterY = window.innerHeight * 0.5

      let targetLeft = rects[0].rect.left
      let targetTop = rects[0].rect.top
      let targetWidth = rects[0].rect.width
      let targetHeight = rects[0].rect.height
      let targetOpacity = 1

      const firstCenterY = rects[0].rect.top + rects[0].rect.height / 2
      const lastIdx = rects.length - 1
      const lastRect = rects[lastIdx].rect
      const lastCenterY = lastRect.top + lastRect.height / 2

      if (firstCenterY >= vpCenterY) {
        targetLeft = rects[0].rect.left
        targetTop = rects[0].rect.top
        targetWidth = rects[0].rect.width
        targetHeight = rects[0].rect.height
        sceneStateRef.current.transitionFrom = rects[0].stage
        sceneStateRef.current.transitionTo = rects[0].stage
        sceneStateRef.current.transitionT = 0
      } else if (lastCenterY <= vpCenterY) {
        targetLeft = lastRect.left
        targetTop = lastRect.top
        targetWidth = lastRect.width
        targetHeight = lastRect.height
        sceneStateRef.current.transitionFrom = rects[lastIdx].stage
        sceneStateRef.current.transitionTo = rects[lastIdx].stage
        sceneStateRef.current.transitionT = 0

        const fadeStart = window.innerHeight * 0.5
        const fadeEnd = window.innerHeight * 0.12
        const rawFade = (lastCenterY - fadeEnd) / Math.max(1, fadeStart - fadeEnd)
        targetOpacity = smoothstep(rawFade)
      } else {
        for (let i = 0; i < rects.length - 1; i++) {
          const curr = rects[i]
          const next = rects[i + 1]
          const cY1 = curr.rect.top + curr.rect.height / 2
          const cY2 = next.rect.top + next.rect.height / 2

          if (cY1 <= vpCenterY && cY2 >= vpCenterY) {
            const rawT = (vpCenterY - cY1) / Math.max(1, cY2 - cY1)
            const t = smoothstep(rawT)

            targetLeft = curr.rect.left + (next.rect.left - curr.rect.left) * t
            targetTop = curr.rect.top + (next.rect.top - curr.rect.top) * rawT
            targetWidth = curr.rect.width + (next.rect.width - curr.rect.width) * t
            targetHeight = curr.rect.height + (next.rect.height - curr.rect.height) * t

            sceneStateRef.current.transitionFrom = curr.stage
            sceneStateRef.current.transitionTo = next.stage
            sceneStateRef.current.transitionT = t
            break
          }
        }
      }

      // Pass exact dock center to Three.js full-viewport camera.setViewOffset
      sceneStateRef.current.stageRect = {
        centerX: targetLeft + targetWidth / 2,
        centerY: targetTop + targetHeight / 2,
        left: targetLeft,
        top: targetTop,
        width: targetWidth,
        height: targetHeight,
        opacity: targetOpacity,
      }

      wrapper.style.opacity = `${targetOpacity.toFixed(3)}`
      hudBox.style.transform = `translate3d(${Math.round(targetLeft)}px, ${Math.round(targetTop)}px, 0)`
      hudBox.style.width = `${Math.round(targetWidth)}px`
      hudBox.style.height = `${Math.round(targetHeight)}px`
      hudBox.style.pointerEvents = targetOpacity < 0.15 ? "none" : "auto"
    }

    const onScrollOrResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updatePosition)
    }

    updatePosition()
    const initTimer = setTimeout(updatePosition, 60)

    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize, { passive: true })

    return () => {
      clearTimeout(initTimer)
      cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
    }
  }, [dockElementsRef, sceneStateRef])

  return (
    <div
      ref={wrapperRef}
      className="hidden lg:block fixed inset-0 z-20 pointer-events-none overflow-hidden"
    >
      {/* Full-Viewport 100vw x 100vh Three.js Canvas (Never clipped by a small box!) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SubsurfaceMonolithCanvas />
      </div>

      {/* Interactive Hit Area & Floating Figure Caption over the Active Stage Zone */}
      <div
        ref={hudBoxRef}
        style={{ willChange: "transform, width, height" }}
        className="absolute top-0 left-0 flex flex-col justify-end pointer-events-none"
      >
        {/* Interactive 3D Pipe Click Popover (Anchored to Clicked Test Pipe in Section 03) */}
        <AnimatePresence mode="wait">
          {showPipePopover && selectedPipe && (
            <motion.div
              key={selectedPipe.id}
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{
                left: pipeScreenCoords
                  ? `${Math.min(68, Math.max(4, pipeScreenCoords.xPct))}%`
                  : "54%",
                top: pipeScreenCoords
                  ? `${Math.min(42, Math.max(4, pipeScreenCoords.yPct - 16))}%`
                  : "10%",
              }}
              className="absolute z-30 w-72 bg-[#150E09]/95 backdrop-blur-md border border-[#FAD9BA]/50 shadow-2xl p-3.5 font-mono text-xs text-[#EFE7DE] pointer-events-auto select-none"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#EFE7DE]/15 pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#10B981] inline-block animate-pulse" />
                    <span className="font-bold text-[#FAD9BA] text-xs tracking-wider">
                      {selectedPipe.code} · {selectedPipe.sector}
                    </span>
                  </div>
                  <div className="text-[9px] text-[#EFE7DE]/60 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-[#BD8564]" />
                    <span>{selectedPipe.utm}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPipeId(null)}
                  aria-label="Close pipe popover"
                  className="text-[#EFE7DE]/50 hover:text-[#FAD9BA] p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="py-2.5 space-y-1.5">
                <div className="text-[9px] uppercase tracking-wider text-[#BD8564] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" />
                    Stratigraphic log at pipe
                  </span>
                  <span>qc / Ic</span>
                </div>

                {selectedPipe.layers.map((layer) => (
                  <div
                    key={layer.layerName}
                    className="bg-[#271C14]/90 border border-[#EFE7DE]/10 px-2 py-1.5 flex items-center justify-between gap-2 text-[10px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-5 shrink-0"
                        style={{ backgroundColor: layer.colorHex }}
                      />
                      <div className="min-w-0">
                        <div className="font-sans font-bold text-[11px] text-[#EFE7DE] truncate">
                          {layer.layerName}
                        </div>
                        <div className="text-[9px] text-[#EFE7DE]/55 tabular-nums">
                          {layer.depthRange} ({layer.thicknessM.toFixed(1)}m)
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <div className="font-bold text-[#FAD9BA]">{layer.qcMpa} MPa</div>
                      <div className="text-[8px] text-[#EFE7DE]/50">Ic {layer.icValue}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#EFE7DE]/15 flex items-center justify-between text-[9px]">
                <span className="text-[#EFE7DE]/60 flex items-center gap-1">
                  <ArrowDownToLine className="w-3 h-3 text-[#10B981]" />
                  Bearing top:{" "}
                  <strong className="text-[#10B981]">{selectedPipe.bearingDepthM}m</strong>
                </span>
                <span className="text-[#FAD9BA]">
                  Total: {selectedPipe.terminationDepthM}m
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimalist Floating Architectural Figure Tag */}
        <div className="relative z-10 pb-1 flex items-center justify-center pointer-events-none select-none">
          <div
            className={`px-3 py-1 backdrop-blur-xs border font-mono text-[9px] tracking-[0.14em] uppercase flex items-center gap-2.5 transition-colors duration-300 ${
              meta.isDarkSection
                ? "bg-[#1C130D]/75 border-[#EFE7DE]/15 text-[#EFE7DE]/80"
                : "bg-[#FBF7F2]/80 border-[#1C130D]/15 text-[#1C130D]/80"
            }`}
          >
            <span className="font-bold text-[#7A421D]">{meta.code}</span>
            <span className="truncate max-w-[460px]">{meta.caption}</span>
            <span className="inline-flex items-center gap-1 opacity-65 pl-1.5 border-l border-current/20">
              <Rotate3d className="w-3 h-3" />
              Drag 3D
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

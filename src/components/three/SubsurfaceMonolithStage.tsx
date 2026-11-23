import { useEffect, useRef } from "react"
import { useSubsurface3D, type MonolithStage } from "../../context/Subsurface3DContext"
import { SubsurfaceMonolithCanvas } from "./SubsurfaceMonolithCanvas"
import { Rotate3d } from "lucide-react"

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
    caption: "ISOLATED SOFT CLAY ANOMALY LENS (-6.5M TO -14.0M) VS. 25M BLIND GRID",
    isDarkSection: false,
  },
  dqn: {
    code: "FIG 02",
    caption: "144-NODE GEODETIC CANDIDATE RADAR & SPOT 2 LASER VECTOR",
    isDarkSection: true,
  },
  voxel: {
    code: "FIG 03",
    caption: "480-CUBE 3D ROBERTSON SBT VOXEL MATRIX",
    isDarkSection: true,
  },
  stratum: {
    code: "FIG 04",
    caption: "8 REINFORCED PILES SOCKETED INTO UNDULATING BEARING STRATUM (qc >= 15 MPa)",
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
  const { activeStage, dockElementsRef, sceneStateRef } = useSubsurface3D()
  const stageBoxRef = useRef<HTMLDivElement>(null)

  const meta = STAGE_CAPTION_MAP[activeStage] || STAGE_CAPTION_MAP.hero

  useEffect(() => {
    let rafId = 0

    const updatePosition = () => {
      const box = stageBoxRef.current
      if (!box) return

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
      let targetScale = 1

      const firstCenterY = rects[0].rect.top + rects[0].rect.height / 2
      const lastIdx = rects.length - 1
      const lastRect = rects[lastIdx].rect
      const lastCenterY = lastRect.top + lastRect.height / 2

      if (firstCenterY >= vpCenterY) {
        // Locked cleanly to Hero open stage
        targetLeft = rects[0].rect.left
        targetTop = rects[0].rect.top
        targetWidth = rects[0].rect.width
        targetHeight = rects[0].rect.height
        sceneStateRef.current.transitionFrom = rects[0].stage
        sceneStateRef.current.transitionTo = rects[0].stage
        sceneStateRef.current.transitionT = 0
      } else if (lastCenterY <= vpCenterY) {
        // Smooth exit as user scrolls from Section 04 (Bearing Stratum) into Section 05 (Workflow)
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
        targetScale = 0.88 + 0.12 * targetOpacity
      } else {
        // Continuous interpolation between adjacent section stages
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

      box.style.transform = `translate3d(${Math.round(targetLeft)}px, ${Math.round(targetTop)}px, 0) scale(${targetScale.toFixed(3)})`
      box.style.width = `${Math.round(targetWidth)}px`
      box.style.height = `${Math.round(targetHeight)}px`
      box.style.opacity = `${targetOpacity.toFixed(3)}`
      box.style.pointerEvents = targetOpacity < 0.15 ? "none" : "auto"
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
    <div className="hidden lg:block fixed inset-0 z-20 pointer-events-none overflow-hidden">
      <div
        ref={stageBoxRef}
        style={{ willChange: "transform, width, height, opacity" }}
        className="absolute top-0 left-0 flex flex-col justify-end"
      >
        {/* Full-Bleed Borderless Three.js Visualizer Canvas */}
        <div className="absolute inset-0 z-0">
          <SubsurfaceMonolithCanvas />
        </div>

        {/* Minimalist Floating Architectural Figure Tag (No heavy boxes) */}
        <div className="relative z-10 pb-2 flex items-center justify-center pointer-events-none select-none">
          <div
            className={`px-3 py-1 backdrop-blur-xs border font-mono text-[9px] tracking-[0.14em] uppercase flex items-center gap-2.5 transition-colors duration-300 ${
              meta.isDarkSection
                ? "bg-[#1C130D]/75 border-[#EFE7DE]/15 text-[#EFE7DE]/80"
                : "bg-[#FBF7F2]/80 border-[#1C130D]/15 text-[#1C130D]/80"
            }`}
          >
            <span className="font-bold text-[#7A421D]">{meta.code}</span>
            <span className="truncate max-w-[360px]">{meta.caption}</span>
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

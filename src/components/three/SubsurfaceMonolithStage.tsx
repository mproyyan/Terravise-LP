import { useEffect, useRef } from "react"
import { useSubsurface3D, type MonolithStage } from "../../context/Subsurface3DContext"
import { SubsurfaceMonolithCanvas } from "./SubsurfaceMonolithCanvas"
import { Compass, Layers, Crosshair, Box, ArrowDownToLine, Rotate3d } from "lucide-react"

interface StageHudMeta {
  code: string
  title: string
  depthTag: string
  activeLayer: string
  telemetry: string
}

const STAGE_HUD_MAP: Record<MonolithStage, StageHudMeta> = {
  hero: {
    code: "FIG 00 / MONOLITH OVERVIEW",
    title: "Structural tower + 25.0m soil profile",
    depthTag: "0.0 m to -25.0 m",
    activeLayer: "All strata intact (4 horizons)",
    telemetry: "Building load: 18.4 MPa demand",
  },
  problem: {
    code: "FIG 01 / EXPLODED STRATA FRACTURE",
    title: "Undetected soft clay pocket (-6.5m to -14.0m)",
    depthTag: "CRITICAL ZONE: -8.5 m",
    activeLayer: "Layer 03: Soft sensitive marine clay",
    telemetry: "Fixed 25m grid misses central clay lens",
  },
  dqn: {
    code: "FIG 02 / DQN VECTOR INTERSECTION",
    title: "Spot 2 target penetrometer routing",
    depthTag: "TARGET DEPTH: -15.1 m",
    activeLayer: "Spot 2 (48S 704120m E, 9309850m N)",
    telemetry: "Expected certainty gain: +14.2%",
  },
  voxel: {
    code: "FIG 03 / ORTHOGONAL VOXEL CUTTER",
    title: "Real-time Easting & Northing clipping planes",
    depthTag: "VOLUME: 120m × 80m × 25m",
    activeLayer: "Robertson 9-zone SBT cross-section",
    telemetry: "Drag X/Y sliders to slice 3D mesh",
  },
  stratum: {
    code: "FIG 04 / DEEP FOUNDATION PILE TRANSFER",
    title: "8 structural piles socketed into dense sand",
    depthTag: "BEARING: -14.8 m to -25.0 m",
    activeLayer: "Layer 04: Dense sand (qc >= 15 MPa)",
    telemetry: "Continuous thickness > 2.0m verified",
  },
  workflow: {
    code: "FIG 05 / FIELD CAD HANDOFF",
    title: "Complete structural & geotechnical assembly",
    depthTag: "DATUM: DGN95 UTM 48S",
    activeLayer: "Ready for CSV, LandXML & DXF export",
    telemetry: "100% on-device Apple silicon neural engine",
  },
}

const DOCKED_STAGES: MonolithStage[] = ["hero", "problem", "dqn", "voxel", "stratum"]

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

export function SubsurfaceMonolithStage() {
  const { activeStage, sliceX, sliceY, bearingCriteria, dockElementsRef, sceneStateRef } =
    useSubsurface3D()
  const stageBoxRef = useRef<HTMLDivElement>(null)

  const hud = STAGE_HUD_MAP[activeStage] || STAGE_HUD_MAP.hero
  const isLeftAligned = activeStage === "dqn"

  // Synchronize exact pixel bounding box with the registered Section3DAnchorDock elements
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

      // Viewport anchor point (vertical center below sticky navbar)
      const vpCenterY = window.innerHeight * 0.52

      let targetLeft = rects[0].rect.left
      let targetTop = rects[0].rect.top
      let targetWidth = rects[0].rect.width
      let targetHeight = rects[0].rect.height
      let targetOpacity = 1

      const firstCenterY = rects[0].rect.top + rects[0].rect.height / 2
      const lastIdx = rects.length - 1
      const lastCenterY = rects[lastIdx].rect.top + rects[lastIdx].rect.height / 2

      if (firstCenterY >= vpCenterY) {
        // Above or at Hero dock: lock 1:1 to Hero dock
        targetLeft = rects[0].rect.left
        targetTop = rects[0].rect.top
        targetWidth = rects[0].rect.width
        targetHeight = rects[0].rect.height
        sceneStateRef.current.transitionFrom = rects[0].stage
        sceneStateRef.current.transitionTo = rects[0].stage
        sceneStateRef.current.transitionT = 0
      } else if (lastCenterY <= vpCenterY) {
        // Scrolled at or below the final 3D dock (Bearing Stratum): lock 1:1 to Stratum dock so it scrolls away cleanly before Section 05 Workflow
        targetLeft = rects[lastIdx].rect.left
        targetTop = rects[lastIdx].rect.top
        targetWidth = rects[lastIdx].rect.width
        targetHeight = rects[lastIdx].rect.height
        sceneStateRef.current.transitionFrom = rects[lastIdx].stage
        sceneStateRef.current.transitionTo = rects[lastIdx].stage
        sceneStateRef.current.transitionT = 0

        if (rects[lastIdx].rect.bottom < 80) {
          targetOpacity = 0
        }
      } else {
        // Interpolate smoothly between the dock above vpCenterY and the dock below vpCenterY
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

      box.style.transform = `translate3d(${Math.round(targetLeft)}px, ${Math.round(targetTop)}px, 0)`
      box.style.width = `${Math.round(targetWidth)}px`
      box.style.height = `${Math.round(targetHeight)}px`
      box.style.opacity = `${targetOpacity}`
      box.style.pointerEvents = targetOpacity < 0.1 ? "none" : "auto"
    }

    const onScrollOrResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updatePosition)
    }

    updatePosition()
    // Run a short initial sync after layout settles
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

  const getStageIcon = (stage: MonolithStage) => {
    switch (stage) {
      case "hero":
        return <Compass className="w-3.5 h-3.5 text-[#FAD9BA]" />
      case "problem":
        return <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
      case "dqn":
        return <Crosshair className="w-3.5 h-3.5 text-[#10B981]" />
      case "voxel":
        return <Box className="w-3.5 h-3.5 text-[#FAD9BA]" />
      case "stratum":
      default:
        return <ArrowDownToLine className="w-3.5 h-3.5 text-[#E76F51]" />
    }
  }

  return (
    <div className="hidden lg:block fixed inset-0 z-20 pointer-events-none overflow-hidden">
      <div
        ref={stageBoxRef}
        style={{ willChange: "transform, width, height, opacity" }}
        className="absolute top-0 left-0 flex flex-col justify-between transition-opacity duration-200"
      >
        {/* Top Architectural CAD Telemetry Bar (Fits inside dock top margin) */}
        <div className="mx-3 mt-3 bg-[#1C130D]/95 backdrop-blur-md border border-[#EFE7DE]/20 px-3 py-2 shadow-lg flex items-center justify-between font-mono text-[10px] text-[#EFE7DE] select-none z-10 pointer-events-auto">
          <div className="flex items-center gap-2 min-w-0">
            {getStageIcon(activeStage)}
            <span className="font-bold tracking-wider uppercase text-[#FAD9BA] truncate">
              {hud.code}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#EFE7DE]/70 tabular-nums shrink-0">
            <span className="hidden xl:inline">{hud.depthTag}</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#271C14] border border-[#EFE7DE]/15 text-[9px] text-[#EFE7DE]">
              <Rotate3d className="w-3 h-3 text-[#BD8564]" />
              Drag 3D
            </span>
          </div>
        </div>

        {/* Live Three.js Monolith Canvas */}
        <div className="absolute inset-0 z-0">
          <SubsurfaceMonolithCanvas />
        </div>

        {/* Bottom Exploded Layer & Section Telemetry Readout (Fits inside dock bottom margin) */}
        <div
          className={`mx-3 mb-3 bg-[#1C130D]/95 backdrop-blur-md border border-[#EFE7DE]/20 p-2.5 shadow-lg font-mono text-xs text-[#EFE7DE] select-none z-10 pointer-events-auto transition-colors ${
            isLeftAligned ? "border-l-2 border-l-[#10B981]" : "border-l-2 border-l-[#FAD9BA]"
          }`}
        >
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#EFE7DE]/15">
            <span className="font-sans font-bold text-xs text-[#EFE7DE] tracking-tight truncate">
              {hud.title}
            </span>
            {activeStage === "voxel" && (
              <span className="text-[10px] text-[#FAD9BA] tabular-nums shrink-0">
                Cut X:{sliceX}% · Y:{sliceY}%
              </span>
            )}
            {activeStage === "stratum" && (
              <span className="text-[10px] text-[#E76F51] font-bold tabular-nums shrink-0">
                qc &gt;= {bearingCriteria.minQc.toFixed(1)} MPa
              </span>
            )}
          </div>
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <span className="text-[#EFE7DE]/75 truncate">{hud.activeLayer}</span>
            <span className="text-[#FAD9BA] font-semibold truncate">{hud.telemetry}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

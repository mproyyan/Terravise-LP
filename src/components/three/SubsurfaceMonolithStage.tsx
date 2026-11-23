import { useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useSubsurface3D, type MonolithStage } from "../../context/Subsurface3DContext"
import { SubsurfaceMonolithCanvas } from "./SubsurfaceMonolithCanvas"
import { Compass, Layers, Crosshair, Box, ArrowDownToLine, Rotate3d } from "lucide-react"

interface StageHudMeta {
  code: string
  title: string
  depthTag: string
  activeLayer: string
  telemetry: string
  accentColor: string
}

const STAGE_HUD_MAP: Record<MonolithStage, StageHudMeta> = {
  hero: {
    code: "FIG 00 / MONOLITH OVERVIEW",
    title: "Structural tower + 25.0m soil profile",
    depthTag: "0.0 m to -25.0 m",
    activeLayer: "All strata intact (4 horizons)",
    telemetry: "Building load: 18.4 MPa foundation demand",
    accentColor: "#FAD9BA",
  },
  problem: {
    code: "FIG 01 / EXPLODED STRATA FRACTURE",
    title: "Undetected soft clay pocket (-6.5m to -14.0m)",
    depthTag: "CRITICAL ZONE: -8.5 m",
    activeLayer: "Layer 03: Soft sensitive marine clay",
    telemetry: "Fixed 25m grid (B-01..B-03) misses central clay lens",
    accentColor: "#F59E0B",
  },
  dqn: {
    code: "FIG 02 / DQN VECTOR INTERSECTION",
    title: "Spot 2 target penetrometer routing",
    depthTag: "TARGET DEPTH: -15.1 m",
    activeLayer: "Spot 2 crosshair (48S 704120m E, 9309850m N)",
    telemetry: "Expected ground certainty gain: +14.2%",
    accentColor: "#10B981",
  },
  voxel: {
    code: "FIG 03 / ORTHOGONAL VOXEL CUTTER",
    title: "Real-time Easting & Northing clipping planes",
    depthTag: "SLICING VOLUME: 120m × 80m × 25m",
    activeLayer: "Robertson 9-zone SBT internal cross-section",
    telemetry: "Use X/Y sliders to cut 3D subsurface mesh",
    accentColor: "#FAD9BA",
  },
  stratum: {
    code: "FIG 04 / DEEP FOUNDATION PILE TRANSFER",
    title: "8 structural piles socketed into dense sand",
    depthTag: "BEARING HORIZON: -14.8 m to -25.0 m",
    activeLayer: "Layer 04: Competent dense sand (qc >= 15 MPa)",
    telemetry: "Continuous bearing thickness > 2.0m verified",
    accentColor: "#E76F51",
  },
  workflow: {
    code: "FIG 05 / FIELD CAD HANDOFF",
    title: "Complete structural & geotechnical assembly",
    depthTag: "DATUM: DGN95 UTM 48S",
    activeLayer: "Ready for CSV, LandXML & DXF export",
    telemetry: "100% on-device Apple silicon neural engine",
    accentColor: "#FAD9BA",
  },
}

const willChangeStyle = { willChange: "transform, opacity" } as const

export function SubsurfaceMonolithStage() {
  const { activeStage, sliceX, sliceY, bearingCriteria } = useSubsurface3D()
  const shouldReduceMotion = useReducedMotion()

  const hud = STAGE_HUD_MAP[activeStage] || STAGE_HUD_MAP.hero
  const isHiddenStage = activeStage === "workflow"
  const isLeftAligned = activeStage === "dqn"

  const desktopVariants = useMemo(
    () => ({
      hero: {
        x: "23%",
        y: "0%",
        scale: 1.0,
        opacity: 1,
      },
      problem: {
        x: "23%",
        y: "0%",
        scale: 0.98,
        opacity: 1,
      },
      dqn: {
        x: "-22%",
        y: "1%",
        scale: 1.02,
        opacity: 1,
      },
      voxel: {
        x: "19%",
        y: "0%",
        scale: 1.05,
        opacity: 1,
      },
      stratum: {
        x: "23%",
        y: "0%",
        scale: 1.0,
        opacity: 1,
      },
      workflow: {
        x: "23%",
        y: "-8%",
        scale: 0.9,
        opacity: 0,
      },
    }),
    []
  )

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
    <div
      className={`hidden lg:flex fixed inset-0 z-20 items-center justify-center pointer-events-none overflow-hidden transition-opacity duration-300 ${
        isHiddenStage ? "opacity-0" : "opacity-100"
      }`}
    >
      <motion.div
        style={willChangeStyle}
        variants={desktopVariants}
        animate={activeStage}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 105, damping: 24, mass: 0.9 }
        }
        className={`relative w-[500px] xl:w-[580px] h-[540px] xl:h-[600px] flex flex-col justify-between ${
          isHiddenStage ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        {/* Top Architectural CAD Telemetry Bar */}
        <div className="mx-4 mt-2 bg-[#1C130D]/92 backdrop-blur-md border border-[#EFE7DE]/20 px-3.5 py-2.5 shadow-xl flex items-center justify-between font-mono text-[10px] text-[#EFE7DE] select-none z-10">
          <div className="flex items-center gap-2">
            {getStageIcon(activeStage)}
            <span className="font-bold tracking-wider uppercase text-[#FAD9BA]">
              {hud.code}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#EFE7DE]/70 tabular-nums">
            <span>{hud.depthTag}</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#271C14] border border-[#EFE7DE]/15 text-[9px] text-[#EFE7DE]">
              <Rotate3d className="w-3 h-3 text-[#BD8564]" />
              Drag 3D
            </span>
          </div>
        </div>

        {/* Live Three.js Monolith Canvas */}
        <div className="absolute inset-0">
          <SubsurfaceMonolithCanvas />
        </div>

        {/* Bottom Exploded Layer & Section Telemetry Readout */}
        <div
          className={`mx-4 mb-2 bg-[#1C130D]/92 backdrop-blur-md border border-[#EFE7DE]/20 p-3 shadow-xl font-mono text-xs text-[#EFE7DE] select-none z-10 transition-colors ${
            isLeftAligned ? "border-l-2 border-l-[#10B981]" : "border-l-2 border-l-[#FAD9BA]"
          }`}
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#EFE7DE]/15">
            <span className="font-sans font-bold text-xs text-[#EFE7DE] tracking-tight">
              {hud.title}
            </span>
            {activeStage === "voxel" && (
              <span className="text-[10px] text-[#FAD9BA] tabular-nums">
                Cut X:{sliceX}% · Y:{sliceY}%
              </span>
            )}
            {activeStage === "stratum" && (
              <span className="text-[10px] text-[#E76F51] font-bold tabular-nums">
                qc &gt;= {bearingCriteria.minQc.toFixed(1)} MPa
              </span>
            )}
          </div>
          <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <span className="text-[#EFE7DE]/75">{hud.activeLayer}</span>
            <span className="text-[#FAD9BA] font-semibold">{hud.telemetry}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

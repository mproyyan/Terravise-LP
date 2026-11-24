import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"
import { DEFAULT_BEARING_CRITERIA } from "../data/mockGeology"
import type { BearingCriteria } from "../types"

export type MonolithStage = "hero" | "problem" | "dqn" | "voxel" | "stratum" | "workflow"

export interface PipeScreenCoords {
  xPct: number
  yPct: number
}

export interface StageViewportRect {
  centerX: number
  centerY: number
  left: number
  top: number
  width: number
  height: number
  opacity: number
}

export interface MutableSceneState {
  scrollProgress: number
  stageProgress: number
  activeStage: MonolithStage
  transitionFrom: MonolithStage
  transitionTo: MonolithStage
  transitionT: number
  stageRect: StageViewportRect
  sliceX: number
  sliceY: number
  minQc: number
  maxIc: number
  minThickness: number
  hoveredLayerId: string | null
  hoveredProblemZone: number | null
  selectedPipeId: string | null
  hoveredBearingPointId: string | null
  activeDqnTab: string
  cameraView: "iso" | "front"
  explodeFactor: number
}

interface Subsurface3DContextValue {
  activeStage: MonolithStage
  setActiveStage: (stage: MonolithStage) => void
  sliceX: number
  setSliceX: (v: number) => void
  sliceY: number
  setSliceY: (v: number) => void
  bearingCriteria: BearingCriteria
  setBearingCriteria: React.Dispatch<React.SetStateAction<BearingCriteria>>
  hoveredLayerId: string | null
  setHoveredLayerId: (id: string | null) => void
  hoveredProblemZone: number | null
  setHoveredProblemZone: (zone: number | null) => void
  selectedPipeId: string | null
  setSelectedPipeId: (id: string | null) => void
  pipeScreenCoords: PipeScreenCoords | null
  setPipeScreenCoords: (coords: PipeScreenCoords | null) => void
  hoveredBearingPointId: string | null
  setHoveredBearingPointId: (id: string | null) => void
  activeDqnTab: string
  setActiveDqnTab: (tab: string) => void
  cameraView: "iso" | "front"
  setCameraView: (view: "iso" | "front") => void
  explodeOverride: number | null
  setExplodeOverride: (val: number | null) => void
  sceneStateRef: React.MutableRefObject<MutableSceneState>
  registerDock: (stage: MonolithStage, el: HTMLDivElement | null) => void
  dockElementsRef: React.MutableRefObject<Partial<Record<MonolithStage, HTMLDivElement | null>>>
  resetSlicing: () => void
}

const Subsurface3DContext = createContext<Subsurface3DContextValue | null>(null)

export function Subsurface3DProvider({ children }: { children: React.ReactNode }) {
  const [activeStage, setActiveStage] = useState<MonolithStage>("hero")
  const [sliceX, setSliceX] = useState<number>(100)
  const [sliceY, setSliceY] = useState<number>(100)
  const [bearingCriteria, setBearingCriteria] = useState<BearingCriteria>(DEFAULT_BEARING_CRITERIA)
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null)
  const [hoveredProblemZone, setHoveredProblemZone] = useState<number | null>(null)
  const [selectedPipeId, setSelectedPipeId] = useState<string | null>("cpt-03")
  const [pipeScreenCoords, setPipeScreenCoords] = useState<PipeScreenCoords | null>({
    xPct: 52,
    yPct: 36,
  })
  const [hoveredBearingPointId, setHoveredBearingPointId] = useState<string | null>("spot-2-rec")
  const [activeDqnTab, setActiveDqnTab] = useState<string>("gap")
  const [cameraView, setCameraView] = useState<"iso" | "front">("iso")
  const [explodeOverride, setExplodeOverride] = useState<number | null>(null)

  const dockElementsRef = useRef<Partial<Record<MonolithStage, HTMLDivElement | null>>>({})

  const registerDock = useCallback((stage: MonolithStage, el: HTMLDivElement | null) => {
    dockElementsRef.current[stage] = el
  }, [])

  const sceneStateRef = useRef<MutableSceneState>({
    scrollProgress: 0,
    stageProgress: 0,
    activeStage: "hero",
    transitionFrom: "hero",
    transitionTo: "hero",
    transitionT: 0,
    stageRect: {
      centerX: typeof window !== "undefined" ? window.innerWidth * 0.72 : 960,
      centerY: typeof window !== "undefined" ? window.innerHeight * 0.5 : 450,
      left: 640,
      top: 160,
      width: 640,
      height: 540,
      opacity: 1,
    },
    sliceX: 100,
    sliceY: 100,
    minQc: DEFAULT_BEARING_CRITERIA.minQc,
    maxIc: DEFAULT_BEARING_CRITERIA.maxIc,
    minThickness: DEFAULT_BEARING_CRITERIA.minThickness,
    hoveredLayerId: null,
    hoveredProblemZone: null,
    selectedPipeId: "cpt-03",
    hoveredBearingPointId: "spot-2-rec",
    activeDqnTab: "gap",
    cameraView: "iso",
    explodeFactor: 0,
  })

  useEffect(() => {
    sceneStateRef.current.activeStage = activeStage
  }, [activeStage])

  useEffect(() => {
    sceneStateRef.current.sliceX = sliceX
  }, [sliceX])

  useEffect(() => {
    sceneStateRef.current.sliceY = sliceY
  }, [sliceY])

  useEffect(() => {
    sceneStateRef.current.minQc = bearingCriteria.minQc
    sceneStateRef.current.maxIc = bearingCriteria.maxIc
    sceneStateRef.current.minThickness = bearingCriteria.minThickness
  }, [bearingCriteria])

  useEffect(() => {
    sceneStateRef.current.hoveredLayerId = hoveredLayerId
  }, [hoveredLayerId])

  useEffect(() => {
    sceneStateRef.current.hoveredProblemZone = hoveredProblemZone
  }, [hoveredProblemZone])

  useEffect(() => {
    sceneStateRef.current.selectedPipeId = selectedPipeId
  }, [selectedPipeId])

  useEffect(() => {
    sceneStateRef.current.hoveredBearingPointId = hoveredBearingPointId
  }, [hoveredBearingPointId])

  useEffect(() => {
    sceneStateRef.current.activeDqnTab = activeDqnTab
  }, [activeDqnTab])

  useEffect(() => {
    sceneStateRef.current.cameraView = cameraView
  }, [cameraView])

  useEffect(() => {
    const stageIds: MonolithStage[] = ["hero", "problem", "dqn", "voxel", "stratum", "workflow"]

    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll))
      sceneStateRef.current.scrollProgress = progress

      let detectedStage: MonolithStage = "hero"
      const viewportTrigger = window.innerHeight * 0.5

      for (let i = stageIds.length - 1; i >= 0; i--) {
        const id = stageIds[i]
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= viewportTrigger) {
            detectedStage = id
            const sectionProgress = Math.min(
              1,
              Math.max(0, (viewportTrigger - rect.top) / Math.max(1, rect.height))
            )
            sceneStateRef.current.stageProgress = sectionProgress
            break
          }
        }
      }

      if (sceneStateRef.current.activeStage !== detectedStage) {
        sceneStateRef.current.activeStage = detectedStage
        setActiveStage(detectedStage)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const resetSlicing = () => {
    setSliceX(100)
    setSliceY(100)
    setCameraView("iso")
  }

  return (
    <Subsurface3DContext.Provider
      value={{
        activeStage,
        setActiveStage,
        sliceX,
        setSliceX,
        sliceY,
        setSliceY,
        bearingCriteria,
        setBearingCriteria,
        hoveredLayerId,
        setHoveredLayerId,
        hoveredProblemZone,
        setHoveredProblemZone,
        selectedPipeId,
        setSelectedPipeId,
        pipeScreenCoords,
        setPipeScreenCoords,
        hoveredBearingPointId,
        setHoveredBearingPointId,
        activeDqnTab,
        setActiveDqnTab,
        cameraView,
        setCameraView,
        explodeOverride,
        setExplodeOverride,
        sceneStateRef,
        registerDock,
        dockElementsRef,
        resetSlicing,
      }}
    >
      {children}
    </Subsurface3DContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubsurface3D() {
  const ctx = useContext(Subsurface3DContext)
  if (!ctx) {
    throw new Error("useSubsurface3D must be used within a Subsurface3DProvider")
  }
  return ctx
}

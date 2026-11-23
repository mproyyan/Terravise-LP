import React, { createContext, useContext, useState, useRef, useEffect } from "react"
import { DEFAULT_BEARING_CRITERIA } from "../data/mockGeology"
import type { BearingCriteria } from "../types"

export type MonolithStage = "hero" | "problem" | "dqn" | "voxel" | "stratum" | "workflow"

export interface MutableSceneState {
  scrollProgress: number
  stageProgress: number
  activeStage: MonolithStage
  sliceX: number
  sliceY: number
  minQc: number
  maxIc: number
  minThickness: number
  hoveredLayerId: string | null
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
  activeDqnTab: string
  setActiveDqnTab: (tab: string) => void
  cameraView: "iso" | "front"
  setCameraView: (view: "iso" | "front") => void
  explodeOverride: number | null
  setExplodeOverride: (val: number | null) => void
  sceneStateRef: React.MutableRefObject<MutableSceneState>
  resetSlicing: () => void
}

const Subsurface3DContext = createContext<Subsurface3DContextValue | null>(null)

export function Subsurface3DProvider({ children }: { children: React.ReactNode }) {
  const [activeStage, setActiveStage] = useState<MonolithStage>("hero")
  const [sliceX, setSliceX] = useState<number>(65)
  const [sliceY, setSliceY] = useState<number>(60)
  const [bearingCriteria, setBearingCriteria] = useState<BearingCriteria>(DEFAULT_BEARING_CRITERIA)
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null)
  const [activeDqnTab, setActiveDqnTab] = useState<string>("gap")
  const [cameraView, setCameraView] = useState<"iso" | "front">("iso")
  const [explodeOverride, setExplodeOverride] = useState<number | null>(null)

  const sceneStateRef = useRef<MutableSceneState>({
    scrollProgress: 0,
    stageProgress: 0,
    activeStage: "hero",
    sliceX: 65,
    sliceY: 60,
    minQc: DEFAULT_BEARING_CRITERIA.minQc,
    maxIc: DEFAULT_BEARING_CRITERIA.maxIc,
    minThickness: DEFAULT_BEARING_CRITERIA.minThickness,
    hoveredLayerId: null,
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
      const viewportTrigger = window.innerHeight * 0.48

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
    setSliceX(65)
    setSliceY(60)
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
        activeDqnTab,
        setActiveDqnTab,
        cameraView,
        setCameraView,
        explodeOverride,
        setExplodeOverride,
        sceneStateRef,
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

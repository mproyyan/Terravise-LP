import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { smoothstep } from "./geology3DUtils"
import { Rotate3d } from "lucide-react"

export function DqnRadarStage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { sceneStateRef } = useSubsurface3D()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 960
    const height = container.clientHeight || 420

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100)
    camera.position.set(0.0, 7.6, 8.2)
    camera.lookAt(0, -0.15, 0)

    // Lighting tailored for Dark Geodetic Radar Table
    const ambientLight = new THREE.AmbientLight(0xfbf7f2, 0.85)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfad9ba, 2.2)
    keyLight.position.set(6, 12, 8)
    scene.add(keyLight)

    const emeraldRim = new THREE.PointLight(0x10b981, 2.5, 12)
    emeraldRim.position.set(0.65, 2.2, 0.4)
    scene.add(emeraldRim)

    const TABLE_W = 5.6
    const TABLE_D = 3.1

    const radarRoot = new THREE.Group()
    scene.add(radarRoot)

    const disposableGeometries: THREE.BufferGeometry[] = []
    const disposableMaterials: THREE.Material[] = []

    // 1. Wide Panoramic Geodetic Radar Slab Base
    const baseSlabGeo = new THREE.BoxGeometry(TABLE_W, 0.14, TABLE_D)
    const baseSlabMat = new THREE.MeshStandardMaterial({
      color: 0x160f0a,
      roughness: 0.72,
      metalness: 0.25,
      transparent: true,
      opacity: 0.95,
    })
    const baseSlab = new THREE.Mesh(baseSlabGeo, baseSlabMat)
    baseSlab.position.y = -0.08
    radarRoot.add(baseSlab)

    const baseEdgesGeo = new THREE.EdgesGeometry(baseSlabGeo)
    const baseEdgesMat = new THREE.LineBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0.55,
    })
    baseSlab.add(new THREE.LineSegments(baseEdgesGeo, baseEdgesMat))

    // Undulating Topographic Sub-Grid Wireframe on top of the Radar Table
    const topoGridGeo = new THREE.PlaneGeometry(TABLE_W - 0.2, TABLE_D - 0.2, 28, 16)
    topoGridGeo.rotateX(-Math.PI / 2)
    const topoPos = topoGridGeo.attributes.position
    for (let i = 0; i < topoPos.count; i++) {
      const vx = topoPos.getX(i)
      const vz = topoPos.getZ(i)
      const hill =
        0.12 * Math.sin(vx * 1.1) * Math.cos(vz * 1.3) +
        0.08 * Math.cos((vx - 0.6) * 1.8)
      topoPos.setY(i, hill)
    }
    topoGridGeo.computeVertexNormals()
    const topoGridMat = new THREE.MeshBasicMaterial({
      color: 0x7a421d,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const topoGridMesh = new THREE.Mesh(topoGridGeo, topoGridMat)
    topoGridMesh.position.y = 0.02
    radarRoot.add(topoGridMesh)

    // 2. 144 Instanced Candidate Q-Value Elevation Nodes across the wide table
    const GRID_NX = 16
    const GRID_NZ = 9
    const NODE_COUNT = GRID_NX * GRID_NZ
    const nodeGeo = new THREE.CylinderGeometry(0.055, 0.055, 1, 12)
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.25,
      transparent: true,
      opacity: 0.95,
    })
    const candidateInstanced = new THREE.InstancedMesh(nodeGeo, nodeMat, NODE_COUNT)
    radarRoot.add(candidateInstanced)

    const SPOT2_X = 0.65
    const SPOT2_Z = 0.28
    const nodeDummy = new THREE.Object3D()
    const nodeColor = new THREE.Color()
    const candidateCoords: Array<{ x: number; z: number; distSpot2: number; qVal: number }> = []

    let nIdx = 0
    for (let ix = 0; ix < GRID_NX; ix++) {
      for (let iz = 0; iz < GRID_NZ; iz++) {
        const x = -TABLE_W / 2 + 0.32 + (ix / (GRID_NX - 1)) * (TABLE_W - 0.64)
        const z = -TABLE_D / 2 + 0.28 + (iz / (GRID_NZ - 1)) * (TABLE_D - 0.56)
        const dist = Math.hypot(x - SPOT2_X, z - SPOT2_Z)
        const qVal = Math.max(0.14, Math.exp(-dist * dist * 0.65))
        candidateCoords.push({ x, z, distSpot2: dist, qVal })

        nodeDummy.position.set(x, qVal * 0.5, z)
        nodeDummy.scale.set(1, Math.max(0.15, qVal), 1)
        nodeDummy.updateMatrix()
        candidateInstanced.setMatrixAt(nIdx, nodeDummy.matrix)

        if (dist < 0.52) {
          nodeColor.setHex(0x10b981)
        } else if (dist < 1.35) {
          nodeColor.setHex(0xfad9ba)
        } else {
          nodeColor.setHex(0x7a421d)
        }
        candidateInstanced.setColorAt(nIdx, nodeColor)
        nIdx++
      }
    }
    candidateInstanced.instanceMatrix.needsUpdate = true
    if (candidateInstanced.instanceColor) candidateInstanced.instanceColor.needsUpdate = true

    // 3. Spot 2 Target Lock Spire & Pulsing Radar Rings
    const laserBeamGeo = new THREE.CylinderGeometry(0.048, 0.048, 2.8, 16)
    const laserBeamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.95,
      toneMapped: false,
    })
    const laserBeam = new THREE.Mesh(laserBeamGeo, laserBeamMat)
    laserBeam.position.set(SPOT2_X, 1.4, SPOT2_Z)
    radarRoot.add(laserBeam)

    const targetRingGeo = new THREE.RingGeometry(0.34, 0.44, 36)
    const targetRingMat = new THREE.MeshBasicMaterial({
      color: 0xfad9ba,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      toneMapped: false,
    })
    const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat)
    targetRing.rotation.x = -Math.PI / 2
    targetRing.position.set(SPOT2_X, 0.96, SPOT2_Z)
    radarRoot.add(targetRing)

    // 4. Interactive Rationale 3D Overlays (Gap Cylinder, Dipping Fault Plane)
    const gapCylinderGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.8, 40, 1, true)
    const gapCylinderMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    })
    const gapCylinder = new THREE.Mesh(gapCylinderGeo, gapCylinderMat)
    gapCylinder.position.set(SPOT2_X, 0.4, SPOT2_Z)
    radarRoot.add(gapCylinder)

    const faultPlaneGeo = new THREE.PlaneGeometry(TABLE_W - 0.5, TABLE_D - 0.4, 12, 8)
    const faultPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xe76f51,
      wireframe: true,
      transparent: true,
      opacity: 0,
    })
    const faultPlane = new THREE.Mesh(faultPlaneGeo, faultPlaneMat)
    faultPlane.rotation.x = -Math.PI / 2 + 0.24
    faultPlane.rotation.z = -0.16
    faultPlane.position.y = 0.52
    radarRoot.add(faultPlane)

    // 5. 4 Parabolic Neural Search Arcs from B-01..B-04 into Spot 2
    const searchArcCurves = [
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-2.1, 0.1, -1.05),
        new THREE.Vector3(-0.7, 1.75, -0.4),
        new THREE.Vector3(SPOT2_X, 0.95, SPOT2_Z)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(2.15, 0.1, 1.05),
        new THREE.Vector3(1.4, 1.55, 0.65),
        new THREE.Vector3(SPOT2_X, 0.95, SPOT2_Z)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(2.05, 0.1, -1.05),
        new THREE.Vector3(1.35, 1.7, -0.35),
        new THREE.Vector3(SPOT2_X, 0.95, SPOT2_Z)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.95, 0.1, 1.0),
        new THREE.Vector3(-0.6, 1.45, 0.6),
        new THREE.Vector3(SPOT2_X, 0.95, SPOT2_Z)
      ),
    ]

    const searchArcMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.72,
      toneMapped: false,
    })
    const searchPulseGeo = new THREE.SphereGeometry(0.075, 12, 12)
    const searchPulseMat = new THREE.MeshBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0.95,
      toneMapped: false,
    })
    const searchPulseMeshes: THREE.Mesh[] = []

    for (const curve of searchArcCurves) {
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36))
      radarRoot.add(new THREE.Line(arcGeo, searchArcMat))
      disposableGeometries.push(arcGeo)

      const pulseSphere = new THREE.Mesh(searchPulseGeo, searchPulseMat)
      radarRoot.add(pulseSphere)
      searchPulseMeshes.push(pulseSphere)
    }

    disposableGeometries.push(
      baseSlabGeo,
      baseEdgesGeo,
      topoGridGeo,
      nodeGeo,
      laserBeamGeo,
      targetRingGeo,
      gapCylinderGeo,
      faultPlaneGeo,
      searchPulseGeo
    )
    disposableMaterials.push(
      baseSlabMat,
      baseEdgesMat,
      topoGridMat,
      nodeMat,
      laserBeamMat,
      targetRingMat,
      gapCylinderMat,
      faultPlaneMat,
      searchArcMat,
      searchPulseMat
    )

    // Drag rotation inside stage container
    let isDragging = false
    let dragStartX = 0
    let userRotationY = -0.18

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      dragStartX = e.clientX
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      userRotationY += (e.clientX - dragStartX) * 0.007
      dragStartX = e.clientX
    }
    const onPointerUp = () => {
      isDragging = false
    }

    container.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("pointerup", onPointerUp, { passive: true })

    let isVisible = true
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0.01 }
    )
    observer.observe(container)

    const timer = new THREE.Timer()
    timer.connect(document)
    const arcPointVec = new THREE.Vector3()
    let currentEntryT = 0
    let rafId = 0

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      if (!isVisible) return

      timer.update()
      const dt = Math.min(timer.getDelta(), 0.1)
      const elapsed = timer.getElapsed()
      const state = sceneStateRef.current

      // Physical Scroll Entry Transformation:
      // As the radar stage scrolls up from the bottom of the viewport, it rises from y = -2.2
      // and unfolds from a tilted flat blueprint into a 3D topographic radar table!
      const rect = container.getBoundingClientRect()
      const vpH = window.innerHeight
      const rawEntry = (vpH - rect.top) / Math.max(1, vpH * 0.65)
      const targetEntryT = smoothstep(rawEntry)
      currentEntryT = THREE.MathUtils.damp(currentEntryT, targetEntryT, 6.0, dt)

      // Rise from below the section & unfold X-tilt
      radarRoot.position.y = -0.35 - (1 - currentEntryT) * 2.1
      radarRoot.rotation.x = (1 - currentEntryT) * 0.68
      radarRoot.rotation.y = userRotationY + Math.sin(elapsed * 0.35) * 0.04
      radarRoot.scale.set(
        0.82 + 0.18 * currentEntryT,
        0.15 + 0.85 * currentEntryT,
        0.55 + 0.45 * currentEntryT
      )

      const isGapTab = state.activeDqnTab === "gap"
      const isTransitionTab = state.activeDqnTab === "transition"
      const isAnomalyTab = state.activeDqnTab === "anomaly"

      gapCylinderMat.opacity = currentEntryT * (isGapTab ? 0.34 : 0.1)
      const gScale = 1 + Math.sin(elapsed * 2.2) * 0.04
      gapCylinder.scale.set(gScale, 1, gScale)
      faultPlaneMat.opacity = currentEntryT * (isTransitionTab ? 0.78 : 0.0)

      const ringPulse = 1 + Math.sin(elapsed * 3.5) * 0.22
      targetRing.scale.set(ringPulse, ringPulse, 1)

      // Animate neural pathfinding pulses jumping along parabolic arcs
      for (let aIdx = 0; aIdx < searchArcCurves.length; aIdx++) {
        const curve = searchArcCurves[aIdx]
        const u = (elapsed * 0.55 + aIdx * 0.25) % 1
        curve.getPoint(u, arcPointVec)
        searchPulseMeshes[aIdx].position.copy(arcPointVec)
      }

      // Erupt 144 Q-value columns in a radial wave from Spot 2 as currentEntryT unfolds
      for (let i = 0; i < candidateCoords.length; i++) {
        const c = candidateCoords[i]
        const radialEntry = THREE.MathUtils.clamp(
          (currentEntryT * 1.4 - c.distSpot2 * 0.18),
          0.05,
          1
        )
        const wave = Math.sin(c.distSpot2 * 3.2 - elapsed * 3.0) * 0.08
        const anomalyBoost = isAnomalyTab && c.distSpot2 < 1.15 ? 0.48 : 0
        const h = Math.max(0.1, (c.qVal + wave + anomalyBoost) * 0.98 * radialEntry)
        nodeDummy.position.set(c.x, h / 2, c.z)
        nodeDummy.scale.set(1, h, 1)
        nodeDummy.updateMatrix()
        candidateInstanced.setMatrixAt(i, nodeDummy.matrix)
      }
      candidateInstanced.instanceMatrix.needsUpdate = true

      renderer.render(scene, camera)
    }

    rafId = requestAnimationFrame(animate)

    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth || 960
      const newH = container.clientHeight || 420
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener("resize", handleResize)
      container.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      timer.dispose()

      for (const g of disposableGeometries) g.dispose()
      for (const m of disposableMaterials) m.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [sceneStateRef])

  return (
    <div className="relative w-full h-[380px] sm:h-[430px] xl:h-[460px] bg-[#160F0A]/70 border border-[#EFE7DE]/15 overflow-hidden select-none">
      {/* Subtle Corner Drafting Hairlines */}
      <div className="absolute top-2.5 left-3.5 right-3.5 z-10 flex items-center justify-between font-mono text-[10px] tracking-widest uppercase text-[#EFE7DE]/45 pointer-events-none">
        <span>+ FIG 02 · PANORAMIC 3D GEODETIC RADAR TABLE</span>
        <span className="flex items-center gap-1.5 text-[#FAD9BA]">
          <Rotate3d className="w-3.5 h-3.5" />
          Drag to orbit radar · Unfolds from below on scroll
        </span>
      </div>

      {/* Dedicated In-Section 3D Canvas (z-0: never overlaps text or cards) */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Geodetic Candidate Radar and Parabolic Neural Search Arcs"
      />
    </div>
  )
}

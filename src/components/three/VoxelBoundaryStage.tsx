import { useEffect, useRef } from "react"
import * as THREE from "three"
import { motion, AnimatePresence } from "framer-motion"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { MOCK_CPT_TEST_PIPES } from "../../data/mockGeology"
import {
  STRATA_LAYER_SPECS,
  createProceduralStrataTexture,
  getGeologicalWave,
  smoothstep,
} from "./geology3DUtils"
import { Rotate3d, X, MapPin, Layers, ArrowDownToLine } from "lucide-react"

interface SmoothHorizonEntry {
  id: string
  group: THREE.Group
  material: THREE.MeshStandardMaterial
  edgeMaterial: THREE.LineBasicMaterial
}

interface PipeVisualEntry {
  id: string
  group: THREE.Group
  capMesh: THREE.Mesh
  capMat: THREE.MeshStandardMaterial
  beaconRing: THREE.Mesh
  beaconMat: THREE.MeshBasicMaterial
  shaftMats: THREE.MeshStandardMaterial[]
}

export function VoxelBoundaryStage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    sceneStateRef,
    selectedPipeId,
    setSelectedPipeId,
    pipeScreenCoords,
    setPipeScreenCoords,
  } = useSubsurface3D()

  const selectedPipe = MOCK_CPT_TEST_PIPES.find((p) => p.id === selectedPipeId) || null

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 860
    const height = container.clientHeight || 520

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.localClippingEnabled = true
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(33, width / height, 0.1, 100)
    camera.position.set(7.4, 4.9, 8.2)
    camera.lookAt(0, -1.35, 0)

    // Architectural Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfbf7f2, 0.92)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight(0xfad9ba, 0x381800, 0.65)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xfff5eb, 2.5)
    keyLight.position.set(8, 13, 9)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xfad9ba, 1.25)
    rimLight.position.set(-8, 6, -6)
    scene.add(rimLight)

    const BLOCK_W = 4.2
    const BLOCK_D = 3.3

    // Local Clipping Planes for Smooth 3D Soil Volume (Does NOT clip the 5 CPT pipes!)
    const clipPlaneX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), BLOCK_W / 2 + 0.5)
    const clipPlaneZ = new THREE.Plane(new THREE.Vector3(0, 0, -1), BLOCK_D / 2 + 0.5)
    const smoothVolumeClipPlanes = [clipPlaneX, clipPlaneZ]

    const boundaryRoot = new THREE.Group()
    boundaryRoot.position.y = 0.3
    scene.add(boundaryRoot)

    const disposableGeometries: THREE.BufferGeometry[] = []
    const disposableMaterials: THREE.Material[] = []
    const disposableTextures: THREE.Texture[] = []

    // 1. Top 3D Geodetic Site Boundary Perimeter Frame (+0.0m Ground Surface)
    const boundaryFrameGeo = new THREE.BoxGeometry(BLOCK_W + 0.08, 0.06, BLOCK_D + 0.08)
    const boundaryFrameEdges = new THREE.EdgesGeometry(boundaryFrameGeo)
    const boundaryFrameLineMat = new THREE.LineBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0.78,
    })
    const boundaryFrameLines = new THREE.LineSegments(boundaryFrameEdges, boundaryFrameLineMat)
    boundaryFrameLines.position.y = 0.04
    boundaryRoot.add(boundaryFrameLines)
    disposableGeometries.push(boundaryFrameGeo, boundaryFrameEdges)
    disposableMaterials.push(boundaryFrameLineMat)

    // 2. 4 Smooth Undulating Continuous Stratigraphic Layers (Clipped smoothly by Easting/Northing sliders)
    const smoothHorizonEntries: SmoothHorizonEntry[] = []
    let smoothCursorY = 0

    for (let sIdx = 0; sIdx < STRATA_LAYER_SPECS.length; sIdx++) {
      const spec = STRATA_LAYER_SPECS[sIdx]
      const topY = smoothCursorY
      const botY = smoothCursorY - spec.height
      smoothCursorY = botY

      const hGroup = new THREE.Group()
      boundaryRoot.add(hGroup)

      const sGeo = new THREE.BoxGeometry(BLOCK_W, spec.height, BLOCK_D, 30, 4, 24)
      const sPos = sGeo.attributes.position
      for (let i = 0; i < sPos.count; i++) {
        const vx = sPos.getX(i)
        const vy = sPos.getY(i)
        const vz = sPos.getZ(i)
        const ny = vy / spec.height + 0.5
        const topWave = sIdx === 0 ? 0 : getGeologicalWave(vx, vz, sIdx * 1.7)
        const botWave =
          sIdx === STRATA_LAYER_SPECS.length - 1 ? 0 : getGeologicalWave(vx, vz, (sIdx + 1) * 1.7)
        const worldY = THREE.MathUtils.lerp(botY + botWave, topY + topWave, ny)
        sPos.setY(i, worldY)
      }
      sGeo.computeVertexNormals()

      const sTex = createProceduralStrataTexture(spec.colorHex, spec.pattern)
      disposableTextures.push(sTex)

      const sMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.colorHex),
        map: sTex,
        roughness: 0.62,
        metalness: 0.08,
        side: THREE.DoubleSide,
        clippingPlanes: smoothVolumeClipPlanes,
        clipShadows: true,
        transparent: true,
        opacity: 0.96,
      })

      const sMesh = new THREE.Mesh(sGeo, sMat)
      sMesh.castShadow = true
      sMesh.receiveShadow = true
      hGroup.add(sMesh)

      const sEdgeGeo = new THREE.EdgesGeometry(sGeo, 22)
      const sEdgeMat = new THREE.LineBasicMaterial({
        color: 0x1c130d,
        clippingPlanes: smoothVolumeClipPlanes,
        transparent: true,
        opacity: 0.5,
      })
      const sEdgeLines = new THREE.LineSegments(sEdgeGeo, sEdgeMat)
      hGroup.add(sEdgeLines)

      disposableGeometries.push(sGeo, sEdgeGeo)
      disposableMaterials.push(sMat, sEdgeMat)

      smoothHorizonEntries.push({
        id: spec.id,
        group: hGroup,
        material: sMat,
        edgeMaterial: sEdgeMat,
      })
    }

    // 3. 5 CPT Test Sounding Pipes Mounted on the 3D Boundary (Remain INTACT when soil is sliced!)
    const pipeVisualEntries: PipeVisualEntry[] = []
    const pickablePipeProxies: THREE.Object3D[] = []

    const pipeCollarGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.3, 20)
    const pipeTopFlangeGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.065, 20)
    const pipeBeaconRingGeo = new THREE.RingGeometry(0.18, 0.26, 28)
    pipeBeaconRingGeo.rotateX(-Math.PI / 2)
    const pipeHitProxyGeo = new THREE.CylinderGeometry(0.32, 0.32, 4.5, 12)
    disposableGeometries.push(
      pipeCollarGeo,
      pipeTopFlangeGeo,
      pipeBeaconRingGeo,
      pipeHitProxyGeo
    )

    const TOTAL_WORLD_DEPTH = 3.84

    for (const pipeData of MOCK_CPT_TEST_PIPES) {
      const pGroup = new THREE.Group()
      pGroup.position.set(pipeData.pos3D[0] * 1.05, 0, pipeData.pos3D[1] * 1.05)
      boundaryRoot.add(pGroup)

      const capMat = new THREE.MeshStandardMaterial({
        color: 0xfbf7f2,
        emissive: 0x7a421d,
        emissiveIntensity: 0.25,
        roughness: 0.3,
        metalness: 0.5,
        transparent: true,
        opacity: 1,
      })
      const collarMesh = new THREE.Mesh(pipeCollarGeo, capMat)
      collarMesh.position.y = 0.2
      collarMesh.castShadow = true
      pGroup.add(collarMesh)

      const flangeMesh = new THREE.Mesh(pipeTopFlangeGeo, capMat)
      flangeMesh.position.y = 0.36
      flangeMesh.castShadow = true
      pGroup.add(flangeMesh)

      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xfad9ba,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        toneMapped: false,
      })
      const beaconRing = new THREE.Mesh(pipeBeaconRingGeo, beaconMat)
      beaconRing.position.y = 0.42
      pGroup.add(beaconRing)

      // 4 Underground Pipe Core Segments (No clippingPlanes so the pipe stays 100% intact when sliced!)
      const shaftMats: THREE.MeshStandardMaterial[] = []
      let pipeCursorY = 0

      for (const lData of pipeData.layers) {
        const segH = (lData.thicknessM / 25.0) * TOTAL_WORLD_DEPTH
        const segGeo = new THREE.CylinderGeometry(0.072, 0.072, segH, 16)
        const segMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(lData.colorHex),
          emissive: new THREE.Color(lData.colorHex),
          emissiveIntensity: 0.2,
          roughness: 0.35,
          metalness: 0.35,
          transparent: true,
          opacity: 1,
        })
        const segMesh = new THREE.Mesh(segGeo, segMat)
        segMesh.position.y = pipeCursorY - segH / 2
        pipeCursorY -= segH
        segMesh.castShadow = true
        pGroup.add(segMesh)

        const jointGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.025, 16)
        const jointMesh = new THREE.Mesh(jointGeo, capMat)
        jointMesh.position.y = pipeCursorY
        pGroup.add(jointMesh)

        shaftMats.push(segMat)
        disposableGeometries.push(segGeo, jointGeo)
        disposableMaterials.push(segMat)
      }

      const hitMat = new THREE.MeshBasicMaterial({ visible: false })
      const hitProxy = new THREE.Mesh(pipeHitProxyGeo, hitMat)
      hitProxy.position.y = -1.5
      hitProxy.userData.pipeId = pipeData.id
      hitProxy.layers.enable(1)
      pGroup.add(hitProxy)
      pickablePipeProxies.push(hitProxy)

      disposableMaterials.push(capMat, beaconMat, hitMat)

      pipeVisualEntries.push({
        id: pipeData.id,
        group: pGroup,
        capMesh: flangeMesh,
        capMat,
        beaconRing,
        beaconMat,
        shaftMats,
      })
    }

    // Raycasting for clicking & hovering the 5 CPT pipes
    const raycaster = new THREE.Raycaster()
    raycaster.layers.set(1)
    const pointerNdc = new THREE.Vector2()

    let isDragging = false
    let dragStartX = 0
    let downClientX = 0
    let downClientY = 0
    let userRotationY = -0.28
    let hoveredPipeId: string | null = null

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      dragStartX = e.clientX
      downClientX = e.clientX
      downClientY = e.clientY
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1
      const ny = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1

      if (isDragging) {
        userRotationY += (e.clientX - dragStartX) * 0.007
        dragStartX = e.clientX
      } else {
        pointerNdc.set(nx, ny)
        raycaster.setFromCamera(pointerNdc, camera)
        const hits = raycaster.intersectObjects(pickablePipeProxies, false)
        hoveredPipeId = hits.length > 0 ? (hits[0].object.userData.pipeId as string) : null
        container.style.cursor = hoveredPipeId ? "pointer" : "grab"
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      const wasClick =
        isDragging && Math.hypot(e.clientX - downClientX, e.clientY - downClientY) < 7
      isDragging = false

      if (wasClick) {
        const rect = container.getBoundingClientRect()
        pointerNdc.set(
          ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
          -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1
        )
        raycaster.setFromCamera(pointerNdc, camera)
        const hits = raycaster.intersectObjects(pickablePipeProxies, false)
        if (hits.length > 0) {
          const hitPipeId = hits[0].object.userData.pipeId as string
          setSelectedPipeId(hitPipeId)
        }
      }
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
    const projectedVec = new THREE.Vector3()

    let currentEntryT = 0
    let currentClipX = BLOCK_W / 2 + 0.5
    let currentClipZ = BLOCK_D / 2 + 0.5
    let currentCamX = 7.4
    let currentCamY = 4.9
    let currentCamZ = 8.2
    let currentRotY = -0.28
    let lastProjectedX = -1
    let lastProjectedY = -1
    let rafId = 0

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      if (!isVisible) return

      timer.update()
      const dt = Math.min(timer.getDelta(), 0.1)
      const elapsed = timer.getElapsed()
      const state = sceneStateRef.current

      // Physical Scroll Entry Choreography:
      // 1) Smooth undulating soil layers extrude upward wave-by-wave from the deep bedrock datum
      // 2) The 5 CPT Standpipes drop down from the sky and drive into the ground one after another!
      const rect = container.getBoundingClientRect()
      const vpH = window.innerHeight
      const rawEntry = (vpH - rect.top) / Math.max(1, vpH * 0.68)
      const targetEntryT = smoothstep(rawEntry)
      currentEntryT = THREE.MathUtils.damp(currentEntryT, targetEntryT, 5.5, dt)

      const targetClipX = -BLOCK_W / 2 + (state.sliceX / 100) * BLOCK_W
      const targetClipZ = -BLOCK_D / 2 + (state.sliceY / 100) * BLOCK_D
      currentClipX = THREE.MathUtils.damp(currentClipX, targetClipX, 8, dt)
      currentClipZ = THREE.MathUtils.damp(currentClipZ, targetClipZ, 8, dt)
      clipPlaneX.constant = currentClipX
      clipPlaneZ.constant = currentClipZ

      // Bottom-to-top sequential horizon extrusion
      for (let idx = 0; idx < smoothHorizonEntries.length; idx++) {
        const sEntry = smoothHorizonEntries[idx]
        const reverseIdx = smoothHorizonEntries.length - 1 - idx
        const layerProgress = THREE.MathUtils.clamp(
          (currentEntryT - reverseIdx * 0.12) / 0.55,
          0,
          1
        )
        const easedLayer = smoothstep(layerProgress)
        sEntry.group.scale.y = Math.max(0.05, easedLayer)
        sEntry.group.position.y = -(1 - easedLayer) * 1.4

        const isHoveredLayer = state.hoveredLayerId === sEntry.id
        sEntry.material.emissive.setHex(isHoveredLayer ? 0xd97706 : 0x000000)
        sEntry.material.emissiveIntensity = isHoveredLayer ? 0.28 : 0
      }

      // Staggered pile-driving drop from above for the 5 CPT Standpipes
      for (let pIdx = 0; pIdx < pipeVisualEntries.length; pIdx++) {
        const pEntry = pipeVisualEntries[pIdx]
        const isSelected = state.selectedPipeId === pEntry.id
        const isHovered = hoveredPipeId === pEntry.id

        const pipeProgress = THREE.MathUtils.clamp(
          (currentEntryT - 0.32 - pIdx * 0.08) / 0.45,
          0,
          1
        )
        const easedPipe = smoothstep(pipeProgress)
        pEntry.group.position.y = (1 - easedPipe) * 2.8

        pEntry.capMat.emissive.setHex(isSelected || isHovered ? 0x10b981 : 0x7a421d)
        pEntry.capMat.emissiveIntensity = isSelected ? 0.85 : isHovered ? 0.55 : 0.22

        pEntry.beaconMat.color.setHex(isSelected || isHovered ? 0x10b981 : 0xfad9ba)
        const bScale = isSelected ? 1.3 + Math.sin(elapsed * 4.2) * 0.2 : 1.0
        pEntry.beaconRing.scale.set(bScale, bScale, 1)

        for (const sMat of pEntry.shaftMats) {
          sMat.emissiveIntensity = isSelected ? 0.45 : 0.18
        }

        if (isSelected) {
          pEntry.capMesh.getWorldPosition(projectedVec)
          projectedVec.y += 0.22
          projectedVec.project(camera)
          const xPct = Math.round(((projectedVec.x + 1) / 2) * 1000) / 10
          const yPct = Math.round(((-projectedVec.y + 1) / 2) * 1000) / 10

          if (
            Math.abs(xPct - lastProjectedX) > 0.6 ||
            Math.abs(yPct - lastProjectedY) > 0.6
          ) {
            lastProjectedX = xPct
            lastProjectedY = yPct
            setPipeScreenCoords({
              xPct: THREE.MathUtils.clamp(xPct, 6, 84),
              yPct: THREE.MathUtils.clamp(yPct, 8, 82),
            })
          }
        }
      }

      const isFrontProfile = state.cameraView === "front"
      const targetCamX = isFrontProfile ? 0.0 : 7.4
      const targetCamY = isFrontProfile ? -1.15 : 4.9
      const targetCamZ = isFrontProfile ? 10.2 : 8.2
      const targetRotY = isFrontProfile
        ? 0
        : userRotationY + Math.sin(elapsed * 0.35) * 0.025

      currentCamX = THREE.MathUtils.damp(currentCamX, targetCamX, 5.0, dt)
      currentCamY = THREE.MathUtils.damp(currentCamY, targetCamY, 5.0, dt)
      currentCamZ = THREE.MathUtils.damp(currentCamZ, targetCamZ, 5.0, dt)
      currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY, 5.5, dt)

      camera.position.set(currentCamX, currentCamY, currentCamZ)
      camera.lookAt(0, -1.35, 0)
      boundaryRoot.rotation.y = currentRotY

      renderer.render(scene, camera)
    }

    rafId = requestAnimationFrame(animate)

    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth || 860
      const newH = container.clientHeight || 520
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
      for (const t of disposableTextures) t.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [sceneStateRef, setPipeScreenCoords, setSelectedPipeId])

  return (
    <div className="relative w-full h-[460px] sm:h-[510px] xl:h-[550px] bg-[#160F0A]/75 border border-[#EFE7DE]/15 overflow-hidden select-none">
      {/* Top Drafting Status Header inside Stage */}
      <div className="absolute top-2.5 left-3.5 right-3.5 z-10 flex items-center justify-between font-mono text-[10px] tracking-widest uppercase text-[#EFE7DE]/50 pointer-events-none">
        <span>+ FIG 03 · SMOOTH 3D BOUNDARY VOLUME &amp; 5 CPT STANDPIPES</span>
        <span className="flex items-center gap-1.5 text-[#FAD9BA]">
          <Rotate3d className="w-3.5 h-3.5" />
          Click any 3D pipe for soil log · Drag to rotate
        </span>
      </div>

      {/* Dedicated In-Section 3D Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive Smooth 3D Subsurface Boundary Volume and 5 Clickable CPT Standpipes"
      />

      {/* Interactive 3D Pipe Click Popover (Anchored directly to the clicked pipe inside the stage) */}
      <AnimatePresence mode="wait">
        {selectedPipe && (
          <motion.div
            key={selectedPipe.id}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            style={{
              left: pipeScreenCoords
                ? `${Math.min(62, Math.max(3, pipeScreenCoords.xPct))}%`
                : "48%",
              top: pipeScreenCoords
                ? `${Math.min(38, Math.max(8, pipeScreenCoords.yPct - 12))}%`
                : "12%",
            }}
            className="absolute z-20 w-72 bg-[#150E09]/95 backdrop-blur-md border border-[#FAD9BA]/50 shadow-2xl p-3.5 font-mono text-xs text-[#EFE7DE] pointer-events-auto"
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
    </div>
  )
}

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import {
  STRATA_LAYER_SPECS,
  createRealisticStrataPBRTextures,
  createConcretePBRTextures,
  applyBoxProjectedUVs,
  smoothstep,
} from "./geology3DUtils"

interface BearingPileVisual {
  id: string
  mesh: THREE.Mesh
  mat: THREE.MeshStandardMaterial
  ring: THREE.Mesh
  ringMat: THREE.MeshBasicMaterial
}

export function BearingHeatmapStage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { sceneStateRef } = useSubsurface3D()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 780
    const height = container.clientHeight || 410

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
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100)
    camera.position.set(6.4, 3.8, 7.8)
    camera.lookAt(0, -0.35, 0)

    const ambientLight = new THREE.AmbientLight(0xfbf7f2, 1.02)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight(0xfff3e6, 0x381800, 0.72)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.6)
    keyLight.position.set(7, 13, 8)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -5
    keyLight.shadow.camera.right = 5
    keyLight.shadow.camera.top = 5
    keyLight.shadow.camera.bottom = -5
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffe4c4, 1.25)
    fillLight.position.set(-6, 4, 6)
    scene.add(fillLight)

    const BLOCK_W = 4.2
    const BLOCK_D = 3.2

    const stratumRoot = new THREE.Group()
    stratumRoot.position.y = 0.7
    scene.add(stratumRoot)

    const disposableGeometries: THREE.BufferGeometry[] = []
    const disposableMaterials: THREE.Material[] = []
    const disposableTextures: THREE.Texture[] = []

    // Concrete & Geological PBR Textures
    const concreteTex = createConcretePBRTextures("#EFE7DE", maxAnisotropy)
    const bearingPBR = createRealisticStrataPBRTextures("#E76F51", "bearing", maxAnisotropy)
    disposableTextures.push(
      concreteTex.map,
      concreteTex.bumpMap,
      bearingPBR.map,
      bearingPBR.bumpMap,
      bearingPBR.roughnessMap
    )

    // 1. Top Structural Concrete Pile Cap Reference Frame (+0.0m Ground Footprint)
    const pileCapGeo = new THREE.BoxGeometry(3.75, 0.16, 2.85)
    const pileCapMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: concreteTex.map,
      bumpMap: concreteTex.bumpMap,
      bumpScale: 0.018,
      roughness: 0.58,
      metalness: 0.08,
      transparent: true,
      opacity: 0.94,
    })
    const pileCap = new THREE.Mesh(pileCapGeo, pileCapMat)
    pileCap.position.y = 1.05
    pileCap.castShadow = true
    pileCap.receiveShadow = true
    stratumRoot.add(pileCap)

    const pileCapEdges = new THREE.EdgesGeometry(pileCapGeo)
    const pileCapLineMat = new THREE.LineBasicMaterial({
      color: 0x5a3008,
      transparent: true,
      opacity: 0.65,
    })
    pileCap.add(new THREE.LineSegments(pileCapEdges, pileCapLineMat))

    // Back-Wall Stratified Soil Cutaway Backdrop (Shows the overburden sand, silt & soft clay layers behind the piles)
    const backdropWallWidth = BLOCK_W + 0.25
    const backdropWallDepth = BLOCK_D + 0.25
    let backdropCursorY = 0.96
    const overburdenSpecs = STRATA_LAYER_SPECS.slice(0, 3)
    const overburdenHeights = [0.38, 0.56, 0.88]

    for (let bIdx = 0; bIdx < overburdenSpecs.length; bIdx++) {
      const spec = overburdenSpecs[bIdx]
      const h = overburdenHeights[bIdx]
      const layerTex = createRealisticStrataPBRTextures(spec.colorHex, spec.pattern, maxAnisotropy)
      disposableTextures.push(layerTex.map, layerTex.bumpMap, layerTex.roughnessMap)

      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: layerTex.map,
        bumpMap: layerTex.bumpMap,
        bumpScale: spec.bumpScale,
        roughness: spec.roughness,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
      })

      // North back wall (-Z)
      const backZGeo = new THREE.PlaneGeometry(backdropWallWidth, h)
      const backZMesh = new THREE.Mesh(backZGeo, wallMat)
      backZMesh.position.set(0, backdropCursorY - h / 2, -backdropWallDepth / 2)
      stratumRoot.add(backZMesh)

      // West back wall (-X)
      const backXGeo = new THREE.PlaneGeometry(backdropWallDepth, h)
      const backXMesh = new THREE.Mesh(backXGeo, wallMat)
      backXMesh.rotation.y = Math.PI / 2
      backXMesh.position.set(-backdropWallWidth / 2, backdropCursorY - h / 2, 0)
      stratumRoot.add(backXMesh)

      backdropCursorY -= h
      disposableGeometries.push(backZGeo, backXGeo)
      disposableMaterials.push(wallMat)
    }

    // 2. 8 Reinforced Concrete Driven Piles with Steel Pile Shoes & Pedestal Caps
    const PILE_LEN = 2.55
    const pileCylGeo = new THREE.CylinderGeometry(0.115, 0.105, PILE_LEN, 22)
    const pilePedestalGeo = new THREE.BoxGeometry(0.32, 0.12, 0.32)
    const pileShoeGeo = new THREE.ConeGeometry(0.115, 0.22, 22)
    pileShoeGeo.rotateX(Math.PI)
    const toeRingGeo = new THREE.RingGeometry(0.16, 0.26, 28)
    toeRingGeo.rotateX(-Math.PI / 2)

    const steelShoeMat = new THREE.MeshStandardMaterial({
      color: 0x3b2f26,
      roughness: 0.28,
      metalness: 0.72,
    })
    disposableMaterials.push(steelShoeMat)

    const bearingPointSpecs: Array<{ id: string; pos: [number, number] }> = [
      { id: "b-01", pos: [-1.2, -0.82] },
      { id: "b-02", pos: [1.2, 0.8] },
      { id: "b-03", pos: [1.2, -0.82] },
      { id: "spot-2-rec", pos: [0.05, 0.08] },
      { id: "aux-1", pos: [-1.2, 0.8] },
      { id: "aux-2", pos: [-0.42, -0.82] },
      { id: "aux-3", pos: [0.42, -0.82] },
      { id: "aux-4", pos: [-0.42, 0.8] },
    ]

    const bearingPileVisuals: BearingPileVisual[] = []

    for (const spec of bearingPointSpecs) {
      const pMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: concreteTex.map,
        bumpMap: concreteTex.bumpMap,
        bumpScale: 0.02,
        emissive: 0x7a421d,
        emissiveIntensity: 0.18,
        roughness: 0.48,
        metalness: 0.15,
        transparent: true,
        opacity: 0.96,
      })
      const pMesh = new THREE.Mesh(pileCylGeo, pMat)
      pMesh.position.set(spec.pos[0], 1.05 - PILE_LEN / 2, spec.pos[1])
      pMesh.castShadow = true
      pMesh.receiveShadow = true

      // Concrete pile head pedestal cap under main slab
      const pedestalMesh = new THREE.Mesh(pilePedestalGeo, pMat)
      pedestalMesh.position.y = PILE_LEN / 2 - 0.06
      pMesh.add(pedestalMesh)

      // Conical steel pile driving shoe at pile toe
      const shoeMesh = new THREE.Mesh(pileShoeGeo, steelShoeMat)
      shoeMesh.position.y = -PILE_LEN / 2 - 0.05
      pMesh.add(shoeMesh)

      const rMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
        toneMapped: false,
      })
      const tRing = new THREE.Mesh(toeRingGeo, rMat)
      tRing.position.y = -PILE_LEN / 2 + 0.12
      pMesh.add(tRing)

      stratumRoot.add(pMesh)
      disposableMaterials.push(pMat, rMat)
      bearingPileVisuals.push({
        id: spec.id,
        mesh: pMesh,
        mat: pMat,
        ring: tRing,
        ringMat: rMat,
      })
    }

    // 3. High-Resolution 3D Topographic Bearing Depth Heatmap Surface (42 x 32 grid with PBR Gravel Bump & VertexColors)
    const terrainGeo = new THREE.BoxGeometry(BLOCK_W + 0.25, 1.12, BLOCK_D + 0.25, 42, 6, 32)
    const tPos = terrainGeo.attributes.position
    const baseTerrainY = new Float32Array(tPos.count)
    for (let i = 0; i < tPos.count; i++) {
      baseTerrainY[i] = tPos.getY(i)
    }

    const terrainColors = new Float32Array(tPos.count * 3)
    terrainGeo.setAttribute("color", new THREE.BufferAttribute(terrainColors, 3))

    const hmColorShallow = new THREE.Color(0x10b981) // -13.6m to -14.8m (Emerald)
    const hmColorMid = new THREE.Color(0xeab308)     // -14.8m to -16.0m (Warm Amber)
    const hmColorDeep = new THREE.Color(0xe76f51)    // -16.0m to -17.2m (Coral Orange)
    const hmColorAbyss = new THREE.Color(0x9a3412)   // -17.2m to -19.0m (Deep Rust Crimson)
    const hmColorUnmet = new THREE.Color(0x231710)   // Criteria Not Met (Dark Void)
    const hmSideRockColor = new THREE.Color(0xb85d38) // Dense bearing sandstone/gravel side wall tone
    const hmTempColor = new THREE.Color()

    const updateBearingHeatmap = (
      minQc: number,
      maxIc: number,
      minThickness: number,
      reliefAmplitude = 1
    ) => {
      const posArr = terrainGeo.attributes.position
      const colArr = terrainGeo.attributes.color
      const qcPenalty = Math.max(0, (minQc - 15.0) * 0.28)
      const icPenalty = Math.max(0, (1.8 - maxIc) * 2.4)
      const thickPenalty = Math.max(0, (minThickness - 2.0) * 0.45)
      const totalDepthPenaltyM = qcPenalty + icPenalty + thickPenalty

      for (let i = 0; i < posArr.count; i++) {
        const vx = posArr.getX(i)
        const vy0 = baseTerrainY[i]
        const vz = posArr.getZ(i)

        const dipTrendM = (vx * 0.35 + vz * 0.42) * 0.55
        const clayBasinM =
          1.35 * Math.exp(-((vx - 0.45) * (vx - 0.45) * 0.9 + (vz - 0.3) * (vz - 0.3) * 1.1))
        const ridgeWaveM =
          0.38 * Math.sin(vx * 1.55 + 0.4) * Math.cos(vz * 1.65) +
          0.16 * Math.cos(vx * 2.7 - vz * 2.1)

        const localDepthM = 14.3 + dipTrendM + clayBasinM - ridgeWaveM + totalDepthPenaltyM
        const localPeakQc =
          22.4 - clayBasinM * 2.9 - Math.max(0, dipTrendM) * 1.4 + ridgeWaveM * 1.8
        const localMinIc = 1.38 + clayBasinM * 0.22 + Math.max(0, dipTrendM) * 0.1
        const localMaxThickness = 4.6 - clayBasinM * 1.15

        const isVerified =
          localPeakQc >= minQc && localMinIc <= maxIc && localMaxThickness >= minThickness

        if (vy0 > -0.48) {
          const dispY = THREE.MathUtils.clamp((15.2 - localDepthM) * 0.24, -0.55, 0.45)
          const ny = (vy0 + 0.56) / 1.12
          posArr.setY(i, vy0 + dispY * ny * reliefAmplitude)
        }

        if (!isVerified) {
          colArr.setXYZ(i, hmColorUnmet.r, hmColorUnmet.g, hmColorUnmet.b)
        } else {
          const tDepth = THREE.MathUtils.clamp((localDepthM - 13.6) / 4.6, 0, 1)
          if (tDepth < 0.33) {
            hmTempColor.lerpColors(hmColorShallow, hmColorMid, tDepth / 0.33)
          } else if (tDepth < 0.66) {
            hmTempColor.lerpColors(hmColorMid, hmColorDeep, (tDepth - 0.33) / 0.33)
          } else {
            hmTempColor.lerpColors(hmColorDeep, hmColorAbyss, (tDepth - 0.66) / 0.34)
          }

          // Crisp topographic elevation isolines on the top bearing surface
          const contourPhase = Math.abs(((localDepthM * 1.4) % 1) - 0.5)
          if (contourPhase < 0.055 && vy0 > 0.25) {
            hmTempColor.multiplyScalar(1.28)
          }

          // Blend vertical side walls into a realistic stratified sandstone/gravel bedrock color
          if (vy0 < 0.25) {
            const wallFactor = THREE.MathUtils.clamp((0.25 - vy0) / 0.7, 0, 1)
            const beddingStripe = 0.88 + 0.12 * Math.sin(vy0 * 28.0 + vx * 2.5)
            hmTempColor.lerp(hmSideRockColor, wallFactor * 0.65)
            hmTempColor.multiplyScalar(beddingStripe * 0.82)
          }

          colArr.setXYZ(i, hmTempColor.r, hmTempColor.g, hmTempColor.b)
        }
      }

      posArr.needsUpdate = true
      colArr.needsUpdate = true
      applyBoxProjectedUVs(terrainGeo, 0.52, 0.95)
    }

    updateBearingHeatmap(15.0, 1.8, 2.0, 1)

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      bumpMap: bearingPBR.bumpMap,
      bumpScale: 0.048,
      roughnessMap: bearingPBR.roughnessMap,
      roughness: 0.58,
      metalness: 0.08,
    })
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat)
    terrainMesh.position.y = -1.45
    terrainMesh.castShadow = true
    terrainMesh.receiveShadow = true
    stratumRoot.add(terrainMesh)

    const terrainWireGeo = new THREE.WireframeGeometry(terrainGeo)
    const terrainWireMat = new THREE.LineBasicMaterial({
      color: 0x1c130d,
      transparent: true,
      opacity: 0.14,
    })
    terrainMesh.add(new THREE.LineSegments(terrainWireGeo, terrainWireMat))

    const datumLaserGeo = new THREE.PlaneGeometry(BLOCK_W + 0.45, BLOCK_D + 0.45)
    const datumLaserMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })
    const datumLaser = new THREE.Mesh(datumLaserGeo, datumLaserMat)
    datumLaser.rotation.x = -Math.PI / 2
    datumLaser.position.y = -0.95
    const datumEdges = new THREE.EdgesGeometry(datumLaserGeo)
    const datumLineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.78,
    })
    datumLaser.add(new THREE.LineSegments(datumEdges, datumLineMat))
    stratumRoot.add(datumLaser)

    disposableGeometries.push(
      pileCapGeo,
      pileCapEdges,
      pileCylGeo,
      pilePedestalGeo,
      pileShoeGeo,
      toeRingGeo,
      terrainGeo,
      terrainWireGeo,
      datumLaserGeo,
      datumEdges
    )
    disposableMaterials.push(
      pileCapMat,
      pileCapLineMat,
      terrainMat,
      terrainWireMat,
      datumLaserMat,
      datumLineMat
    )

    let isDragging = false
    let dragStartX = 0
    let userRotationY = 0.25

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

    let currentEntryT = 0
    let lastHmQc = 15.0
    let lastHmIc = 1.8
    let lastHmThick = 2.0
    let lastEntryQuant = -1
    let rafId = 0

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      if (!isVisible) return

      timer.update()
      const dt = Math.min(timer.getDelta(), 0.1)
      const elapsed = timer.getElapsed()
      const state = sceneStateRef.current

      const rect = container.getBoundingClientRect()
      const vpH = window.innerHeight
      const rawEntry = (vpH - rect.top) / Math.max(1, vpH * 0.65)
      const targetEntryT = smoothstep(rawEntry)
      currentEntryT = THREE.MathUtils.damp(currentEntryT, targetEntryT, 5.5, dt)

      const entryQuant = Math.round(currentEntryT * 50) / 50
      if (
        Math.abs(state.minQc - lastHmQc) > 0.05 ||
        Math.abs(state.maxIc - lastHmIc) > 0.01 ||
        Math.abs(state.minThickness - lastHmThick) > 0.05 ||
        Math.abs(entryQuant - lastEntryQuant) > 0.01
      ) {
        lastHmQc = state.minQc
        lastHmIc = state.maxIc
        lastHmThick = state.minThickness
        lastEntryQuant = entryQuant
        updateBearingHeatmap(state.minQc, state.maxIc, state.minThickness, currentEntryT)
      }

      terrainMesh.scale.y = 0.15 + 0.85 * currentEntryT
      terrainMesh.position.y = -1.45 - (1 - currentEntryT) * 0.9

      const qcShift = ((state.minQc - 15.0) / 10.0) * 0.42
      const thicknessShift = ((state.minThickness - 2.0) / 3.0) * 0.18
      datumLaser.position.y = -0.95 - qcShift - thicknessShift

      for (let idx = 0; idx < bearingPileVisuals.length; idx++) {
        const bPile = bearingPileVisuals[idx]
        const isHighlighted = state.hoveredBearingPointId === bPile.id
        const pileDriveT = THREE.MathUtils.clamp((currentEntryT - idx * 0.04) / 0.65, 0, 1)
        const easedDrive = smoothstep(pileDriveT)

        bPile.mesh.position.y =
          1.05 - PILE_LEN / 2 - qcShift * 0.45 + (1 - easedDrive) * 1.9
        bPile.mat.emissive.setHex(isHighlighted ? 0x10b981 : 0x7a421d)
        bPile.mat.emissiveIntensity = isHighlighted ? 0.85 : 0.18

        bPile.ringMat.color.setHex(isHighlighted ? 0xfad9ba : 0x10b981)
        const rScale = isHighlighted ? 1.45 + Math.sin(elapsed * 4.5) * 0.22 : 1.0
        bPile.ring.scale.set(rScale, rScale, 1)
      }

      stratumRoot.rotation.y = userRotationY + Math.sin(elapsed * 0.32) * 0.03
      renderer.render(scene, camera)
    }

    rafId = requestAnimationFrame(animate)

    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth || 780
      const newH = container.clientHeight || 410
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
  }, [sceneStateRef])

  return (
    <div className="relative w-full h-[280px] sm:h-[380px] xl:h-[410px] bg-[#FAF5EE] border border-[#1C130D]/15 overflow-hidden select-none">
      {/* Dedicated In-Section 3D Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
        aria-label="Interactive 3D Top-of-Bearing Depth Heatmap and Structural Foundation Piles"
      />
    </div>
  )
}

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import {
  STRATA_LAYER_SPECS,
  createRealisticStrataPBRTextures,
  createConcretePBRTextures,
  createLCutawayStrataGeometry,
  applyBoxProjectedUVs,
  getGeologicalWave,
  smoothstep,
} from "./geology3DUtils"

interface LayerVisualEntry {
  id: string
  group: THREE.Group
  material: THREE.MeshStandardMaterial
  edgeMaterial: THREE.LineBasicMaterial
  baseY: number
  height: number
}

export function HeroProblemGroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { dockElementsRef, sceneStateRef } = useSubsurface3D()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight
    const initialFov = width < 640 ? 44 : width < 1024 ? 38 : 33

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 0.1, 100)
    camera.position.set(8.4, 5.2, 9.4)
    camera.lookAt(0, -0.75, 0)

    // Studio Architectural & Geological Cutaway Lighting
    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)

    const ambientLight = new THREE.AmbientLight(0xfbf7f2, 1.05)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight(0xfff3e6, 0x381800, 0.78)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.8)
    keyLight.position.set(8, 14, 10)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -6
    keyLight.shadow.camera.right = 6
    keyLight.shadow.camera.top = 6
    keyLight.shadow.camera.bottom = -6
    keyLight.shadow.camera.near = 1
    keyLight.shadow.camera.far = 35
    keyLight.shadow.normalBias = 0.02
    keyLight.shadow.bias = -0.0002
    scene.add(keyLight)

    // Dedicated cutaway interior fill light to bring out bump relief on L-cutout inner walls
    const cutawayFillLight = new THREE.DirectionalLight(0xffe8d1, 1.45)
    cutawayFillLight.position.set(6, 2, 8)
    scene.add(cutawayFillLight)

    const rimLight = new THREE.DirectionalLight(0xfad9ba, 1.35)
    rimLight.position.set(-8, 6, -6)
    scene.add(rimLight)

    const bottomFill = new THREE.DirectionalLight(0xe76f51, 0.75)
    bottomFill.position.set(0, -9, 5)
    scene.add(bottomFill)

    const BLOCK_W = 4.0
    const BLOCK_D = 3.2

    const monolithRoot = new THREE.Group()
    scene.add(monolithRoot)

    const disposableGeometries: THREE.BufferGeometry[] = []
    const disposableMaterials: THREE.Material[] = []
    const disposableTextures: THREE.Texture[] = []

    // =========================================================================
    // 1. ARCHITECTURAL TOWER & PODIUM (Strips away upward when scrolling into Section 01)
    // =========================================================================
    const buildingGroup = new THREE.Group()
    monolithRoot.add(buildingGroup)

    const buildingMaterials: Array<{ mat: THREE.Material; baseOpacity: number }> = []
    const registerBuildingMat = <T extends THREE.Material>(mat: T, baseOpacity = 1): T => {
      mat.transparent = true
      mat.opacity = baseOpacity
      buildingMaterials.push({ mat, baseOpacity })
      disposableMaterials.push(mat)
      return mat
    }

    // Concrete PBR textures for building podium and structural slabs
    const concreteTexSet = createConcretePBRTextures("#EFE7DE", maxAnisotropy)
    disposableTextures.push(concreteTexSet.map, concreteTexSet.bumpMap)

    // L-shaped Podium matching the L-cutaway soil block
    const podiumGeo = createLCutawayStrataGeometry(BLOCK_W + 0.14, 0.14, BLOCK_D + 0.14, 0, 1)
    const podiumMat = registerBuildingMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: concreteTexSet.map,
        bumpMap: concreteTexSet.bumpMap,
        bumpScale: 0.018,
        roughness: 0.65,
        metalness: 0.06,
      }),
      1
    )
    const podiumMesh = new THREE.Mesh(podiumGeo, podiumMat)
    podiumMesh.position.y = 0.0
    podiumMesh.receiveShadow = true
    podiumMesh.castShadow = true
    buildingGroup.add(podiumMesh)

    const podiumEdges = new THREE.EdgesGeometry(podiumGeo, 18)
    const podiumLineMat = registerBuildingMat(
      new THREE.LineBasicMaterial({ color: 0x5a3008 }),
      0.55
    )
    podiumMesh.add(new THREE.LineSegments(podiumEdges, podiumLineMat))
    disposableGeometries.push(podiumGeo, podiumEdges)

    const towerW = 1.72
    const towerH = 1.92
    const towerD = 1.42
    const towerX = -0.68
    const towerZ = -0.22

    const towerCoreGeo = new THREE.BoxGeometry(towerW, towerH, towerD)
    const towerCoreMat = registerBuildingMat(
      new THREE.MeshStandardMaterial({ color: 0x2b211a, roughness: 0.22, metalness: 0.52 }),
      1
    )
    const towerCore = new THREE.Mesh(towerCoreGeo, towerCoreMat)
    towerCore.position.set(towerX, 0.14 + towerH / 2, towerZ)
    towerCore.castShadow = true
    buildingGroup.add(towerCore)
    disposableGeometries.push(towerCoreGeo)

    const slabMat = registerBuildingMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: concreteTexSet.map,
        bumpMap: concreteTexSet.bumpMap,
        bumpScale: 0.012,
        roughness: 0.52,
        metalness: 0.1,
      }),
      1
    )
    const slabEdgeMat = registerBuildingMat(
      new THREE.LineBasicMaterial({ color: 0x5a3008 }),
      0.7
    )

    const slabGeo = new THREE.BoxGeometry(towerW + 0.12, 0.055, towerD + 0.12)
    const slabEdgeGeo = new THREE.EdgesGeometry(slabGeo, 15)
    disposableGeometries.push(slabGeo, slabEdgeGeo)

    for (let floor = 0; floor <= 6; floor++) {
      const slab = new THREE.Mesh(slabGeo, slabMat)
      slab.position.set(towerX, 0.16 + floor * (towerH / 6), towerZ)
      slab.castShadow = true
      slab.add(new THREE.LineSegments(slabEdgeGeo, slabEdgeMat))
      buildingGroup.add(slab)
    }

    const colGeo = new THREE.BoxGeometry(0.07, towerH, 0.07)
    disposableGeometries.push(colGeo)
    const colOffsets = [
      [-towerW / 2 - 0.02, -towerD / 2 - 0.02],
      [0, -towerD / 2 - 0.02],
      [towerW / 2 + 0.02, -towerD / 2 - 0.02],
      [-towerW / 2 - 0.02, towerD / 2 + 0.02],
      [0, towerD / 2 + 0.02],
      [towerW / 2 + 0.02, towerD / 2 + 0.02],
    ]
    for (const [cx, cz] of colOffsets) {
      const col = new THREE.Mesh(colGeo, slabMat)
      col.position.set(towerX + cx, 0.14 + towerH / 2, towerZ + cz)
      buildingGroup.add(col)
    }

    const wingW = 1.15
    const wingH = 0.96
    const wingD = 1.15
    const wingX = 0.88
    const wingZ = -0.68

    const wingGeo = new THREE.BoxGeometry(wingW, wingH, wingD)
    const wingEdges = new THREE.EdgesGeometry(wingGeo, 15)
    const wingMesh = new THREE.Mesh(wingGeo, towerCoreMat)
    wingMesh.position.set(wingX, 0.14 + wingH / 2, wingZ)
    wingMesh.add(new THREE.LineSegments(wingEdges, slabEdgeMat))
    buildingGroup.add(wingMesh)
    disposableGeometries.push(wingGeo, wingEdges)

    const wingSlabGeo = new THREE.BoxGeometry(wingW + 0.1, 0.05, wingD + 0.1)
    const wingSlabEdges = new THREE.EdgesGeometry(wingSlabGeo, 15)
    disposableGeometries.push(wingSlabGeo, wingSlabEdges)
    for (let f = 1; f <= 3; f++) {
      const wSlab = new THREE.Mesh(wingSlabGeo, slabMat)
      wSlab.position.set(wingX, 0.14 + f * (wingH / 3), wingZ)
      wSlab.add(new THREE.LineSegments(wingSlabEdges, slabEdgeMat))
      buildingGroup.add(wSlab)
    }

    // =========================================================================
    // 2. RAPIDKERT-STYLE L-CUTAWAY 4-LAYER SOIL MONOLITH (Explodes vertically in Section 01)
    // =========================================================================
    const layerEntries: LayerVisualEntry[] = []
    let cursorY = 0

    // Shared pebble/clast geometry for realistic internal soil inclusions along cutaway faces
    const clastBaseGeo = new THREE.DodecahedronGeometry(0.055, 1)
    disposableGeometries.push(clastBaseGeo)

    for (let idx = 0; idx < STRATA_LAYER_SPECS.length; idx++) {
      const spec = STRATA_LAYER_SPECS[idx]
      const layerGroup = new THREE.Group()
      const baseY = cursorY - spec.height
      cursorY = baseY
      layerGroup.position.y = baseY

      const pbrTex = createRealisticStrataPBRTextures(spec.colorHex, spec.pattern, maxAnisotropy)
      disposableTextures.push(pbrTex.map, pbrTex.bumpMap, pbrTex.roughnessMap)

      const geo = createLCutawayStrataGeometry(
        BLOCK_W,
        spec.height,
        BLOCK_D,
        idx,
        STRATA_LAYER_SPECS.length
      )
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: pbrTex.map,
        bumpMap: pbrTex.bumpMap,
        bumpScale: spec.bumpScale,
        roughnessMap: pbrTex.roughnessMap,
        roughness: spec.roughness,
        metalness: spec.metalness,
        transparent: true,
        opacity: 1,
        depthWrite: true,
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.castShadow = true
      mesh.receiveShadow = true
      layerGroup.add(mesh)

      // Add realistic embedded 3D gravel cobbles & sedimentary nodules on the L-cutaway interior walls & top surface
      if (spec.pattern === "bearing" || spec.pattern === "sand" || spec.pattern === "silt") {
        const clastCount = spec.pattern === "bearing" ? 26 : spec.pattern === "sand" ? 12 : 8
        const clastMat = new THREE.MeshStandardMaterial({
          color: spec.pattern === "bearing" ? 0xc87a51 : spec.pattern === "sand" ? 0xe6c299 : 0x466345,
          bumpMap: pbrTex.bumpMap,
          bumpScale: 0.025,
          roughness: 0.72,
          metalness: 0.08,
        })
        disposableMaterials.push(clastMat)

        for (let c = 0; c < clastCount; c++) {
          const clastMesh = new THREE.Mesh(clastBaseGeo, clastMat)
          const onXWall = c % 2 === 0
          // Place clasts along the two interior L-cutaway walls (x = 0.22, z in [-0.08, 1.55] and z = -0.08, x in [0.22, 1.95])
          const frac = (c + 0.5) / clastCount
          const cy = (0.15 + ((c * 37) % 70) / 100) * spec.height
          if (onXWall) {
            const cz = -0.04 + frac * (BLOCK_D / 2 - 0.06)
            const waveY = getGeologicalWave(0.22, cz, idx * 1.6) * 0.5
            clastMesh.position.set(0.225, cy + waveY, cz)
          } else {
            const cx = 0.26 + frac * (BLOCK_W / 2 - 0.34)
            const waveY = getGeologicalWave(cx, -0.08, idx * 1.6) * 0.5
            clastMesh.position.set(cx, cy + waveY, -0.075)
          }
          const s = spec.pattern === "bearing" ? 0.7 + (c % 4) * 0.32 : 0.42 + (c % 3) * 0.2
          clastMesh.scale.set(s * 1.25, s * 0.65, s * 0.95)
          clastMesh.rotation.set(c * 0.7, c * 1.3, c * 0.4)
          clastMesh.castShadow = true
          clastMesh.receiveShadow = true
          layerGroup.add(clastMesh)
        }
      }

      const edgeGeo = new THREE.EdgesGeometry(geo, 24)
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x1c130d,
        transparent: true,
        opacity: 0.42,
      })
      const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat)
      layerGroup.add(edgeLines)

      disposableGeometries.push(geo, edgeGeo)
      disposableMaterials.push(mat, edgeMat)

      monolithRoot.add(layerGroup)
      layerEntries.push({
        id: spec.id,
        group: layerGroup,
        material: mat,
        edgeMaterial: edgeMat,
        baseY,
        height: spec.height,
      })
    }

    // =========================================================================
    // 3. SECTION 01 INTERNAL SUBSURFACE HAZARDS & BOREHOLE FAILURES
    // (Revealed inside the L-cutaway & exploded strata during Section 01)
    // =========================================================================
    const problemAnomalyGroup = new THREE.Group()
    problemAnomalyGroup.position.set(0, -1.75, 0)
    monolithRoot.add(problemAnomalyGroup)

    // Center Zone: Undetected Soft Marine Clay Hazard Pocket nestled in the L-cutaway corner
    const anomalyGeo = new THREE.IcosahedronGeometry(0.85, 4)
    const posAttr = anomalyGeo.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i)
      const vy = posAttr.getY(i)
      const vz = posAttr.getZ(i)
      const wave =
        1 +
        0.22 * Math.sin(vx * 3.2 + 0.5) * Math.cos(vz * 2.8) +
        0.15 * Math.cos(vy * 4.0) +
        0.06 * Math.sin(vx * 6.5 - vz * 5.8)
      // Pinch edges horizontally to resemble a natural sedimentary clay lens
      const radialDist = Math.hypot(vx, vz)
      const lensPinch = Math.max(0.28, 1 - radialDist * 0.35)
      posAttr.setXYZ(i, vx * 1.18 * wave, vy * 0.44 * wave * lensPinch, vz * 0.9 * wave)
    }
    applyBoxProjectedUVs(anomalyGeo, 0.65, 0.95)

    const clayLensTex = createRealisticStrataPBRTextures("#C85A32", "clay", maxAnisotropy)
    disposableTextures.push(clayLensTex.map, clayLensTex.bumpMap, clayLensTex.roughnessMap)

    const anomalyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: clayLensTex.map,
      bumpMap: clayLensTex.bumpMap,
      bumpScale: 0.032,
      roughnessMap: clayLensTex.roughnessMap,
      emissive: 0xd97706,
      emissiveIntensity: 0.38,
      roughness: 0.38,
      metalness: 0.08,
      transparent: true,
      opacity: 0,
    })
    const anomalyMesh = new THREE.Mesh(anomalyGeo, anomalyMat)
    anomalyMesh.position.set(0.55, -0.15, 0.48)
    anomalyMesh.castShadow = true
    anomalyMesh.receiveShadow = true
    problemAnomalyGroup.add(anomalyMesh)

    const anomalyWireGeo = new THREE.WireframeGeometry(anomalyGeo)
    const anomalyWireMat = new THREE.LineBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0,
    })
    anomalyMesh.add(new THREE.LineSegments(anomalyWireGeo, anomalyWireMat))

    // Wide Fixed-Grid Boreholes with 60-degree Steel CPT Cone Tips that miss the L-cutaway clay lens
    const blindBoreholeGeo = new THREE.CylinderGeometry(0.048, 0.048, 3.8, 16)
    const cptConeTipGeo = new THREE.ConeGeometry(0.064, 0.16, 16)
    cptConeTipGeo.rotateX(Math.PI) // Point straight down
    const blindBoreholeMat = new THREE.MeshStandardMaterial({
      color: 0x3b2f26,
      roughness: 0.28,
      metalness: 0.68,
      transparent: true,
      opacity: 0,
    })
    const blindRingGeo = new THREE.RingGeometry(0.13, 0.19, 24)
    const blindRingMat = new THREE.MeshBasicMaterial({
      color: 0x7a421d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    })

    const blindCorners: Array<[number, number]> = [
      [-0.45, -0.65],
      [1.45, -0.75],
      [-0.45, 1.15],
    ]
    for (const [bx, bz] of blindCorners) {
      const post = new THREE.Mesh(blindBoreholeGeo, blindBoreholeMat)
      post.position.set(bx, 0.1, bz)
      const coneTip = new THREE.Mesh(cptConeTipGeo, blindBoreholeMat)
      coneTip.position.y = -1.95
      post.add(coneTip)
      problemAnomalyGroup.add(post)

      const ring = new THREE.Mesh(blindRingGeo, blindRingMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(bx, 1.95, bz)
      problemAnomalyGroup.add(ring)
    }

    // West Zone: 5 Redundant Over-drilled Boreholes in uniform strata
    const overdrillRodGeo = new THREE.CylinderGeometry(0.042, 0.042, 3.6, 14)
    const overdrillMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x7a421d,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.55,
      transparent: true,
      opacity: 0,
    })
    const overdrillOffsets: Array<[number, number]> = [
      [-1.55, -0.45],
      [-1.25, -0.45],
      [-1.4, 0.0],
      [-1.55, 0.45],
      [-1.25, 0.45],
    ]
    for (const [ox, oz] of overdrillOffsets) {
      const oRod = new THREE.Mesh(overdrillRodGeo, overdrillMat)
      oRod.position.set(ox, 0.15, oz)
      const oTip = new THREE.Mesh(cptConeTipGeo, overdrillMat)
      oTip.position.y = -1.85
      oRod.add(oTip)
      problemAnomalyGroup.add(oRod)
    }

    // East Zone: 3 Prematurely Terminated Budget-Cutoff Soundings (Hanging mid-depth)
    const cutoffRodGeo = new THREE.CylinderGeometry(0.048, 0.048, 1.5, 14)
    const cutoffMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      emissive: 0xdc2626,
      emissiveIntensity: 0.4,
      roughness: 0.32,
      metalness: 0.5,
      transparent: true,
      opacity: 0,
    })
    const cutoffOffsets: Array<[number, number]> = [
      [1.15, -1.15],
      [1.55, -0.85],
      [1.35, -0.35],
    ]
    for (const [cx, cz] of cutoffOffsets) {
      const cRod = new THREE.Mesh(cutoffRodGeo, cutoffMat)
      cRod.position.set(cx, 1.15, cz)
      const cTip = new THREE.Mesh(cptConeTipGeo, cutoffMat)
      cTip.position.y = -0.8
      cRod.add(cTip)
      problemAnomalyGroup.add(cRod)

      const stopRing = new THREE.Mesh(blindRingGeo, cutoffMat)
      stopRing.rotation.x = -Math.PI / 2
      stopRing.position.set(cx, 0.4, cz)
      problemAnomalyGroup.add(stopRing)
    }

    disposableGeometries.push(
      anomalyGeo,
      anomalyWireGeo,
      blindBoreholeGeo,
      cptConeTipGeo,
      blindRingGeo,
      overdrillRodGeo,
      cutoffRodGeo
    )
    disposableMaterials.push(
      anomalyMat,
      anomalyWireMat,
      blindBoreholeMat,
      blindRingMat,
      overdrillMat,
      cutoffMat
    )

    // =========================================================================
    // INTERACTIVE DRAG ROTATION & SCROLL CHOREOGRAPHY
    // =========================================================================
    let isDragging = false
    let dragStartX = 0
    let userRotationY = 0

    const handlePointerDown = (e: PointerEvent) => {
      const heroEl = dockElementsRef.current.hero
      const probEl = dockElementsRef.current.problem
      const checkInRect = (el: HTMLDivElement | null | undefined) => {
        if (!el) return false
        const r = el.getBoundingClientRect()
        return (
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        )
      }
      if (!checkInRect(heroEl) && !checkInRect(probEl)) return
      isDragging = true
      dragStartX = e.clientX
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - dragStartX
      userRotationY += deltaX * 0.007
      dragStartX = e.clientX
    }

    const handlePointerUp = () => {
      isDragging = false
    }

    window.addEventListener("pointerdown", handlePointerDown, { passive: true })
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })

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

    let tProblem = 0
    let tExit = 0
    let currentOffsetCenterX = window.innerWidth * 0.72
    let currentOffsetCenterY = window.innerHeight * 0.5
    let currentCamX = 8.4
    let currentCamY = 5.2
    let currentCamZ = 9.4
    let currentLookX = 0
    let currentLookY = -0.8
    let currentRotY = -0.32

    let rafId = 0

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      if (!isVisible) return

      timer.update()
      const dt = Math.min(timer.getDelta(), 0.1)
      const elapsed = timer.getElapsed()
      const state = sceneStateRef.current

      // Compute continuous scroll transition between Hero Dock and Problem Dock
      let targetTProblem = 0
      let targetTExit = 0
      let targetCenterX = window.innerWidth * 0.72
      let targetCenterY = window.innerHeight * 0.5

      const heroEl = dockElementsRef.current.hero
      const probEl = dockElementsRef.current.problem

      if (heroEl && probEl) {
        const heroRect = heroEl.getBoundingClientRect()
        const probRect = probEl.getBoundingClientRect()
        const vpCenterY = window.innerHeight * 0.5

        const heroCY = heroRect.top + heroRect.height * 0.5
        const probCY = probRect.top + probRect.height * 0.5
        // Anchor hero start threshold to its resting Y at scrollY=0 so tall monitors start at tProblem=0
        const heroStartCY = Math.min(vpCenterY, heroCY + window.scrollY)

        if (heroCY >= heroStartCY) {
          targetTProblem = 0
          targetCenterX = heroRect.left + heroRect.width * 0.5
          targetCenterY = heroCY
        } else if (probCY >= vpCenterY) {
          const scrolledPastHero = heroStartCY - heroCY
          const remainingToProb = probCY - vpCenterY
          const raw =
            scrolledPastHero / Math.max(1, scrolledPastHero + remainingToProb)
          targetTProblem = smoothstep(raw)
          targetCenterX =
            heroRect.left +
            heroRect.width * 0.5 +
            (probRect.left + probRect.width * 0.5 - (heroRect.left + heroRect.width * 0.5)) *
              targetTProblem
          targetCenterY = heroCY + (probCY - heroCY) * targetTProblem
        } else {
          targetTProblem = 1
          targetCenterX = probRect.left + probRect.width * 0.5
          targetCenterY = probCY
          // As user scrolls past Problem dock toward Section 02, compute exit dive
          const exitSpan = window.innerHeight * 0.45
          targetTExit = smoothstep((vpCenterY - probCY) / Math.max(1, exitSpan))
        }
      }

      tProblem = THREE.MathUtils.damp(tProblem, targetTProblem, 6.5, dt)
      tExit = THREE.MathUtils.damp(tExit, targetTExit, 6.5, dt)

      // 1. Strip Upper Building Upward as tProblem increases (Rapidkert ground strip-off)
      const bVis = Math.max(0, 1 - tProblem * 1.35)
      buildingGroup.visible = bVis > 0.01
      buildingGroup.position.y = tProblem * 4.8
      buildingGroup.scale.setScalar(1 - tProblem * 0.22)
      for (const item of buildingMaterials) {
        item.mat.opacity = item.baseOpacity * bVis
      }

      // 2. Explode All 4 L-Cutaway Soil Strata Vertically & Widen Block in Section 01
      // Layer separation offsets so the internal clay lens & boreholes are clearly visible
      const explodeOffsets = [0.65, 0.25, -0.35, -1.05]
      const exitSinkY = -tExit * 3.2

      for (let i = 0; i < layerEntries.length; i++) {
        const entry = layerEntries[i]
        const isHoveredLayer = state.hoveredLayerId === entry.id
        const explodeY = explodeOffsets[i] * tProblem * (1 - tExit * 0.7)
        entry.group.position.y = entry.baseY + explodeY + exitSinkY

        // Slightly widen the L-cutaway block in Section 01 so the 3 zones read clearly
        const sx = 1 + tProblem * 0.16
        const sz = 1 + tProblem * 0.1
        entry.group.scale.set(sx, 1, sz)

        // In Section 01, Layer 03 (Soft Clay) becomes semi-translucent so the glowing internal lens shines through
        const targetOpacity =
          i === 2 ? (1 - tProblem * 0.48) * (1 - tExit) : (1 - tProblem * 0.06) * (1 - tExit)
        entry.material.opacity = Math.max(0.02, targetOpacity)
        entry.material.depthWrite = targetOpacity > 0.6
        entry.material.emissive.setHex(isHoveredLayer ? 0xd97706 : 0x000000)
        entry.material.emissiveIntensity = isHoveredLayer ? 0.25 : 0
        entry.edgeMaterial.opacity = Math.max(0.02, (0.6 + tProblem * 0.25) * (1 - tExit))
      }

      // 3. Reveal Internal Clay Hazard Lens & 3 Failure Zone Boreholes inside the exploded strata
      problemAnomalyGroup.visible = tProblem > 0.02
      problemAnomalyGroup.position.y = -1.75 + exitSinkY
      const anomalyAlpha = tProblem * (1 - tExit)
      anomalyMesh.rotation.y = elapsed * 0.3
      const pulseGlow = 0.45 + Math.sin(elapsed * 3.2) * 0.18
      anomalyMat.opacity = anomalyAlpha * 0.95
      anomalyMat.emissiveIntensity = state.hoveredProblemZone === 1 ? 0.95 : pulseGlow
      anomalyWireMat.opacity = anomalyAlpha * 0.85

      blindBoreholeMat.opacity = anomalyAlpha * 0.88
      blindRingMat.opacity = anomalyAlpha * 0.88

      overdrillMat.opacity = anomalyAlpha * 0.92
      overdrillMat.emissiveIntensity = state.hoveredProblemZone === 0 ? 0.88 : 0.3

      cutoffMat.opacity = anomalyAlpha * 0.94
      cutoffMat.emissiveIntensity = state.hoveredProblemZone === 2 ? 0.92 : 0.38

      // 4. Camera Choreography: Rotate L-Cutaway corner forward & pan across failure zones
      let problemPanX = 0
      if (tProblem > 0.2) {
        if (state.hoveredProblemZone === 0) problemPanX = -1.15 * tProblem
        else if (state.hoveredProblemZone === 1) problemPanX = 0.25 * tProblem
        else if (state.hoveredProblemZone === 2) problemPanX = 1.15 * tProblem
      }

      const targetCamX = THREE.MathUtils.lerp(8.4, 3.8, tProblem) + problemPanX * 0.6
      const targetCamY = THREE.MathUtils.lerp(5.2, 3.6, tProblem) - tExit * 2.2
      const targetCamZ = THREE.MathUtils.lerp(9.4, 9.8, tProblem) - tExit * 2.5
      const targetLookY = THREE.MathUtils.lerp(-0.75, -1.65, tProblem) + exitSinkY * 0.6
      // Rotate from -0.34 (Hero isometric) to +0.26 (L-cutout facing viewer in Section 01)
      const targetRotY =
        THREE.MathUtils.lerp(-0.34, 0.26, tProblem) +
        userRotationY +
        Math.sin(elapsed * 0.35) * 0.025

      currentCamX = THREE.MathUtils.damp(currentCamX, targetCamX, 5.0, dt)
      currentCamY = THREE.MathUtils.damp(currentCamY, targetCamY, 5.0, dt)
      currentCamZ = THREE.MathUtils.damp(currentCamZ, targetCamZ, 5.0, dt)
      currentLookX = THREE.MathUtils.damp(currentLookX, problemPanX * 0.45, 5.0, dt)
      currentLookY = THREE.MathUtils.damp(currentLookY, targetLookY, 5.0, dt)
      currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY, 5.0, dt)

      const vpW = container?.clientWidth || window.innerWidth
      const vpH = container?.clientHeight || window.innerHeight

      currentOffsetCenterX = THREE.MathUtils.damp(currentOffsetCenterX, targetCenterX, 9.0, dt)
      currentOffsetCenterY = THREE.MathUtils.damp(currentOffsetCenterY, targetCenterY, 9.0, dt)
      const offsetX = vpW * 0.5 - currentOffsetCenterX
      const offsetY = vpH * 0.5 - currentOffsetCenterY
      camera.setViewOffset(vpW, vpH, offsetX, offsetY, vpW, vpH)

      camera.position.set(currentCamX, currentCamY, currentCamZ)
      camera.lookAt(currentLookX, currentLookY, 0)
      monolithRoot.rotation.y = currentRotY

      renderer.render(scene, camera)
    }

    rafId = requestAnimationFrame(animate)

    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth || window.innerWidth
      const newH = container.clientHeight || window.innerHeight
      camera.fov = newW < 640 ? 44 : newW < 1024 ? 38 : 33
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      timer.dispose()

      for (const g of disposableGeometries) g.dispose()
      for (const m of disposableMaterials) m.dispose()
      for (const t of disposableTextures) t.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [dockElementsRef, sceneStateRef])

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none cursor-grab active:cursor-grabbing touch-pan-y"
      aria-label="Interactive 3D Architectural Tower and L-Cutaway Geological Strata Monolith"
    />
  )
}

/**
 * Rapidkert-style `section#ground` wrapper around Section 00 (Hero) and Section 01 (Problem).
 * The 3D Canvas sits at `z-0` inside a sticky viewport layer scoped strictly to Sections 00 to 01,
 * so it NEVER floats over Sections 02 to 06 and NEVER blocks foreground text (`z-10`).
 */
export function HeroProblemGroundWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div id="ground-story" className="relative bg-[#FBF7F2]">
      {/* Scoped Sticky 3D Canvas Layer (z-0: strictly behind foreground text/cards, only within Hero + Problem on ALL devices) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="sticky top-0 h-screen min-h-[100dvh] w-full overflow-hidden">
          <HeroProblemGroundCanvas />
        </div>
      </div>

      {/* Foreground Content Layer (z-10: HeroSection & ProblemSection) */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

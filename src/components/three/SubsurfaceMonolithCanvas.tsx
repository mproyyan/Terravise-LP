import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useSubsurface3D, type MonolithStage } from "../../context/Subsurface3DContext"

interface LayerMeshEntry {
  id: string
  group: THREE.Group
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  edgeLines: THREE.LineSegments
  edgeMaterial: THREE.LineBasicMaterial
  baseY: number
  height: number
  baseColor: THREE.Color
}

function createProceduralStrataTexture(
  baseHex: string,
  pattern: "sand" | "silt" | "clay" | "bearing"
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext("2d")

  if (ctx) {
    ctx.fillStyle = baseHex
    ctx.fillRect(0, 0, 256, 256)

    if (pattern === "sand") {
      ctx.fillStyle = "rgba(28, 19, 13, 0.14)"
      for (let i = 0; i < 600; i++) {
        const x = (i * 73) % 256
        const y = (i * 137) % 256
        const size = (i % 3) + 1.5
        ctx.fillRect(x, y, size, size)
      }
      ctx.fillStyle = "rgba(250, 217, 186, 0.2)"
      for (let i = 0; i < 300; i++) {
        const x = (i * 97 + 19) % 256
        const y = (i * 53 + 41) % 256
        ctx.fillRect(x, y, 2, 2)
      }
    } else if (pattern === "silt") {
      ctx.strokeStyle = "rgba(28, 19, 13, 0.16)"
      ctx.lineWidth = 2
      for (let y = 0; y < 256; y += 14) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(85, y + 5, 170, y - 5, 256, y)
        ctx.stroke()
      }
    } else if (pattern === "clay") {
      ctx.strokeStyle = "rgba(250, 217, 186, 0.14)"
      ctx.lineWidth = 1.5
      for (let i = -256; i < 256; i += 16) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + 256, 256)
        ctx.stroke()
      }
      ctx.fillStyle = "rgba(28, 19, 13, 0.15)"
      for (let y = 16; y < 256; y += 32) {
        ctx.fillRect(0, y, 256, 3)
      }
    } else if (pattern === "bearing") {
      ctx.strokeStyle = "rgba(28, 19, 13, 0.22)"
      ctx.lineWidth = 2.5
      for (let y = 0; y < 256; y += 12) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(256, y)
        ctx.stroke()
      }
      ctx.fillStyle = "rgba(250, 217, 186, 0.22)"
      for (let i = 0; i < 350; i++) {
        const x = (i * 61) % 256
        const y = (i * 113) % 256
        ctx.fillRect(x, y, 3, 2)
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 1)
  return texture
}

export function SubsurfaceMonolithCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { sceneStateRef } = useSubsurface3D()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1. WebGLRenderer Setup (r186 compliant)
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
    renderer.localClippingEnabled = true
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // 2. Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100)
    camera.position.set(8.2, 6.4, 9.5)
    camera.lookAt(0, -0.8, 0)

    // 3. Architectural Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfbf7f2, 0.85)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight(0xfad9ba, 0x381800, 0.65)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xfff5eb, 2.4)
    keyLight.position.set(7, 12, 8)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.left = -6
    keyLight.shadow.camera.right = 6
    keyLight.shadow.camera.top = 6
    keyLight.shadow.camera.bottom = -6
    keyLight.shadow.camera.near = 1
    keyLight.shadow.camera.far = 30
    keyLight.shadow.normalBias = 0.02
    keyLight.shadow.bias = -0.0002
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xfad9ba, 1.1)
    rimLight.position.set(-7, 5, -6)
    scene.add(rimLight)

    const bottomFill = new THREE.DirectionalLight(0xe76f51, 0.55)
    bottomFill.position.set(0, -8, 4)
    scene.add(bottomFill)

    // 4. Clipping Planes for Interactive Easting (X) & Northing (Z) Slicing
    const BLOCK_W = 4.0
    const BLOCK_D = 3.2
    const clipPlaneX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), BLOCK_W / 2 + 0.5)
    const clipPlaneZ = new THREE.Plane(new THREE.Vector3(0, 0, -1), BLOCK_D / 2 + 0.5)
    const soilClippingPlanes = [clipPlaneX, clipPlaneZ]

    // Root Monolith Group
    const monolithRoot = new THREE.Group()
    scene.add(monolithRoot)

    const disposableGeometries: THREE.BufferGeometry[] = []
    const disposableMaterials: THREE.Material[] = []
    const disposableTextures: THREE.Texture[] = []

    // =========================================================================
    // A. ARCHITECTURAL BUILDING & SURFACE DATUM (+0.0m)
    // =========================================================================
    const buildingGroup = new THREE.Group()
    monolithRoot.add(buildingGroup)

    // Surface Ground Podium / Datum Slab (0.0m)
    const podiumGeo = new THREE.BoxGeometry(BLOCK_W + 0.16, 0.14, BLOCK_D + 0.16)
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0xefe7de,
      roughness: 0.7,
      metalness: 0.05,
    })
    const podiumMesh = new THREE.Mesh(podiumGeo, podiumMat)
    podiumMesh.position.y = 0.07
    podiumMesh.receiveShadow = true
    podiumMesh.castShadow = true
    buildingGroup.add(podiumMesh)

    const podiumEdges = new THREE.EdgesGeometry(podiumGeo, 15)
    const podiumLines = new THREE.LineSegments(
      podiumEdges,
      new THREE.LineBasicMaterial({ color: 0x5a3008, transparent: true, opacity: 0.55 })
    )
    podiumMesh.add(podiumLines)
    disposableGeometries.push(podiumGeo, podiumEdges)
    disposableMaterials.push(podiumMat, podiumLines.material as THREE.Material)

    // Survey Footprint Perimeter Grid on Surface
    const gridHelper = new THREE.GridHelper(BLOCK_W - 0.2, 8, 0x7a421d, 0xbd8564)
    gridHelper.position.y = 0.145
    gridHelper.scale.z = (BLOCK_D - 0.2) / (BLOCK_W - 0.2)
    const gridMat = gridHelper.material as THREE.Material
    if ("opacity" in gridMat) {
      gridMat.transparent = true
      gridMat.opacity = 0.35
    }
    buildingGroup.add(gridHelper)

    // Main High-Rise Architectural Tower (6 Stories)
    const towerW = 1.75
    const towerH = 1.95
    const towerD = 1.45
    const towerX = -0.45
    const towerZ = -0.15

    // Core glass/facade volume
    const towerCoreGeo = new THREE.BoxGeometry(towerW, towerH, towerD)
    const towerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x2b211a,
      roughness: 0.25,
      metalness: 0.45,
    })
    const towerCore = new THREE.Mesh(towerCoreGeo, towerCoreMat)
    towerCore.position.set(towerX, 0.14 + towerH / 2, towerZ)
    towerCore.castShadow = true
    towerCore.receiveShadow = true
    buildingGroup.add(towerCore)
    disposableGeometries.push(towerCoreGeo)
    disposableMaterials.push(towerCoreMat)

    // Architectural concrete floor slabs (6 levels) + vertical columns
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0xfbf7f2,
      roughness: 0.55,
      metalness: 0.1,
    })
    const slabEdgeMat = new THREE.LineBasicMaterial({
      color: 0x5a3008,
      transparent: true,
      opacity: 0.7,
    })
    disposableMaterials.push(slabMat, slabEdgeMat)

    const slabGeo = new THREE.BoxGeometry(towerW + 0.12, 0.055, towerD + 0.12)
    const slabEdgeGeo = new THREE.EdgesGeometry(slabGeo, 15)
    disposableGeometries.push(slabGeo, slabEdgeGeo)

    for (let floor = 0; floor <= 6; floor++) {
      const slab = new THREE.Mesh(slabGeo, slabMat)
      slab.position.set(towerX, 0.16 + floor * (towerH / 6), towerZ)
      slab.castShadow = true
      slab.receiveShadow = true
      const edges = new THREE.LineSegments(slabEdgeGeo, slabEdgeMat)
      slab.add(edges)
      buildingGroup.add(slab)
    }

    // Exterior Structural Columns on Tower
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
      col.castShadow = true
      buildingGroup.add(col)
    }

    // Rooftop Mechanical Penthouse & Telemetry Beacon
    const penthouseGeo = new THREE.BoxGeometry(0.75, 0.32, 0.65)
    const penthouseEdges = new THREE.EdgesGeometry(penthouseGeo, 15)
    const penthouse = new THREE.Mesh(penthouseGeo, slabMat)
    penthouse.position.set(towerX - 0.2, 0.14 + towerH + 0.16, towerZ)
    penthouse.castShadow = true
    penthouse.add(new THREE.LineSegments(penthouseEdges, slabEdgeMat))
    buildingGroup.add(penthouse)
    disposableGeometries.push(penthouseGeo, penthouseEdges)

    // Adjacent 3-Story Podium Wing
    const wingW = 1.25
    const wingH = 0.98
    const wingD = 1.35
    const wingX = 0.95
    const wingZ = 0.15

    const wingGeo = new THREE.BoxGeometry(wingW, wingH, wingD)
    const wingEdges = new THREE.EdgesGeometry(wingGeo, 15)
    const wingMesh = new THREE.Mesh(wingGeo, towerCoreMat)
    wingMesh.position.set(wingX, 0.14 + wingH / 2, wingZ)
    wingMesh.castShadow = true
    wingMesh.receiveShadow = true
    wingMesh.add(new THREE.LineSegments(wingEdges, slabEdgeMat))
    buildingGroup.add(wingMesh)
    disposableGeometries.push(wingGeo, wingEdges)

    const wingSlabGeo = new THREE.BoxGeometry(wingW + 0.1, 0.05, wingD + 0.1)
    const wingSlabEdges = new THREE.EdgesGeometry(wingSlabGeo, 15)
    disposableGeometries.push(wingSlabGeo, wingSlabEdges)
    for (let f = 1; f <= 3; f++) {
      const wSlab = new THREE.Mesh(wingSlabGeo, slabMat)
      wSlab.position.set(wingX, 0.14 + f * (wingH / 3), wingZ)
      wSlab.castShadow = true
      wSlab.add(new THREE.LineSegments(wingSlabEdges, slabEdgeMat))
      buildingGroup.add(wSlab)
    }

    // =========================================================================
    // B. 4 STRATIGRAPHIC SUBSURFACE LAYERS (0.0m down to -25.0m)
    // =========================================================================
    const layerSpecs: Array<{
      id: string
      height: number
      colorHex: string
      pattern: "sand" | "silt" | "clay" | "bearing"
    }> = [
      { id: "layer-1", height: 0.42, colorHex: "#D4A373", pattern: "sand" },
      { id: "layer-2", height: 0.76, colorHex: "#588157", pattern: "silt" },
      { id: "layer-3", height: 1.18, colorHex: "#A0522D", pattern: "clay" },
      { id: "layer-4", height: 1.48, colorHex: "#E76F51", pattern: "bearing" },
    ]

    const layerEntries: LayerMeshEntry[] = []
    let cursorY = 0

    for (const spec of layerSpecs) {
      const layerGroup = new THREE.Group()
      const baseY = cursorY - spec.height / 2
      cursorY -= spec.height
      layerGroup.position.y = baseY

      const tex = createProceduralStrataTexture(spec.colorHex, spec.pattern)
      disposableTextures.push(tex)

      const geo = new THREE.BoxGeometry(BLOCK_W, spec.height, BLOCK_D)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.colorHex),
        map: tex,
        roughness: 0.78,
        metalness: 0.06,
        clippingPlanes: soilClippingPlanes,
        clipShadows: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.castShadow = true
      mesh.receiveShadow = true
      layerGroup.add(mesh)

      const edgeGeo = new THREE.EdgesGeometry(geo, 15)
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x1c130d,
        transparent: true,
        opacity: 0.65,
        clippingPlanes: soilClippingPlanes,
      })
      const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat)
      layerGroup.add(edgeLines)

      disposableGeometries.push(geo, edgeGeo)
      disposableMaterials.push(mat, edgeMat)

      // Embedded Soft Clay Anomaly Lens inside Layer 3 (-6.5m to -14.0m)
      if (spec.id === "layer-3") {
        const lensGeo = new THREE.CylinderGeometry(0.95, 0.75, spec.height * 0.65, 24)
        lensGeo.scale(1.2, 1, 0.85)
        const lensMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.35,
          roughness: 0.4,
          metalness: 0.1,
          transparent: true,
          opacity: 0.9,
        })
        const lensMesh = new THREE.Mesh(lensGeo, lensMat)
        lensMesh.position.set(0.35, 0.04, 0.25)
        lensMesh.name = "anomalyLens"
        layerGroup.add(lensMesh)

        const lensEdges = new THREE.EdgesGeometry(lensGeo, 20)
        const lensLineMat = new THREE.LineBasicMaterial({
          color: 0xfad9ba,
          transparent: true,
          opacity: 0.85,
        })
        lensMesh.add(new THREE.LineSegments(lensEdges, lensLineMat))

        disposableGeometries.push(lensGeo, lensEdges)
        disposableMaterials.push(lensMat, lensLineMat)
      }

      monolithRoot.add(layerGroup)
      layerEntries.push({
        id: spec.id,
        group: layerGroup,
        mesh,
        material: mat,
        edgeLines,
        edgeMaterial: edgeMat,
        baseY,
        height: spec.height,
        baseColor: new THREE.Color(spec.colorHex),
      })
    }

    // =========================================================================
    // C. STRUCTURAL FOUNDATION PILES (Connecting Building down to Layer 4)
    // =========================================================================
    const pilesGroup = new THREE.Group()
    monolithRoot.add(pilesGroup)

    const TOTAL_PILE_LEN = 3.15
    const pileGeo = new THREE.CylinderGeometry(0.085, 0.085, TOTAL_PILE_LEN, 16)
    const pileMat = new THREE.MeshStandardMaterial({
      color: 0xfad9ba,
      emissive: 0x7a421d,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.3,
      transparent: true,
      opacity: 0.95,
    })
    const pileEdgeGeo = new THREE.EdgesGeometry(pileGeo, 30)
    const pileEdgeMat = new THREE.LineBasicMaterial({
      color: 0x5a3008,
      transparent: true,
      opacity: 0.6,
    })
    disposableGeometries.push(pileGeo, pileEdgeGeo)
    disposableMaterials.push(pileMat, pileEdgeMat)

    const pileCoords: Array<[number, number]> = [
      [-1.1, -0.7],
      [-0.45, -0.7],
      [0.2, -0.7],
      [-1.1, 0.45],
      [-0.45, 0.45],
      [0.2, 0.45],
      [0.95, -0.35],
      [0.95, 0.65],
    ]

    for (const [px, pz] of pileCoords) {
      const pile = new THREE.Mesh(pileGeo, pileMat)
      pile.position.set(px, -TOTAL_PILE_LEN / 2, pz)
      pile.add(new THREE.LineSegments(pileEdgeGeo, pileEdgeMat))
      pilesGroup.add(pile)
    }

    // Glowing Bearing Horizon Verification Plane inside Layer 4
    const bearingPlaneGeo = new THREE.PlaneGeometry(BLOCK_W + 0.3, BLOCK_D + 0.3)
    const bearingPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xe76f51,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const bearingPlane = new THREE.Mesh(bearingPlaneGeo, bearingPlaneMat)
    bearingPlane.rotation.x = -Math.PI / 2
    bearingPlane.position.y = -2.85
    const bearingPlaneEdges = new THREE.EdgesGeometry(bearingPlaneGeo)
    const bearingPlaneLineMat = new THREE.LineBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0,
    })
    bearingPlane.add(new THREE.LineSegments(bearingPlaneEdges, bearingPlaneLineMat))
    monolithRoot.add(bearingPlane)
    disposableGeometries.push(bearingPlaneGeo, bearingPlaneEdges)
    disposableMaterials.push(bearingPlaneMat, bearingPlaneLineMat)

    // =========================================================================
    // D. DQN RECOMMENDED TARGET "SPOT 2" & CPT PENETROMETER ROD
    // =========================================================================
    const spot2Group = new THREE.Group()
    const SPOT2_X = 0.35
    const SPOT2_Z = 0.25
    spot2Group.position.set(SPOT2_X, 0, SPOT2_Z)
    monolithRoot.add(spot2Group)

    // Surface Crosshair Rings at Spot 2
    const outerRingGeo = new THREE.RingGeometry(0.24, 0.3, 32)
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      toneMapped: false,
    })
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat)
    outerRing.rotation.x = -Math.PI / 2
    outerRing.position.y = 0.16
    spot2Group.add(outerRing)

    const pulseRingGeo = new THREE.RingGeometry(0.32, 0.36, 32)
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0xfad9ba,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      toneMapped: false,
    })
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat)
    pulseRing.rotation.x = -Math.PI / 2
    pulseRing.position.y = 0.16
    spot2Group.add(pulseRing)

    // CPT Penetrometer Rod & Cone Tip
    const rodLen = 3.2
    const rodGeo = new THREE.CylinderGeometry(0.038, 0.038, rodLen, 16)
    const rodMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.8,
      toneMapped: false,
    })
    const cptRod = new THREE.Mesh(rodGeo, rodMat)
    cptRod.position.y = -0.35
    spot2Group.add(cptRod)

    const coneTipGeo = new THREE.ConeGeometry(0.09, 0.24, 16)
    coneTipGeo.rotateX(Math.PI)
    const coneTip = new THREE.Mesh(coneTipGeo, rodMat)
    coneTip.position.y = -rodLen / 2 - 0.1
    cptRod.add(coneTip)

    disposableGeometries.push(outerRingGeo, pulseRingGeo, rodGeo, coneTipGeo)
    disposableMaterials.push(outerRingMat, pulseRingMat, rodMat)

    // Existing Fixed-Grid Soundings (B-01, B-02, B-03) at Perimeter that miss the clay pocket
    const fixedSoundingsGroup = new THREE.Group()
    monolithRoot.add(fixedSoundingsGroup)
    const fixedRodGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.6, 12)
    const fixedRodMat = new THREE.MeshBasicMaterial({
      color: 0xbd8564,
      transparent: true,
      opacity: 0.55,
    })
    disposableGeometries.push(fixedRodGeo)
    disposableMaterials.push(fixedRodMat)

    const fixedPoints: Array<[number, number]> = [
      [-1.55, -1.15], // B-01
      [1.55, 1.15],   // B-02
      [1.55, -1.15],  // B-03
    ]
    for (const [fx, fz] of fixedPoints) {
      const fRod = new THREE.Mesh(fixedRodGeo, fixedRodMat)
      fRod.position.set(fx, -1.6, fz)
      fixedSoundingsGroup.add(fRod)
    }

    // =========================================================================
    // E. INTERACTIVE POINTER PARALLAX & DRAG ROTATION
    // =========================================================================
    let pointerX = 0
    let pointerY = 0
    let isDragging = false
    let dragStartX = 0
    let userRotationY = 0

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      pointerX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1
      pointerY = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1

      if (isDragging) {
        const deltaX = e.clientX - dragStartX
        userRotationY += deltaX * 0.007
        dragStartX = e.clientX
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true
      dragStartX = e.clientX
    }

    const handlePointerUp = () => {
      isDragging = false
    }

    container.addEventListener("pointermove", handlePointerMove, { passive: true })
    container.addEventListener("pointerdown", handlePointerDown, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })

    // =========================================================================
    // F. SCROLLYTELLING ANIMATION LOOP (r186 THREE.Timer + MathUtils.damp)
    // =========================================================================
    const timer = new THREE.Timer()
    timer.connect(document)

    // Pre-allocated interpolation variables (zero per-frame GC allocations)
    let currentExplode = 0
    let currentClayShiftX = 0
    let currentClayShiftZ = 0
    let currentBuildingLift = 0
    let currentRodDepth = 0.6
    let currentUpperOpacity = 1
    let currentBearingGlow = 0
    let currentClipX = BLOCK_W / 2 + 0.5
    let currentClipZ = BLOCK_D / 2 + 0.5
    let currentCamX = 8.2
    let currentCamY = 6.2
    let currentCamZ = 9.2
    let currentLookY = -0.9
    let currentRootRotY = -0.35

    const stageTargets: Record<
      MonolithStage,
      {
        explode: number
        clayShiftX: number
        clayShiftZ: number
        buildingLift: number
        rodDepth: number
        upperOpacity: number
        bearingGlow: number
        camPos: [number, number, number]
        lookY: number
        rotY: number
      }
    > = {
      hero: {
        explode: 0.0,
        clayShiftX: 0,
        clayShiftZ: 0,
        buildingLift: 0,
        rodDepth: -0.35,
        upperOpacity: 1.0,
        bearingGlow: 0.0,
        camPos: [8.8, 5.4, 9.8],
        lookY: -0.85,
        rotY: -0.32,
      },
      problem: {
        explode: 0.45,
        clayShiftX: 0.42,
        clayShiftZ: 0.32,
        buildingLift: 0.35,
        rodDepth: -0.75,
        upperOpacity: 0.95,
        bearingGlow: 0.0,
        camPos: [9.4, 5.2, 9.8],
        lookY: -1.35,
        rotY: 0.28,
      },
      dqn: {
        explode: 0.36,
        clayShiftX: 0.16,
        clayShiftZ: 0.14,
        buildingLift: 0.28,
        rodDepth: -1.35,
        upperOpacity: 0.78,
        bearingGlow: 0.15,
        camPos: [8.4, 6.6, 9.0],
        lookY: -1.25,
        rotY: -0.52,
      },
      voxel: {
        explode: 0.12,
        clayShiftX: 0,
        clayShiftZ: 0,
        buildingLift: 0.12,
        rodDepth: -1.65,
        upperOpacity: 1.0,
        bearingGlow: 0.2,
        camPos: [8.4, 5.0, 9.2],
        lookY: -1.25,
        rotY: -0.22,
      },
      stratum: {
        explode: 0.32,
        clayShiftX: 0,
        clayShiftZ: 0,
        buildingLift: 0.24,
        rodDepth: -1.95,
        upperOpacity: 0.26,
        bearingGlow: 0.95,
        camPos: [9.0, 4.3, 9.6],
        lookY: -1.65,
        rotY: 0.32,
      },
      workflow: {
        explode: 0.2,
        clayShiftX: 0,
        clayShiftZ: 0,
        buildingLift: 0.16,
        rodDepth: -1.85,
        upperOpacity: 0.88,
        bearingGlow: 0.45,
        camPos: [9.2, 5.8, 10.0],
        lookY: -1.1,
        rotY: -0.35,
      },
    }

    function animate() {
      timer.update()
      const dt = Math.min(timer.getDelta(), 0.1)
      const elapsed = timer.getElapsed()
      const state = sceneStateRef.current
      const fromTarget = stageTargets[state.transitionFrom] || stageTargets[state.activeStage] || stageTargets.hero
      const toTarget = stageTargets[state.transitionTo] || stageTargets[state.activeStage] || stageTargets.hero
      const t = state.transitionT

      const targetExplode = THREE.MathUtils.lerp(fromTarget.explode, toTarget.explode, t)
      const targetClayX = THREE.MathUtils.lerp(fromTarget.clayShiftX, toTarget.clayShiftX, t)
      const targetClayZ = THREE.MathUtils.lerp(fromTarget.clayShiftZ, toTarget.clayShiftZ, t)
      const targetLift = THREE.MathUtils.lerp(fromTarget.buildingLift, toTarget.buildingLift, t)
      const targetRod = THREE.MathUtils.lerp(fromTarget.rodDepth, toTarget.rodDepth, t)
      const targetOpacity = THREE.MathUtils.lerp(fromTarget.upperOpacity, toTarget.upperOpacity, t)
      const targetGlow = THREE.MathUtils.lerp(fromTarget.bearingGlow, toTarget.bearingGlow, t)
      const blendedCamPos: [number, number, number] = [
        THREE.MathUtils.lerp(fromTarget.camPos[0], toTarget.camPos[0], t),
        THREE.MathUtils.lerp(fromTarget.camPos[1], toTarget.camPos[1], t),
        THREE.MathUtils.lerp(fromTarget.camPos[2], toTarget.camPos[2], t),
      ]
      const blendedLookY = THREE.MathUtils.lerp(fromTarget.lookY, toTarget.lookY, t)
      const blendedRotY = THREE.MathUtils.lerp(fromTarget.rotY, toTarget.rotY, t)

      // 1. Damp Scrollytelling Parameters
      const dampLambda = 6.0
      currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, dampLambda, dt)
      currentClayShiftX = THREE.MathUtils.damp(currentClayShiftX, targetClayX, dampLambda, dt)
      currentClayShiftZ = THREE.MathUtils.damp(currentClayShiftZ, targetClayZ, dampLambda, dt)
      currentBuildingLift = THREE.MathUtils.damp(
        currentBuildingLift,
        targetLift,
        dampLambda,
        dt
      )
      currentRodDepth = THREE.MathUtils.damp(currentRodDepth, targetRod, dampLambda, dt)
      currentUpperOpacity = THREE.MathUtils.damp(
        currentUpperOpacity,
        targetOpacity,
        dampLambda,
        dt
      )
      currentBearingGlow = THREE.MathUtils.damp(
        currentBearingGlow,
        targetGlow,
        dampLambda,
        dt
      )

      // 2. Apply Exploded View & Section Transformations to Building + 4 Strata
      buildingGroup.position.y = currentBuildingLift

      for (let i = 0; i < layerEntries.length; i++) {
        const entry = layerEntries[i]
        const explodeOffset = -i * currentExplode
        entry.group.position.y = entry.baseY + explodeOffset

        // In Section 01 (Problem) & 02 (DQN), Layer 3 (Soft Clay) shifts out laterally to expose the hazard lens
        if (entry.id === "layer-3") {
          entry.group.position.x = currentClayShiftX
          entry.group.position.z = currentClayShiftZ
        } else {
          entry.group.position.x = 0
          entry.group.position.z = 0
        }

        // Hover or Stage Highlighting
        const isHovered = state.hoveredLayerId === entry.id
        const isBearingLayer = entry.id === "layer-4"
        const isClayProblem =
          entry.id === "layer-3" &&
          (state.activeStage === "problem" ||
            (state.activeStage === "dqn" && state.activeDqnTab === "transition"))

        if (isBearingLayer) {
          entry.material.opacity = 1.0
          entry.material.emissive.setHex(0xe76f51)
          entry.material.emissiveIntensity =
            currentBearingGlow * 0.45 + (isHovered ? 0.3 : 0)
        } else {
          entry.material.opacity = isHovered ? 1.0 : currentUpperOpacity
          if (isClayProblem || isHovered) {
            entry.material.emissive.setHex(0xd97706)
            entry.material.emissiveIntensity = 0.25 + Math.sin(elapsed * 3) * 0.1
          } else {
            entry.material.emissive.setHex(0x000000)
            entry.material.emissiveIntensity = 0
          }
        }
      }

      // 3. Clipping Planes (Active in Voxel stage or when user slices below 98%)
      const isVoxelStage = state.activeStage === "voxel"
      const targetClipX = isVoxelStage
        ? -BLOCK_W / 2 + (state.sliceX / 100) * BLOCK_W
        : BLOCK_W / 2 + 0.6
      const targetClipZ = isVoxelStage
        ? -BLOCK_D / 2 + (state.sliceY / 100) * BLOCK_D
        : BLOCK_D / 2 + 0.6

      currentClipX = THREE.MathUtils.damp(currentClipX, targetClipX, 7, dt)
      currentClipZ = THREE.MathUtils.damp(currentClipZ, targetClipZ, 7, dt)
      clipPlaneX.constant = currentClipX
      clipPlaneZ.constant = currentClipZ

      // 4. CPT Penetrometer Rod & Spot 2 Pulse Animation
      spot2Group.position.y = currentBuildingLift
      cptRod.position.y = currentRodDepth
      const pulseScale = 1 + Math.sin(elapsed * 3.5) * 0.18
      pulseRing.scale.set(pulseScale, pulseScale, 1)
      pulseRingMat.opacity = 0.75 - Math.sin(elapsed * 3.5) * 0.35

      // 5. Structural Foundation Piles & Bearing Verification Horizon (Section 04)
      // Pile embedment depth reacts to user's minQc slider (10 to 25 MPa)
      const qcOffset = ((state.minQc - 15.0) / 10.0) * 0.35
      pilesGroup.position.y = currentBuildingLift * 0.3 - qcOffset
      pileMat.opacity = THREE.MathUtils.lerp(0.35, 1.0, currentBearingGlow)
      pileMat.emissiveIntensity = 0.15 + currentBearingGlow * 0.6

      const layer4Group = layerEntries[3]?.group
      if (layer4Group) {
        bearingPlane.position.y = layer4Group.position.y + 0.35 - qcOffset
      }
      bearingPlaneMat.opacity = currentBearingGlow * 0.32
      bearingPlaneLineMat.opacity = currentBearingGlow * 0.9

      // 6. Camera Position & Orientation (Isometric vs Front Profile + Gentle Parallax)
      const isFrontProfile = state.activeStage === "voxel" && state.cameraView === "front"
      const targetCamX = isFrontProfile ? 0.0 : blendedCamPos[0]
      const targetCamY = isFrontProfile ? -1.1 : blendedCamPos[1]
      const targetCamZ = isFrontProfile ? 10.6 : blendedCamPos[2]

      currentCamX = THREE.MathUtils.damp(currentCamX, targetCamX, 4.5, dt)
      currentCamY = THREE.MathUtils.damp(currentCamY, targetCamY, 4.5, dt)
      currentCamZ = THREE.MathUtils.damp(currentCamZ, targetCamZ, 4.5, dt)
      currentLookY = THREE.MathUtils.damp(currentLookY, blendedLookY, 5.0, dt)

      camera.position.set(
        currentCamX + pointerX * 0.35,
        currentCamY + pointerY * 0.25,
        currentCamZ
      )
      camera.lookAt(0, currentLookY, 0)

      const targetRotY = isFrontProfile
        ? 0
        : blendedRotY + userRotationY + Math.sin(elapsed * 0.35) * 0.04
      currentRootRotY = THREE.MathUtils.damp(currentRootRotY, targetRotY, 5.0, dt)
      monolithRoot.rotation.y = currentRootRotY

      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(animate)

    // Resize Observer
    const handleResize = () => {
      if (!container) return
      const newW = container.clientWidth || window.innerWidth
      const newH = container.clientHeight || window.innerHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      container.removeEventListener("pointermove", handlePointerMove)
      container.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointerup", handlePointerUp)

      renderer.setAnimationLoop(null)
      timer.dispose()

      for (const geo of disposableGeometries) geo.dispose()
      for (const mat of disposableMaterials) mat.dispose()
      for (const tex of disposableTextures) tex.dispose()

      scene.traverse((obj) => {
        if ("dispose" in obj && typeof obj.dispose === "function") {
          obj.dispose()
        }
      })

      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [sceneStateRef])

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
      aria-label="Interactive 3D architectural building and subsurface soil monolith"
    />
  )
}

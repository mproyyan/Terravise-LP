import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useSubsurface3D, type MonolithStage } from "../../context/Subsurface3DContext"
import { MOCK_CPT_TEST_PIPES } from "../../data/mockGeology"

interface LayerMeshEntry {
  id: string
  group: THREE.Group
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  edgeLines: THREE.LineSegments
  edgeMaterial: THREE.LineBasicMaterial
  baseY: number
  height: number
}

interface SmoothHorizonEntry {
  id: string
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  edgeLines: THREE.LineSegments
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
  hitProxy: THREE.Mesh
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
      ctx.fillStyle = "rgba(28, 19, 13, 0.12)"
      for (let i = 0; i < 450; i++) {
        const x = (i * 73) % 256
        const y = (i * 137) % 256
        ctx.fillRect(x, y, (i % 2) + 1.5, (i % 2) + 1.5)
      }
    } else if (pattern === "silt") {
      ctx.strokeStyle = "rgba(28, 19, 13, 0.15)"
      ctx.lineWidth = 2
      for (let y = 0; y < 256; y += 14) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(85, y + 4, 170, y - 4, 256, y)
        ctx.stroke()
      }
    } else if (pattern === "clay") {
      ctx.strokeStyle = "rgba(250, 217, 186, 0.15)"
      ctx.lineWidth = 1.5
      for (let i = -256; i < 256; i += 18) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + 256, 256)
        ctx.stroke()
      }
    } else if (pattern === "bearing") {
      ctx.strokeStyle = "rgba(28, 19, 13, 0.2)"
      ctx.lineWidth = 2
      for (let y = 0; y < 256; y += 12) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(256, y)
        ctx.stroke()
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

function getStageWeights(
  fromStage: MonolithStage,
  toStage: MonolithStage,
  t: number
): Record<MonolithStage, number> {
  const weights: Record<MonolithStage, number> = {
    hero: 0,
    problem: 0,
    dqn: 0,
    voxel: 0,
    stratum: 0,
    workflow: 0,
  }
  if (fromStage === toStage) {
    weights[fromStage] = 1
  } else {
    weights[fromStage] = 1 - t
    weights[toStage] = t
  }
  return weights
}

// Smooth undulating geological surface helper
function getGeologicalWave(x: number, z: number, seed: number): number {
  return (
    0.09 * Math.sin(x * 1.35 + seed) * Math.cos(z * 1.45 - seed * 0.5) +
    0.05 * Math.cos((x + z) * 1.8 + seed)
  )
}

export function SubsurfaceMonolithCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { sceneStateRef, setSelectedPipeId, setPipeScreenCoords } = useSubsurface3D()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1. WebGLRenderer Setup (r186 compliant, localClippingEnabled for smooth 3D volume slicing)
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
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 120)
    camera.position.set(8.6, 5.4, 9.6)
    camera.lookAt(0, -0.8, 0)

    // 3. Architectural Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfbf7f2, 0.9)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight(0xfad9ba, 0x381800, 0.65)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xfff5eb, 2.5)
    keyLight.position.set(8, 13, 9)
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

    const rimLight = new THREE.DirectionalLight(0xfad9ba, 1.2)
    rimLight.position.set(-8, 6, -6)
    scene.add(rimLight)

    const bottomFill = new THREE.DirectionalLight(0xe76f51, 0.65)
    bottomFill.position.set(0, -9, 5)
    scene.add(bottomFill)

    const BLOCK_W = 4.0
    const BLOCK_D = 3.2

    // Local Clipping Planes for Section 03 Smooth Boundary Volume (Does NOT clip the 5 test pipes!)
    const clipPlaneX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), BLOCK_W / 2 + 0.5)
    const clipPlaneZ = new THREE.Plane(new THREE.Vector3(0, 0, -1), BLOCK_D / 2 + 0.5)
    const smoothVolumeClipPlanes = [clipPlaneX, clipPlaneZ]

    const monolithRoot = new THREE.Group()
    scene.add(monolithRoot)

    const disposableGeometries: THREE.BufferGeometry[] = []
    const disposableMaterials: THREE.Material[] = []
    const disposableTextures: THREE.Texture[] = []

    // =========================================================================
    // VISUALIZER 00: ARCHITECTURAL BUILDING & MONOLITH STRATA (Hero & Problem)
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

    const podiumGeo = new THREE.BoxGeometry(BLOCK_W + 0.16, 0.14, BLOCK_D + 0.16)
    const podiumMat = registerBuildingMat(
      new THREE.MeshStandardMaterial({ color: 0xefe7de, roughness: 0.7, metalness: 0.05 }),
      1
    )
    const podiumMesh = new THREE.Mesh(podiumGeo, podiumMat)
    podiumMesh.position.y = 0.07
    podiumMesh.receiveShadow = true
    podiumMesh.castShadow = true
    buildingGroup.add(podiumMesh)

    const podiumEdges = new THREE.EdgesGeometry(podiumGeo, 15)
    const podiumLineMat = registerBuildingMat(
      new THREE.LineBasicMaterial({ color: 0x5a3008 }),
      0.55
    )
    podiumMesh.add(new THREE.LineSegments(podiumEdges, podiumLineMat))
    disposableGeometries.push(podiumGeo, podiumEdges)

    const towerW = 1.75
    const towerH = 1.95
    const towerD = 1.45
    const towerX = -0.45
    const towerZ = -0.15

    const towerCoreGeo = new THREE.BoxGeometry(towerW, towerH, towerD)
    const towerCoreMat = registerBuildingMat(
      new THREE.MeshStandardMaterial({ color: 0x2b211a, roughness: 0.25, metalness: 0.45 }),
      1
    )
    const towerCore = new THREE.Mesh(towerCoreGeo, towerCoreMat)
    towerCore.position.set(towerX, 0.14 + towerH / 2, towerZ)
    towerCore.castShadow = true
    buildingGroup.add(towerCore)
    disposableGeometries.push(towerCoreGeo)

    const slabMat = registerBuildingMat(
      new THREE.MeshStandardMaterial({ color: 0xfbf7f2, roughness: 0.55, metalness: 0.1 }),
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

    const wingW = 1.25
    const wingH = 0.98
    const wingD = 1.35
    const wingX = 0.95
    const wingZ = 0.15

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

    // 4 Stratigraphic Layers (Used in Hero, and Layer 3 isolated in Problem)
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
        roughness: 0.75,
        metalness: 0.06,
        transparent: true,
        opacity: 1,
        depthWrite: true,
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
      })
      const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat)
      layerGroup.add(edgeLines)

      disposableGeometries.push(geo, edgeGeo)
      disposableMaterials.push(mat, edgeMat)

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
      })
    }

    // =========================================================================
    // VISUALIZER 01: PROBLEM SECTION — 3-ZONE PANORAMIC GEOLOGICAL TRENCH
    // Zone 1 (Left): Over-drilling cluster | Zone 2 (Center): Soft Clay Lens | Zone 3 (Right): Budget Cutoff
    // =========================================================================
    const problemAnomalyGroup = new THREE.Group()
    problemAnomalyGroup.position.set(0, -1.75, 0)
    monolithRoot.add(problemAnomalyGroup)

    // Zone 2 (Center): Deformed Organic 3D Soft Clay Hazard Lens
    const anomalyGeo = new THREE.IcosahedronGeometry(0.95, 3)
    const posAttr = anomalyGeo.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i)
      const vy = posAttr.getY(i)
      const vz = posAttr.getZ(i)
      const wave =
        1 +
        0.22 * Math.sin(vx * 3.2 + 0.5) * Math.cos(vz * 2.8) +
        0.15 * Math.cos(vy * 4.0)
      posAttr.setXYZ(i, vx * 1.15 * wave, vy * 0.42 * wave, vz * 0.9 * wave)
    }
    anomalyGeo.computeVertexNormals()

    const anomalyMat = new THREE.MeshStandardMaterial({
      color: 0xe76f51,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
    })
    const anomalyMesh = new THREE.Mesh(anomalyGeo, anomalyMat)
    anomalyMesh.position.set(0.0, 0, 0.05)
    problemAnomalyGroup.add(anomalyMesh)

    const anomalyWireGeo = new THREE.WireframeGeometry(anomalyGeo)
    const anomalyWireMat = new THREE.LineBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0,
    })
    const anomalyWire = new THREE.LineSegments(anomalyWireGeo, anomalyWireMat)
    anomalyMesh.add(anomalyWire)

    // Wide Fixed-Grid Boreholes flanking Zone 2 (Missing the central clay lens)
    const blindBoreholeGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.8, 16)
    const blindBoreholeMat = new THREE.MeshStandardMaterial({
      color: 0x1c130d,
      roughness: 0.4,
      transparent: true,
      opacity: 0,
    })
    const blindRingGeo = new THREE.RingGeometry(0.14, 0.2, 24)
    const blindRingMat = new THREE.MeshBasicMaterial({
      color: 0x7a421d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    })

    const blindCorners: Array<[number, number]> = [
      [-1.05, -0.85],
      [1.05, -0.85],
      [-1.05, 0.85],
      [1.05, 0.85],
    ]
    for (const [bx, bz] of blindCorners) {
      const post = new THREE.Mesh(blindBoreholeGeo, blindBoreholeMat)
      post.position.set(bx, 0.1, bz)
      problemAnomalyGroup.add(post)

      const ring = new THREE.Mesh(blindRingGeo, blindRingMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(bx, 0.62, bz)
      problemAnomalyGroup.add(ring)
    }

    // Zone 1 (Left, x = -2.15): 5 Over-drilled Redundant Boreholes in Uniform Ground
    const overdrillRodGeo = new THREE.CylinderGeometry(0.042, 0.042, 2.6, 12)
    const overdrillMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x7a421d,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0,
    })
    const overdrillOffsets: Array<[number, number]> = [
      [-2.35, -0.45],
      [-1.95, -0.45],
      [-2.15, 0.0],
      [-2.35, 0.45],
      [-1.95, 0.45],
    ]
    for (const [ox, oz] of overdrillOffsets) {
      const oRod = new THREE.Mesh(overdrillRodGeo, overdrillMat)
      oRod.position.set(ox, 0.15, oz)
      problemAnomalyGroup.add(oRod)
    }

    // Zone 3 (Right, x = +2.15): 3 Prematurely Terminated Budget-Cutoff Boreholes (Hanging mid-depth)
    const cutoffRodGeo = new THREE.CylinderGeometry(0.048, 0.048, 1.15, 12)
    const cutoffMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      emissive: 0xdc2626,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0,
    })
    const cutoffOffsets: Array<[number, number]> = [
      [1.95, -0.4],
      [2.25, 0.05],
      [2.05, 0.5],
    ]
    for (const [cx, cz] of cutoffOffsets) {
      const cRod = new THREE.Mesh(cutoffRodGeo, cutoffMat)
      cRod.position.set(cx, 0.85, cz)
      problemAnomalyGroup.add(cRod)

      const stopRing = new THREE.Mesh(blindRingGeo, cutoffMat)
      stopRing.rotation.x = -Math.PI / 2
      stopRing.position.set(cx, 0.28, cz)
      problemAnomalyGroup.add(stopRing)
    }

    disposableGeometries.push(
      anomalyGeo,
      anomalyWireGeo,
      blindBoreholeGeo,
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
    // VISUALIZER 02: DQN SECTION — 144-NODE TOPOGRAPHIC CANDIDATE RADAR & SPOT 2 LASER
    // =========================================================================
    const dqnRadarGroup = new THREE.Group()
    dqnRadarGroup.position.set(0, -1.1, 0)
    monolithRoot.add(dqnRadarGroup)

    const GRID_NX = 12
    const GRID_NZ = 10
    const NODE_COUNT = GRID_NX * GRID_NZ
    const nodeGeo = new THREE.CylinderGeometry(0.055, 0.055, 1, 12)
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0,
    })
    const candidateInstanced = new THREE.InstancedMesh(nodeGeo, nodeMat, NODE_COUNT)
    dqnRadarGroup.add(candidateInstanced)

    const SPOT2_X = 0.42
    const SPOT2_Z = 0.28
    const nodeDummy = new THREE.Object3D()
    const nodeColor = new THREE.Color()
    const candidateCoords: Array<{ x: number; z: number; distSpot2: number; qVal: number }> = []

    let nIdx = 0
    for (let ix = 0; ix < GRID_NX; ix++) {
      for (let iz = 0; iz < GRID_NZ; iz++) {
        const x = -BLOCK_W / 2 + 0.25 + (ix / (GRID_NX - 1)) * (BLOCK_W - 0.5)
        const z = -BLOCK_D / 2 + 0.25 + (iz / (GRID_NZ - 1)) * (BLOCK_D - 0.5)
        const dist = Math.hypot(x - SPOT2_X, z - SPOT2_Z)
        const qVal = Math.max(0.12, Math.exp(-dist * dist * 0.85))
        candidateCoords.push({ x, z, distSpot2: dist, qVal })

        nodeDummy.position.set(x, qVal * 0.45, z)
        nodeDummy.scale.set(1, Math.max(0.15, qVal * 0.9), 1)
        nodeDummy.updateMatrix()
        candidateInstanced.setMatrixAt(nIdx, nodeDummy.matrix)

        if (dist < 0.45) {
          nodeColor.setHex(0x10b981)
        } else if (dist < 1.15) {
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

    const radarPlateGeo = new THREE.BoxGeometry(BLOCK_W + 0.2, 0.06, BLOCK_D + 0.2)
    const radarPlateMat = new THREE.MeshStandardMaterial({
      color: 0x1c130d,
      roughness: 0.8,
      transparent: true,
      opacity: 0,
    })
    const radarPlate = new THREE.Mesh(radarPlateGeo, radarPlateMat)
    radarPlate.position.y = -0.05
    dqnRadarGroup.add(radarPlate)

    const radarPlateEdges = new THREE.EdgesGeometry(radarPlateGeo)
    const radarPlateLineMat = new THREE.LineBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0,
    })
    radarPlate.add(new THREE.LineSegments(radarPlateEdges, radarPlateLineMat))

    const laserBeamGeo = new THREE.CylinderGeometry(0.045, 0.045, 3.4, 16)
    const laserBeamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0,
      toneMapped: false,
    })
    const laserBeam = new THREE.Mesh(laserBeamGeo, laserBeamMat)
    laserBeam.position.set(SPOT2_X, 1.4, SPOT2_Z)
    dqnRadarGroup.add(laserBeam)

    const gapCylinderGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.75, 36, 1, true)
    const gapCylinderMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    const gapCylinder = new THREE.Mesh(gapCylinderGeo, gapCylinderMat)
    gapCylinder.position.set(SPOT2_X, 0.38, SPOT2_Z)
    dqnRadarGroup.add(gapCylinder)

    const targetRingGeo = new THREE.RingGeometry(0.32, 0.4, 32)
    const targetRingMat = new THREE.MeshBasicMaterial({
      color: 0xfad9ba,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      toneMapped: false,
    })
    const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat)
    targetRing.rotation.x = -Math.PI / 2
    targetRing.position.set(SPOT2_X, 0.92, SPOT2_Z)
    dqnRadarGroup.add(targetRing)

    const faultPlaneGeo = new THREE.PlaneGeometry(BLOCK_W - 0.3, BLOCK_D - 0.3, 8, 8)
    const faultPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xe76f51,
      wireframe: true,
      transparent: true,
      opacity: 0,
    })
    const faultPlane = new THREE.Mesh(faultPlaneGeo, faultPlaneMat)
    faultPlane.rotation.x = -Math.PI / 2 + 0.22
    faultPlane.rotation.z = -0.15
    faultPlane.position.y = 0.45
    dqnRadarGroup.add(faultPlane)

    // 3D Parabolic Neural Search Arcs (Jumping from B-01, B-02, B-03 to Spot 2)
    const searchArcCurves = [
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.45, 0.1, -1.05),
        new THREE.Vector3(-0.5, 1.55, -0.4),
        new THREE.Vector3(SPOT2_X, 0.85, SPOT2_Z)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(1.45, 0.1, 1.05),
        new THREE.Vector3(0.95, 1.4, 0.65),
        new THREE.Vector3(SPOT2_X, 0.85, SPOT2_Z)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(1.45, 0.1, -1.05),
        new THREE.Vector3(0.9, 1.65, -0.35),
        new THREE.Vector3(SPOT2_X, 0.85, SPOT2_Z)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.35, 0.1, 0.95),
        new THREE.Vector3(-0.45, 1.3, 0.6),
        new THREE.Vector3(SPOT2_X, 0.85, SPOT2_Z)
      ),
    ]

    const searchArcMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0,
      toneMapped: false,
    })
    const searchPulseGeo = new THREE.SphereGeometry(0.065, 12, 12)
    const searchPulseMat = new THREE.MeshBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0,
      toneMapped: false,
    })
    const searchPulseMeshes: THREE.Mesh[] = []

    for (const curve of searchArcCurves) {
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32))
      const arcLine = new THREE.Line(arcGeo, searchArcMat)
      dqnRadarGroup.add(arcLine)
      disposableGeometries.push(arcGeo)

      const pulseSphere = new THREE.Mesh(searchPulseGeo, searchPulseMat)
      dqnRadarGroup.add(pulseSphere)
      searchPulseMeshes.push(pulseSphere)
    }

    disposableGeometries.push(
      nodeGeo,
      radarPlateGeo,
      radarPlateEdges,
      laserBeamGeo,
      gapCylinderGeo,
      targetRingGeo,
      faultPlaneGeo,
      searchPulseGeo
    )
    disposableMaterials.push(
      nodeMat,
      radarPlateMat,
      radarPlateLineMat,
      laserBeamMat,
      gapCylinderMat,
      targetRingMat,
      faultPlaneMat,
      searchArcMat,
      searchPulseMat
    )

    // =========================================================================
    // VISUALIZER 03: SMOOTH 3D BOUNDARY AREA VOLUME + 5 INTACT CPT TEST PIPES
    // =========================================================================
    const voxelBoundaryGroup = new THREE.Group()
    voxelBoundaryGroup.position.set(0, 0.25, 0)
    monolithRoot.add(voxelBoundaryGroup)

    // 1. Top 3D Geodetic Site Boundary Perimeter Frame (+0.0m Ground Surface)
    const boundaryFrameGeo = new THREE.BoxGeometry(BLOCK_W + 0.08, 0.06, BLOCK_D + 0.08)
    const boundaryFrameEdges = new THREE.EdgesGeometry(boundaryFrameGeo)
    const boundaryFrameLineMat = new THREE.LineBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0,
    })
    const boundaryFrameLines = new THREE.LineSegments(boundaryFrameEdges, boundaryFrameLineMat)
    boundaryFrameLines.position.y = 0.04
    voxelBoundaryGroup.add(boundaryFrameLines)
    disposableGeometries.push(boundaryFrameGeo, boundaryFrameEdges)
    disposableMaterials.push(boundaryFrameLineMat)

    // 2. 4 Smooth Undulating Continuous Stratigraphic Layers (Clipped smoothly by X/Y sliders)
    const smoothHorizonEntries: SmoothHorizonEntry[] = []
    let smoothCursorY = 0

    for (let sIdx = 0; sIdx < layerSpecs.length; sIdx++) {
      const spec = layerSpecs[sIdx]
      const topY = smoothCursorY
      const botY = smoothCursorY - spec.height
      smoothCursorY = botY

      // High-subdivision box with smooth undulating geological horizon interfaces
      const sGeo = new THREE.BoxGeometry(BLOCK_W, spec.height, BLOCK_D, 28, 4, 24)
      const sPos = sGeo.attributes.position
      for (let i = 0; i < sPos.count; i++) {
        const vx = sPos.getX(i)
        const vy = sPos.getY(i)
        const vz = sPos.getZ(i)
        // Normalized y within this layer (-0.5 at bottom to +0.5 at top)
        const ny = vy / spec.height + 0.5
        const topWave = sIdx === 0 ? 0 : getGeologicalWave(vx, vz, sIdx * 1.7)
        const botWave =
          sIdx === layerSpecs.length - 1 ? 0 : getGeologicalWave(vx, vz, (sIdx + 1) * 1.7)
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
        opacity: 0,
      })

      const sMesh = new THREE.Mesh(sGeo, sMat)
      sMesh.castShadow = true
      sMesh.receiveShadow = true
      voxelBoundaryGroup.add(sMesh)

      const sEdgeGeo = new THREE.EdgesGeometry(sGeo, 22)
      const sEdgeMat = new THREE.LineBasicMaterial({
        color: 0x1c130d,
        clippingPlanes: smoothVolumeClipPlanes,
        transparent: true,
        opacity: 0,
      })
      const sEdgeLines = new THREE.LineSegments(sEdgeGeo, sEdgeMat)
      voxelBoundaryGroup.add(sEdgeLines)

      disposableGeometries.push(sGeo, sEdgeGeo)
      disposableMaterials.push(sMat, sEdgeMat)

      smoothHorizonEntries.push({
        id: spec.id,
        mesh: sMesh,
        material: sMat,
        edgeLines: sEdgeLines,
        edgeMaterial: sEdgeMat,
      })
    }

    // 3. 5 CPT Test Sounding Pipes Mounted on the 3D Boundary (Remain INTACT when soil is sliced!)
    const pipeVisualEntries: PipeVisualEntry[] = []
    const pickablePipeProxies: THREE.Object3D[] = []

    const pipeCollarGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.28, 20)
    const pipeTopFlangeGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 20)
    const pipeBeaconRingGeo = new THREE.RingGeometry(0.17, 0.24, 28)
    pipeBeaconRingGeo.rotateX(-Math.PI / 2)
    const pipeHitProxyGeo = new THREE.CylinderGeometry(0.28, 0.28, 4.4, 12)
    disposableGeometries.push(
      pipeCollarGeo,
      pipeTopFlangeGeo,
      pipeBeaconRingGeo,
      pipeHitProxyGeo
    )

    // Stratigraphic depth intervals along each pipe shaft (total depth 3.84 world units = 25m)
    const TOTAL_WORLD_DEPTH = 3.84

    for (const pipeData of MOCK_CPT_TEST_PIPES) {
      const pGroup = new THREE.Group()
      pGroup.position.set(pipeData.pos3D[0], 0, pipeData.pos3D[1])
      voxelBoundaryGroup.add(pGroup)

      // Wellhead Standpipe Collar protruding above the boundary ground surface (+0.0m to +0.42m)
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xfbf7f2,
        emissive: 0x7a421d,
        emissiveIntensity: 0.2,
        roughness: 0.3,
        metalness: 0.5,
        transparent: true,
        opacity: 0,
      })
      const collarMesh = new THREE.Mesh(pipeCollarGeo, capMat)
      collarMesh.position.y = 0.2
      collarMesh.castShadow = true
      pGroup.add(collarMesh)

      const flangeMesh = new THREE.Mesh(pipeTopFlangeGeo, capMat)
      flangeMesh.position.y = 0.36
      flangeMesh.castShadow = true
      pGroup.add(flangeMesh)

      // Glowing Signal Ring at Pipe Top
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xfad9ba,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        toneMapped: false,
      })
      const beaconRing = new THREE.Mesh(pipeBeaconRingGeo, beaconMat)
      beaconRing.position.y = 0.41
      pGroup.add(beaconRing)

      // 4 Underground Pipe Core Segments (No clippingPlanes so the pipe stays intact when sliced!)
      const shaftMats: THREE.MeshStandardMaterial[] = []
      let pipeCursorY = 0

      for (const lData of pipeData.layers) {
        const segH = (lData.thicknessM / 25.0) * TOTAL_WORLD_DEPTH
        const segGeo = new THREE.CylinderGeometry(0.068, 0.068, segH, 16)
        const segMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(lData.colorHex),
          emissive: new THREE.Color(lData.colorHex),
          emissiveIntensity: 0.18,
          roughness: 0.35,
          metalness: 0.35,
          transparent: true,
          opacity: 0,
        })
        const segMesh = new THREE.Mesh(segGeo, segMat)
        segMesh.position.y = pipeCursorY - segH / 2
        pipeCursorY -= segH
        segMesh.castShadow = true
        pGroup.add(segMesh)

        // Subtle joint ring between layers on the pipe
        const jointGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.025, 16)
        const jointMesh = new THREE.Mesh(jointGeo, capMat)
        jointMesh.position.y = pipeCursorY
        pGroup.add(jointMesh)

        shaftMats.push(segMat)
        disposableGeometries.push(segGeo, jointGeo)
        disposableMaterials.push(segMat)
      }

      // Invisible Raycaster Proxy Cylinder (Layer 1) for easy clicking
      const hitMat = new THREE.MeshBasicMaterial({
        visible: false,
      })
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
        hitProxy,
      })
    }

    // =========================================================================
    // VISUALIZER 04: BEARING STRATUM SECTION — 3D TOP-OF-BEARING DEPTH HEATMAP & PILE PROBES
    // =========================================================================
    const stratumCageGroup = new THREE.Group()
    stratumCageGroup.position.set(0, -1.15, 0)
    monolithRoot.add(stratumCageGroup)

    // Top Structural Pile Cap Reference Frame (+0.0m Ground Footprint)
    const pileCapGeo = new THREE.BoxGeometry(3.5, 0.16, 2.7)
    const pileCapMat = new THREE.MeshStandardMaterial({
      color: 0xefe7de,
      roughness: 0.5,
      metalness: 0.15,
      transparent: true,
      opacity: 0,
    })
    const pileCap = new THREE.Mesh(pileCapGeo, pileCapMat)
    pileCap.position.y = 1.25
    stratumCageGroup.add(pileCap)

    const pileCapEdges = new THREE.EdgesGeometry(pileCapGeo)
    const pileCapLineMat = new THREE.LineBasicMaterial({
      color: 0x5a3008,
      transparent: true,
      opacity: 0,
    })
    pileCap.add(new THREE.LineSegments(pileCapEdges, pileCapLineMat))

    // 8 Reinforced Concrete Driven Piles (First 4 map 1:1 to MOCK_BEARING_POINTS: b-01, b-02, b-03, spot-2-rec)
    const PILE_LEN = 2.85
    const pileCylGeo = new THREE.CylinderGeometry(0.11, 0.11, PILE_LEN, 20)
    const toeRingGeo = new THREE.RingGeometry(0.16, 0.25, 28)
    toeRingGeo.rotateX(-Math.PI / 2)

    const bearingPointSpecs: Array<{ id: string; pos: [number, number] }> = [
      { id: "b-01", pos: [-1.15, -0.8] },
      { id: "b-02", pos: [1.15, 0.78] },
      { id: "b-03", pos: [1.15, -0.8] },
      { id: "spot-2-rec", pos: [0.05, 0.08] },
      { id: "aux-1", pos: [-1.15, 0.78] },
      { id: "aux-2", pos: [-0.4, -0.8] },
      { id: "aux-3", pos: [0.4, -0.8] },
      { id: "aux-4", pos: [-0.4, 0.78] },
    ]

    interface BearingPileVisual {
      id: string
      mesh: THREE.Mesh
      mat: THREE.MeshStandardMaterial
      ring: THREE.Mesh
      ringMat: THREE.MeshBasicMaterial
      x: number
      z: number
    }

    const bearingPileVisuals: BearingPileVisual[] = []

    for (const spec of bearingPointSpecs) {
      const pMat = new THREE.MeshStandardMaterial({
        color: 0xfbf7f2,
        emissive: 0x7a421d,
        emissiveIntensity: 0.2,
        roughness: 0.35,
        metalness: 0.3,
        transparent: true,
        opacity: 0,
      })
      const pMesh = new THREE.Mesh(pileCylGeo, pMat)
      pMesh.position.set(spec.pos[0], 1.25 - PILE_LEN / 2, spec.pos[1])

      const rMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        toneMapped: false,
      })
      const tRing = new THREE.Mesh(toeRingGeo, rMat)
      tRing.position.y = -PILE_LEN / 2 + 0.12
      pMesh.add(tRing)

      stratumCageGroup.add(pMesh)
      disposableMaterials.push(pMat, rMat)
      bearingPileVisuals.push({
        id: spec.id,
        mesh: pMesh,
        mat: pMat,
        ring: tRing,
        ringMat: rMat,
        x: spec.pos[0],
        z: spec.pos[1],
      })
    }

    // High-Resolution 3D Topographic Bearing Depth Heatmap Surface (36 x 28 grid with VertexColors)
    const terrainGeo = new THREE.BoxGeometry(BLOCK_W + 0.25, 1.05, BLOCK_D + 0.25, 36, 4, 28)
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
    const hmTempColor = new THREE.Color()

    const updateBearingHeatmap = (minQc: number, maxIc: number, minThickness: number) => {
      const posArr = terrainGeo.attributes.position
      const colArr = terrainGeo.attributes.color
      const qcPenalty = Math.max(0, (minQc - 15.0) * 0.28)
      const icPenalty = Math.max(0, (1.80 - maxIc) * 2.4)
      const thickPenalty = Math.max(0, (minThickness - 2.0) * 0.45)
      const totalDepthPenaltyM = qcPenalty + icPenalty + thickPenalty

      for (let i = 0; i < posArr.count; i++) {
        const vx = posArr.getX(i)
        const vy0 = baseTerrainY[i]
        const vz = posArr.getZ(i)

        // Spatial geological model across the footprint:
        // NW (near B-01) is shallowest (-14.1m); SE & East-Center dip deeper (-16.5m) under the clay pocket
        const dipTrendM = (vx * 0.35 + vz * 0.42) * 0.55
        const clayBasinM =
          1.35 * Math.exp(-((vx - 0.45) * (vx - 0.45) * 0.9 + (vz - 0.3) * (vz - 0.3) * 1.1))
        const ridgeWaveM =
          0.38 * Math.sin(vx * 1.55 + 0.4) * Math.cos(vz * 1.65) +
          0.16 * Math.cos(vx * 2.7 - vz * 2.1)

        const localDepthM = 14.3 + dipTrendM + clayBasinM - ridgeWaveM + totalDepthPenaltyM
        const localPeakQc = 22.4 - clayBasinM * 2.9 - Math.max(0, dipTrendM) * 1.4 + ridgeWaveM * 1.8
        const localMinIc = 1.38 + clayBasinM * 0.22 + Math.max(0, dipTrendM) * 0.1
        const localMaxThickness = 4.6 - clayBasinM * 1.15

        const isVerified =
          localPeakQc >= minQc && localMinIc <= maxIc && localMaxThickness >= minThickness

        if (vy0 > -0.45) {
          // Displace top surface vertices according to the bearing depth
          const dispY = THREE.MathUtils.clamp((15.2 - localDepthM) * 0.22, -0.52, 0.42)
          const ny = (vy0 + 0.525) / 1.05
          posArr.setY(i, vy0 + dispY * ny)
        }

        if (!isVerified) {
          colArr.setXYZ(i, hmColorUnmet.r, hmColorUnmet.g, hmColorUnmet.b)
        } else {
          // Map depth (13.6m .. 18.4m) to 4-stop heatmap palette
          const tDepth = THREE.MathUtils.clamp((localDepthM - 13.6) / 4.6, 0, 1)
          if (tDepth < 0.33) {
            hmTempColor.lerpColors(hmColorShallow, hmColorMid, tDepth / 0.33)
          } else if (tDepth < 0.66) {
            hmTempColor.lerpColors(hmColorMid, hmColorDeep, (tDepth - 0.33) / 0.33)
          } else {
            hmTempColor.lerpColors(hmColorDeep, hmColorAbyss, (tDepth - 0.66) / 0.34)
          }

          // Subtle iso-depth contour lines every 0.75m of depth
          const contourPhase = Math.abs((localDepthM * 1.33) % 1 - 0.5)
          if (contourPhase < 0.06 && vy0 > 0.2) {
            hmTempColor.multiplyScalar(1.25)
          }
          // Darken side walls slightly for 3D architectural contrast
          if (vy0 < 0.15) {
            hmTempColor.multiplyScalar(0.68)
          }

          colArr.setXYZ(i, hmTempColor.r, hmTempColor.g, hmTempColor.b)
        }
      }

      posArr.needsUpdate = true
      colArr.needsUpdate = true
      terrainGeo.computeVertexNormals()
    }

    // Initial heatmap calculation
    updateBearingHeatmap(15.0, 1.8, 2.0)

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.48,
      metalness: 0.08,
      transparent: true,
      opacity: 0,
    })
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat)
    terrainMesh.position.y = -1.55
    stratumCageGroup.add(terrainMesh)

    const terrainWireGeo = new THREE.WireframeGeometry(terrainGeo)
    const terrainWireMat = new THREE.LineBasicMaterial({
      color: 0x1c130d,
      transparent: true,
      opacity: 0,
    })
    terrainMesh.add(new THREE.LineSegments(terrainWireGeo, terrainWireMat))

    const datumLaserGeo = new THREE.PlaneGeometry(BLOCK_W + 0.45, BLOCK_D + 0.45)
    const datumLaserMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    const datumLaser = new THREE.Mesh(datumLaserGeo, datumLaserMat)
    datumLaser.rotation.x = -Math.PI / 2
    datumLaser.position.y = -1.05
    const datumEdges = new THREE.EdgesGeometry(datumLaserGeo)
    const datumLineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0,
    })
    datumLaser.add(new THREE.LineSegments(datumEdges, datumLineMat))
    stratumCageGroup.add(datumLaser)

    let lastHmQc = 15.0
    let lastHmIc = 1.8
    let lastHmThick = 2.0

    disposableGeometries.push(
      pileCapGeo,
      pileCapEdges,
      pileCylGeo,
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

    // =========================================================================
    // RAYCASTING FOR 5 CPT TEST PIPES + POINTER PARALLAX & DRAG ROTATION
    // =========================================================================
    const raycaster = new THREE.Raycaster()
    raycaster.layers.set(1) // Pick only the 5 CPT pipe proxies
    const pointerNdc = new THREE.Vector2()

    let pointerX = 0
    let pointerY = 0
    let isDragging = false
    let dragStartX = 0
    let downClientX = 0
    let downClientY = 0
    let userRotationY = 0
    let hoveredPipeId: string | null = null

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      pointerX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1
      pointerY = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1

      if (isDragging) {
        const deltaX = e.clientX - dragStartX
        userRotationY += deltaX * 0.007
        dragStartX = e.clientX
      } else if (sceneStateRef.current.activeStage === "voxel") {
        pointerNdc.set(pointerX, pointerY)
        raycaster.setFromCamera(pointerNdc, camera)
        const hits = raycaster.intersectObjects(pickablePipeProxies, false)
        hoveredPipeId = hits.length > 0 ? (hits[0].object.userData.pipeId as string) : null
        document.body.style.cursor = hoveredPipeId ? "pointer" : ""
      } else {
        hoveredPipeId = null
        if (document.body.style.cursor === "pointer") {
          document.body.style.cursor = ""
        }
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      const sr = sceneStateRef.current.stageRect
      const isFullScreenDesktop = window.innerWidth >= 1024 && container.clientWidth >= 1024
      if (isFullScreenDesktop) {
        const inStage =
          e.clientX >= sr.left &&
          e.clientX <= sr.left + sr.width &&
          e.clientY >= sr.top &&
          e.clientY <= sr.top + sr.height
        if (!inStage || sr.opacity < 0.2) return
      } else {
        const rect = container.getBoundingClientRect()
        const inContainer =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        if (!inContainer) return
      }

      isDragging = true
      dragStartX = e.clientX
      downClientX = e.clientX
      downClientY = e.clientY
    }

    const handlePointerUp = (e: PointerEvent) => {
      const wasClick = isDragging && Math.hypot(e.clientX - downClientX, e.clientY - downClientY) < 7
      isDragging = false

      if (wasClick && sceneStateRef.current.activeStage === "voxel") {
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

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerdown", handlePointerDown, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })

    // =========================================================================
    // SCROLLYTELLING MORPH ANIMATION LOOP (r186 THREE.Timer)
    // =========================================================================
    const timer = new THREE.Timer()
    timer.connect(document)

    let wHero = 1
    let wProblem = 0
    let wDqn = 0
    let wVoxel = 0
    let wStratum = 0

    let currentCamX = 8.6
    let currentCamY = 5.4
    let currentCamZ = 9.6
    let currentLookX = 0.0
    let currentLookY = -0.85
    let currentRootRotY = -0.32
    let currentOffsetCenterX = window.innerWidth * 0.72
    let currentOffsetCenterY = window.innerHeight * 0.5
    let currentClipX = BLOCK_W / 2 + 0.5
    let currentClipZ = BLOCK_D / 2 + 0.5
    let lastProjectedX = -1
    let lastProjectedY = -1

    const projectedVec = new THREE.Vector3()
    const arcPointVec = new THREE.Vector3()

    const cameraStageTargets: Record<
      MonolithStage,
      { camPos: [number, number, number]; lookY: number; rotY: number }
    > = {
      hero: { camPos: [8.6, 5.2, 9.5], lookY: -0.75, rotY: -0.32 },
      problem: { camPos: [0.0, 3.2, 9.2], lookY: -1.65, rotY: 0.06 },
      dqn: { camPos: [0.0, 8.6, 7.2], lookY: -0.85, rotY: -0.28 },
      voxel: { camPos: [7.4, 4.8, 8.2], lookY: -1.35, rotY: -0.28 },
      stratum: { camPos: [6.8, 3.6, 8.2], lookY: -1.25, rotY: 0.26 },
      workflow: { camPos: [8.6, 5.2, 9.5], lookY: -1.0, rotY: -0.32 },
    }

    function animate() {
      timer.update()
      const dt = Math.min(timer.getDelta(), 0.1)
      const elapsed = timer.getElapsed()
      const state = sceneStateRef.current

      const rawWeights = getStageWeights(
        state.transitionFrom,
        state.transitionTo,
        state.transitionT
      )
      const dampSpeed = 6.5
      wHero = THREE.MathUtils.damp(wHero, rawWeights.hero, dampSpeed, dt)
      wProblem = THREE.MathUtils.damp(wProblem, rawWeights.problem, dampSpeed, dt)
      wDqn = THREE.MathUtils.damp(wDqn, rawWeights.dqn, dampSpeed, dt)
      wVoxel = THREE.MathUtils.damp(wVoxel, rawWeights.voxel, dampSpeed, dt)
      wStratum = THREE.MathUtils.damp(wStratum, rawWeights.stratum, dampSpeed, dt)

      // -----------------------------------------------------------------------
      // MODE 00 & 01: BUILDING + 4 STRATA + PANORAMIC 3-ZONE GEOLOGICAL TRENCH
      // -----------------------------------------------------------------------
      const buildingVis = Math.max(0, wHero)
      buildingGroup.visible = buildingVis > 0.01
      buildingGroup.position.y = (1 - wHero) * 4.2
      buildingGroup.scale.setScalar(0.85 + 0.15 * wHero)
      for (const item of buildingMaterials) {
        item.mat.opacity = item.baseOpacity * buildingVis
      }

      for (let i = 0; i < layerEntries.length; i++) {
        const entry = layerEntries[i]
        const isLayer3 = entry.id === "layer-3"

        if (isLayer3) {
          const l3Vis = Math.min(1, wHero + wProblem)
          entry.group.visible = l3Vis > 0.01
          entry.group.position.y = entry.baseY + wProblem * 0.05
          // In Section 01, Layer 03 stretches wide (1.48x X) into a Panoramic Cross-Section Trench!
          const l3ScaleX = 1 + wProblem * 0.48
          const l3ScaleYZ = 1 + wProblem * 0.18
          entry.group.scale.set(l3ScaleX, l3ScaleYZ, l3ScaleYZ)
          entry.material.opacity = wHero * 1.0 + wProblem * 0.2
          entry.material.depthWrite = wHero > 0.5
          entry.edgeMaterial.opacity = wHero * 0.65 + wProblem * 0.85
        } else {
          const otherVis = wHero
          entry.group.visible = otherVis > 0.01
          const peelDir = i < 2 ? 1 : -1
          entry.group.position.y = entry.baseY + (1 - wHero) * peelDir * 3.4
          entry.group.scale.setScalar(0.85 + 0.15 * wHero)
          entry.material.opacity = otherVis
          entry.material.depthWrite = otherVis > 0.5
          entry.edgeMaterial.opacity = otherVis * 0.65
        }
      }

      problemAnomalyGroup.visible = wProblem > 0.01
      problemAnomalyGroup.scale.set(0.85 + 0.35 * wProblem, 0.85 + 0.3 * wProblem, 1)
      anomalyMesh.rotation.y = elapsed * 0.25
      const pulseGlow = 0.4 + Math.sin(elapsed * 3.2) * 0.15
      anomalyMat.opacity = wProblem * 0.94
      anomalyMat.emissiveIntensity =
        state.hoveredProblemZone === 1 ? 0.85 : pulseGlow
      anomalyWireMat.opacity = wProblem * 0.78
      blindBoreholeMat.opacity = wProblem * 0.85
      blindRingMat.opacity = wProblem * 0.85
      overdrillMat.opacity = wProblem * 0.9
      overdrillMat.emissiveIntensity = state.hoveredProblemZone === 0 ? 0.8 : 0.25
      cutoffMat.opacity = wProblem * 0.92
      cutoffMat.emissiveIntensity = state.hoveredProblemZone === 2 ? 0.85 : 0.35

      // -----------------------------------------------------------------------
      // MODE 02: DQN 144-NODE GEODETIC RADAR TABLE & 3D PARABOLIC SEARCH ARCS
      // -----------------------------------------------------------------------
      dqnRadarGroup.visible = wDqn > 0.01
      dqnRadarGroup.scale.setScalar(0.85 + 0.32 * wDqn)
      nodeMat.opacity = wDqn * 0.95
      radarPlateMat.opacity = wDqn * 0.85
      radarPlateLineMat.opacity = wDqn * 0.65
      laserBeamMat.opacity = wDqn * 0.95
      targetRingMat.opacity = wDqn * (0.65 + Math.sin(elapsed * 4) * 0.3)
      searchArcMat.opacity = wDqn * 0.65
      searchPulseMat.opacity = wDqn * 0.95

      const ringPulse = 1 + Math.sin(elapsed * 3.5) * 0.22
      targetRing.scale.set(ringPulse, ringPulse, 1)

      // Animate neural pathfinding spheres jumping along the 4 parabolic arcs into Spot 2
      if (wDqn > 0.02) {
        for (let aIdx = 0; aIdx < searchArcCurves.length; aIdx++) {
          const curve = searchArcCurves[aIdx]
          const u = (elapsed * 0.55 + aIdx * 0.25) % 1
          curve.getPoint(u, arcPointVec)
          searchPulseMeshes[aIdx].position.copy(arcPointVec)
        }
      }

      const isGapTab = state.activeDqnTab === "gap"
      const isTransitionTab = state.activeDqnTab === "transition"
      const isAnomalyTab = state.activeDqnTab === "anomaly"

      gapCylinderMat.opacity = wDqn * (isGapTab ? 0.32 : 0.1)
      gapCylinder.scale.set(
        1 + Math.sin(elapsed * 2) * 0.04,
        1,
        1 + Math.sin(elapsed * 2) * 0.04
      )
      faultPlaneMat.opacity = wDqn * (isTransitionTab ? 0.75 : 0.0)

      if (wDqn > 0.02) {
        for (let i = 0; i < candidateCoords.length; i++) {
          const c = candidateCoords[i]
          const wave = Math.sin(c.distSpot2 * 3.5 - elapsed * 3.0) * 0.08
          const anomalyBoost = isAnomalyTab && c.distSpot2 < 1.1 ? 0.45 : 0
          const h = Math.max(0.12, (c.qVal + wave + anomalyBoost) * 0.95 * wDqn)
          nodeDummy.position.set(c.x, h / 2, c.z)
          nodeDummy.scale.set(1, h, 1)
          nodeDummy.updateMatrix()
          candidateInstanced.setMatrixAt(i, nodeDummy.matrix)
        }
        candidateInstanced.instanceMatrix.needsUpdate = true
      }

      // -----------------------------------------------------------------------
      // MODE 03: SMOOTH 3D BOUNDARY VOLUME (Extrudes downward from Section 02 map, peels off into Section 04)
      // -----------------------------------------------------------------------
      voxelBoundaryGroup.visible = wVoxel > 0.01
      // Extrude vertically as wVoxel enters, and lift upward like a stage curtain as wStratum enters!
      const extrudeY = Math.max(0.08, THREE.MathUtils.smoothstep(wVoxel, 0, 1))
      voxelBoundaryGroup.scale.set(1.08, extrudeY * 1.06, 1.08)
      voxelBoundaryGroup.position.y = 0.25 + wStratum * 2.2
      boundaryFrameLineMat.opacity = wVoxel * 0.75

      const targetClipX = -BLOCK_W / 2 + (state.sliceX / 100) * BLOCK_W
      const targetClipZ = -BLOCK_D / 2 + (state.sliceY / 100) * BLOCK_D
      currentClipX = THREE.MathUtils.damp(currentClipX, targetClipX, 8, dt)
      currentClipZ = THREE.MathUtils.damp(currentClipZ, targetClipZ, 8, dt)
      clipPlaneX.constant = currentClipX
      clipPlaneZ.constant = currentClipZ

      for (const sEntry of smoothHorizonEntries) {
        const isHoveredLayer = state.hoveredLayerId === sEntry.id
        sEntry.material.opacity = wVoxel * 0.96
        sEntry.material.depthWrite = wVoxel > 0.5
        sEntry.material.emissive.setHex(isHoveredLayer ? 0xd97706 : 0x000000)
        sEntry.material.emissiveIntensity = isHoveredLayer ? 0.25 : 0
        sEntry.edgeMaterial.opacity = wVoxel * 0.5
      }

      // 5 CPT Test Pipes drop in from above as wVoxel approaches 1
      for (let pIdx = 0; pIdx < pipeVisualEntries.length; pIdx++) {
        const pEntry = pipeVisualEntries[pIdx]
        const isSelected = state.selectedPipeId === pEntry.id
        const isHovered = hoveredPipeId === pEntry.id

        pEntry.group.position.y = (1 - extrudeY) * (1.2 + pIdx * 0.18)
        pEntry.capMat.opacity = wVoxel
        pEntry.capMat.emissive.setHex(isSelected || isHovered ? 0x10b981 : 0x7a421d)
        pEntry.capMat.emissiveIntensity = isSelected ? 0.75 : isHovered ? 0.5 : 0.2

        pEntry.beaconMat.color.setHex(isSelected || isHovered ? 0x10b981 : 0xfad9ba)
        pEntry.beaconMat.opacity = wVoxel * (isSelected ? 0.95 : 0.65)
        const bScale = isSelected ? 1.25 + Math.sin(elapsed * 4) * 0.18 : 1.0
        pEntry.beaconRing.scale.set(bScale, bScale, 1)

        for (const sMat of pEntry.shaftMats) {
          sMat.opacity = wVoxel
          sMat.emissiveIntensity = isSelected ? 0.42 : 0.18
        }

        if (isSelected && wVoxel > 0.4) {
          pEntry.capMesh.getWorldPosition(projectedVec)
          projectedVec.y += 0.25
          projectedVec.project(camera)
          // Convert full-screen NDC (-1..1) to percentage within the active stageRect
          const screenPxX = ((projectedVec.x + 1) / 2) * (container?.clientWidth || window.innerWidth)
          const screenPxY = ((-projectedVec.y + 1) / 2) * (container?.clientHeight || window.innerHeight)
          const sr = state.stageRect
          const xPct = Math.round(((screenPxX - sr.left) / Math.max(1, sr.width)) * 1000) / 10
          const yPct = Math.round(((screenPxY - sr.top) / Math.max(1, sr.height)) * 1000) / 10

          if (
            Math.abs(xPct - lastProjectedX) > 0.6 ||
            Math.abs(yPct - lastProjectedY) > 0.6
          ) {
            lastProjectedX = xPct
            lastProjectedY = yPct
            setPipeScreenCoords({
              xPct: THREE.MathUtils.clamp(xPct, 8, 86),
              yPct: THREE.MathUtils.clamp(yPct, 10, 82),
            })
          }
        }
      }

      // -----------------------------------------------------------------------
      // MODE 04: 3D TOP-OF-BEARING DEPTH HEATMAP & STRUCTURAL PILE PROBES
      // -----------------------------------------------------------------------
      stratumCageGroup.visible = wStratum > 0.01
      stratumCageGroup.scale.setScalar(0.88 + 0.24 * wStratum)
      pileCapMat.opacity = wStratum * 0.85
      pileCapLineMat.opacity = wStratum * 0.65
      terrainMat.opacity = wStratum * 0.98
      terrainWireMat.opacity = wStratum * 0.22
      datumLaserMat.opacity = wStratum * 0.18
      datumLineMat.opacity = wStratum * 0.75

      if (
        Math.abs(state.minQc - lastHmQc) > 0.05 ||
        Math.abs(state.maxIc - lastHmIc) > 0.01 ||
        Math.abs(state.minThickness - lastHmThick) > 0.05
      ) {
        lastHmQc = state.minQc
        lastHmIc = state.maxIc
        lastHmThick = state.minThickness
        updateBearingHeatmap(state.minQc, state.maxIc, state.minThickness)
      }

      const qcShift = ((state.minQc - 15.0) / 10.0) * 0.42
      const thicknessShift = ((state.minThickness - 2.0) / 3.0) * 0.18
      datumLaser.position.y = -1.05 - qcShift - thicknessShift

      for (const bPile of bearingPileVisuals) {
        const isHighlighted = state.hoveredBearingPointId === bPile.id
        bPile.mesh.position.y = 1.25 - PILE_LEN / 2 - qcShift * 0.45 + (1 - wStratum) * 1.4
        bPile.mat.opacity = wStratum * (isHighlighted ? 1.0 : 0.82)
        bPile.mat.emissive.setHex(isHighlighted ? 0x10b981 : 0x7a421d)
        bPile.mat.emissiveIntensity = isHighlighted ? 0.8 : 0.2

        bPile.ringMat.color.setHex(isHighlighted ? 0xfad9ba : 0x10b981)
        bPile.ringMat.opacity = wStratum * (isHighlighted ? 1.0 : 0.75)
        const rScale = isHighlighted ? 1.45 + Math.sin(elapsed * 4.5) * 0.22 : 1.0
        bPile.ring.scale.set(rScale, rScale, 1)
      }

      // -----------------------------------------------------------------------
      // FULL-VIEWPORT CAMERA SPLINE, INTRA-SECTION DOLLY PAN & VIEW OFFSET
      // -----------------------------------------------------------------------
      const fromCam =
        cameraStageTargets[state.transitionFrom] ||
        cameraStageTargets[state.activeStage] ||
        cameraStageTargets.hero
      const toCam =
        cameraStageTargets[state.transitionTo] ||
        cameraStageTargets[state.activeStage] ||
        cameraStageTargets.hero
      const t = state.transitionT

      // Curved orbital arc whip during section transitions (adds lateral/vertical arc peak at t = 0.5)
      const transitionArc = Math.sin(t * Math.PI)
      const isFrontProfile = state.activeStage === "voxel" && state.cameraView === "front"

      // Intra-section horizontal dolly pan in Section 01 (sweeps across Zone 1 -> Zone 2 -> Zone 3)
      let problemPanX = 0
      if (wProblem > 0.2) {
        if (state.hoveredProblemZone === 0) {
          problemPanX = -1.35 * wProblem
        } else if (state.hoveredProblemZone === 1) {
          problemPanX = 0
        } else if (state.hoveredProblemZone === 2) {
          problemPanX = 1.35 * wProblem
        } else {
          problemPanX = (state.stageProgress - 0.5) * 2.1 * wProblem
        }
      }

      const targetCamX = isFrontProfile
        ? 0.0
        : THREE.MathUtils.lerp(fromCam.camPos[0], toCam.camPos[0], t) +
          transitionArc * 1.4 +
          problemPanX * 0.65
      const targetCamY = isFrontProfile
        ? -1.2
        : THREE.MathUtils.lerp(fromCam.camPos[1], toCam.camPos[1], t) +
          transitionArc * 1.1
      const targetCamZ = isFrontProfile
        ? 10.4
        : THREE.MathUtils.lerp(fromCam.camPos[2], toCam.camPos[2], t)
      const targetLookY = THREE.MathUtils.lerp(fromCam.lookY, toCam.lookY, t)
      const targetRotY = isFrontProfile
        ? 0
        : THREE.MathUtils.lerp(fromCam.rotY, toCam.rotY, t) +
          userRotationY +
          Math.sin(elapsed * 0.35) * 0.03

      currentCamX = THREE.MathUtils.damp(currentCamX, targetCamX, 4.5, dt)
      currentCamY = THREE.MathUtils.damp(currentCamY, targetCamY, 4.5, dt)
      currentCamZ = THREE.MathUtils.damp(currentCamZ, targetCamZ, 4.5, dt)
      currentLookX = THREE.MathUtils.damp(currentLookX, problemPanX, 5.0, dt)
      currentLookY = THREE.MathUtils.damp(currentLookY, targetLookY, 5.0, dt)
      currentRootRotY = THREE.MathUtils.damp(currentRootRotY, targetRotY, 5.0, dt)

      // Apply camera.setViewOffset on full-viewport desktop canvas so 3D object aligns to target dock without box clipping
      const vpW = container?.clientWidth || window.innerWidth
      const vpH = container?.clientHeight || window.innerHeight
      if (vpW >= 1024) {
        currentOffsetCenterX = THREE.MathUtils.damp(
          currentOffsetCenterX,
          state.stageRect.centerX,
          8.0,
          dt
        )
        currentOffsetCenterY = THREE.MathUtils.damp(
          currentOffsetCenterY,
          state.stageRect.centerY,
          8.0,
          dt
        )
        const offsetX = vpW / 2 - currentOffsetCenterX
        const offsetY = vpH / 2 - currentOffsetCenterY
        camera.setViewOffset(vpW, vpH, offsetX, offsetY, vpW, vpH)
      } else {
        camera.clearViewOffset()
      }

      camera.position.set(
        currentCamX + pointerX * 0.25,
        currentCamY + pointerY * 0.18,
        currentCamZ
      )
      camera.lookAt(currentLookX, currentLookY, 0)
      monolithRoot.rotation.y = currentRootRotY

      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(animate)

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
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerdown", handlePointerDown)
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
  }, [sceneStateRef, setSelectedPipeId, setPipeScreenCoords])

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
      aria-label="Interactive 3D geotechnical scrollytelling visualizer"
    />
  )
}

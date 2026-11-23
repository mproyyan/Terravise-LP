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
}

interface VoxelEntry {
  ix: number
  iy: number
  iz: number
  normX: number // 0..100
  normZ: number // 0..100
  basePos: THREE.Vector3
  layerId: string
  isAnomaly: boolean
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
      for (let i = 0; i < 500; i++) {
        const x = (i * 73) % 256
        const y = (i * 137) % 256
        ctx.fillRect(x, y, (i % 3) + 1.5, (i % 3) + 1.5)
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
      ctx.strokeStyle = "rgba(250, 217, 186, 0.16)"
      ctx.lineWidth = 1.5
      for (let i = -256; i < 256; i += 16) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + 256, 256)
        ctx.stroke()
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

export function SubsurfaceMonolithCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { sceneStateRef } = useSubsurface3D()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1. WebGLRenderer Setup (r186 compliant, transparent borderless canvas)
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

    // Surface Ground Podium Slab (0.0m)
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

    // Main High-Rise Architectural Tower (6 Stories)
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

    // Exterior Columns
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
    // VISUALIZER 01: PROBLEM SECTION — ORGANIC 3D SOFT CLAY ANOMALY LENS & 4 BLIND GRID RIGS
    // =========================================================================
    const problemAnomalyGroup = new THREE.Group()
    problemAnomalyGroup.position.set(0, -1.75, 0)
    monolithRoot.add(problemAnomalyGroup)

    // Deformed Organic 3D Soft Clay Hazard Lens (Multi-lobe sculpted pocket)
    const anomalyGeo = new THREE.IcosahedronGeometry(1.05, 3)
    const posAttr = anomalyGeo.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i)
      const vy = posAttr.getY(i)
      const vz = posAttr.getZ(i)
      const wave =
        1 +
        0.22 * Math.sin(vx * 3.2 + 0.5) * Math.cos(vz * 2.8) +
        0.15 * Math.cos(vy * 4.0)
      posAttr.setXYZ(i, vx * 1.35 * wave, vy * 0.42 * wave, vz * 0.95 * wave)
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
    anomalyMesh.position.set(0.15, 0, 0.1)
    problemAnomalyGroup.add(anomalyMesh)

    const anomalyWireGeo = new THREE.WireframeGeometry(anomalyGeo)
    const anomalyWireMat = new THREE.LineBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0,
    })
    const anomalyWire = new THREE.LineSegments(anomalyWireGeo, anomalyWireMat)
    anomalyMesh.add(anomalyWire)

    // 4 Rigid Fixed-Grid Borehole Columns at the 4 corners that MISS the central clay pocket
    const blindBoreholeGeo = new THREE.CylinderGeometry(0.055, 0.055, 2.8, 16)
    const blindBoreholeMat = new THREE.MeshStandardMaterial({
      color: 0x1c130d,
      roughness: 0.4,
      transparent: true,
      opacity: 0,
    })
    const blindRingGeo = new THREE.RingGeometry(0.16, 0.22, 24)
    const blindRingMat = new THREE.MeshBasicMaterial({
      color: 0x7a421d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    })

    const blindCorners: Array<[number, number]> = [
      [-1.7, -1.3],
      [1.7, -1.3],
      [-1.7, 1.3],
      [1.7, 1.3],
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

    disposableGeometries.push(anomalyGeo, anomalyWireGeo, blindBoreholeGeo, blindRingGeo)
    disposableMaterials.push(anomalyMat, anomalyWireMat, blindBoreholeMat, blindRingMat)

    // =========================================================================
    // VISUALIZER 02: DQN SECTION — 144-NODE TOPOGRAPHIC CANDIDATE RADAR & SPOT 2 LASER
    // =========================================================================
    const dqnRadarGroup = new THREE.Group()
    dqnRadarGroup.position.set(0, -1.1, 0)
    monolithRoot.add(dqnRadarGroup)

    // 12x12 = 144 Candidate Sensor Nodes across the site boundary
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
          nodeColor.setHex(0x10b981) // Vivid Emerald Peak at Spot 2
        } else if (dist < 1.15) {
          nodeColor.setHex(0xfad9ba) // High Information Gain Zone
        } else {
          nodeColor.setHex(0x7a421d) // Low Priority Perimeter
        }
        candidateInstanced.setColorAt(nIdx, nodeColor)
        nIdx++
      }
    }
    candidateInstanced.instanceMatrix.needsUpdate = true
    if (candidateInstanced.instanceColor) candidateInstanced.instanceColor.needsUpdate = true

    // Radar Base Platform Frame
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

    // Spot 2 Vertical Laser Column + Expanding 16.2m Data Gap Cylinder
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

    // Dipping Strata Transition Fault Plane (Highlighted when DQN Tab = "transition")
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

    disposableGeometries.push(
      nodeGeo,
      radarPlateGeo,
      radarPlateEdges,
      laserBeamGeo,
      gapCylinderGeo,
      targetRingGeo,
      faultPlaneGeo
    )
    disposableMaterials.push(
      nodeMat,
      radarPlateMat,
      radarPlateLineMat,
      laserBeamMat,
      gapCylinderMat,
      targetRingMat,
      faultPlaneMat
    )

    // =========================================================================
    // VISUALIZER 03: VOXEL SECTION — TRUE 3D INSTANCED VOXEL MATRIX (10 x 6 x 8 = 480 CUBES)
    // =========================================================================
    const voxelMatrixGroup = new THREE.Group()
    voxelMatrixGroup.position.set(0, -1.35, 0)
    monolithRoot.add(voxelMatrixGroup)

    const VX = 10
    const VY = 6
    const VZ = 8
    const TOTAL_VOXELS = VX * VY * VZ

    const cellW = (BLOCK_W / VX) * 0.86
    const cellH = (3.4 / VY) * 0.84
    const cellD = (BLOCK_D / VZ) * 0.86

    const voxelCubeGeo = new THREE.BoxGeometry(cellW, cellH, cellD)
    const voxelCubeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.12,
      transparent: true,
      opacity: 0,
    })
    const voxelInstanced = new THREE.InstancedMesh(voxelCubeGeo, voxelCubeMat, TOTAL_VOXELS)
    voxelInstanced.castShadow = true
    voxelInstanced.receiveShadow = true
    voxelMatrixGroup.add(voxelInstanced)

    const voxelEntries: VoxelEntry[] = []
    const vColor = new THREE.Color()
    let vIdx = 0

    for (let iy = 0; iy < VY; iy++) {
      for (let ix = 0; ix < VX; ix++) {
        for (let iz = 0; iz < VZ; iz++) {
          const x = -BLOCK_W / 2 + (ix + 0.5) * (BLOCK_W / VX)
          const y = 1.4 - (iy + 0.5) * (3.4 / VY)
          const z = -BLOCK_D / 2 + (iz + 0.5) * (BLOCK_D / VZ)

          const normX = ((ix + 0.5) / VX) * 100
          const normZ = ((iz + 0.5) / VZ) * 100

          // Assign Robertson SBT Horizon Color
          let layerId = "layer-4"
          let isAnomaly = false
          if (iy === 0) {
            layerId = "layer-1"
            vColor.setHex(0xd4a373) // Clean Sand
          } else if (iy === 1) {
            layerId = "layer-2"
            vColor.setHex(0x588157) // Sandy Silt
          } else if (iy === 2 || iy === 3) {
            layerId = "layer-3"
            const distCenter = Math.hypot(x - 0.25, z - 0.15)
            if (distCenter < 1.15) {
              vColor.setHex(0xf59e0b) // Soft Sensitive Clay Anomaly Core
              isAnomaly = true
            } else {
              vColor.setHex(0xa0522d) // Marine Clay
            }
          } else {
            layerId = "layer-4"
            vColor.setHex(0xe76f51) // Competent Dense Bearing Sand
          }

          voxelInstanced.setColorAt(vIdx, vColor)
          voxelEntries.push({
            ix,
            iy,
            iz,
            normX,
            normZ,
            basePos: new THREE.Vector3(x, y, z),
            layerId,
            isAnomaly,
          })
          vIdx++
        }
      }
    }
    if (voxelInstanced.instanceColor) voxelInstanced.instanceColor.needsUpdate = true

    disposableGeometries.push(voxelCubeGeo)
    disposableMaterials.push(voxelCubeMat)

    // =========================================================================
    // VISUALIZER 04: BEARING STRATUM SECTION — STRUCTURAL PILE CAGE & UNDULATING BEDROCK
    // =========================================================================
    const stratumCageGroup = new THREE.Group()
    stratumCageGroup.position.set(0, -1.2, 0)
    monolithRoot.add(stratumCageGroup)

    // Top Structural Pile Cap Foundation Slab
    const pileCapGeo = new THREE.BoxGeometry(3.4, 0.24, 2.6)
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

    // 8 Reinforced Concrete Driven Piles with Glowing Toe Rings
    const PILE_LEN = 2.95
    const pileCylGeo = new THREE.CylinderGeometry(0.13, 0.13, PILE_LEN, 20)
    const pileCylMat = new THREE.MeshStandardMaterial({
      color: 0xfbf7f2,
      emissive: 0x7a421d,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.3,
      transparent: true,
      opacity: 0,
    })
    const toeRingGeo = new THREE.TorusGeometry(0.18, 0.03, 12, 24)
    toeRingGeo.rotateX(Math.PI / 2)
    const toeRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0,
      toneMapped: false,
    })

    const pilePositions: Array<[number, number]> = [
      [-1.25, -0.85],
      [-0.42, -0.85],
      [0.42, -0.85],
      [1.25, -0.85],
      [-1.25, 0.85],
      [-0.42, 0.85],
      [0.42, 0.85],
      [1.25, 0.85],
    ]

    const pileMeshes: THREE.Mesh[] = []
    for (const [px, pz] of pilePositions) {
      const pMesh = new THREE.Mesh(pileCylGeo, pileCylMat)
      pMesh.position.set(px, 1.25 - PILE_LEN / 2, pz)
      const tRing = new THREE.Mesh(toeRingGeo, toeRingMat)
      tRing.position.y = -PILE_LEN / 2 + 0.05
      pMesh.add(tRing)
      stratumCageGroup.add(pMesh)
      pileMeshes.push(pMesh)
    }

    // Undulating 3D Dense Bearing Stratum Terrain (qc >= 15 MPa)
    const terrainGeo = new THREE.BoxGeometry(BLOCK_W + 0.3, 1.15, BLOCK_D + 0.3, 20, 4, 16)
    const tPos = terrainGeo.attributes.position
    for (let i = 0; i < tPos.count; i++) {
      const vx = tPos.getX(i)
      const vy = tPos.getY(i)
      const vz = tPos.getZ(i)
      if (vy > 0) {
        const undulation =
          0.22 * Math.sin(vx * 1.4 + 0.4) * Math.cos(vz * 1.5) +
          0.12 * Math.cos(vx * 2.5 - vz * 1.8)
        tPos.setY(i, vy + undulation)
      }
    }
    terrainGeo.computeVertexNormals()

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xe76f51,
      emissive: 0x9e3d22,
      emissiveIntensity: 0.3,
      roughness: 0.55,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
    })
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat)
    terrainMesh.position.y = -1.65
    stratumCageGroup.add(terrainMesh)

    const terrainWireGeo = new THREE.WireframeGeometry(terrainGeo)
    const terrainWireMat = new THREE.LineBasicMaterial({
      color: 0xfad9ba,
      transparent: true,
      opacity: 0,
    })
    terrainMesh.add(new THREE.LineSegments(terrainWireGeo, terrainWireMat))

    // Laser Bearing Cutoff Datum Plane (Moves with user's minQc & maxIc sliders)
    const datumLaserGeo = new THREE.PlaneGeometry(BLOCK_W + 0.5, BLOCK_D + 0.5)
    const datumLaserMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    const datumLaser = new THREE.Mesh(datumLaserGeo, datumLaserMat)
    datumLaser.rotation.x = -Math.PI / 2
    datumLaser.position.y = -1.1
    const datumEdges = new THREE.EdgesGeometry(datumLaserGeo)
    const datumLineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0,
    })
    datumLaser.add(new THREE.LineSegments(datumEdges, datumLineMat))
    stratumCageGroup.add(datumLaser)

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
      pileCylMat,
      toeRingMat,
      terrainMat,
      terrainWireMat,
      datumLaserMat,
      datumLineMat
    )

    // =========================================================================
    // POINTER PARALLAX & DRAG ROTATION
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
    // SCROLLYTELLING MORPH ANIMATION LOOP (r186 THREE.Timer)
    // =========================================================================
    const timer = new THREE.Timer()
    timer.connect(document)

    // Smoothed Stage Weights (0..1 per visualizer mode)
    let wHero = 1
    let wProblem = 0
    let wDqn = 0
    let wVoxel = 0
    let wStratum = 0

    let currentCamX = 8.6
    let currentCamY = 5.4
    let currentCamZ = 9.6
    let currentLookY = -0.85
    let currentRootRotY = -0.32
    let currentSliceX = 65
    let currentSliceY = 60

    const cameraStageTargets: Record<
      MonolithStage,
      { camPos: [number, number, number]; lookY: number; rotY: number }
    > = {
      hero: { camPos: [8.6, 5.2, 9.5], lookY: -0.75, rotY: -0.32 },
      problem: { camPos: [7.8, 3.8, 8.2], lookY: -1.65, rotY: 0.35 },
      dqn: { camPos: [4.6, 8.8, 6.2], lookY: -1.05, rotY: -0.45 },
      voxel: { camPos: [8.0, 4.8, 8.6], lookY: -1.3, rotY: -0.24 },
      stratum: { camPos: [7.8, 2.6, 8.6], lookY: -1.35, rotY: 0.3 },
      workflow: { camPos: [8.6, 5.2, 9.5], lookY: -1.0, rotY: -0.32 },
    }

    const voxelDummy = new THREE.Object3D()

    function animate() {
      timer.update()
      const dt = Math.min(timer.getDelta(), 0.1)
      const elapsed = timer.getElapsed()
      const state = sceneStateRef.current

      // 1. Compute & Damp Continuous Stage Morph Weights
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
      // MODE 00 & 01: BUILDING + 4 STRATA + ISOLATED SOFT CLAY ANOMALY LENS
      // -----------------------------------------------------------------------
      // Building stays visible in Hero, lifts high up (+4.5 units) and dissolves in Problem/DQN/Voxel/Stratum
      const buildingVis = Math.max(0, wHero)
      buildingGroup.visible = buildingVis > 0.01
      buildingGroup.position.y = (1 - wHero) * 3.8
      buildingGroup.scale.setScalar(0.85 + 0.15 * wHero)
      for (const item of buildingMaterials) {
        item.mat.opacity = item.baseOpacity * buildingVis
      }

      // 4 Monolith Soil Layers:
      // In Hero: all 4 intact.
      // In Problem: Layers 1, 2, 4 peel away & fade out; ONLY Layer 3 (Soft Clay) stays, scales up 1.28x, and becomes a translucent X-ray shell!
      for (let i = 0; i < layerEntries.length; i++) {
        const entry = layerEntries[i]
        const isLayer3 = entry.id === "layer-3"

        if (isLayer3) {
          const l3Vis = Math.min(1, wHero + wProblem)
          entry.group.visible = l3Vis > 0.01
          entry.group.position.y = entry.baseY + wProblem * 0.05
          const l3Scale = 1 + wProblem * 0.24
          entry.group.scale.set(l3Scale, l3Scale, l3Scale)
          // In Hero: solid clay (opacity 1). In Problem: translucent X-ray casing (opacity 0.22) so the internal 3D clay lens shines!
          entry.material.opacity = wHero * 1.0 + wProblem * 0.22
          entry.material.depthWrite = wHero > 0.5
          entry.edgeMaterial.opacity = wHero * 0.65 + wProblem * 0.9
        } else {
          const otherVis = wHero
          entry.group.visible = otherVis > 0.01
          const peelDir = i < 2 ? 1 : -1
          entry.group.position.y = entry.baseY + (1 - wHero) * peelDir * 3.2
          entry.group.scale.setScalar(0.85 + 0.15 * wHero)
          entry.material.opacity = otherVis
          entry.material.depthWrite = otherVis > 0.5
          entry.edgeMaterial.opacity = otherVis * 0.65
        }
      }

      // Problem Anomaly Lens & 4 Blind Boreholes (Visible in Section 01 Problem)
      problemAnomalyGroup.visible = wProblem > 0.01
      problemAnomalyGroup.scale.setScalar(0.75 + 0.45 * wProblem)
      anomalyMesh.rotation.y = elapsed * 0.25
      const pulseGlow = 0.4 + Math.sin(elapsed * 3.2) * 0.15
      anomalyMat.opacity = wProblem * 0.92
      anomalyMat.emissiveIntensity = pulseGlow
      anomalyWireMat.opacity = wProblem * 0.75
      blindBoreholeMat.opacity = wProblem * 0.85
      blindRingMat.opacity = wProblem * 0.85

      // -----------------------------------------------------------------------
      // MODE 02: DQN 144-NODE GEODETIC RADAR & SPOT 2 LASER RIG
      // -----------------------------------------------------------------------
      dqnRadarGroup.visible = wDqn > 0.01
      dqnRadarGroup.scale.setScalar(0.8 + 0.28 * wDqn)
      nodeMat.opacity = wDqn * 0.95
      radarPlateMat.opacity = wDqn * 0.85
      radarPlateLineMat.opacity = wDqn * 0.65
      laserBeamMat.opacity = wDqn * 0.95
      targetRingMat.opacity = wDqn * (0.65 + Math.sin(elapsed * 4) * 0.3)

      const ringPulse = 1 + Math.sin(elapsed * 3.5) * 0.22
      targetRing.scale.set(ringPulse, ringPulse, 1)

      // React to DQN active rationale tab ("gap" | "transition" | "anomaly")
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
      // MODE 03: TRUE 3D INSTANCED VOXEL CUBE MATRIX (480 Discrete Cubes)
      // -----------------------------------------------------------------------
      voxelMatrixGroup.visible = wVoxel > 0.01
      voxelCubeMat.opacity = wVoxel * 0.98
      currentSliceX = THREE.MathUtils.damp(currentSliceX, state.sliceX, 8, dt)
      currentSliceY = THREE.MathUtils.damp(currentSliceY, state.sliceY, 8, dt)

      if (wVoxel > 0.01) {
        for (let i = 0; i < voxelEntries.length; i++) {
          const v = voxelEntries[i]
          // Smooth per-cube slicing falloff along Easting (X) and Northing (Z)
          const cutX = THREE.MathUtils.clamp((currentSliceX - v.normX + 8) / 8, 0, 1)
          const cutZ = THREE.MathUtils.clamp((currentSliceY - v.normZ + 8) / 8, 0, 1)
          const hoverBoost = state.hoveredLayerId === v.layerId ? 1.14 : 1.0
          const cubeScale = cutX * cutZ * wVoxel * hoverBoost

          const floatOffset =
            v.isAnomaly ? Math.sin(elapsed * 3 + v.ix * 0.5) * 0.04 : 0
          voxelDummy.position.set(
            v.basePos.x,
            v.basePos.y + floatOffset,
            v.basePos.z
          )
          voxelDummy.scale.setScalar(Math.max(0.0001, cubeScale))
          voxelDummy.updateMatrix()
          voxelInstanced.setMatrixAt(i, voxelDummy.matrix)
        }
        voxelInstanced.instanceMatrix.needsUpdate = true
      }

      // -----------------------------------------------------------------------
      // MODE 04: DEEP STRUCTURAL FOUNDATION PILE CAGE & UNDULATING BEDROCK
      // -----------------------------------------------------------------------
      stratumCageGroup.visible = wStratum > 0.01
      stratumCageGroup.scale.setScalar(0.82 + 0.24 * wStratum)
      pileCapMat.opacity = wStratum * 0.95
      pileCapLineMat.opacity = wStratum * 0.7
      pileCylMat.opacity = wStratum * 0.98
      toeRingMat.opacity = wStratum * 0.95
      terrainMat.opacity = wStratum * 0.95
      terrainWireMat.opacity = wStratum * 0.45
      datumLaserMat.opacity = wStratum * 0.28
      datumLineMat.opacity = wStratum * 0.9

      // Pile toe depth & laser datum react live to minQc (10..25 MPa) & minThickness sliders
      const qcShift = ((state.minQc - 15.0) / 10.0) * 0.45
      const thicknessShift = ((state.minThickness - 2.0) / 3.0) * 0.2
      datumLaser.position.y = -1.05 - qcShift - thicknessShift
      for (const pMesh of pileMeshes) {
        pMesh.position.y = 1.25 - PILE_LEN / 2 - qcShift * 0.5
      }

      // -----------------------------------------------------------------------
      // CAMERA CHOREOGRAPHY ACROSS SECTIONS
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

      const isFrontProfile = state.activeStage === "voxel" && state.cameraView === "front"
      const targetCamX = isFrontProfile
        ? 0.0
        : THREE.MathUtils.lerp(fromCam.camPos[0], toCam.camPos[0], t)
      const targetCamY = isFrontProfile
        ? -1.2
        : THREE.MathUtils.lerp(fromCam.camPos[1], toCam.camPos[1], t)
      const targetCamZ = isFrontProfile
        ? 10.4
        : THREE.MathUtils.lerp(fromCam.camPos[2], toCam.camPos[2], t)
      const targetLookY = THREE.MathUtils.lerp(fromCam.lookY, toCam.lookY, t)
      const targetRotY = isFrontProfile
        ? 0
        : THREE.MathUtils.lerp(fromCam.rotY, toCam.rotY, t) +
          userRotationY +
          Math.sin(elapsed * 0.35) * 0.04

      currentCamX = THREE.MathUtils.damp(currentCamX, targetCamX, 4.5, dt)
      currentCamY = THREE.MathUtils.damp(currentCamY, targetCamY, 4.5, dt)
      currentCamZ = THREE.MathUtils.damp(currentCamZ, targetCamZ, 4.5, dt)
      currentLookY = THREE.MathUtils.damp(currentLookY, targetLookY, 5.0, dt)
      currentRootRotY = THREE.MathUtils.damp(currentRootRotY, targetRotY, 5.0, dt)

      camera.position.set(
        currentCamX + pointerX * 0.35,
        currentCamY + pointerY * 0.25,
        currentCamZ
      )
      camera.lookAt(0, currentLookY, 0)
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
      aria-label="Interactive 3D geotechnical scrollytelling visualizer"
    />
  )
}

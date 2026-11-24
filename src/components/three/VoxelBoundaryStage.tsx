import { useEffect, useRef } from "react"
import * as THREE from "three"
import { motion, AnimatePresence } from "framer-motion"
import { useSubsurface3D } from "../../context/Subsurface3DContext"
import { MOCK_CPT_TEST_PIPES } from "../../data/mockGeology"
import {
  STRATA_LAYER_SPECS,
  createRealisticStrataPBRTextures,
  getGeologicalWave,
  smoothstep,
} from "./geology3DUtils"
import { X, MapPin, Layers, ArrowDownToLine } from "lucide-react"

interface SolidHorizonEntry {
  id: string
  specIndex: number
  topY: number
  botY: number
  height: number
  group: THREE.Group
  geometry: THREE.BufferGeometry
  baseUnitPos: Float32Array
  baseNormals: Float32Array
  material: THREE.MeshStandardMaterial
  borderGeo: THREE.BufferGeometry
  borderPositions: Float32Array
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
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(33, width / height, 0.1, 100)
    camera.position.set(7.4, 4.9, 8.2)
    camera.lookAt(0, -1.35, 0)

    // Architectural & Subsurface Cross-Section Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfbf7f2, 1.05)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight(0xfff3e6, 0x381800, 0.78)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.75)
    keyLight.position.set(8, 13, 9)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)

    // Cross-section fill light aimed directly at the +X and +Z slice walls
    const sliceWallLight = new THREE.DirectionalLight(0xffe6cc, 1.55)
    sliceWallLight.position.set(7, 1.5, 8)
    scene.add(sliceWallLight)

    const rimLight = new THREE.DirectionalLight(0xfad9ba, 1.3)
    rimLight.position.set(-8, 6, -6)
    scene.add(rimLight)

    const BLOCK_W = 4.2
    const BLOCK_D = 3.3
    const MIN_X = -BLOCK_W / 2
    const MIN_Z = -BLOCK_D / 2

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
      opacity: 0.75,
      depthTest: true,
      depthWrite: false,
    })
    const boundaryFrameLines = new THREE.LineSegments(boundaryFrameEdges, boundaryFrameLineMat)
    boundaryFrameLines.position.y = 0.04
    boundaryRoot.add(boundaryFrameLines)
    disposableGeometries.push(boundaryFrameGeo, boundaryFrameEdges)
    disposableMaterials.push(boundaryFrameLineMat)

    // 2. 4 Solid Undulating Continuous Stratigraphic Layers
    // Dynamically morphed to [MIN_X..cutX, MIN_Z..cutZ] so the sliced interior is 100% solid and richly textured!
    const SEG_X = 26
    const SEG_Y = 4
    const SEG_Z = 22
    const BORDER_RING_STEPS = 28

    const solidHorizonEntries: SolidHorizonEntry[] = []
    let smoothCursorY = 0

    for (let sIdx = 0; sIdx < STRATA_LAYER_SPECS.length; sIdx++) {
      const spec = STRATA_LAYER_SPECS[sIdx]
      const topY = smoothCursorY
      const botY = smoothCursorY - spec.height
      smoothCursorY = botY

      const hGroup = new THREE.Group()
      boundaryRoot.add(hGroup)

      // Unit box [-0.5..+0.5]^3 with separate face normals for clean world-space triplanar UVs
      const sGeo = new THREE.BoxGeometry(1, 1, 1, SEG_X, SEG_Y, SEG_Z)
      const posAttr = sGeo.attributes.position
      const normAttr = sGeo.attributes.normal
      const baseUnitPos = new Float32Array(posAttr.count * 3)
      const baseNormals = new Float32Array(normAttr.count * 3)

      for (let i = 0; i < posAttr.count; i++) {
        baseUnitPos[i * 3] = posAttr.getX(i)
        baseUnitPos[i * 3 + 1] = posAttr.getY(i)
        baseUnitPos[i * 3 + 2] = posAttr.getZ(i)

        baseNormals[i * 3] = normAttr.getX(i)
        baseNormals[i * 3 + 1] = normAttr.getY(i)
        baseNormals[i * 3 + 2] = normAttr.getZ(i)
      }

      const pbrTex = createRealisticStrataPBRTextures(spec.colorHex, spec.pattern, maxAnisotropy)
      disposableTextures.push(pbrTex.map, pbrTex.bumpMap, pbrTex.roughnessMap)

      const sMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: pbrTex.map,
        bumpMap: pbrTex.bumpMap,
        bumpScale: spec.bumpScale * 1.15,
        roughnessMap: pbrTex.roughnessMap,
        roughness: spec.roughness,
        metalness: spec.metalness,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        side: THREE.DoubleSide,
      })

      const sMesh = new THREE.Mesh(sGeo, sMat)
      sMesh.castShadow = true
      sMesh.receiveShadow = true
      hGroup.add(sMesh)

      // Dynamic stratigraphic horizon seam outline around top perimeter of the sliced block
      const borderSegCount = BORDER_RING_STEPS * 4
      const borderPositions = new Float32Array(borderSegCount * 2 * 3)
      const borderGeo = new THREE.BufferGeometry()
      borderGeo.setAttribute("position", new THREE.BufferAttribute(borderPositions, 3))
      const borderMat = new THREE.LineBasicMaterial({
        color: 0x1c130d,
        transparent: true,
        opacity: 0.45,
        depthTest: true,
        depthWrite: false,
      })
      const borderLines = new THREE.LineSegments(borderGeo, borderMat)
      hGroup.add(borderLines)

      disposableGeometries.push(sGeo, borderGeo)
      disposableMaterials.push(sMat, borderMat)

      solidHorizonEntries.push({
        id: spec.id,
        specIndex: sIdx,
        topY,
        botY,
        height: spec.height,
        group: hGroup,
        geometry: sGeo,
        baseUnitPos,
        baseNormals,
        material: sMat,
        borderGeo,
        borderPositions,
      })
    }

    // Function to update solid 3D horizon vertices and world-space UVs for any slice [MIN_X..cutX, MIN_Z..cutZ]
    const updateSolidHorizonsSlice = (cutX: number, cutZ: number) => {
      const clampedCutX = Math.max(MIN_X + 0.25, Math.min(BLOCK_W / 2, cutX))
      const clampedCutZ = Math.max(MIN_Z + 0.25, Math.min(BLOCK_D / 2, cutZ))
      const scaleU = 0.44
      const scaleV = 0.92

      for (let sIdx = 0; sIdx < solidHorizonEntries.length; sIdx++) {
        const entry = solidHorizonEntries[sIdx]
        const pos = entry.geometry.attributes.position
        const uv = entry.geometry.attributes.uv
        const uPos = entry.baseUnitPos
        const bNorm = entry.baseNormals

        for (let i = 0; i < pos.count; i++) {
          const ux = uPos[i * 3] + 0.5 // 0..1
          const uy = uPos[i * 3 + 1] + 0.5 // 0..1
          const uz = uPos[i * 3 + 2] + 0.5 // 0..1

          const worldX = MIN_X + ux * (clampedCutX - MIN_X)
          const worldZ = MIN_Z + uz * (clampedCutZ - MIN_Z)

          const topWave = sIdx === 0 ? 0 : getGeologicalWave(worldX, worldZ, sIdx * 1.7)
          const botWave =
            sIdx === solidHorizonEntries.length - 1
              ? 0
              : getGeologicalWave(worldX, worldZ, (sIdx + 1) * 1.7)
          const worldY = THREE.MathUtils.lerp(
            entry.botY + botWave,
            entry.topY + topWave,
            uy
          )

          pos.setXYZ(i, worldX, worldY, worldZ)

          // World-space box-projected UVs so textures stay sharp and unstretched during slicing
          const nx = Math.abs(bNorm[i * 3])
          const ny = Math.abs(bNorm[i * 3 + 1])
          const nz = Math.abs(bNorm[i * 3 + 2])

          if (ny >= nx && ny >= nz) {
            uv.setXY(i, (worldX + 2.5) * scaleU, (worldZ + 2.5) * scaleU)
          } else if (nx >= nz) {
            uv.setXY(i, (worldZ + 2.5) * scaleU, (worldY + 4.0) * scaleV)
          } else {
            uv.setXY(i, (worldX + 2.5) * scaleU, (worldY + 4.0) * scaleV)
          }
        }

        pos.needsUpdate = true
        uv.needsUpdate = true
        entry.geometry.computeVertexNormals()

        // Update top stratigraphic seam border along the 4 edges of the sliced block
        const bArr = entry.borderPositions
        let ptr = 0
        const evalTopY = (wx: number, wz: number) =>
          entry.topY + (sIdx === 0 ? 0 : getGeologicalWave(wx, wz, sIdx * 1.7)) + 0.004

        const writeEdge = (x0: number, z0: number, x1: number, z1: number) => {
          for (let k = 0; k < BORDER_RING_STEPS; k++) {
            const t0 = k / BORDER_RING_STEPS
            const t1 = (k + 1) / BORDER_RING_STEPS
            const ax = x0 + (x1 - x0) * t0
            const az = z0 + (z1 - z0) * t0
            const bx = x0 + (x1 - x0) * t1
            const bz = z0 + (z1 - z0) * t1
            bArr[ptr++] = ax
            bArr[ptr++] = evalTopY(ax, az)
            bArr[ptr++] = az
            bArr[ptr++] = bx
            bArr[ptr++] = evalTopY(bx, bz)
            bArr[ptr++] = bz
          }
        }

        writeEdge(MIN_X, MIN_Z, clampedCutX, MIN_Z)
        writeEdge(clampedCutX, MIN_Z, clampedCutX, clampedCutZ)
        writeEdge(clampedCutX, clampedCutZ, MIN_X, clampedCutZ)
        writeEdge(MIN_X, clampedCutZ, MIN_X, MIN_Z)

        entry.borderGeo.attributes.position.needsUpdate = true
      }
    }

    updateSolidHorizonsSlice(BLOCK_W / 2, BLOCK_D / 2)

    // 3. Embedded Interior Geological Inclusions (Exposed clearly along the cut face when slicing!)
    const interiorClastGeo = new THREE.DodecahedronGeometry(0.065, 1)
    const bearingTex = createRealisticStrataPBRTextures("#C86442", "bearing", maxAnisotropy)
    disposableTextures.push(bearingTex.map, bearingTex.bumpMap, bearingTex.roughnessMap)
    const interiorClastMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: bearingTex.map,
      bumpMap: bearingTex.bumpMap,
      bumpScale: 0.03,
      roughness: 0.65,
      metalness: 0.08,
    })
    disposableGeometries.push(interiorClastGeo)
    disposableMaterials.push(interiorClastMat)

    const interiorClasts: Array<{ mesh: THREE.Mesh; wx: number; wz: number }> = []
    const lastHorizon = solidHorizonEntries[solidHorizonEntries.length - 1]
    for (let c = 0; c < 36; c++) {
      const wx = MIN_X + 0.35 + ((c * 53) % 100) / 100 * (BLOCK_W - 0.7)
      const wz = MIN_Z + 0.35 + ((c * 79) % 100) / 100 * (BLOCK_D - 0.7)
      const wy =
        lastHorizon.botY + 0.22 + ((c * 31) % 100) / 100 * (lastHorizon.height - 0.42)
      const cMesh = new THREE.Mesh(interiorClastGeo, interiorClastMat)
      cMesh.position.set(wx, wy, wz)
      const sc = 0.65 + (c % 4) * 0.28
      cMesh.scale.set(sc * 1.3, sc * 0.65, sc * 0.95)
      cMesh.rotation.set(c * 0.5, c * 1.1, c * 0.3)
      cMesh.castShadow = true
      cMesh.receiveShadow = true
      lastHorizon.group.add(cMesh)
      interiorClasts.push({ mesh: cMesh, wx, wz })
    }

    // 4. 5 CPT Test Sounding Pipes Mounted on the 3D Boundary (Remain INTACT with 60-degree cones when soil is sliced!)
    const pipeVisualEntries: PipeVisualEntry[] = []
    const pickablePipeProxies: THREE.Object3D[] = []

    const pipeCollarGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.3, 20)
    const pipeTopFlangeGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.065, 20)
    const pipeConeTipGeo = new THREE.ConeGeometry(0.082, 0.22, 18)
    pipeConeTipGeo.rotateX(Math.PI)
    const pipeBeaconRingGeo = new THREE.RingGeometry(0.18, 0.26, 28)
    pipeBeaconRingGeo.rotateX(-Math.PI / 2)
    const pipeHitProxyGeo = new THREE.CylinderGeometry(0.32, 0.32, 4.5, 12)
    disposableGeometries.push(
      pipeCollarGeo,
      pipeTopFlangeGeo,
      pipeConeTipGeo,
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
        emissiveIntensity: 0.22,
        roughness: 0.26,
        metalness: 0.62,
        transparent: false,
        depthWrite: true,
        depthTest: true,
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
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
      })
      const beaconRing = new THREE.Mesh(pipeBeaconRingGeo, beaconMat)
      beaconRing.position.y = 0.42
      beaconRing.visible = false
      pGroup.add(beaconRing)

      // 4 Underground Pipe Core Segments with textured soil core appearance + metallic joints
      const shaftMats: THREE.MeshStandardMaterial[] = []
      let pipeCursorY = 0

      for (const lData of pipeData.layers) {
        const segH = (lData.thicknessM / 25.0) * TOTAL_WORLD_DEPTH
        const segGeo = new THREE.CylinderGeometry(0.074, 0.074, segH, 18)
        const segMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(lData.colorHex),
          emissive: new THREE.Color(lData.colorHex),
          emissiveIntensity: 0.18,
          roughness: 0.32,
          metalness: 0.42,
          transparent: false,
          depthWrite: true,
          depthTest: true,
        })
        const segMesh = new THREE.Mesh(segGeo, segMat)
        segMesh.position.y = pipeCursorY - segH / 2
        pipeCursorY -= segH
        segMesh.castShadow = true
        pGroup.add(segMesh)

        const jointGeo = new THREE.CylinderGeometry(0.092, 0.092, 0.028, 18)
        const jointMesh = new THREE.Mesh(jointGeo, capMat)
        jointMesh.position.y = pipeCursorY
        pGroup.add(jointMesh)

        shaftMats.push(segMat)
        disposableGeometries.push(segGeo, jointGeo)
        disposableMaterials.push(segMat)
      }

      // 60-degree ASTM D5778 conical penetrometer tip at bottom of pipe
      const coneTipMesh = new THREE.Mesh(pipeConeTipGeo, capMat)
      coneTipMesh.position.y = pipeCursorY - 0.11
      pGroup.add(coneTipMesh)

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
          setSelectedPipeId(sceneStateRef.current.selectedPipeId === hitPipeId ? null : hitPipeId)
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
    let currentClipX = BLOCK_W / 2
    let currentClipZ = BLOCK_D / 2
    let lastBuiltClipX = BLOCK_W / 2
    let lastBuiltClipZ = BLOCK_D / 2
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

      const rect = container.getBoundingClientRect()
      const vpH = window.innerHeight
      const rawEntry = (vpH - rect.top) / Math.max(1, vpH * 0.68)
      const targetEntryT = smoothstep(rawEntry)
      currentEntryT = THREE.MathUtils.damp(currentEntryT, targetEntryT, 5.5, dt)
      boundaryRoot.position.y = THREE.MathUtils.lerp(0.18, 0.3, Math.min(1, currentEntryT))

      const targetClipX = MIN_X + (state.sliceX / 100) * BLOCK_W
      const targetClipZ = MIN_Z + (state.sliceY / 100) * BLOCK_D
      currentClipX = THREE.MathUtils.damp(currentClipX, targetClipX, 9.0, dt)
      currentClipZ = THREE.MathUtils.damp(currentClipZ, targetClipZ, 9.0, dt)

      if (
        Math.abs(currentClipX - lastBuiltClipX) > 0.0015 ||
        Math.abs(currentClipZ - lastBuiltClipZ) > 0.0015
      ) {
        lastBuiltClipX = currentClipX
        lastBuiltClipZ = currentClipZ
        updateSolidHorizonsSlice(currentClipX, currentClipZ)

        // Show interior gravel cobbles along or inside the active solid cross-section
        const isSliced = currentClipX < BLOCK_W / 2 - 0.05 || currentClipZ < BLOCK_D / 2 - 0.05
        for (const item of interiorClasts) {
          item.mesh.visible =
            isSliced && item.wx <= currentClipX + 0.04 && item.wz <= currentClipZ + 0.04
        }
      }

      // Unified solid horizon layers (never vertically separated or sheared)
      for (let idx = 0; idx < solidHorizonEntries.length; idx++) {
        const sEntry = solidHorizonEntries[idx]
        sEntry.group.scale.y = 1.0
        sEntry.group.position.y = 0.0

        const isHoveredLayer = state.hoveredLayerId === sEntry.id
        sEntry.material.emissive.setHex(isHoveredLayer ? 0xd97706 : 0x000000)
        sEntry.material.emissiveIntensity = isHoveredLayer ? 0.28 : 0
      }

      // 5 Ground-anchored CPT Standpipes
      for (let pIdx = 0; pIdx < pipeVisualEntries.length; pIdx++) {
        const pEntry = pipeVisualEntries[pIdx]
        const isSelected = state.selectedPipeId === pEntry.id
        const isHovered = hoveredPipeId === pEntry.id

        pEntry.group.position.y = 0

        pEntry.capMat.emissive.setHex(isSelected ? 0x10b981 : isHovered ? 0xfad9ba : 0x7a421d)
        pEntry.capMat.emissiveIntensity = isSelected ? 0.85 : isHovered ? 0.45 : 0.18

        pEntry.beaconMat.color.setHex(isSelected ? 0x10b981 : 0xfad9ba)
        pEntry.beaconRing.visible = isSelected || isHovered
        const bScale = isSelected ? 1.25 + Math.sin(elapsed * 4.2) * 0.18 : 1.0
        pEntry.beaconRing.scale.set(bScale, bScale, 1)

        for (const sMat of pEntry.shaftMats) {
          sMat.emissiveIntensity = isSelected ? 0.42 : 0.15
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
    <div className="relative w-full h-[360px] sm:h-[480px] xl:h-[550px] bg-[#160F0A]/75 border border-[#EFE7DE]/15 overflow-hidden select-none">
      {/* Dedicated In-Section 3D Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
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
                ? `${Math.min(55, Math.max(2, pipeScreenCoords.xPct))}%`
                : "20%",
              top: pipeScreenCoords
                ? `${Math.min(32, Math.max(6, pipeScreenCoords.yPct - 12))}%`
                : "10%",
            }}
            className="absolute z-20 w-[calc(100%-1.5rem)] max-w-xs sm:w-72 bg-[#150E09]/95 backdrop-blur-md border border-[#FAD9BA]/50 shadow-2xl p-3 sm:p-3.5 font-mono text-xs text-[#EFE7DE] pointer-events-auto"
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

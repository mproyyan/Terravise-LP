import * as THREE from "three"

export interface StrataLayerSpec {
  id: string
  code: string
  name: string
  depthLabel: string
  height: number
  colorHex: string
  pattern: "sand" | "silt" | "clay" | "bearing"
  roughness: number
  metalness: number
  bumpScale: number
}

export const STRATA_LAYER_SPECS: StrataLayerSpec[] = [
  {
    id: "layer-1",
    code: "01",
    name: "SURFACE FILL & SILTY SAND",
    depthLabel: "0.0m to 4.5m",
    height: 0.44,
    colorHex: "#D4A373",
    pattern: "sand",
    roughness: 0.82,
    metalness: 0.04,
    bumpScale: 0.035,
  },
  {
    id: "layer-2",
    code: "02",
    name: "FIRM SANDY SILT",
    depthLabel: "4.5m to 8.5m",
    height: 0.76,
    colorHex: "#588157",
    pattern: "silt",
    roughness: 0.76,
    metalness: 0.03,
    bumpScale: 0.028,
  },
  {
    id: "layer-3",
    code: "03",
    name: "SOFT MARINE CLAY LENS",
    depthLabel: "8.5m to 15.0m",
    height: 1.18,
    colorHex: "#A0522D",
    pattern: "clay",
    roughness: 0.54,
    metalness: 0.06,
    bumpScale: 0.024,
  },
  {
    id: "layer-4",
    code: "04",
    name: "DENSE BEARING SAND",
    depthLabel: "15.0m to 25.0m",
    height: 1.46,
    colorHex: "#E76F51",
    pattern: "bearing",
    roughness: 0.68,
    metalness: 0.08,
    bumpScale: 0.055,
  },
]

export interface StrataPBRTextureSet {
  map: THREE.CanvasTexture
  bumpMap: THREE.CanvasTexture
  roughnessMap: THREE.CanvasTexture
}

export function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

export function getGeologicalWave(x: number, z: number, seed: number): number {
  return (
    0.09 * Math.sin(x * 1.35 + seed) * Math.cos(z * 1.45 - seed * 0.5) +
    0.05 * Math.cos((x + z) * 1.8 + seed) +
    0.022 * Math.sin(x * 3.1 - z * 2.7 + seed * 1.3)
  )
}

// Deterministic hash for procedural geological grain & clast synthesis
function hash2D(ix: number, iy: number, seed: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453123
  return n - Math.floor(n)
}

function valueNoise2D(x: number, y: number, seed: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)

  const a = hash2D(ix, iy, seed)
  const b = hash2D(ix + 1, iy, seed)
  const c = hash2D(ix, iy + 1, seed)
  const d = hash2D(ix + 1, iy + 1, seed)

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

function fbm2D(x: number, y: number, seed: number, octaves = 4): number {
  let value = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise2D(x * freq, y * freq, seed + i * 19.3)
    freq *= 2.04
    amp *= 0.5
  }
  return value
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const num = parseInt(clean, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

/**
 * Generates a realistic 512x512 PBR texture set (Albedo map, Bump heightmap, Roughness map)
 * tailored to each geotechnical soil horizon (Sand, Silt, Soft Marine Clay, Dense Bearing Gravel/Sand).
 */
export function createRealisticStrataPBRTextures(
  baseHex: string,
  pattern: "sand" | "silt" | "clay" | "bearing",
  maxAnisotropy = 4
): StrataPBRTextureSet {
  const size = 512

  const colorCanvas = document.createElement("canvas")
  colorCanvas.width = size
  colorCanvas.height = size
  const colorCtx = colorCanvas.getContext("2d")

  const bumpCanvas = document.createElement("canvas")
  bumpCanvas.width = size
  bumpCanvas.height = size
  const bumpCtx = bumpCanvas.getContext("2d")

  const roughCanvas = document.createElement("canvas")
  roughCanvas.width = size
  roughCanvas.height = size
  const roughCtx = roughCanvas.getContext("2d")

  const [baseR, baseG, baseB] = hexToRgb(baseHex)
  const seed =
    pattern === "sand" ? 11.4 : pattern === "silt" ? 27.8 : pattern === "clay" ? 43.2 : 68.9

  if (colorCtx && bumpCtx && roughCtx) {
    const colorImg = colorCtx.createImageData(size, size)
    const bumpImg = bumpCtx.createImageData(size, size)
    const roughImg = roughCtx.createImageData(size, size)

    const cData = colorImg.data
    const bData = bumpImg.data
    const rData = roughImg.data

    // 1. Pixel-level continuous sedimentary matrix, mineral noise, and bedding laminae
    for (let y = 0; y < size; y++) {
      const ny = y / size
      // Subtle horizon boundary contact darkening near top and bottom of each stratum
      const edgeContact =
        Math.min(1, ny / 0.055) * Math.min(1, (1 - ny) / 0.055)
      const contactFactor = 0.76 + 0.24 * edgeContact

      for (let x = 0; x < size; x++) {
        const nx = x / size
        const idx = (y * size + x) * 4

        const macroNoise = fbm2D(nx * 5.5, ny * 11.0, seed, 4)
        const microGrain = hash2D(x, y, seed + 3.7)
        const fineGrain = valueNoise2D(nx * 64, ny * 64, seed + 9.1)

        let r: number
        let g: number
        let b: number
        let bumpVal: number
        let roughVal: number

        if (pattern === "sand") {
          // Cross-bedded quartz & feldspar sand with mineral speckles
          const beddingWave =
            Math.sin(ny * 44.0 + Math.sin(nx * 12.0) * 1.4 + macroNoise * 2.6) * 0.5 + 0.5
          const grainContrast = (microGrain - 0.5) * 44 + (fineGrain - 0.5) * 28
          const beddingShift = (beddingWave - 0.5) * 24 + (macroNoise - 0.5) * 32

          r = (baseR + beddingShift + grainContrast) * contactFactor
          g = (baseG + beddingShift * 0.88 + grainContrast * 0.85) * contactFactor
          b = (baseB + beddingShift * 0.68 + grainContrast * 0.72) * contactFactor

          // Dark heavy mineral (biotite/magnetite) & bright silica quartz specks
          if (microGrain > 0.93) {
            r += 34
            g += 30
            b += 24
            roughVal = 115
          } else {
            if (microGrain < 0.07) {
              r *= 0.62
              g *= 0.6
              b *= 0.58
            }
            roughVal = 195 + (fineGrain - 0.5) * 45
          }

          bumpVal = 128 + (microGrain - 0.5) * 95 + (beddingWave - 0.5) * 32
        } else if (pattern === "silt") {
          // Alluvial sandy silt with fine varved laminations & organic loamy bands
          const varve =
            Math.sin(ny * 78.0 + fbm2D(nx * 8.0, ny * 8.0, seed + 2.1, 3) * 4.5) * 0.5 + 0.5
          const moistureBand = fbm2D(nx * 3.5, ny * 16.0, seed + 5.4, 3)
          const siltShift =
            (varve - 0.5) * 26 + (moistureBand - 0.5) * 38 + (microGrain - 0.5) * 22

          r = (baseR + siltShift * 0.85) * contactFactor
          g = (baseG + siltShift * 0.95) * contactFactor
          b = (baseB + siltShift * 0.7) * contactFactor

          bumpVal = 128 + (varve - 0.5) * 58 + (microGrain - 0.5) * 48
          roughVal = 175 + (moistureBand - 0.5) * 55
        } else if (pattern === "clay") {
          // Cohesive soft marine clay with plastic slickenside flow bands & wet sheen
          const flowWarp = fbm2D(nx * 6.0, ny * 6.0, seed + 1.8, 4)
          const slickenside =
            Math.sin(ny * 36.0 + flowWarp * 6.2 + Math.cos(nx * 10.0) * 1.1) * 0.5 + 0.5
          const moisturePocket = fbm2D(nx * 9.0, ny * 14.0, seed + 8.3, 3)

          const clayTone =
            (slickenside - 0.5) * 30 + (moisturePocket - 0.5) * 42 + (fineGrain - 0.5) * 14
          r = (baseR + clayTone * 1.05) * contactFactor
          g = (baseG + clayTone * 0.78) * contactFactor
          b = (baseB + clayTone * 0.65) * contactFactor

          // Wet marine clay pockets appear darker and noticeably glossier (low roughness)
          if (moisturePocket < 0.42) {
            r *= 0.84
            g *= 0.82
            b *= 0.85
            roughVal = 82
          } else {
            roughVal = 148 + (slickenside - 0.5) * 44
          }

          bumpVal = 128 + (slickenside - 0.5) * 66 + (flowWarp - 0.5) * 42
        } else {
          // Dense bearing sand & compacted sandstone/gravel matrix
          const strataSeam =
            Math.sin(ny * 52.0 + macroNoise * 3.2) * 0.5 + 0.5
          const matrixGrain = (microGrain - 0.5) * 48 + (fineGrain - 0.5) * 34
          const delta = (strataSeam - 0.5) * 28 + (macroNoise - 0.5) * 36 + matrixGrain

          r = (baseR + delta) * contactFactor
          g = (baseG + delta * 0.82) * contactFactor
          b = (baseB + delta * 0.66) * contactFactor

          bumpVal = 128 + (microGrain - 0.5) * 105 + (strataSeam - 0.5) * 46
          roughVal = 172 + (fineGrain - 0.5) * 52
        }

        cData[idx] = clampByte(r)
        cData[idx + 1] = clampByte(g)
        cData[idx + 2] = clampByte(b)
        cData[idx + 3] = 255

        const bByte = clampByte(bumpVal)
        bData[idx] = bByte
        bData[idx + 1] = bByte
        bData[idx + 2] = bByte
        bData[idx + 3] = 255

        const rByte = clampByte(roughVal)
        rData[idx] = rByte
        rData[idx + 1] = rByte
        rData[idx + 2] = rByte
        rData[idx + 3] = 255
      }
    }

    colorCtx.putImageData(colorImg, 0, 0)
    bumpCtx.putImageData(bumpImg, 0, 0)
    roughCtx.putImageData(roughImg, 0, 0)

    // 2. Vector Overlay Pass: Embedded Gravel Clasts, Pebbles, Sedimentary Lenses & Root/Mineral Veins
    if (pattern === "bearing" || pattern === "sand") {
      const clastCount = pattern === "bearing" ? 340 : 120
      for (let i = 0; i < clastCount; i++) {
        const cx = hash2D(i, 1, seed) * size
        const cy = hash2D(i, 2, seed) * size
        const rx =
          pattern === "bearing"
            ? 2.2 + hash2D(i, 3, seed) * 7.5
            : 1.2 + hash2D(i, 3, seed) * 2.8
        const ry = rx * (0.55 + hash2D(i, 4, seed) * 0.4)
        const rot = (hash2D(i, 5, seed) - 0.5) * 0.7

        const tonePick = hash2D(i, 6, seed)
        let clastFill = "rgba(245, 222, 195, 0.52)"
        if (tonePick < 0.32) {
          clastFill = "rgba(68, 42, 26, 0.58)"
        } else if (tonePick < 0.64) {
          clastFill = "rgba(186, 118, 76, 0.55)"
        }

        // Draw pebble shadow
        colorCtx.save()
        colorCtx.translate(cx, cy + 1.2)
        colorCtx.rotate(rot)
        colorCtx.fillStyle = "rgba(22, 13, 8, 0.42)"
        colorCtx.beginPath()
        colorCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
        colorCtx.fill()
        colorCtx.restore()

        // Draw pebble body + top mineral highlight
        colorCtx.save()
        colorCtx.translate(cx, cy)
        colorCtx.rotate(rot)
        colorCtx.fillStyle = clastFill
        colorCtx.beginPath()
        colorCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
        colorCtx.fill()

        colorCtx.strokeStyle = "rgba(255, 238, 218, 0.35)"
        colorCtx.lineWidth = 0.9
        colorCtx.beginPath()
        colorCtx.ellipse(0, -ry * 0.15, rx * 0.82, ry * 0.7, 0, Math.PI, Math.PI * 2)
        colorCtx.stroke()
        colorCtx.restore()

        // Protruding bump relief for each pebble
        bumpCtx.save()
        bumpCtx.translate(cx, cy)
        bumpCtx.rotate(rot)
        const bGrad = bumpCtx.createRadialGradient(-rx * 0.2, -ry * 0.2, 0.5, 0, 0, rx)
        bGrad.addColorStop(0, "rgba(250, 250, 250, 0.85)")
        bGrad.addColorStop(0.75, "rgba(185, 185, 185, 0.55)")
        bGrad.addColorStop(1, "rgba(75, 75, 75, 0.65)")
        bumpCtx.fillStyle = bGrad
        bumpCtx.beginPath()
        bumpCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
        bumpCtx.fill()
        bumpCtx.restore()
      }
    }

    if (pattern === "silt" || pattern === "clay") {
      // Fine undulating sedimentary lenses & mineral/organic seams
      const seamCount = pattern === "clay" ? 28 : 22
      for (let s = 0; s < seamCount; s++) {
        const sy = ((s + 0.5) / seamCount) * size + (hash2D(s, 10, seed) - 0.5) * 14
        colorCtx.strokeStyle =
          pattern === "clay"
            ? s % 2 === 0
              ? "rgba(42, 22, 14, 0.34)"
              : "rgba(235, 185, 148, 0.22)"
            : s % 2 === 0
              ? "rgba(32, 42, 26, 0.32)"
              : "rgba(215, 224, 188, 0.22)"
        colorCtx.lineWidth = 1.2 + hash2D(s, 11, seed) * 1.8
        colorCtx.beginPath()
        colorCtx.moveTo(0, sy)
        for (let wx = 32; wx <= size; wx += 32) {
          const wy = sy + Math.sin(wx * 0.035 + s * 1.7) * 5.5
          colorCtx.lineTo(wx, wy)
        }
        colorCtx.stroke()
      }
    }
  }

  const configureTex = (
    canvas: HTMLCanvasElement,
    isColor: boolean
  ): THREE.CanvasTexture => {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1.6, 0.85)
    tex.anisotropy = maxAnisotropy
    tex.needsUpdate = true
    return tex
  }

  return {
    map: configureTex(colorCanvas, true),
    bumpMap: configureTex(bumpCanvas, false),
    roughnessMap: configureTex(roughCanvas, false),
  }
}

export function createProceduralStrataTexture(
  baseHex: string,
  pattern: "sand" | "silt" | "clay" | "bearing"
): THREE.CanvasTexture {
  return createRealisticStrataPBRTextures(baseHex, pattern).map
}

/**
 * Generates realistic architectural concrete & compacted ground pad PBR textures
 * for building podiums, structural foundation pile caps, and driven concrete piles.
 */
export function createConcretePBRTextures(
  baseHex = "#EFE7DE",
  maxAnisotropy = 4
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 256
  const colorCanvas = document.createElement("canvas")
  colorCanvas.width = size
  colorCanvas.height = size
  const colorCtx = colorCanvas.getContext("2d")

  const bumpCanvas = document.createElement("canvas")
  bumpCanvas.width = size
  bumpCanvas.height = size
  const bumpCtx = bumpCanvas.getContext("2d")

  const [baseR, baseG, baseB] = hexToRgb(baseHex)

  if (colorCtx && bumpCtx) {
    const cImg = colorCtx.createImageData(size, size)
    const bImg = bumpCtx.createImageData(size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        const n1 = fbm2D(x / 42, y / 42, 91.2, 3)
        const grain = hash2D(x, y, 104.5)
        const delta = (n1 - 0.5) * 24 + (grain - 0.5) * 18

        cImg.data[idx] = clampByte(baseR + delta)
        cImg.data[idx + 1] = clampByte(baseG + delta)
        cImg.data[idx + 2] = clampByte(baseB + delta)
        cImg.data[idx + 3] = 255

        const bVal = clampByte(128 + (grain - 0.5) * 70 + (n1 - 0.5) * 40)
        bImg.data[idx] = bVal
        bImg.data[idx + 1] = bVal
        bImg.data[idx + 2] = bVal
        bImg.data[idx + 3] = 255
      }
    }
    colorCtx.putImageData(cImg, 0, 0)
    bumpCtx.putImageData(bImg, 0, 0)

    // Subtle formwork tie lines
    colorCtx.strokeStyle = "rgba(28, 19, 13, 0.1)"
    colorCtx.lineWidth = 1
    for (let i = 64; i < size; i += 64) {
      colorCtx.beginPath()
      colorCtx.moveTo(0, i)
      colorCtx.lineTo(size, i)
      colorCtx.stroke()
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.repeat.set(2, 2)
  map.anisotropy = maxAnisotropy

  const bumpMap = new THREE.CanvasTexture(bumpCanvas)
  bumpMap.colorSpace = THREE.NoColorSpace
  bumpMap.wrapS = THREE.RepeatWrapping
  bumpMap.wrapT = THREE.RepeatWrapping
  bumpMap.repeat.set(2, 2)
  bumpMap.anisotropy = maxAnisotropy

  return { map, bumpMap }
}

/**
 * Applies clean box-projected (triplanar) world-space UV coordinates so that
 * vertical cutaway faces, interior L-cutout walls, and top/bottom bedding surfaces
 * render soil strata and grain textures without stretching or distortion.
 */
export function applyBoxProjectedUVs(
  geometry: THREE.BufferGeometry,
  scaleU = 0.45,
  scaleV = 0.85
): void {
  geometry.computeVertexNormals()
  const pos = geometry.attributes.position
  const norm = geometry.attributes.normal
  if (!pos || !norm) return

  let uv = geometry.attributes.uv as THREE.BufferAttribute | undefined
  if (!uv || uv.count !== pos.count) {
    uv = new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2)
    geometry.setAttribute("uv", uv)
  }

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i)
    const vy = pos.getY(i)
    const vz = pos.getZ(i)

    const nx = Math.abs(norm.getX(i))
    const ny = Math.abs(norm.getY(i))
    const nz = Math.abs(norm.getZ(i))

    if (ny >= nx && ny >= nz) {
      // Top or bottom horizontal bedding plane
      uv.setXY(i, (vx + 2.5) * scaleU, (vz + 2.5) * scaleU)
    } else if (nx >= nz) {
      // East/West or interior X-cutaway vertical wall
      uv.setXY(i, (vz + 2.5) * scaleU, (vy + 2.5) * scaleV)
    } else {
      // North/South or interior Z-cutaway vertical wall
      uv.setXY(i, (vx + 2.5) * scaleU, (vy + 2.5) * scaleV)
    }
  }
  uv.needsUpdate = true
}

/**
 * Creates an L-shaped extruded 3D soil horizon geometry (Rapidkert-style corner cutaway)
 * with smooth undulating geological top and bottom surfaces and box-projected UVs.
 */
export function createLCutawayStrataGeometry(
  width: number,
  height: number,
  depth: number,
  layerIndex: number,
  totalLayers: number
): THREE.BufferGeometry {
  const hw = width / 2
  const hd = depth / 2
  // Front-right L-cutout (removes quadrant x > 0.22, z > -0.08)
  const cutX = 0.22
  const cutZ = -0.08

  const shape = new THREE.Shape()
  shape.moveTo(-hw, -hd)
  shape.lineTo(hw, -hd)
  shape.lineTo(hw, cutZ)
  shape.lineTo(cutX, cutZ)
  shape.lineTo(cutX, hd)
  shape.lineTo(-hw, hd)
  shape.closePath()

  const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    curveSegments: 1,
    steps: 6,
  })

  // Rotate so extrusion is along Y (-height/2 to +height/2) and X/Z match world coordinates
  extrudeGeo.rotateX(Math.PI / 2)
  extrudeGeo.translate(0, height / 2, 0)

  // Convert to non-indexed so each face has sharp normals and clean box-projected UVs
  const nonIndexed = extrudeGeo.toNonIndexed()
  extrudeGeo.dispose()

  // Add subtle undulating geological wave to top and bottom interfaces
  const pos = nonIndexed.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i)
    const vy = pos.getY(i)
    const vz = pos.getZ(i)
    const ny = THREE.MathUtils.clamp(vy / height + 0.5, 0, 1)
    const topWave = layerIndex === 0 ? 0 : getGeologicalWave(vx, vz, layerIndex * 1.6)
    const botWave =
      layerIndex === totalLayers - 1 ? 0 : getGeologicalWave(vx, vz, (layerIndex + 1) * 1.6)
    const waveOffset = THREE.MathUtils.lerp(botWave, topWave, ny)
    pos.setY(i, vy + waveOffset)
  }

  applyBoxProjectedUVs(nonIndexed, 0.42, 0.95)
  return nonIndexed
}

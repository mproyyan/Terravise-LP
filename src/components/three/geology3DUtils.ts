import * as THREE from "three"

export interface StrataLayerSpec {
  id: string
  code: string
  name: string
  depthLabel: string
  height: number
  colorHex: string
  pattern: "sand" | "silt" | "clay" | "bearing"
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
  },
  {
    id: "layer-2",
    code: "02",
    name: "FIRM SANDY SILT",
    depthLabel: "4.5m to 8.5m",
    height: 0.76,
    colorHex: "#588157",
    pattern: "silt",
  },
  {
    id: "layer-3",
    code: "03",
    name: "SOFT MARINE CLAY LENS",
    depthLabel: "8.5m to 15.0m",
    height: 1.18,
    colorHex: "#A0522D",
    pattern: "clay",
  },
  {
    id: "layer-4",
    code: "04",
    name: "DENSE BEARING SAND",
    depthLabel: "15.0m to 25.0m",
    height: 1.46,
    colorHex: "#E76F51",
    pattern: "bearing",
  },
]

export function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

export function getGeologicalWave(x: number, z: number, seed: number): number {
  return (
    0.09 * Math.sin(x * 1.35 + seed) * Math.cos(z * 1.45 - seed * 0.5) +
    0.05 * Math.cos((x + z) * 1.8 + seed)
  )
}

export function createProceduralStrataTexture(
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
      for (let i = 0; i < 480; i++) {
        const x = (i * 73) % 256
        const y = (i * 137) % 256
        ctx.fillRect(x, y, (i % 2) + 1.5, (i % 2) + 1.5)
      }
    } else if (pattern === "silt") {
      ctx.strokeStyle = "rgba(28, 19, 13, 0.16)"
      ctx.lineWidth = 2
      for (let y = 0; y < 256; y += 14) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(85, y + 4, 170, y - 4, 256, y)
        ctx.stroke()
      }
    } else if (pattern === "clay") {
      ctx.strokeStyle = "rgba(250, 217, 186, 0.16)"
      ctx.lineWidth = 1.5
      for (let i = -256; i < 256; i += 18) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + 256, 256)
        ctx.stroke()
      }
    } else if (pattern === "bearing") {
      ctx.strokeStyle = "rgba(28, 19, 13, 0.22)"
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

/**
 * Creates an L-shaped extruded 3D soil horizon geometry (Rapidkert-style corner cutaway)
 * with smooth undulating geological top and bottom surfaces.
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
  // Front-right L-cutout (removes quadrant x > 0.15 * width, z > -0.05 * depth)
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
    steps: 4,
  })

  // Rotate so extrusion is along Y (-height/2 to +height/2) and X/Z match world coordinates
  extrudeGeo.rotateX(Math.PI / 2)
  extrudeGeo.translate(0, height / 2, 0)

  // Add subtle undulating geological wave to top and bottom interfaces
  const pos = extrudeGeo.attributes.position
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

  extrudeGeo.computeVertexNormals()
  return extrudeGeo
}

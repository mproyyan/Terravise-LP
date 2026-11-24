import { useEffect, useRef } from "react"

interface FullWidthTopographicBackgroundProps {
  scrollProgress: number // 0.0 to 1.0 within Section 02
  activeStep: number // 0, 1, or 2
}

// Marching Squares Grid Dimensions
const NX = 72
const NY = 46

interface Point2D {
  x: number
  y: number
}

interface SoundingMarker {
  id: string
  label: string
  normX: number
  normY: number
  depthM: number
  isSpot2?: boolean
}

const SOUNDING_MARKERS: SoundingMarker[] = [
  { id: "b-01", label: "B-01 (NW)", normX: 0.38, normY: 0.28, depthM: 24.5 },
  { id: "b-03", label: "B-03 (NE)", normX: 0.86, normY: 0.26, depthM: 22.8 },
  { id: "b-02", label: "B-02 (SE)", normX: 0.82, normY: 0.74, depthM: 25.0 },
  { id: "spot-2", label: "SPOT 2 (DQN)", normX: 0.68, normY: 0.44, depthM: 25.2, isSpot2: true },
]

export function FullWidthTopographicBackground({
  scrollProgress,
  activeStep,
}: FullWidthTopographicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({ scrollProgress, activeStep })

  useEffect(() => {
    stateRef.current = { scrollProgress, activeStep }
  }, [scrollProgress, activeStep])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId = 0
    const startTime = performance.now()
    let currentProg = scrollProgress

    // Preallocated scalar grid for 60 FPS zero-GC evaluation
    const grid = new Float32Array(NX * NY)

    // Smooth lerped spotlight coordinates
    let currentSpotX = 0.52
    let currentSpotY = 0.48
    let currentSpotRadius = 0.38

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    const render = (now: number) => {
      animId = requestAnimationFrame(render)
      const elapsed = (now - startTime) * 0.001
      const { scrollProgress: targetProg, activeStep: step } = stateRef.current

      // Continuous 60 FPS lerp for flawless fluid transition across any scroll speed
      currentProg += (targetProg - currentProg) * 0.075

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.width
      const h = canvas.height

      ctx.save()
      ctx.scale(dpr, dpr)
      const logicalW = w / dpr
      const logicalH = h / dpr

      // 1. Fluid Ambient Background Tone Transition
      // Step 0: Warm architectural deep slate (#1A130E)
      // Step 1: Rich subterranean clay charcoal (#150E0A)
      // Step 2: Deep geodetic umber (#0F0906)
      let bgR = 26
      let bgG = 19
      let bgB = 14
      if (currentProg > 0.31 && currentProg <= 0.65) {
        const t = (currentProg - 0.31) / 0.34
        bgR = Math.round(26 + (21 - 26) * t)
        bgG = Math.round(19 + (14 - 19) * t)
        bgB = Math.round(14 + (10 - 14) * t)
      } else if (currentProg > 0.65) {
        const t = (currentProg - 0.65) / 0.35
        bgR = Math.round(21 + (15 - 21) * t)
        bgG = Math.round(14 + (9 - 14) * t)
        bgB = Math.round(10 + (6 - 10) * t)
      }

      ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`
      ctx.fillRect(0, 0, logicalW, logicalH)

      // 2. Smooth Overhead Spotlight Target Tracking ("disorot dari atas")
      let targetSpotNormX: number
      let targetSpotNormY: number
      let targetSpotNormRadius: number

      if (currentProg < 0.33) {
        // Stage 1: Spotlight centered on the 16.2m exploration void
        targetSpotNormX = 0.58
        targetSpotNormY = 0.48
        targetSpotNormRadius = 0.36
      } else if (currentProg < 0.66) {
        // Stage 2: Spotlight sweeps along the steep fault shear gradient
        const t2 = (currentProg - 0.33) / 0.33
        targetSpotNormX = 0.58 + t2 * 0.08
        targetSpotNormY = 0.48 + t2 * 0.04
        targetSpotNormRadius = 0.42
      } else {
        // Stage 3: Spotlight narrows and locks directly on Spot 2 (0.68, 0.44)
        targetSpotNormX = 0.68
        targetSpotNormY = 0.44
        targetSpotNormRadius = 0.28
      }

      currentSpotX += (targetSpotNormX - currentSpotX) * 0.075
      currentSpotY += (targetSpotNormY - currentSpotY) * 0.075
      currentSpotRadius += (targetSpotNormRadius - currentSpotRadius) * 0.075

      const spotCenterPxX = currentSpotX * logicalW
      const spotCenterPxY = currentSpotY * logicalH
      const spotRadiusPx = currentSpotRadius * Math.min(logicalW, logicalH)

      // Ambient radial spotlight gradient illuminating the contours from above
      const ambientSpot = ctx.createRadialGradient(
        spotCenterPxX,
        spotCenterPxY,
        15,
        spotCenterPxX,
        spotCenterPxY,
        spotRadiusPx * 1.5
      )
      if (step === 2) {
        ambientSpot.addColorStop(0, "rgba(16, 185, 129, 0.16)")
        ambientSpot.addColorStop(0.5, "rgba(250, 217, 186, 0.08)")
        ambientSpot.addColorStop(1, "rgba(0, 0, 0, 0)")
      } else if (step === 1) {
        ambientSpot.addColorStop(0, "rgba(231, 111, 81, 0.15)")
        ambientSpot.addColorStop(0.55, "rgba(250, 217, 186, 0.07)")
        ambientSpot.addColorStop(1, "rgba(0, 0, 0, 0)")
      } else {
        ambientSpot.addColorStop(0, "rgba(250, 217, 186, 0.13)")
        ambientSpot.addColorStop(0.6, "rgba(90, 48, 8, 0.06)")
        ambientSpot.addColorStop(1, "rgba(0, 0, 0, 0)")
      }
      ctx.fillStyle = ambientSpot
      ctx.fillRect(0, 0, logicalW, logicalH)

      // 3. Evaluate the Continuous 2D Topographic Elevation Field Z(x, y, currentProg)
      // Base organic terrain harmonic waves (produces winding, organic contours matching user image)
      const tProg = currentProg

      // Weights for the 3 geological stages:
      const wVoid = Math.max(0, 1 - tProg * 2.2)
      // Hermite smooth bell-curve for Stage 2 fault compression
      const faultPhase = Math.sin(Math.min(1, Math.max(0, (tProg - 0.18) / 0.65)) * Math.PI)
      const wFault = faultPhase * faultPhase
      // Smooth sigmoid for Stage 3 Spot 2 bullseye
      const wSpot = Math.max(0, Math.min(1, (tProg - 0.5) / 0.45))
      const spotEased = wSpot * wSpot * (3 - 2 * wSpot)

      for (let ix = 0; ix < NX; ix++) {
        const fx = ix / (NX - 1)
        for (let iy = 0; iy < NY; iy++) {
          const fy = iy / (NY - 1)

          // Mathematical terrain harmonic waves (hills, saddles, valleys)
          const z =
            Math.sin(fx * 4.6 + 0.4) * Math.cos(fy * 4.1 - 0.3) * 0.38 +
            Math.cos(fx * 7.4 - fy * 5.2 + 0.9) * 0.22 +
            Math.sin((fx + fy) * 3.4 + elapsed * 0.06) * 0.16 +
            Math.cos(fx * 2.2 - 0.5) * 0.18

          // Geological Stage 1: Central Unexplored Void (caldera / depression saddle)
          const distVoid = Math.hypot(fx - 0.58, fy - 0.48)
          const voidHole = -Math.exp(-(distVoid * distVoid) / 0.038) * 0.65 * wVoid

          // Known boreholes elevation domes (B-01, B-02, B-03)
          const distB1 = Math.hypot(fx - 0.38, fy - 0.28)
          const b1Dome = Math.exp(-(distB1 * distB1) / 0.02) * 0.35 * (1 - spotEased * 0.7)
          const distB2 = Math.hypot(fx - 0.82, fy - 0.74)
          const b2Dome = Math.exp(-(distB2 * distB2) / 0.02) * 0.38 * (1 - spotEased * 0.7)
          const distB3 = Math.hypot(fx - 0.86, fy - 0.26)
          const b3Dome = Math.exp(-(distB3 * distB3) / 0.02) * 0.32 * (1 - spotEased * 0.7)

          // Geological Stage 2: Fault Boundary Shear Dip (Contour gradient compression)
          // Causes contours to pack tightly along a diagonal strike axis
          const faultCoord = fx * 0.75 + fy * 0.65 - 0.72
          const faultSlope = Math.tanh(faultCoord * 6.8) * 0.72 * wFault

          // Geological Stage 3: Spot 2 High-Precision Peak (Bullseye concentric contour rings)
          const distSpot = Math.hypot(fx - 0.68, fy - 0.44)
          const spotPeak = Math.exp(-(distSpot * distSpot) / 0.022) * 1.15 * spotEased

          grid[ix * NY + iy] =
            z + voidHole + b1Dome + b2Dome + b3Dome + faultSlope + spotPeak
        }
      }

      // 4. Marching Squares: Render Genuine Topographic Contour Isolines
      // We evaluate 22 contour levels between -0.80 and +0.95
      const CONTOUR_LEVELS = [
        -0.78, -0.68, -0.58, -0.48, -0.38, -0.28, -0.18, -0.08, 0.02, 0.12,
        0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82, 0.92, 1.02, 1.12,
      ]

      const cellW = logicalW / (NX - 1)
      const cellH = logicalH / (NY - 1)

      for (let cIdx = 0; cIdx < CONTOUR_LEVELS.length; cIdx++) {
        const L = CONTOUR_LEVELS[cIdx]
        const isIndexContour = cIdx % 4 === 0 // Index contour (thicker line like cartography)

        ctx.beginPath()

        for (let ix = 0; ix < NX - 1; ix++) {
          const x0 = ix * cellW
          const x1 = (ix + 1) * cellW

          for (let iy = 0; iy < NY - 1; iy++) {
            const y0 = iy * cellH
            const y1 = (iy + 1) * cellH

            const v0 = grid[ix * NY + iy]
            const v1 = grid[(ix + 1) * NY + iy]
            const v2 = grid[(ix + 1) * NY + (iy + 1)]
            const v3 = grid[ix * NY + (iy + 1)]

            let caseIdx = 0
            if (v0 >= L) caseIdx |= 8
            if (v1 >= L) caseIdx |= 4
            if (v2 >= L) caseIdx |= 2
            if (v3 >= L) caseIdx |= 1

            if (caseIdx === 0 || caseIdx === 15) continue

            // Linear interpolation helper on cell edges
            const pTop: Point2D = {
              x: x0 + ((L - v0) / (v1 - v0 || 0.0001)) * (x1 - x0),
              y: y0,
            }
            const pRight: Point2D = {
              x: x1,
              y: y0 + ((L - v1) / (v2 - v1 || 0.0001)) * (y1 - y0),
            }
            const pBot: Point2D = {
              x: x0 + ((L - v3) / (v2 - v3 || 0.0001)) * (x1 - x0),
              y: y1,
            }
            const pLeft: Point2D = {
              x: x0,
              y: y0 + ((L - v0) / (v3 - v0 || 0.0001)) * (y1 - y0),
            }

            // Draw line segments for the 14 non-trivial Marching Squares cases
            switch (caseIdx) {
              case 1:
              case 14:
                ctx.moveTo(pBot.x, pBot.y)
                ctx.lineTo(pLeft.x, pLeft.y)
                break
              case 2:
              case 13:
                ctx.moveTo(pRight.x, pRight.y)
                ctx.lineTo(pBot.x, pBot.y)
                break
              case 3:
              case 12:
                ctx.moveTo(pRight.x, pRight.y)
                ctx.lineTo(pLeft.x, pLeft.y)
                break
              case 4:
              case 11:
                ctx.moveTo(pTop.x, pTop.y)
                ctx.lineTo(pRight.x, pRight.y)
                break
              case 5:
                ctx.moveTo(pTop.x, pTop.y)
                ctx.lineTo(pLeft.x, pLeft.y)
                ctx.moveTo(pRight.x, pRight.y)
                ctx.lineTo(pBot.x, pBot.y)
                break
              case 6:
              case 9:
                ctx.moveTo(pTop.x, pTop.y)
                ctx.lineTo(pBot.x, pBot.y)
                break
              case 7:
              case 8:
                ctx.moveTo(pTop.x, pTop.y)
                ctx.lineTo(pLeft.x, pLeft.y)
                break
              case 10:
                ctx.moveTo(pTop.x, pTop.y)
                ctx.lineTo(pRight.x, pRight.y)
                ctx.moveTo(pBot.x, pBot.y)
                ctx.lineTo(pLeft.x, pLeft.y)
                break
            }
          }
        }

        // Contour Line Styling:
        // Inside the spotlight beam, lines glow warmly/emerald; outside, they recede into subtle charcoal
        const strokeGrad = ctx.createRadialGradient(
          spotCenterPxX,
          spotCenterPxY,
          20,
          spotCenterPxX,
          spotCenterPxY,
          spotRadiusPx * 1.3
        )

        if (step === 2) {
          strokeGrad.addColorStop(0, isIndexContour ? "rgba(16, 185, 129, 0.95)" : "rgba(16, 185, 129, 0.75)")
          strokeGrad.addColorStop(0.45, isIndexContour ? "rgba(250, 217, 186, 0.75)" : "rgba(250, 217, 186, 0.5)")
          strokeGrad.addColorStop(1, isIndexContour ? "rgba(239, 231, 222, 0.22)" : "rgba(239, 231, 222, 0.12)")
        } else if (step === 1) {
          strokeGrad.addColorStop(0, isIndexContour ? "rgba(231, 111, 81, 0.92)" : "rgba(231, 111, 81, 0.68)")
          strokeGrad.addColorStop(0.5, isIndexContour ? "rgba(250, 217, 186, 0.65)" : "rgba(250, 217, 186, 0.4)")
          strokeGrad.addColorStop(1, isIndexContour ? "rgba(239, 231, 222, 0.2)" : "rgba(239, 231, 222, 0.1)")
        } else {
          strokeGrad.addColorStop(0, isIndexContour ? "rgba(250, 217, 186, 0.85)" : "rgba(250, 217, 186, 0.55)")
          strokeGrad.addColorStop(0.55, isIndexContour ? "rgba(212, 163, 115, 0.5)" : "rgba(212, 163, 115, 0.3)")
          strokeGrad.addColorStop(1, isIndexContour ? "rgba(239, 231, 222, 0.18)" : "rgba(239, 231, 222, 0.09)")
        }

        ctx.strokeStyle = strokeGrad
        ctx.lineWidth = isIndexContour ? 1.6 : 1.05
        ctx.stroke()
      }

      // 5. Stage Overlays & Telemetry (Anchored gracefully on the living contour map)

      // =======================================================================
      // STAGE 01 OVERLAY: The 16.2m Exploration Void Callout & Borehole Collars
      // =======================================================================
      if (tProg < 0.38) {
        const alpha = Math.max(0, 1 - tProg * 2.8)
        const voidCenterPxX = 0.58 * logicalW
        const voidCenterPxY = 0.48 * logicalH
        const voidRadiusPx = 0.18 * Math.min(logicalW, logicalH)

        // Pulsing dashed range circle
        const pulse = 1 + Math.sin(elapsed * 2.6) * 0.035
        ctx.strokeStyle = `rgba(231, 111, 81, ${0.75 * alpha})`
        ctx.lineWidth = 1.5
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(voidCenterPxX, voidCenterPxY, voidRadiusPx * pulse, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])

        // Leader line & dimension label
        ctx.strokeStyle = `rgba(250, 217, 186, ${0.65 * alpha})`
        ctx.beginPath()
        ctx.moveTo(voidCenterPxX, voidCenterPxY)
        ctx.lineTo(voidCenterPxX + voidRadiusPx * pulse, voidCenterPxY)
        ctx.stroke()

        ctx.fillStyle = `rgba(250, 217, 186, ${0.85 * alpha})`
        ctx.font = "bold 10px monospace"
        ctx.textAlign = "center"
        ctx.fillText("R = 16.2M VOID", voidCenterPxX, voidCenterPxY - voidRadiusPx * pulse - 10)

        ctx.fillStyle = `rgba(231, 111, 81, ${0.85 * alpha})`
        ctx.font = "9px monospace"
        ctx.fillText("ZERO SOUNDINGS WITHIN 16M", voidCenterPxX, voidCenterPxY + 4)
      }

      // =======================================================================
      // STAGE 02 OVERLAY: Fault Dip Gradient Strike Line & Shear Direction
      // =======================================================================
      if (tProg >= 0.28 && tProg <= 0.72) {
        const alpha = Math.max(0, 1 - Math.abs(tProg - 0.5) * 3.2)
        const p1x = logicalW * 0.36
        const p1y = logicalH * 0.28
        const p2x = logicalW * 0.88
        const p2y = logicalH * 0.72

        // Geological strike dashed axis
        ctx.strokeStyle = `rgba(231, 111, 81, ${0.85 * alpha})`
        ctx.lineWidth = 1.8
        ctx.setLineDash([8, 5])
        ctx.beginPath()
        ctx.moveTo(p1x, p1y)
        ctx.lineTo(p2x, p2y)
        ctx.stroke()
        ctx.setLineDash([])

        // Directional dip arrows across the steep contour slope
        const arrowNodes = [0.48, 0.66, 0.78]
        const angle = Math.atan2(p2y - p1y, p2x - p1x) + Math.PI / 2

        for (const f of arrowNodes) {
          const px = p1x + (p2x - p1x) * f
          const py = p1y + (p2y - p1y) * f
          const len = 24
          const ex = px + Math.cos(angle) * len
          const ey = py + Math.sin(angle) * len

          ctx.strokeStyle = `rgba(250, 217, 186, ${0.8 * alpha})`
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(ex, ey)
          ctx.stroke()

          ctx.fillStyle = `rgba(250, 217, 186, ${0.8 * alpha})`
          ctx.beginPath()
          ctx.arc(ex, ey, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }

        // Architectural callout tag
        ctx.fillStyle = `rgba(250, 217, 186, ${0.9 * alpha})`
        ctx.font = "bold 10px monospace"
        ctx.textAlign = "left"
        ctx.fillText("FAULT SHEAR BOUNDARY (-8.5M)", p2x - 140, p2y - 20)
        ctx.fillStyle = `rgba(231, 111, 81, ${0.85 * alpha})`
        ctx.font = "9px monospace"
        ctx.fillText("STEEP DIP: SAND → SOFT CLAY BASIN", p2x - 140, p2y - 6)
      }

      // =======================================================================
      // STAGE 03 OVERLAY: Spot 2 High-Precision Target Reticle & Neural Rays
      // =======================================================================
      if (tProg > 0.6) {
        const alpha = Math.max(0, Math.min(1, (tProg - 0.6) * 2.8))
        const targetPxX = 0.68 * logicalW
        const targetPxY = 0.44 * logicalH

        // Neural Trajectory Rays converging from B-01, B-02, B-03 into Spot 2
        for (const marker of SOUNDING_MARKERS) {
          if (marker.isSpot2) continue
          const mx = marker.normX * logicalW
          const my = marker.normY * logicalH

          ctx.strokeStyle = `rgba(16, 185, 129, ${0.45 * alpha})`
          ctx.lineWidth = 1.2
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(mx, my)
          ctx.lineTo(targetPxX, targetPxY)
          ctx.stroke()
          ctx.setLineDash([])

          // Animated photon pulse streaming toward Spot 2
          const u = (elapsed * 0.8 + (marker.normX * 5)) % 1
          const qx = mx + (targetPxX - mx) * u
          const qy = my + (targetPxY - my) * u

          ctx.fillStyle = `rgba(250, 217, 186, ${0.9 * alpha})`
          ctx.beginPath()
          ctx.arc(qx, qy, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }

        // High-Precision Targeting Reticle
        const pulse = 1 + Math.sin(elapsed * 4.2) * 0.08
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
        ctx.beginPath()
        ctx.arc(targetPxX, targetPxY, 5.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = `rgba(16, 185, 129, ${0.95 * alpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(targetPxX, targetPxY, 18 * pulse, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = `rgba(250, 217, 186, ${0.75 * alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(targetPxX, targetPxY, 32 * pulse, 0, Math.PI * 2)
        ctx.stroke()

        // Leader line & target telemetry
        ctx.strokeStyle = `rgba(250, 217, 186, ${0.75 * alpha})`
        ctx.beginPath()
        ctx.moveTo(targetPxX, targetPxY)
        ctx.lineTo(targetPxX + 45, targetPxY - 45)
        ctx.lineTo(targetPxX + 175, targetPxY - 45)
        ctx.stroke()

        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
        ctx.font = "bold 11px monospace"
        ctx.textAlign = "left"
        ctx.fillText("TARGET RETICLE: SPOT 2", targetPxX + 50, targetPxY - 52)

        ctx.fillStyle = `rgba(250, 217, 186, ${0.9 * alpha})`
        ctx.font = "9px monospace"
        ctx.fillText("X=68.4M · Y=44.1M · GAIN +14.2%", targetPxX + 50, targetPxY - 36)
      }

      // 6. Draw Fixed Ground Sounding Borehole Pins (B-01, B-02, B-03)
      for (const marker of SOUNDING_MARKERS) {
        if (marker.isSpot2 && tProg < 0.6) continue
        const px = marker.normX * logicalW
        const py = marker.normY * logicalH

        if (!marker.isSpot2) {
          ctx.fillStyle = "#EFE7DE"
          ctx.beginPath()
          ctx.arc(px, py, 3.5, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = "#5A3008"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(px, py, 6.5, 0, Math.PI * 2)
          ctx.stroke()

          ctx.fillStyle = "rgba(239, 231, 222, 0.65)"
          ctx.font = "9px monospace"
          ctx.textAlign = "center"
          ctx.fillText(marker.label, px, py - 10)
        }
      }

      ctx.restore()
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}

import { useEffect, useRef } from "react"

interface TopographicStrataCanvasProps {
  scrollProgress: number // 0.0 to 1.0 within Section 02
  activeStep: number // 0, 1, or 2
}

interface SoundingPoint {
  id: string
  label: string
  xM: number // meters (0 to 120)
  yM: number // meters (0 to 80)
  depthM: number
  isSpot2?: boolean
}

const SITE_POINTS: SoundingPoint[] = [
  { id: "b-01", label: "B-01 (NW)", xM: 26, yM: 24, depthM: 24.5 },
  { id: "b-02", label: "B-02 (SE)", xM: 98, yM: 62, depthM: 25.0 },
  { id: "b-03", label: "B-03 (NE)", xM: 94, yM: 22, depthM: 22.8 },
  { id: "spot-2", label: "SPOT 2 (DQN)", xM: 68.4, yM: 44.1, depthM: 25.2, isSpot2: true },
]

export function TopographicStrataCanvas({
  scrollProgress,
  activeStep,
}: TopographicStrataCanvasProps) {
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

    // Smooth lerped values for transition continuity
    let currentSpotlightX = 0.5
    let currentSpotlightY = 0.5
    let currentSpotlightRadius = 0.35
    let currentSpotlightAlpha = 0.85
    let currentProgress = scrollProgress

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

      currentProgress += (targetProg - currentProgress) * 0.1

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.width
      const h = canvas.height

      ctx.save()
      ctx.scale(dpr, dpr)
      const logicalW = w / dpr
      const logicalH = h / dpr

      // Clear Canvas with rich subterranean charcoal
      ctx.fillStyle = "#150E09"
      ctx.fillRect(0, 0, logicalW, logicalH)

      // Geodetic Margin Padding for site boundary & coordinate axes
      const padL = 46
      const padR = 32
      const padT = 36
      const padB = 40
      const mapW = logicalW - padL - padR
      const mapH = logicalH - padT - padB

      // Coordinate converter (meters -> canvas pixels)
      const toPxX = (xM: number) => padL + (xM / 120) * mapW
      const toPxY = (yM: number) => padT + (yM / 80) * mapH

      // Determine Target Spotlight Position based on activeStep / scrollProgress
      let targetSpotX: number
      let targetSpotY: number
      let targetSpotRad: number
      let targetSpotAlpha: number

      if (step === 0) {
        // Stage 01: Spotlight highlights the void between B-01, B-02, B-03
        targetSpotX = 0.5
        targetSpotY = 0.46
        targetSpotRad = 0.38
        targetSpotAlpha = 0.75
      } else if (step === 1) {
        // Stage 02: Spotlight shifts along the geological fault strike line (NW to SE)
        targetSpotX = 0.58
        targetSpotY = 0.52
        targetSpotRad = 0.46
        targetSpotAlpha = 0.88
      } else {
        // Stage 03: Spotlight locks tightly onto Spot 2 (X=68.4m, Y=44.1m)
        targetSpotX = toPxX(68.4) / logicalW
        targetSpotY = toPxY(44.1) / logicalH
        targetSpotRad = 0.28
        targetSpotAlpha = 0.95
      }

      currentSpotlightX += (targetSpotX - currentSpotlightX) * 0.08
      currentSpotlightY += (targetSpotY - currentSpotlightY) * 0.08
      currentSpotlightRadius += (targetSpotRad - currentSpotlightRadius) * 0.08
      currentSpotlightAlpha += (targetSpotAlpha - currentSpotlightAlpha) * 0.08

      const spotCenterPxX = currentSpotlightX * logicalW
      const spotCenterPxY = currentSpotlightY * logicalH
      const spotRadiusPx = currentSpotlightRadius * Math.min(logicalW, logicalH)

      // 1. Draw Architectural Geodetic Background Grid (10m x 10m ticks)
      ctx.strokeStyle = "rgba(239, 231, 222, 0.05)"
      ctx.lineWidth = 1
      for (let xm = 0; xm <= 120; xm += 15) {
        const px = toPxX(xm)
        ctx.beginPath()
        ctx.moveTo(px, padT)
        ctx.lineTo(px, padT + mapH)
        ctx.stroke()
      }
      for (let ym = 0; ym <= 80; ym += 10) {
        const py = toPxY(ym)
        ctx.beginPath()
        ctx.moveTo(padL, py)
        ctx.lineTo(padL + mapW, py)
        ctx.stroke()
      }

      // 2. Draw Topographic Iso-Depth Contour Curves (-4m to -22m)
      // We generate continuous undulating contour elevation lines across the site
      const contourDepths = [4, 7, 10, 13, 16, 19, 22]

      for (let cIdx = 0; cIdx < contourDepths.length; cIdx++) {
        const depth = contourDepths[cIdx]
        const normDepth = depth / 25
        const isFaultZone = depth >= 10 && depth <= 16

        // Compute contour line path across map width
        ctx.beginPath()
        const stepsCount = 64
        for (let s = 0; s <= stepsCount; s++) {
          const fx = s / stepsCount
          const xM = fx * 120
          // Geological dip model: strata dip deeper toward SE, with an undulating clay basin
          const dipM = (xM / 120) * 8.5
          const wave1 = Math.sin(fx * Math.PI * 2.8 + cIdx * 0.8 + elapsed * 0.15) * 5.2
          const wave2 = Math.cos(fx * Math.PI * 1.5 - cIdx * 0.5) * 3.4
          // Clay depression in center-east
          const distToBasin = Math.hypot(xM - 65, 45 - 40)
          const basinDepress = Math.exp(-((distToBasin * distToBasin) / 900)) * 7.5

          const baseYM = (normDepth * 80) + (dipM * 0.5) + wave1 + wave2 - basinDepress
          const clampedYM = Math.max(2, Math.min(78, baseYM))

          const px = toPxX(xM)
          const py = toPxY(clampedYM)

          if (s === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }

        // Contour line style: reacts to step and spotlight proximity
        const distToSpot = Math.hypot(spotCenterPxX - (padL + mapW * 0.5), spotCenterPxY - toPxY(normDepth * 80))
        const isSpotlighted = distToSpot < spotRadiusPx * 1.4

        if (step === 0 && depth >= 10 && depth <= 16) {
          // Stage 01: Dashed contours in the unexplored void
          ctx.setLineDash([4, 6])
          ctx.strokeStyle = "rgba(250, 217, 186, 0.22)"
          ctx.lineWidth = 1
        } else if (step === 1 && isFaultZone) {
          // Stage 02: Highlight steep fault gradient in vivid coral amber
          ctx.setLineDash([])
          ctx.strokeStyle = "rgba(231, 111, 81, 0.75)"
          ctx.lineWidth = 1.8
        } else if (step === 2 && depth >= 13 && depth <= 16) {
          // Stage 03: Highlight bearing stratum top contour around Spot 2 in radiant emerald
          ctx.setLineDash([])
          ctx.strokeStyle = "rgba(16, 185, 129, 0.85)"
          ctx.lineWidth = 2.0
        } else {
          ctx.setLineDash([])
          ctx.strokeStyle = isSpotlighted
            ? "rgba(250, 217, 186, 0.35)"
            : "rgba(239, 231, 222, 0.12)"
          ctx.lineWidth = 1
        }

        ctx.stroke()
        ctx.setLineDash([])

        // Contour elevation labels at left border
        ctx.fillStyle = isFaultZone && step === 1 ? "#E76F51" : "rgba(239, 231, 222, 0.4)"
        ctx.font = "9px monospace"
        ctx.textAlign = "right"
        ctx.fillText(`-${depth}.0m`, padL - 6, toPxY(normDepth * 80) + 3)
      }

      // 3. Render Top-Down Overhead Spotlight ("disorot dari atas")
      // Soft radial illumination that brightens the strata below it
      const spotGrad = ctx.createRadialGradient(
        spotCenterPxX,
        spotCenterPxY,
        10,
        spotCenterPxX,
        spotCenterPxY,
        spotRadiusPx
      )

      if (step === 0) {
        // Warm ochre spotlight with dark center gap
        spotGrad.addColorStop(0, "rgba(250, 217, 186, 0.24)")
        spotGrad.addColorStop(0.5, "rgba(122, 66, 29, 0.12)")
        spotGrad.addColorStop(1, "rgba(21, 14, 9, 0)")
      } else if (step === 1) {
        // Directional amber/coral illumination highlighting fault gradient
        spotGrad.addColorStop(0, "rgba(231, 111, 81, 0.32)")
        spotGrad.addColorStop(0.55, "rgba(250, 217, 186, 0.14)")
        spotGrad.addColorStop(1, "rgba(21, 14, 9, 0)")
      } else {
        // Intense emerald target illumination over Spot 2
        spotGrad.addColorStop(0, "rgba(16, 185, 129, 0.38)")
        spotGrad.addColorStop(0.45, "rgba(250, 217, 186, 0.18)")
        spotGrad.addColorStop(1, "rgba(21, 14, 9, 0)")
      }

      ctx.fillStyle = spotGrad
      ctx.beginPath()
      ctx.arc(spotCenterPxX, spotCenterPxY, spotRadiusPx, 0, Math.PI * 2)
      ctx.fill()

      // 4. Stage-Specific Motion Graphic Overlays:

      // =======================================================================
      // STAGE 01 OVERLAY: Spatial Data Gap (16.2m Exploration Void Circle)
      // =======================================================================
      if (step === 0 || currentProgress < 0.38) {
        const alpha = Math.max(0, 1 - Math.abs(currentProgress - 0.15) * 3.5)
        const voidCenterPxX = toPxX(60)
        const voidCenterPxY = toPxY(42)
        const voidRadiusPx = (16.2 / 120) * mapW

        // Pulsating Exploration Void Range Ring
        const pulse = 1 + Math.sin(elapsed * 3.2) * 0.04
        ctx.strokeStyle = `rgba(231, 111, 81, ${0.7 * alpha})`
        ctx.lineWidth = 1.5
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(voidCenterPxX, voidCenterPxY, voidRadiusPx * pulse, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])

        // Distance measurement line & label
        ctx.strokeStyle = `rgba(250, 217, 186, ${0.8 * alpha})`
        ctx.beginPath()
        ctx.moveTo(voidCenterPxX, voidCenterPxY)
        ctx.lineTo(voidCenterPxX + voidRadiusPx * pulse, voidCenterPxY)
        ctx.stroke()

        ctx.fillStyle = `rgba(250, 217, 186, ${0.9 * alpha})`
        ctx.font = "bold 10px monospace"
        ctx.textAlign = "center"
        ctx.fillText("R = 16.2m EXPLORATION VOID", voidCenterPxX, voidCenterPxY - voidRadiusPx * pulse - 8)

        ctx.fillStyle = `rgba(231, 111, 81, ${0.85 * alpha})`
        ctx.font = "9px monospace"
        ctx.fillText("0 SOUNDINGS WITHIN 16M", voidCenterPxX, voidCenterPxY + 4)
      }

      // =======================================================================
      // STAGE 02 OVERLAY: Stratigraphic Shift (Fault Plane & Shear Dip Vectors)
      // =======================================================================
      if (step === 1 || (currentProgress >= 0.28 && currentProgress <= 0.72)) {
        const alpha = Math.max(0, 1 - Math.abs(currentProgress - 0.5) * 3.5)

        // Directional Fault Strike Line across site
        ctx.strokeStyle = `rgba(231, 111, 81, ${0.85 * alpha})`
        ctx.lineWidth = 2
        ctx.setLineDash([8, 4])
        ctx.beginPath()
        ctx.moveTo(toPxX(15), toPxY(18))
        ctx.lineTo(toPxX(105), toPxY(68))
        ctx.stroke()
        ctx.setLineDash([])

        // Shear Dip Vector Arrows (perpendicular to fault line)
        const arrowOffsets = [
          [35, 30],
          [55, 42],
          [75, 54],
        ]
        for (const [ax, ay] of arrowOffsets) {
          const px = toPxX(ax)
          const py = toPxY(ay)
          const len = 22
          const angle = Math.atan2(toPxY(68) - toPxY(18), toPxX(105) - toPxX(15)) + Math.PI / 2

          const ex = px + Math.cos(angle) * len
          const ey = py + Math.sin(angle) * len

          ctx.strokeStyle = `rgba(250, 217, 186, ${0.8 * alpha})`
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(ex, ey)
          ctx.stroke()

          // Arrowhead
          ctx.fillStyle = `rgba(250, 217, 186, ${0.8 * alpha})`
          ctx.beginPath()
          ctx.arc(ex, ey, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = `rgba(231, 111, 81, ${0.9 * alpha})`
        ctx.font = "bold 10px monospace"
        ctx.textAlign = "left"
        ctx.fillText("GEOLOGICAL STRIKE & SHEAR DIP →", toPxX(20), toPxY(14))
      }

      // =======================================================================
      // STAGE 03 OVERLAY: Spot 2 Target Lock & Neural Trajectory Convergence
      // =======================================================================
      if (step === 2 || currentProgress > 0.62) {
        const alpha = Math.max(0, Math.min(1, (currentProgress - 0.6) * 3.0))
        const spotPxX = toPxX(68.4)
        const spotPxY = toPxY(44.1)

        // Neural Trajectory Arcs converging from B-01, B-02, B-03 into Spot 2
        for (const p of SITE_POINTS) {
          if (p.isSpot2) continue
          const sx = toPxX(p.xM)
          const sy = toPxY(p.yM)

          ctx.strokeStyle = `rgba(16, 185, 129, ${0.5 * alpha})`
          ctx.lineWidth = 1.2
          ctx.setLineDash([3, 4])
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          // Curved arc toward Spot 2
          const midX = (sx + spotPxX) / 2 + (sy - spotPxY) * 0.15
          const midY = (sy + spotPxY) / 2 - (sx - spotPxX) * 0.15
          ctx.quadraticCurveTo(midX, midY, spotPxX, spotPxY)
          ctx.stroke()
          ctx.setLineDash([])

          // Animated particle moving along the arc into Spot 2
          const u = (elapsed * 0.65 + (p.xM % 3) * 0.3) % 1
          const qx = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * midX + u * u * spotPxX
          const qy = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * midY + u * u * spotPxY

          ctx.fillStyle = `rgba(250, 217, 186, ${0.95 * alpha})`
          ctx.beginPath()
          ctx.arc(qx, qy, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }

        // Multi-ring Reticle Target Lock over Spot 2
        const reticlePulse = 1 + Math.sin(elapsed * 4.5) * 0.12
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.95 * alpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(spotPxX, spotPxY, 18 * reticlePulse, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = `rgba(250, 217, 186, ${0.85 * alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(spotPxX, spotPxY, 28 * reticlePulse, 0, Math.PI * 2)
        ctx.stroke()

        // Reticle Crosshairs (+)
        const arm = 34
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.9 * alpha})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(spotPxX - arm, spotPxY)
        ctx.lineTo(spotPxX - 10, spotPxY)
        ctx.moveTo(spotPxX + 10, spotPxY)
        ctx.lineTo(spotPxX + arm, spotPxY)
        ctx.moveTo(spotPxX, spotPxY - arm)
        ctx.lineTo(spotPxX, spotPxY - 10)
        ctx.moveTo(spotPxX, spotPxY + 10)
        ctx.lineTo(spotPxX, spotPxY + arm)
        ctx.stroke()

        // Precision Telemetry Label
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
        ctx.font = "bold 10px monospace"
        ctx.textAlign = "left"
        ctx.fillText("TARGET LOCKED: SPOT 2", spotPxX + 16, spotPxY - 14)

        ctx.fillStyle = `rgba(250, 217, 186, ${0.9 * alpha})`
        ctx.font = "9px monospace"
        ctx.fillText("X=68.4m · Y=44.1m · GAIN +14.2%", spotPxX + 16, spotPxY + 2)
      }

      // 5. Draw Existing Sounding Collars (B-01, B-02, B-03, and Spot 2)
      for (const pt of SITE_POINTS) {
        const px = toPxX(pt.xM)
        const py = toPxY(pt.yM)

        if (pt.isSpot2) {
          // Spot 2 point marker
          ctx.fillStyle = "#10B981"
          ctx.beginPath()
          ctx.arc(px, py, 4.5, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Existing borehole collar
          ctx.fillStyle = "#EFE7DE"
          ctx.beginPath()
          ctx.arc(px, py, 3.5, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = "#5A3008"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(px, py, 6.5, 0, Math.PI * 2)
          ctx.stroke()

          // Borehole label tag
          ctx.fillStyle = "rgba(239, 231, 222, 0.7)"
          ctx.font = "9px monospace"
          ctx.textAlign = "center"
          ctx.fillText(pt.label, px, py - 9)
        }
      }

      // 6. Draw Site Frame & Coordinate Axis Labels
      ctx.strokeStyle = "rgba(239, 231, 222, 0.25)"
      ctx.lineWidth = 1
      ctx.strokeRect(padL, padT, mapW, mapH)

      // Corner Hairlines (+)
      const markLen = 6
      const corners = [
        [padL, padT],
        [padL + mapW, padT],
        [padL, padT + mapH],
        [padL + mapW, padT + mapH],
      ]
      ctx.strokeStyle = "#FAD9BA"
      ctx.lineWidth = 1.5
      for (const [cx, cy] of corners) {
        ctx.beginPath()
        ctx.moveTo(cx - markLen, cy)
        ctx.lineTo(cx + markLen, cy)
        ctx.moveTo(cx, cy - markLen)
        ctx.lineTo(cx, cy + markLen)
        ctx.stroke()
      }

      // X-Axis Axis Scale Labels (Bottom)
      ctx.fillStyle = "rgba(239, 231, 222, 0.45)"
      ctx.font = "9px monospace"
      ctx.textAlign = "center"
      for (let xm = 0; xm <= 120; xm += 30) {
        ctx.fillText(`${xm}m`, toPxX(xm), padT + mapH + 16)
      }
      ctx.fillText("EASTING (X) →", padL + mapW / 2, padT + mapH + 30)

      // Y-Axis Axis Scale Labels (Left)
      ctx.textAlign = "right"
      for (let ym = 0; ym <= 80; ym += 20) {
        ctx.fillText(`${ym}m`, padL - 8, toPxY(ym) + 3)
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
    <div className="relative w-full h-full min-h-[420px] bg-[#150E09] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-label="Top-down Topographic Motion Graphic of Subsurface Strata and Sounding Selection"
      />
    </div>
  )
}

import { useEffect, useRef } from "react"

interface FullWidthTopographicBackgroundProps {
  scrollProgress: number // 0.0 to 1.0 within Section 02
  activeStep: number // 0, 1, or 2
}

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

      currentProg += (targetProg - currentProg) * 0.08

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.width
      const h = canvas.height

      ctx.save()
      ctx.scale(dpr, dpr)
      const logicalW = w / dpr
      const logicalH = h / dpr

      // 1. Ambient Background Atmosphere Transition (Rapidkert style)
      // Step 0: Warm architectural earth tone (#1F1813)
      // Step 1: Rich subterranean charcoal (#18110C)
      // Step 2: Deep geodetic umber (#120B07)
      let bgR = 31
      let bgG = 24
      let bgB = 19
      if (currentProg > 0.33 && currentProg <= 0.66) {
        const t = (currentProg - 0.33) / 0.33
        bgR = Math.round(31 + (24 - 31) * t)
        bgG = Math.round(24 + (17 - 24) * t)
        bgB = Math.round(19 + (12 - 19) * t)
      } else if (currentProg > 0.66) {
        const t = (currentProg - 0.66) / 0.34
        bgR = Math.round(24 + (18 - 24) * t)
        bgG = Math.round(17 + (11 - 17) * t)
        bgB = Math.round(12 + (7 - 12) * t)
      }

      ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`
      ctx.fillRect(0, 0, logicalW, logicalH)

      // Subtle atmospheric overhead vignette spotlight
      const spotGrad = ctx.createRadialGradient(
        logicalW * (step === 2 ? 0.72 : 0.55),
        logicalH * (step === 1 ? 0.42 : 0.5),
        20,
        logicalW * 0.55,
        logicalH * 0.5,
        logicalW * 0.65
      )
      spotGrad.addColorStop(0, "rgba(250, 217, 186, 0.08)")
      spotGrad.addColorStop(0.6, "rgba(90, 48, 8, 0.04)")
      spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = spotGrad
      ctx.fillRect(0, 0, logicalW, logicalH)

      // 2. Continuous Full-Width Subsurface Strata Horizons (Spanning 0 to 100vw across bottom half!)
      // As shown in Rapidkert Image 1 & 2: Undulating soil layers across the bottom half of the screen
      const strataLayers = [
        { name: "Topsoil / Fill", color: "#36271D", strokeColor: "rgba(250, 217, 186, 0.25)", baseYRatio: 0.62 },
        { name: "Firm Silty Sand", color: "#2B1E15", strokeColor: "rgba(239, 231, 222, 0.18)", baseYRatio: 0.71 },
        { name: "Soft Marine Clay", color: "#221710", strokeColor: "rgba(231, 111, 81, 0.35)", baseYRatio: 0.81 },
        { name: "Dense Bearing Sand", color: "#19100A", strokeColor: "rgba(16, 185, 129, 0.4)", baseYRatio: 0.91 },
      ]

      for (let lIdx = 0; lIdx < strataLayers.length; lIdx++) {
        const layer = strataLayers[lIdx]
        const baseY = logicalH * layer.baseYRatio

        ctx.beginPath()
        ctx.moveTo(0, logicalH)

        const segs = 60
        for (let i = 0; i <= segs; i++) {
          const fx = i / segs
          const x = fx * logicalW

          // Morph wave based on step:
          // Step 0: Gentle rolling landscape wave
          // Step 1: Steep fault dip downward from left to right (fault shear zone)
          // Step 2: Smooth basin depression centered at Spot 2 (x ~ 0.7 * logicalW)
          let wave = Math.sin(fx * Math.PI * 2.2 + lIdx * 0.7 + elapsed * 0.2) * 14
          wave += Math.cos(fx * Math.PI * 4.0 - lIdx * 0.4) * 6

          if (step === 1) {
            // Fault dip: layers plunge 48px deeper toward the right
            const faultDip = (fx * 48) + Math.sin(fx * Math.PI * 3.5) * 16
            wave += faultDip
          } else if (step === 2) {
            // Basin depression under Spot 2 (fx ~ 0.72)
            const distSpot = Math.abs(fx - 0.72)
            const basinDrop = Math.exp(-((distSpot * distSpot) / 0.04)) * 32
            wave += basinDrop * (lIdx >= 2 ? 1.2 : 0.6)
          }

          const y = baseY + wave
          if (i === 0) ctx.lineTo(0, y)
          else ctx.lineTo(x, y)
        }

        ctx.lineTo(logicalW, logicalH)
        ctx.closePath()

        ctx.fillStyle = layer.color
        ctx.fill()

        ctx.strokeStyle = layer.strokeColor
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      // Vertical architectural elevation ticks (as seen in Rapidkert Image 1 with ↑ / ↓ marks)
      const tickXs = [0.12, 0.32, 0.54, 0.74, 0.92]
      ctx.strokeStyle = "rgba(250, 217, 186, 0.2)"
      ctx.fillStyle = "rgba(250, 217, 186, 0.4)"
      ctx.lineWidth = 1

      for (const rx of tickXs) {
        const x = logicalW * rx
        const topY = logicalH * 0.56
        const botY = logicalH * 0.64

        ctx.beginPath()
        ctx.moveTo(x, topY)
        ctx.lineTo(x, botY)
        ctx.stroke()

        // Tiny arrowheads
        ctx.beginPath()
        ctx.moveTo(x - 3, topY + 5)
        ctx.lineTo(x, topY)
        ctx.lineTo(x + 3, topY + 5)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x - 3, botY - 5)
        ctx.lineTo(x, botY)
        ctx.lineTo(x + 3, botY - 5)
        ctx.stroke()
      }

      // =======================================================================
      // STAGE 01 OVERLAY: Spatial Exploration Gap (16.2m Exploration Void Circle)
      // =======================================================================
      if (step === 0 || currentProg < 0.38) {
        const alpha = Math.max(0, 1 - Math.abs(currentProg - 0.15) * 3.2)
        const voidX = logicalW * 0.68
        const voidY = logicalH * 0.48
        const voidRadius = Math.min(logicalW, logicalH) * 0.22

        // Pulsing exploration void circle across the strata
        const pulse = 1 + Math.sin(elapsed * 2.8) * 0.04
        ctx.strokeStyle = `rgba(231, 111, 81, ${0.75 * alpha})`
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.arc(voidX, voidY, voidRadius * pulse, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])

        // Subtle radial fill inside void
        const voidFill = ctx.createRadialGradient(voidX, voidY, 10, voidX, voidY, voidRadius * pulse)
        voidFill.addColorStop(0, `rgba(231, 111, 81, ${0.12 * alpha})`)
        voidFill.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = voidFill
        ctx.beginPath()
        ctx.arc(voidX, voidY, voidRadius * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Radius measurement leader line & tag
        ctx.strokeStyle = `rgba(250, 217, 186, ${0.7 * alpha})`
        ctx.beginPath()
        ctx.moveTo(voidX, voidY)
        ctx.lineTo(voidX + voidRadius * pulse, voidY)
        ctx.stroke()

        // Architectural label tag
        ctx.fillStyle = `rgba(250, 217, 186, ${0.85 * alpha})`
        ctx.font = "bold 11px monospace"
        ctx.textAlign = "center"
        ctx.fillText("R = 16.2M EXPLORATION VOID", voidX, voidY - voidRadius * pulse - 12)

        ctx.fillStyle = `rgba(231, 111, 81, ${0.85 * alpha})`
        ctx.font = "9px monospace"
        ctx.fillText("ZERO SOUNDINGS WITHIN 16.0M RADIUS", voidX, voidY + 4)

        // Existing borehole collars flanking the void (B-01, B-02, B-03)
        const boreholes = [
          { label: "B-01 (-24.5M)", x: logicalW * 0.42, y: logicalH * 0.38 },
          { label: "B-03 (-22.8M)", x: logicalW * 0.88, y: logicalH * 0.36 },
          { label: "B-02 (-25.0M)", x: logicalW * 0.78, y: logicalH * 0.72 },
        ]
        for (const bh of boreholes) {
          ctx.fillStyle = `rgba(239, 231, 222, ${0.9 * alpha})`
          ctx.beginPath()
          ctx.arc(bh.x, bh.y, 4, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = `rgba(250, 217, 186, ${0.6 * alpha})`
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(bh.x, bh.y, 7, 0, Math.PI * 2)
          ctx.stroke()

          ctx.fillStyle = `rgba(239, 231, 222, ${0.65 * alpha})`
          ctx.font = "9px monospace"
          ctx.textAlign = "center"
          ctx.fillText(bh.label, bh.x, bh.y - 12)
        }
      }

      // =======================================================================
      // STAGE 02 OVERLAY: Fault Boundary Dip & Horizontal Shear Line (Rapidkert Image 2 style)
      // =======================================================================
      if (step === 1 || (currentProg >= 0.28 && currentProg <= 0.72)) {
        const alpha = Math.max(0, 1 - Math.abs(currentProg - 0.5) * 3.2)

        // Horizontal dashed geodetic datum line across the screen (like Rapidkert's blue irrigation line!)
        const datumY = logicalH * 0.45
        ctx.strokeStyle = `rgba(231, 111, 81, ${0.8 * alpha})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(logicalW * 0.35, datumY)
        ctx.lineTo(logicalW * 0.98, datumY + 36)
        ctx.stroke()

        // Circular junction nodes along datum line
        const datumNodes = [0.42, 0.62, 0.82]
        for (const nx of datumNodes) {
          const px = logicalW * nx
          const py = datumY + (nx - 0.35) * 55
          ctx.fillStyle = `rgba(231, 111, 81, ${0.9 * alpha})`
          ctx.beginPath()
          ctx.arc(px, py, 6, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = `rgba(250, 217, 186, ${0.6 * alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(px, py, 11, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Leader Line & Floating Annotation (Rapidkert style)
        const leaderX = logicalW * 0.62
        const leaderY = datumY + (0.62 - 0.35) * 55
        ctx.strokeStyle = `rgba(250, 217, 186, ${0.6 * alpha})`
        ctx.beginPath()
        ctx.moveTo(leaderX, leaderY)
        ctx.lineTo(leaderX + 45, leaderY - 45)
        ctx.lineTo(leaderX + 160, leaderY - 45)
        ctx.stroke()

        ctx.fillStyle = `rgba(250, 217, 186, ${0.9 * alpha})`
        ctx.font = "bold 10px monospace"
        ctx.textAlign = "left"
        ctx.fillText("FAULT SHEAR BOUNDARY (-8.5M)", leaderX + 50, leaderY - 50)

        ctx.fillStyle = `rgba(231, 111, 81, ${0.85 * alpha})`
        ctx.font = "9px monospace"
        ctx.fillText("DIPPING CLEAN SAND → SOFT MARINE CLAY", leaderX + 50, leaderY - 34)
      }

      // =======================================================================
      // STAGE 03 OVERLAY: Spot 2 Concentric Contour Ellipses & Telemetry Rays (Rapidkert Image 3 style!)
      // =======================================================================
      if (step === 2 || currentProg > 0.62) {
        const alpha = Math.max(0, Math.min(1, (currentProg - 0.6) * 3.0))
        const targetX = logicalW * 0.72
        const targetY = logicalH * 0.44

        // Concentric Topographic Moisture / Variance Reduction Ellipses
        // (Exactly like the wetting zone ellipses in Rapidkert screenshot 3!)
        const ellipseCount = 4
        for (let e = 1; e <= ellipseCount; e++) {
          const radX = e * 65 * (1 + Math.sin(elapsed * 2.5 + e * 0.5) * 0.03)
          const radY = radX * 0.48

          ctx.strokeStyle = `rgba(16, 185, 129, ${0.28 * alpha * (1 - e / 5)})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.ellipse(targetX, targetY, radX, radY, -0.12, 0, Math.PI * 2)
          ctx.stroke()

          // Subtle gradient tint for innermost ellipse
          if (e === 1) {
            ctx.fillStyle = `rgba(16, 185, 129, ${0.1 * alpha})`
            ctx.fill()
          }
        }

        // Triangular Telemetry Rays radiating down from the top edge into Spot 2
        // (Exactly like the sensor rays in Rapidkert screenshot 3!)
        const rayOrigins = [
          logicalW * 0.55,
          logicalW * 0.72,
          logicalW * 0.88,
        ]
        ctx.strokeStyle = `rgba(250, 217, 186, ${0.35 * alpha})`
        ctx.lineWidth = 1
        for (const rx of rayOrigins) {
          ctx.beginPath()
          ctx.moveTo(rx, 0)
          ctx.lineTo(targetX, targetY)
          ctx.stroke()
        }

        // High-Precision Targeting Reticle on Spot 2
        const pulse = 1 + Math.sin(elapsed * 4.2) * 0.08
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
        ctx.beginPath()
        ctx.arc(targetX, targetY, 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = `rgba(16, 185, 129, ${0.9 * alpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(targetX, targetY, 18 * pulse, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = `rgba(250, 217, 186, ${0.75 * alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(targetX, targetY, 32 * pulse, 0, Math.PI * 2)
        ctx.stroke()

        // Leader Line & Telemetry Callout (Rapidkert Image 3 style: DRIP LINE / WETTING ZONE)
        ctx.strokeStyle = `rgba(250, 217, 186, ${0.7 * alpha})`
        ctx.beginPath()
        ctx.moveTo(targetX, targetY)
        ctx.lineTo(targetX + 50, targetY - 45)
        ctx.lineTo(targetX + 180, targetY - 45)
        ctx.stroke()

        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
        ctx.font = "bold 11px monospace"
        ctx.textAlign = "left"
        ctx.fillText("TARGET RETICLE: SPOT 2", targetX + 55, targetY - 52)

        ctx.fillStyle = `rgba(250, 217, 186, ${0.85 * alpha})`
        ctx.font = "9px monospace"
        ctx.fillText("X=68.4M · Y=44.1M · GAIN +14.2%", targetX + 55, targetY - 36)

        ctx.fillStyle = `rgba(239, 231, 222, ${0.5 * alpha})`
        ctx.font = "9px monospace"
        ctx.fillText("MAXIMUM VARIANCE REDUCTION ZONE", targetX - 110, targetY + 65)
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

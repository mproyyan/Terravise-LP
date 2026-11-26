import { useEffect, useState } from "react"
import {
  AUTOSCROLL_STORAGE_KEY,
  AUTOSCROLL_EVENT_NAME,
  getAutoScrollEnabled,
} from "../../lib/autoScroll"

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Computes all vertical section stops on the landing page in DOM order.
 */
function computeSectionStops(): number[] {
  const navbarHeight = 56
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  )
  const rawStops: number[] = [0]

  const sectionEls = Array.from(
    document.querySelectorAll<HTMLElement>("#main-content section")
  )

  for (let i = 0; i < sectionEls.length; i++) {
    const el = sectionEls[i]
    const rect = el.getBoundingClientRect()
    const absTop = Math.max(
      0,
      Math.min(
        maxScroll,
        Math.round(rect.top + window.scrollY - (i === 0 ? 0 : navbarHeight))
      )
    )
    rawStops.push(absTop)

    // For tall scroll-driven sections (e.g. Section 05 Workflow), add intermediate pauses
    const stepSize = Math.round(window.innerHeight * 0.82)
    if (el.offsetHeight > window.innerHeight * 1.45 && stepSize > 200) {
      let cursor = absTop + stepSize
      const sectionBottomStop = Math.min(
        maxScroll,
        Math.round(absTop + el.offsetHeight - window.innerHeight * 0.85)
      )
      while (cursor < sectionBottomStop - 120) {
        rawStops.push(cursor)
        cursor += stepSize
      }
      if (sectionBottomStop > absTop + 160) {
        rawStops.push(sectionBottomStop)
      }
    }
  }

  rawStops.push(maxScroll)
  rawStops.sort((a, b) => a - b)

  // Deduplicate stops that are very close together (< 90px apart)
  const deduped: number[] = []
  for (const stop of rawStops) {
    if (
      deduped.length === 0 ||
      Math.abs(stop - deduped[deduped.length - 1]) >= 90
    ) {
      deduped.push(stop)
    }
  }

  return deduped
}

/**
 * Headless controller mounted on the Landing Page (/).
 * When Auto-Scroll mode is enabled (via /feedback/admin or ?autoscroll=on),
 * it pauses at each section, smoothly glides to the next section, and
 * smoothly scrolls back to the top after reaching the bottom.
 */
export function LandingAutoScrollController() {
  const [enabled, setEnabled] = useState<boolean>(() => getAutoScrollEnabled())

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTOSCROLL_STORAGE_KEY) {
        setEnabled(e.newValue === "true")
      }
    }

    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ enabled: boolean }>
      if (custom.detail && typeof custom.detail.enabled === "boolean") {
        setEnabled(custom.detail.enabled)
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener(AUTOSCROLL_EVENT_NAME, handleCustomEvent)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener(AUTOSCROLL_EVENT_NAME, handleCustomEvent)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const PAUSE_AT_SECTION_MS = 4200
    const DOWN_SCROLL_DURATION_MS = 1900
    const RETURN_TO_TOP_DURATION_MS = 3200

    let isCancelled = false
    let pauseTimeoutId: number | null = null
    let rafId: number | null = null

    const clearTimers = () => {
      if (pauseTimeoutId !== null) {
        window.clearTimeout(pauseTimeoutId)
        pauseTimeoutId = null
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    const scheduleNextStop = (delayMs = PAUSE_AT_SECTION_MS) => {
      clearTimers()
      if (isCancelled) return

      pauseTimeoutId = window.setTimeout(() => {
        if (isCancelled) return

        const stops = computeSectionStops()
        if (stops.length <= 1) {
          scheduleNextStop(PAUSE_AT_SECTION_MS)
          return
        }

        const currentY = window.scrollY
        const maxScroll = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        )

        // Determine if we have reached the bottom of the page
        const isAtBottom = currentY >= maxScroll - 40
        const nextStop = !isAtBottom
          ? stops.find((s) => s > currentY + 45)
          : undefined
        const targetY = nextStop !== undefined ? nextStop : 0

        const startY = window.scrollY
        const distance = targetY - startY
        if (Math.abs(distance) < 5) {
          scheduleNextStop(PAUSE_AT_SECTION_MS)
          return
        }

        const isReturningToTop = targetY === 0 && startY > 200
        const duration = isReturningToTop
          ? RETURN_TO_TOP_DURATION_MS
          : DOWN_SCROLL_DURATION_MS

        const startTime = performance.now()

        const animateScroll = (now: number) => {
          if (isCancelled) return
          const elapsed = now - startTime
          const t = Math.min(1, elapsed / duration)
          const eased = easeInOutCubic(t)

          window.scrollTo(0, startY + distance * eased)

          if (t < 1) {
            rafId = window.requestAnimationFrame(animateScroll)
          } else {
            rafId = null
            scheduleNextStop(PAUSE_AT_SECTION_MS)
          }
        }

        rafId = window.requestAnimationFrame(animateScroll)
      }, delayMs)
    }

    // If someone manually wheels or touches the screen, pause briefly and resume smoothly
    const handleManualInterrupt = () => {
      scheduleNextStop(5000)
    }

    window.addEventListener("wheel", handleManualInterrupt, { passive: true })
    window.addEventListener("touchstart", handleManualInterrupt, {
      passive: true,
    })

    scheduleNextStop(PAUSE_AT_SECTION_MS)

    return () => {
      isCancelled = true
      clearTimers()
      window.removeEventListener("wheel", handleManualInterrupt)
      window.removeEventListener("touchstart", handleManualInterrupt)
    }
  }, [enabled])

  return null
}

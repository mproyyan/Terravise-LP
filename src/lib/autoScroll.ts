export const AUTOSCROLL_STORAGE_KEY = "terravise_landing_autoscroll"
export const AUTOSCROLL_EVENT_NAME = "terravise:autoscroll-change"

export function getAutoScrollEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    const params = new URLSearchParams(window.location.search)
    const paramVal = params.get("autoscroll")
    if (paramVal === "1" || paramVal === "on" || paramVal === "true") {
      localStorage.setItem(AUTOSCROLL_STORAGE_KEY, "true")
      return true
    }
    if (paramVal === "0" || paramVal === "off" || paramVal === "false") {
      localStorage.setItem(AUTOSCROLL_STORAGE_KEY, "false")
      return false
    }
    return localStorage.getItem(AUTOSCROLL_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

export function setAutoScrollEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(AUTOSCROLL_STORAGE_KEY, enabled ? "true" : "false")
    window.dispatchEvent(
      new CustomEvent(AUTOSCROLL_EVENT_NAME, { detail: { enabled } })
    )
  } catch {
    // ignore storage errors
  }
}

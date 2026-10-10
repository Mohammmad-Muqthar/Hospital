/**
 * Fit scale of the workspace window, from the fit box's size and the design
 * size of the current breakpoint (--rw-dw / --rw-dh / --rw-max, set in
 * CRMWorkspace.css: the desktop window is 800 × 520 (800 × 472 on the
 * shortest pinned frames, 700 × 520 with the tablet icon rail), the phone window
 * 340 × 452). Shared by the fit hook and the pinned scene, so both always
 * agree on the window's resting size.
 */
export function measureFit(fitEl) {
  const cs = getComputedStyle(fitEl)
  const dw = parseFloat(cs.getPropertyValue('--rw-dw')) || 800
  const dh = parseFloat(cs.getPropertyValue('--rw-dh')) || 520
  const max = parseFloat(cs.getPropertyValue('--rw-max')) || 1
  const cw = fitEl.clientWidth
  const ch = fitEl.clientHeight
  if (!cw || !ch) return null
  const s = Math.max(0.3, Math.round(Math.min(cw / dw, ch / dh, max) * 1000) / 1000)
  return { s, width: dw * s, height: dh * s }
}

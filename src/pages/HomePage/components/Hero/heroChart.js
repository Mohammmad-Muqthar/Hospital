/**
 * Pure helpers that turn the sample series in mockDashboard.js into SVG
 * paths. Everything is computed once at module load (deterministic output,
 * nothing random, nothing time-based).
 */

/** Map a series to points inside a w×h box (y grows downwards). */
export function toPoints(values, { width, height, min = 0, max, padTop = 0, padBottom = 0 }) {
  const top = padTop
  const span = height - padTop - padBottom
  const hi = max ?? Math.max(...values)
  const lo = min
  const step = values.length > 1 ? width / (values.length - 1) : 0
  return values.map((v, i) => [i * step, top + span - ((v - lo) / (hi - lo || 1)) * span])
}

const fmt = (n) => Math.round(n * 100) / 100

/**
 * Smooth path through points (monotone-ish Catmull-Rom → cubic Bézier with
 * a reduced tension so the curve never overshoots dramatically).
 */
export function smoothPath(points, tension = 0.18) {
  if (points.length < 2) return ''
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) * tension
    const c1y = p1[1] + (p2[1] - p0[1]) * tension
    const c2x = p2[0] - (p3[0] - p1[0]) * tension
    const c2y = p2[1] - (p3[1] - p1[1]) * tension
    d += ` C${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2[0])} ${fmt(p2[1])}`
  }
  return d
}

/** Line + closed area path for a series. */
export function seriesPaths(values, box) {
  const points = toPoints(values, box)
  const line = smoothPath(points)
  const last = points[points.length - 1]
  const area = `${line} L${fmt(last[0])} ${box.height} L0 ${box.height} Z`
  return { line, area, points }
}

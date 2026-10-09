/**
 * Keeps the hero copy (h1 + lead + CTAs) inside the pinned cinematic stage.
 *
 * The stage is exactly one viewport tall and clips its content. With the
 * designed type it always fits; but user text settings — WCAG 1.4.12 text
 * spacing, a larger default font size — can make the copy taller than the
 * space below the navbar, and the CTAs would then be cut off. In that case
 * the headline (the only display-size element) is set just small enough for
 * everything to fit, via `--hero-title-fit` (1 = designed size); the lead
 * and the CTAs keep their size so the reading text stays as the user wants
 * it. Re-evaluated whenever the copy or the stage changes size.
 *
 * Layout only (font size, never transforms), so it is independent of the
 * scroll timeline; offsets are read, so transforms in flight don't matter.
 */
const MIN_FIT = 0.5
/** Breathing room kept above and below the copy inside the stage. */
const MARGIN = 16

export function fitHeroCopy(root) {
  const copy = root.querySelector('.hero__copy')
  const title = root.querySelector('.hero__title')
  const lead = root.querySelector('.hero__lead')
  const ctas = root.querySelector('.hero__ctas')
  if (!copy || !title || !ctas) return () => {}

  const setFit = (f) => {
    if (f >= 0.999) title.style.removeProperty('--hero-title-fit')
    else title.style.setProperty('--hero-title-fit', f.toFixed(3))
  }

  const fit = () => {
    // Start from the designed size every time, so the headline grows back
    // when the user's settings no longer need the reduction.
    setFit(1)
    const cs = getComputedStyle(copy)
    const available =
      copy.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 2 * MARGIN
    let f = 1
    // Shrinking only (monotonic), so this converges; a few passes absorb
    // headline lines that re-wrap at the smaller size.
    for (let pass = 0; pass < 4; pass++) {
      const used = ctas.offsetTop + ctas.offsetHeight - title.offsetTop
      if (used <= available) break
      const titleH = title.offsetHeight
      const rest = used - titleH
      const next = Math.max(MIN_FIT, (f * (available - rest)) / titleH)
      if (next >= f - 0.002) break
      f = next
      setFit(f)
    }
  }

  // Coalesce observer bursts into one pass per frame. Changing the font size
  // inside the frame callback (not inside the observer callback) avoids
  // ResizeObserver loop notifications.
  let frame = 0
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0
      fit()
    })
  }
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null
  observer?.observe(copy)
  observer?.observe(title)
  if (lead) observer?.observe(lead)
  observer?.observe(ctas)

  fit()

  return () => {
    observer?.disconnect()
    cancelAnimationFrame(frame)
    setFit(1)
  }
}

import { CHAMBER, PLATFORM } from '../../../../data/mock/mockSecurity'

/**
 * Scene geometry shared by the markup (rest positions) and the master
 * timeline (offsets from rest). All values are in reference "plane pixels";
 * the whole scene is scaled to its container with the --fit variable.
 *
 * The CSS rest state of every part is the composed FINAL state of the story
 * (also the reduced-motion / no-JS state); the timeline starts elsewhere and
 * travels back to it.
 */
const deckW = PLATFORM.base.w - PLATFORM.plate.inset * 2
const deckD = PLATFORM.base.d - PLATFORM.plate.inset * 2

export const SCENE = {
  /** Reference box the projected scene is fitted into. */
  frame: { w: 820, h: 700 },
  maxFit: 1.12,
  /** Below this fit, billboard labels are scaled up (up to maxLabelScale). */
  labelFit: 0.86,
  maxLabelScale: 1.75,
  /** Extra frame height (reference px) per unit of label up-scaling. */
  labelHeadroom: 110,
  deck: { w: deckW, d: deckD },
  /** Gap between chambers at rest (final state). */
  restGap: 44,
  /** Chamber grid centre on the deck (y leaves room for the support desks). */
  gridCenter: { x: deckW / 2, y: 172 },
  wallInset: 10,
  wallH: 96,
  slab: { w: 128, d: 80, h: 6 },
  /** Revealed heights (relative to the chamber base) of the three data layers. */
  slabZ: [46, 62, 78],
  /** Where each layer tag sits along the slab's left edge (0 back → 1 front). */
  tagAlong: [0.86, 0.5, 0.14],
  /** Collapsed: tucked inside the chamber body (hidden under its roof). */
  slabHiddenZ: 22,
  region: { w: 116, d: 52, h: 18, y: 352, gap: 16 },
  token: { w: 28, d: 28, h: 10 },
}

/** Recessed zones painted on the plate (deck-relative): the tenant grid and the support desk rail. */
SCENE.trays = {
  grid: { left: 50, top: 6, width: deckW - 100, height: 330, borderRadius: 18 },
  desks: { left: 66, top: 344, width: deckW - 132, height: 72, borderRadius: 14 },
}

/** Rest (final) top-left position of a chamber on the deck. */
export function chamberRest({ col, row }) {
  const g = SCENE.restGap
  const { x: cx, y: cy } = SCENE.gridCenter
  return {
    x: col === 0 ? cx - g / 2 - CHAMBER.w : cx + g / 2,
    y: row === 0 ? cy - g / 2 - CHAMBER.d : cy + g / 2,
  }
}

/** x / y offset (from rest) that produces a given gap between chambers. */
export function spreadOffset(el, gap) {
  const d = (gap - SCENE.restGap) / 2
  return {
    x: Number(el.dataset.col) === 0 ? -d : d,
    y: Number(el.dataset.row) === 0 ? -d : d,
  }
}

/** Rest top-left position of a regional support desk. */
export function regionRest(index) {
  const { w, gap, y } = SCENE.region
  const total = w * 3 + gap * 2
  return { x: (deckW - total) / 2 + index * (w + gap), y }
}

/** Centre of the chamber grid relative to a desk's top-left (token travel). */
export function hubOffsetFromRegion(index) {
  const r = regionRest(index)
  const { w, d } = SCENE.token
  const { x: cx, y: cy } = SCENE.gridCenter
  const restX = r.x + (SCENE.region.w - w) / 2
  const restY = r.y + (SCENE.region.d - d) / 2
  return { x: cx - w / 2 - restX, y: cy - d / 2 - restY }
}

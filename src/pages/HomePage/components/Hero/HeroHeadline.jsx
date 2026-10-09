import { HERO } from '../../../../data/siteContent'

const WORDS = HERO.headline.split(' ')
const ACCENT = new Set(HERO.headlineAccent)

/**
 * Narrow-screen line split ("Grow your / hospital sales / with a CRM /
 * that tracks / performance"), derived from the verbatim headline by word
 * index so the copy itself is never retyped. Five short lines let the phone
 * headline stay large (~42px) without any line touching the screen edges.
 */
const NARROW_BREAKS = [2, 4, 7, 9]

function splitAt(words, breaks) {
  const lines = []
  let start = 0
  for (const end of [...breaks, words.length]) {
    lines.push(words.slice(start, end))
    start = end
  }
  return lines
}

const WIDE_LINES = HERO.headlineLines.map((line) => line.split(' '))
const NARROW_LINES = splitAt(WORDS, NARROW_BREAKS)

function Line({ words }) {
  return (
    <span className="hero__line">
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={ACCENT.has(word) ? 'hero__word hero__word--accent' : 'hero__word'}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

/**
 * The page <h1>. Screen readers get the full sentence once; the two visual
 * line layouts (wide / narrow) are aria-hidden and only one is displayed.
 * Each visual line is its own element so the hero timeline can move it
 * through depth independently.
 */
export default function HeroHeadline({ id }) {
  return (
    <h1 id={id} className="hero__title">
      <span className="sr-only">{HERO.headline}</span>
      <span className="hero__lines hero__lines--wide" aria-hidden="true">
        {WIDE_LINES.map((words, i) => (
          <Line key={i} words={words} />
        ))}
      </span>
      <span className="hero__lines hero__lines--narrow" aria-hidden="true">
        {NARROW_LINES.map((words, i) => (
          <Line key={i} words={words} />
        ))}
      </span>
    </h1>
  )
}

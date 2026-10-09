import { Fragment } from 'react'
import { HERO } from '../../../../data/siteContent'

const WORDS = HERO.headline.split(' ')
const ACCENT = new Set(HERO.headlineAccent)

/** Word indexes where a new line starts, from the verbatim desktop split. */
const WIDE_BREAKS = HERO.headlineLines
  .slice(0, -1)
  .reduce((acc, line) => [...acc, (acc.at(-1) ?? 0) + line.split(' ').length], [])

/**
 * Narrow-screen line split ("Grow your / hospital sales / with a CRM /
 * that tracks / performance"), by word index so the copy itself is never
 * retyped. Five short lines let the phone headline stay large (~42px)
 * without any line touching the screen edges.
 */
const NARROW_BREAKS = [2, 4, 7, 9]

/** Line number of word `i` in a layout. */
const lineOf = (breaks, i) => breaks.filter((b) => b <= i).length

/**
 * The page <h1>. The sentence exists exactly once, as real text: every word
 * is its own inline-block (so the hero timeline can move each line through
 * depth — words of one line always share one transform), the spaces are
 * plain text between them, and the line breaks for the wide and narrow
 * layouts are <br> elements that CSS switches on and off. The DOM text,
 * the accessible name and reader / no-CSS views therefore all read the
 * headline once, correctly spaced.
 */
export default function HeroHeadline({ id }) {
  return (
    <h1 id={id} className="hero__title">
      <span className="hero__lines">
        {WORDS.map((word, i) => (
          <Fragment key={i}>
            {WIDE_BREAKS.includes(i) && <br className="hero__br hero__br--wide" />}
            {NARROW_BREAKS.includes(i) && <br className="hero__br hero__br--narrow" />}
            <span
              className={ACCENT.has(word) ? 'hero__word hero__word--accent' : 'hero__word'}
              data-line-wide={lineOf(WIDE_BREAKS, i)}
              data-line-narrow={lineOf(NARROW_BREAKS, i)}
            >
              {word}
            </span>
            {i < WORDS.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </h1>
  )
}

import { motion } from 'motion/react'

/**
 * Shared building blocks for the Features mock-UI illustrations.
 * Every illustration is decorative (its container is aria-hidden), so these
 * render plain spans/divs with no interactive semantics.
 */

/** Mini-UI accent: responds to the parent card's "hover" variant. */
const ACCENT_VARIANTS = {
  rest: { y: 0, boxShadow: '0 0 0 0px rgba(8, 107, 86, 0)' },
  hover: { y: -1, boxShadow: '0 0 0 3px rgba(8, 107, 86, 0.14)' },
}

const ACCENT_TRANSITION = { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }

export function Accent({ as = 'span', className = '', children }) {
  const Tag = as === 'div' ? motion.div : motion.span
  return (
    <Tag className={className} variants={ACCENT_VARIANTS} transition={ACCENT_TRANSITION}>
      {children}
    </Tag>
  )
}

/** Window-style header strip used at the top of larger mock modules. */
export function UiBar({ icon: IconCmp, title, meta, tag, actions }) {
  return (
    <div className="feat-ui-bar">
      <span className="feat-ui-bar__title">
        {IconCmp ? <IconCmp size={13} strokeWidth={2} /> : null}
        {title}
        {meta ? <span className="feat-ui-bar__meta">{meta}</span> : null}
      </span>
      <span className="feat-ui-bar__end">
        {tag ? <span className="feat-ui-tag">{tag}</span> : null}
        {actions ? <span className="feat-ui-bar__actions">{actions}</span> : null}
      </span>
    </div>
  )
}

/** Small rounded-rectangle status/attribute chip (deliberately not a pill). */
export function Chip({ tone = 'neutral', icon: IconCmp, dot = false, className = '', children }) {
  return (
    <span className={`feat-ui-chip feat-ui-chip--${tone} ${className}`}>
      {dot ? <span className="feat-ui-chip__dot" /> : null}
      {IconCmp ? <IconCmp size={12} strokeWidth={2} /> : null}
      {children}
    </span>
  )
}

/** Initials avatar — fictional people are shown by initials only. */
export function Avatar({ initials, tone = 'mint', square = false }) {
  return (
    <span className={`feat-ui-avatar feat-ui-avatar--${tone}${square ? ' feat-ui-avatar--square' : ''}`}>
      {initials}
    </span>
  )
}

/** Tiny five-step signal meter for lead scores. */
export function ScoreMeter({ value }) {
  const filled = Math.round((value / 100) * 5)
  return (
    <span className="feat-ui-meter">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < filled ? 'is-on' : undefined} style={{ height: `${5 + i * 2}px` }} />
      ))}
    </span>
  )
}

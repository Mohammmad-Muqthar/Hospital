/**
 * Small presentational atoms for the decorative CRM workspace mock-up.
 * Everything rendered here lives inside an aria-hidden illustration, so
 * nothing is focusable and nothing is interactive.
 */

/** A module card. `depth` (1–3) controls how far back it enters from in the scroll scene. */
export function Card({ title, meta, depth = 1, area, className = '', children }) {
  return (
    <div className={`rw-mod rw-card ${className}`} data-depth={depth} style={area ? { '--a': area } : undefined}>
      {(title || meta) && (
        <div className="rw-card__head">
          {title && <span className="rw-card__title">{title}</span>}
          {meta && <span className="rw-card__meta">{meta}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

export function Avatar({ initials, tone = 'mint', size = 'md' }) {
  return (
    <span className={`rw-avatar rw-avatar--${tone} rw-avatar--${size}`}>
      {initials}
    </span>
  )
}

/** Small status tag (tones: mint, emerald, neutral, amber, danger). */
export function Tag({ tone = 'neutral', children }) {
  return <span className={`rw-tag rw-tag--${tone}`}>{children}</span>
}

export function Toggle({ on }) {
  return <span className={`rw-toggle${on ? ' is-on' : ''}`} />
}

/** Horizontal meter. `value` is 0–1. */
export function Meter({ value, tone = 'emerald' }) {
  return (
    <span className={`rw-meter rw-meter--${tone}`}>
      <span className="rw-meter__fill" style={{ width: `${Math.round(value * 100)}%` }} />
    </span>
  )
}

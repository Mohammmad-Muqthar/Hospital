import useSiteLink from '../../hooks/useSiteLink'

/**
 * Desktop navigation link.
 *
 * Hover: the link lifts 2px while its label rises through a clipped mask —
 * the resting label exits upward and an identical copy rises into place.
 * The copy is aria-hidden, so the accessible name stays a single label.
 */
export default function NavLink({ item, active = false, linkRef }) {
  const { href, onClick } = useSiteLink(item.target)

  return (
    <a
      ref={linkRef}
      className="nav__link"
      href={href}
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      data-active={active ? '' : undefined}
    >
      <span className="nav__link-mask">
        <span className="nav__link-text">{item.label}</span>
        <span className="nav__link-text nav__link-text--rise" aria-hidden="true">
          {item.label}
        </span>
      </span>
    </a>
  )
}

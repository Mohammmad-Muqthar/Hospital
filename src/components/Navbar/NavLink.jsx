import useSiteLink from '../../hooks/useSiteLink'

/**
 * Desktop navigation link.
 *
 * Hover: the link lifts 2px while its label rises through a clipped mask —
 * the resting label exits upward and an identical copy rises into place.
 * The copy is CSS-generated content with empty alternative text, so the
 * label appears once in the DOM and in the accessible name.
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
      {/* The rising copy is a ::after generated from data-label (with empty
          alt text), so the label exists once in the DOM, find-in-page and
          the accessible name. */}
      <span className="nav__link-mask" data-label={item.label}>
        <span className="nav__link-text">{item.label}</span>
      </span>
    </a>
  )
}

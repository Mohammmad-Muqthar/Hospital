import { NAV_ITEMS } from '../../data/siteContent'
import { resolveHref } from '../../hooks/useSiteLink'
import './Navbar.css'

/** Placeholder — replaced by the Navbar implementation. */
export default function Navbar() {
  return (
    <header className="nav-stub">
      <nav aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <a key={item.label} href={resolveHref(item.target)}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { NAV_ACTIONS, NAV_ITEMS } from '../../data/siteContent'
import { SECTION_IDS } from '../../config/site'
import { MQ } from '../../lib/gsap'
import BrandLogo from '../ui/BrandLogo'
import useMediaQuery from '../../hooks/useMediaQuery'
import useSiteLink from '../../hooks/useSiteLink'
import PrimaryNav from './PrimaryNav'
import NavCta from './NavCta'
import MobileMenu from './MobileMenu'
import useScrolledPast from './useScrolledPast'
import useActiveSection from './useActiveSection'
import useBodyScrollLock from './useBodyScrollLock'
import './Navbar.css'

const MENU_ID = 'nav-menu'

/** In-page sections that have a navbar link (Support is a route). */
const TRACKED_SECTIONS = NAV_ITEMS.filter((item) => item.target in SECTION_IDS).map(
  (item) => SECTION_IDS[item.target],
)

function HomeLink() {
  const { href, onClick } = useSiteLink('top')
  return (
    <a className="nav__brand" href={href} onClick={onClick} aria-label="Trionix Hospital — home">
      <span className="nav__brand-mark">
        <BrandLogo height={40} />
      </span>
    </a>
  )
}

function SignInLink({ action }) {
  const { href, onClick } = useSiteLink(action.target)
  return (
    <a className="nav__signin" href={href} onClick={onClick}>
      <span>{action.label}</span>
      <span className="nav__signin-arrow" aria-hidden="true">
        <ArrowRight size={16} strokeWidth={2} />
      </span>
    </a>
  )
}

/**
 * Fixed site header.
 *
 * Desktop (≥1024px): logo | centered primary nav | Sign in + Start trial, on
 * a true 1fr / auto / 1fr grid. Mobile & tablet: logo + hamburger opening a
 * full-screen modal menu.
 *
 * Over the hero it is a light top-down scrim; after ~12px of scroll it
 * becomes a defined translucent dark bar. Scroll state and active section
 * come from IntersectionObservers — no ScrollTriggers, no per-frame state.
 */
export default function Navbar() {
  const isDesktop = useMediaQuery(MQ.desktop)
  const [scrolled, sentinelRef] = useScrolledPast(12)
  const activeId = useActiveSection(TRACKED_SECTIONS)

  const [menuOpen, setMenuOpen] = useState(false)
  // The menu only exists below the desktop breakpoint: close it if the
  // viewport grows (state adjusted during render, no effect needed).
  if (menuOpen && isDesktop) setMenuOpen(false)

  const toggleRef = useRef(null)
  const releaseScrollLock = useBodyScrollLock(menuOpen)

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Return focus to the hamburger after closing — only if focus was inside
  // the menu (or lost), never stealing it from somewhere the user moved it.
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (wasOpenRef.current && !menuOpen) {
      const current = document.activeElement
      const focusWasInMenu = !current || current === document.body || current.closest?.(`#${MENU_ID}`)
      if (focusWasInMenu) toggleRef.current?.focus({ preventScroll: true })
    }
    wasOpenRef.current = menuOpen
  }, [menuOpen])

  return (
    <>
      <span ref={sentinelRef} className="nav-sentinel" aria-hidden="true" />
      <header className="nav" data-scrolled={scrolled ? 'true' : 'false'}>
        <div className="nav__scrim" aria-hidden="true" />
        <div className="nav__bar" aria-hidden="true" />

        <div className="nav__inner" inert={menuOpen || undefined}>
          <HomeLink />

          <PrimaryNav items={NAV_ITEMS} activeId={activeId} />

          <div className="nav__actions">
            <SignInLink action={NAV_ACTIONS.signIn} />
            <NavCta>{NAV_ACTIONS.trial.label}</NavCta>
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="nav-burger nav__toggle"
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={menuOpen ? closeMenu : openMenu}
          >
            <span className="nav-burger__line nav-burger__line--top" />
            <span className="nav-burger__line nav-burger__line--bottom" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <MobileMenu
            key="menu"
            id={MENU_ID}
            items={NAV_ITEMS}
            actions={NAV_ACTIONS}
            activeId={activeId}
            onClose={closeMenu}
            onBeforeNavigate={releaseScrollLock}
          />
        )}
      </AnimatePresence>
    </>
  )
}

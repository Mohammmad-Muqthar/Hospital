import { useRef } from 'react'
import { motion, useIsPresent } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import BrandLogo from '../ui/BrandLogo'
import Button from '../ui/Button'
import useSiteLink from '../../hooks/useSiteLink'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import { SECTION_IDS } from '../../config/site'
import { MOTION_EASE } from '../../lib/motion'
import useFocusTrap from './useFocusTrap'

const EASE_IN_OUT = [0.65, 0, 0.35, 1]

/*
 * Hamburger ⇄ X in two phases so it never passes through a chevron: the lines
 * first converge onto one line, then rotate (and the reverse on close).
 */
const LINE_CONVERGE = { duration: 0.2, ease: EASE_IN_OUT }
const line = (offset, angle) => ({
  closed: { y: offset, rotate: 0 },
  open: {
    y: 0,
    rotate: angle,
    transition: { y: LINE_CONVERGE, rotate: { duration: 0.36, ease: MOTION_EASE, delay: 0.14 } },
  },
  exit: {
    y: offset,
    rotate: 0,
    transition: { rotate: { duration: 0.2, ease: EASE_IN_OUT }, y: { duration: 0.24, ease: MOTION_EASE, delay: 0.14 } },
  },
})

/*
 * Variant labels: "closed" (initial) → "open" (animate) → "exit".
 * The dark sheet unrolls downward from the bar (scaleY on a solid layer —
 * compositor-only), then the links rise 14px into place in a short stagger.
 * On exit the content fades first and the sheet rolls back up into the bar.
 */
const FULL = {
  root: {
    closed: {},
    open: {},
    exit: { transition: { when: 'afterChildren' } },
  },
  surface: {
    closed: { scaleY: 0 },
    open: { scaleY: 1, transition: { duration: 0.62, ease: MOTION_EASE } },
    exit: { scaleY: 0, transition: { duration: 0.46, ease: EASE_IN_OUT, delay: 0.1 } },
  },
  list: {
    closed: {},
    open: { transition: { delayChildren: 0.14, staggerChildren: 0.05 } },
    exit: {},
  },
  item: {
    closed: { opacity: 0, y: 14 },
    open: { opacity: 1, y: 0, transition: { duration: 0.56, ease: MOTION_EASE } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease: EASE_IN_OUT } },
  },
  actions: {
    closed: { opacity: 0, y: 14 },
    open: { opacity: 1, y: 0, transition: { duration: 0.56, ease: MOTION_EASE, delay: 0.38 } },
    exit: { opacity: 0, y: 0, transition: { duration: 0.18, ease: EASE_IN_OUT } },
  },
  lineTop: line(-3.25, 45),
  lineBottom: line(3.25, -45),
}

/* Reduced motion: opacity only, quick, no movement, no stagger. */
const fade = (duration) => ({
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration } },
  exit: { opacity: 0, transition: { duration } },
})
const REDUCED = {
  root: FULL.root,
  surface: fade(0.16),
  list: {},
  item: fade(0.16),
  actions: fade(0.16),
  lineTop: { closed: { y: 0, rotate: 45 }, open: { y: 0, rotate: 45 }, exit: { y: 0, rotate: 45 } },
  lineBottom: { closed: { y: 0, rotate: -45 }, open: { y: 0, rotate: -45 }, exit: { y: 0, rotate: -45 } },
}

function MenuLink({ item, active, linkRef, onBeforeNavigate, onNavigate, variants }) {
  const { href, onClick } = useSiteLink(item.target, { onClick: onBeforeNavigate, onNavigate })
  return (
    <motion.li className="nav-menu__item" variants={variants}>
      <a
        ref={linkRef}
        className="nav-menu__link"
        href={href}
        onClick={onClick}
        aria-current={active ? 'true' : undefined}
        data-active={active ? '' : undefined}
      >
        <span className="nav-menu__label">{item.label}</span>
        <span className="nav-menu__dot" aria-hidden="true" />
      </a>
    </motion.li>
  )
}

function MenuHomeLink({ onBeforeNavigate, onNavigate }) {
  const { href, onClick } = useSiteLink('top', { onClick: onBeforeNavigate, onNavigate })
  return (
    <a className="nav__brand" href={href} onClick={onClick} aria-label="Trionix Hospital — home">
      <span className="nav__brand-mark">
        <BrandLogo height={40} />
      </span>
    </a>
  )
}

function MenuSignIn({ action, onBeforeNavigate, onNavigate }) {
  const { href, onClick } = useSiteLink(action.target, { onClick: onBeforeNavigate, onNavigate })
  return (
    <a className="nav-menu__signin" href={href} onClick={onClick}>
      <span>{action.label}</span>
      <span className="nav-menu__signin-arrow" aria-hidden="true">
        <ArrowRight size={18} strokeWidth={2} />
      </span>
    </a>
  )
}

/**
 * Full-screen menu for < 1024px. A modal dialog that contains its own bar
 * (home link + close button) aligned pixel-for-pixel with the navbar's, so
 * the hamburger appears to morph into the close "X" in place.
 *
 * `onBeforeNavigate` releases the body scroll lock synchronously before any
 * link smooth-scrolls; `onClose` closes the menu (focus returns to the
 * hamburger in the parent).
 */
export default function MobileMenu({ id, items, actions, activeId, onClose, onBeforeNavigate }) {
  const dialogRef = useRef(null)
  const firstLinkRef = useRef(null)
  const isPresent = useIsPresent()
  const reduceMotion = usePrefersReducedMotion()
  const v = reduceMotion ? REDUCED : FULL

  useFocusTrap(dialogRef, isPresent, { initialFocusRef: firstLinkRef, onEscape: onClose })

  return (
    <motion.div
      ref={dialogRef}
      id={id}
      className="nav-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      variants={v.root}
      initial="closed"
      animate="open"
      exit="exit"
    >
      <motion.div className="nav-menu__surface" variants={v.surface} aria-hidden="true" />

      <div className="nav-menu__bar">
        <MenuHomeLink onBeforeNavigate={onBeforeNavigate} onNavigate={onClose} />
        <button type="button" className="nav-burger" aria-label="Close menu" onClick={onClose}>
          <motion.span className="nav-burger__line" variants={v.lineTop} />
          <motion.span className="nav-burger__line" variants={v.lineBottom} />
        </button>
      </div>

      <div className="nav-menu__body">
        <nav className="nav-menu__nav" aria-label="Primary">
          <motion.ul className="nav-menu__list" role="list" variants={v.list}>
            {items.map((item, i) => (
              <MenuLink
                key={item.label}
                item={item}
                active={SECTION_IDS[item.target] === activeId}
                linkRef={i === 0 ? firstLinkRef : undefined}
                onBeforeNavigate={onBeforeNavigate}
                onNavigate={onClose}
                variants={v.item}
              />
            ))}
          </motion.ul>
        </nav>

        <motion.div className="nav-menu__actions" variants={v.actions}>
          <MenuSignIn action={actions.signIn} onBeforeNavigate={onBeforeNavigate} onNavigate={onClose} />
          <Button
            to={actions.trial.target}
            size="lg"
            block
            arrow={false}
            className="nav-menu__cta btn--on-dark"
            onClick={onBeforeNavigate}
            onNavigate={onClose}
          >
            {actions.trial.label}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

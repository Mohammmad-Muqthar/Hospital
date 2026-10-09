import { useId, useRef } from 'react'
import { FOOTER } from '../../data/siteContent'
import BrandLogo from '../ui/BrandLogo'
import Icon from '../ui/Icon'
import useSiteLink from '../../hooks/useSiteLink'
import { gsap, ScrollTrigger, useGSAP, MQ, EASE } from '../../lib/gsap'
import './Footer.css'

/** Logo height in px — sized for the official artwork (≈ 2.05 : 1). */
const LOGO_HEIGHT = 48

/**
 * One footer link. In-page targets smooth-scroll (pinned-section aware) and
 * external destinations honour host-app handlers via useSiteLink.
 * The inner span carries the CSS hover shift; GSAP only ever animates the <li>.
 */
function FooterLink({ label, target }) {
  const { href, onClick } = useSiteLink(target)
  return (
    <li className="foot__item" data-foot-reveal>
      <a className="foot__link" href={href} onClick={onClick}>
        <span className="foot__link-text">{label}</span>
      </a>
    </li>
  )
}

function FooterColumn({ heading, links, index }) {
  const headingId = useId()
  return (
    <nav className="foot__col" aria-labelledby={headingId} data-foot-col={index}>
      <h2 id={headingId} className="foot__heading" data-foot-reveal>
        {heading}
      </h2>
      <ul role="list" className="foot__links">
        {links.map((link) => (
          <FooterLink key={link.target} {...link} />
        ))}
      </ul>
    </nav>
  )
}

/**
 * Entrance choreography (motion-OK only; reduced motion keeps the static layout).
 * One short one-shot timeline (< 1.4s) that plays once the footer is ~15% into
 * the viewport and never reverses:
 *  A  the dark surface docks from a slightly inset slab into the full-bleed floor
 *  B  logo + description rise
 *  C  Product and Company columns, restrained stagger
 *  D  healthcare statement (the icon drifts in a few px)
 *  E  copyright row
 * Initial states are set here (never in CSS). The start is clamp()ed so it is
 * always reachable, and a trigger already passed on load fires immediately,
 * so content can never stay hidden.
 */
function useFooterEntrance(rootRef) {
  // Once revealed, a later matchMedia re-run (e.g. resizing across the mobile
  // breakpoint) must not hide the footer and replay the entrance.
  const revealedRef = useRef(false)

  useGSAP(
    () => {
      const root = rootRef.current
      const mm = gsap.matchMedia()

      mm.add({ motion: MQ.motionOK, mobile: MQ.mobile }, (ctx) => {
        if (!ctx.conditions.motion || revealedRef.current) return undefined
        const { mobile } = ctx.conditions
        const q = gsap.utils.selector(root)

        const groups = {
          panel: q('.foot__panel'),
          brand: q('.foot__brand [data-foot-reveal]'),
          product: q('[data-foot-col="0"] [data-foot-reveal]'),
          company: q('[data-foot-col="1"] [data-foot-reveal]'),
          care: q('.foot__care [data-foot-reveal]'),
          careIcon: q('.foot__statement-icon'),
          base: q('.foot__base'),
          copy: q('.foot__copy'),
        }
        const revealed = [...new Set(Object.values(groups).flat())]
        const settle = () => gsap.set(revealed, { clearProps: 'transform,opacity' })

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: EASE.out, duration: 0.8 },
          onComplete: settle,
        })
        // A — the surface arrives as a slightly inset, lower slab and docks
        // into the full-bleed floor (transform only, it never fades).
        tl.from(groups.panel, { scaleX: mobile ? 0.95 : 0.955, y: mobile ? 40 : 56, duration: 1.05, ease: EASE.expo }, 0)
          .from(groups.brand, { y: 24, opacity: 0, duration: 0.85, stagger: 0.08 }, 0.06)
          .from(groups.product, { y: 18, opacity: 0, duration: 0.75, stagger: 0.045 }, 0.12)
          .from(groups.company, { y: 18, opacity: 0, duration: 0.75, stagger: 0.045 }, 0.2)
          .from(groups.care, { y: 18, opacity: 0, duration: 0.75, stagger: 0.07 }, 0.34)
          .from(groups.careIcon, { x: -6, duration: 0.8 }, 0.44)
          .from(groups.base, { opacity: 0, duration: 0.8 }, 0.56)
          .from(groups.copy, { y: 10, duration: 0.8 }, 0.56)

        // One-shot play. `once` never reverses or replays; clamp() keeps the
        // start reachable, and a trigger already passed on load fires at once.
        ScrollTrigger.create({
          trigger: root,
          start: mobile ? 'clamp(top 92%)' : 'clamp(top 85%)',
          once: true,
          onEnter: () => {
            revealedRef.current = true
            tl.play()
          },
        })

        // Keyboard users tabbing in before the trigger fires must never land on
        // an invisible link: finish the reveal as soon as focus enters.
        const onFocusIn = () => {
          revealedRef.current = true
          tl.progress(1)
        }
        root.addEventListener('focusin', onFocusIn, { once: true })
        return () => root.removeEventListener('focusin', onFocusIn)
      })
    },
    { scope: rootRef },
  )
}

export default function Footer() {
  const rootRef = useRef(null)
  const top = useSiteLink('top')
  const { healthcare } = FOOTER

  useFooterEntrance(rootRef)

  return (
    <footer ref={rootRef} className="foot">
      <div className="foot__panel" aria-hidden="true" />

      <div className="container foot__inner">
        <div className="foot__grid">
          <div className="foot__brand">
            <div className="foot__logo" data-foot-reveal>
              <a className="foot__logo-link" href={top.href} onClick={top.onClick}>
                <BrandLogo height={LOGO_HEIGHT} loading="lazy" />
              </a>
            </div>
            <p className="foot__desc" data-foot-reveal>
              {FOOTER.description}
            </p>
          </div>

          {FOOTER.columns.map((column, index) => (
            <FooterColumn key={column.heading} index={index} {...column} />
          ))}

          <div className="foot__care">
            <h2 className="foot__heading" data-foot-reveal>
              {healthcare.heading}
            </h2>
            <p className="foot__statement" data-foot-reveal>
              <span className="foot__statement-icon">
                <Icon name={healthcare.icon} size={18} strokeWidth={1.8} />
              </span>
              <span className="foot__statement-text">{healthcare.message}</span>
            </p>
          </div>
        </div>

        <div className="foot__base">
          <p className="foot__copy">{FOOTER.copyright}</p>
        </div>
      </div>
    </footer>
  )
}

import { useCallback, useRef, useState } from 'react'
import { SECTION_IDS } from '../../../../config/site'
import { CURRENCIES, DEFAULT_CURRENCY, PLANS, PRICING } from '../../../../data/pricingData'
import Button from '../../../../components/ui/Button'
import useMediaQuery from '../../../../hooks/useMediaQuery'
import usePrefersReducedMotion from '../../../../hooks/usePrefersReducedMotion'
import { gsap, useGSAP, MQ, EASE } from '../../../../lib/gsap'
import CurrencySwitcher from './CurrencySwitcher'
import PricingInsight from './PricingInsight'
import PricingPlan from './PricingPlan'
import './Pricing.css'

/**
 * Builds one play-once scroll entrance from `steps` — `[targets, fromVars,
 * position]` — and returns `{ tl, targets, finish }`, or null when there is
 * nothing left to reveal.
 *
 * `seen` holds every element whose entrance has already started. Those are
 * left out, so a gsap.matchMedia() re-run (a resize across the desktop
 * breakpoint rebuilds this section's entrances) never snaps content the
 * visitor has already seen back to invisible, and never replays it.
 *
 * `from` tweens render their start state immediately (inside the motion
 * branch only — CSS never hides content), and clear their transforms on
 * completion so text settles on an identity transform and stays crisp.
 * The trigger is attached to the timeline (never bare), as the shared
 * scroll anchor requires inside matchMedia.
 */
function reveal({ seen, trigger, start, steps }) {
  const pending = steps
    .map(([targets, vars, position]) => [targets.filter((el) => !seen.has(el)), vars, position])
    .filter(([targets]) => targets.length > 0)
  if (!pending.length) return null

  const targets = pending.flatMap(([els]) => els)
  const markSeen = () => targets.forEach((el) => seen.add(el))
  const tl = gsap.timeline({
    defaults: { ease: EASE.out, clearProps: 'transform,opacity' },
    scrollTrigger: { trigger, start, once: true, onEnter: markSeen },
  })
  pending.forEach(([els, vars, position]) => tl.from(els, vars, position))

  // Jump straight to the settled state (keyboard focus arriving early).
  const finish = () => {
    markSeen()
    tl.progress(1)
  }
  return { tl, targets, finish }
}

/**
 * Phase 7 — Pricing. Not pinned: a calm, play-once entrance per group
 * (header → cost insight → plans → footnote) so prices are readable at
 * rest and comparable without any scroll choreography in the way.
 */
export default function Pricing() {
  const rootRef = useRef(null)
  // Elements whose entrance has started; survives matchMedia re-runs.
  const seenRef = useRef(null)
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [announcement, setAnnouncement] = useState('')
  const reduced = usePrefersReducedMotion()
  const finePointer = useMediaQuery(MQ.finePointer)
  const interactive = finePointer && !reduced

  const handleCurrency = useCallback(
    (code) => {
      if (code === currency) return
      setCurrency(code)
      setAnnouncement(`Prices shown in ${CURRENCIES[code].label}`)
    },
    [currency],
  )

  useGSAP(
    () => {
      const root = rootRef.current
      const q = gsap.utils.selector(root)
      const seen = (seenRef.current ??= new WeakSet())
      const mm = gsap.matchMedia()

      // Plans sit in one row from the desktop breakpoint; below it they stack.
      mm.add({ motionOK: MQ.motionOK, row: MQ.desktop }, ({ conditions }) => {
        if (!conditions.motionOK) return undefined

        const { row } = conditions
        const reveals = []
        const add = (config) => {
          const entrance = reveal({ seen, ...config })
          if (entrance) reveals.push(entrance)
        }

        // Thresholds sit near the viewport bottom so nothing that is in view
        // (e.g. after an anchor jump) waits long for its entrance.
        add({
          trigger: q('.price-head')[0],
          start: 'top 92%',
          steps: [
            [q('.price-eyebrow'), { opacity: 0, y: 14, duration: 0.8 }, 0],
            [q('.price-title__line'), { yPercent: 108, duration: 1.15, ease: EASE.expo, stagger: 0.1 }, 0.06],
            [q('.price-lead'), { opacity: 0, y: 18, duration: 0.95 }, 0.32],
            [q('.price-currency'), { opacity: 0, y: 14, duration: 0.85 }, 0.44],
          ],
        })

        if (row) {
          // One table timeline, driven by the band: band settles with a
          // slight perspective, then the three panels in a restrained,
          // coordinated stagger (never left hidden while the band shows).
          const depth = { transformPerspective: 1400, transformOrigin: '50% 100%' }
          add({
            trigger: q('.price-insight')[0],
            start: 'top 94%',
            steps: [
              [q('.price-insight'), { opacity: 0, y: 34, rotationX: 7, ...depth, duration: 1.15 }, 0],
              [q('.price-plan-wrap'), { opacity: 0, y: 44, rotationX: 8, ...depth, duration: 1.2, stagger: 0.11 }, 0.16],
            ],
          })
        } else {
          // Stacked: each block settles as it arrives; flatter, no rotation.
          q('.price-insight, .price-plan-wrap').forEach((block) => {
            add({ trigger: block, start: 'top 96%', steps: [[[block], { opacity: 0, y: 28, duration: 0.95 }, 0]] })
          })
        }

        // The CTA is animated through its wrapper: GSAP never touches the
        // shared .btn, whose CSS transform transition would fight the tween.
        add({
          trigger: q('.price-foot')[0],
          start: 'top 97%',
          steps: [[q('.price-footnote, .price-foot__cta'), { opacity: 0, y: 16, duration: 0.85, stagger: 0.08 }, 0]],
        })

        // Keyboard focus can arrive before (or while) a group rises — e.g.
        // tabbing from Security straight onto the currency switch. Never
        // leave a focused control invisible: settle its group at once.
        const onFocusIn = ({ target }) => {
          reveals.forEach((entrance) => {
            if (entrance.tl.progress() < 1 && entrance.targets.some((el) => el.contains(target))) entrance.finish()
          })
        }
        root.addEventListener('focusin', onFocusIn)
        return () => root.removeEventListener('focusin', onFocusIn)
      })
    },
    { scope: rootRef },
  )

  return (
    <section id={SECTION_IDS.pricing} ref={rootRef} className="price" aria-labelledby="price-title">
      <div className="container price-inner">
        <header className="price-head">
          <p className="t-eyebrow price-eyebrow">{PRICING.eyebrow}</p>
          <h2 id="price-title" className="t-h2 price-title">
            {PRICING.titleLines.map((line, index) => (
              <span key={line} className="price-title__mask">
                {index > 0 && ' '}
                <span className={`price-title__line${index > 0 ? ' price-title__line--accent' : ''}`}>{line}</span>
              </span>
            ))}
          </h2>
          <p className="price-lead">{PRICING.paragraph}</p>
          <div className="price-currency">
            <CurrencySwitcher value={currency} onChange={handleCurrency} reduced={reduced} />
          </div>
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </header>

        <div className="price-table">
          <div className="price-insight">
            <PricingInsight currency={currency} reduced={reduced} />
          </div>
          <div className="price-plans">
            {PLANS.map((plan) => (
              <PricingPlan
                key={plan.id}
                plan={plan}
                currency={currency}
                interactive={interactive}
                reduced={reduced}
              />
            ))}
          </div>
        </div>

        <div className="price-foot">
          <p className="price-footnote">{PRICING.footnote}</p>
          <div className="price-foot__cta">
            <Button to="fullPricing" variant="secondary">
              {PRICING.fullPricingCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

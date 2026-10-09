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
 * Builds a play-once scroll entrance. `from` tweens render their start
 * state immediately (inside the motion branch only — CSS never hides
 * content), and clear their transforms on completion so text settles on
 * an identity transform and stays crisp.
 */
function reveal(trigger, start, build) {
  const tl = gsap.timeline({
    defaults: { ease: EASE.out, clearProps: 'transform,opacity' },
    scrollTrigger: { trigger, start, once: true },
  })
  build(tl)
  return tl
}

/**
 * Phase 7 — Pricing. Not pinned: a calm, play-once entrance per group
 * (header → cost insight → plans → footnote) so prices are readable at
 * rest and comparable without any scroll choreography in the way.
 */
export default function Pricing() {
  const rootRef = useRef(null)
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
      const q = gsap.utils.selector(rootRef)
      const mm = gsap.matchMedia()

      // Plans sit in one row from the desktop breakpoint; below it they stack.
      mm.add({ motionOK: MQ.motionOK, row: MQ.desktop }, ({ conditions }) => {
        if (!conditions.motionOK) return

        const { row } = conditions

        // Thresholds sit near the viewport bottom so nothing that is in view
        // (e.g. after an anchor jump) waits long for its entrance.
        reveal(q('.price-head')[0], 'top 92%', (tl) => {
          tl.from(q('.price-eyebrow'), { opacity: 0, y: 14, duration: 0.8 }, 0)
            .from(q('.price-title__line'), { yPercent: 108, duration: 1.15, ease: EASE.expo, stagger: 0.1 }, 0.06)
            .from(q('.price-lead'), { opacity: 0, y: 18, duration: 0.95 }, 0.32)
            .from(q('.price-currency'), { opacity: 0, y: 14, duration: 0.85 }, 0.44)
        })

        if (row) {
          // One table timeline, driven by the band: band settles with a
          // slight perspective, then the three panels in a restrained,
          // coordinated stagger (never left hidden while the band shows).
          reveal(q('.price-insight')[0], 'top 94%', (tl) => {
            tl.from(q('.price-insight'), {
              opacity: 0,
              y: 34,
              rotationX: 7,
              transformPerspective: 1400,
              transformOrigin: '50% 100%',
              duration: 1.15,
            }).from(
              q('.price-plan-wrap'),
              {
                opacity: 0,
                y: 44,
                rotationX: 8,
                transformPerspective: 1400,
                transformOrigin: '50% 100%',
                duration: 1.2,
                stagger: 0.11,
              },
              0.16,
            )
          })
        } else {
          // Stacked: each block settles as it arrives; flatter, no rotation.
          q('.price-insight, .price-plan-wrap').forEach((block) => {
            reveal(block, 'top 96%', (tl) => {
              tl.from(block, { opacity: 0, y: 28, duration: 0.95 })
            })
          })
        }

        reveal(q('.price-foot')[0], 'top 97%', (tl) => {
          tl.from(q('.price-foot > *'), { opacity: 0, y: 16, duration: 0.85, stagger: 0.08 })
        })
      })
    },
    { scope: rootRef },
  )

  return (
    <section id={SECTION_IDS.pricing} ref={rootRef} className="price" aria-labelledby="price-title">
      <div className="container price-inner">
        <header className="price-head">
          <p className="t-eyebrow price-eyebrow">{PRICING.eyebrow}</p>
          <h2 id="price-title" className="price-title">
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
          <Button to="fullPricing" variant="secondary">
            {PRICING.fullPricingCta}
          </Button>
        </div>
      </div>
    </section>
  )
}

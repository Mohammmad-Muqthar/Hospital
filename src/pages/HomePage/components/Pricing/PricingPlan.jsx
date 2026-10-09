import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { Smartphone, Users } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import Icon from '../../../../components/ui/Icon'
import {
  PRICING,
  formatMoney,
  getMonthlyPrice,
  getPerDayLabel,
  getPriceParts,
} from '../../../../data/pricingData'
import { SPRING } from '../../../../lib/motion'
import CurrencySwap from './CurrencySwap'

/** Maximum hover tilt in degrees (kept deliberately tiny). */
const TILT = { x: 1, y: 1.4 }
/** Critically damped: follows the pointer softly, never wobbles. */
const TILT_SPRING = { stiffness: 170, damping: 26, mass: 0.6 }

/* Hover is identical for every plan — no plan is ever emphasised. */
const PANEL = { rest: { y: 0 }, hover: { y: -6 } }
const FORWARD = { rest: { y: 0 }, hover: { y: -3 } }
const FORWARD_SOFT = { rest: { y: 0 }, hover: { y: -2 } }

function PriceAmount({ plan, code }) {
  const { symbol, value } = getPriceParts(getMonthlyPrice(plan, code), code)
  return (
    <span className="price-amount" data-currency={code}>
      <span className="price-amount__sym">{symbol}</span>
      <span className="price-amount__val">{value}</span>
      <span className="price-amount__per">{PRICING.billingPeriod}</span>
    </span>
  )
}

/**
 * One plan panel. GSAP owns the outer `.price-plan-wrap` (scroll entrance);
 * Motion owns the `<article>` and its children (hover lift, tilt, forward
 * shift of icon and price). They never animate the same node.
 *
 * The tilt is applied only to `.price-plan__surface` — the panel's border,
 * fill and shadow — while the content lifts with a plain 2D translate, so
 * text is never resampled under a 3D transform and stays sharp on hover.
 */
export default function PricingPlan({ plan, currency, interactive, reduced }) {
  const titleId = `price-plan-${plan.id}`
  const boundsRef = useRef(null)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const rotateX = useSpring(tiltX, TILT_SPRING)
  const rotateY = useSpring(tiltY, TILT_SPRING)

  const handlePointerMove = (event) => {
    if (event.pointerType !== 'mouse') return
    // Bounds are read once per hover from the wrapper (GSAP's node, at rest
    // by then), so the lift and tilt never feed back into the measurement.
    if (!boundsRef.current) boundsRef.current = event.currentTarget.parentElement.getBoundingClientRect()
    const r = boundsRef.current
    const px = Math.min(Math.max((event.clientX - r.left) / r.width, 0), 1) - 0.5
    const py = Math.min(Math.max((event.clientY - r.top) / r.height, 0), 1) - 0.5
    tiltY.set(px * 2 * TILT.y)
    tiltX.set(-py * 2 * TILT.x)
  }

  const handleHoverEnd = () => {
    boundsRef.current = null
    tiltX.set(0)
    tiltY.set(0)
  }

  const monthly = formatMoney(getMonthlyPrice(plan, currency), currency)

  return (
    <div className="price-plan-wrap">
      <motion.article
        className="price-plan"
        aria-labelledby={titleId}
        initial="rest"
        animate="rest"
        whileHover={interactive ? 'hover' : undefined}
        variants={PANEL}
        transition={SPRING.lift}
        onPointerMove={interactive ? handlePointerMove : undefined}
        onHoverEnd={interactive ? handleHoverEnd : undefined}
      >
        <motion.span
          className="price-plan__surface"
          aria-hidden="true"
          style={interactive ? { rotateX, rotateY } : undefined}
        />
        <div className="price-plan__head">
          <motion.span className="price-plan__icon" variants={FORWARD_SOFT} transition={SPRING.lift}>
            <Icon name={plan.icon} size={18} strokeWidth={1.8} />
          </motion.span>
          <h3 id={titleId} className="price-plan__name">
            {plan.name}
          </h3>
        </div>

        <motion.div className="price-plan__price" variants={FORWARD} transition={SPRING.lift}>
          <span className="price-plan__price-visual" aria-hidden="true">
            <CurrencySwap
              currency={currency}
              reduced={reduced}
              shift={18}
              className="price-plan__swap"
              render={(code) => <PriceAmount plan={plan} code={code} />}
            />
          </span>
          <span className="sr-only">{`${monthly} per month`}</span>
        </motion.div>

        <p className="price-plan__perday">
          <CurrencySwap
            block
            currency={currency}
            reduced={reduced}
            shift={8}
            render={(code) => getPerDayLabel(plan, code)}
          />
        </p>

        <ul className="price-plan__specs" role="list">
          <li className="price-plan__spec">
            <Users size={17} strokeWidth={1.8} aria-hidden="true" focusable="false" />
            <span>{plan.seatsLabel}</span>
          </li>
          <li className="price-plan__spec">
            <Smartphone size={17} strokeWidth={1.8} aria-hidden="true" focusable="false" />
            <span>{plan.platforms}</span>
          </li>
        </ul>

        <div className="price-plan__cta">
          <Button to="trial" variant="dark" block aria-describedby={titleId}>
            {PRICING.trialCta}
          </Button>
        </div>
      </motion.article>
    </div>
  )
}

import { motion } from 'motion/react'
import { CURRENCY_ORDER } from '../../../../data/pricingData'
import { MOTION_EASE } from '../../../../lib/motion'

const ENTER = { duration: 0.46, ease: MOTION_EASE }
const EXIT = { duration: 0.3, ease: MOTION_EASE }
const INSTANT = { duration: 0 }

/**
 * Renders one layer per currency, stacked in a single grid cell, so the cell
 * always reserves the size of the largest variant: switching currency never
 * moves anything around it (no layout jump, no re-wrap below).
 *
 * The active layer is visible; the others rest just above (earlier currency)
 * or just below (later currency), so a switch reads as a short, directional
 * vertical roll — USD → QAR rolls up, QAR → USD rolls down.
 *
 * Inactive layers are aria-hidden and become `visibility: hidden` once
 * faded (a CSS discrete transition keyed off aria-hidden, so rapid toggling
 * always settles correctly), so assistive tech and find-in-page only ever
 * see the active value. Motion animates opacity and y only.
 */
export default function CurrencySwap({ currency, render, shift = 12, block = false, reduced = false, className = '' }) {
  const activeIndex = CURRENCY_ORDER.indexOf(currency)

  return (
    <span className={['price-swap', block && 'price-swap--block', className].filter(Boolean).join(' ')}>
      {CURRENCY_ORDER.map((code, index) => {
        const active = index === activeIndex
        const restY = reduced ? 0 : (index < activeIndex ? -1 : 1) * shift
        return (
          <motion.span
            key={code}
            className="price-swap__layer"
            aria-hidden={active ? undefined : true}
            initial={false}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: restY }}
            transition={
              reduced
                ? INSTANT
                : active
                  ? { ...ENTER, opacity: { duration: 0.32, delay: 0.08, ease: MOTION_EASE } }
                  : { ...EXIT, opacity: { duration: 0.18, ease: MOTION_EASE } }
            }
          >
            {render(code)}
          </motion.span>
        )
      })}
    </span>
  )
}

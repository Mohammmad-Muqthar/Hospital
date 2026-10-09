import { useRef } from 'react'
import { motion } from 'motion/react'
import { CURRENCIES, CURRENCY_ORDER } from '../../../../data/pricingData'
import { SPRING } from '../../../../lib/motion'

const NEXT_KEYS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/**
 * Segmented currency control (WAI-ARIA radio group):
 * roving tabindex, arrow keys / Home / End move the selection and focus,
 * and the white indicator slides between options with a shared layoutId.
 */
export default function CurrencySwitcher({ value, onChange, reduced = false }) {
  const optionRefs = useRef([])

  const select = (index) => {
    const count = CURRENCY_ORDER.length
    const next = (index + count) % count
    onChange(CURRENCY_ORDER[next])
    optionRefs.current[next]?.focus()
  }

  const handleKeyDown = (event) => {
    const current = CURRENCY_ORDER.indexOf(value)
    if (event.key in NEXT_KEYS) select(current + NEXT_KEYS[event.key])
    else if (event.key === 'Home') select(0)
    else if (event.key === 'End') select(CURRENCY_ORDER.length - 1)
    else return
    event.preventDefault()
  }

  return (
    <div className="price-switch" role="radiogroup" aria-label="Currency" onKeyDown={handleKeyDown}>
      {CURRENCY_ORDER.map((code, index) => {
        const checked = code === value
        return (
          <button
            key={code}
            ref={(el) => {
              optionRefs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className="price-switch__option"
            onClick={() => onChange(code)}
          >
            {checked && (
              <motion.span
                layoutId="price-currency-indicator"
                className="price-switch__indicator"
                aria-hidden="true"
                transition={reduced ? { duration: 0 } : SPRING.indicator}
              />
            )}
            <span className="price-switch__label">{CURRENCIES[code].label}</span>
          </button>
        )
      })}
    </div>
  )
}

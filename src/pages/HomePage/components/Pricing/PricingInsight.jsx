import { PRICING, getInsight } from '../../../../data/pricingData'
import CurrencySwap from './CurrencySwap'

/** Single-weight line tea cup (1.5px stroke), drawn for this band only. */
function TeaCup({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      width="48"
      height="48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18.5 15c-1.9-1.6-1.9-3.4 0-5s1.9-3.4 0-5" />
      <path d="M25.5 14c-1.9-1.6-1.9-3.4 0-5s1.9-3.4 0-5" />
      <path d="M9 19h26v7a11 11 0 0 1-11 11h-4A11 11 0 0 1 9 26z" />
      <path d="M35 21.5h2.5a4 4 0 0 1 0 8h-3.1" />
      <path d="M5 41.5c4 1.7 10.4 2.6 19 2.6s15-.9 19-2.6" />
    </svg>
  )
}

/**
 * "What it really costs" — an editorial band set above the plans. On
 * desktop its two halves sit on the plan columns: the per-day figure over
 * the Starter column (the plan it is computed from), the analogy and note
 * across the other two.
 */
export default function PricingInsight({ currency, reduced }) {
  const { insight } = PRICING
  const active = getInsight(currency)

  return (
    <div className="price-insight__panel">
      <div className="price-insight__cost">
        <p className="t-eyebrow price-insight__eyebrow">{insight.eyebrow}</p>
        <p className="price-insight__figure">
          <CurrencySwap
            currency={currency}
            reduced={reduced}
            shift={14}
            className="price-insight__figure-swap"
            render={(code) => {
              const { figure } = getInsight(code)
              return (
                <span className="price-insight__lockup" aria-hidden="true">
                  <span className="price-insight__amount t-tabular">
                    <span className="price-insight__sym">{figure.symbol}</span>
                    {figure.value}
                  </span>
                  <span className="price-insight__suffix">{insight.figureSuffix}</span>
                </span>
              )
            }}
          />
          <span className="sr-only">{`${active.figureText} ${insight.figureSuffix}`}</span>
        </p>
      </div>

      <div className="price-insight__story">
        <TeaCup className="price-insight__cup" />
        <div className="price-insight__copy">
          <p className="price-insight__analogy">{insight.analogy}</p>
          <p className="price-insight__note">
            <CurrencySwap
              block
              currency={currency}
              reduced={reduced}
              shift={8}
              render={(code) => getInsight(code).note}
            />
          </p>
        </div>
      </div>
    </div>
  )
}

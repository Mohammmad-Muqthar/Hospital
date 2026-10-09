/**
 * Pricing — plans, currencies and the per-day cost logic.
 *
 * USD prices, seat limits, platforms and wording are the approved business
 * values. Do not edit them to "look nicer".
 *
 * QAR: the original project's QAR source was not available when this site
 * was assembled. QAR amounts are therefore derived from USD using the
 * official fixed USD→QAR peg below, and every plan has a `prices.QAR` slot.
 * If you have exact QAR list prices, put them in `prices.QAR` and they will
 * be used verbatim instead of the conversion.
 */

/** Days per month assumed by the per-user figures (see PRICING.footnote). */
export const DAYS_PER_MONTH = 30

export const CURRENCIES = {
  USD: { code: 'USD', label: 'USD', perUsd: 1 },
  /** Qatari riyal, fixed peg: 1 USD = 3.64 QAR (Qatar Central Bank). */
  QAR: { code: 'QAR', label: 'QAR', perUsd: 3.64 },
}

export const CURRENCY_ORDER = ['USD', 'QAR']
export const DEFAULT_CURRENCY = 'USD'

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    prices: { USD: 79, QAR: null },
    seats: 5,
    seatsLabel: 'Up to 5 seats',
    platforms: 'Android',
    perDayBasis: 'user',
    icon: 'sprout',
  },
  {
    id: 'growth',
    name: 'Growth',
    prices: { USD: 189, QAR: null },
    seats: 15,
    seatsLabel: 'Up to 15 seats',
    platforms: 'Android & iOS',
    perDayBasis: 'user',
    icon: 'trendingUp',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    prices: { USD: 349, QAR: null },
    seats: null,
    seatsLabel: 'Unlimited seats',
    platforms: 'Android & iOS',
    /** Unlimited seats → the figure is per team, never per user. */
    perDayBasis: 'team',
    icon: 'infinity',
  },
]

export const PRICING = {
  eyebrow: 'SIMPLE PRICING',
  titleLines: ['Every feature.', 'Only seats differ.'],
  paragraph:
    'All plans include the full CRM. Pick the seat count and mobile platforms you need.',
  billingPeriod: '/month',
  trialCta: 'Start free trial',
  insight: {
    eyebrow: 'WHAT IT REALLY COSTS',
    basisPlanId: 'starter',
    figureSuffix: 'per user, per day',
    analogy: '≈ one cup of tea',
    /** "Starter plan: $79 a month shared by up to 5 users. One missed patient costs far more." */
    note: (monthly) =>
      `Starter plan: ${monthly} a month shared by up to 5 users. One missed patient costs far more.`,
  },
  footnote: 'Per-user figures assume every seat is used, over a 30-day month.',
  fullPricingCta: 'See full pricing',
}

/* ------------------------------------------------------------------ */
/* Logic                                                               */
/* ------------------------------------------------------------------ */

const round2 = (n) => Math.round(n * 100) / 100

/** Monthly plan price in the requested currency. */
export function getMonthlyPrice(plan, currency = DEFAULT_CURRENCY) {
  const explicit = plan.prices[currency]
  if (typeof explicit === 'number') return explicit
  return round2(plan.prices.USD * CURRENCIES[currency].perUsd)
}

/** Daily cost: per user (all seats used) or for the whole team (unlimited). */
export function getPerDayCost(plan, currency = DEFAULT_CURRENCY) {
  const monthly = getMonthlyPrice(plan, currency)
  const divisor = plan.perDayBasis === 'user' && plan.seats ? plan.seats * DAYS_PER_MONTH : DAYS_PER_MONTH
  return monthly / divisor
}

/**
 * Format money for display. USD → "$79", "$0.53". QAR → "QAR 287.56".
 * `fixed` forces two decimals (used for per-day figures).
 */
export function formatMoney(amount, currency = DEFAULT_CURRENCY, { fixed = false } = {}) {
  const hasCents = Math.abs(amount - Math.round(amount)) > 0.0001
  const number = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fixed || hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
  return currency === 'USD' ? `$${number}` : `${CURRENCIES[currency].label} ${number}`
}

/**
 * Split a formatted price into parts for typographic layout.
 * `options` is passed through to formatMoney (e.g. `{ fixed: true }`).
 */
export function getPriceParts(amount, currency = DEFAULT_CURRENCY, options) {
  const formatted = formatMoney(amount, currency, options)
  if (currency === 'USD') return { symbol: '$', value: formatted.slice(1) }
  return { symbol: CURRENCIES[currency].label, value: formatted.slice(CURRENCIES[currency].label.length + 1) }
}

/** Plan by id (e.g. the insight's basis plan). */
export function getPlan(id) {
  return PLANS.find((plan) => plan.id === id)
}

/**
 * Everything the cost-insight band shows, in one currency:
 * the basis plan's per-user per-day figure (split for typography),
 * its plain-text form, and the note built from the monthly price.
 */
export function getInsight(currency = DEFAULT_CURRENCY) {
  const plan = getPlan(PRICING.insight.basisPlanId)
  const perDay = getPerDayCost(plan, currency)
  return {
    figure: getPriceParts(perDay, currency, { fixed: true }),
    figureText: formatMoney(perDay, currency, { fixed: true }),
    note: PRICING.insight.note(formatMoney(getMonthlyPrice(plan, currency), currency)),
  }
}

/** "$0.53 per user, per day" / "$11.63 a day for your whole team". */
export function getPerDayLabel(plan, currency = DEFAULT_CURRENCY) {
  const money = formatMoney(getPerDayCost(plan, currency), currency, { fixed: true })
  return plan.perDayBasis === 'user'
    ? `${money} per user, per day`
    : `${money} a day for your whole team`
}
